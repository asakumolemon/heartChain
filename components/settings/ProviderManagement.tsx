"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Trash2,
  Edit2,
  Key,
  Check,
  X,
  ExternalLink,
  Store,
  AlertCircle,
} from "lucide-react";
import { CustomProviderConfig, UserSettings, ProviderCategory } from "@/types";
import { getSettings, saveSettings, encryptApiKey, decryptApiKey, getModels } from "@/lib/db";
import { getModelCountByProvider } from "@/lib/db";

// 内置供应商配置
const BUILTIN_PROVIDERS = [
  {
    id: "openai",
    name: "OpenAI",
    description: "GPT 系列模型",
    website: "https://platform.openai.com",
    icon: "🤖",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    description: "Claude 系列模型",
    website: "https://console.anthropic.com",
    icon: "🧠",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    description: "国产大模型",
    website: "https://platform.deepseek.com",
    icon: "🔮",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    description: "统一 API 网关",
    website: "https://openrouter.ai",
    icon: "🌐",
  },
  {
    id: "gemini",
    name: "Gemini",
    description: "Google AI 模型",
    website: "https://ai.google.dev",
    icon: "💎",
  },
];

// API 格式选项
const API_FORMATS = [
  { value: "openai", label: "OpenAI 格式" },
  { value: "anthropic", label: "Anthropic 格式" },
  { value: "gemini", label: "Gemini 格式" },
  { value: "custom", label: "自定义格式" },
];

interface ProviderGroupItem {
  id: ProviderCategory;
  name: string;
  description: string;
}

const PROVIDER_GROUPS: ProviderGroupItem[] = [
  {
    id: "builtin",
    name: "内置供应商",
    description: "系统预设的主流 AI 服务商",
  },
  {
    id: "custom",
    name: "自定义供应商",
    description: "用户添加的第三方服务商",
  },
];

export function ProviderManagement() {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingCustomProvider, setEditingCustomProvider] = useState<CustomProviderConfig | null>(null);

  // 新自定义供应商表单
  const [newProvider, setNewProvider] = useState<Partial<CustomProviderConfig>>({
    name: "",
    apiKey: "",
    baseUrl: "",
    apiFormat: "openai",
    defaultModel: "",
    enabled: true,
  });

  useEffect(() => {
    setSettings(getSettings());
  }, []);

  const updateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // 切换内置供应商启用状态
  const toggleProvider = (providerId: string) => {
    if (!settings) return;
    const newSettings = { ...settings };
    if (!newSettings.providers) newSettings.providers = {};
    if (!newSettings.providers[providerId as keyof typeof newSettings.providers]) {
      (newSettings.providers as any)[providerId] = {
        enabled: false,
        apiKey: "",
        defaultModel: "",
      };
    }
    const provider = newSettings.providers[providerId as keyof typeof newSettings.providers] as any;
    provider.enabled = !provider.enabled;
    updateSettings(newSettings);
  };

  // 更新内置供应商 API Key
  const updateProviderApiKey = (providerId: string, apiKey: string) => {
    if (!settings) return;
    const newSettings = { ...settings };
    if (!newSettings.providers) newSettings.providers = {};
    if (!newSettings.providers[providerId as keyof typeof newSettings.providers]) {
      (newSettings.providers as any)[providerId] = {
        enabled: false,
        apiKey: "",
        defaultModel: "",
      };
    }
    const provider = newSettings.providers[providerId as keyof typeof newSettings.providers] as any;
    provider.apiKey = encryptApiKey(apiKey);
    updateSettings(newSettings);
  };

  // 更新内置供应商默认模型
  const updateProviderDefaultModel = (providerId: string, model: string) => {
    if (!settings) return;
    const newSettings = { ...settings };
    if (!newSettings.providers) newSettings.providers = {};
    if (!newSettings.providers[providerId as keyof typeof newSettings.providers]) {
      (newSettings.providers as any)[providerId] = {
        enabled: false,
        apiKey: "",
        defaultModel: "",
      };
    }
    const provider = newSettings.providers[providerId as keyof typeof newSettings.providers] as any;
    provider.defaultModel = model;
    updateSettings(newSettings);
  };

  // 添加自定义供应商
  const addCustomProvider = () => {
    if (!settings || !newProvider.name || !newProvider.baseUrl) return;

    const provider: CustomProviderConfig = {
      id: Date.now().toString(),
      name: newProvider.name,
      apiKey: encryptApiKey(newProvider.apiKey || ""),
      baseUrl: newProvider.baseUrl,
      apiFormat: newProvider.apiFormat as "openai" | "anthropic" | "gemini" | "custom",
      defaultModel: newProvider.defaultModel || "",
      enabled: newProvider.enabled ?? true,
    };

    const newSettings = { ...settings };
    if (!newSettings.providers.custom) {
      newSettings.providers.custom = [];
    }
    newSettings.providers.custom.push(provider);
    updateSettings(newSettings);

    // 重置表单
    setNewProvider({
      name: "",
      apiKey: "",
      baseUrl: "",
      apiFormat: "openai",
      defaultModel: "",
      enabled: true,
    });
    setIsAddDialogOpen(false);
  };

  // 更新自定义供应商
  const updateCustomProvider = () => {
    if (!settings || !editingCustomProvider) return;

    const newSettings = { ...settings };
    if (newSettings.providers.custom) {
      const index = newSettings.providers.custom.findIndex(
        (p) => p.id === editingCustomProvider.id
      );
      if (index !== -1) {
        newSettings.providers.custom[index] = editingCustomProvider;
        updateSettings(newSettings);
      }
    }
    setEditingCustomProvider(null);
  };

  // 删除自定义供应商
  const deleteCustomProvider = (providerId: string) => {
    if (!settings) return;
    const newSettings = { ...settings };
    if (newSettings.providers.custom) {
      newSettings.providers.custom = newSettings.providers.custom.filter(
        (p) => p.id !== providerId
      );
      updateSettings(newSettings);
    }
  };

  // 获取供应商配置
  const getProviderConfig = (providerId: string) => {
    if (!settings?.providers) return null;
    return settings.providers[providerId as keyof typeof settings.providers] as any;
  };

  // 获取供应商模型数量
  const getModelCount = (providerId: string) => {
    return getModelCountByProvider(providerId);
  };

  if (!settings) {
    return <div className="p-8 text-center">加载中...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 内置供应商 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5" />
                内置供应商
              </CardTitle>
              <CardDescription>{PROVIDER_GROUPS[0].description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {BUILTIN_PROVIDERS.map((provider) => {
            const config = getProviderConfig(provider.id);
            const isEnabled = config?.enabled ?? false;
            const isEditing = editingProvider === provider.id;
            const modelCount = getModelCount(provider.id);

            return (
              <div
                key={provider.id}
                className={`border rounded-lg p-4 transition-all ${
                  isEnabled ? "border-primary/50 bg-primary/5" : "border-border"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{provider.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{provider.name}</h4>
                        {isEnabled ? (
                          <Badge variant="default" className="text-xs">
                            已启用
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            未启用
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {provider.description} · {modelCount} 个模型
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingProvider(isEditing ? null : provider.id)}
                    >
                      {isEditing ? (
                        <X className="w-4 h-4" />
                      ) : (
                        <Edit2 className="w-4 h-4" />
                      )}
                    </Button>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={() => toggleProvider(provider.id)}
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-4 pt-4 border-t space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Key className="w-4 h-4" />
                          API Key
                        </Label>
                        <Input
                          type="password"
                          placeholder={`输入 ${provider.name} API Key`}
                          value={config?.apiKey ? decryptApiKey(config.apiKey) : ""}
                          onChange={(e) =>
                            updateProviderApiKey(provider.id, e.target.value)
                          }
                        />
                        <p className="text-xs text-muted-foreground">
                          您的 API Key 会被加密存储在本地
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label>默认模型</Label>
                        <Select
                          value={config?.defaultModel || ""}
                          onValueChange={(value) =>
                            updateProviderDefaultModel(provider.id, value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="选择默认模型" />
                          </SelectTrigger>
                          <SelectContent>
                            {getModels()
                              .filter((m) => m.providerId === provider.id && m.enabled)
                              .map((model) => (
                                <SelectItem key={model.id} value={model.name}>
                                  {model.displayName}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          从已启用的模型中选择
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={provider.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        前往 {provider.name} 控制台
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* 自定义供应商 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                自定义供应商
              </CardTitle>
              <CardDescription>{PROVIDER_GROUPS[1].description}</CardDescription>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              添加供应商
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {settings.providers.custom && settings.providers.custom.length > 0 ? (
            <div className="space-y-4">
              {settings.providers.custom.map((provider) => {
                const modelCount = getModelCount(provider.id);
                return (
                  <div
                    key={provider.id}
                    className={`border rounded-lg p-4 transition-all ${
                      provider.enabled
                        ? "border-primary/50 bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Store className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{provider.name}</h4>
                            {provider.enabled ? (
                              <Badge variant="default" className="text-xs">
                                已启用
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                未启用
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {provider.baseUrl} · {API_FORMATS.find(f => f.value === provider.apiFormat)?.label} · {modelCount} 个模型
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCustomProvider(provider)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCustomProvider(provider.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                        <Switch
                          checked={provider.enabled}
                          onCheckedChange={() => {
                            const newProvider = { ...provider, enabled: !provider.enabled };
                            setEditingCustomProvider(newProvider);
                            const newSettings = { ...settings };
                            const index = newSettings.providers.custom!.findIndex(
                              (p) => p.id === provider.id
                            );
                            if (index !== -1) {
                              newSettings.providers.custom![index] = newProvider;
                              updateSettings(newSettings);
                            }
                            setEditingCustomProvider(null);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Store className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>暂无自定义供应商</p>
              <p className="text-sm mt-1">点击上方按钮添加您的第一个自定义供应商</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 添加自定义供应商对话框 */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>添加自定义供应商</DialogTitle>
            <DialogDescription>
              配置第三方 AI 服务商的 API 连接信息
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>供应商名称</Label>
              <Input
                placeholder="例如：我的自定义 API"
                value={newProvider.name}
                onChange={(e) =>
                  setNewProvider({ ...newProvider, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Base URL</Label>
              <Input
                placeholder="例如：https://api.example.com/v1"
                value={newProvider.baseUrl}
                onChange={(e) =>
                  setNewProvider({ ...newProvider, baseUrl: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>API Key</Label>
              <Input
                type="password"
                placeholder="输入 API Key"
                value={newProvider.apiKey}
                onChange={(e) =>
                  setNewProvider({ ...newProvider, apiKey: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>API 格式</Label>
              <Select
                value={newProvider.apiFormat}
                onValueChange={(value) =>
                  setNewProvider({ ...newProvider, apiFormat: value as any })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {API_FORMATS.map((format) => (
                    <SelectItem key={format.value} value={format.value}>
                      {format.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>默认模型</Label>
              <Input
                placeholder="例如：gpt-4（可选）"
                value={newProvider.defaultModel}
                onChange={(e) =>
                  setNewProvider({ ...newProvider, defaultModel: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                添加供应商后，可在模型管理中关联模型并在此处选择
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="enabled"
                checked={newProvider.enabled}
                onCheckedChange={(checked) =>
                  setNewProvider({ ...newProvider, enabled: checked })
                }
              />
              <Label htmlFor="enabled">立即启用</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              取消
            </Button>
            <Button
              onClick={addCustomProvider}
              disabled={!newProvider.name || !newProvider.baseUrl}
            >
              添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑自定义供应商对话框 */}
      <Dialog
        open={!!editingCustomProvider}
        onOpenChange={(open) => !open && setEditingCustomProvider(null)}
      >
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>编辑供应商</DialogTitle>
            <DialogDescription>修改供应商配置信息</DialogDescription>
          </DialogHeader>
          {editingCustomProvider && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>供应商名称</Label>
                <Input
                  value={editingCustomProvider.name}
                  onChange={(e) =>
                    setEditingCustomProvider({
                      ...editingCustomProvider,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Base URL</Label>
                <Input
                  value={editingCustomProvider.baseUrl}
                  onChange={(e) =>
                    setEditingCustomProvider({
                      ...editingCustomProvider,
                      baseUrl: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>API Key</Label>
                <Input
                  type="password"
                  placeholder="输入新的 API Key（留空保持不变）"
                  onChange={(e) =>
                    setEditingCustomProvider({
                      ...editingCustomProvider,
                      apiKey: encryptApiKey(e.target.value),
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>API 格式</Label>
                <Select
                  value={editingCustomProvider.apiFormat}
                  onValueChange={(value) =>
                    setEditingCustomProvider({
                      ...editingCustomProvider,
                      apiFormat: value as any,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {API_FORMATS.map((format) => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>默认模型</Label>
                <Select
                  value={editingCustomProvider.defaultModel}
                  onValueChange={(value) =>
                    setEditingCustomProvider({
                      ...editingCustomProvider,
                      defaultModel: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择默认模型" />
                  </SelectTrigger>
                  <SelectContent>
                    {getModels()
                      .filter((m) => m.providerId === editingCustomProvider.id && m.enabled)
                      .map((model) => (
                        <SelectItem key={model.id} value={model.name}>
                          {model.displayName}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  从已启用的模型中选择
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCustomProvider(null)}>
              取消
            </Button>
            <Button onClick={updateCustomProvider}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProviderManagement;
