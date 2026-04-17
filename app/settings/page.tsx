"use client";

import { SettingsTabs } from "@/components/settings/SettingsTabs";

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">设置</h1>
        <p className="text-muted-foreground mt-1">
          管理供应商、模型和全局配置
        </p>
      </div>

      <SettingsTabs />
    </div>
  );
}
