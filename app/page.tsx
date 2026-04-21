'use client';

import { useEffect, useState } from 'react';
import { Chain } from '@/types';
import { db } from '@/lib/db';
import { ChainCard } from '@/components/chain/ChainCard';
import { Plus, FileText, ListPlus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChainCardSkeleton } from '@/components/chain/ChainCardSkeleton';
import { EmptyState } from '@/components/empty-state';

export default function HomePage() {
  const [chains, setChains] = useState<Chain[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChains();
  }, []);

  const loadChains = async () => {
    try {
      const data = await db.getChains();
      setChains(data);
    } catch (error) {
      console.error('Failed to load chains:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要删除这个提示链吗？相关执行记录也会被删除。')) {
      return;
    }

    try {
      await db.deleteChain(id);
      await loadChains();
    } catch (error) {
      console.error('Failed to delete chain:', error);
      alert('删除失败');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <ChainCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">提示链</h1>
          <p className="text-gray-500 mt-1">管理和执行您的 AI 提示链工作流</p>
        </div>
        <Button asChild>
          <Link href="/chains/new">
            <Plus className="w-4 h-4" />
            新建提示链
          </Link>
        </Button>
      </div>

      {/* 提示链列表 */}
      {chains.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="还没有提示链"
          description="创建您的第一个提示链，开始自动化 AI 工作流。提示链可以将复杂任务分解为多个步骤执行。"
          action={{ label: "新建提示链", href: "/chains/new" }}
        />
      ) : (
        <div className="grid gap-4">
          {chains.map((chain) => (
            <ChainCard
              key={chain.id}
              chain={chain}
              onDelete={() => handleDelete(chain.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
