'use client';

import { useState } from 'react';
import { ChainTemplate } from '@/types';
import { chainTemplates, getTemplateCategories } from '@/lib/templates';
import { generateId } from '@/lib/db';
import { Chain } from '@/types';
import { FileText, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TemplateSelectorProps {
  onSelect: (chain: Omit<Chain, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const categories = getTemplateCategories();

  const handleSelectTemplate = (template: ChainTemplate) => {
    const chain: Omit<Chain, 'id' | 'createdAt' | 'updatedAt'> = {
      name: template.chain.name,
      description: template.chain.description,
      steps: template.chain.steps.map((step) => ({
        ...step,
        id: generateId(),
      })),
      config: template.chain.config,
    };
    onSelect(chain);
  };

  const filteredTemplates = selectedCategory
    ? chainTemplates.filter((t) => t.category === selectedCategory)
    : chainTemplates;

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">从模板创建</h3>

      {/* 分类筛选 */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={cn(
            'px-3 py-1.5 text-sm rounded-full transition-colors',
            selectedCategory === null
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          全部
        </button>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={cn(
              'px-3 py-1.5 text-sm rounded-full transition-colors',
              selectedCategory === category
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {/* 模板列表 */}
      <div className="grid gap-3">
        {filteredTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => handleSelectTemplate(template)}
            className="flex items-start gap-3 p-4 text-left bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-gray-900">{template.name}</h4>
                <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                  {template.category}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{template.description}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                <span>{template.chain.steps.length} 个步骤</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </button>
        ))}
      </div>
    </div>
  );
}
