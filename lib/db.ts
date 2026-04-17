import Dexie, { Table } from 'dexie';
import { Chain, Execution, ExportData, UserSettings } from '@/types';

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
    },
    defaultProvider: 'openai',
    defaultTemperature: 0.7,
    maxTokens: 4096,
    theme: 'system',
    language: 'zh',
    dataVersion: '1.0',
  };

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
