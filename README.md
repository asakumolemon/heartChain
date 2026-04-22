# Prompt Chain - AI 提示链工作流引擎

一个基于 Next.js 的 AI 提示链工作流引擎，支持将复杂任务分解为多个步骤顺序执行，实现更可控、更高质量的 AI 输出。

## 功能特性

- **多步骤工作流** - 将复杂任务拆解为多个有序的 AI 处理步骤
- **灵活的数据传递** - 支持多种输入策略（上一步结果、原始输入、累积结果等）
- **多供应商支持** - 支持 OpenAI、Anthropic、DeepSeek、Gemini、OpenRouter 及自定义供应商
- **流式输出** - 实时查看每个步骤的生成内容
- **模型管理** - 内置主流模型预设，支持添加自定义模型
- **数据持久化** - 使用 IndexedDB 本地存储，支持数据导入/导出
- **响应式设计** - 支持桌面和移动设备访问

## 技术栈

- **框架**: [Next.js 16](https://nextjs.org/) + React 19
- **语言**: TypeScript
- **样式**: Tailwind CSS + shadcn/ui
- **状态管理**: React Hooks + Context
- **数据存储**: IndexedDB (Dexie.js)
- **AI 接口**: 支持 OpenAI/Anthropic/Gemini 等多种 API 格式

## 快速开始

### 安装依赖

```bash
cd my-app
npm install
```

### 开发环境运行

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 访问应用。

### 生产环境构建

```bash
npm run build
npm start
```

## 使用指南

### 1. 配置 AI 供应商

首次使用需要在设置页面配置至少一个 AI 供应商：

1. 点击顶部导航栏的「设置」
2. 在「供应商管理」标签页中启用并配置 API Key
3. 支持的供应商：OpenAI、Anthropic、DeepSeek、Gemini、OpenRouter

### 2. 创建提示链

1. 点击首页的「创建提示链」按钮
2. 填写提示链名称和描述
3. 添加多个步骤，为每个步骤配置：
   - **系统提示词**: 指导 AI 如何处理输入
   - **输入策略**: 决定当前步骤接收什么数据
   - **模型选择**: 选择使用的 AI 模型

### 3. 执行提示链

1. 在提示链详情页点击「执行」
2. 输入初始内容
3. 系统会自动按顺序执行每个步骤
4. 点击任意步骤卡片可查看详细输入输出

## 核心概念

### 系统提示词

每个步骤的系统提示词用于指导 AI 如何处理输入。支持使用变量引用动态数据：

```
你是一位资深的内容编辑。请对以下内容进行润色优化：

{{input}}

要求：
1. 保持原文核心意思不变
2. 提升语言流畅度
3. 修正语法错误
```

### 输入策略

决定当前步骤接收什么内容作为 `{{input}}`：

- **last_result**: 上一步的输出（默认）
- **original**: 用户的原始输入
- **original_with_context**: 原始输入 + 上一步结果
- **cumulative**: 所有之前步骤的结果拼接

### 可用变量

| 变量 | 说明 |
|------|------|
| `{{input}}` | 当前步骤输入（由输入策略决定）|
| `{{original_input}}` | 用户原始输入 |
| `{{prev_result}}` | 上一步输出 |
| `{{history}}` | 之前所有结果拼接 |
| `{{step}}` | 当前步骤序号 |
| `{{total_steps}}` | 总步骤数 |

## 项目结构

```
my-app/
├── app/                    # Next.js App Router
│   ├── api/proxy/         # AI API 代理
│   ├── chains/            # 提示链相关页面
│   ├── help/              # 使用帮助页面
│   ├── settings/          # 设置页面
│   └── layout.tsx         # 根布局
├── components/            # React 组件
│   ├── chain/            # 提示链相关组件
│   ├── settings/         # 设置相关组件
│   └── ui/               # shadcn/ui 组件
├── lib/                  # 工具库
│   ├── ai-service.ts    # AI 服务封装
│   ├── db.ts            # IndexedDB 操作
│   ├── executor.ts      # 执行引擎
│   └── templates.ts     # 预设模板
├── types/                # TypeScript 类型
└── public/               # 静态资源
```

## 数据备份

所有数据存储在浏览器本地 IndexedDB 中。如需备份：

1. 进入「设置」→「全局设置」
2. 点击「导出备份」下载 JSON 文件
3. 需要恢复时使用「导入数据」功能

## 部署

### Vercel 部署（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/prompt-chain)

### 其他平台

构建后的静态文件位于 `out/` 目录，可部署到任何支持静态站点的平台。

```bash
npm run build
```

## 开发计划

- [x] 多供应商 AI 支持
- [x] 流式输出
- [x] 模型管理
- [x] 自定义供应商
- [x] 数据导入/导出
- [ ] 步骤条件分支
- [ ] 执行历史记录
- [ ] 更多预设模板

## License

MIT License

## 致谢

- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Dexie.js](https://dexie.org/)
