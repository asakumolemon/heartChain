import { WebDAVConfig } from '@/types';

const SYNC_FILENAME = 'promptchain-sync.json';

export interface WebDAVFileInfo {
  exists: boolean;
  lastModified?: string;
  size?: number;
}

/**
 * 通过代理发送请求
 */
async function proxyRequest(
  method: string,
  url: string,
  username: string,
  password: string,
  body?: string,
  customHeaders?: Record<string, string>
): Promise<{ success: boolean; status: number; body: string; headers: Record<string, string> }> {
  const response = await fetch('/api/webdav/proxy', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      method,
      url,
      username,
      password,
      body,
      headers: customHeaders,
    }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || '代理请求失败');
  }

  return result;
}

/**
 * 确保 URL 使用 HTTPS 协议
 */
function ensureHttps(url: string): string {
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }
  if (!url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
}

/**
 * 获取完整的文件 URL
 */
function getFileUrl(config: WebDAVConfig): string {
  const baseUrl = ensureHttps(config.serverUrl).replace(/\/$/, '');
  return `${baseUrl}/${SYNC_FILENAME}`;
}

/**
 * 获取目录 URL（用于创建目录）
 */
function getDirectoryUrl(config: WebDAVConfig): string {
  return ensureHttps(config.serverUrl).replace(/\/$/, '');
}

/**
 * 创建目录
 */
async function createDirectory(config: WebDAVConfig): Promise<{ success: boolean; message: string }> {
  try {
    const url = getDirectoryUrl(config);
    console.log('[WebDAV] Creating directory:', url);

    const result = await sendRequest('MKCOL', url, config);

    if (result.success || result.status === 201 || result.status === 204) {
      return { success: true, message: '目录创建成功' };
    } else if (result.status === 405) {
      // 目录已存在
      return { success: true, message: '目录已存在' };
    } else if (result.status === 409) {
      return { success: false, message: '父目录不存在' };
    } else {
      return { success: false, message: `创建目录失败: HTTP ${result.status}` };
    }
  } catch (error) {
    return { success: false, message: `创建目录失败: ${error instanceof Error ? error.message : '未知错误'}` };
  }
}

/**
 * 发送 WebDAV 请求
 */
async function sendRequest(
  method: string,
  url: string,
  config: WebDAVConfig,
  body?: string,
  customHeaders?: Record<string, string>
): Promise<{ success: boolean; status: number; body: string; headers: Record<string, string> }> {
  return proxyRequest(method, url, config.username, config.password, body, customHeaders);
}

/**
 * 测试 WebDAV 连接
 */
export async function checkConnection(config: WebDAVConfig): Promise<{ success: boolean; message: string }> {
  try {
    // 验证 URL 格式
    if (!config.serverUrl) {
      return { success: false, message: '请输入服务器地址' };
    }

    // 验证协议
    const url = ensureHttps(config.serverUrl);
    if (!url.startsWith('https://')) {
      return { success: false, message: '为了安全，必须使用 HTTPS 协议' };
    }

    // 验证凭据
    if (!config.username || !config.password) {
      return { success: false, message: '请输入用户名和密码' };
    }

    // 尝试执行 PROPFIND 请求
    const propfindBody = '<?xml version="1.0" encoding="utf-8"?><propfind xmlns="DAV:"><prop><resourcetype/><getlastmodified/><getcontentlength/></prop></propfind>';
    const result = await sendRequest('PROPFIND', url, config, propfindBody, { 'Depth': '0' });

    if (result.status === 207) {
      return { success: true, message: '连接成功' };
    } else if (result.status === 401) {
      return { success: false, message: '认证失败，请检查用户名和密码' };
    } else if (result.status === 404) {
      return { success: true, message: '连接成功（目录为空）' };
    } else {
      return { success: false, message: `连接失败: HTTP ${result.status}` };
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return { success: false, message: '网络错误，请检查服务器地址' };
    }
    return { success: false, message: `连接失败: ${error instanceof Error ? error.message : '未知错误'}` };
  }
}

/**
 * 上传文件到 WebDAV
 */
export async function uploadFile(
  config: WebDAVConfig,
  content: string
): Promise<{ success: boolean; message: string }> {
  try {
    const url = getFileUrl(config);
    console.log('[WebDAV] Uploading to:', url);

    let result = await sendRequest('PUT', url, config, content);
    console.log('[WebDAV] Upload response:', result.status, result.body.substring(0, 200));

    // 如果 404，尝试创建目录后重试
    if (result.status === 404 || result.status === 409) {
      console.log('[WebDAV] File not found, trying to create directory...');
      const createResult = await createDirectory(config);
      console.log('[WebDAV] Create directory result:', createResult);

      if (createResult.success) {
        // 重试上传
        result = await sendRequest('PUT', url, config, content);
        console.log('[WebDAV] Retry upload response:', result.status);
      }
    }

    if (result.success || result.status === 201 || result.status === 204) {
      return { success: true, message: '上传成功' };
    } else if (result.status === 401) {
      return { success: false, message: '认证失败' };
    } else if (result.status === 404) {
      return { success: false, message: '上传失败: 目录不存在。坚果云请尝试在网页版创建文件夹，然后使用 https://dav.jianguoyun.com/dav/你的文件夹名/' };
    } else if (result.status === 409) {
      return { success: false, message: '上传失败: 无法创建目录，请检查服务器地址' };
    } else {
      return { success: false, message: `上传失败: HTTP ${result.status} - ${result.body.substring(0, 100)}` };
    }
  } catch (error) {
    return { success: false, message: `上传失败: ${error instanceof Error ? error.message : '未知错误'}` };
  }
}

/**
 * 从 WebDAV 下载文件
 */
export async function downloadFile(config: WebDAVConfig): Promise<{ success: boolean; content?: string; message: string }> {
  try {
    const url = getFileUrl(config);
    console.log('[WebDAV] Downloading from:', url);

    const result = await sendRequest('GET', url, config);
    console.log('[WebDAV] Download response:', result.status);

    if (result.status === 200) {
      return { success: true, content: result.body, message: '下载成功' };
    } else if (result.status === 401) {
      return { success: false, message: '认证失败' };
    } else if (result.status === 404) {
      return { success: false, message: '服务器上找不到同步文件（请先上传一次）' };
    } else {
      return { success: false, message: `下载失败: HTTP ${result.status}` };
    }
  } catch (error) {
    return { success: false, message: `下载失败: ${error instanceof Error ? error.message : '未知错误'}` };
  }
}

/**
 * 获取文件信息
 */
export async function getFileInfo(config: WebDAVConfig): Promise<WebDAVFileInfo & { message?: string }> {
  try {
    const url = getFileUrl(config);
    const result = await sendRequest('HEAD', url, config);

    if (result.status === 200) {
      const lastModified = result.headers['last-modified'];
      const size = parseInt(result.headers['content-length'] || '0', 10) || undefined;
      return {
        exists: true,
        lastModified,
        size,
      };
    } else if (result.status === 404) {
      return { exists: false };
    } else {
      return { exists: false, message: `获取文件信息失败: HTTP ${result.status}` };
    }
  } catch (error) {
    return { exists: false, message: `获取文件信息失败: ${error instanceof Error ? error.message : '未知错误'}` };
  }
}

/**
 * 加密 WebDAV 密码（用于 localStorage 存储）
 * 使用简单的 Base64，避免 XOR 产生的编码问题
 */
export function encryptWebDAVPassword(password: string): string {
  if (!password) return '';
  try {
    return btoa(password);
  } catch {
    return '';
  }
}

/**
 * 解密 WebDAV 密码
 */
export function decryptWebDAVPassword(encrypted: string): string {
  if (!encrypted) return '';
  try {
    return atob(encrypted);
  } catch {
    return '';
  }
}

export { SYNC_FILENAME };
