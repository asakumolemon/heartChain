'use client';

import { Chain } from '@/types';
import { formatDate } from '@/lib/utils';
import { Play, Edit, Trash2, History, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface ChainCardProps {
  chain: Chain;
  onDelete: () => void;
}

export function ChainCard({ chain, onDelete }: ChainCardProps) {
  return (
    <div className="bg-background border rounded-lg p-4 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
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

        <div className="flex items-center gap-0.5 sm:gap-1 ml-2 sm:ml-4">
          <Button variant="ghost" size="icon" asChild className="text-green-600 hover:text-green-600 hover:bg-green-50 h-10 w-10 sm:h-9 sm:w-9">
            <Link href={`/chains/${chain.id}/execute`} title="执行">
              <Play className="w-5 h-5 sm:w-4 sm:h-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="text-blue-600 hover:text-blue-600 hover:bg-blue-50 h-10 w-10 sm:h-9 sm:w-9">
            <Link href={`/chains/${chain.id}`} title="编辑">
              <Edit className="w-5 h-5 sm:w-4 sm:h-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} className="text-red-600 hover:text-red-600 hover:bg-red-50 h-10 w-10 sm:h-9 sm:w-9">
            <Trash2 className="w-5 h-5 sm:w-4 sm:h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
