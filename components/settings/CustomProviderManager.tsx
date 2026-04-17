'use client';

import { useState } from 'react';
import { CustomProviderConfig } from '@/types';
import { getSettings, saveSettings, generateId } from '@/lib/db';
import { Plus, Trash2, Edit2, Check, X, Server } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CustomProviderManagerProps {
  onUpdate?: () => void;
}

export function CustomProviderManager({ onUpdate }: CustomProviderManagerProps) {
  const [settings, setSettings] = useState(getSettings());
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  const [formData, setFormData] = useState<Partial<CustomProviderConfig>>({
    name: '',
    apiKey: '',
    baseUrl: '',
    defaultModel: '',
    apiFormat: 'openai',
    enabled: true,
  });

  const customProviders = settings.providers.custom || [];

  const handleAdd = () => {
    if (!formData.name || !formData.apiKey || !formData.baseUrl || !formData.defaultModel) {
      alert('请填写所有必填字段');
      return;
    }

    const newProvider: CustomProviderConfig = {
      id: generateId(),
      name: formData.name,
      apiKey: formData.apiKey,
      baseUrl: formData.baseUrl,
      defaultModel: formData.defaultModel,
      apiFormat: formData.apiFormat as 'openai' | 'anthropic' | 'gemini' | 'custom',
      enabled: formData.enabled ?? true,
    };

    const newSettings = {
      ...settings,
      providers: {
        ...settings.providers,
        custom: [...customProviders, newProvider],
      },
    };

    setSettings(newSettings);
    saveSettings(newSettings);
    setIsAdding(false);
    setFormData({
      name: '',
      apiKey: '',
      baseUrl: '',
      defaultModel: '',
      apiFormat: 'openai',
      enabled: true,
    });
    onUpdate?.();
  };

  const handleUpdate = (id: string) => {
    const index = customProviders.findIndex((p) => p.id === id);
    if (index === -1) return;

    if (!formData.name || !formData.baseUrl || !formData.defaultModel) {
      alert('请填写所有必填字段');
      return;
    }

    const updatedProviders = [...customProviders];
    updatedProviders[index] = {
      ...updatedProviders[index],
      name: formData.name,
      apiKey: formData.apiKey || updatedProviders[index].apiKey,
      baseUrl: formData.baseUrl,
      defaultModel: formData.defaultModel,
      apiFormat: formData.apiFormat as 'openai' | 'anthropic' | 'gemini' | 'custom',
      enabled: formData.enabled ?? true,
    };

    const newSettings = {
      ...settings,
      providers: {
        ...settings.providers,
        custom: updatedProviders,
      },
    };

    setSettings(newSettings);
    saveSettings(newSettings);
    setEditingId(null);
    onUpdate?.();
  };

  const handleDelete = (id: string) => {
    if (!confirm('确定要删除这个自定义提供商吗？')) return;

    const newProviders = customProviders.filter((p) => p.id !== id);
    const newSettings = {
      ...settings,
      providers: {
        ...settings.providers,
        custom: newProviders,
      },
    };

    setSettings(newSettings);
    saveSettings(newSettings);
    onUpdate?.();
  };

  const startEdit = (provider: CustomProviderConfig) => {
    setEditingId(provider.id);
    setFormData({
      name: provider.name,
      apiKey: '',
      baseUrl: provider.baseUrl,
      defaultModel: provider.defaultModel,
      apiFormat: provider.apiFormat,
      enabled: provider.enabled,
    });
  };

  const toggleEnabled = (id: string) => {
    const index = customProviders.findIndex((p) => p.id === id);
    if (index === -1) return;

    const updatedProviders = [...customProviders];
    updatedProviders[index] = {
      ...updatedProviders[index],
      enabled: !updatedProviders[index].enabled,
    };

    const newSettings = {
      ...settings,
      providers: {
        ...settings.providers,
        custom: updatedProviders,
      },
    };

    setSettings(newSettings);
    saveSettings(newSettings);
    onUpdate?.();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">自定义提供商</h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加提供商
          </button>
        )}
      </div>

      {/* 添加表单 */}
      {isAdding && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
          <h4 className="font-medium text-gray-900">添加自定义提供商</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="例如：我的 OpenAI 代理"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API 格式 <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.apiFormat}
                onChange={(e) => setFormData({ ...formData, apiFormat: e.target.value as any })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="openai">OpenAI 兼容</option>
                <option value="anthropic">Anthropic 兼容</option>
                <option value="gemini">Google Gemini 兼容</option>
                <option value="custom">自定义格式</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base URL <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.baseUrl}
                onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                placeholder="https://api.example.com/v1/chat/completions"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder="sk-..."
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                默认模型 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.defaultModel}
                onChange={(e) => setFormData({ ...formData, defaultModel: e.target.value })}
                placeholder="gpt-4"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleAdd}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Check className="w-4 h-4" />
              确认添加
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
              取消
            </button>
          </div>
        </div>
      )}

      {/* 提供商列表 */}
      {customProviders.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <Server className="w-10 h-10 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">还没有自定义提供商</p>
        </div>
      ) : (
        <div className="space-y-2">
          {customProviders.map((provider, index) => (
            <div
              key={provider.id}
              className={cn(
                'border rounded-lg p-3',
                provider.enabled ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-60'
              )}
            >
              {editingId === provider.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="名称"
                      className="p-2 border border-gray-300 rounded text-sm"
                    />
                    <select
                      value={formData.apiFormat}
                      onChange={(e) => setFormData({ ...formData, apiFormat: e.target.value as any })}
                      className="p-2 border border-gray-300 rounded text-sm"
                    >
                      <option value="openai">OpenAI 兼容</option>
                      <option value="anthropic">Anthropic 兼容</option>
                      <option value="gemini">Gemini 兼容</option>
                      <option value="custom">自定义</option>
                    </select>
                    <input
                      type="text"
                      value={formData.baseUrl}
                      onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                      placeholder="Base URL"
                      className="p-2 border border-gray-300 rounded text-sm md:col-span-2"
                    />
                    <input
                      type="password"
                      value={formData.apiKey}
                      onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                      placeholder="API Key (留空保持原值)"
                      className="p-2 border border-gray-300 rounded text-sm md:col-span-2"
                    />
                    <input
                      type="text"
                      value={formData.defaultModel}
                      onChange={(e) => setFormData({ ...formData, defaultModel: e.target.value })}
                      placeholder="默认模型"
                      className="p-2 border border-gray-300 rounded text-sm md:col-span-2"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdate(provider.id)}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      <Check className="w-3 h-3" />
                      保存
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      <X className="w-3 h-3" />
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={provider.enabled}
                      onChange={() => toggleEnabled(provider.id)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{provider.name}</div>
                      <div className="text-xs text-gray-500">
                        {provider.baseUrl} · {provider.apiFormat} · {provider.defaultModel}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => startEdit(provider)}
                      className="p-1.5 text-gray-500 hover:bg-gray-100 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(provider.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
