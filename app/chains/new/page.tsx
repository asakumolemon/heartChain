'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Chain, Step } from '@/types';
import { db, generateId } from '@/lib/db';
import { StepEditor } from '@/components/chain/StepEditor';
import { Plus, Save, ArrowLeft, LayoutTemplate } from 'lucide-react';
import { TemplateSelector } from '@/components/chain/TemplateSelector';
import Link from 'next/link';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableStepEditor({
  step,
  index,
  onChange,
  onDelete,
}: {
  step: Step;
  index: number;
  onChange: (step: Step) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: step.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <StepEditor
        step={step}
        index={index}
        onChange={onChange}
        onDelete={onDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

export default function NewChainPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState<Step[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSteps((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        // 更新 order
        return newItems.map((item, index) => ({ ...item, order: index }));
      });
    }
  };

  const addStep = () => {
    const newStep: Step = {
      id: generateId(),
      name: `步骤 ${steps.length + 1}`,
      systemPrompt: '',
      inputStrategy: 'last_result',
      order: steps.length,
    };
    setSteps([...steps, newStep]);
  };

  const updateStep = (index: number, updatedStep: Step) => {
    const newSteps = [...steps];
    newSteps[index] = updatedStep;
    setSteps(newSteps);
  };

  const deleteStep = (index: number) => {
    const newSteps = steps.filter((_, i) => i !== index);
    // 重新计算 order
    setSteps(newSteps.map((step, i) => ({ ...step, order: i })));
  };

  const handleSelectTemplate = (templateChain: Omit<Chain, 'id' | 'createdAt' | 'updatedAt'>) => {
    setName(templateChain.name);
    setDescription(templateChain.description);
    setSteps(templateChain.steps.map((step) => ({ ...step, id: generateId() })));
    setShowTemplates(false);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      alert('请输入提示链名称');
      return;
    }

    if (steps.length === 0) {
      alert('请至少添加一个步骤');
      return;
    }

    // 验证每个步骤
    for (const step of steps) {
      if (!step.name.trim()) {
        alert('请为所有步骤填写名称');
        return;
      }
      if (!step.systemPrompt.trim()) {
        alert(`步骤 "${step.name}" 的系统提示词不能为空`);
        return;
      }
    }

    setIsSaving(true);

    try {
      const chain: Chain = {
        id: generateId(),
        name: name.trim(),
        description: description.trim(),
        steps: steps.map((step, index) => ({ ...step, order: index })),
        config: {
          maxRetries: 3,
          timeout: 30000,
          errorHandling: 'stop',
          debug: false,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.saveChain(chain);
      router.push('/');
    } catch (error) {
      console.error('Failed to save chain:', error);
      alert('保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* 返回按钮 */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        返回列表
      </Link>

      {/* 页面标题 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">新建提示链</h1>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 transition-colors"
        >
          <Save className="w-4 h-4" />
          {isSaving ? '保存中...' : '保存'}
        </button>
      </div>

      {/* 模板选择 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">快速开始</h2>
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <LayoutTemplate className="w-4 h-4" />
            {showTemplates ? '隐藏模板' : '使用模板'}
          </button>
        </div>

        {showTemplates && (
          <TemplateSelector onSelect={handleSelectTemplate} />
        )}
      </div>

      {/* 基本信息 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="输入提示链名称"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="输入提示链描述（可选）"
              rows={2}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* 步骤列表 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            步骤 ({steps.length})
          </h2>
          <button
            onClick={addStep}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
            添加步骤
          </button>
        </div>

        {steps.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
            <p className="text-gray-500">还没有步骤，点击上方按钮添加</p>
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={steps.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {steps.map((step, index) => (
                  <SortableStepEditor
                    key={step.id}
                    step={step}
                    index={index}
                    onChange={(updatedStep) => updateStep(index, updatedStep)}
                    onDelete={() => deleteStep(index)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
