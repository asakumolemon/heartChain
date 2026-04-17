'use client';

import { useEffect, useState } from 'react';
import { Chain } from '@/types';
import { db } from '@/lib/db';
import { ChainCard } from '@/components/chain/ChainCard';
import { Plus, FileText } from 'lucide-react';
import Link from 'next/link';

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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
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
        <Link
          href="/chains/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          新建提示链
        </Link>
      </div>

      {/* 提示链列表 */}
      {chains.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-gray-200">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">还没有提示链</h3>
          <p className="text-gray-500 mb-4">创建您的第一个提示链，开始自动化 AI 工作流</p>
          <Link
            href="/chains/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            新建提示链
          </Link>
        </div>
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
