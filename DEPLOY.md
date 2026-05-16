# 部署文档

## 架构概览

```
本地代码
   │
   │ git push origin main
   ▼
GitHub (ntu-zjy/learn-with-ai)
   │
   │ GitHub Actions 自动触发（.github/workflows/deploy.yml）
   │ 构建 Docker 镜像，推送到 Docker Hub
   ▼
Docker Hub (jingyuanzzz/learn-with-ai:latest)
   │
   │ 手动 SSH 登录服务器，拉取新镜像并重启容器
   ▼
腾讯云轻量服务器 (118.25.82.34)
   │
   │ 容器监听 3000 端口
   │ Nginx 反向代理 80 → 3000
   ▼
用户访问 http://learn-with-ai.site（备案通过后为 https）
```

**第一段（本地 → Docker Hub）是全自动的**，push 即触发。  
**第二段（Docker Hub → 服务器）是手动的**，需要 SSH 上去执行更新命令。

---

## 日常发布流程

> **注意**：腾讯云大陆服务器无法直连 Docker Hub（被墙），也无法通过镜像加速拉取个人账号镜像。
> 标准流程是：本地 push → 服务器 git pull → 服务器本地 docker build。

### 第一步：推送代码

```bash
git add .
git commit -m "feat: 你的改动描述"
git push origin main
```

Husky pre-push hook 会自动跑一次强制构建验证，通过后才会真正 push。

### 第二步：SSH 登录服务器，拉代码并重新 build

```bash
ssh root@118.25.82.34
```

登录后执行：

```bash
# 拉取最新代码
cd /opt/learn-with-ai && git pull origin main

# 重新构建镜像（基础镜像走腾讯云镜像源，约 1-3 分钟）
docker build -t learn-with-ai:latest .

# 停止旧容器并启动新容器
docker stop learn-with-ai && docker rm learn-with-ai && \
docker run -d --name learn-with-ai --restart always \
  -p 3000:80 \
  -v /data/learn-with-ai:/data \
  -e DATA_DIR=/data \
  -e SITE_URL=https://learn-with-ai.site \
  -e AUTH_SECRET=828815ee67ef4eaf47f01ad2e8677cebb4631bc0a69032ce40c35ec80fd0f20d \
  -e ZPAY_PID=2088532797471982 \
  -e ZPAY_KEY=lgB4Pj67NjYF1RUxYiavF1BfRnyWYUYc \
  -e ZPAY_API=https://zpayz.cn/submit.php \
  -e ZPAY_MOCK=1 \
  -e OPENROUTER_API_KEY=你的Key \
  -e OPENROUTER_MODEL=nvidia/nemotron-3-super-120b-a12b:free \
  learn-with-ai:latest

# 验证容器正常运行
curl -s -o /dev/null -w "HTTP状态码: %{http_code}\n" http://localhost:3000/zh-cn/
```

最后一行应该返回 `HTTP状态码: 200`。

### 为什么不用 Docker Hub？

| 方式 | 问题 |
|------|------|
| `docker pull jingyuanzzz/...` | Docker Hub 在国内被墙，超时 |
| 腾讯云镜像加速 | 只缓存官方镜像，不缓存个人账号镜像 |
| 服务器本地 build | ✅ 可行，GitHub 在国内可访问，基础镜像走腾讯云镜像源 |

---

## 服务器信息

| 项目 | 值 |
|------|---|
| IP | 118.25.82.34 |
| 系统 | OpenCloudOS 9（腾讯云定制 Linux） |
| Docker 版本 | v29.5.0 |
| 容器名 | learn-with-ai |
| 容器内端口 | 80 |
| 宿主机映射端口 | 3000 |
| Nginx 监听 | 80 → 3000 |
| 数据目录 | /data/learn-with-ai |
| 源码备份 | /opt/learn-with-ai |

---

## 环境变量说明

| 变量 | 说明 |
|------|------|
| `SITE_URL` | 网站域名，影响支付回调地址 |
| `DATA_DIR` | 用户数据持久化目录（容器内路径） |
| `AUTH_SECRET` | JWT 签名密钥，勿泄露 |
| `ZPAY_PID` | ZPAY 商户 ID |
| `ZPAY_KEY` | ZPAY 签名密钥，勿泄露 |
| `ZPAY_API` | ZPAY 支付接口地址 |
| `ZPAY_MOCK` | 设为 `1` 则跳过真实支付（备案通过前保持 1），生产环境留空 |
| `OPENROUTER_API_KEY` | OpenRouter API Key，用于 AI 对话功能 |
| `OPENROUTER_MODEL` | 模型 ID，默认 `nvidia/nemotron-3-super-120b-a12b:free`（免费） |

本地备份文件：`.env.local`（已加入 `.gitignore`，不会提交到 git）。

---

## Nginx 配置

文件位置：`/etc/nginx/conf.d/learn-with-ai.conf`

```nginx
server {
    listen 80;
    server_name learn-with-ai.site www.learn-with-ai.site;
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

备案通过后 certbot 会自动在此文件追加 443 配置：

```bash
certbot --nginx -d learn-with-ai.site -d www.learn-with-ai.site
```

---

## 备案通过后的检查清单

- [ ] 运行 `certbot --nginx -d learn-with-ai.site -d www.learn-with-ai.site` 申请 SSL
- [ ] 确认 SITE_URL 已为 `https://learn-with-ai.site`（当前已是）
- [ ] 登录 ZPAY 后台，将回调地址改为 `https://learn-with-ai.site/api/pay/notify`
- [ ] 在 `docs/.vitepress/theme/Layout.vue` 底部添加备案号展示
- [ ] 测试完整支付流程（支付宝 + 微信）
- [ ] 确认无误后关闭 SealOS 节省费用

---

## 常用运维命令

```bash
# 查看容器日志（最近 100 行）
docker logs learn-with-ai --tail 100

# 实时追踪日志
docker logs learn-with-ai -f

# 查看容器状态
docker ps

# 进入容器 shell（排查问题）
docker exec -it learn-with-ai sh

# 重启容器（不更新镜像）
docker restart learn-with-ai

# 查看 Nginx 状态
systemctl status nginx

# 重载 Nginx 配置
nginx -s reload
```
