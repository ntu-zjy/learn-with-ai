<template>
  <div class="path-selector">
    <div class="selector-label">你是谁？立即跳转到你的专属路径</div>
    <div class="selector-cards">
      <a
        v-for="a in audiences"
        :key="a.id"
        :href="a.link"
        class="selector-card"
      >
        <SvgIcon :name="a.icon" :size="28" class="s-icon" />
        <span class="s-title">{{ a.title }}</span>
        <span class="s-desc">{{ a.desc }}</span>
        <span class="s-arrow">→</span>
      </a>
    </div>
  </div>
</template>

<script setup>
import SvgIcon from './SvgIcon.vue'
const audiences = [
  {
    id: 'youth',
    icon: 'school',
    title: '青少年',
    desc: '6-18 岁，用 AI 学习提效',
    link: '/zh-cn/youth/learning-map/'
  },
  {
    id: 'young-adult',
    icon: 'rocket',
    title: '青年',
    desc: '18-35 岁，考研 / 求职 / 成长',
    link: '/zh-cn/young-adult/learning-map/'
  },
  {
    id: 'middle-aged',
    icon: 'briefcase',
    title: '中年',
    desc: '35-55 岁，商业洞察 / 投资',
    link: '/zh-cn/middle-aged/learning-map/'
  }
]
</script>

<style scoped>
.path-selector {
  margin: 32px 0;
}

.selector-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--vp-c-brand-1);
  margin-bottom: 16px;
  text-align: center;
}

.selector-cards {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.selector-card {
  flex: 1;
  min-width: 180px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border: 1.5px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg-soft);
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
}

.selector-card:hover {
  border-color: var(--vp-c-brand-1);
  box-shadow: 0 2px 12px rgba(0,0,0,.08);
  transform: translateY(-1px);
}

.s-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.s-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.s-desc {
  font-size: 12px;
  color: var(--vp-c-text-2);
  flex: 1;
}

.s-arrow {
  font-size: 16px;
  color: var(--vp-c-brand-1);
  flex-shrink: 0;
}
</style>
