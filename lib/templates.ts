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
          systemPrompt: '你是一个专业的写作助手。请分析用户提供的主题，列出关键角度和核心要点。',
          userPrompt: '请分析以下主题的关键角度和核心要点，列出3-5个主要讨论方向：\n\n主题：{input}\n\n（你可以在此修改或补充具体的分析要求，比如：重点关注某个方面、针对特定受众、或者排除某些角度等）',
          inputStrategy: 'original',
          order: 0,
        },
        {
          id: 'step-2',
          name: '大纲生成',
          systemPrompt: '你是一个专业的写作助手。基于主题分析，生成一份结构清晰的文章大纲。',
          userPrompt: '基于以下主题分析，生成一份详细的文章大纲，包含标题、各段落主题和要点：\n\n{input}\n\n（你可以在此指定大纲的具体要求，比如：文章字数、段落数量、结构风格等）',
          inputStrategy: 'last_result',
          order: 1,
        },
        {
          id: 'step-3',
          name: '内容撰写',
          systemPrompt: '你是一个专业的写作助手。根据大纲撰写完整的文章内容，要求语言流畅、逻辑清晰。',
          userPrompt: '根据以下大纲撰写完整的文章内容：\n\n大纲：{input}\n\n原始主题：{original_input}\n\n（你可以在此指定写作风格、语气、目标读者、字数要求等）',
          inputStrategy: 'cumulative',
          order: 2,
        },
        {
          id: 'step-4',
          name: '润色优化',
          systemPrompt: '你是一个专业的写作编辑。对文章进行润色优化，提升语言表达和可读性。',
          userPrompt: '请对以下文章进行润色优化：\n\n{input}\n\n（你可以在此指定润色的重点，比如：简化表达、增强说服力、调整语气、检查语法等）',
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
          systemPrompt: '你是一个经验丰富的代码审查员。检查代码的语法错误和潜在问题。',
          userPrompt: '请检查以下代码的语法错误和潜在问题：\n\n```\n{input}\n```\n\n列出所有发现的问题。\n\n（你可以在此指定编程语言、代码规范要求或特定的检查重点）',
          inputStrategy: 'original',
          order: 0,
        },
        {
          id: 'step-2',
          name: '逻辑分析',
          systemPrompt: '你是一个经验丰富的代码审查员。分析代码逻辑是否合理，检查潜在的逻辑漏洞。',
          userPrompt: '分析以下代码的逻辑是否合理，是否存在潜在的逻辑漏洞或边界情况问题：\n\n```\n{input}\n```\n\n（你可以在此指定特定的业务逻辑要求或关注的边界条件）',
          inputStrategy: 'original',
          order: 1,
        },
        {
          id: 'step-3',
          name: '优化建议',
          systemPrompt: '你是一个经验丰富的代码优化专家。基于之前的分析，给出性能优化和改进建议。',
          userPrompt: '基于以上分析，给出代码的性能优化和改进建议：\n\n分析结果：\n{history}\n\n（你可以在此指定优化目标，比如：性能优先、可读性优先、内存优化、并发优化等）',
          inputStrategy: 'cumulative',
          order: 2,
        },
        {
          id: 'step-4',
          name: '生成报告',
          systemPrompt: '你是一个专业的技术文档撰写者。生成一份结构清晰、内容完整的代码审查报告。',
          userPrompt: '生成一份完整的代码审查报告，包含：\n1. 总体评分\n2. 发现的问题\n3. 改进建议\n4. 优化后的代码示例\n\n审查内容：\n{history}\n\n（你可以在此指定报告格式、评分标准或需要特别突出的内容）',
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
          systemPrompt: '你是一个专业的翻译助手。将内容直译为目标语言，保持原文的准确性和完整性。',
          userPrompt: '请将以下内容直译为中文，保持原文的准确性和完整性：\n\n{input}\n\n（你可以在此指定源语言、目标语言，或特别要求保留的专业术语）',
          inputStrategy: 'original',
          order: 0,
        },
        {
          id: 'step-2',
          name: '意译优化',
          systemPrompt: '你是一个专业的翻译助手。基于直译结果进行意译优化，使内容更符合目标语言的表达习惯。',
          userPrompt: '基于直译结果，进行意译优化，使其更符合中文表达习惯：\n\n直译结果：{input}\n\n（你可以在此指定目标受众、语体风格，比如：正式/口语化/学术/商务等）',
          inputStrategy: 'last_result',
          order: 1,
        },
        {
          id: 'step-3',
          name: '语言润色',
          systemPrompt: '你是一个专业的翻译编辑。对翻译内容进行语言润色，提升流畅度和可读性。',
          userPrompt: '对翻译内容进行语言润色，提升流畅度和可读性：\n\n{input}\n\n（你可以在此指定润色重点，比如：增强文采、简化表达、统一术语、调整语气等）',
          inputStrategy: 'last_result',
          order: 2,
        },
        {
          id: 'step-4',
          name: '最终校对',
          systemPrompt: '你是一个专业的翻译校对员。对照原文检查译文，确保准确性和完整性。',
          userPrompt: '对以下内容进行最终校对，确保准确性和完整性：\n\n原文：{original_input}\n\n译文：{input}\n\n如有问题请修正，如无问题请输出最终译文。\n\n（你可以在此指定校对重点，比如：专业术语准确性、数字和单位、文化适应性等）',
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
          systemPrompt: '你是一个专业的数据分析师。分析数据结构和字段含义，识别数据的潜在价值。',
          userPrompt: '请分析以下数据的结构、字段含义和潜在价值：\n\n{input}\n\n列出关键字段和数据特点。\n\n（你可以在此补充数据背景信息、数据来源、或特定关注的业务问题）',
          inputStrategy: 'original',
          order: 0,
        },
        {
          id: 'step-2',
          name: '清洗建议',
          systemPrompt: '你是一个专业的数据分析师。基于数据理解，给出数据清洗和预处理的建议。',
          userPrompt: '基于数据理解，给出数据清洗和预处理的建议：\n\n{input}\n\n（你可以在此指定数据质量标准、特定字段的处理要求、或需要特别关注的异常情况）',
          inputStrategy: 'last_result',
          order: 1,
        },
        {
          id: 'step-3',
          name: '分析方法',
          systemPrompt: '你是一个专业的数据分析师。推荐适合的分析方法和可视化方案。',
          userPrompt: '推荐适合的分析方法和可视化方案：\n\n数据特点：\n{history}\n\n（你可以在此指定分析目标、业务问题、或偏好的分析方法，比如：描述统计、相关性分析、预测模型等）',
          inputStrategy: 'cumulative',
          order: 2,
        },
        {
          id: 'step-4',
          name: '生成报告',
          systemPrompt: '你是一个专业的数据报告撰写者。生成一份结构清晰、洞察深刻的数据分析报告。',
          userPrompt: '生成一份数据分析报告，包含：\n1. 执行摘要\n2. 数据概况\n3. 关键发现\n4. 建议和结论\n\n分析过程：\n{history}\n\n（你可以在此指定报告受众、报告格式要求、或需要特别突出的业务洞察）',
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
          systemPrompt: '你是一个专业的学习规划师。分析学习主题的核心领域和关键概念。',
          userPrompt: '请分析"{input}"这个学习主题的核心领域和关键概念：\n\n（你可以在此补充你的学习背景、已有知识水平、或特别感兴趣的具体方向）',
          inputStrategy: 'original',
          order: 0,
        },
        {
          id: 'step-2',
          name: '知识点梳理',
          systemPrompt: '你是一个专业的学习规划师。基于主题分析，梳理需要掌握的具体知识点和技能。',
          userPrompt: '基于主题分析，梳理出需要掌握的具体知识点和技能：\n\n{input}\n\n（你可以在此指定学习深度要求、必须掌握的核心技能、或可以暂时跳过的进阶内容）',
          inputStrategy: 'last_result',
          order: 1,
        },
        {
          id: 'step-3',
          name: '学习顺序',
          systemPrompt: '你是一个专业的学习规划师。设计合理的学习顺序和阶段划分，考虑知识依赖关系。',
          userPrompt: '为以下知识点设计合理的学习顺序和阶段划分：\n\n{input}\n\n（你可以在此指定可用的学习时间、学习节奏偏好、或需要优先掌握的紧急技能）',
          inputStrategy: 'last_result',
          order: 2,
        },
        {
          id: 'step-4',
          name: '资源推荐',
          systemPrompt: '你是一个专业的学习资源顾问。为每个学习阶段推荐高质量的学习资源。',
          userPrompt: '为每个学习阶段推荐学习资源（书籍、课程、项目等）：\n\n学习路径：\n{input}\n\n主题：{original_input}\n\n（你可以在此指定偏好的学习资源类型、预算范围、语言偏好、或已知的优质资源来源）',
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
          systemPrompt: '你是一个专业的会议记录整理员。从会议记录中提取关键讨论要点。',
          userPrompt: '从以下会议记录中提取关键讨论要点：\n\n{input}\n\n列出主要讨论话题。\n\n（你可以在此补充会议类型、参与人员信息、或特别关注的话题领域）',
          inputStrategy: 'original',
          order: 0,
        },
        {
          id: 'step-2',
          name: '整理决策',
          systemPrompt: '你是一个专业的会议记录整理员。整理会议中做出的决策和达成的共识。',
          userPrompt: '基于讨论要点，整理会议中做出的决策和共识：\n\n{input}\n\n（你可以在此指定决策优先级、需要特别标注的重要决策、或决策的背景信息）',
          inputStrategy: 'last_result',
          order: 1,
        },
        {
          id: 'step-3',
          name: '行动项',
          systemPrompt: '你是一个专业的会议记录整理员。提取会议中的行动项，包括负责人和截止日期。',
          userPrompt: '提取会议中的行动项，包括负责人和截止日期（如有）：\n\n{history}\n\n（你可以在此指定行动项格式要求、优先级标注方式、或跟进频率要求）',
          inputStrategy: 'cumulative',
          order: 2,
        },
        {
          id: 'step-4',
          name: '格式化输出',
          systemPrompt: '你是一个专业的会议记录整理员。生成结构化、专业规范的会议纪要。',
          userPrompt: '生成结构化的会议纪要，包含：\n1. 会议信息\n2. 与会人员\n3. 讨论要点\n4. 决策事项\n5. 行动项\n6. 下次会议安排（如有）\n\n原始记录：\n{original_input}\n\n整理内容：\n{history}\n\n（你可以在此指定输出格式模板、需要额外添加的章节、或公司特定的纪要规范）',
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
