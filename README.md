<div align="center">

# Learn With AI

### 在 AI 时代，如何利用 AI 去更好地学习？

<p align="center">
  针对青少年、青年、中年三类人群的专属 AI 学习课程<br>
  <span style="font-size: 0.9em; color: #888;">从 AI 思维启蒙到商业洞察，阶梯付费，按需解锁</span>
</p>

<p align="center">
  <a href="https://github.com/ntu-zjy/learn-with-ai">
    <img src="https://img.shields.io/badge/GitHub-ntu--zjy%2Flearn--with--ai-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub">
  </a>
  <a href="https://hub.docker.com/r/jingyuanzzz/learn-with-ai">
    <img src="https://img.shields.io/badge/Docker_Hub-jingyuanzzz%2Flearn--with--ai-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker Hub">
  </a>
  <img src="https://img.shields.io/badge/VitePress-2.0.0--alpha.16-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="VitePress">
  <img src="https://img.shields.io/badge/部署-SealOS_新加坡区-00C4CC?style=for-the-badge" alt="SealOS">
</p>

</div>

---

## 项目简介

**Learn With AI** 是一个面向普通人的 AI 学习方法论课程网站。核心问题是：

> 在 AI 工具已经无处不在的今天，大多数人仍然不知道怎么用 AI **真正提升自己的学习效率**。他们要么把 AI 当搜索引擎，要么依赖 AI 完成作业却没有任何成长。

本项目的目标是：**教会不同年龄段的人，如何把 AI 变成自己的学习加速器。**

不同年龄、不同目标的人，对 AI 学习的需求完全不同——

- 青少年需要的是用 AI 辅助作业、培养 AI 原生思维
- 青年需要的是用 AI 加速考研、求职、职业成长
- 中年需要的是用 AI 做行业洞察、投资分析、人生决策

所以本站不做大而全的通用教程，而是**三条专属路径，深度定制**。

---

## 受众与课程路径

### 🎒 青少年（6–18 岁）
**AI 学习启蒙：从用 AI 写作文，到培养 AI 原生思维**

| 模块 | 付费层级 |
|------|---------|
| 什么是 AI 思维？ | 免费 |
| AI 学习 vs 普通搜索 | 免费 |
| 你的第一次 AI 对话实验 | 免费 |
| 用 AI 写更好的作文 | 基础版 ¥99/年 |
| 用 AI 攻克数学难题 | 基础版 |
| AI 辅助课后复习系统 | 进阶版 ¥299/年 |
| 用 AI 做项目研究 | 进阶版 |

### 🚀 青年（18–35 岁）
**AI 驱动的成长：考研、求职、职业规划全程加速**

| 模块 | 付费层级 |
|------|---------|
| 什么是 AI 思维？ | 免费 |
| Prompt 思维精讲 | 免费 |
| 用 AI 制定学习计划 | 免费 |
| AI 辅助考研备考全流程 | 进阶版 ¥299/年 |
| AI 打造完美简历 | 进阶版 |
| AI 面试模拟与复盘 | 进阶版 |
| 用 AI 做职业路径分析 | 高级版 ¥599/年 |

### 💼 中年（35–55 岁）
**AI 商业洞察：行业调研、投资分析、人生决策赋能**

| 模块 | 付费层级 |
|------|---------|
| 什么是 AI 思维？ | 免费 |
| 用 AI 快速了解一个行业 | 免费 |
| 商业机会的 AI 扫描方法 | 高级版 ¥599/年 |
| AI 辅助股票分析入门 | 高级版 |
| 用 AI 读懂财报 | 高级版 |
| 打造你的个人 AI 助手系统 | 旗舰版（高级版含） |
| AI 时代的终身学习框架 | 旗舰版 |

---

## 定价

| 版本 | 价格 | 适合人群 |
|------|------|---------|
| 免费体验 | ¥0 永久 | 所有人，AI 思维入门 5 节 |
| 基础版 | ¥99/年 | 学生，青少年完整课程 + 青年入门 |
| 进阶版 | ¥299/年 | 青年，考研/求职/规划专项 |
| 高级版 | ¥599/年 | 中年，商业洞察/投资分析 |

---

## 技术架构

```
VitePress 2.0.0-alpha.16 (静态文档站)
  └── Vue 3 + Element Plus (UI 组件体系)
        └── Docker 多阶段构建
              └── Node API + 静态文件服务
                    ├── /zh-cn/* 课程页面
                    └── /api/* 登录、会员、ZPAY 支付
```

**自动化部署流程：**

```
git push main
    ↓
GitHub Actions 触发
    ↓
Docker 多阶段构建（Node 20 构建 → Node 运行）
    ↓
推送镜像到 Docker Hub (jingyuanzzz/learn-with-ai:latest)
    ↓
SealOS App Launchpad 拉取新镜像，重新部署
```

---

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器（热更新）
npm run dev
# 访问 http://localhost:5173/learn-with-ai/

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

> 需要 Node.js >= 18

---

## 项目结构

```
learn-with-ai/
├── docs/
│   ├── .vitepress/
│   │   ├── config.mjs              # 站点配置（导航、侧边栏）
│   │   └── theme/
│   │       ├── index.js            # 主题入口（组件注册）
│   │       ├── Layout.vue          # 自定义 Layout（打字机动效）
│   │       ├── style.css           # 全局样式
│   │       └── components/
│   │           ├── HomeFeatures.vue         # 首页主组件
│   │           ├── PricingPlans.vue          # 定价页
│   │           ├── PaywallBlock.vue          # 付费内容锁
│   │           ├── AuthStatusButton.vue      # 登录与会员状态入口
│   │           ├── AuthForm.vue              # 登录 / 注册表单
│   │           ├── AccountCenter.vue         # 账户与权益中心
│   │           ├── PromptLab.vue             # Prompt 实验室
│   │           └── AudiencePathSelector.vue  # 人群路径选择器
│   └── zh-cn/
│       ├── index.md                # 中文首页
│       ├── pricing/                # 定价页
│       ├── account/                # 账户页
│       ├── login/                  # 登录页
│       ├── register/               # 注册页
│       ├── free/                   # 免费入门（5节）
│       ├── youth/                  # 青少年模块
│       ├── young-adult/            # 青年模块
│       └── middle-aged/            # 中年模块
├── .github/workflows/
│   └── deploy.yml                  # GitHub Actions 自动构建推送
├── Dockerfile                      # 多阶段构建镜像
├── server/                         # SealOS 运行时 API + 静态服务
│   └── index.mjs                   # 登录、会员、订单、ZPAY 签名与回调
├── CLAUDE.md                       # Claude Code 项目指令
└── AGENTS.md                       # AI Agent 协作指南
```

---

## 部署信息

- **镜像仓库**：[jingyuanzzz/learn-with-ai](https://hub.docker.com/r/jingyuanzzz/learn-with-ai)
- **部署平台**：SealOS 新加坡区 App Launchpad
- **容器端口**：80
- **构建环境变量**：`SEALOS=1`（控制 VitePress base 路径）
- **运行时数据**：挂载持久卷到 `/data`
- **支付接口**：ZPAY，接入细节见 `docs/PAYMENT_ZPAY.md`
- **GitHub 仓库**：[ntu-zjy/learn-with-ai](https://github.com/ntu-zjy/learn-with-ai)

每次推送 main 分支后，GitHub Actions 自动构建并更新 Docker Hub 镜像。在 SealOS 控制台点击「重新部署」即可拉取最新版本。

---

## 核心交互组件

站点包含以下课程专属 Vue 组件，可在 Markdown 中直接使用：

| 组件 | 用途 |
|------|------|
| `<HomeFeatures />` | 首页：受众选择器 + 课程预览 + 定价概览 |
| `<PromptLab />` | Prompt 对比实验台，4个场景可实操 |
| `<PaywallBlock />` | 付费内容锁，按会员等级解锁 |
| `<PricingPlans />` | 完整定价页，年/月切换 + 支付入口 |
| `<AccountCenter />` | 账户状态、会员权益和 API 接入契约 |
| `<AudiencePathSelector />` | 三路人群引导跳转 |
| `<StepBar />` | 步骤进度条 |
| `<SummaryCard />` | 章节总结卡片 |

---

## License

本项目课程内容版权归作者所有，未经授权不得商业转载。
