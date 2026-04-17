"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Store, Brain, Settings } from "lucide-react";
import ProviderManagement from "./ProviderManagement";
import ModelManagement from "./ModelManagement";
import GeneralSettings from "./GeneralSettings";

export function SettingsTabs() {
  const [activeTab, setActiveTab] = useState("providers");

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="providers" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3">
          <Store className="w-4 h-4" />
          <span className="hidden sm:inline">供应商管理</span>
          <span className="sm:hidden text-xs">供应商</span>
        </TabsTrigger>
        <TabsTrigger value="models" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3">
          <Brain className="w-4 h-4" />
          <span className="hidden sm:inline">模型管理</span>
          <span className="sm:hidden text-xs">模型</span>
        </TabsTrigger>
        <TabsTrigger value="general" className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3">
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">全局设置</span>
          <span className="sm:hidden text-xs">设置</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="providers" className="mt-0">
        <ProviderManagement />
      </TabsContent>

      <TabsContent value="models" className="mt-0">
        <ModelManagement />
      </TabsContent>

      <TabsContent value="general" className="mt-0">
        <GeneralSettings />
      </TabsContent>
    </Tabs>
  );
}

export default SettingsTabs;
