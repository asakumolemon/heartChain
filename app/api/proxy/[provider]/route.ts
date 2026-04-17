export const runtime = 'edge';

const PROVIDER_URLS: Record<string, string> = {
  openai: 'https://api.openai.com/v1/chat/completions',
  anthropic: 'https://api.anthropic.com/v1/messages',
  deepseek: 'https://api.deepseek.com/v1/chat/completions',
  openrouter: 'https://openrouter.ai/api/v1/chat/completions',
  gemini: 'https://generativelanguage.googleapis.com/v1beta/models',
};

export async function POST(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const body = await request.json();
  const { apiKey, customConfig, ...rest } = body;

  if (!apiKey) {
    return new Response('API Key required', { status: 401 });
  }

  let url = PROVIDER_URLS[provider];
  let headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  let requestBody = rest;

  // 处理自定义提供商
  if (provider.startsWith('custom-') && customConfig) {
    url = customConfig.baseUrl;
    
    switch (customConfig.apiFormat) {
      case 'openai':
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;
      case 'anthropic':
        headers['x-api-key'] = apiKey;
        headers['anthropic-version'] = '2023-06-01';
        requestBody = convertToAnthropicFormat(rest);
        break;
      case 'gemini':
        url = `${customConfig.baseUrl}/${rest.model}:streamGenerateContent?key=${apiKey}`;
        requestBody = convertToGeminiFormat(rest);
        break;
      case 'custom':
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;
    }
    
    // 发送请求
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.text();
        return new Response(error, { status: response.status });
      }

      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: 'Proxy request failed',
          details: String(error),
        }),
        { status: 500 }
      );
    }
  }

  switch (provider) {
    case 'openai':
      headers['Authorization'] = `Bearer ${apiKey}`;
      break;

    case 'anthropic':
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
      // 转换消息格式
      requestBody = convertToAnthropicFormat(rest);
      break;

    case 'azure':
      url = `${rest.endpoint}/openai/deployments/${rest.deploymentId}/chat/completions?api-version=2024-02-01`;
      headers['api-key'] = apiKey;
      break;

    case 'deepseek':
      headers['Authorization'] = `Bearer ${apiKey}`;
      break;

    case 'openrouter':
      headers['Authorization'] = `Bearer ${apiKey}`;
      headers['HTTP-Referer'] = 'https://prompt-chain.vercel.app';
      headers['X-Title'] = 'Prompt Chain';
      break;

    case 'gemini':
      url = `https://generativelanguage.googleapis.com/v1beta/models/${rest.model}:streamGenerateContent?key=${apiKey}`;
      requestBody = convertToGeminiFormat(rest);
      break;

    case 'custom':
      url = rest.baseUrl;
      headers['Authorization'] = `Bearer ${apiKey}`;
      break;

    default:
      return new Response('Unknown provider', { status: 400 });
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      return new Response(error, { status: response.status });
    }

    // 流式转发
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Proxy request failed',
        details: String(error),
      }),
      { status: 500 }
    );
  }
}

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
