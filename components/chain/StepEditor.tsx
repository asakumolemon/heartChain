'use client';

import { Step } from '@/types';
import { getInputStrategyText } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { GripVertical, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getSettings } from '@/lib/db';

interface StepEditorProps {
  step: Step;
  index: number;
  onChange: (step: Step) => void;
  onDelete: () => void;
  dragHandleProps?: any;
}

export function StepEditor({ step, index, onChange, onDelete, dragHandleProps }: StepEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [customProviders, setCustomProviders] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    const settings = getSettings();
    if (settings.providers.custom) {
      setCustomProviders(
        settings.providers.custom
          .filter((c) => c.enabled)
          .map((c, i) => ({ id: `custom-${i}`, name: c.name }))
      );
    }
  }, []);

  const updateField = <K extends keyof Step>(field: K, value: Step[K]) => {
    onChange({ ...step, [field]: value });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* 头部 */}
      <div className="flex items-center gap-3 p-3 bg-gray-50 border-b border-gray-200">
        <div {...dragHandleProps} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="w-5 h-5 text-gray-400" />
        </div>
        <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium">
          {index + 1}
        </div>
        <input
          type="text"
          value={step.name}
          onChange={(e) => updateField('name', e.target.value)}
          placeholder="步骤名称"
          className="flex-1 bg-transparent border-none focus:ring-0 font-medium"
        />
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-gray-200 rounded"
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        <button
          onClick={onDelete}
          className="p-1 hover:bg-red-100 text-red-500 rounded"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* 展开内容 */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* 系统提示词 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              系统提示词
            </label>
            <textarea
              value={step.systemPrompt}
              onChange={(e) => updateField('systemPrompt', e.target.value)}
              placeholder="输入系统提示词，可使用 {input} {original_input} 等变量..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              可用变量: {'{input}'}, {'{original_input}'}, {'{step}'}, {'{total_steps}'}, {'{prev_result}'}, {'{history}'}
            </p>
          </div>

          {/* 输入策略 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              输入策略
            </label>
            <select
              value={step.inputStrategy}
              onChange={(e) => updateField('inputStrategy', e.target.value as Step['inputStrategy'])}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="last_result">上一步结果</option>
              <option value="original">原始输入</option>
              <option value="original_with_context">原始输入+上下文</option>
              <option value="cumulative">累积结果</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              {step.inputStrategy === 'last_result' && '使用上一步的输出作为输入'}
              {step.inputStrategy === 'original' && '使用用户原始输入'}
              {step.inputStrategy === 'original_with_context' && '原始输入加上上一步结果作为上下文'}
              {step.inputStrategy === 'cumulative' && '累积所有历史步骤的结果'}
            </p>
          </div>

          {/* 模型设置 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                提供商 (可选)
              </label>
              <select
                value={step.model ? (step.model.includes('/') ? 'openrouter' : 'custom') : ''}
                onChange={(e) => {
                  const provider = e.target.value;
                  if (!provider) {
                    updateField('model', undefined);
                  } else if (provider === 'openrouter') {
                    updateField('model', 'anthropic/claude-3.5-sonnet');
                  } else if (provider.startsWith('custom-')) {
                    const customProvider = customProviders.find((p) => p.id === provider);
                    if (customProvider) {
                      const settings = getSettings();
                      const customConfig = settings.providers.custom?.find((c) => c.name === customProvider.name);
                      updateField('model', customConfig?.defaultModel || '');
                    }
                  } else {
                    const modelMap: Record<string, string> = {
                      openai: 'gpt-4',
                      anthropic: 'claude-3-sonnet-20240229',
                      deepseek: 'deepseek-chat',
                      gemini: 'gemini-1.5-flash',
                    };
                    updateField('model', modelMap[provider] || '');
                  }
                }}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">使用默认</option>
                <option value="openai">OpenAI</option>
                <option value="anthropic">Anthropic</option>
                <option value="deepseek">DeepSeek</option>
                <option value="openrouter">OpenRouter</option>
                <option value="gemini">Google Gemini</option>
                {customProviders.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                模型 (可选)
              </label>
              <input
                type="text"
                value={step.model || ''}
                onChange={(e) => updateField('model', e.target.value || undefined)}
                placeholder="使用默认模型"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                温度 (0-2)
              </label>
              <input
                type="number"
                min="0"
                max="2"
                step="0.1"
                value={step.temperature ?? ''}
                onChange={(e) => updateField('temperature', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0.7"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* 条件分支 */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">条件分支 (可选)</label>
              {step.condition ? (
                <button
                  onClick={() => updateField('condition', undefined)}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  删除条件
                </button>
              ) : (
                <button
                  onClick={() => updateField('condition', { type: 'contains', value: '', targetStepId: '' })}
                  className="text-xs text-blue-500 hover:text-blue-600"
                >
                  添加条件
                </button>
              )}
            </div>

            {step.condition && (
              <div className="grid grid-cols-3 gap-2">
                <select
                  value={step.condition.type}
                  onChange={(e) => updateField('condition', { ...step.condition!, type: e.target.value as any })}
                  className="p-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="contains">包含</option>
                  <option value="matches">匹配正则</option>
                  <option value="length_gt">长度大于</option>
                  <option value="equals">等于</option>
                </select>
                <input
                  type="text"
                  value={step.condition.value}
                  onChange={(e) => updateField('condition', { ...step.condition!, value: e.target.value })}
                  placeholder="条件值"
                  className="p-2 border border-gray-300 rounded-lg text-sm"
                />
                <input
                  type="text"
                  value={step.condition.targetStepId}
                  onChange={(e) => updateField('condition', { ...step.condition!, targetStepId: e.target.value })}
                  placeholder="目标步骤ID"
                  className="p-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
