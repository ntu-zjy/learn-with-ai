# ZPAY 支付接入文档

> 服务商：z-pay.cn（与易支付接口兼容）
> 文档来源：https://member.z-pay.cn/member/doc.html

---

## 商户信息（Learn With AI）

| 字段 | 值 |
|------|-----|
| 商户 PID（API安全页） | 通过后端环境变量 `ZPAY_PID` 配置 |
| 渠道商户号（支付宝侧） | 通过后台配置查询，不写入仓库 |
| 商户密钥 KEY | 通过后端环境变量 `ZPAY_KEY` 配置，禁止写入前端或公开仓库 |

---

## 环境变量配置（服务端）

```env
ZPAY_PID=your_zpay_pid
ZPAY_KEY=your_zpay_key
ZPAY_API=https://zpayz.cn/submit.php
SITE_URL=https://your-learn-with-ai-domain.example.com
ZPAY_MOCK=                        # 留空 = 真实支付；设为 1 = Mock 模式
```

---

## 接口一览

### 1. 页面跳转支付（Learn With AI 推荐方式）

**URL**：`https://zpayz.cn/submit.php`
**方法**：POST 或 GET（推荐 POST）

| 参数 | 名称 | 必填 | 说明 |
|------|------|------|------|
| `pid` | 商户 ID | 是 | |
| `type` | 支付方式 | 是 | `wxpay` / `alipay` |
| `out_trade_no` | 商户订单号 | 是 | 唯一，最多 32 位 |
| `notify_url` | 异步回调地址 | 是 | 不支持带参数的 URL |
| `return_url` | 支付完成跳转页 | 是 | 不支持带参数的 URL |
| `name` | 商品名称 | 是 | 需体现具体商品，避免被封 |
| `money` | 金额 | 是 | 最多 2 位小数，单位元 |
| `param` | 附加内容 | 否 | 会原样随 notify_url 返回 |
| `sign` | MD5 签名 | 是 | 见签名算法 |
| `sign_type` | 签名方式 | 是 | 固定 `MD5` |
| `cid` | 渠道 ID | 否 | 多个用逗号隔开，不填随机调用 |

**成功**：直接跳转到收银台付款页
**失败**：`{"code":"error","msg":"具体错误信息"}`

---

### 2. API 接口支付（服务端调起，返回二维码/跳转链接）

**URL**：`https://zpayz.cn/mapi.php`
**方法**：POST（form-data）

额外必填参数（相比页面跳转方式）：
- `clientip`：用户 IP 地址
- `device`：设备类型（`pc` / 移动端 UA，默认 `pc`）

成功返回额外字段：
- `payurl`：直接跳转链接
- `qrcode`：二维码内容 URL
- `img`：二维码图片地址

---

### 3. 支付结果通知（回调）

**触发方式**：支付成功后，ZPAY 服务器主动 GET 请求 `notify_url`
**必须返回**：纯字符串 `success`，否则会按频率重试（0/15/15/30/180/1800s...）

回调参数：

| 参数 | 说明 |
|------|------|
| `pid` | 商户 ID |
| `out_trade_no` | 商户订单号 |
| `trade_no` | ZPAY 内部订单号 |
| `trade_status` | **只有 `TRADE_SUCCESS` 表示成功** |
| `money` | 订单金额 |
| `name` | 商品名称 |
| `param` | 原样返回的附加内容 |
| `type` | 支付方式（`alipay` / `wxpay`） |
| `sign` | MD5 签名（需验证） |
| `sign_type` | `MD5` |

**验证要点**：
1. 验证 `sign` 签名是否与自己计算的一致
2. 校验 `money` 是否与订单金额吻合（防止假通知）
3. 检查订单是否已处理过（幂等）

---

### 4. 查询单个订单

**URL**：`GET https://zpayz.cn/api.php?act=order&pid={PID}&key={KEY}&out_trade_no={订单号}`

返回字段包含 `status`（1=已支付，0=未支付）。

---

### 5. 申请退款

**URL**：`POST https://zpayz.cn/api.php?act=refund`

| 参数 | 说明 |
|------|------|
| `pid` | 商户 ID |
| `key` | 商户密钥 |
| `trade_no` 或 `out_trade_no` | 二选一 |
| `money` | 退款金额（大多数通道须与原订单一致） |

---

## MD5 签名算法

```
1. 取所有参数（排除 sign、sign_type、空值）
2. 按参数名 ASCII 升序排列
3. 拼接为 key=value&key=value 格式（值不做 URL 编码）
4. 末尾拼接商户密钥 KEY
5. 对整体字符串做 MD5，结果小写
```

后端签名实现示例：

```typescript
function zpaySign(params: Record<string, string>, key: string): string {
  const sorted = Object.keys(params)
    .filter((k) => k !== "sign" && k !== "sign_type" && params[k])
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&")
  const { createHash } = require("crypto")
  return createHash("md5").update(sorted + key).digest("hex")
}
```

---

## Learn With AI 支付流程

前端套餐 ID 与金额：

| plan | billing | 商品名建议 | 金额 |
|------|---------|------------|------|
| `basic` | `yearly` | Learn With AI 基础版年付 | `99.00` |
| `basic` | `monthly` | Learn With AI 基础版月付 | `14.00` |
| `pro` | `yearly` | Learn With AI 进阶版年付 | `299.00` |
| `pro` | `monthly` | Learn With AI 进阶版月付 | `39.00` |
| `premium` | `yearly` | Learn With AI 高级版年付 | `599.00` |
| `premium` | `monthly` | Learn With AI 高级版月付 | `79.00` |

```
前端 POST /api/pay/create { plan, billing, payType }
  ↓
后端生成 out_trade_no，拼接 ZPAY 参数 + 签名
  ↓
返回 { payUrl }，前端跳转到 payUrl
  ↓
用户在 ZPAY 收银台完成支付
  ↓
ZPAY GET /api/pay/notify（异步回调）
  ↓
后端验签 → 更新 users.plan / subscriptions → 写入订单流水
  ↓
用户浏览器跳回 SITE_URL/zh-cn/pricing/
```

**Learn With AI 的 notify_url**：`{SITE_URL}/api/pay/notify`
**Learn With AI 的 return_url**：`{SITE_URL}/zh-cn/pricing/`

---

## 注意事项

- `notify_url` 和 `return_url` **不能带查询参数**（ZPAY 限制）
- 订单号 `out_trade_no` 生成规则建议：`lwa_{timestamp}_{userId前8位}`
- 真实支付时 `ZPAY_MOCK` 必须为空或不设置
- Mock 模式（`ZPAY_MOCK=1`）下 `notify_url` 不会被调用，走 `/pay/mock-callback` 本地路由
