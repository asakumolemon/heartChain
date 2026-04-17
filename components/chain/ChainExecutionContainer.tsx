'use client';

import { useState, useCallback } from 'react';
import { Chain, Execution, StepUpdate } from '@/types';
import { ChainExecutor, createExecutor } from '@/lib/executor';
import { ChainStepCard } from './ChainStepCard';
import { Loader2, Play, Square, RotateCcw, Settings, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ChainExecutionContainerProps {
  chain: Chain;
  onExecutionComplete?: (execution: Execution) => void;
}

export function ChainExecutionContainer({ chain, onExecutionComplete }: ChainExecutionContainerProps) {
  const [input, setInput] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [execution, setExecution] = useState<Execution | null>(null);
  const [stepUpdates, setStepUpdates] = useState<Record<number, StepUpdate>>({});
  const [executor, setExecutor] = useState<ChainExecutor | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const handleStepUpdate = useCallback((stepIndex: number, update: StepUpdate) => {
    setStepUpdates((prev) => ({
      ...prev,
      [stepIndex]: { ...prev[stepIndex], ...update },
    }));
    if (update.status === 'running' || update.status === 'streaming') {
      setActiveStepIndex(stepIndex);
    }
  }, []);

  const startExecution = async () => {
    if (!input.trim()) return;

    setIsExecuting(true);
    setStepUpdates({});
    setExecution(null);

    const newExecutor = createExecutor(chain, input);
    setExecutor(newExecutor);

    try {
      const result = await newExecutor.execute(handleStepUpdate);
      setExecution(result);
      onExecutionComplete?.(result);
    } catch (error) {
      console.error('Execution failed:', error);
    } finally {
      setIsExecuting(false);
      setExecutor(null);
    }
  };

  const cancelExecution = () => {
    executor?.cancel();
  };

  const resetExecution = () => {
    setInput('');
    setExecution(null);
    setStepUpdates({});
    setActiveStepIndex(null);
    setExecutor(null);
  };

  const getStepResult = (stepIndex: number) => {
    if (!execution) {
      return stepUpdates[stepIndex] as any;
    }
    return execution.stepResults[stepIndex];
  };

  const sortedSteps = [...chain.steps].sort((a, b) => a.order - b.order);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* 输入区域 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          输入内容
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="请输入要处理的内容..."
          disabled={isExecuting}
          className={cn(
            'w-full h-32 p-3 border border-gray-300 rounded-lg resize-none',
            'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'disabled:bg-gray-100 disabled:cursor-not-allowed'
          )}
        />
        <div className="flex justify-between items-center mt-3">
          <div className="text-sm text-gray-500">
            {input.length} 字符
          </div>
          <div className="flex gap-2">
            {execution && !isExecuting && (
              <button
                onClick={resetExecution}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                重新开始
              </button>
            )}
            {isExecuting ? (
              <button
                onClick={cancelExecution}
                className="flex items-center gap-2 px-4 py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
              >
                <Square className="w-4 h-4" />
                停止执行
              </button>
            ) : (
              <button
                onClick={startExecution}
                disabled={!input.trim()}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors',
                  input.trim()
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-gray-300 cursor-not-allowed'
                )}
              >
                <Play className="w-4 h-4" />
                开始执行
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 执行进度 */}
      {isExecuting && (
        <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-3 rounded-lg">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>正在执行提示链: {chain.name}</span>
          <span className="ml-auto text-sm">
            {Object.values(stepUpdates).filter((u) => u.status === 'completed' || u.status === 'failed').length} / {sortedSteps.length}
          </span>
        </div>
      )}

      {/* 步骤列表 */}
      <div className="space-y-3">
        {sortedSteps.map((step, index) => (
          <ChainStepCard
            key={step.id}
            stepNumber={index + 1}
            stepName={step.name}
            result={getStepResult(index)}
            isActive={activeStepIndex === index}
            onClick={() => setActiveStepIndex(index)}
          />
        ))}
      </div>

      {/* 最终结果 */}
      {execution?.output && execution.status === 'completed' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-green-900">执行完成</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(execution.output || '')}
              className="h-8 gap-1.5 bg-white hover:bg-green-100 border-green-300 text-green-800"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  已复制
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  复制结果
                </>
              )}
            </Button>
          </div>
          <div className="bg-white rounded p-3 text-gray-700 whitespace-pre-wrap border border-green-100">
            {execution.output}
          </div>
          {execution.durationMs && (
            <div className="text-sm text-green-600 mt-2">
              耗时: {(execution.durationMs / 1000).toFixed(1)}s
            </div>
          )}
        </div>
      )}

      {execution?.status === 'failed' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-medium text-red-900 mb-2">执行失败</h3>
          <div className="text-red-700">
            {execution.stepResults.find((s) => s.error)?.error || '未知错误'}
          </div>
        </div>
      )}
    </div>
  );
}
