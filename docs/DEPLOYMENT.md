# 部署说明

## 架构概览

```
代码推送（main 分支）
    ↓
GitHub Actions (.github/workflows/deploy.yml)
    ↓
Docker 多阶段构建
  阶段 1：node:20-alpine 构建 VitePress 静态文件
  阶段 2：node:20-alpine 运行 server/index.mjs
    ├── 托管 VitePress 静态文件
    └── 提供 /api/auth/*、/api/membership、/api/pay/*
    ↓
推送镜像到 Docker Hub
  jingyuanzzz/learn-with-ai:latest
  jingyuanzzz/learn-with-ai:<commit-sha>
    ↓
SealOS 新加坡区 App Launchpad 部署（手动触发重新部署）
```

## Base 路径适配

VitePress 的 base 路径根据环境变量自动切换：

```javascript
// docs/.vitepress/config.mjs
const isSealOS = process.env.SEALOS === '1'
const base = isSealOS ? '/' : '/learn-with-ai/'
```

| 环境 | Base 路径 | 访问地址示例 |
|------|----------|------------|
| SealOS 生产 | `/` | `https://your-domain/zh-cn/` |
| 本地开发 | `/learn-with-ai/` | `http://localhost:5173/learn-with-ai/zh-cn/` |
| 本地预览 | `/learn-with-ai/` | `http://localhost:4173/learn-with-ai/zh-cn/` |

Dockerfile 中已设置 `ENV SEALOS=1`，构建时自动使用生产 base 路径。

## SealOS 初次部署

1. 登录 [cloud.sealos.io](https://cloud.sealos.io)，切换到**新加坡区**
2. 打开 **App Launchpad** → 点击「新建应用」
3. 填写以下配置：

| 字段 | 值 |
|------|---|
| 应用名称 | `learn-with-ai` |
| 镜像 | `jingyuanzzz/learn-with-ai:latest` |
| CPU | 0.1 核 |
| 内存 | 128 MB |
| 副本数 | 1 |
| 容器端口 | `80` |
| 开放外网访问 | 开启，端口 `80` |

4. 配置环境变量：

| 环境变量 | 说明 |
|---------|------|
| `AUTH_SECRET` | 登录 token 签名密钥，生产环境必须设置为足够长的随机字符串 |
| `SITE_URL` | SealOS 外网域名，例如 `https://xxx.cloud.sealos.io` |
| `DATA_DIR` | 数据持久化目录，默认 `/data` |
| `ZPAY_PID` | ZPAY 商户 PID |
| `ZPAY_KEY` | ZPAY 商户密钥 |
| `ZPAY_API` | 默认 `https://zpayz.cn/submit.php` |
| `ZPAY_MOCK` | 留空为真实支付，设为 `1` 使用 Mock 支付 |

5. 给 `/data` 挂载持久化存储，避免用户、订单和会员权益在 Pod 重建后丢失
6. 点击「部署」，等待 Pod 变为 Running 状态
7. 复制 SealOS 分配的域名（格式为 `*.cloud.sealos.io`），并回填到 `SITE_URL`

## 更新部署

每次推送 main 分支后，GitHub Actions 自动更新镜像。然后：

1. 进入 SealOS App Launchpad → 找到 `learn-with-ai` 应用
2. 点击「重新部署」（或修改镜像 Tag 为最新 commit SHA）
3. 等待新 Pod 启动完成

## GitHub Actions 配置

`.github/workflows/deploy.yml` 使用以下 Secret，需在 GitHub 仓库设置中配置：

| Secret 名称 | 值 |
|------------|---|
| `DOCKER_PASSWORD` | Docker Hub 账号 `jingyuanzzz` 的密码或 Access Token |

设置路径：GitHub 仓库 → Settings → Secrets and variables → Actions → New repository secret

## 登录与支付配置

站点镜像内置了轻量 Node API 服务。订单创建、支付签名、ZPAY 回调验签和会员权益写入都在 `server/index.mjs` 中完成，不会把 ZPAY 密钥暴露到浏览器。

前端默认使用同源 API，无需额外配置 Vite 变量：

| 环境变量 | 用途 |
|---------|------|
| `VITE_AUTH_LOGIN_URL` | 外部登录入口，可选，前端会附带 `returnTo` 参数 |
| `VITE_AUTH_LOGOUT_URL` | 退出登录入口，可选，前端会附带 `returnTo` 参数 |
| `VITE_AUTH_LOGIN_API_URL` | 站内登录 API，返回 `token` 和 `user` |
| `VITE_AUTH_REGISTER_API_URL` | 站内注册 API，返回 `token` 和 `user` |
| `VITE_MEMBERSHIP_API_URL` | 会员状态查询接口，使用 Cookie 或 Bearer Token 识别用户 |
| `VITE_ZPAY_CHECKOUT_API_URL` | 后端创建 ZPAY 支付订单接口，返回 `payUrl` |

同源默认值如下：

| 功能 | 默认地址 |
|------|---------|
| 登录 | `/api/auth/login` |
| 注册 | `/api/auth/register` |
| 当前用户 / 会员权益 | `/api/auth/me` |
| ZPAY 创建订单 | `/api/pay/create` |
| ZPAY 异步回调 | `/api/pay/notify` |

接口返回格式约定：

```json
// GET VITE_MEMBERSHIP_API_URL
{
  "user": { "id": "u_123", "name": "张同学", "email": "user@example.com" },
  "plan": "pro",
  "expiresAt": "2027-05-14T00:00:00.000Z"
}
```

```json
// POST VITE_ZPAY_CHECKOUT_API_URL
{
  "plan": "pro",
  "billing": "yearly",
  "payType": "alipay",
  "returnUrl": "https://site/zh-cn/pricing/",
  "cancelUrl": "https://site/zh-cn/pricing/"
}
```

```json
// Response 200
{
  "payUrl": "https://zpayz.cn/submit.php?..."
}
```

ZPAY 的 `ZPAY_PID`、`ZPAY_KEY`、签名算法、异步回调验签和订单查询方式见 [`docs/PAYMENT_ZPAY.md`](./PAYMENT_ZPAY.md)。这些密钥只能放在服务端环境变量中，不能放进 `VITE_*` 前端变量。

## 本地构建测试

```bash
# 模拟 SealOS 生产环境构建
SEALOS=1 npm run build

# 或直接构建 Docker 镜像
docker build -t learn-with-ai:local .

# 本地运行容器验证
docker run -p 8080:80 learn-with-ai:local
# 访问 http://localhost:8080/zh-cn/
```

## 常见问题

### 页面 404 / 样式丢失

**原因**：base 路径不匹配。

**排查**：SealOS 生产环境访问根路径 `/zh-cn/`；本地 VitePress dev/preview 默认带 `/learn-with-ai/` 前缀。

### GitHub Actions 构建失败

**排查步骤**：
1. 检查 `DOCKER_PASSWORD` Secret 是否正确设置
2. 查看 Actions 日志中的具体报错（通常是 ESLint error 或 rollup 构建失败）
3. 本地运行 `npm run build` 复现错误

### VitePress 构建报 rollup 模块解析错误

**原因**：Vue 组件中存在对不存在文件的 import。

**解决**：检查所有 `import` 语句，确保被引用的文件实际存在。
