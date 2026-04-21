"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
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
  Brain,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from "lucide-react";
import { ModelConfig, CustomProviderConfig } from "@/types";
import {
  getModels,
  saveModels,
  addModel,
  updateModel,
  deleteModel,
  PRESET_MODELS,
  getSettings,
} from "@/lib/db";

// 预设模型选项（用于快速添加）
const PRESET_MODEL_OPTIONS = PRESET_MODELS.map(m => ({
  id: m.id,
  providerId: m.providerId,
  name: m.name,
  displayName: m.displayName,
  description: m.description,
  contextWindow: m.contextWindow,
  maxTokens: m.maxTokens,
}));

// 内置供应商选项
const BUILTIN_PROVIDERS = [
  { id: "openai", name: "OpenAI" },
  { id: "anthropic", name: "Anthropic" },
  { id: "deepseek", name: "DeepSeek" },
  { id: "openrouter", name: "OpenRouter" },
  { id: "gemini", name: "Gemini" },
];

export function ModelManagement() {
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [customProviders, setCustomProviders] = useState<CustomProviderConfig[]>([]);
  const [expandedProviders, setExpandedProviders] = useState<string[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingModel, setEditingModel] = useState<ModelConfig | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // 新模型表单
  const [newModel, setNewModel] = useState<Partial<ModelConfig>>({
    providerId: "",
    name: "",
    displayName: "",
    enabled: true,
    contextWindow: 128000,
    maxTokens: 4096,
    defaultTemperature: 0.7,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    description: "",
  });

  useEffect(() => {
    setModels(getModels());
    const settings = getSettings();
    setCustomProviders(settings.providers.custom || []);
  }, []);

  // 获取所有可用供应商选项
  const getAllProviders = () => {
    return [
      ...BUILTIN_PROVIDERS,
      ...customProviders.map((p) => ({ id: p.id, name: p.name })),
    ];
  };

  // 按供应商分组的模型
  const getGroupedModels = () => {
    const allProviders = getAllProviders();
    const groups: { provider: { id: string; name: string }; models: ModelConfig[] }[] = [];

    allProviders.forEach((provider) => {
      const providerModels = models.filter(
        (m) =>
          m.providerId === provider.id &&
          (m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            m.displayName.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      if (providerModels.length > 0) {
        groups.push({ provider, models: providerModels });
      }
    });

    return groups;
  };

  // 切换供应商展开状态
  const toggleProviderExpand = (providerId: string) => {
    setExpandedProviders((prev) =>
      prev.includes(providerId)
        ? prev.filter((id) => id !== providerId)
        : [...prev, providerId]
    );
  };

  // 切换模型启用状态
  const toggleModel = (modelId: string) => {
    const model = models.find((m) => m.id === modelId);
    if (model) {
      updateModel(modelId, { enabled: !model.enabled });
      setModels(getModels());
    }
  };

  // 添加新模型
  const handleAddModel = () => {
    if (!newModel.providerId || !newModel.name || !newModel.displayName) return;

    addModel({
      providerId: newModel.providerId,
      name: newModel.name,
      displayName: newModel.displayName,
      enabled: newModel.enabled ?? true,
      contextWindow: newModel.contextWindow ?? 128000,
      maxTokens: newModel.maxTokens ?? 4096,
      defaultTemperature: newModel.defaultTemperature ?? 0.7,
      topP: newModel.topP ?? 1,
      frequencyPenalty: newModel.frequencyPenalty ?? 0,
      presencePenalty: newModel.presencePenalty ?? 0,
      description: newModel.description || "",
    });

    setModels(getModels());
    setIsAddDialogOpen(false);
    setNewModel({
      providerId: "",
      name: "",
      displayName: "",
      enabled: true,
      contextWindow: 128000,
      maxTokens: 4096,
      defaultTemperature: 0.7,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
      description: "",
    });
  };

  // 保存编辑的模型
  const handleUpdateModel = () => {
    if (!editingModel) return;

    updateModel(editingModel.id, editingModel);
    setModels(getModels());
    setEditingModel(null);
  };

  // 删除模型
  const handleDeleteModel = (modelId: string) => {
    deleteModel(modelId);
    setModels(getModels());
  };

  // 重置为预设模型
  const handleResetModels = () => {
    if (confirm("确定要重置为预设模型吗？这将删除所有自定义模型。")) {
      saveModels([...PRESET_MODELS]);
      setModels(getModels());
    }
  };

  const groupedModels = getGroupedModels();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5" />
                模型管理
              </CardTitle>
              <CardDescription>管理所有 AI 模型配置</CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Input
                placeholder="搜索模型..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-48"
              />
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={handleResetModels} className="flex-1 sm:flex-none">
                  重置预设
                </Button>
                <Button onClick={() => setIsAddDialogOpen(true)} className="flex-1 sm:flex-none">
                  <Plus className="w-4 h-4 mr-2" />
                  添加模型
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {groupedModels.length > 0 ? (
            <div className="space-y-4">
              {groupedModels.map(({ provider, models: providerModels }) => (
                <div key={provider.id} className="border rounded-lg overflow-hidden">
                  <Button
                    variant="ghost"
                    className="w-full flex items-center justify-between p-4 h-auto hover:bg-muted/50"
                    onClick={() => toggleProviderExpand(provider.id)}
                  >
                    <div className="flex items-center gap-3">
                      {expandedProviders.includes(provider.id) ? (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronUp className="w-5 h-5 text-muted-foreground" />
                      )}
                      <span className="font-medium">{provider.name}</span>
                      <Badge variant="secondary" className="text-xs">
                        {providerModels.length} 个模型
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {providerModels.filter((m) => m.enabled).length} 个启用
                      </Badge>
                    </div>
                  </Button>

                  {expandedProviders.includes(provider.id) && (
                    <div className="p-4 space-y-3">
                      {providerModels.map((model) => (
                        <div
                          key={model.id}
                          className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border gap-3 transition-all ${
                            model.enabled
                              ? "border-primary/30 bg-primary/5"
                              : "border-border bg-muted/20"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Sparkles className="w-4 h-4 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium">{model.displayName}</span>
                                {model.isCustom && (
                                  <Badge variant="outline" className="text-xs">
                                    自定义
                                  </Badge>
                                )}
                                <Badge variant={model.enabled ? "default" : "secondary"} className="text-xs">
                                  {model.enabled ? "已启用" : "已禁用"}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground mt-1">
                                <span className="truncate max-w-[200px] sm:max-w-none">{model.name}</span>
                                {model.contextWindow && (
                                  <span className="shrink-0">· 上下文 {(model.contextWindow / 1000).toFixed(0)}K</span>
                                )}
                                {model.maxTokens && (
                                  <span className="shrink-0">· 最大 {(model.maxTokens / 1000).toFixed(0)}K tokens</span>
                                )}
                                {model.description && (
                                  <span className="truncate max-w-full">· {model.description}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2 shrink-0 self-end sm:self-auto">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setEditingModel(model)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            {model.isCustom && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleDeleteModel(model.id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            )}
                            <Switch
                              checked={model.enabled}
                              onCheckedChange={() => toggleModel(model.id)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>没有找到模型</p>
              <p className="text-sm mt-1">尝试调整搜索词或添加新模型</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 添加模型对话框 */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>添加模型</DialogTitle>
            <DialogDescription>配置新的 AI 模型</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>所属供应商</Label>
              <Select
                value={newModel.providerId}
                onValueChange={(value) =>
                  setNewModel({ ...newModel, providerId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择供应商" />
                </SelectTrigger>
                <SelectContent>
                  {getAllProviders().map((provider) => (
                    <SelectItem key={provider.id} value={provider.id}>
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 预设模型选择 */}
            <div className="space-y-2">
              <Label>选择预设模型</Label>
              <Select
                value={newModel.name || "custom"}
                onValueChange={(value) => {
                  if (value === "custom") {
                    setNewModel({
                      ...newModel,
                      name: "",
                      displayName: "",
                      description: "",
                      contextWindow: 128000,
                      maxTokens: 4096,
                    });
                  } else {
                    const preset = PRESET_MODEL_OPTIONS.find((m) => m.name === value);
                    if (preset) {
                      setNewModel({
                        ...newModel,
                        providerId: preset.providerId,
                        name: preset.name,
                        displayName: preset.displayName,
                        description: preset.description || "",
                        contextWindow: preset.contextWindow,
                        maxTokens: preset.maxTokens,
                      });
                    }
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择预设模型或自定义" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">📝 自定义模型</SelectItem>
                  {PRESET_MODEL_OPTIONS.filter(
                    (m) => !newModel.providerId || m.providerId === newModel.providerId
                  ).map((model) => (
                    <SelectItem key={model.id} value={model.name}>
                      <span className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs">[{model.providerId}]</span>
                        {model.displayName}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                选择预设模型自动填充参数，或选择"自定义"手动配置
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>模型 ID</Label>
                <Input
                  placeholder="例如：gpt-4"
                  value={newModel.name}
                  onChange={(e) =>
                    setNewModel({ ...newModel, name: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">API 调用使用的模型标识</p>
              </div>
              <div className="space-y-2">
                <Label>显示名称</Label>
                <Input
                  placeholder="例如：GPT-4"
                  value={newModel.displayName}
                  onChange={(e) =>
                    setNewModel({ ...newModel, displayName: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">界面上显示的友好名称</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>描述</Label>
              <Input
                placeholder="模型描述（可选）"
                value={newModel.description}
                onChange={(e) =>
                  setNewModel({ ...newModel, description: e.target.value })
                }
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>上下文窗口</Label>
                <Input
                  type="number"
                  placeholder="128000"
                  value={newModel.contextWindow}
                  onChange={(e) =>
                    setNewModel({
                      ...newModel,
                      contextWindow: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>最大 Tokens</Label>
                <Input
                  type="number"
                  placeholder="4096"
                  value={newModel.maxTokens}
                  onChange={(e) =>
                    setNewModel({
                      ...newModel,
                      maxTokens: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>默认温度</Label>
                  <span className="text-sm text-muted-foreground">
                    {newModel.defaultTemperature}
                  </span>
                </div>
                <Slider
                  value={[newModel.defaultTemperature ?? 0.7]}
                  min={0}
                  max={2}
                  step={0.1}
                  onValueChange={([value]) =>
                    setNewModel({ ...newModel, defaultTemperature: value })
                  }
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Top P</Label>
                  <span className="text-sm text-muted-foreground">{newModel.topP}</span>
                </div>
                <Slider
                  value={[newModel.topP ?? 1]}
                  min={0}
                  max={1}
                  step={0.05}
                  onValueChange={([value]) =>
                    setNewModel({ ...newModel, topP: value })
                  }
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>频率惩罚</Label>
                    <span className="text-sm text-muted-foreground">
                      {newModel.frequencyPenalty}
                    </span>
                  </div>
                  <Slider
                    value={[newModel.frequencyPenalty ?? 0]}
                    min={-2}
                    max={2}
                    step={0.1}
                    onValueChange={([value]) =>
                      setNewModel({ ...newModel, frequencyPenalty: value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>存在惩罚</Label>
                    <span className="text-sm text-muted-foreground">
                      {newModel.presencePenalty}
                    </span>
                  </div>
                  <Slider
                    value={[newModel.presencePenalty ?? 0]}
                    min={-2}
                    max={2}
                    step={0.1}
                    onValueChange={([value]) =>
                      setNewModel({ ...newModel, presencePenalty: value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="model-enabled"
                checked={newModel.enabled}
                onCheckedChange={(checked) =>
                  setNewModel({ ...newModel, enabled: checked })
                }
              />
              <Label htmlFor="model-enabled">立即启用</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              取消
            </Button>
            <Button
              onClick={handleAddModel}
              disabled={!newModel.providerId || !newModel.name || !newModel.displayName}
            >
              添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑模型对话框 */}
      <Dialog
        open={!!editingModel}
        onOpenChange={(open) => !open && setEditingModel(null)}
      >
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑模型</DialogTitle>
            <DialogDescription>修改模型配置参数</DialogDescription>
          </DialogHeader>
          {editingModel && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>所属供应商</Label>
                <Select
                  value={editingModel.providerId}
                  onValueChange={(value) =>
                    setEditingModel({ ...editingModel, providerId: value })
                  }
                  disabled={!editingModel.isCustom}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getAllProviders().map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!editingModel.isCustom && (
                  <p className="text-xs text-muted-foreground">预设模型的供应商不可修改</p>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>模型 ID</Label>
                  <Input
                    value={editingModel.name}
                    onChange={(e) =>
                      setEditingModel({ ...editingModel, name: e.target.value })
                    }
                    disabled={!editingModel.isCustom}
                  />
                </div>
                <div className="space-y-2">
                  <Label>显示名称</Label>
                  <Input
                    value={editingModel.displayName}
                    onChange={(e) =>
                      setEditingModel({
                        ...editingModel,
                        displayName: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>描述</Label>
                <Input
                  value={editingModel.description || ""}
                  onChange={(e) =>
                    setEditingModel({ ...editingModel, description: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>上下文窗口</Label>
                  <Input
                    type="number"
                    value={editingModel.contextWindow || ""}
                    onChange={(e) =>
                      setEditingModel({
                        ...editingModel,
                        contextWindow: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>最大 Tokens</Label>
                  <Input
                    type="number"
                    value={editingModel.maxTokens || ""}
                    onChange={(e) =>
                      setEditingModel({
                        ...editingModel,
                        maxTokens: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>默认温度</Label>
                    <span className="text-sm text-muted-foreground">
                      {editingModel.defaultTemperature}
                    </span>
                  </div>
                  <Slider
                    value={[editingModel.defaultTemperature ?? 0.7]}
                    min={0}
                    max={2}
                    step={0.1}
                    onValueChange={([value]) =>
                      setEditingModel({ ...editingModel, defaultTemperature: value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Top P</Label>
                    <span className="text-sm text-muted-foreground">
                      {editingModel.topP ?? 1}
                    </span>
                  </div>
                  <Slider
                    value={[editingModel.topP ?? 1]}
                    min={0}
                    max={1}
                    step={0.05}
                    onValueChange={([value]) =>
                      setEditingModel({ ...editingModel, topP: value })
                    }
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>频率惩罚</Label>
                      <span className="text-sm text-muted-foreground">
                        {editingModel.frequencyPenalty ?? 0}
                      </span>
                    </div>
                    <Slider
                      value={[editingModel.frequencyPenalty ?? 0]}
                      min={-2}
                      max={2}
                      step={0.1}
                      onValueChange={([value]) =>
                        setEditingModel({ ...editingModel, frequencyPenalty: value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>存在惩罚</Label>
                      <span className="text-sm text-muted-foreground">
                        {editingModel.presencePenalty ?? 0}
                      </span>
                    </div>
                    <Slider
                      value={[editingModel.presencePenalty ?? 0]}
                      min={-2}
                      max={2}
                      step={0.1}
                      onValueChange={([value]) =>
                        setEditingModel({ ...editingModel, presencePenalty: value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingModel(null)}>
              取消
            </Button>
            <Button onClick={handleUpdateModel}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ModelManagement;
