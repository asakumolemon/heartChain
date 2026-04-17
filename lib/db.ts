import Dexie, { Table } from 'dexie';
import { Chain, Execution, ExportData, UserSettings, ModelConfig } from '@/types';

export class PromptChainDB extends Dexie {
  chains!: Table<Chain>;
  executions!: Table<Execution>;

  constructor() {
    super('PromptChainDB');
    this.version(1).stores({
      chains: '++id, name, updatedAt',
      executions: '++id, chainId, startedAt, status',
    });
  }

  // 导出所有数据
  async exportAll(): Promise<ExportData> {
    const settings = localStorage.getItem('promptchain_settings');
    return {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      chains: await this.chains.toArray(),
      executions: await this.executions.toArray(),
      settings: settings,
    };
  }

  // 导入数据
  async importAll(data: ExportData): Promise<void> {
    await this.transaction('rw', this.chains, this.executions, async () => {
      await this.chains.clear();
      await this.executions.clear();
      if (data.chains && data.chains.length > 0) {
        await this.chains.bulkAdd(data.chains);
      }
      if (data.executions && data.executions.length > 0) {
        await this.executions.bulkAdd(data.executions);
      }
    });
    if (data.settings) {
      localStorage.setItem('promptchain_settings', data.settings);
    }
  }

  // 清理旧执行记录
  async cleanupOldExecutions(keepDays: number = 30): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - keepDays);
    const cutoffStr = cutoff.toISOString();

    const old = await this.executions
      .where('startedAt')
      .below(cutoffStr)
      .toArray();

    if (old.length > 0) {
      await this.executions.bulkDelete(old.map((e) => e.id));
    }
    return old.length;
  }

  // 获取提示链列表
  async getChains(): Promise<Chain[]> {
    return this.chains.orderBy('updatedAt').reverse().toArray();
  }

  // 获取单个提示链
  async getChain(id: string): Promise<Chain | undefined> {
    return this.chains.get(id);
  }

  // 保存提示链
  async saveChain(chain: Chain): Promise<string> {
    chain.updatedAt = new Date().toISOString();
    if (!chain.id) {
      chain.id = generateId();
      chain.createdAt = chain.updatedAt;
      await this.chains.add(chain);
    } else {
      await this.chains.put(chain);
    }
    return chain.id;
  }

  // 删除提示链
  async deleteChain(id: string): Promise<void> {
    await this.transaction('rw', this.chains, this.executions, async () => {
      await this.chains.delete(id);
      // 同时删除相关执行记录
      const executions = await this.executions.where('chainId').equals(id).toArray();
      await this.executions.bulkDelete(executions.map((e) => e.id));
    });
  }

  // 获取执行历史
  async getExecutions(chainId?: string): Promise<Execution[]> {
    let query = this.executions.orderBy('startedAt').reverse();
    if (chainId) {
      query = this.executions.where('chainId').equals(chainId).reverse();
    }
    return query.toArray();
  }

  // 获取单个执行记录
  async getExecution(id: string): Promise<Execution | undefined> {
    return this.executions.get(id);
  }

  // 保存执行记录
  async saveExecution(execution: Execution): Promise<void> {
    await this.executions.put(execution);
  }

  // 删除执行记录
  async deleteExecution(id: string): Promise<void> {
    await this.executions.delete(id);
  }
}

// 生成唯一ID
export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
}

// 数据库实例
export const db = new PromptChainDB();

// 设置相关操作
const SETTINGS_KEY = 'promptchain_settings';

export function getSettings(): UserSettings {
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

  // 仅在客户端执行
  if (typeof window === 'undefined') {
    return defaultSettings;
  }

  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Failed to parse settings:', e);
  }

  return defaultSettings;
}

export function saveSettings(settings: UserSettings): void {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

// 简单的 API Key 加密（XOR）
export function encryptApiKey(key: string): string {
  if (!key) return '';
  const xorKey = 'PromptChain';
  let result = '';
  for (let i = 0; i < key.length; i++) {
    result += String.fromCharCode(key.charCodeAt(i) ^ xorKey.charCodeAt(i % xorKey.length));
  }
  return btoa(result);
}

export function decryptApiKey(encrypted: string): string {
  if (!encrypted) return '';
  try {
    const xorKey = 'PromptChain';
    const key = atob(encrypted);
    let result = '';
    for (let i = 0; i < key.length; i++) {
      result += String.fromCharCode(key.charCodeAt(i) ^ xorKey.charCodeAt(i % xorKey.length));
    }
    return result;
  } catch (e) {
    return '';
  }
}

// 预设模型配置
export const PRESET_MODELS: ModelConfig[] = [
  // OpenAI
  { id: 'gpt-4', providerId: 'openai', name: 'gpt-4', displayName: 'GPT-4', enabled: true, contextWindow: 128000, maxTokens: 4096, defaultTemperature: 0.7, description: '强大的多模态模型', isCustom: false },
  { id: 'gpt-4-turbo', providerId: 'openai', name: 'gpt-4-turbo', displayName: 'GPT-4 Turbo', enabled: true, contextWindow: 128000, maxTokens: 4096, defaultTemperature: 0.7, description: '更快的 GPT-4', isCustom: false },
  { id: 'gpt-4o', providerId: 'openai', name: 'gpt-4o', displayName: 'GPT-4o', enabled: true, contextWindow: 128000, maxTokens: 4096, defaultTemperature: 0.7, description: '最新多模态模型', isCustom: false },
  { id: 'gpt-4o-mini', providerId: 'openai', name: 'gpt-4o-mini', displayName: 'GPT-4o Mini', enabled: true, contextWindow: 128000, maxTokens: 4096, defaultTemperature: 0.7, description: '轻量级模型', isCustom: false },
  { id: 'gpt-3.5-turbo', providerId: 'openai', name: 'gpt-3.5-turbo', displayName: 'GPT-3.5 Turbo', enabled: true, contextWindow: 16385, maxTokens: 4096, defaultTemperature: 0.7, description: '经济实惠', isCustom: false },
  
  // Anthropic
  { id: 'claude-3-opus', providerId: 'anthropic', name: 'claude-3-opus-20240229', displayName: 'Claude 3 Opus', enabled: true, contextWindow: 200000, maxTokens: 4096, defaultTemperature: 0.7, description: '最强大的 Claude', isCustom: false },
  { id: 'claude-3-sonnet', providerId: 'anthropic', name: 'claude-3-sonnet-20240229', displayName: 'Claude 3 Sonnet', enabled: true, contextWindow: 200000, maxTokens: 4096, defaultTemperature: 0.7, description: '平衡性能', isCustom: false },
  { id: 'claude-3-haiku', providerId: 'anthropic', name: 'claude-3-haiku-20240307', displayName: 'Claude 3 Haiku', enabled: true, contextWindow: 200000, maxTokens: 4096, defaultTemperature: 0.7, description: '快速响应', isCustom: false },
  
  // DeepSeek
  { id: 'deepseek-chat', providerId: 'deepseek', name: 'deepseek-chat', displayName: 'DeepSeek Chat', enabled: true, contextWindow: 64000, maxTokens: 4096, defaultTemperature: 0.7, description: 'DeepSeek 对话模型', isCustom: false },
  { id: 'deepseek-coder', providerId: 'deepseek', name: 'deepseek-coder', displayName: 'DeepSeek Coder', enabled: true, contextWindow: 64000, maxTokens: 4096, defaultTemperature: 0.7, description: '代码专用模型', isCustom: false },
  { id: 'deepseek-reasoner', providerId: 'deepseek', name: 'deepseek-reasoner', displayName: 'DeepSeek Reasoner', enabled: true, contextWindow: 64000, maxTokens: 4096, defaultTemperature: 0.7, description: '推理模型', isCustom: false },
  
  // Gemini
  { id: 'gemini-1.5-flash', providerId: 'gemini', name: 'gemini-1.5-flash', displayName: 'Gemini 1.5 Flash', enabled: true, contextWindow: 1000000, maxTokens: 8192, defaultTemperature: 0.7, description: '快速多模态', isCustom: false },
  { id: 'gemini-1.5-pro', providerId: 'gemini', name: 'gemini-1.5-pro', displayName: 'Gemini 1.5 Pro', enabled: true, contextWindow: 2000000, maxTokens: 8192, defaultTemperature: 0.7, description: '专业多模态', isCustom: false },
  { id: 'gemini-1.0-pro', providerId: 'gemini', name: 'gemini-1.0-pro', displayName: 'Gemini 1.0 Pro', enabled: true, contextWindow: 32000, maxTokens: 4096, defaultTemperature: 0.7, description: '稳定版本', isCustom: false },
];

// 获取模型列表
export function getModels(): ModelConfig[] {
  const settings = getSettings();
  if (settings.models && settings.models.length > 0) {
    return settings.models;
  }
  // 返回预设模型
  return [...PRESET_MODELS];
}

// 保存模型列表
export function saveModels(models: ModelConfig[]): void {
  const settings = getSettings();
  settings.models = models;
  saveSettings(settings);
}

// 添加自定义模型
export function addModel(model: Omit<ModelConfig, 'id' | 'isCustom'>): ModelConfig {
  const newModel: ModelConfig = {
    ...model,
    id: generateId(),
    isCustom: true,
  };
  const models = getModels();
  models.push(newModel);
  saveModels(models);
  return newModel;
}

// 更新模型
export function updateModel(id: string, updates: Partial<ModelConfig>): void {
  const models = getModels();
  const index = models.findIndex((m) => m.id === id);
  if (index !== -1) {
    models[index] = { ...models[index], ...updates };
    saveModels(models);
  }
}

// 删除模型
export function deleteModel(id: string): void {
  const models = getModels();
  const filtered = models.filter((m) => m.id !== id);
  saveModels(filtered);
}

// 获取启用的模型
export function getEnabledModels(providerId?: string): ModelConfig[] {
  const models = getModels();
  let filtered = models.filter((m) => m.enabled);
  if (providerId) {
    filtered = filtered.filter((m) => m.providerId === providerId);
  }
  return filtered;
}

// 获取供应商的模型数量
export function getModelCountByProvider(providerId: string): number {
  return getModels().filter((m) => m.providerId === providerId).length;
}

// 数据迁移：从旧版本迁移模型配置
export function migrateModels(): void {
  const settings = getSettings();
  if (settings.models && settings.models.length > 0) {
    return; // 已迁移
  }
  
  // 初始化模型列表
  settings.models = [...PRESET_MODELS];
  saveSettings(settings);
}
