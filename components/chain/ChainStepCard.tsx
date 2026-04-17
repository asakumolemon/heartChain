'use client';

import { StepResult } from '@/types';
import { getStatusColor, getStatusText } from '@/lib/utils';
import { Loader2, CheckCircle, XCircle, Clock, Zap, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const status = result?.status || 'pending';
  const statusColor = getStatusColor(status);
  const statusText = getStatusText(status);

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

  return (
    <div
      onClick={onClick}
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

        {/* 状态 */}
        <div className={cn('flex items-center gap-1.5 text-sm font-medium', statusColor.split(' ')[0])}>
          {getStatusIcon()}
          <span className="hidden sm:inline">{statusText}</span>
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
  );
}
