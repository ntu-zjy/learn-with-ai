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

### 第一步：推送代码

```bash
git add .
git commit -m "feat: 你的改动描述"
git push origin main
```

Husky pre-push hook 会自动跑一次强制构建验证，通过后才会真正 push。

### 第二步：等 Actions 完成

```bash
gh run list --repo ntu-zjy/learn-with-ai --limit 3
```

看最新一条变成 `completed success` 即可（通常 1-2 分钟）。

也可以在浏览器查看：https://github.com/ntu-zjy/learn-with-ai/actions

### 第三步：SSH 登录服务器更新镜像

```bash
ssh root@118.25.82.34
```

登录后执行：

```bash
# 拉取最新镜像
docker pull jingyuanzzz/learn-with-ai:latest

# 停止并删除旧容器
docker stop learn-with-ai && docker rm learn-with-ai

# 启动新容器（所有环境变量）
docker run -d --name learn-with-ai --restart always \
  -p 3000:80 \
  -v /data/learn-with-ai:/data \
  -e DATA_DIR=/data \
  -e SITE_URL=https://learn-with-ai.site \
  -e AUTH_SECRET=828815ee67ef4eaf47f01ad2e8677cebb4631bc0a69032ce40c35ec80fd0f20d \
  -e ZPAY_PID=2088532797471982 \
  -e ZPAY_KEY=lgB4Pj67NjYF1RUxYiavF1BfRnyWYUYc \
  -e ZPAY_API=https://zpayz.cn/submit.php \
  jingyuanzzz/learn-with-ai:latest

# 验证容器正常运行
docker ps
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/zh-cn/
```

最后一行应该返回 `200`。

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
| `ZPAY_MOCK` | 设为 `1` 则跳过真实支付（本地调试用），生产环境留空 |

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
