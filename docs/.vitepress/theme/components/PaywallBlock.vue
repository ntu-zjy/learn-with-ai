<template>
  <div v-if="isUnlocked" class="paywall-unlocked">
    <div class="unlock-badge">
      <el-icon><Unlock /></el-icon>
      <span>已解锁：{{ plan }}</span>
    </div>
    <div>
      <slot />
    </div>
  </div>

  <div v-else class="paywall-block">
    <div class="paywall-preview">
      <div class="preview-line long"></div>
      <div class="preview-line"></div>
      <div class="preview-line short"></div>
      <div class="preview-grid">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
    <div class="paywall-mask">
      <div class="paywall-icon">
        <el-icon><Lock /></el-icon>
      </div>
      <div class="paywall-title">{{ title }}</div>
      <div class="paywall-desc">此章节需要 <strong>{{ plan }}</strong> 才能查看</div>
      <div class="paywall-actions">
        <button v-if="!isAuthenticated" class="paywall-btn secondary" type="button" @click="handleLogin">
          登录
        </button>
        <button class="paywall-btn" type="button" @click="handleSubscribe">
          查看订阅方案
        </button>
      </div>
      <div v-if="membership.error" class="paywall-error">{{ membership.error }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Lock, Unlock } from '@element-plus/icons-vue'
import { requiredPlanFromLabel, useMembership } from '../composables/useMembership'

const props = defineProps({
  title: { type: String, default: '付费内容' },
  plan: { type: String, default: '进阶版或以上' },
  requiredPlan: { type: String, default: '' }
})

const { membership, isAuthenticated, canAccess, startLogin } = useMembership()

const required = computed(() => props.requiredPlan || requiredPlanFromLabel(props.plan))
const isUnlocked = computed(() => canAccess(required.value))

function handleLogin() {
  const started = startLogin()
  if (!started) ElMessage.warning('登录后端还没有配置，请先设置 VITE_AUTH_LOGIN_URL。')
}

function handleSubscribe() {
  window.location.href = '/zh-cn/pricing/'
}
</script>

<style scoped>
.paywall-unlocked {
  position: relative;
  margin: 24px 0;
}

.unlock-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  padding: 6px 10px;
  border-radius: 8px;
  background: var(--vp-c-green-soft);
  color: var(--vp-c-green-1);
  font-size: 12px;
  font-weight: 700;
}

.paywall-block {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  margin: 24px 0;
  border: 1px solid var(--vp-c-divider);
  min-height: 260px;
  background: var(--vp-c-bg-soft);
}

.paywall-preview {
  padding: 24px;
  display: grid;
  gap: 12px;
  opacity: 0.7;
}

.preview-line {
  height: 14px;
  border-radius: 6px;
  background: var(--vp-c-divider);
}

.preview-line.long {
  width: 92%;
}

.preview-line.short {
  width: 56%;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 10px;
}

.preview-grid span {
  height: 96px;
  border-radius: 10px;
  background: var(--vp-c-bg-mute);
}

.paywall-mask {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: linear-gradient(
    to bottom,
    color-mix(in srgb, var(--vp-c-bg) 78%, transparent) 0%,
    var(--vp-c-bg) 78%
  );
  padding: 32px;
  text-align: center;
}

.paywall-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-size: 22px;
}

.paywall-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.paywall-desc {
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.paywall-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 6px;
}

.paywall-btn {
  padding: 10px 28px;
  border: 1px solid var(--vp-c-brand-1);
  background: var(--vp-c-brand-1);
  color: #fff;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  cursor: pointer;
  transition: background 0.2s;
}

.paywall-btn:hover {
  background: var(--vp-c-brand-2);
}

.paywall-btn.secondary {
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  border-color: var(--vp-c-divider);
}

.paywall-btn.secondary:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg);
}

.paywall-error {
  max-width: 440px;
  color: var(--vp-c-yellow-1);
  font-size: 12px;
}

@media (max-width: 640px) {
  .preview-grid {
    grid-template-columns: 1fr;
  }

  .paywall-actions,
  .paywall-btn {
    width: 100%;
  }
}
</style>
