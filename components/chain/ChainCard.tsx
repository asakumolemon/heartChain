'use client';

import { Chain } from '@/types';
import { formatDate } from '@/lib/utils';
import { Play, Edit, Trash2, History, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface ChainCardProps {
  chain: Chain;
  onDelete: () => void;
}

export function ChainCard({ chain, onDelete }: ChainCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{chain.name}</h3>
          {chain.description && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{chain.description}</p>
          )}
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
            <span>{chain.steps.length} 个步骤</span>
            <span>更新于 {formatDate(chain.updatedAt)}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 ml-2 sm:ml-4">
          <Link
            href={`/chains/${chain.id}/execute`}
            className="p-2 sm:p-2.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            title="执行"
          >
            <Play className="w-5 h-5 sm:w-4 sm:h-4" />
          </Link>
          <Link
            href={`/chains/${chain.id}`}
            className="p-2 sm:p-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="编辑"
          >
            <Edit className="w-5 h-5 sm:w-4 sm:h-4" />
          </Link>
          <button
            onClick={onDelete}
            className="p-2 sm:p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="删除"
          >
            <Trash2 className="w-5 h-5 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
