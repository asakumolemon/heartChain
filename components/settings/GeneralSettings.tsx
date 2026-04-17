"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  Palette,
  Globe,
  Database,
  Trash2,
  Download,
  Upload,
  AlertTriangle,
} from "lucide-react";
import { UserSettings } from "@/types";
import { getSettings, saveSettings, db, migrateModels } from "@/lib/db";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

export function GeneralSettings() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [exportData, setExportData] = useState<string>("");
  const [importData, setImportData] = useState<string>("");

  useEffect(() => {
    const loaded = getSettings();
    setSettings(loaded);
    // 确保模型数据已迁移
    migrateModels();
  }, []);

  const updateSettings = (updates: Partial<UserSettings>) => {
    if (!settings) return;
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // 导出数据
  const handleExport = async () => {
    try {
      const data = await db.exportAll();
      const json = JSON.stringify(data, null, 2);
      setExportData(json);

      // 创建下载
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `promptchain-backup-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("数据导出成功");
    } catch (error) {
      toast.error("导出失败");
      console.error(error);
    }
  };

  // 导入数据
  const handleImport = async () => {
    try {
      const data = JSON.parse(importData);
      await db.importAll(data);
      setImportData("");
      toast.success("数据导入成功，页面将刷新");
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      toast.error("导入失败，请检查数据格式");
      console.error(error);
    }
  };

  // 清理所有数据
  const handleClearAll = async () => {
    try {
      await db.chains.clear();
      await db.executions.clear();
      localStorage.removeItem("promptchain_settings");
      setIsClearDialogOpen(false);
      toast.success("所有数据已清理，页面将刷新");
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      toast.error("清理失败");
      console.error(error);
    }
  };

  if (!settings) {
    return <div className="p-8 text-center">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 外观设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            外观设置
          </CardTitle>
          <CardDescription>自定义界面主题和语言</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>主题</Label>
              <Select
                value={settings.theme}
                onValueChange={(value: "light" | "dark" | "system") =>
                  updateSettings({ theme: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">浅色</SelectItem>
                  <SelectItem value="dark">深色</SelectItem>
                  <SelectItem value="system">跟随系统</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>语言</Label>
              <Select
                value={settings.language}
                onValueChange={(value: "zh" | "en") =>
                  updateSettings({ language: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zh">简体中文</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 默认参数 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            默认参数
          </CardTitle>
          <CardDescription>设置全局默认的模型参数</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>默认供应商</Label>
              <Select
                value={settings.defaultProvider}
                onValueChange={(value) => updateSettings({ defaultProvider: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                  <SelectItem value="deepseek">DeepSeek</SelectItem>
                  <SelectItem value="openrouter">OpenRouter</SelectItem>
                  <SelectItem value="gemini">Gemini</SelectItem>
                  {settings.providers.custom?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>默认模型</Label>
              <Input
                value={settings.defaultModel}
                onChange={(e) => updateSettings({ defaultModel: e.target.value })}
                placeholder="例如：gpt-4"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>默认温度</Label>
                <span className="text-sm text-muted-foreground">
                  {settings.defaultTemperature}
                </span>
              </div>
              <Slider
                value={[settings.defaultTemperature]}
                min={0}
                max={2}
                step={0.1}
                onValueChange={([value]) =>
                  updateSettings({ defaultTemperature: value })
                }
              />
              <p className="text-xs text-muted-foreground">
                较低的值使输出更确定，较高的值使输出更随机
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>默认最大 Tokens</Label>
                <span className="text-sm text-muted-foreground">
                  {settings.maxTokens}
                </span>
              </div>
              <Slider
                value={[settings.maxTokens]}
                min={256}
                max={8192}
                step={256}
                onValueChange={([value]) => updateSettings({ maxTokens: value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 数据管理 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            数据管理
          </CardTitle>
          <CardDescription>备份和恢复您的数据</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 导出 */}
          <div className="space-y-2">
            <Label>导出数据</Label>
            <p className="text-sm text-muted-foreground">
              将所有提示链、执行记录和设置导出为 JSON 文件
            </p>
            <Button onClick={handleExport} variant="outline" className="w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" />
              导出备份
            </Button>
          </div>

          {/* 导入 */}
          <div className="space-y-2 pt-4 border-t">
            <Label>导入数据</Label>
            <p className="text-sm text-muted-foreground">
              从备份文件恢复数据，这将覆盖当前所有数据
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="粘贴备份 JSON 数据..."
                value={importData}
                onChange={(e) => setImportData(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={handleImport}
                disabled={!importData.trim()}
                variant="outline"
              >
                <Upload className="w-4 h-4 mr-2" />
                导入
              </Button>
            </div>
          </div>

          {/* 清理数据 */}
          <div className="space-y-2 pt-4 border-t">
            <Label className="text-destructive">危险区域</Label>
            <p className="text-sm text-muted-foreground">
              清除所有本地数据，此操作不可恢复
            </p>
            <Button
              variant="destructive"
              onClick={() => setIsClearDialogOpen(true)}
              className="w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              清除所有数据
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 关于 */}
      <Card>
        <CardHeader>
          <CardTitle>关于</CardTitle>
          <CardDescription>应用信息</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">版本</span>
            <span>1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">数据版本</span>
            <span>{settings.dataVersion}</span>
          </div>
        </CardContent>
      </Card>

      {/* 清理确认对话框 */}
      <Dialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              确认清除所有数据？
            </DialogTitle>
            <DialogDescription>
              此操作将永久删除所有提示链、执行记录和设置，无法恢复。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsClearDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleClearAll}>
              确认清除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default GeneralSettings;
