import { Chain, Execution, Step, StepResult, StepUpdate, Condition, DebugLog } from '@/types';
import { db, generateId } from './db';
import { aiService } from './ai-service';

export class ChainExecutor {
  private executionId: string;
  private chain: Chain;
  private state: Execution;
  private abortController: AbortController;
  private onStepUpdateCallback?: (stepIndex: number, update: StepUpdate) => void;

  constructor(chain: Chain, input: string) {
    this.executionId = generateId();
    this.chain = chain;
    const now = new Date().toISOString();
    this.state = {
      id: this.executionId,
      chainId: chain.id,
      status: 'running',
      input,
      startedAt: now,
      stepResults: chain.steps
        .sort((a, b) => a.order - b.order)
        .map((step, index) => ({
          stepId: step.id,
          stepNumber: index + 1,
          status: 'pending',
          input: '',
          promptRendered: '',
          startedAt: now,
        })),
    };
    this.abortController = new AbortController();
  }

  async execute(onStepUpdate: (stepIndex: number, update: StepUpdate) => void): Promise<Execution> {
    this.onStepUpdateCallback = onStepUpdate;

    // 保存初始状态
    await db.saveExecution(this.state);

    try {
      let currentInput = this.state.input;
      const results: string[] = [];

      for (let i = 0; i < this.chain.steps.length; i++) {
        // 检查是否被取消
        if (this.abortController.signal.aborted) {
          this.state.status = 'cancelled';
          break;
        }

        const step = this.chain.steps[i];
        const stepResult = this.state.stepResults[i];

        // 更新状态为 running
        stepResult.status = 'running';
        stepResult.startedAt = new Date().toISOString();
        onStepUpdate(i, { status: 'running' });
        await this.persist();

        // 构建输入
        const stepInput = this.buildStepInput(step, currentInput, results);
        stepResult.input = stepInput;

        // 渲染 Prompt
        const prompt = this.renderPrompt(step.systemPrompt, {
          input: stepInput,
          original_input: this.state.input,
          step: i + 1,
          total_steps: this.chain.steps.length,
          prev_result: results[i - 1] || '',
          history: results.join('\n\n'),
          is_first: i === 0,
          is_last: i === this.chain.steps.length - 1,
        });
        stepResult.promptRendered = prompt;

        // 发送包含 input 和 promptRendered 的更新，让前端可以查看发送的消息
        onStepUpdate(i, {
          status: 'running',
          input: stepInput,
          promptRendered: prompt,
        });
        await this.persist();

        // 执行步骤
        try {
          let output = '';
          stepResult.status = 'streaming';
          onStepUpdate(i, { status: 'streaming' });

          // 获取默认设置
          const defaultSettings = aiService.getDefaultSettings();
          
          // 使用步骤配置的模型或默认模型
          const model = step.model || defaultSettings.defaultModel;
          const provider = step.model ? this.getProviderForModel(step.model) : defaultSettings.defaultProvider;
          const temperature = step.temperature ?? defaultSettings.defaultTemperature;

          await aiService.chat(
            provider,
            {
              model,
              messages: [{ role: 'system', content: prompt }],
              temperature,
              maxTokens: defaultSettings.maxTokens,
              stream: true,
            },
            (token) => {
              output += token;
              onStepUpdate(i, { token, partialOutput: output });
            },
            this.abortController.signal
          );

          stepResult.output = output;
          stepResult.status = 'completed';
          stepResult.completedAt = new Date().toISOString();
          stepResult.durationMs =
            new Date(stepResult.completedAt).getTime() - new Date(stepResult.startedAt).getTime();

          results.push(output);
          currentInput = output;

          onStepUpdate(i, { status: 'completed', output });

          // 检查条件分支
          if (step.condition) {
            const shouldBranch = this.evaluateCondition(step.condition, output);
            if (shouldBranch) {
              const targetIndex = this.chain.steps.findIndex((s) => s.id === step.condition!.targetStepId);
              if (targetIndex !== -1) {
                i = targetIndex - 1; // -1 因为循环会 i++
                continue;
              }
            }
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          stepResult.status = 'failed';
          stepResult.error = errorMessage;
          onStepUpdate(i, { status: 'failed', error: errorMessage });

          // 添加调试日志
          this.addDebugLog('error', `Step ${i + 1} failed: ${errorMessage}`, step.id);

          if (this.chain.config.errorHandling === 'stop') {
            this.state.status = 'failed';
            break;
          }
          // continue: 使用原始输入继续
          results.push(stepInput);
          currentInput = stepInput;
        }

        await this.persist();
      }

      // 完成执行
      if (this.state.status !== 'cancelled' && this.state.status !== 'failed') {
        this.state.status = 'completed';
        this.state.output = results[results.length - 1];
      }
      this.state.completedAt = new Date().toISOString();
      this.state.durationMs =
        new Date(this.state.completedAt).getTime() - new Date(this.state.startedAt).getTime();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.state.status = 'failed';
      this.addDebugLog('error', `Execution failed: ${errorMessage}`);
    }

    await this.persist();
    return this.state;
  }

  cancel(): void {
    this.abortController.abort();
  }

  getExecutionId(): string {
    return this.executionId;
  }

  private async persist(): Promise<void> {
    await db.saveExecution(this.state);
  }

  private buildStepInput(step: Step, currentInput: string, results: string[]): string {
    switch (step.inputStrategy) {
      case 'original':
        return this.state.input;
      case 'original_with_context':
        return `原始输入：${this.state.input}\n\n上一步结果：${currentInput}`;
      case 'cumulative':
        return results.join('\n\n') || this.state.input;
      case 'last_result':
      default:
        return currentInput;
    }
  }

  private renderPrompt(template: string, variables: Record<string, any>): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return variables[key] !== undefined ? String(variables[key]) : match;
    });
  }

  private evaluateCondition(condition: Condition, output: string): boolean {
    switch (condition.type) {
      case 'contains':
        return output.includes(condition.value);
      case 'matches':
        try {
          return new RegExp(condition.value).test(output);
        } catch {
          return false;
        }
      case 'length_gt':
        return output.length > parseInt(condition.value, 10);
      case 'equals':
        return output === condition.value;
      default:
        return false;
    }
  }

  private getProviderForModel(model: string): string {
    // 简单的模型到提供商的映射
    if (model.startsWith('gpt') || model.startsWith('text-davinci')) {
      return 'openai';
    }
    if (model.startsWith('claude')) {
      return 'anthropic';
    }
    return aiService.getDefaultProvider();
  }

  private addDebugLog(level: DebugLog['level'], message: string, stepId?: string): void {
    if (!this.state.debugLogs) {
      this.state.debugLogs = [];
    }
    this.state.debugLogs.push({
      timestamp: new Date().toISOString(),
      level,
      message,
      stepId,
    });
  }
}

export function createExecutor(chain: Chain, input: string): ChainExecutor {
  return new ChainExecutor(chain, input);
}
