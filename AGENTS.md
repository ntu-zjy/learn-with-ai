# AGENTS.md — learn-with-ai

本文档供 AI Agent（Claude Code、Cursor、Copilot 等）快速理解项目结构和协作规范。

## 项目是什么

**Learn With AI** — 在 AI 时代，如何利用 AI 去更好地学习。

一个面向三类人群（青少年/青年/中年）的阶梯付费课程网站，技术栈为 VitePress 2.0.0-alpha.16 + Vue 3，部署在 SealOS 新加坡区。

## 快速定位文件

| 需要修改 | 对应文件 |
|---------|---------|
| 站点导航 / 侧边栏 | `docs/.vitepress/config.mjs` |
| 首页内容 | `docs/zh-cn/index.md` + `docs/.vitepress/theme/components/HomeFeatures.vue` |
| 定价信息 | `docs/.vitepress/theme/components/PricingPlans.vue` + `HomeFeatures.vue` 中的 `plans` 数组 |
| 付费锁逻辑 | `docs/.vitepress/theme/components/PaywallBlock.vue` |
| 登录 / 会员状态 | `docs/.vitepress/theme/composables/useMembership.js` + `AuthStatusButton.vue` |
| 后端 API / ZPAY 支付 | `server/index.mjs` + `docs/PAYMENT_ZPAY.md` |
| Prompt 实验台 | `docs/.vitepress/theme/components/PromptLab.vue` |
| 全局样式 | `docs/.vitepress/theme/style.css` |
| 组件注册 | `docs/.vitepress/theme/index.js` |
| CI/CD 流程 | `.github/workflows/deploy.yml` |
| 容器构建 | `Dockerfile` |

## 课程内容目录

```
docs/zh-cn/
├── free/               # 免费内容（所有人可访问）
│   ├── why-different/  # 为什么 AI 时代需要新学习方式
│   ├── ai-thinking/    # 什么是 AI 思维
│   ├── first-chat/     # 你的第一次 AI 对话
│   ├── learning-map/   # 如何选择你的学习路径
│   └── tools-overview/ # AI 学习工具全景
├── youth/              # 青少年模块（基础版 ¥99/年）
├── young-adult/        # 青年模块（进阶版 ¥299/年）
└── middle-aged/        # 中年模块（高级版 ¥599/年）
```

## 新增课程内容

1. 在对应人群目录下创建子目录，例如 `docs/zh-cn/youth/ai-writing/`
2. 新建 `index.md`，frontmatter 示例：

```yaml
---
title: 用 AI 写更好的作文
description: 学会用 AI 作为写作教练，而不是代写工具
---
```

3. 在 `docs/.vitepress/config.mjs` 对应侧边栏数组中添加条目
4. 付费内容用 `<PaywallBlock>` 包裹

## 新增 Vue 组件

1. 在 `docs/.vitepress/theme/components/` 下创建 `.vue` 文件
2. 在 `docs/.vitepress/theme/index.js` 中注册：`app.component('ComponentName', Component)`
3. 确保所有 import 的文件/依赖真实存在（build 时 rollup 严格检查）

## 构建验证

```bash
npm run build   # 必须零 error 才能提交
```

pre-commit hook 会自动运行 ESLint + build 检查，确保：
- 无 ESLint error（warning 可接受）
- VitePress build 成功

## 部署账号信息

- GitHub：`ntu-zjy`（仓库 `ntu-zjy/learn-with-ai`）
- Docker Hub：`jingyuanzzz`（镜像 `jingyuanzzz/learn-with-ai`）
- 部署平台：SealOS 新加坡区，镜像端口 80

## 技术约束

- Node.js >= 18（Docker 构建使用 node:20-alpine）
- VitePress 2.0.0-alpha.16（不要升级，alpha 版本 API 可能破坏性变更）
- 空 Vue 组件模板写 `<template><div /></template>`，不能写 `<template></template>`
- CSS 用 `var(--vp-c-*)` 主题变量，不要硬编码颜色

## 内容审查命令（/review）

对课程章节内容进行多角色 subagent 审查，识别可读性、实用性、相关性问题并给出优化建议。

### 命令格式

```
/review <目标>
```

| 示例 | 含义 |
|------|------|
| `/review youth/ai-writing` | 审查单个章节 |
| `/review youth` | 审查青少年模块全部章节 |
| `/review free` | 审查免费入门模块 |
| `/review all` | 审查全站所有课程章节 |

### 执行流程

**第一步：读取内容**

读取目标章节文件 `docs/zh-cn/<路径>/index.md`，去除 frontmatter 和 Vue 组件标签后提取纯文本。

**第二步：并行召唤三个 subagent**

同时启动三个扮演不同客群的 subagent，每个独立阅读章节内容并提交反馈：

```
subagent-youth        → 15岁高中生视角
subagent-young-adult  → 23岁备考研究生视角
subagent-middle-aged  → 42岁中层管理者视角
```

每个 subagent 收到以下 prompt：

---

> 你是一位[角色描述]，正在阅读一门 AI 学习课程的某个章节。
>
> 章节内容：
> ---
> [章节全文]
> ---
>
> 请从你的视角（[角色]）对这篇内容提出改进建议，格式：
>
> **总体印象**（1-2句）
>
> **具体问题**（按重要性排序，每条：问题 → 原因 → 修改建议）
>
> **亮点保留**（这些地方不要改）

---

**第三步：汇总建议**

将三个 subagent 的反馈合并，分类：

- **通用建议**：三个角色都提到，或适用于多个章节
- **章节专项建议**：仅针对本章节的具体问题

**第四步：执行优化**

- 章节专项建议：直接修改对应 `.md` 文件
- 通用建议（多章节适用）：列出清单，询问用户是否批量应用

**第五步：输出审查报告**

列出每处改动和改动理由。

### 三个 Subagent 角色定义

| Subagent | 角色 | 评估重点 |
|----------|------|---------|
| subagent-youth | 15岁高中生，习惯短视频，想提成绩 | 好不好懂、例子是否贴近学生生活、步骤能否直接照做 |
| subagent-young-adult | 23岁备考大学生，压力大，实用主义 | 有无干货、方法是否具体、有无废话 |
| subagent-middle-aged | 42岁中层管理者，日程满、重决策 | 有无商业价值、表达是否专业、建议是否落地 |

### 强制规则：内容修改必须由 subagent 执行

**禁止 main agent 直接修改任何课程内容文件（`docs/zh-cn/**/*.md`）。**

每个章节的优化改动必须：
1. 由 main agent 派发一个独立 subagent，在 prompt 中说明具体改什么、改到哪里
2. subagent 负责读取文件、执行改动、运行 `npm run build` 验证
3. subagent 完成后向 main agent 汇报结果
4. main agent 只做协调、汇总和最终 commit，不直接写内容文件

多个章节可以并行派发多个 subagent 同时执行，提高效率。

### 其他注意事项

- 审查阶段的三个角色 subagent（youth/young-adult/middle-aged）只读文件，不修改文件
- 改动完成后统一由 main agent 执行 `git commit`
- 如果章节包含 `<PaywallBlock>`，审查付费内容时需说明该内容在付费锁后

## 图标规范（全站强制执行）

**禁止在任何网页组件中使用 Emoji 表情包作为图标。** 此规则适用于所有 Vue 组件和 Markdown 文件中的 UI 图标。

所有视觉图标必须使用 `SvgIcon` 组件（内联 SVG，Lucide 风格，MIT 协议）：

```vue
<SvgIcon name="rocket" :size="24" />
```

该组件位于 `docs/.vitepress/theme/components/SvgIcon.vue`，已在 `index.js` 全局注册，无需在每个文件单独 import（但局部 import 也可以）。

需要新图标时，在 `SvgIcon.vue` 的 `icons` 对象中添加条目，路径来自 [Lucide Icons](https://lucide.dev/)（MIT）。

**不合规示例**（禁止）：

```js
icon: '🎒'  // Emoji 表情包，跨平台渲染不一致，禁止用作 UI 图标
```

**合规示例**：

```js
icon: 'school'  // 对应 SvgIcon.vue 中的 SVG 路径名
```
