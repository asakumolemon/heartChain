import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 格式化日期
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 格式化时长
export function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(0);
  return `${minutes}m ${seconds}s`;
}

// 下载文件
export function downloadFile(content: string, filename: string, type: string = 'application/json'): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// 读取文件内容
export function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// 防抖函数
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// 节流函数
export function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// 复制到剪贴板
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

// 截断文本
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

// 状态颜色映射
export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending':
      return 'text-gray-500 bg-gray-100 border-gray-300';
    case 'running':
      return 'text-blue-500 bg-blue-100 border-blue-300';
    case 'streaming':
      return 'text-purple-500 bg-purple-100 border-purple-300';
    case 'completed':
      return 'text-green-500 bg-green-100 border-green-300';
    case 'failed':
      return 'text-red-500 bg-red-100 border-red-300';
    case 'cancelled':
      return 'text-gray-400 bg-gray-50 border-gray-200';
    default:
      return 'text-gray-500 bg-gray-100 border-gray-300';
  }
}

// 状态文本映射
export function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    pending: '等待执行',
    running: '执行中',
    streaming: '生成中',
    completed: '已完成',
    failed: '失败',
    cancelled: '已取消',
  };
  return statusMap[status] || status;
}

// 输入策略文本映射
export function getInputStrategyText(strategy: string): string {
  const strategyMap: Record<string, string> = {
    last_result: '上一步结果',
    original: '原始输入',
    original_with_context: '原始输入+上下文',
    cumulative: '累积结果',
  };
  return strategyMap[strategy] || strategy;
}

// 条件类型文本映射
export function getConditionTypeText(type: string): string {
  const typeMap: Record<string, string> = {
    contains: '包含',
    matches: '匹配正则',
    length_gt: '长度大于',
    equals: '等于',
  };
  return typeMap[type] || type;
}
