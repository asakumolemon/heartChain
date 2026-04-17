'use client';

import { ProviderConfig } from '@/components/settings/ProviderConfig';
import { ExportImport } from '@/components/settings/ExportImport';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">设置</h1>
        <p className="text-gray-500 mt-1">配置 AI 服务提供商和数据管理</p>
      </div>

      <div className="space-y-8">
        <ProviderConfig />
        <ExportImport />
      </div>
    </div>
  );
}
