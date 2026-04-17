import { ChatParams, CustomProviderConfig } from '@/types';
import { getSettings, decryptApiKey } from './db';

export class AIService {
  async chat(
    provider: string,
    params: ChatParams,
    onToken: (token: string) => void,
    abortSignal?: AbortSignal
  ): Promise<void> {
    const settings = getSettings();
    
    // 处理自定义提供商
    let providerConfig = settings.providers[provider as keyof typeof settings.providers];
    let customConfig = null;
    
    if (provider.startsWith('custom-')) {
      const customIndex = parseInt(provider.replace('custom-', ''));
      if (settings.providers.custom && settings.providers.custom[customIndex]) {
        providerConfig = settings.providers.custom[customIndex];
        customConfig = settings.providers.custom[customIndex];
      }
    }

    if (!providerConfig || !('enabled' in providerConfig) || !providerConfig.enabled) {
      throw new Error(`Provider ${provider} not configured or not enabled`);
    }

    const apiKey = decryptApiKey(providerConfig.apiKey);
    if (!apiKey) {
      throw new Error(`API Key for ${provider} is not set`);
    }

    const requestBody: any = {
      ...params,
      apiKey,
    };
    
    if (customConfig) {
      requestBody.customConfig = {
        baseUrl: customConfig.baseUrl,
        apiFormat: customConfig.apiFormat,
      };
    }

    const response = await fetch(`/api/proxy/${provider}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
      signal: abortSignal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    // 处理流式响应
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const token = this.extractToken(provider, parsed);
              if (token) {
                onToken(token);
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  private extractToken(provider: string, data: any, customConfig?: CustomProviderConfig): string | null {
    // 自定义提供商根据 apiFormat 解析
    if (provider.startsWith('custom-') && customConfig) {
      switch (customConfig.apiFormat) {
        case 'anthropic':
          return data.delta?.text || null;
        case 'gemini':
          if (data.candidates && data.candidates[0]?.content?.parts) {
            return data.candidates[0].content.parts.map((p: any) => p.text).join('');
          }
          return null;
        case 'openai':
        case 'custom':
        default:
          return data.choices?.[0]?.delta?.content || null;
      }
    }

    switch (provider) {
      case 'openai':
      case 'azure':
      case 'deepseek':
      case 'openrouter':
        return data.choices?.[0]?.delta?.content || null;
      case 'anthropic':
        return data.delta?.text || null;
      case 'gemini':
        // Gemini 流式响应格式不同
        if (data.candidates && data.candidates[0]?.content?.parts) {
          return data.candidates[0].content.parts.map((p: any) => p.text).join('');
        }
        return null;
      default:
        return data.choices?.[0]?.delta?.content || null;
    }
  }

  // 获取默认设置
  getDefaultSettings() {
    const settings = getSettings();
    return {
      defaultProvider: settings.defaultProvider,
      defaultModel: settings.defaultModel,
      defaultTemperature: settings.defaultTemperature,
      maxTokens: settings.maxTokens,
    };
  }

  // 获取默认提供商
  getDefaultProvider(): string {
    const settings = getSettings();
    return settings.defaultProvider;
  }

  // 获取默认模型
  getDefaultModel(provider?: string): string {
    const settings = getSettings();
    // 优先使用全局默认模型
    if (settings.defaultModel) {
      return settings.defaultModel;
    }
    // 回退到提供商默认模型
    const p = provider || settings.defaultProvider;
    const config = settings.providers[p as keyof typeof settings.providers];
    if (config && 'defaultModel' in config) {
      return config.defaultModel;
    }
    return 'gpt-4';
  }

  // 获取提供商列表
  getAvailableProviders(): string[] {
    const settings = getSettings();
    const providers: string[] = [];

    if (settings.providers.openai?.enabled) providers.push('openai');
    if (settings.providers.anthropic?.enabled) providers.push('anthropic');
    if (settings.providers.azure?.enabled) providers.push('azure');
    if (settings.providers.deepseek?.enabled) providers.push('deepseek');
    if (settings.providers.openrouter?.enabled) providers.push('openrouter');
    if (settings.providers.gemini?.enabled) providers.push('gemini');
    if (settings.providers.custom) {
      settings.providers.custom.forEach((c, i) => {
        if (c.enabled) providers.push(`custom-${i}`);
      });
    }

    return providers;
  }

  // 获取自定义提供商列表（带名称）
  getCustomProviders(): { id: string; name: string }[] {
    const settings = getSettings();
    if (!settings.providers.custom) return [];
    
    return settings.providers.custom
      .filter((c) => c.enabled)
      .map((c, i) => ({
        id: `custom-${i}`,
        name: c.name,
      }));
  }
}

export const aiService = new AIService();
