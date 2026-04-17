'use client';

import { useState, useEffect } from 'react';
import { UserSettings, ProviderConfig as ProviderConfigType, AzureConfig } from '@/types';
import { getSettings, saveSettings, encryptApiKey } from '@/lib/db';
import { Eye, EyeOff, Save, TestTube } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CustomProviderManager } from './CustomProviderManager';

const defaultSettings: UserSettings = {
  providers: {
    openai: {
      enabled: false,
      apiKey: '',
      defaultModel: 'gpt-4',
    },
    anthropic: {
      enabled: false,
      apiKey: '',
      defaultModel: 'claude-3-sonnet-20240229',
    },
    deepseek: {
      enabled: false,
      apiKey: '',
      defaultModel: 'deepseek-chat',
    },
    openrouter: {
      enabled: false,
      apiKey: '',
      defaultModel: 'anthropic/claude-3.5-sonnet',
    },
    gemini: {
      enabled: false,
      apiKey: '',
      defaultModel: 'gemini-1.5-flash',
    },
  },
  defaultProvider: 'openai',
  defaultModel: 'gpt-4',
  defaultTemperature: 0.7,
  maxTokens: 4096,
  theme: 'system',
  language: 'zh',
  dataVersion: '1.0',
};

export function ProviderConfig() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [testStatus, setTestStatus] = useState<Record<string, string>>({});
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setSettings(getSettings());
  }, []);

  const updateProvider = (provider: string, config: Partial<ProviderConfigType>) => {
    const newSettings = {
      ...settings,
      providers: {
        ...settings.providers,
        [provider]: {
          ...settings.providers[provider as keyof typeof settings.providers],
          ...config,
        },
      },
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const testConnection = async (provider: string) => {
    setTestStatus({ ...testStatus, [provider]: 'testing' });
    
    try {
      const config = settings.providers[provider as keyof typeof settings.providers] as ProviderConfigType | undefined;
      if (!config?.enabled || !config.apiKey) {
        setTestStatus({ ...testStatus, [provider]: '请先启用并配置API Key' });
        return;
      }

      const response = await fetch(`/api/proxy/${provider}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: config.defaultModel,
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 5,
          apiKey: config.apiKey,
        }),
      });

      if (response.ok) {
        setTestStatus({ ...testStatus, [provider]: '连接成功!' });
      } else {
        const error = await response.text();
        setTestStatus({ ...testStatus, [provider]: `连接失败: ${error}` });
      }
    } catch (error) {
      setTestStatus({ ...testStatus, [provider]: `错误: ${error}` });
    }
  };

  const renderProviderCard = (name: string, title: string, models: string[]) => {
    const config = settings.providers[name as keyof typeof settings.providers] as ProviderConfigType | undefined;
    if (!config) return null;

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">{title}</h3>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) => updateProvider(name, { enabled: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-600">启用</span>
          </label>
        </div>

        {config.enabled && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Key
              </label>
              <div className="relative">
                <input
                  type={showKeys[name] ? 'text' : 'password'}
                  value={config.apiKey}
                  onChange={(e) => updateProvider(name, { apiKey: e.target.value })}
                  placeholder={`输入 ${title} API Key`}
                  className="w-full p-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => setShowKeys({ ...showKeys, [name]: !showKeys[name] })}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showKeys[name] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                默认模型
              </label>
              <select
                value={config.defaultModel}
                onChange={(e) => updateProvider(name, { defaultModel: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {models.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            {name === 'azure' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endpoint
                  </label>
                  <input
                    type="text"
                    value={(config as any).endpoint || ''}
                    onChange={(e) => updateProvider(name, { endpoint: e.target.value } as Partial<AzureConfig>)}
                    placeholder="https://your-resource.openai.azure.com"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deployment ID
                  </label>
                  <input
                    type="text"
                    value={(config as any).deploymentId || ''}
                    onChange={(e) => updateProvider(name, { deploymentId: e.target.value } as Partial<AzureConfig>)}
                    placeholder="your-deployment-name"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </>
            )}

            {name !== 'azure' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  自定义 Base URL (可选)
                </label>
                <input
                  type="text"
                  value={config.baseUrl || ''}
                  onChange={(e) => updateProvider(name, { baseUrl: e.target.value })}
                  placeholder="https://api.openai.com/v1"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => testConnection(name)}
                disabled={testStatus[name] === 'testing'}
                className={cn(
                  'flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg transition-colors',
                  testStatus[name] === 'testing'
                    ? 'bg-gray-100 text-gray-400'
                    : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                )}
              >
                <TestTube className="w-4 h-4" />
                {testStatus[name] === 'testing' ? '测试中...' : '测试连接'}
              </button>
              {testStatus[name] && testStatus[name] !== 'testing' && (
                <span
                  className={cn(
                    'text-sm',
                    testStatus[name].includes('成功') ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {testStatus[name]}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!isClient) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-gray-900">AI 服务提供商配置</h2>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">AI 服务提供商配置</h2>
      
      {renderProviderCard('openai', 'OpenAI', [
        'gpt-4',
        'gpt-4-turbo',
        'gpt-3.5-turbo',
        'gpt-4o',
        'gpt-4o-mini',
      ])}

      {renderProviderCard('anthropic', 'Anthropic', [
        'claude-3-opus-20240229',
        'claude-3-sonnet-20240229',
        'claude-3-haiku-20240307',
      ])}

      {renderProviderCard('azure', 'Azure OpenAI', ['gpt-4', 'gpt-35-turbo'])}

      {renderProviderCard('deepseek', 'DeepSeek', [
        'deepseek-chat',
        'deepseek-coder',
        'deepseek-reasoner',
      ])}

      {renderProviderCard('openrouter', 'OpenRouter', [
        'anthropic/claude-3.5-sonnet',
        'anthropic/claude-3-opus',
        'openai/gpt-4o',
        'openai/gpt-4o-mini',
        'google/gemini-1.5-pro',
        'meta-llama/llama-3.1-70b-instruct',
      ])}

      {renderProviderCard('gemini', 'Google Gemini', [
        'gemini-1.5-flash',
        'gemini-1.5-flash-8b',
        'gemini-1.5-pro',
        'gemini-1.0-pro',
      ])}

      {/* 自定义提供商管理 */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <CustomProviderManager onUpdate={() => setSettings(getSettings())} />
      </div>

      {/* 全局默认设置 */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-4">全局默认设置</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              默认提供商
            </label>
            <select
              value={settings.defaultProvider}
              onChange={(e) => {
                const newSettings = { ...settings, defaultProvider: e.target.value };
                setSettings(newSettings);
                saveSettings(newSettings);
              }}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="deepseek">DeepSeek</option>
              <option value="openrouter">OpenRouter</option>
              <option value="gemini">Google Gemini</option>
              {settings.providers.custom?.filter(c => c.enabled).map((c, i) => (
                <option key={c.id} value={`custom-${i}`}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              默认模型
            </label>
            <input
              type="text"
              value={settings.defaultModel}
              onChange={(e) => {
                const newSettings = { ...settings, defaultModel: e.target.value };
                setSettings(newSettings);
                saveSettings(newSettings);
              }}
              placeholder="gpt-4"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              未指定模型的步骤将使用此默认模型
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              默认温度 (0-2)
            </label>
            <input
              type="number"
              min="0"
              max="2"
              step="0.1"
              value={settings.defaultTemperature}
              onChange={(e) => {
                const newSettings = { ...settings, defaultTemperature: parseFloat(e.target.value) };
                setSettings(newSettings);
                saveSettings(newSettings);
              }}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              最大 Token 数
            </label>
            <input
              type="number"
              min="100"
              max="128000"
              step="100"
              value={settings.maxTokens}
              onChange={(e) => {
                const newSettings = { ...settings, maxTokens: parseInt(e.target.value) };
                setSettings(newSettings);
                saveSettings(newSettings);
              }}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">安全提示</h4>
        <p className="text-sm text-yellow-700">
          API Key 仅存储在您的浏览器本地，不会上传到任何服务器。
          建议定期更换 API Key 以保证安全。
        </p>
      </div>
    </div>
  );
}
