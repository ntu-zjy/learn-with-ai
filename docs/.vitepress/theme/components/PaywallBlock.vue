<template>
  <div class="paywall-block">
    <div class="paywall-blur-overlay">
      <slot />
    </div>
    <div class="paywall-mask">
      <div class="paywall-icon">🔒</div>
      <div class="paywall-title">{{ title }}</div>
      <div class="paywall-desc">此章节需要 <strong>{{ plan }}</strong> 才能查看</div>
      <a href="/zh-cn/pricing/" class="paywall-btn">查看订阅方案</a>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '付费内容' },
  plan: { type: String, default: '进阶版或以上' }
})
</script>

<style scoped>
.paywall-block {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  margin: 24px 0;
  border: 1px solid var(--vp-c-divider);
}

.paywall-blur-overlay {
  filter: blur(6px);
  pointer-events: none;
  user-select: none;
  opacity: 0.4;
  padding: 24px;
  max-height: 220px;
  overflow: hidden;
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
    transparent 0%,
    color-mix(in srgb, var(--vp-c-bg) 80%, transparent) 40%,
    var(--vp-c-bg) 70%
  );
  padding: 32px;
}

.paywall-icon {
  font-size: 36px;
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

.paywall-btn {
  margin-top: 8px;
  padding: 10px 28px;
  background: var(--vp-c-brand-1);
  color: #fff;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  transition: background 0.2s;
}

.paywall-btn:hover {
  background: var(--vp-c-brand-2);
}
</style>
