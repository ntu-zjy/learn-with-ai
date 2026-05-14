# 部署说明

## 架构概览

```
代码推送（main 分支）
    ↓
GitHub Actions (.github/workflows/deploy.yml)
    ↓
Docker 多阶段构建
  阶段 1：node:20-alpine 构建 VitePress 静态文件
  阶段 2：nginx:alpine 托管静态文件
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
const base = isSealOS ? '/learn-with-ai/' : '/'
```

| 环境 | Base 路径 | 访问地址示例 |
|------|----------|------------|
| SealOS 生产 | `/learn-with-ai/` | `https://your-domain/learn-with-ai/zh-cn/` |
| 本地开发 | `/` | `http://localhost:5173/zh-cn/` |
| 本地预览 | `/` | `http://localhost:4173/zh-cn/` |

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

4. 点击「部署」，等待 Pod 变为 Running 状态
5. 复制 SealOS 分配的域名（格式为 `*.cloud.sealos.io`）

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

## 本地构建测试

```bash
# 模拟 SealOS 生产环境构建
SEALOS=1 npm run build

# 或直接构建 Docker 镜像
docker build -t learn-with-ai:local .

# 本地运行容器验证
docker run -p 8080:80 learn-with-ai:local
# 访问 http://localhost:8080/learn-with-ai/
```

## 常见问题

### 页面 404 / 样式丢失

**原因**：base 路径不匹配。

**排查**：检查访问 URL 是否包含 `/learn-with-ai/` 前缀。生产环境必须有此前缀，本地开发不需要。

### GitHub Actions 构建失败

**排查步骤**：
1. 检查 `DOCKER_PASSWORD` Secret 是否正确设置
2. 查看 Actions 日志中的具体报错（通常是 ESLint error 或 rollup 构建失败）
3. 本地运行 `npm run build` 复现错误

### VitePress 构建报 rollup 模块解析错误

**原因**：Vue 组件中存在对不存在文件的 import。

**解决**：检查所有 `import` 语句，确保被引用的文件实际存在。
