# CLAUDE.md — learn-with-ai

## 项目概览

**Learn With AI** 是"在 AI 时代，如何利用 AI 去更好地学习"课程网站。基于 **VitePress 2.0.0-alpha.16 + Vue 3**，面向青少年（6-18岁）、青年（18-35岁）、中年（35-55岁）三类人群，提供阶梯付费课程。

- **GitHub**：`ntu-zjy/learn-with-ai`
- **Docker Hub**：`jingyuanzzz/learn-with-ai`
- **部署平台**：SealOS 新加坡区 App Launchpad

## 目录结构

```
learn-with-ai/
├── docs/
│   ├── .vitepress/
│   │   ├── config.mjs          # 站点配置（导航、侧边栏、base 路径）
│   │   └── theme/
│   │       ├── index.js        # 主题入口（组件注册、Viewer.js 初始化）
│   │       ├── Layout.vue      # 自定义 Layout（TypeIt 打字机动效）
│   │       ├── style.css       # 全局样式
│   │       └── components/
│   │           ├── HomeFeatures.vue         # 首页主组件
│   │           ├── PricingPlans.vue          # 定价页
│   │           ├── PaywallBlock.vue          # 付费内容锁
│   │           ├── PromptLab.vue             # Prompt 实验室
│   │           ├── AudiencePathSelector.vue  # 人群路径选择器
│   │           ├── StepBar.vue               # 步骤进度条
│   │           ├── SummaryCard.vue           # 章节总结卡片
│   │           ├── ReadingProgress.vue       # 阅读进度条
│   │           ├── ChapterIntroduction.vue   # 章节介绍组件
│   │           └── CopyOrDownloadAsMarkdownButtons/ # 复制/下载按钮
│   ├── index.md                # 根路由（重定向到 /zh-cn/）
│   └── zh-cn/
│       ├── index.md            # 中文首页（使用 HomeFeatures 组件）
│       ├── pricing/index.md    # 定价页
│       ├── free/               # 免费内容（5节，所有人可访问）
│       ├── youth/              # 青少年模块（基础版 ¥99/年）
│       ├── young-adult/        # 青年模块（进阶版 ¥299/年）
│       └── middle-aged/        # 中年模块（高级版 ¥599/年）
├── .github/workflows/
│   └── deploy.yml              # GitHub Actions：push main → 构建 → 推送 Docker Hub
├── Dockerfile                  # 多阶段构建（Node 20 → nginx alpine）
├── nginx.conf                  # SPA 路由支持（try_files）
└── package.json
```

## 开发命令

```bash
npm install           # 安装依赖（需要 Node >= 18）
npm run dev           # 本地开发，访问 http://localhost:5173/learn-with-ai/
npm run build         # 生产构建（同时作为 CI 正确性检查）
npm run preview       # 预览构建结果
```

## 部署流程

1. 推送代码到 `main` 分支
2. GitHub Actions 自动构建 Docker 镜像并推送到 `jingyuanzzz/learn-with-ai:latest`
3. 在 SealOS App Launchpad 点击「重新部署」拉取最新镜像

**SealOS 构建环境变量**：`SEALOS=1`（触发 VitePress base 路径切换为 `/learn-with-ai/`）

## 付费层级

| 路径前缀 | 需要版本 | 价格 | 内容 |
|---------|---------|------|------|
| `/zh-cn/free/` | 免费 | ¥0 | AI 思维入门 5 节 |
| `/zh-cn/youth/` | 基础版 | ¥99/年 | 青少年完整课程 |
| `/zh-cn/young-adult/` 入门 | 基础版 | ¥99/年 | 青年入门模块 |
| `/zh-cn/young-adult/` 考研求职 | 进阶版 | ¥299/年 | 考研/求职/规划 |
| `/zh-cn/middle-aged/` | 高级版 | ¥599/年 | 商业/投资/决策 |

## 付费锁用法

```markdown
<PaywallBlock plan="进阶版或以上" title="考研备考全流程">

这里是付费内容...

</PaywallBlock>
```

## 核心组件用法

```markdown
<HomeFeatures />           <!-- 首页：受众选择器 + 课程预览 + 定价 -->
<PromptLab />              <!-- Prompt 对比实验台（4个场景） -->
<AudiencePathSelector />   <!-- 三路人群跳转引导 -->
<PricingPlans />           <!-- 完整定价页 -->
<StepBar />                <!-- 步骤进度条 -->
<SummaryCard />            <!-- 章节总结 -->
<PaywallBlock />           <!-- 付费内容锁 -->
```

## 代码规范

- Prettier：无分号，单引号，无尾逗号（运行 `npm run format` 后再提交）
- Vue 3 SFCs，使用 `<script setup>`，PascalCase 文件名
- CSS 优先使用 VitePress 主题变量 `var(--vp-c-*)`
- 提交前通过 Husky pre-commit hook（ESLint zero error + build 检查）
- Commit 格式：`feat: ...` / `fix: ...` / `docs: ...`

## 图标规范（全站适用）

**禁止在任何网页组件中使用 Emoji 表情包作为图标。** 所有视觉图标必须使用开源或闭源 SVG 图标库。

### 现行方案：内联 SVG（`SvgIcon.vue`）

项目已有 `docs/.vitepress/theme/components/SvgIcon.vue`，收录了 Lucide 风格（24x24、stroke-based）的内联 SVG 路径。

用法：

```vue
<SvgIcon name="rocket" :size="24" />
<SvgIcon name="lock" :size="16" color="var(--vp-c-brand-1)" />
```

### 可用图标名称

| 名称 | 含义 | 推荐场景 |
|------|------|---------|
| `school` | 学校/青少年 | 青少年受众 |
| `rocket` | 火箭/青年 | 青年受众 |
| `briefcase` | 公文包/中年 | 中年受众 |
| `message-circle` | 对话圈 | AI 对话功能 |
| `map` | 地图 | 路径/导航 |
| `clipboard-list` | 清单 | 模板库 |
| `play-circle` | 播放圆 | 演示/视频 |
| `bar-chart` | 柱状图 | 数据可视化 |
| `lock` | 锁 | 付费/锁定 |
| `check` | 勾 | 完成/确认 |
| `check-circle` | 勾圆 | 免费/已解锁 |
| `lightbulb` | 灯泡 | 提示/技巧 |
| `target` | 靶心 | 目标/学习目标 |
| `arrow-right` | 右箭头 | 跳转/下一步 |
| `monitor` | 显示器 | 计算机/前端 |
| `tool` | 工具 | 开发工具 |
| `globe` | 地球 | 浏览器/Web |
| `settings` | 设置齿轮 | 服务端/配置 |
| `cloud` | 云 | 基础设施 |
| `layers` | 层叠 | 架构 |
| `database` | 数据库 | 数据存储 |
| `robot` | 机器人 | AI/自动化 |
| `sparkles` | 闪光 | 创意/AI 特性 |
| `file` | 文件 | 文档/文章 |

### 添加新图标

在 `SvgIcon.vue` 的 `icons` 对象中添加新条目，路径数据来源于 [Lucide](https://lucide.dev/)（MIT 协议）或其他开源图标库：

```js
'icon-name': 'SVG path d 属性值',
```

## 内容审查流程（/review）

对课程章节内容进行多角色审查，识别可读性、实用性、相关性问题并优化。

### 触发方式

- **单章节审查**：`/review <章节路径>`，例如 `/review youth/ai-writing`
- **模块审查**：`/review <模块名>`，例如 `/review youth`、`/review free`
- **全站审查**：`/review all`

### 执行步骤

1. **读取内容**：读取指定章节文件（`docs/zh-cn/<路径>/index.md`）
2. **并行召唤三个 subagent**，每个扮演对应客群用户阅读内容并提出反馈：
   - **subagent-youth**：初中/高中生（14-18岁），关注内容是否好懂、例子是否贴近学生生活、步骤是否可操作
   - **subagent-young-adult**：大学生/职场新人（18-30岁），关注内容是否解决实际问题、方法是否够用、例子是否匹配考研/求职/学习场景
   - **subagent-middle-aged**：职场中年/管理者（35-55岁），关注内容是否有商业价值、表达是否简洁不啰嗦、建议是否切实可行
3. **汇总建议**：将三个 subagent 的反馈分类为「通用建议」和「章节专项建议」
4. **执行优化**：
   - 通用建议（多个章节适用）：列出清单，询问是否批量应用
   - 章节专项建议：直接修改对应章节文件
5. **输出审查报告**：列出每处改动及改动理由

### Subagent Prompt 模板

每个 subagent 收到的指令格式：

```
你是一位[角色描述]，正在阅读一门 AI 学习课程的章节内容。

章节内容如下：
---
[章节全文]
---

请从你的视角（[角色]）对这篇内容提出改进建议，格式如下：

**总体印象**（1-2句话）

**具体问题**（按重要性排序，每条说明：问题 → 原因 → 修改建议）

**亮点保留**（不要改动的地方）
```

### 角色定义

| Subagent | 角色描述 | 评估重点 |
|----------|---------|---------|
| subagent-youth | 15岁高中生，平时用手机学习，习惯短视频，注意力有限，但想把成绩搞好 | 好不好懂、例子熟不熟悉、步骤能不能直接照做 |
| subagent-young-adult | 23岁备考研究生的大学生，压力大，时间紧，实用主义 | 有没有干货、方法够不够具体、有没有浪费时间的废话 |
| subagent-middle-aged | 42岁中层管理者，日程满、决策多，用 AI 提升工作效率 | 有没有商业价值、表达是否专业、建议是否落地 |

## 注意事项

- Docker Hub 用户名：`jingyuanzzz`，GitHub 用户名：`ntu-zjy`（两者不同）
- VitePress build 时 rollup 严格模式不接受无效 import，新增组件前确保所有依赖存在
- `<template><div /></template>` 是空组件的正确写法（`<template></template>` 违反 `vue/valid-template-root`）
