import { WebDAVConfig, ExportData } from '@/types';
import { db, saveSettings, getSettings } from './db';
import { uploadFile, downloadFile, getFileInfo, SYNC_FILENAME } from './webdav';

export interface SyncResult {
  success: boolean;
  message: string;
  direction?: 'upload' | 'download';
  timestamp?: string;
}

/**
 * 准备同步数据
 */
async function prepareSyncData(config: WebDAVConfig): Promise<ExportData> {
  const data = await db.exportAll();

  // 如果不同步执行记录，移除它们
  if (!config.syncExecutions) {
    data.executions = [];
  }

  return data;
}

/**
 * 上传到 WebDAV
 */
export async function syncToWebDAV(config: WebDAVConfig): Promise<SyncResult> {
  try {
    // 准备数据
    const data = await prepareSyncData(config);
    const json = JSON.stringify(data, null, 2);

    // 上传
    const result = await uploadFile(config, json);

    if (result.success) {
      // 更新最后同步时间
      const settings = getSettings();
      settings.webdav = {
        ...config,
        lastSyncAt: new Date().toISOString(),
      };
      saveSettings(settings);

      return {
        success: true,
        message: `数据已上传到 WebDAV${config.syncExecutions ? '' : '（不包含执行记录）'}`,
        direction: 'upload',
        timestamp: settings.webdav.lastSyncAt,
      };
    } else {
      return {
        success: false,
        message: result.message,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `同步失败: ${error instanceof Error ? error.message : '未知错误'}`,
    };
  }
}

/**
 * 从 WebDAV 下载
 */
export async function syncFromWebDAV(config: WebDAVConfig): Promise<SyncResult> {
  try {
    // 下载数据
    const result = await downloadFile(config);

    if (!result.success) {
      return {
        success: false,
        message: result.message,
      };
    }

    if (!result.content) {
      return {
        success: false,
        message: '下载的数据为空',
      };
    }

    // 解析数据
    let data: ExportData;
    try {
      data = JSON.parse(result.content);
    } catch {
      return {
        success: false,
        message: '同步文件格式无效',
      };
    }

    // 验证数据格式
    if (!data.version || !data.chains) {
      return {
        success: false,
        message: '同步文件格式不兼容',
      };
    }

    // 导入数据
    await db.importAll(data);

    // 更新最后同步时间
    const settings = getSettings();
    settings.webdav = {
      ...config,
      lastSyncAt: new Date().toISOString(),
    };
    saveSettings(settings);

    return {
      success: true,
      message: `数据已从 WebDAV 恢复${!config.syncExecutions && data.executions?.length ? '（执行记录已跳过）' : ''}`,
      direction: 'download',
      timestamp: settings.webdav.lastSyncAt,
    };
  } catch (error) {
    return {
      success: false,
      message: `同步失败: ${error instanceof Error ? error.message : '未知错误'}`,
    };
  }
}

/**
 * 获取远程同步文件信息
 */
export async function getRemoteSyncInfo(config: WebDAVConfig): Promise<{
  exists: boolean;
  lastModified?: string;
  size?: number;
  message?: string;
}> {
  return getFileInfo(config);
}

/**
 * 格式化上次同步时间
 */
export function formatLastSync(timestamp?: string): string {
  if (!timestamp) return '从未同步';

  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // 小于 1 分钟
  if (diff < 60000) {
    return '刚刚';
  }

  // 小于 1 小时
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes} 分钟前`;
  }

  // 小于 24 小时
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000);
    return `${hours} 小时前`;
  }

  // 小于 7 天
  if (diff < 604800000) {
    const days = Math.floor(diff / 86400000);
    return `${days} 天前`;
  }

  // 默认显示日期
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export { SYNC_FILENAME };
