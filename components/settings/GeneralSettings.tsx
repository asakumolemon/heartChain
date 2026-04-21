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
  Cloud,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { UserSettings, WebDAVConfig } from "@/types";
import { getSettings, saveSettings, db, migrateModels, getModels } from "@/lib/db";
import { checkConnection, encryptWebDAVPassword, decryptWebDAVPassword } from "@/lib/webdav";
import { syncToWebDAV, syncFromWebDAV, formatLastSync } from "@/lib/sync-service";
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
  const [availableModels, setAvailableModels] = useState<Array<{ id: string; name: string; displayName: string }>>([]);

  // WebDAV 状态
  const [webdavConfig, setWebdavConfig] = useState<WebDAVConfig>({
    enabled: false,
    serverUrl: "",
    username: "",
    password: "",
    syncExecutions: false,
  });
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: "" });

  useEffect(() => {
    const loaded = getSettings();
    setSettings(loaded);
    // 确保模型数据已迁移
    migrateModels();
    // 加载可用模型
    loadAvailableModels(loaded.defaultProvider);
    // 加载 WebDAV 配置
    if (loaded.webdav) {
      setWebdavConfig({
        ...loaded.webdav,
        password: loaded.webdav.password ? decryptWebDAVPassword(loaded.webdav.password) : "",
      });
    }
  }, []);

  // 加载指定供应商的可用模型
  const loadAvailableModels = (providerId: string) => {
    const models = getModels().filter(
      (m) => m.providerId === providerId && m.enabled
    );
    setAvailableModels(
      models.map((m) => ({ id: m.id, name: m.name, displayName: m.displayName }))
    );
  };

  // 更新供应商时同时更新可用模型
  const handleProviderChange = (providerId: string) => {
    updateSettings({ defaultProvider: providerId, defaultModel: "" });
    loadAvailableModels(providerId);
  };

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

  // 更新 WebDAV 配置
  const updateWebDAVConfig = (updates: Partial<WebDAVConfig>) => {
    const newConfig = { ...webdavConfig, ...updates };
    setWebdavConfig(newConfig);

    // 保存到设置（密码加密）
    const settings = getSettings();
    settings.webdav = {
      ...newConfig,
      password: newConfig.password ? encryptWebDAVPassword(newConfig.password) : "",
    };
    saveSettings(settings);
  };

  // 测试 WebDAV 连接
  const handleTestConnection = async () => {
    setIsTestingConnection(true);
    setConnectionStatus({ type: null, message: "" });

    // webdavConfig 中的密码已经是明文，直接传递
    const result = await checkConnection(webdavConfig);

    setConnectionStatus({
      type: result.success ? 'success' : 'error',
      message: result.message,
    });

    setIsTestingConnection(false);
  };

  // 同步到 WebDAV
  const handleSyncToWebDAV = async () => {
    setIsSyncing(true);
    const result = await syncToWebDAV(webdavConfig);

    if (result.success) {
      toast.success(result.message);
      // 更新最后同步时间显示
      const settings = getSettings();
      if (settings.webdav) {
        setWebdavConfig(prev => ({ ...prev, lastSyncAt: settings.webdav?.lastSyncAt }));
      }
    } else {
      toast.error(result.message);
    }

    setIsSyncing(false);
  };

  // 从 WebDAV 同步
  const handleSyncFromWebDAV = async () => {
    setIsSyncing(true);
    const result = await syncFromWebDAV(webdavConfig);

    if (result.success) {
      toast.success(result.message);
      setTimeout(() => window.location.reload(), 1500);
    } else {
      toast.error(result.message);
    }

    setIsSyncing(false);
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
                onValueChange={handleProviderChange}
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
              <Select
                value={settings.defaultModel}
                onValueChange={(value) => updateSettings({ defaultModel: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择默认模型" />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.length > 0 ? (
                    availableModels.map((model) => (
                      <SelectItem key={model.id} value={model.name}>
                        {model.displayName}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      该供应商暂无可用模型
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                请先选择供应商，然后从该供应商的可用模型中选择
              </p>
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

      {/* WebDAV 同步 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            WebDAV 同步
          </CardTitle>
          <CardDescription>将数据同步到 WebDAV 服务器</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 服务器配置 */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>服务器地址</Label>
              <Input
                placeholder="https://example.com/dav"
                value={webdavConfig.serverUrl}
                onChange={(e) => updateWebDAVConfig({ serverUrl: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                支持 Nextcloud、ownCloud、坚果云等 WebDAV 服务
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>用户名</Label>
                <Input
                  placeholder="用户名"
                  value={webdavConfig.username}
                  onChange={(e) => updateWebDAVConfig({ username: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>密码</Label>
                <Input
                  type="password"
                  placeholder="密码"
                  value={webdavConfig.password}
                  onChange={(e) => updateWebDAVConfig({ password: e.target.value })}
                />
              </div>
            </div>

            {/* 同步选项 */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <Label className="text-sm font-medium">同步执行记录</Label>
                <p className="text-xs text-muted-foreground">
                  包含提示链的执行历史（可能增加同步时间）
                </p>
              </div>
              <input
                type="checkbox"
                checked={webdavConfig.syncExecutions}
                onChange={(e) => updateWebDAVConfig({ syncExecutions: e.target.checked })}
                className="w-4 h-4 rounded border-gray-300"
              />
            </div>
          </div>

          {/* 连接测试 */}
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={isTestingConnection || !webdavConfig.serverUrl}
              className="w-full sm:w-auto"
            >
              {isTestingConnection ? "测试中..." : "测试连接"}
            </Button>
            {connectionStatus.type && (
              <div className={`flex items-center gap-1 text-sm ${connectionStatus.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {connectionStatus.type === 'success' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                {connectionStatus.message}
              </div>
            )}
          </div>

          {/* 同步按钮 */}
          <div className="pt-4 border-t space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleSyncToWebDAV}
                disabled={isSyncing || !webdavConfig.serverUrl}
                variant="outline"
                className="flex-1 sm:flex-none"
              >
                <Upload className="w-4 h-4 mr-2" />
                {isSyncing ? "同步中..." : "上传到 WebDAV"}
              </Button>
              <Button
                onClick={handleSyncFromWebDAV}
                disabled={isSyncing || !webdavConfig.serverUrl}
                variant="outline"
                className="flex-1 sm:flex-none"
              >
                <Download className="w-4 h-4 mr-2" />
                从 WebDAV 恢复
              </Button>
            </div>

            {/* 上次同步时间 */}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">上次同步</span>
              <span>{formatLastSync(webdavConfig.lastSyncAt)}</span>
            </div>
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
