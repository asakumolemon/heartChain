'use client';

import { useState } from 'react';
import { StepResult } from '@/types';
import { getStatusColor, getStatusText } from '@/lib/utils';
import { Loader2, CheckCircle, XCircle, Clock, Zap, AlertCircle, Eye, X, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ChainStepCardProps {
  stepNumber: number;
  stepName: string;
  result?: StepResult;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}

export function ChainStepCard({
  stepNumber,
  stepName,
  result,
  isActive,
  onClick,
  className,
}: ChainStepCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const status = result?.status || 'pending';
  const statusColor = getStatusColor(status);
  const statusText = getStatusText(status);

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'running':
        return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'streaming':
        return <Zap className="w-4 h-4 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleCardClick = () => {
    if (result && (status === 'completed' || status === 'failed' || status === 'streaming')) {
      setIsDetailOpen(true);
    }
    onClick?.();
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className={cn(
          'rounded-lg border-2 p-4 transition-all duration-300',
          'hover:shadow-md cursor-pointer',
          isActive && 'ring-2 ring-offset-2 ring-blue-500',
          status === 'pending' && 'opacity-70 border-gray-200 bg-gray-50',
          status === 'running' && 'border-blue-400 bg-blue-50',
          status === 'streaming' && 'border-purple-400 bg-purple-50 animate-pulse',
          status === 'completed' && 'border-green-400 bg-green-50',
          status === 'failed' && 'border-red-400 bg-red-50',
          className
        )}
      >
        <div className="flex items-center gap-3">
          {/* 步骤编号 */}
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm',
              status === 'pending' && 'bg-gray-200 text-gray-600',
              status === 'running' && 'bg-blue-500 text-white',
              status === 'streaming' && 'bg-purple-500 text-white',
              status === 'completed' && 'bg-green-500 text-white',
              status === 'failed' && 'bg-red-500 text-white'
            )}
          >
            {stepNumber}
          </div>

          {/* 步骤信息 */}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 truncate">{stepName}</div>
            {result?.output && status === 'completed' && (
              <div className="text-sm text-gray-500 truncate mt-1">
                {result.output.slice(0, 100)}...
              </div>
            )}
            {result?.partialOutput && status === 'streaming' && (
              <div className="text-sm text-purple-600 truncate mt-1">
                {result.partialOutput.slice(0, 100)}...
              </div>
            )}
            {result?.error && status === 'failed' && (
              <div className="text-sm text-red-500 truncate mt-1">{result.error}</div>
            )}
          </div>

          {/* 状态和查看按钮 */}
          <div className="flex items-center gap-2">
            {(status === 'completed' || status === 'failed' || status === 'streaming') && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDetailOpen(true);
                }}
              >
                <Eye className="w-4 h-4" />
              </Button>
            )}
            <div className={cn('flex items-center gap-1.5 text-sm font-medium', statusColor.split(' ')[0])}>
              {getStatusIcon()}
              <span className="hidden sm:inline">{statusText}</span>
            </div>
          </div>
        </div>

        {/* 流式内容预览 */}
        {status === 'streaming' && result?.partialOutput && (
          <div className="mt-3 p-3 bg-white/50 rounded border border-purple-200">
            <div className="text-sm text-gray-700 whitespace-pre-wrap">
              {result.partialOutput}
            </div>
          </div>
        )}
      </div>

      {/* 详情弹窗 */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-3xl max-h-[85vh] overflow-y-auto overflow-x-hidden p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <span
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm',
                  status === 'completed' && 'bg-green-500 text-white',
                  status === 'failed' && 'bg-red-500 text-white',
                  status === 'streaming' && 'bg-purple-500 text-white'
                )}
              >
                {stepNumber}
              </span>
              <span>{stepName}</span>
              <Badge
                variant={
                  status === 'completed'
                    ? 'default'
                    : status === 'failed'
                    ? 'destructive'
                    : 'secondary'
                }
              >
                {statusText}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* 执行信息 */}
            {(result?.tokensUsed || result?.durationMs) && (
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                {result.tokensUsed && (
                  <span>Tokens: {result.tokensUsed.toLocaleString()}</span>
                )}
                {result.durationMs && (
                  <span>耗时: {(result.durationMs / 1000).toFixed(2)}s</span>
                )}
                {result.startedAt && (
                  <span>开始: {new Date(result.startedAt).toLocaleTimeString()}</span>
                )}
                {result.completedAt && (
                  <span>结束: {new Date(result.completedAt).toLocaleTimeString()}</span>
                )}
              </div>
            )}

            {/* 发送的消息 */}
            {(result?.promptRendered || result?.input) && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm text-muted-foreground">发送的消息</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        `System:\n${result.promptRendered || ''}\n\nUser:\n${result.input || ''}`,
                        'request'
                      )
                    }
                    className="h-7 gap-1 text-xs"
                  >
                    {copiedSection === 'request' ? (
                      <>
                        <Check className="w-3 h-3" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        复制
                      </>
                    )}
                  </Button>
                </div>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg space-y-3 overflow-hidden">
                  {result.promptRendered && (
                    <div>
                      <div className="text-xs text-blue-600 font-medium mb-1">System</div>
                      <pre className="text-sm whitespace-pre-wrap break-all font-mono text-gray-800">
                        {result.promptRendered}
                      </pre>
                    </div>
                  )}
                  {result.input && (
                    <div className={cn("pt-3", result.promptRendered && "border-t border-blue-200")}>
                      <div className="text-xs text-blue-600 font-medium mb-1">User</div>
                      <pre className="text-sm whitespace-pre-wrap break-all font-mono text-gray-800">
                        {result.input}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 输出内容 */}
            {(result?.output || result?.partialOutput) && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm text-muted-foreground">接收到的输出</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(result.output || result.partialOutput || '', 'response')
                    }
                    className="h-7 gap-1 text-xs"
                  >
                    {copiedSection === 'response' ? (
                      <>
                        <Check className="w-3 h-3" />
                        已复制
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        复制
                      </>
                    )}
                  </Button>
                </div>
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg overflow-hidden">
                  <pre className="text-sm whitespace-pre-wrap break-all font-mono text-gray-800">
                    {result.output || result.partialOutput}
                  </pre>
                </div>
              </div>
            )}

            {/* 错误信息 */}
            {result?.error && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-destructive">错误</h4>
                <div className="bg-destructive/10 border border-destructive/20 p-4 rounded-lg overflow-hidden">
                  <pre className="text-sm whitespace-pre-wrap break-all font-mono text-destructive">
                    {result.error}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
