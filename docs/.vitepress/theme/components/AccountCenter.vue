<template>
  <div class="account-center">
    <section class="account-card">
      <div class="account-heading">
        <div>
          <p class="eyebrow">账号状态</p>
          <h2>{{ isAuthenticated ? '你已登录' : '登录后查看课程权益' }}</h2>
        </div>
        <el-tag :type="isAuthenticated ? 'success' : 'info'" effect="light">
          {{ isAuthenticated ? currentPlanName : '未登录' }}
        </el-tag>
      </div>

      <div v-if="isAuthenticated" class="profile-grid">
        <div class="profile-item">
          <span>账号</span>
          <strong>{{ displayName }}</strong>
        </div>
        <div class="profile-item">
          <span>当前方案</span>
          <strong>{{ currentPlanName }}</strong>
        </div>
        <div class="profile-item">
          <span>到期时间</span>
          <strong>{{ membership.expiresAt || '长期有效或以后端为准' }}</strong>
        </div>
        <div class="profile-item">
          <span>同步时间</span>
          <strong>{{ membership.lastSyncedAt ? formatDate(membership.lastSyncedAt) : '未同步' }}</strong>
        </div>
      </div>

      <p v-else class="account-copy">
        当前站点已经接入前端会员状态层。配置登录端点后，用户可以通过导航栏登录，并在这里查看订阅权益。
      </p>

      <div class="account-actions">
        <el-button v-if="!isAuthenticated" type="primary" :icon="User" @click="handleLogin">
          登录
        </el-button>
        <el-button v-else :loading="membership.loading" :icon="Refresh" @click="handleRefresh">
          刷新权益
        </el-button>
        <el-button :icon="CreditCard" @click="goPricing">
          查看课程方案
        </el-button>
        <el-button v-if="isAuthenticated" plain :icon="SwitchButton" @click="logout">
          退出登录
        </el-button>
      </div>

      <el-alert
        v-if="membership.error"
        class="account-alert"
        :title="membership.error"
        type="warning"
        show-icon
        :closable="false"
      />
    </section>

    <section class="account-card">
      <div class="account-heading">
        <div>
          <p class="eyebrow">后端 API 契约</p>
          <h2>登录与 ZPAY 支付需要提供这些环境变量</h2>
        </div>
      </div>

      <div class="env-list">
        <div v-for="item in envItems" :key="item.name" class="env-row">
          <code>{{ item.name }}</code>
          <span>{{ item.desc }}</span>
        </div>
      </div>

      <div class="contract-grid">
        <div class="contract-block">
          <h3>会员状态接口</h3>
          <pre><code>{{ membershipContract }}</code></pre>
        </div>
        <div class="contract-block">
          <h3>创建支付接口</h3>
          <pre><code>{{ checkoutContract }}</code></pre>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { CreditCard, Refresh, SwitchButton, User } from '@element-plus/icons-vue'
import { useMembership } from '../composables/useMembership'

const {
  membership,
  currentPlanName,
  isAuthenticated,
  refreshMembership,
  startLogin,
  logout
} = useMembership()

const displayName = computed(() => {
  const user = membership.value.user || {}
  return user.name || user.nickname || user.email || '已登录用户'
})

const envItems = [
  { name: 'VITE_AUTH_LOGIN_URL', desc: '外部登录入口，可选，前端会附带 returnTo 参数。' },
  { name: 'VITE_AUTH_LOGOUT_URL', desc: '退出登录入口，可选，前端会附带 returnTo 参数。' },
  { name: 'VITE_AUTH_LOGIN_API_URL', desc: '站内登录 API，返回 token 和 user。' },
  { name: 'VITE_AUTH_REGISTER_API_URL', desc: '站内注册 API，返回 token 和 user。' },
  { name: 'VITE_MEMBERSHIP_API_URL', desc: '会员状态查询接口，使用 Cookie 或 Bearer Token 识别用户。' },
  { name: 'VITE_ZPAY_CHECKOUT_API_URL', desc: '后端创建 ZPAY 支付订单接口，返回 payUrl。' }
]

const membershipContract = `GET /api/membership
Response 200:
{
  "user": { "id": "u_123", "name": "张同学", "email": "user@example.com" },
  "plan": "pro",
  "expiresAt": "2027-05-14T00:00:00.000Z"
}

Response 401:
{ "message": "unauthorized" }`

const checkoutContract = `POST /api/pay/create
Body:
{
  "plan": "pro",
  "billing": "yearly",
  "payType": "alipay",
  "returnUrl": "https://site/zh-cn/pricing/",
  "cancelUrl": "https://site/zh-cn/pricing/"
}

Response 200:
{ "payUrl": "https://zpayz.cn/submit.php?..." }`

function formatDate(value) {
  return new Date(value).toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function handleLogin() {
  const started = startLogin()
  if (!started) ElMessage.warning('登录后端还没有配置，请先设置 VITE_AUTH_LOGIN_URL。')
}

async function handleRefresh() {
  await refreshMembership()
  if (membership.value.error) {
    ElMessage.error(membership.value.error)
  } else {
    ElMessage.success('会员权益已刷新')
  }
}

function goPricing() {
  window.location.href = '/zh-cn/pricing/'
}
</script>

<style scoped>
.account-center {
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 0 56px;
  display: grid;
  gap: 20px;
}

.account-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  padding: 24px;
}

.account-heading {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
  margin-bottom: 20px;
}

.eyebrow {
  margin: 0 0 6px;
  color: var(--vp-c-brand-1);
  font-size: 12px;
  font-weight: 700;
}

.account-heading h2 {
  margin: 0 !important;
  padding: 0 !important;
  font-size: 22px;
  border: 0 !important;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.profile-item {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  padding: 14px;
}

.profile-item span {
  display: block;
  margin-bottom: 6px;
  color: var(--vp-c-text-2);
  font-size: 12px;
}

.profile-item strong {
  color: var(--vp-c-text-1);
  font-size: 14px;
  word-break: break-word;
}

.account-copy {
  color: var(--vp-c-text-2);
}

.account-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}

.account-alert {
  margin-top: 16px;
}

.env-list {
  display: grid;
  gap: 10px;
}

.env-row {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 14px;
  align-items: center;
  padding: 10px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
}

.env-row code {
  color: var(--vp-c-brand-1);
  font-weight: 700;
}

.env-row span {
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.contract-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 20px;
}

.contract-block h3 {
  margin: 0 0 10px;
  font-size: 16px;
}

.contract-block pre {
  margin: 0;
  padding: 14px;
  border-radius: 8px;
  background: var(--vp-code-block-bg);
  overflow: auto;
}

.contract-block code {
  font-size: 12px;
}

@media (max-width: 768px) {
  .account-heading,
  .env-row {
    grid-template-columns: 1fr;
  }

  .profile-grid,
  .contract-grid {
    grid-template-columns: 1fr;
  }
}
</style>
