"use client";

import {
  BookOpen,
  Play,
  Settings,
  FileText,
  ChevronRight,
  Lightbulb,
  Zap,
  GitBranch,
  MessageSquare,
  CheckCircle,
} from "lucide-react";

export default function HelpPage() {
  return (
    <div className="max-w-4xl mx-auto">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">使用帮助</h1>
        <p className="text-gray-600">
          了解如何使用 Prompt Chain 创建和执行 AI 提示链工作流
        </p>
      </div>

      {/* 什么是提示链 */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-6 h-6 text-yellow-500" />
          <h2 className="text-xl font-bold text-gray-900">什么是提示链？</h2>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-700 mb-4 leading-relaxed">
            <strong>提示链（Prompt Chain）</strong>是一种将复杂任务分解为多个步骤执行的 AI 工作流技术。
            通过将大任务拆分成一系列有序的步骤，每个步骤使用特定的提示词处理上一步的输出，
            最终获得更高质量、更可控的结果。
          </p>
          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <Zap className="w-5 h-5 text-blue-500 mb-2" />
              <h3 className="font-medium text-gray-900 mb-1">分步处理</h3>
              <p className="text-sm text-gray-600">
                将复杂任务拆解为多个简单步骤，降低 AI 的理解难度
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <GitBranch className="w-5 h-5 text-green-500 mb-2" />
              <h3 className="font-medium text-gray-900 mb-1">流程可控</h3>
              <p className="text-sm text-gray-600">
                每个步骤都有明确的输入输出，便于调试和优化
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <CheckCircle className="w-5 h-5 text-purple-500 mb-2" />
              <h3 className="font-medium text-gray-900 mb-1">质量提升</h3>
              <p className="text-sm text-gray-600">
                通过多步推理和迭代，获得更精准、更专业的输出
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 使用流程 */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Play className="w-6 h-6 text-green-500" />
          <h2 className="text-xl font-bold text-gray-900">使用流程</h2>
        </div>
        <div className="space-y-4">
          {/* 步骤 1 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
              1
            </div>
            <div className="flex-1 bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-2">配置 AI 供应商</h3>
              <p className="text-gray-700 mb-3">
                首次使用前，需要在设置页面配置至少一个 AI 供应商的 API Key。
              </p>
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Settings className="w-4 h-4" />
                <span>前往「设置」→「供应商管理」添加 API Key</span>
              </div>
              <div className="mt-3 flex gap-2">
                <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">OpenAI</span>
                <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">Anthropic</span>
                <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">DeepSeek</span>
                <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">Gemini</span>
              </div>
            </div>
          </div>

          {/* 步骤 2 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
              2
            </div>
            <div className="flex-1 bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-2">创建提示链</h3>
              <p className="text-gray-700 mb-3">
                点击首页的「创建提示链」按钮，开始构建你的工作流。
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 mt-0.5 text-gray-400" />
                  <span>填写提示链的名称和描述</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 mt-0.5 text-gray-400" />
                  <span>添加多个步骤，配置系统提示词和用户消息</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 mt-0.5 text-gray-400" />
                  <span>配置步骤间的数据传递策略</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 步骤 3 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
              3
            </div>
            <div className="flex-1 bg-white rounded-lg border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 mb-2">执行提示链</h3>
              <p className="text-gray-700 mb-3">
                在提示链详情页点击「执行」按钮，输入初始内容开始执行。
              </p>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>执行过程：</strong>
                </p>
                <ol className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>① 输入初始内容</li>
                  <li>② 系统自动按顺序执行每个步骤</li>
                  <li>③ 实时查看每个步骤的输出</li>
                  <li>④ 获取最终结果</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 消息配置详解 */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-bold text-gray-900">消息配置详解</h2>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-700 mb-6 leading-relaxed">
            每个步骤可以配置两种消息：<strong>系统提示词（System）</strong>和<strong>用户消息（User）</strong>。
            系统提示词定义 AI 的角色和任务，用户消息提供具体的输入内容。
            如果未设置用户消息，将自动使用输入策略获取的内容。
          </p>

          <div className="space-y-6">
            {/* 基本结构 */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3">基本结构</h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap">
                  {`你是一位[角色定位]，专门负责[任务描述]。

任务要求：
1. [具体要求1]
2. [具体要求2]
3. [具体要求3]

输入内容：
{{input}}

请按以下格式输出：
[输出格式要求]`}
                </pre>
              </div>
            </div>

            {/* 实际示例 */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3">实际示例</h3>
              <div className="space-y-3">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="text-sm text-blue-700 font-medium mb-2">步骤1：文章大纲生成</div>
                  <div className="space-y-2">
                    <div className="text-xs text-blue-600 font-medium">System</div>
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap bg-white/50 p-2 rounded">
                      {`你是一位资深的内容策划专家。请根据用户提供的主题，生成一份详细的文章大纲。

要求：
1. 大纲包含3-5个主要章节
2. 每个章节下列出2-3个要点
3. 使用 Markdown 格式
4. 在开头简要说明文章的核心观点

请直接输出大纲，不需要其他解释。`}
                    </pre>
                    <div className="text-xs text-blue-600 font-medium mt-2">User</div>
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap bg-white/50 p-2 rounded">
                      {`主题：{{input}}`}
                    </pre>
                  </div>
                </div>

                <div className="text-gray-500 text-sm px-2">↓ 上一步的输出作为下一步的输入</div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="text-sm text-green-700 font-medium mb-2">步骤2：内容扩写</div>
                  <div className="space-y-2">
                    <div className="text-xs text-green-600 font-medium">System</div>
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap bg-white/50 p-2 rounded">
                      {`你是一位专业的撰稿人。请根据提供的大纲，撰写一篇完整的文章。

要求：
1. 按照大纲结构逐节展开
2. 每个要点至少写200字
3. 语言通俗易懂，避免过于学术化
4. 在段落之间添加过渡句，保持连贯性

请直接输出文章正文。`}
                    </pre>
                    <div className="text-xs text-green-600 font-medium mt-2">User</div>
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap bg-white/50 p-2 rounded">
                      {`大纲：
{{input}}

原始主题：{{original_input}}`}
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* 关键技巧 */}
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h3 className="font-bold text-yellow-900 mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                编写技巧
              </h3>
              <ul className="space-y-2 text-sm text-yellow-800">
                <li>• <strong>明确定位</strong>：开头明确 AI 应该扮演的角色（专家、助手、编辑等）</li>
                <li>• <strong>任务具体</strong>：告诉 AI 具体要做什么，不要含糊不清</li>
                <li>• <strong>格式规范</strong>：说明期望的输出格式（列表、段落、Markdown 等）</li>
                <li>• <strong>使用变量</strong>：用 {"{{input}}"} 等变量引用动态内容</li>
                <li>• <strong>设置边界</strong>：告诉 AI 什么不要做，避免偏离主题</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 输入策略详解 */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <GitBranch className="w-6 h-6 text-green-500" />
          <h2 className="text-xl font-bold text-gray-900">输入策略详解</h2>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-700 mb-6 leading-relaxed">
            <strong>输入策略</strong>决定了当前步骤接收什么内容作为 {"{{input}}"} 变量。
            它是提示链中步骤之间传递数据的"管道"，正确选择输入策略对工作流至关重要。
          </p>

          <div className="space-y-6">
            {/* 四种策略对比 */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h3 className="font-bold text-blue-900 mb-2">last_result</h3>
                <p className="text-sm text-blue-800 mb-2">
                  <strong>上一步结果</strong> - 接收上一个步骤的输出
                </p>
                <p className="text-xs text-blue-700">
                  最常用的策略。适用于顺序处理，如：大纲 → 扩写 → 润色
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <h3 className="font-bold text-green-900 mb-2">original</h3>
                <p className="text-sm text-green-800 mb-2">
                  <strong>原始输入</strong> - 始终接收用户的初始输入
                </p>
                <p className="text-xs text-green-700">
                  适用于每一步都需要参考原始需求的场景
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <h3 className="font-bold text-purple-900 mb-2">original_with_context</h3>
                <p className="text-sm text-purple-800 mb-2">
                  <strong>原始输入+上下文</strong> - 原始输入 + 上一步结果
                </p>
                <p className="text-xs text-purple-700">
                  既保留原始需求，又利用上一步产出
                </p>
              </div>

              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <h3 className="font-bold text-orange-900 mb-2">cumulative</h3>
                <p className="text-sm text-orange-800 mb-2">
                  <strong>累积结果</strong> - 所有之前步骤的结果拼接
                </p>
                <p className="text-xs text-orange-700">
                  适用于需要回顾全流程的场景，如总结报告
                </p>
              </div>
            </div>

            {/* 完整示例 */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3">完整示例：文章创作工作流</h3>
              <div className="space-y-4">
                {/* 用户输入 */}
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-700 mb-1">用户输入：</div>
                  <div className="text-sm text-gray-600">"人工智能在医疗领域的应用"</div>
                </div>

                {/* 步骤1 */}
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div className="flex-1 bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-blue-900">生成大纲</span>
                      <span className="text-xs px-2 py-1 bg-blue-200 text-blue-800 rounded">输入策略: original</span>
                    </div>
                    <div className="text-sm text-gray-700 mb-2">
                      <strong>接收的 {"{{input}}"}：</strong> "人工智能在医疗领域的应用"
                    </div>
                    <div className="text-sm text-gray-600 bg-white rounded p-2">
                      <strong>输出：</strong> 文章大纲（包含引言、AI诊断、药物研发等章节）
                    </div>
                  </div>
                </div>

                {/* 步骤2 */}
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div className="flex-1 bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-green-900">扩写内容</span>
                      <span className="text-xs px-2 py-1 bg-green-200 text-green-800 rounded">输入策略: last_result</span>
                    </div>
                    <div className="text-sm text-gray-700 mb-2">
                      <strong>接收的 {"{{input}}"}：</strong> 步骤1生成的大纲
                    </div>
                    <div className="text-sm text-gray-600 bg-white rounded p-2">
                      <strong>输出：</strong> 根据大纲撰写的完整文章
                    </div>
                  </div>
                </div>

                {/* 步骤3 */}
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div className="flex-1 bg-purple-50 rounded-lg p-4 border border-purple-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-purple-900">润色优化</span>
                      <span className="text-xs px-2 py-1 bg-purple-200 text-purple-800 rounded">输入策略: last_result</span>
                    </div>
                    <div className="text-sm text-gray-700 mb-2">
                      <strong>接收的 {"{{input}}"}：</strong> 步骤2生成的文章
                    </div>
                    <div className="text-sm text-gray-600 bg-white rounded p-2">
                      <strong>输出：</strong> 润色后的最终文章
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 另一个示例 */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3">示例：多维度分析</h3>
              <div className="space-y-3">
                <div className="text-sm text-gray-600">用户输入：一份产品设计方案</div>

                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <div className="text-sm text-orange-800 mb-2">
                    <strong>场景：</strong>第二步做技术可行性分析，第三步做市场分析，
                    但都需要参考原始方案
                  </div>
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">步骤1：</span>理解方案（original）
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">步骤2：</span>技术评估（original_with_context）→ 接收"原始方案+步骤1总结"
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">步骤3：</span>市场分析（original_with_context）→ 接收"原始方案+步骤2评估"
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 选择指南 */}
            <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <h3 className="font-bold text-yellow-900 mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                如何选择输入策略？
              </h3>
              <div className="space-y-2 text-sm text-yellow-800">
                <p><strong>• last_result</strong>：上一步的输出就是当前步的输入，串联处理</p>
                <p><strong>• original</strong>：当前步需要直接处理用户的原始需求，不受之前步骤影响</p>
                <p><strong>• original_with_context</strong>：既需要原始需求作为核心，又要参考之前的结果</p>
                <p><strong>• cumulative</strong>：需要综合回顾所有之前的产出，如生成总结报告</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 变量说明 */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-6 h-6 text-blue-500" />
          <h2 className="text-xl font-bold text-gray-900">可用变量</h2>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  变量名
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  说明
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-3 text-sm">
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-red-600">
                    {"{{input}}"}
                  </code>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  当前步骤的输入内容（由输入策略决定）
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm">
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-red-600">
                    {"{{original_input}}"}
                  </code>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  用户输入的原始内容
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm">
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-red-600">
                    {"{{prev_result}}"}
                  </code>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  上一步骤的输出结果
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm">
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-red-600">
                    {"{{history}}"}
                  </code>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  之前所有步骤的结果拼接
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm">
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-red-600">
                    {"{{step}}"}
                  </code>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  当前步骤序号
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm">
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-red-600">
                    {"{{total_steps}}"}
                  </code>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  总步骤数
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm">
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-red-600">
                    {"{{is_first}}"}
                  </code>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  是否为第一步（true/false）
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm">
                  <code className="bg-gray-100 px-1.5 py-0.5 rounded text-red-600">
                    {"{{is_last}}"}
                  </code>
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  是否为最后一步（true/false）
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* 示例场景 */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="w-6 h-6 text-yellow-500" />
          <h2 className="text-xl font-bold text-gray-900">示例场景</h2>
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="font-bold text-gray-900 mb-2">文章创作工作流</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">大纲生成</span>
              <ChevronRight className="w-4 h-4" />
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded">内容扩写</span>
              <ChevronRight className="w-4 h-4" />
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">润色优化</span>
            </div>
            <p className="text-gray-700 text-sm">
              第一步根据主题生成文章大纲，第二步根据大纲扩写每个段落，
              最后一步检查语法并优化表达。
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="font-bold text-gray-900 mb-2">代码审查工作流</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">静态分析</span>
              <ChevronRight className="w-4 h-4" />
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded">安全审查</span>
              <ChevronRight className="w-4 h-4" />
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">优化建议</span>
            </div>
            <p className="text-gray-700 text-sm">
              第一步检查代码风格和规范，第二步识别潜在安全风险，
              第三步给出性能优化建议。
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-5">
            <h3 className="font-bold text-gray-900 mb-2">数据分析工作流</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">数据清洗</span>
              <ChevronRight className="w-4 h-4" />
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded">统计分析</span>
              <ChevronRight className="w-4 h-4" />
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">可视化描述</span>
            </div>
            <p className="text-gray-700 text-sm">
              第一步清理和格式化原始数据，第二步执行统计分析，
              第三步生成图表描述和洞察报告。
            </p>
          </div>
        </div>
      </section>

      {/* 快速开始 */}
      <section>
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <h2 className="text-xl font-bold mb-2">准备好开始了吗？</h2>
          <p className="text-blue-100 mb-4">
            使用预设模板快速创建你的第一个提示链
          </p>
          <a
            href="/chains/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            <Play className="w-4 h-4" />
            立即创建
          </a>
        </div>
      </section>
    </div>
  );
}
