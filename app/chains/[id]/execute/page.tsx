'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Chain } from '@/types';
import { db } from '@/lib/db';
import { ChainExecutionContainer } from '@/components/chain/ChainExecutionContainer';
import { ArrowLeft, Settings, History } from 'lucide-react';
import Link from 'next/link';

export default function ExecuteChainPage() {
  const params = useParams();
  const chainId = params.id as string;

  const [chain, setChain] = useState<Chain | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChain();
  }, [chainId]);

  const loadChain = async () => {
    try {
      const data = await db.getChain(chainId);
      if (data) {
        setChain(data);
      }
    } catch (error) {
      console.error('Failed to load chain:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!chain) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-semibold text-gray-900">提示链不存在</h2>
        <Link href="/" className="text-blue-500 hover:text-blue-600 mt-4 inline-block">
          返回首页
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 导航栏 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{chain.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/chains/${chainId}`}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Settings className="w-4 h-4" />
            编辑
          </Link>
        </div>
      </div>

      {/* 描述 */}
      {chain.description && (
        <p className="text-gray-600 mb-6">{chain.description}</p>
      )}

      {/* 执行容器 */}
      <ChainExecutionContainer chain={chain} />
    </div>
  );
}
