<template>
  <div class="auth-page">
    <section class="auth-card">
      <p class="auth-eyebrow">Learn With AI</p>
      <h1>{{ isRegister ? '创建账户' : '登录账户' }}</h1>

      <form class="auth-form" @submit.prevent="handleSubmit">
        <label v-if="isRegister" class="auth-field">
          <span>昵称</span>
          <input v-model.trim="name" autocomplete="name" placeholder="你的称呼" />
        </label>

        <label class="auth-field">
          <span>邮箱</span>
          <input v-model.trim="email" autocomplete="email" placeholder="you@example.com" type="email" />
        </label>

        <label class="auth-field">
          <span>密码</span>
          <input
            v-model="password"
            :autocomplete="isRegister ? 'new-password' : 'current-password'"
            placeholder="至少 6 位"
            type="password"
          />
        </label>

        <label v-if="isRegister" class="auth-field">
          <span>确认密码</span>
          <input v-model="passwordConfirm" autocomplete="new-password" placeholder="再输入一次密码" type="password" />
        </label>

        <button class="auth-submit" type="submit" :disabled="membership.loading">
          {{ membership.loading ? '处理中...' : isRegister ? '注册并登录' : '登录' }}
        </button>
      </form>

      <el-alert
        v-if="formError || membership.error"
        class="auth-alert"
        :title="formError || membership.error"
        type="warning"
        show-icon
        :closable="false"
      />

      <p class="auth-switch">
        <template v-if="isRegister">
          已有账户？<a :href="loginHref">去登录</a>
        </template>
        <template v-else>
          还没有账户？<a :href="registerHref">立即注册</a>
        </template>
      </p>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useMembership } from '../composables/useMembership'

const props = defineProps({
  mode: { type: String, default: 'login' }
})

const { membership, loginWithPassword, registerWithPassword } = useMembership()

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')
const formError = ref('')

const isRegister = computed(() => props.mode === 'register')

const returnTo = computed(() => {
  if (typeof window === 'undefined') return '/zh-cn/account/'
  const value = new URLSearchParams(window.location.search).get('returnTo')
  if (!value) return '/zh-cn/account/'

  try {
    const target = new URL(value, window.location.origin)
    if (target.origin !== window.location.origin) return '/zh-cn/account/'
    return `${target.pathname}${target.search}${target.hash}`
  } catch {
    return '/zh-cn/account/'
  }
})

const loginHref = computed(() => `/zh-cn/login/?returnTo=${encodeURIComponent(returnTo.value)}`)
const registerHref = computed(() => `/zh-cn/register/?returnTo=${encodeURIComponent(returnTo.value)}`)

function validate() {
  if (!email.value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) return '请输入正确的邮箱'
  if (!password.value || password.value.length < 6) return '密码至少 6 位'
  if (isRegister.value && password.value !== passwordConfirm.value) return '两次输入的密码不一致'
  return ''
}

async function handleSubmit() {
  formError.value = validate()
  if (formError.value) return

  const ok = isRegister.value
    ? await registerWithPassword({ email: email.value, password: password.value, name: name.value })
    : await loginWithPassword({ email: email.value, password: password.value })

  if (ok) window.location.href = returnTo.value
}
</script>

<style scoped>
.auth-page {
  max-width: 440px;
  margin: 0 auto;
  padding: 32px 0 56px;
}

.auth-card {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  padding: 28px;
}

.auth-eyebrow {
  margin: 0 0 8px;
  color: var(--vp-c-brand-1);
  font-size: 12px;
  font-weight: 800;
}

.auth-card h1 {
  margin: 0 0 22px;
  font-size: 26px;
}

.auth-form {
  display: grid;
  gap: 14px;
}

.auth-field {
  display: grid;
  gap: 7px;
}

.auth-field span {
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-weight: 600;
}

.auth-field input {
  width: 100%;
  min-height: 40px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  padding: 0 12px;
  font: inherit;
  outline: none;
}

.auth-field input:focus {
  border-color: var(--vp-c-brand-1);
}

.auth-submit {
  margin-top: 4px;
  min-height: 42px;
  border: 0;
  border-radius: 8px;
  background: var(--vp-c-brand-1);
  color: #fff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

.auth-submit:disabled {
  cursor: default;
  opacity: 0.7;
}

.auth-alert {
  margin-top: 16px;
}

.auth-switch {
  margin: 18px 0 0;
  text-align: center;
  color: var(--vp-c-text-2);
}

.auth-switch a {
  color: var(--vp-c-brand-1);
  font-weight: 700;
}
</style>
