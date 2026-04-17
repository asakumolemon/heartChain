import { ChainTemplate } from '@/types';

export const chainTemplates: ChainTemplate[] = [
  {
    id: 'article-writing',
    name: '文章创作流程',
    description: '从主题分析到文章润色的完整写作流程',
    category: '写作',
    chain: {
      name: '文章创作流程',
      description: '将写作任务分解为分析、大纲、撰写、润色四个步骤',
      steps: [
        {
          id: 'step-1',
          name: '主题分析',
          systemPrompt: '请分析以下主题的关键角度和核心要点，列出3-5个主要讨论方向：\n\n主题：{input}',
          inputStrategy: 'original',
          order: 0,
        },
        {
          id: 'step-2',
          name: '大纲生成',
          systemPrompt: '基于以下主题分析，生成一份详细的文章大纲，包含标题、各段落主题和要点：\n\n{input}',
          inputStrategy: 'last_result',
          order: 1,
        },
        {
          id: 'step-3',
          name: '内容撰写',
          systemPrompt: '根据以下大纲撰写完整的文章内容，要求语言流畅、逻辑清晰：\n\n大纲：{input}\n\n原始主题：{original_input}',
          inputStrategy: 'cumulative',
          order: 2,
        },
        {
          id: 'step-4',
          name: '润色优化',
          systemPrompt: '请对以下文章进行润色优化，提升语言表达和可读性：\n\n{input}',
          inputStrategy: 'last_result',
          order: 3,
        },
      ],
      config: {
        maxRetries: 3,
        timeout: 60000,
        errorHandling: 'stop',
        debug: false,
      },
    },
  },
  {
    id: 'code-review',
    name: '代码审查流程',
    description: '全面的代码审查，包括语法、逻辑和优化建议',
    category: '开发',
    chain: {
      name: '代码审查流程',
      description: '多步骤代码审查：语法检查 -> 逻辑分析 -> 优化建议 -> 生成报告',
      steps: [
        {
          id: 'step-1',
          name: '语法检查',
          systemPrompt: '请检查以下代码的语法错误和潜在问题：\n\n```\n{input}\n```\n\n列出所有发现的问题。',
          inputStrategy: 'original',
          order: 0,
        },
        {
          id: 'step-2',
          name: '逻辑分析',
          systemPrompt: '分析以下代码的逻辑是否合理，是否存在潜在的逻辑漏洞或边界情况问题：\n\n```\n{input}\n```',
          inputStrategy: 'original',
          order: 1,
        },
        {
          id: 'step-3',
          name: '优化建议',
          systemPrompt: '基于以上分析，给出代码的性能优化和改进建议：\n\n分析结果：\n{history}',
          inputStrategy: 'cumulative',
          order: 2,
        },
        {
          id: 'step-4',
          name: '生成报告',
          systemPrompt: '生成一份完整的代码审查报告，包含：\n1. 总体评分\n2. 发现的问题\n3. 改进建议\n4. 优化后的代码示例\n\n审查内容：\n{history}',
          inputStrategy: 'cumulative',
          order: 3,
        },
      ],
      config: {
        maxRetries: 3,
        timeout: 60000,
        errorHandling: 'continue',
        debug: false,
      },
    },
  },
  {
    id: 'translation',
    name: '专业翻译流程',
    description: '高质量的多步骤翻译流程',
    category: '翻译',
    chain: {
      name: '专业翻译流程',
      description: '直译 -> 意译 -> 润色 -> 校对的完整翻译流程',
      steps: [
        {
          id: 'step-1',
          name: '初步直译',
          systemPrompt: '请将以下内容直译为中文，保持原文的准确性和完整性：\n\n{input}',
          inputStrategy: 'original',
          order: 0,
        },
        {
          id: 'step-2',
          name: '意译优化',
          systemPrompt: '基于直译结果，进行意译优化，使其更符合中文表达习惯：\n\n直译结果：{input}',
          inputStrategy: 'last_result',
          order: 1,
        },
        {
          id: 'step-3',
          name: '语言润色',
          systemPrompt: '对翻译内容进行语言润色，提升流畅度和可读性：\n\n{input}',
          inputStrategy: 'last_result',
          order: 2,
        },
        {
          id: 'step-4',
          name: '最终校对',
          systemPrompt: '对以下内容进行最终校对，确保准确性和完整性：\n\n原文：{original_input}\n\n译文：{input}\n\n如有问题请修正，如无问题请输出最终译文。',
          inputStrategy: 'original_with_context',
          order: 3,
        },
      ],
      config: {
        maxRetries: 3,
        timeout: 60000,
        errorHandling: 'stop',
        debug: false,
      },
    },
  },
  {
    id: 'data-analysis',
    name: '数据分析报告',
    description: '从数据到洞察的完整分析流程',
    category: '数据分析',
    chain: {
      name: '数据分析报告',
      description: '数据理解 -> 清洗建议 -> 分析方法 -> 生成报告',
      steps: [
        {
          id: 'step-1',
          name: '数据理解',
          systemPrompt: '请分析以下数据的结构、字段含义和潜在价值：\n\n{input}\n\n列出关键字段和数据特点。',
          inputStrategy: 'original',
          order: 0,
        },
        {
          id: 'step-2',
          name: '清洗建议',
          systemPrompt: '基于数据理解，给出数据清洗和预处理的建议：\n\n{input}',
          inputStrategy: 'last_result',
          order: 1,
        },
        {
          id: 'step-3',
          name: '分析方法',
          systemPrompt: '推荐适合的分析方法和可视化方案：\n\n数据特点：\n{history}',
          inputStrategy: 'cumulative',
          order: 2,
        },
        {
          id: 'step-4',
          name: '生成报告',
          systemPrompt: '生成一份数据分析报告，包含：\n1. 执行摘要\n2. 数据概况\n3. 关键发现\n4. 建议和结论\n\n分析过程：\n{history}',
          inputStrategy: 'cumulative',
          order: 3,
        },
      ],
      config: {
        maxRetries: 3,
        timeout: 60000,
        errorHandling: 'continue',
        debug: false,
      },
    },
  },
  {
    id: 'learning-guide',
    name: '学习路径生成',
    description: '为任何主题生成系统化学习路径',
    category: '教育',
    chain: {
      name: '学习路径生成',
      description: '主题分析 -> 知识点梳理 -> 学习顺序 -> 资源推荐',
      steps: [
        {
          id: 'step-1',
          name: '主题分析',
          systemPrompt: '请分析"{input}"这个学习主题的核心领域和关键概念：',
          inputStrategy: 'original',
          order: 0,
        },
        {
          id: 'step-2',
          name: '知识点梳理',
          systemPrompt: '基于主题分析，梳理出需要掌握的具体知识点和技能：\n\n{input}',
          inputStrategy: 'last_result',
          order: 1,
        },
        {
          id: 'step-3',
          name: '学习顺序',
          systemPrompt: '为以下知识点设计合理的学习顺序和阶段划分：\n\n{input}',
          inputStrategy: 'last_result',
          order: 2,
        },
        {
          id: 'step-4',
          name: '资源推荐',
          systemPrompt: '为每个学习阶段推荐学习资源（书籍、课程、项目等）：\n\n学习路径：\n{input}\n\n主题：{original_input}',
          inputStrategy: 'original_with_context',
          order: 3,
        },
      ],
      config: {
        maxRetries: 3,
        timeout: 60000,
        errorHandling: 'stop',
        debug: false,
      },
    },
  },
  {
    id: 'meeting-summary',
    name: '会议纪要整理',
    description: '从会议记录到结构化纪要的转换',
    category: '办公',
    chain: {
      name: '会议纪要整理',
      description: '提取要点 -> 整理决策 -> 行动项 -> 格式化输出',
      steps: [
        {
          id: 'step-1',
          name: '提取要点',
          systemPrompt: '从以下会议记录中提取关键讨论要点：\n\n{input}\n\n列出主要讨论话题。',
          inputStrategy: 'original',
          order: 0,
        },
        {
          id: 'step-2',
          name: '整理决策',
          systemPrompt: '基于讨论要点，整理会议中做出的决策和共识：\n\n{input}',
          inputStrategy: 'last_result',
          order: 1,
        },
        {
          id: 'step-3',
          name: '行动项',
          systemPrompt: '提取会议中的行动项，包括负责人和截止日期（如有）：\n\n{history}',
          inputStrategy: 'cumulative',
          order: 2,
        },
        {
          id: 'step-4',
          name: '格式化输出',
          systemPrompt: '生成结构化的会议纪要，包含：\n1. 会议信息\n2. 与会人员\n3. 讨论要点\n4. 决策事项\n5. 行动项\n6. 下次会议安排（如有）\n\n原始记录：\n{original_input}\n\n整理内容：\n{history}',
          inputStrategy: 'cumulative',
          order: 3,
        },
      ],
      config: {
        maxRetries: 3,
        timeout: 60000,
        errorHandling: 'continue',
        debug: false,
      },
    },
  },
];

// 获取模板分类
export function getTemplateCategories(): string[] {
  const categories = new Set(chainTemplates.map((t) => t.category));
  return Array.from(categories);
}

// 按分类获取模板
export function getTemplatesByCategory(category: string): ChainTemplate[] {
  return chainTemplates.filter((t) => t.category === category);
}

// 获取单个模板
export function getTemplate(id: string): ChainTemplate | undefined {
  return chainTemplates.find((t) => t.id === id);
}
