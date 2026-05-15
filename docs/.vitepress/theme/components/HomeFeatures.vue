<template>
  <div class="lwa-home">
    <!-- 受众选择器 -->
    <section class="audience-section">
      <div class="section-label">你是谁？选择你的专属路径</div>
      <div class="audience-cards">
        <button
          v-for="a in audiences"
          :key="a.id"
          class="audience-card"
          :class="{ active: activeAudience === a.id }"
          @click="activeAudience = a.id"
        >
          <SvgIcon :name="a.icon" :size="28" class="audience-icon" />
          <span class="audience-title">{{ a.title }}</span>
          <span class="audience-desc">{{ a.desc }}</span>
        </button>
      </div>
    </section>

    <!-- 对应的课程预览 -->
    <section class="path-preview">
      <transition name="fade" mode="out-in">
        <div :key="activeAudience" class="path-content">
          <div class="path-header">
            <SvgIcon :name="currentAudience.icon" :size="40" class="path-icon" />
            <div>
              <div class="path-title">{{ currentAudience.pathTitle }}</div>
              <div class="path-subtitle">{{ currentAudience.pathSubtitle }}</div>
            </div>
          </div>
          <div class="path-modules">
            <div
              v-for="(mod, i) in currentAudience.modules"
              :key="i"
              class="path-module"
              :class="mod.locked ? 'locked' : 'free'"
            >
              <SvgIcon :name="mod.locked ? 'lock' : 'check-circle'" :size="16" class="module-lock" />
              <span class="module-text">{{ mod.text }}</span>
              <span v-if="!mod.locked" class="module-tag free-tag">免费</span>
              <span v-else class="module-tag paid-tag">{{ mod.plan }}</span>
            </div>
          </div>
          <a :href="currentAudience.cta.link" class="path-cta">{{ currentAudience.cta.text }}</a>
        </div>
      </transition>
    </section>

    <!-- 差异化亮点 -->
    <section class="features-section">
      <div class="section-label">为什么选择我们</div>
      <div class="features-grid">
        <div v-for="f in features" :key="f.title" class="feature-card">
          <SvgIcon :name="f.icon" :size="28" class="feature-icon" />
          <div class="feature-title">{{ f.title }}</div>
          <div class="feature-desc">{{ f.desc }}</div>
        </div>
      </div>
    </section>

    <!-- 定价预览 -->
    <section class="pricing-preview">
      <div class="section-label">阶梯定价，按需解锁</div>
      <div class="pricing-cards">
        <div v-for="p in plans" :key="p.name" class="pricing-card" :class="p.highlight ? 'highlight' : ''">
          <div class="plan-badge" v-if="p.badge">{{ p.badge }}</div>
          <div class="plan-name">{{ p.name }}</div>
          <div class="plan-price">
            <span class="price-amount">{{ p.price }}</span>
            <span class="price-unit">{{ p.unit }}</span>
          </div>
          <ul class="plan-features">
            <li v-for="item in p.features" :key="item">{{ item }}</li>
          </ul>
          <a :href="p.link" class="plan-btn" :class="p.highlight ? 'btn-primary' : 'btn-secondary'">
            {{ p.btnText }}
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SvgIcon from './SvgIcon.vue'

const activeAudience = ref('youth')

const audiences = [
  {
    id: 'youth',
    icon: 'school',
    title: '青少年',
    desc: '6-18 岁学生'
  },
  {
    id: 'young-adult',
    icon: 'rocket',
    title: '青年',
    desc: '18-35 岁'
  },
  {
    id: 'middle-aged',
    icon: 'briefcase',
    title: '中年',
    desc: '35-55 岁'
  }
]

const audienceData = {
  youth: {
    icon: 'school',
    pathTitle: '青少年 AI 学习启蒙',
    pathSubtitle: '从用 AI 写作文，到培养 AI 原生思维',
    modules: [
      { text: '什么是 AI 思维？', locked: false },
      { text: 'AI 学习 vs 普通搜索', locked: false },
      { text: '你的第一次 AI 对话实验', locked: false },
      { text: '用 AI 写更好的作文', locked: true, plan: '基础版' },
      { text: '用 AI 攻克数学难题', locked: true, plan: '基础版' },
      { text: 'AI 辅助课后复习系统', locked: true, plan: '进阶版' },
      { text: '用 AI 做项目研究', locked: true, plan: '进阶版' }
    ],
    cta: { text: '开始青少年课程 →', link: '/zh-cn/youth/learning-map/' }
  },
  'young-adult': {
    icon: 'rocket',
    pathTitle: '青年 AI 驱动的成长',
    pathSubtitle: '考研、求职、职业规划——AI 全程加速',
    modules: [
      { text: '什么是 AI 思维？', locked: false },
      { text: 'Prompt 思维精讲', locked: false },
      { text: '用 AI 制定学习计划', locked: false },
      { text: 'AI 辅助考研备考全流程', locked: true, plan: '进阶版' },
      { text: 'AI 打造完美简历', locked: true, plan: '进阶版' },
      { text: 'AI 面试模拟与复盘', locked: true, plan: '进阶版' },
      { text: '用 AI 做职业路径分析', locked: true, plan: '高级版' }
    ],
    cta: { text: '开始青年课程 →', link: '/zh-cn/young-adult/learning-map/' }
  },
  'middle-aged': {
    icon: 'briefcase',
    pathTitle: '中年 AI 商业洞察',
    pathSubtitle: '行业调研、投资分析、人生决策——AI 赋能',
    modules: [
      { text: '什么是 AI 思维？', locked: false },
      { text: '用 AI 快速了解一个行业', locked: false },
      { text: '商业机会的 AI 扫描方法', locked: true, plan: '高级版' },
      { text: 'AI 辅助股票分析入门', locked: true, plan: '高级版' },
      { text: '用 AI 读懂财报', locked: true, plan: '高级版' },
      { text: '打造你的个人 AI 助手系统', locked: true, plan: '旗舰版' },
      { text: 'AI 时代的终身学习框架', locked: true, plan: '旗舰版' }
    ],
    cta: { text: '开始中年课程 →', link: '/zh-cn/middle-aged/learning-map/' }
  }
}

const currentAudience = computed(() => audienceData[activeAudience.value])

const features = [
  {
    icon: 'message-circle',
    title: 'AI 对话练习场',
    desc: '每节课末尾有真实 AI 交互练习，比看视频有效 10 倍'
  },
  {
    icon: 'map',
    title: '人群专属路径',
    desc: '针对不同年龄和目标设计课程，不做一刀切的通用教程'
  },
  {
    icon: 'clipboard-list',
    title: 'Prompt 模板库',
    desc: '每节课附带可一键复制的 Prompt，立刻产生实际价值'
  },
  {
    icon: 'bar-chart',
    title: '可视化交互演示',
    desc: '抽象概念全部可视化，看得懂、记得住、用得上'
  }
]

const plans = [
  {
    name: '免费体验',
    price: '¥0',
    unit: '永久免费',
    features: ['AI 思维入门 5 节', '路径选择器', '基础 Prompt 模板'],
    btnText: '立即开始',
    link: '/zh-cn/free/why-different/',
    highlight: false
  },
  {
    name: '基础版',
    price: '¥99',
    unit: '/ 年',
    badge: '适合学生',
    features: [
      '免费内容全部解锁',
      '青少年完整课程',
      '青年入门课程',
      'AI 学习工作流模板'
    ],
    btnText: '立即订阅',
    link: '/zh-cn/pricing/',
    highlight: false
  },
  {
    name: '进阶版',
    price: '¥299',
    unit: '/ 年',
    badge: '最受欢迎',
    features: [
      '基础版全部内容',
      '考研 / 求职专项',
      'AI 面试模拟',
      'Prompt 完整模板库'
    ],
    btnText: '立即订阅',
    link: '/zh-cn/pricing/',
    highlight: true
  },
  {
    name: '高级版',
    price: '¥599',
    unit: '/ 年',
    badge: '适合中年',
    features: [
      '进阶版全部内容',
      '商业洞察 / 投资分析',
      '行业调研方法论',
      '个人 AI 助手系统'
    ],
    btnText: '立即订阅',
    link: '/zh-cn/pricing/',
    highlight: false
  }
]
</script>

<style scoped>
.lwa-home {
  max-width: 960px;
  margin: 0 auto;
  padding: 48px 24px 80px;
}

.section-label {
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
  margin-bottom: 24px;
}

/* 受众选择器 */
.audience-section {
  margin-bottom: 48px;
}

.audience-cards {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.audience-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 20px 32px;
  border: 2px solid var(--vp-c-divider);
  border-radius: 16px;
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  transition: all 0.2s;
  min-width: 140px;
}

.audience-card:hover {
  border-color: var(--vp-c-brand-2);
}

.audience-card.active {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.audience-icon {
  font-size: 32px;
}

.audience-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.audience-desc {
  font-size: 12px;
  color: var(--vp-c-text-2);
}

/* 课程路径预览 */
.path-preview {
  margin-bottom: 64px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.path-content {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 20px;
  padding: 32px;
}

.path-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.path-icon {
  font-size: 40px;
}

.path-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.path-subtitle {
  font-size: 14px;
  color: var(--vp-c-text-2);
  margin-top: 4px;
}

.path-modules {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 28px;
}

.path-module {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 14px;
}

.path-module.free {
  background: color-mix(in srgb, var(--vp-c-brand-soft) 60%, transparent);
  border: 1px solid var(--vp-c-brand-soft);
}

.path-module.locked {
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
}

.module-text {
  flex: 1;
}

.module-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 20px;
  font-weight: 600;
}

.free-tag {
  background: var(--vp-c-green-soft);
  color: var(--vp-c-green-1);
}

.paid-tag {
  background: var(--vp-c-yellow-soft);
  color: var(--vp-c-yellow-1);
}

.path-cta {
  display: inline-block;
  padding: 12px 28px;
  background: var(--vp-c-brand-1);
  color: #fff;
  border-radius: 10px;
  font-weight: 600;
  font-size: 15px;
  text-decoration: none;
  transition: background 0.2s;
}

.path-cta:hover {
  background: var(--vp-c-brand-2);
}

/* 特色功能 */
.features-section {
  margin-bottom: 64px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.feature-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  padding: 24px;
}

.feature-icon {
  font-size: 28px;
  display: block;
  margin-bottom: 12px;
}

.feature-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 8px;
}

.feature-desc {
  font-size: 14px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

/* 定价 */
.pricing-preview {
  margin-bottom: 0;
}

.pricing-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.pricing-card {
  position: relative;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.pricing-card.highlight {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.plan-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--vp-c-brand-1);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 12px;
  border-radius: 20px;
  white-space: nowrap;
}

.plan-name {
  font-size: 16px;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-top: 8px;
}

.plan-price {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.price-amount {
  font-size: 28px;
  font-weight: 800;
  color: var(--vp-c-brand-1);
}

.price-unit {
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.plan-features {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.plan-features li {
  font-size: 13px;
  color: var(--vp-c-text-2);
  padding-left: 16px;
  position: relative;
}

.plan-features li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--vp-c-brand-1);
  font-weight: 700;
}

.plan-btn {
  display: block;
  text-align: center;
  padding: 10px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--vp-c-brand-1);
  color: #fff;
}

.btn-primary:hover {
  background: var(--vp-c-brand-2);
}

.btn-secondary {
  background: var(--vp-c-bg-mute);
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}

.btn-secondary:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

@media (max-width: 768px) {
  .features-grid {
    grid-template-columns: 1fr;
  }

  .pricing-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .pricing-cards {
    grid-template-columns: 1fr;
  }
}
</style>
