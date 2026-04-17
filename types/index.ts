// 提示链相关类型

export interface Chain {
  id: string;
  name: string;
  description: string;
  steps: Step[];
  config: ChainConfig;
  createdAt: string;
  updatedAt: string;
}

export interface Step {
  id: string;
  name: string;
  systemPrompt: string;
  inputStrategy: 'last_result' | 'original' | 'original_with_context' | 'cumulative';
  model?: string;
  temperature?: number;
  condition?: Condition;
  order: number;
}

export interface Condition {
  type: 'contains' | 'matches' | 'length_gt' | 'equals';
  value: string;
  targetStepId: string;
}

export interface ChainConfig {
  maxRetries: number;
  timeout: number;
  errorHandling: 'stop' | 'continue';
  debug: boolean;
}

// 执行相关类型
export interface Execution {
  id: string;
  chainId: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  input: string;
  output?: string;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  stepResults: StepResult[];
  debugLogs?: DebugLog[];
}

export interface StepResult {
  stepId: string;
  stepNumber: number;
  status: 'pending' | 'running' | 'streaming' | 'completed' | 'failed';
  input: string;
  output?: string;
  partialOutput?: string;
  promptRendered: string;
  tokensUsed?: number;
  startedAt: string;
  completedAt?: string;
  durationMs?: number;
  error?: string;
}

export interface DebugLog {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  stepId?: string;
  message: string;
  data?: any;
}

// 用户设置
export interface UserSettings {
  providers: {
    openai?: ProviderConfig;
    anthropic?: ProviderConfig;
    azure?: AzureConfig;
    deepseek?: ProviderConfig;
    openrouter?: ProviderConfig;
    gemini?: ProviderConfig;
    custom?: CustomProviderConfig[];
  };
  defaultProvider: string;
  defaultModel: string;
  defaultTemperature: number;
  maxTokens: number;
  theme: 'light' | 'dark' | 'system';
  language: 'zh' | 'en';
  dataVersion: string;
}

export interface ProviderConfig {
  enabled: boolean;
  apiKey: string;
  baseUrl?: string;
  defaultModel: string;
}

export interface AzureConfig extends ProviderConfig {
  endpoint: string;
  deploymentId: string;
}

export interface CustomProviderConfig extends ProviderConfig {
  id: string;
  name: string;
  baseUrl: string;
  apiFormat: 'openai' | 'anthropic' | 'gemini' | 'custom';
}

// 导出数据格式
export interface ExportData {
  version: string;
  exportedAt: string;
  chains: Chain[];
  executions: Execution[];
  settings: string | null;
}

// AI 服务类型
export interface ChatParams {
  model: string;
  messages: { role: string; content: string }[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface StepUpdate {
  status?: 'pending' | 'running' | 'streaming' | 'completed' | 'failed';
  token?: string;
  partialOutput?: string;
  output?: string;
  error?: string;
}

// 模板类型
export interface ChainTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  chain: Omit<Chain, 'id' | 'createdAt' | 'updatedAt'>;
}
