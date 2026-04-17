import { ChatParams, CustomProviderConfig } from '@/types';
import { getSettings, decryptApiKey } from './db';

// Provider API URLs
const PROVIDER_URLS: Record<string, string> = {
  openai: 'https://api.openai.com/v1/chat/completions',
  anthropic: 'https://api.anthropic.com/v1/messages',
  deepseek: 'https://api.deepseek.com/v1/chat/completions',
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/models',
};

// Convert OpenAI format to Anthropic format
function convertToAnthropicFormat(openaiFormat: any) {
  return {
    model: openaiFormat.model,
    messages: openaiFormat.messages.map((m: any) => ({
      role: m.role === 'system' ? 'user' : m.role,
      content: m.content,
    })),
    max_tokens: openaiFormat.max_tokens || 4096,
    temperature: openaiFormat.temperature,
    stream: openaiFormat.stream,
  };
}

// Convert OpenAI format to Gemini format
function convertToGeminiFormat(openaiFormat: any) {
  const contents = openaiFormat.messages.map((m: any) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  return {
    contents,
    generationConfig: {
      temperature: openaiFormat.temperature || 0.7,
      maxOutputTokens: openaiFormat.max_tokens || 4096,
    },
  };
}

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
    let customConfig: CustomProviderConfig | null = null;

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

    // 构建请求 URL
    const url = this.buildRequestUrl(provider, params, apiKey, customConfig, providerConfig);

    // 构建请求头
    const headers = this.buildHeaders(provider, apiKey, customConfig);

    // 构建请求体
    const requestBody = this.buildRequestBody(provider, params, customConfig);

    // 直接调用 Provider API
    const response = await fetch(url, {
      method: 'POST',
      headers,
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
              const token = this.extractToken(provider, parsed, customConfig);
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

  private buildRequestUrl(
    provider: string,
    params: ChatParams,
    apiKey: string,
    customConfig: CustomProviderConfig | null,
    providerConfig: any
  ): string {
    // 自定义提供商
    if (provider.startsWith('custom-') && customConfig) {
      if (customConfig.apiFormat === 'gemini') {
        return `${customConfig.baseUrl}/${params.model}:streamGenerateContent?key=${apiKey}`;
      }
      return customConfig.baseUrl;
    }

    switch (provider) {
      case 'azure':
        // Azure 需要特殊 URL 格式
        const endpoint = (providerConfig as any).endpoint;
        const deploymentId = (providerConfig as any).deploymentId;
        return `${endpoint}/openai/deployments/${deploymentId}/chat/completions?api-version=2024-02-01`;

      case 'gemini':
        return `${PROVIDER_URLS.gemini}/${params.model}:streamGenerateContent?key=${apiKey}`;

      default:
        return PROVIDER_URLS[provider] || '';
    }
  }

  private buildHeaders(
    provider: string,
    apiKey: string,
    customConfig: CustomProviderConfig | null
  ): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // 自定义提供商
    if (provider.startsWith('custom-') && customConfig) {
      switch (customConfig.apiFormat) {
        case 'anthropic':
          headers['x-api-key'] = apiKey;
          headers['anthropic-version'] = '2023-06-01';
          break;
        case 'gemini':
          // Gemini 使用 URL 参数传递 key，不需要 header
          break;
        case 'openai':
        case 'custom':
        default:
          headers['Authorization'] = `Bearer ${apiKey}`;
          break;
      }
      return headers;
    }

    switch (provider) {
      case 'openai':
      case 'deepseek':
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;

      case 'anthropic':
        headers['x-api-key'] = apiKey;
        headers['anthropic-version'] = '2023-06-01';
        break;

      case 'azure':
        headers['api-key'] = apiKey;
        break;

      case 'openrouter':
        headers['Authorization'] = `Bearer ${apiKey}`;
        headers['HTTP-Referer'] = 'https://prompt-chain.vercel.app';
        headers['X-Title'] = 'Prompt Chain';
        break;

      case 'gemini':
        // Gemini 使用 URL 参数传递 key，不需要 header
        break;

      default:
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;
    }

    return headers;
  }

  private buildRequestBody(
    provider: string,
    params: ChatParams,
    customConfig: CustomProviderConfig | null
  ): any {
    const baseBody = {
      model: params.model,
      messages: params.messages,
      temperature: params.temperature,
      max_tokens: params.maxTokens,
      stream: params.stream,
    };

    // 自定义提供商
    if (provider.startsWith('custom-') && customConfig) {
      switch (customConfig.apiFormat) {
        case 'anthropic':
          return convertToAnthropicFormat(baseBody);
        case 'gemini':
          return convertToGeminiFormat(baseBody);
        case 'openai':
        case 'custom':
        default:
          return baseBody;
      }
    }

    switch (provider) {
      case 'anthropic':
        return convertToAnthropicFormat(baseBody);

      case 'gemini':
        return convertToGeminiFormat(baseBody);

      case 'azure':
        // Azure 不需要 model 字段（从 URL 中获取）
        return {
          messages: params.messages,
          temperature: params.temperature,
          max_tokens: params.maxTokens,
          stream: params.stream,
        };

      default:
        return baseBody;
    }
  }

  private extractToken(provider: string, data: any, customConfig?: CustomProviderConfig | null): string | null {
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
