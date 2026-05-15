import { createServer } from 'node:http'
import { createHash, createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises'
import { createReadStream } from 'node:fs'
import { dirname, extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const rootDir = resolve(__dirname, '..')
const staticDir = resolve(process.env.STATIC_DIR || join(rootDir, 'docs/.vitepress/dist'))
const dataDir = resolve(process.env.DATA_DIR || join(rootDir, '.data'))
const port = Number(process.env.PORT || 80)

const siteUrl = normalizeSiteUrl(process.env.SITE_URL || process.env.PUBLIC_SITE_URL || `http://localhost:${port}`)
const jwtSecret = process.env.AUTH_SECRET || process.env.JWT_SECRET || 'learn-with-ai-dev-secret-change-me'
const tokenTtlDays = Number(process.env.AUTH_TOKEN_TTL_DAYS || 30)
const zpayPid = process.env.ZPAY_PID || ''
const zpayKey = process.env.ZPAY_KEY || ''
const zpayApi = process.env.ZPAY_API || 'https://zpayz.cn/submit.php'
const zpayMock = process.env.ZPAY_MOCK === '1'

const jsonPath = join(dataDir, 'store.json')

const planCatalog = {
  basic: {
    yearly: { name: 'Learn With AI 基础版年付', money: '99.00', months: 12 },
    monthly: { name: 'Learn With AI 基础版月付', money: '14.00', months: 1 }
  },
  pro: {
    yearly: { name: 'Learn With AI 进阶版年付', money: '299.00', months: 12 },
    monthly: { name: 'Learn With AI 进阶版月付', money: '39.00', months: 1 }
  },
  premium: {
    yearly: { name: 'Learn With AI 高级版年付', money: '599.00', months: 12 },
    monthly: { name: 'Learn With AI 高级版月付', money: '79.00', months: 1 }
  }
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
}

let storeLock = Promise.resolve()

async function main() {
  await ensureStore()

  const server = createServer((req, res) => {
    handleRequest(req, res).catch((error) => {
      console.error('[server] request failed:', error)
      sendJson(res, 500, { error: '服务器内部错误' })
    })
  })

  server.listen(port, '0.0.0.0', () => {
    console.log(`Learn With AI server listening on http://0.0.0.0:${port}`)
    console.log(`Static dir: ${staticDir}`)
    console.log(`Data dir: ${dataDir}`)
  })
}

async function handleRequest(req, res) {
  const url = new URL(req.url || '/', siteUrl)
  const pathname = normalizePathname(url.pathname)

  if (pathname === '/api/health') return sendJson(res, 200, { ok: true, ts: Date.now() })

  if (pathname === '/api/auth/register' && req.method === 'POST') return register(req, res)
  if (pathname === '/api/auth/login' && req.method === 'POST') return login(req, res)
  if ((pathname === '/api/auth/me' || pathname === '/api/membership') && req.method === 'GET') return membership(req, res)
  if (pathname === '/api/pay/create' && req.method === 'POST') return createPayment(req, res)
  if (pathname === '/api/pay/notify' && (req.method === 'GET' || req.method === 'POST')) return zpayNotify(req, res, url)
  if (pathname === '/api/pay/mock-callback' && req.method === 'GET') return mockPaymentCallback(req, res, url)
  if (pathname === '/api/chat' && req.method === 'POST') return proxyChat(req, res)

  if (pathname.startsWith('/api/')) return sendJson(res, 404, { error: '接口不存在' })

  return serveStatic(res, pathname)
}

async function register(req, res) {
  const body = await readJson(req)
  const email = normalizeEmail(body.email)
  const password = typeof body.password === 'string' ? body.password : ''
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 40) : ''

  if (!isEmail(email)) return sendJson(res, 400, { error: '邮箱格式不正确' })
  if (password.length < 6) return sendJson(res, 400, { error: '密码至少 6 位' })

  const result = await updateStore((store) => {
    const existing = store.users.find((user) => user.email === email)
    if (existing) return { status: 409, error: '邮箱已被注册' }

    const now = new Date().toISOString()
    const user = {
      id: `u_${randomId(16)}`,
      email,
      name,
      passwordHash: hashPassword(password),
      plan: 'free',
      expiresAt: '',
      createdAt: now,
      updatedAt: now
    }

    store.users.push(user)
    return { user }
  })

  if (result.error) return sendJson(res, result.status, { error: result.error })
  return sendAuth(res, result.user, 201)
}

async function login(req, res) {
  const body = await readJson(req)
  const email = normalizeEmail(body.email)
  const password = typeof body.password === 'string' ? body.password : ''

  if (!email || !password) return sendJson(res, 400, { error: '请填写邮箱和密码' })

  const store = await readStore()
  const user = store.users.find((item) => item.email === email)
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return sendJson(res, 401, { error: '邮箱或密码不正确' })
  }

  return sendAuth(res, user)
}

async function membership(req, res) {
  const auth = await requireAuth(req)
  if (!auth.ok) return sendJson(res, 401, { error: auth.error })

  return sendJson(res, 200, membershipPayload(auth.user))
}

async function createPayment(req, res) {
  const auth = await requireAuth(req)
  if (!auth.ok) return sendJson(res, 401, { error: auth.error })

  const body = await readJson(req)
  const plan = normalizePlan(body.plan)
  const billing = normalizeBilling(body.billing)
  const payType = normalizePayType(body.payType)
  const sku = planCatalog[plan]?.[billing]

  if (!sku) return sendJson(res, 400, { error: '套餐不存在' })
  if (!zpayMock && (!zpayPid || !zpayKey)) {
    return sendJson(res, 503, { error: 'ZPAY 未配置，请设置 ZPAY_PID 和 ZPAY_KEY' })
  }

  const outTradeNo = `lwa_${Date.now()}_${auth.user.id.slice(0, 8)}`
  const now = new Date().toISOString()
  const order = {
    id: `ord_${randomId(16)}`,
    outTradeNo,
    userId: auth.user.id,
    plan,
    billing,
    payType,
    money: sku.money,
    name: sku.name,
    status: 'pending',
    tradeNo: '',
    createdAt: now,
    paidAt: ''
  }

  await updateStore((store) => {
    store.orders.push(order)
    return {}
  })

  if (zpayMock) {
    return sendJson(res, 200, {
      payUrl: `${siteUrl}/api/pay/mock-callback?out_trade_no=${encodeURIComponent(outTradeNo)}`,
      outTradeNo,
      mock: true
    })
  }

  const params = {
    pid: zpayPid,
    type: payType,
    out_trade_no: outTradeNo,
    notify_url: `${siteUrl}/api/pay/notify`,
    return_url: `${siteUrl}/zh-cn/pricing/`,
    name: sku.name,
    money: sku.money,
    param: `${auth.user.id}|${plan}|${billing}`,
    sign_type: 'MD5'
  }
  params.sign = zpaySign(params, zpayKey)

  return sendJson(res, 200, {
    payUrl: `${zpayApi}?${new URLSearchParams(params).toString()}`,
    outTradeNo
  })
}

async function zpayNotify(req, res, url) {
  const params = req.method === 'GET' ? Object.fromEntries(url.searchParams.entries()) : await readForm(req)
  const sign = params.sign || ''

  if (!sign || !zpayKey) return sendText(res, 200, 'fail')
  if (zpaySign(params, zpayKey) !== sign) return sendText(res, 200, 'fail')
  if (params.trade_status !== 'TRADE_SUCCESS') return sendText(res, 200, 'ok')

  const result = await markOrderPaid({
    outTradeNo: params.out_trade_no,
    tradeNo: params.trade_no || '',
    money: params.money
  })

  return sendText(res, 200, result.ok ? 'success' : 'fail')
}

async function mockPaymentCallback(req, res, url) {
  if (!zpayMock) return sendJson(res, 403, { error: 'Mock 支付未启用' })

  const outTradeNo = url.searchParams.get('out_trade_no') || ''
  const result = await markOrderPaid({
    outTradeNo,
    tradeNo: `mock_${Date.now()}`,
    money: ''
  })

  if (!result.ok) return sendHtml(res, 400, '<h1>支付模拟失败</h1><p>订单不存在或金额不匹配。</p>')
  return redirect(res, `${siteUrl}/zh-cn/pricing/?payment=success&mock=1`)
}

async function markOrderPaid({ outTradeNo, tradeNo, money }) {
  if (!outTradeNo) return { ok: false }

  return updateStore((store) => {
    const order = store.orders.find((item) => item.outTradeNo === outTradeNo)
    if (!order) return { ok: false }
    if (money && Number(money).toFixed(2) !== Number(order.money).toFixed(2)) return { ok: false }
    if (order.status === 'paid') return { ok: true, alreadyPaid: true }

    const user = store.users.find((item) => item.id === order.userId)
    if (!user) return { ok: false }

    const now = new Date()
    const expiresAt = extendPlan(user.expiresAt, planCatalog[order.plan][order.billing].months, now)

    order.status = 'paid'
    order.tradeNo = tradeNo
    order.paidAt = now.toISOString()
    user.plan = order.plan
    user.expiresAt = expiresAt
    user.updatedAt = now.toISOString()

    return { ok: true }
  })
}

async function requireAuth(req) {
  const authorization = req.headers.authorization || ''
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''
  if (!token) return { ok: false, error: '未登录' }

  const payload = verifyToken(token)
  if (!payload) return { ok: false, error: '登录已失效' }

  const store = await readStore()
  const user = store.users.find((item) => item.id === payload.sub)
  if (!user) return { ok: false, error: '用户不存在' }

  return { ok: true, user }
}

function sendAuth(res, user, status = 200) {
  const token = signToken({
    sub: user.id,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + tokenTtlDays * 24 * 60 * 60
  })

  return sendJson(res, status, {
    token,
    user: publicUser(user)
  })
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name || '',
    plan: normalizeActivePlan(user),
    expiresAt: user.expiresAt || '',
    createdAt: user.createdAt
  }
}

function membershipPayload(user) {
  return {
    user: publicUser(user),
    plan: normalizeActivePlan(user),
    expiresAt: user.expiresAt || ''
  }
}

function normalizeActivePlan(user) {
  if (!user.expiresAt) return user.plan || 'free'
  return new Date(user.expiresAt).getTime() >= Date.now() ? user.plan : 'free'
}

function extendPlan(currentExpiresAt, months, now) {
  const current = currentExpiresAt ? new Date(currentExpiresAt) : now
  const base = current.getTime() > now.getTime() ? current : now
  base.setMonth(base.getMonth() + months)
  return base.toISOString()
}

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex')
  const hash = scryptSync(password, salt, 64).toString('hex')
  return `scrypt$${salt}$${hash}`
}

function verifyPassword(password, passwordHash) {
  const [scheme, salt, hash] = String(passwordHash || '').split('$')
  if (scheme !== 'scrypt' || !salt || !hash) return false

  const expected = Buffer.from(hash, 'hex')
  const actual = scryptSync(password, salt, expected.length)
  return expected.length === actual.length && timingSafeEqual(expected, actual)
}

function signToken(payload) {
  const encodedPayload = base64UrlEncode(JSON.stringify(payload))
  const signature = hmac(encodedPayload)
  return `${encodedPayload}.${signature}`
}

function verifyToken(token) {
  const [encodedPayload, signature] = String(token).split('.')
  if (!encodedPayload || !signature || hmac(encodedPayload) !== signature) return null

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload))
    if (!payload.exp || payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}

function hmac(value) {
  return createHmac('sha256', jwtSecret).update(value).digest('base64url')
}

function zpaySign(params, key) {
  const sorted = Object.keys(params)
    .filter((name) => name !== 'sign' && name !== 'sign_type' && params[name])
    .sort()
    .map((name) => `${name}=${params[name]}`)
    .join('&')
  return createHash('md5').update(sorted + key).digest('hex')
}

async function ensureStore() {
  await mkdir(dataDir, { recursive: true })
  try {
    await stat(jsonPath)
  } catch {
    await writeStore({ users: [], orders: [] })
  }
}

async function readStore() {
  await ensureStore()
  const raw = await readFile(jsonPath, 'utf-8')
  const parsed = JSON.parse(raw)
  return {
    users: Array.isArray(parsed.users) ? parsed.users : [],
    orders: Array.isArray(parsed.orders) ? parsed.orders : []
  }
}

async function writeStore(store) {
  await mkdir(dataDir, { recursive: true })
  const tempPath = `${jsonPath}.${process.pid}.${Date.now()}.tmp`
  await writeFile(tempPath, `${JSON.stringify(store, null, 2)}\n`)
  await rename(tempPath, jsonPath)
}

function updateStore(mutator) {
  const next = storeLock.then(async () => {
    const store = await readStore()
    const result = mutator(store) || {}
    if (!result.error) await writeStore(store)
    return result
  })
  storeLock = next.catch(() => {})
  return next
}

async function readJson(req) {
  const text = await readText(req)
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch {
    return {}
  }
}

async function readForm(req) {
  const text = await readText(req)
  return Object.fromEntries(new URLSearchParams(text).entries())
}

function readText(req) {
  return new Promise((resolveText, reject) => {
    let text = ''
    req.setEncoding('utf8')
    req.on('data', (chunk) => {
      text += chunk
      if (text.length > 1024 * 1024) {
        req.destroy()
        reject(new Error('request body too large'))
      }
    })
    req.on('end', () => resolveText(text))
    req.on('error', reject)
  })
}

async function serveStatic(res, pathname) {
  const decoded = decodeURIComponent(pathname)
  const requested = decoded.endsWith('/') ? `${decoded}index.html` : decoded
  const candidates = [
    resolveStaticPath(requested),
    resolveStaticPath(`${decoded}/index.html`),
    resolveStaticPath('/index.html')
  ]

  for (const candidate of candidates) {
    if (!candidate) continue
    const found = await fileExists(candidate)
    if (!found) continue

    const contentType = mimeTypes[extname(candidate)] || 'application/octet-stream'
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': isImmutableAsset(candidate) ? 'public, max-age=31536000, immutable' : 'no-cache'
    })
    createReadStream(candidate).pipe(res)
    return
  }

  sendText(res, 404, 'Not Found')
}

function resolveStaticPath(pathname) {
  const relative = normalize(pathname).replace(/^(\.\.[/\\])+/, '').replace(/^[/\\]/, '')
  const resolved = resolve(staticDir, relative)
  return resolved.startsWith(staticDir) ? resolved : null
}

async function fileExists(path) {
  try {
    const stats = await stat(path)
    return stats.isFile()
  } catch {
    return false
  }
}

function sendJson(res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  })
  res.end(JSON.stringify(body))
}

function sendText(res, status, text) {
  res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' })
  res.end(text)
}

function sendHtml(res, status, html) {
  res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' })
  res.end(html)
}

function redirect(res, location) {
  res.writeHead(302, { Location: location })
  res.end()
}

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : ''
}

function isEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function normalizePlan(plan) {
  return ['basic', 'pro', 'premium'].includes(plan) ? plan : ''
}

function normalizeBilling(billing) {
  return billing === 'monthly' ? 'monthly' : 'yearly'
}

function normalizePayType(payType) {
  return payType === 'wxpay' ? 'wxpay' : 'alipay'
}

function normalizePathname(pathname) {
  return pathname.replace(/\/{2,}/g, '/')
}

async function proxyChat(req, res) {
  const apiKey = process.env.OPENROUTER_API_KEY
  const model = process.env.OPENROUTER_MODEL || 'deepseek/deepseek-chat-v3-0324:free'

  if (!apiKey) {
    return sendJson(res, 503, { error: 'AI 服务未配置，请联系管理员' })
  }

  let body
  try {
    body = await readText(req)
  } catch {
    return sendJson(res, 400, { error: '请求格式错误' })
  }

  let payload
  try {
    payload = JSON.parse(body)
  } catch {
    return sendJson(res, 400, { error: '请求格式错误' })
  }

  let upstream
  try {
    upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': siteUrl,
        'X-Title': 'Learn With AI',
      },
      body: JSON.stringify({ ...payload, model, stream: true }),
    })
  } catch (e) {
    console.error('[proxyChat] upstream fetch error:', e)
    return sendJson(res, 502, { error: 'AI 服务连接失败，请稍后重试' })
  }

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => '')
    console.error('[proxyChat] upstream error', upstream.status, text)
    let msg = `AI 服务错误 (${upstream.status})`
    try {
      const parsed = JSON.parse(text)
      msg = parsed.error?.message || parsed.message || msg
    } catch { /* ignore */ }
    return sendJson(res, upstream.status >= 500 ? 502 : upstream.status, { error: msg })
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  })

  const reader = upstream.body.getReader()
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      res.write(value)
    }
  } catch (e) {
    console.error('[proxyChat] stream read error:', e)
  } finally {
    res.end()
  }
}

function stripTrailingSlash(value) {
  return String(value).replace(/\/$/, '')
}

function normalizeSiteUrl(value) {
  const raw = stripTrailingSlash(value || '')
  if (!raw) return `http://localhost:${port}`
  if (/^https?:\/\//i.test(raw)) return raw
  return `https://${raw}`
}

function randomId(bytes = 12) {
  return randomBytes(bytes).toString('hex')
}

function base64UrlEncode(value) {
  return Buffer.from(value).toString('base64url')
}

function base64UrlDecode(value) {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function isImmutableAsset(path) {
  return /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff2?|ttf)$/i.test(path)
}

main().catch((error) => {
  console.error('[server] failed to start:', error)
  process.exit(1)
})
