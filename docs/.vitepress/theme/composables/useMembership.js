import { computed, readonly, ref } from 'vue'

const STORAGE_KEY = 'learn-with-ai:membership'
const TOKEN_KEY = 'learn-with-ai:auth-token'
const PENDING_CHECKOUT_KEY = 'learn-with-ai:pending-checkout'

const PLAN_LEVELS = {
  free: 0,
  basic: 1,
  pro: 2,
  premium: 3
}

const PLAN_NAMES = {
  free: '免费体验',
  basic: 'AI 学习者',
  pro: 'AI 实践者',
  premium: 'AI 掌控者'
}

const state = ref({
  loading: false,
  user: null,
  plan: 'free',
  expiresAt: '',
  error: '',
  lastSyncedAt: ''
})

let initialized = false

function isBrowser() {
  return typeof window !== 'undefined'
}

function env(name) {
  return import.meta.env?.[name] || ''
}

function getMembershipApiUrl() {
  return env('VITE_MEMBERSHIP_API_URL') || env('VITE_AUTH_ME_API_URL') || '/api/auth/me'
}

function getLoginUrl() {
  return env('VITE_AUTH_LOGIN_URL')
}

function getLoginApiUrl() {
  return env('VITE_AUTH_LOGIN_API_URL') || '/api/auth/login'
}

function getRegisterApiUrl() {
  return env('VITE_AUTH_REGISTER_API_URL') || '/api/auth/register'
}

function getLogoutUrl() {
  return env('VITE_AUTH_LOGOUT_URL')
}

function getCheckoutApiUrl() {
  return env('VITE_ZPAY_CHECKOUT_API_URL') || env('VITE_CHECKOUT_API_URL') || '/api/pay/create'
}

function normalizePlan(plan) {
  const value = String(plan || 'free').toLowerCase()
  if (value.includes('premium') || value.includes('高级') || value.includes('旗舰') || value.includes('掌控')) return 'premium'
  if (value.includes('pro') || value.includes('advance') || value.includes('进阶') || value.includes('实践')) return 'pro'
  if (value.includes('basic') || value.includes('基础') || value.includes('学习者')) return 'basic'
  return 'free'
}

function normalizeMembership(payload = {}) {
  const subscription = payload.subscription || payload.entitlement || {}
  const user =
    payload.user ||
    payload.profile ||
    (payload.id || payload.email
      ? {
          id: payload.id,
          email: payload.email,
          name: payload.name || payload.display_name || payload.nickname
        }
      : null)
  const plan = normalizePlan(payload.plan || subscription.plan || subscription.tier)
  const expiresAt = payload.expiresAt || subscription.expiresAt || subscription.currentPeriodEnd || ''

  return {
    loading: false,
    user,
    plan,
    expiresAt,
    error: '',
    lastSyncedAt: new Date().toISOString()
  }
}

function readStoredMembership() {
  if (!isBrowser()) return null

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeStoredMembership(value) {
  if (!isBrowser()) return

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  } catch {
    // Ignore storage failures; membership will be reloaded from the API.
  }
}

function clearStoredMembership() {
  if (!isBrowser()) return

  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore storage failures.
  }
}

function readToken() {
  if (!isBrowser()) return ''

  try {
    return window.localStorage.getItem(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

function writeToken(token) {
  if (!isBrowser() || !token) return

  try {
    window.localStorage.setItem(TOKEN_KEY, token)
  } catch {
    // Ignore storage failures.
  }
}

function clearToken() {
  if (!isBrowser()) return

  try {
    window.localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Ignore storage failures.
  }
}

function authHeaders() {
  const token = readToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

function applyMembership(payload) {
  const membershipPayload = payload.user
    ? {
        ...payload.user,
        plan: payload.plan || payload.user.plan,
        expiresAt: payload.expiresAt || payload.user.expiresAt,
        subscription: payload.subscription || payload.entitlement
      }
    : payload
  const nextState = normalizeMembership(membershipPayload)
  state.value = nextState
  writeStoredMembership(nextState)
  return nextState
}

function resetMembership(error = '') {
  state.value = {
    loading: false,
    user: null,
    plan: 'free',
    expiresAt: '',
    error,
    lastSyncedAt: ''
  }
  clearStoredMembership()
  clearToken()
}

function buildRedirectUrl(rawUrl, params = {}) {
  const url = new URL(rawUrl, window.location.origin)
  Object.entries(params).forEach(([key, value]) => {
    if (value && !url.searchParams.has(key)) url.searchParams.set(key, value)
  })
  return url.toString()
}

function currentUrlWithoutCheckoutParams() {
  const url = new URL(window.location.href)
  const keys = ['checkout', 'payment', 'plan', 'billing', 'session_id']
  keys.forEach((key) => url.searchParams.delete(key))
  return url.toString()
}

function rememberPendingCheckout(payload) {
  if (!isBrowser()) return

  try {
    window.sessionStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify(payload))
  } catch {
    // Ignore storage failures.
  }
}

function consumePendingCheckout() {
  if (!isBrowser()) return null

  try {
    const raw = window.sessionStorage.getItem(PENDING_CHECKOUT_KEY)
    window.sessionStorage.removeItem(PENDING_CHECKOUT_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function requiredPlanFromLabel(label = '') {
  return normalizePlan(label)
}

export function planName(plan = 'free') {
  return PLAN_NAMES[normalizePlan(plan)] || PLAN_NAMES.free
}

export function planLevel(plan = 'free') {
  return PLAN_LEVELS[normalizePlan(plan)] ?? 0
}

export function canPlanAccess(currentPlan, requiredPlan) {
  return planLevel(currentPlan) >= planLevel(requiredPlan)
}

export async function refreshMembership() {
  if (!isBrowser()) return state.value

  const apiUrl = getMembershipApiUrl()
  if (!apiUrl) {
    const stored = readStoredMembership()
    if (stored) state.value = { ...state.value, ...stored, loading: false }
    return state.value
  }

  state.value = { ...state.value, loading: true, error: '' }

  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      credentials: 'include',
      headers: { Accept: 'application/json', ...authHeaders() }
    })

    if (response.status === 401) {
      resetMembership()
      return state.value
    }

    if (!response.ok) throw new Error(`会员状态接口返回 ${response.status}`)

    const payload = await response.json()
    return applyMembership(payload)
  } catch (error) {
    state.value = {
      ...state.value,
      loading: false,
      error: error instanceof Error ? error.message : '会员状态同步失败'
    }
    return state.value
  }
}

export function startLogin() {
  if (!isBrowser()) return false

  const loginUrl = getLoginUrl()
  if (!loginUrl) {
    const target = new URL('/zh-cn/login/', window.location.origin)
    target.searchParams.set('returnTo', window.location.href)
    window.location.href = target.toString()
    return true
  }

  window.location.href = buildRedirectUrl(loginUrl, {
    returnTo: window.location.href
  })
  return true
}

export async function logout() {
  if (!isBrowser()) return

  const logoutUrl = getLogoutUrl()
  resetMembership()

  if (logoutUrl) {
    window.location.href = buildRedirectUrl(logoutUrl, {
      returnTo: currentUrlWithoutCheckoutParams()
    })
  }
}

async function authenticateWithPassword(apiUrl, { email, password, name }) {
  if (!isBrowser()) return false

  if (!apiUrl) {
    state.value = { ...state.value, error: '未配置登录或注册 API' }
    return false
  }

  state.value = { ...state.value, loading: true, error: '' }

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, name, display_name: name })
    })
    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data.error || data.message || `认证接口返回 ${response.status}`)
    }

    if (data.token) writeToken(data.token)
    applyMembership(data)
    return true
  } catch (error) {
    state.value = {
      ...state.value,
      loading: false,
      error: error instanceof Error ? error.message : '登录失败'
    }
    return false
  }
}

export function loginWithPassword(payload) {
  return authenticateWithPassword(getLoginApiUrl(), payload)
}

export function registerWithPassword(payload) {
  return authenticateWithPassword(getRegisterApiUrl(), payload)
}

export async function startCheckout({ plan, billing, payType = 'alipay' }) {
  if (!isBrowser()) return false

  const normalizedPlan = normalizePlan(plan)
  if (normalizedPlan === 'free') {
    window.location.href = '/zh-cn/free/why-different/'
    return true
  }

  const checkoutApiUrl = getCheckoutApiUrl()
  const payload = {
    plan: normalizedPlan,
    billing,
    payType,
    returnUrl: `${window.location.origin}/zh-cn/pricing/`,
    cancelUrl: `${window.location.origin}/zh-cn/pricing/`
  }

  if (!state.value.user) {
    rememberPendingCheckout(payload)
    const loginStarted = startLogin()
    if (!loginStarted) state.value = { ...state.value, error: '请先配置登录系统，再发起支付' }
    return loginStarted
  }

  if (!checkoutApiUrl) {
    state.value = { ...state.value, error: '未配置 ZPAY 创建支付接口 VITE_ZPAY_CHECKOUT_API_URL' }
    return false
  }

  state.value = { ...state.value, loading: true, error: '' }

  try {
    const response = await fetch(checkoutApiUrl, {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...authHeaders()
      },
      body: JSON.stringify(payload)
    })

    if (response.status === 401) {
      rememberPendingCheckout(payload)
      startLogin()
      return true
    }

    if (!response.ok) throw new Error(`支付接口返回 ${response.status}`)

    const data = await response.json()
    const redirectUrl = data.payUrl || data.url || data.checkoutUrl || data.redirectUrl
    if (!redirectUrl) throw new Error('支付接口未返回 checkout URL')

    window.location.href = redirectUrl
    return true
  } catch (error) {
    state.value = {
      ...state.value,
      loading: false,
      error: error instanceof Error ? error.message : '支付创建失败'
    }
    return false
  }
}

export async function resumePendingCheckout() {
  const pending = consumePendingCheckout()
  if (!pending) return false
  await refreshMembership()
  if (!state.value.user) return false
  return startCheckout(pending)
}

export function useMembership() {
  if (!initialized) {
    initialized = true
    const stored = readStoredMembership()
    if (stored) state.value = { ...state.value, ...stored, loading: false }
    if (isBrowser()) refreshMembership()
  }

  const currentPlan = computed(() => state.value.plan)
  const currentPlanName = computed(() => planName(state.value.plan))
  const isAuthenticated = computed(() => Boolean(state.value.user))
  const isAuthConfigured = computed(() => Boolean((getLoginUrl() || getLoginApiUrl()) && getMembershipApiUrl()))
  const isCheckoutConfigured = computed(() => Boolean(getCheckoutApiUrl()))

  return {
    membership: readonly(state),
    currentPlan,
    currentPlanName,
    isAuthenticated,
    isAuthConfigured,
    isCheckoutConfigured,
    planName,
    planLevel,
    canAccess: (requiredPlan) => canPlanAccess(state.value.plan, requiredPlan),
    refreshMembership,
    resumePendingCheckout,
    loginWithPassword,
    registerWithPassword,
    startCheckout,
    startLogin,
    logout
  }
}
