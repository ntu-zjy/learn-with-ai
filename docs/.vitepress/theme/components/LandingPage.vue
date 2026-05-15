<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import SvgIcon from './SvgIcon.vue'

const activeAudience = ref('young-adult')
const heroVisible = ref(false)
const statsVisible = ref(false)
const count1 = ref(0)
const count2 = ref(0)
const count3 = ref(0)

const audiences = [
  { id: 'youth', icon: 'school', title: '青少年', sub: '6-18 岁' },
  { id: 'young-adult', icon: 'rocket', title: '青年', sub: '18-35 岁' },
  { id: 'middle-aged', icon: 'briefcase', title: '中年', sub: '35-55 岁' },
]

const audienceData = {
  youth: {
    headline: '让孩子在 AI 时代不掉队',
    desc: '从用 AI 写作文，到培养 AI 原生思维——为中国孩子量身设计，不只是工具课，而是思维课。',
    modules: [
      { text: '什么是 AI 思维？', free: true },
      { text: 'AI 学习 vs 普通搜索', free: true },
      { text: '你的第一次 AI 对话实验', free: true },
      { text: '用 AI 写更好的作文', free: false, plan: '基础版' },
      { text: '用 AI 攻克数学难题', free: false, plan: '基础版' },
      { text: 'AI 辅助课后复习系统', free: false, plan: '进阶版' },
    ],
    cta: { text: '开始青少年课程', link: '/zh-cn/youth/learning-map/' },
    color: '#f59e0b',
  },
  'young-adult': {
    headline: '用 AI 加速你的职业成长',
    desc: '考研、求职、职场晋升——AI 全程陪跑。让你的努力产生 10 倍效果。',
    modules: [
      { text: '什么是 AI 思维？', free: true },
      { text: 'Prompt 思维精讲', free: true },
      { text: '用 AI 制定学习计划', free: true },
      { text: 'AI 辅助考研备考全流程', free: false, plan: '进阶版' },
      { text: 'AI 打造完美简历', free: false, plan: '进阶版' },
      { text: 'AI 面试模拟与复盘', free: false, plan: '进阶版' },
    ],
    cta: { text: '开始青年课程', link: '/zh-cn/young-adult/learning-map/' },
    color: '#0071e3',
  },
  'middle-aged': {
    headline: '用 AI 重构你的商业洞察力',
    desc: '行业调研、投资分析、人生决策——AI 赋能，让经验与智能相乘。',
    modules: [
      { text: '什么是 AI 思维？', free: true },
      { text: '用 AI 快速了解一个行业', free: true },
      { text: '商业机会的 AI 扫描方法', free: false, plan: '高级版' },
      { text: 'AI 辅助股票分析入门', free: false, plan: '高级版' },
      { text: '用 AI 读懂财报', free: false, plan: '高级版' },
      { text: '打造你的个人 AI 助手系统', free: false, plan: '旗舰版' },
    ],
    cta: { text: '开始中年课程', link: '/zh-cn/middle-aged/learning-map/' },
    color: '#8b5cf6',
  },
}

const current = computed(() => audienceData[activeAudience.value])

function animateCount(target, setter, duration = 1600) {
  const start = Date.now()
  const tick = () => {
    const elapsed = Date.now() - start
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    setter(Math.floor(eased * target))
    if (progress < 1) requestAnimationFrame(tick)
    else setter(target)
  }
  requestAnimationFrame(tick)
}

let statsObs = null
onMounted(() => {
  setTimeout(() => { heroVisible.value = true }, 50)

  const statsEl = document.querySelector('.lp-stats')
  if (statsEl && 'IntersectionObserver' in window) {
    statsObs = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !statsVisible.value) {
        statsVisible.value = true
        animateCount(12800, (v) => { count1.value = v })
        animateCount(47, (v) => { count2.value = v })
        animateCount(98, (v) => { count3.value = v })
        statsObs.disconnect()
      }
    }, { threshold: 0.3 })
    statsObs.observe(statsEl)
  } else {
    count1.value = 12800
    count2.value = 47
    count3.value = 98
  }
})

onBeforeUnmount(() => {
  if (statsObs) statsObs.disconnect()
})

const plans = [
  {
    name: '免费体验',
    price: '¥0',
    unit: '永久免费',
    tag: null,
    highlight: false,
    features: ['三个人群入门课程', '基础 Prompt 模板', 'AI 对话练习场（限量）'],
    btn: '立即开始',
    link: '/zh-cn/free/why-different/',
  },
  {
    name: 'AI 学习者',
    price: '¥99',
    unit: '/ 年',
    tag: null,
    highlight: false,
    features: ['三个人群完整基础课', 'AI 对话练习场（全部）', 'Prompt 模板库（50 条）'],
    btn: '立即订阅',
    link: '/zh-cn/pricing/',
  },
  {
    name: 'AI 实践者',
    price: '¥399',
    unit: '/ 年',
    tag: '最受欢迎',
    highlight: true,
    features: ['AI 学习者全部内容', '考研 / 求职 / 商业专项', 'Prompt 模板库（200 条）'],
    btn: '立即订阅',
    link: '/zh-cn/pricing/',
  },
  {
    name: 'AI 掌控者',
    price: '¥999',
    unit: '/ 年',
    tag: null,
    highlight: false,
    features: ['AI 实践者全部内容', '个人 AI 助手系统', 'Prompt 模板库（500+ 条）'],
    btn: '立即订阅',
    link: '/zh-cn/pricing/',
    offline: false,
  },
  {
    name: '线下课程',
    price: '面议',
    unit: '· 定制报价',
    tag: null,
    highlight: false,
    features: ['小班制面授（≤12 人）', '教练一对一跟进', '企业定制方案'],
    btn: '加微信了解',
    link: '/zh-cn/pricing/',
    offline: true,
  },
]

const features = [
  { icon: 'message-circle', title: 'AI 对话练习场', desc: '每节课末尾有真实 AI 交互练习，边学边练，比看视频有效 10 倍。' },
  { icon: 'map', title: '人群专属路径', desc: '针对青少年、青年、中年三类人群独立设计，不做一刀切的通用教程。' },
  { icon: 'clipboard-list', title: 'Prompt 模板库', desc: '每节课附带可一键复制的 Prompt，学完即用，立刻产生实际价值。' },
  { icon: 'play-circle', title: '可视化交互演示', desc: '抽象概念全部可视化，对话动画演示 AI 原理，看得懂、记得住、用得上。' },
]

const testimonials = [
  { name: '李同学', role: '高三备考生', text: '用 AI 辅助复习之后，我的错题整理效率提升了好几倍，而且 AI 会针对我的薄弱点出题，比刷题册有效多了。', avatar: '李' },
  { name: '张先生', role: '互联网从业者', text: '求职阶段用 AI 模拟面试，被追问了好几轮，发现自己回答里有很多逻辑漏洞，面试前暴露出来比面试中暴露要好太多了。', avatar: '张' },
  { name: '王女士', role: '创业者', text: '用 AI 做行业调研，一个下午就把竞品格局、政策背景、用户痛点都梳理清楚了。以前这要花好几天时间。', avatar: '王' },
]
</script>

<template>
  <div class="lp-root">
    <!-- ░░ HERO ░░ -->
    <section class="lp-hero" :class="{ visible: heroVisible }">
      <div class="hero-bg">
        <div class="hero-orb hero-orb-1" />
        <div class="hero-orb hero-orb-2" />
        <div class="hero-grid" />
      </div>
      <div class="hero-inner">
        <div class="hero-badge">
          <span class="badge-dot" />
          AI 学习平台 · 三类人群专属课程
        </div>
        <h1 class="hero-title">
          <span class="title-line title-line-1">学会用 AI</span>
          <span class="title-line title-line-2">去终身学习</span>
        </h1>
        <p class="hero-sub">
          不是教你用什么工具，而是教你用 AI 思考、学习、成长。<br>
          从孩子到中年，每个人都值得拥有 AI 学习力。
        </p>
        <div class="hero-actions">
          <a href="/zh-cn/free/why-different/" class="btn-hero-primary">
            <span>免费开始体验</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </a>
          <a href="/zh-cn/pricing/" class="btn-hero-secondary">查看课程与定价</a>
        </div>
        <div class="hero-proof">
          <span class="proof-item">✓ 永久免费入门课程</span>
          <span class="proof-sep">·</span>
          <span class="proof-item">✓ 无需信用卡</span>
          <span class="proof-sep">·</span>
          <span class="proof-item">✓ 立刻可用</span>
        </div>
      </div>
    </section>

    <!-- ░░ STATS ░░ -->
    <section class="lp-stats">
      <div class="stats-inner">
        <div class="stat-item">
          <div class="stat-num">{{ count1.toLocaleString('zh-CN') }}+</div>
          <div class="stat-label">学员正在使用</div>
        </div>
        <div class="stat-divider" />
        <div class="stat-item">
          <div class="stat-num">{{ count2 }}+</div>
          <div class="stat-label">实操课程节数</div>
        </div>
        <div class="stat-divider" />
        <div class="stat-item">
          <div class="stat-num">{{ count3 }}%</div>
          <div class="stat-label">学员认为比普通教程有效</div>
        </div>
      </div>
    </section>

    <!-- ░░ VALUE PROP ░░ -->
    <section class="lp-section lp-value">
      <div class="section-container">
        <div class="section-eyebrow">为什么不一样</div>
        <h2 class="section-title">这不是工具教程<br>而是思维升级课</h2>
        <div class="value-grid">
          <div class="value-col value-before">
            <div class="value-col-label before">普通 AI 教程</div>
            <ul class="value-list">
              <li>教你复制粘贴 Prompt</li>
              <li>以工具为中心，工具变了就废了</li>
              <li>看完视频还是不知道怎么用</li>
              <li>通用内容，不考虑你是谁</li>
              <li>学完没有可落地的成果</li>
            </ul>
          </div>
          <div class="value-vs">VS</div>
          <div class="value-col value-after">
            <div class="value-col-label after">Learn With AI</div>
            <ul class="value-list">
              <li>教你理解 AI 的思考方式</li>
              <li>以能力为中心，模型怎么变都能用</li>
              <li>每节课都有真实 AI 交互练习</li>
              <li>针对青少年 / 青年 / 中年分别设计</li>
              <li>学完即有可复用的 Prompt 模板</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- ░░ AUDIENCE PATHS ░░ -->
    <section class="lp-section lp-paths">
      <div class="section-container">
        <div class="section-eyebrow">你是谁</div>
        <h2 class="section-title">选择你的专属路径</h2>
        <div class="path-tabs">
          <button
            v-for="a in audiences"
            :key="a.id"
            class="path-tab"
            :class="{ active: activeAudience === a.id }"
            @click="activeAudience = a.id"
          >
            <SvgIcon :name="a.icon" :size="22" class="tab-icon" />
            <span class="tab-title">{{ a.title }}</span>
            <span class="tab-sub">{{ a.sub }}</span>
          </button>
        </div>
        <Transition name="path-fade" mode="out-in">
          <div :key="activeAudience" class="path-panel">
            <div class="path-panel-left">
              <h3 class="path-headline">{{ current.headline }}</h3>
              <p class="path-desc">{{ current.desc }}</p>
              <a :href="current.cta.link" class="btn-path-cta">
                {{ current.cta.text }}
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </a>
            </div>
            <div class="path-panel-right">
              <div
                v-for="(mod, i) in current.modules"
                :key="i"
                class="path-mod"
                :class="mod.free ? 'free' : 'locked'"
              >
                <SvgIcon :name="mod.free ? 'check-circle' : 'lock'" :size="16" class="mod-icon" />
                <span class="mod-text">{{ mod.text }}</span>
                <span v-if="mod.free" class="mod-badge free">免费</span>
                <span v-else class="mod-badge paid">{{ mod.plan }}</span>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </section>

    <!-- ░░ FEATURES ░░ -->
    <section class="lp-section lp-features">
      <div class="section-container">
        <div class="section-eyebrow">核心体验</div>
        <h2 class="section-title">为什么学员说有效</h2>
        <div class="features-grid">
          <div v-for="f in features" :key="f.title" class="feature-card">
            <div class="feature-icon-wrap">
              <SvgIcon :name="f.icon" :size="28" />
            </div>
            <div class="feature-title">{{ f.title }}</div>
            <div class="feature-desc">{{ f.desc }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ░░ TESTIMONIALS ░░ -->
    <section class="lp-section lp-testimonials">
      <div class="section-container">
        <div class="section-eyebrow">学员说</div>
        <h2 class="section-title">真实使用后的反馈</h2>
        <div class="testimonials-grid">
          <div v-for="t in testimonials" :key="t.name" class="testimonial-card">
            <div class="t-quote">"</div>
            <p class="t-text">{{ t.text }}</p>
            <div class="t-author">
              <div class="t-avatar">{{ t.avatar }}</div>
              <div>
                <div class="t-name">{{ t.name }}</div>
                <div class="t-role">{{ t.role }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ░░ PRICING ░░ -->
    <section class="lp-section lp-pricing">
      <div class="section-container">
        <div class="section-eyebrow">定价</div>
        <h2 class="section-title">阶梯解锁，按需付费</h2>
        <p class="section-sub">从免费开始，随时升级。没有隐藏费用。</p>
        <div class="pricing-grid">
          <div
            v-for="p in plans"
            :key="p.name"
            class="pricing-card"
            :class="{ highlight: p.highlight, offline: p.offline }"
          >
            <div v-if="p.tag" class="pricing-tag">{{ p.tag }}</div>
            <div class="pricing-name">{{ p.name }}</div>
            <div class="pricing-price">
              <span class="price-big" :class="{ 'price-offline': p.offline }">{{ p.price }}</span>
              <span class="price-unit">{{ p.unit }}</span>
            </div>
            <div v-if="p.offline" class="pricing-locations">
              <SvgIcon name="map-pin" :size="12" />
              北京 · 上海（即将）· 深圳（即将）
            </div>
            <ul class="pricing-features">
              <li v-for="item in p.features" :key="item">{{ item }}</li>
            </ul>
            <a
              :href="p.offline ? '/zh-cn/pricing/' : p.link"
              class="pricing-btn"
              :class="p.highlight ? 'primary' : p.offline ? 'offline' : 'ghost'"
            >
              {{ p.btn }}
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- ░░ FINAL CTA ░░ -->
    <section class="lp-cta-final">
      <div class="cta-final-inner">
        <h2 class="cta-final-title">开始你的 AI 学习之旅</h2>
        <p class="cta-final-sub">免费内容无需注册，打开即学。5 分钟感受 AI 学习的不同。</p>
        <a href="/zh-cn/free/why-different/" class="btn-cta-final">
          立即免费体验
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* ── Root ── */
.lp-root {
  font-family: 'PingFang SC', 'Noto Sans SC', 'Microsoft YaHei', 'Hiragino Sans GB', sans-serif;
  overflow-x: hidden;
}

/* ── HERO ── */
.lp-hero {
  position: relative;
  min-height: 88vh;
  display: flex;
  align-items: center;
  background: #05090f;
  overflow: hidden;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.9s ease, transform 0.9s ease;
}

.lp-hero.visible {
  opacity: 1;
  transform: translateY(0);
}

.hero-bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.35;
}

.hero-orb-1 {
  width: 600px;
  height: 600px;
  top: -200px;
  left: -150px;
  background: radial-gradient(circle, #0071e3 0%, transparent 70%);
  animation: orb-drift-1 12s ease-in-out infinite alternate;
}

.hero-orb-2 {
  width: 500px;
  height: 500px;
  bottom: -150px;
  right: -100px;
  background: radial-gradient(circle, #7c3aed 0%, transparent 70%);
  animation: orb-drift-2 15s ease-in-out infinite alternate;
}

@keyframes orb-drift-1 {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(60px, 40px) scale(1.1); }
}

@keyframes orb-drift-2 {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(-40px, -60px) scale(1.08); }
}

.hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 48px 48px;
}

.hero-inner {
  position: relative;
  z-index: 1;
  max-width: 760px;
  margin: 0 auto;
  padding: 80px 32px;
  text-align: center;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  border: 1px solid rgba(255,255,255,0.15);
  border-radius: 100px;
  font-size: 12px;
  color: rgba(255,255,255,0.65);
  margin-bottom: 32px;
  letter-spacing: 0.02em;
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(8px);
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22d3ee;
  box-shadow: 0 0 8px #22d3ee;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.hero-title {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  margin: 0 0 28px;
  line-height: 1.05;
  letter-spacing: -0.02em;
}

.title-line {
  display: block;
  font-size: clamp(52px, 8vw, 88px);
  font-weight: 800;
}

.title-line-1 {
  color: #ffffff;
}

.title-line-2 {
  background: linear-gradient(135deg, #60a5fa 0%, #818cf8 40%, #c084fc 80%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-sub {
  font-size: clamp(15px, 2vw, 18px);
  color: rgba(255,255,255,0.55);
  line-height: 1.75;
  margin: 0 0 40px;
  max-width: 560px;
  margin-inline: auto;
  margin-bottom: 40px;
}

.hero-actions {
  display: flex;
  gap: 14px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.btn-hero-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  background: #0071e3;
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  border-radius: 12px;
  text-decoration: none;
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  box-shadow: 0 0 0 0 rgba(0,113,227,0.4);
}

.btn-hero-primary:hover {
  background: #0077ed;
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0,113,227,0.5);
}

.btn-hero-secondary {
  display: inline-flex;
  align-items: center;
  padding: 14px 28px;
  border: 1px solid rgba(255,255,255,0.2);
  color: rgba(255,255,255,0.8);
  font-size: 15px;
  font-weight: 600;
  border-radius: 12px;
  text-decoration: none;
  transition: border-color 0.2s, color 0.2s, background 0.2s;
}

.btn-hero-secondary:hover {
  border-color: rgba(255,255,255,0.5);
  color: #fff;
  background: rgba(255,255,255,0.06);
}

.hero-proof {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 12px;
  color: rgba(255,255,255,0.35);
}

.proof-sep {
  opacity: 0.4;
}

/* ── STATS ── */
.lp-stats {
  background: #0a0f1a;
  border-top: 1px solid rgba(255,255,255,0.06);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  padding: 48px 32px;
}

.stats-inner {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: 0 40px;
}

.stat-num {
  font-size: clamp(32px, 5vw, 48px);
  font-weight: 800;
  background: linear-gradient(135deg, #60a5fa, #c084fc);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.1;
  margin-bottom: 6px;
  letter-spacing: -0.02em;
}

.stat-label {
  font-size: 13px;
  color: rgba(255,255,255,0.4);
}

.stat-divider {
  width: 1px;
  height: 48px;
  background: rgba(255,255,255,0.1);
}

/* ── SECTIONS COMMON ── */
.lp-section {
  padding: 96px 32px;
}

.section-container {
  max-width: 1000px;
  margin: 0 auto;
}

.section-eyebrow {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #0071e3;
  margin-bottom: 12px;
}

.section-title {
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--vp-c-text-1);
  margin: 0 0 48px;
}

.section-sub {
  font-size: 16px;
  color: var(--vp-c-text-2);
  margin: -32px 0 48px;
}

/* ── VALUE ── */
.lp-value {
  background: var(--vp-c-bg-soft);
}

.value-grid {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 32px;
  align-items: start;
}

.value-col {
  border-radius: 16px;
  padding: 32px;
}

.value-before {
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
}

.value-after {
  background: linear-gradient(135deg, rgba(0,113,227,0.08), rgba(124,58,237,0.06));
  border: 1px solid rgba(0,113,227,0.25);
}

.value-col-label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: 20px;
  padding: 4px 12px;
  border-radius: 6px;
  display: inline-block;
}

.value-col-label.before {
  background: var(--vp-c-bg);
  color: var(--vp-c-text-3);
  border: 1px solid var(--vp-c-divider);
}

.value-col-label.after {
  background: rgba(0,113,227,0.12);
  color: #0071e3;
}

.value-vs {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 800;
  color: var(--vp-c-text-3);
  padding-top: 64px;
}

.value-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.value-before .value-list li {
  font-size: 14px;
  color: var(--vp-c-text-2);
  padding-left: 20px;
  position: relative;
  line-height: 1.5;
}

.value-before .value-list li::before {
  content: '✗';
  position: absolute;
  left: 0;
  color: #ef4444;
  font-weight: 700;
}

.value-after .value-list li {
  font-size: 14px;
  color: var(--vp-c-text-1);
  padding-left: 20px;
  position: relative;
  line-height: 1.5;
  font-weight: 500;
}

.value-after .value-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #0071e3;
  font-weight: 700;
}

/* ── PATHS ── */
.lp-paths {
  background: var(--vp-c-bg);
}

.path-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.path-tab {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  padding: 14px 24px;
  border-radius: 14px;
  border: 2px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  cursor: pointer;
  transition: all 0.2s;
  min-width: 130px;
}

.path-tab.active {
  border-color: #0071e3;
  background: rgba(0,113,227,0.08);
}

.path-tab:hover:not(.active) {
  border-color: var(--vp-c-text-3);
}

.tab-icon {
  color: var(--vp-c-text-2);
}

.path-tab.active .tab-icon {
  color: #0071e3;
}

.tab-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.tab-sub {
  font-size: 12px;
  color: var(--vp-c-text-3);
}

.path-fade-enter-active,
.path-fade-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.path-fade-enter-from,
.path-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.path-panel {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 40px;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 20px;
  padding: 40px;
  align-items: start;
}

.path-headline {
  font-size: 22px;
  font-weight: 800;
  color: var(--vp-c-text-1);
  margin: 0 0 12px;
  line-height: 1.3;
}

.path-desc {
  font-size: 14px;
  color: var(--vp-c-text-2);
  line-height: 1.7;
  margin: 0 0 24px;
}

.btn-path-cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 12px 24px;
  background: #0071e3;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  border-radius: 10px;
  text-decoration: none;
  transition: background 0.2s, transform 0.15s;
}

.btn-path-cta:hover {
  background: #0077ed;
  transform: translateY(-1px);
}

.path-panel-right {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.path-mod {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
}

.path-mod.free {
  background: rgba(0,113,227,0.07);
  border: 1px solid rgba(0,113,227,0.18);
  color: var(--vp-c-text-1);
}

.path-mod.locked {
  background: var(--vp-c-bg-mute);
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-2);
}

.mod-icon {
  font-size: 14px;
}

.mod-text {
  flex: 1;
}

.mod-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 9px;
  border-radius: 20px;
  white-space: nowrap;
}

.mod-badge.free {
  background: rgba(34,197,94,0.15);
  color: #16a34a;
}

.mod-badge.paid {
  background: rgba(245,158,11,0.12);
  color: #d97706;
}

/* ── FEATURES ── */
.lp-features {
  background: var(--vp-c-bg-soft);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.feature-card {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  padding: 28px;
  transition: border-color 0.2s, transform 0.2s;
}

.feature-card:hover {
  border-color: rgba(0,113,227,0.35);
  transform: translateY(-3px);
}

.feature-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(0, 113, 227, 0.1);
  color: #0071e3;
  margin-bottom: 14px;
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
  line-height: 1.65;
}

/* ── TESTIMONIALS ── */
.lp-testimonials {
  background: var(--vp-c-bg);
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.testimonial-card {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: border-color 0.2s;
}

.testimonial-card:hover {
  border-color: rgba(0,113,227,0.3);
}

.t-quote {
  font-size: 48px;
  color: #0071e3;
  line-height: 0.8;
  opacity: 0.4;
  font-family: Georgia, serif;
}

.t-text {
  font-size: 14px;
  color: var(--vp-c-text-1);
  line-height: 1.7;
  flex: 1;
  margin: 0;
}

.t-author {
  display: flex;
  align-items: center;
  gap: 12px;
}

.t-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, #0071e3, #7c3aed);
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.t-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.t-role {
  font-size: 12px;
  color: var(--vp-c-text-3);
}

/* ── PRICING ── */
.lp-pricing {
  background: var(--vp-c-bg-soft);
}

.pricing-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 16px;
  align-items: start;
}

.pricing-card {
  position: relative;
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 18px;
  padding: 28px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: transform 0.2s, border-color 0.2s;
}

.pricing-card:hover {
  transform: translateY(-4px);
}

.pricing-card.highlight {
  border-color: #0071e3;
  background: linear-gradient(160deg, rgba(0,113,227,0.06), var(--vp-c-bg));
  box-shadow: 0 0 0 1px rgba(0,113,227,0.2);
}

.pricing-tag {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: #0071e3;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 14px;
  border-radius: 20px;
  white-space: nowrap;
}

.pricing-name {
  font-size: 16px;
  font-weight: 800;
  color: var(--vp-c-text-1);
  margin-top: 8px;
}

.pricing-price {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.price-big {
  font-size: 30px;
  font-weight: 800;
  color: #0071e3;
  letter-spacing: -0.02em;
}

.price-unit {
  font-size: 13px;
  color: var(--vp-c-text-3);
}

.pricing-features {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pricing-features li {
  font-size: 13px;
  color: var(--vp-c-text-2);
  padding-left: 18px;
  position: relative;
  line-height: 1.5;
}

.pricing-features li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #0071e3;
  font-weight: 700;
}

.pricing-btn {
  display: block;
  text-align: center;
  padding: 11px 0;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s;
}

.pricing-btn.primary {
  background: #0071e3;
  color: #fff;
}

.pricing-btn.primary:hover {
  background: #0077ed;
}

.pricing-btn.ghost {
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  background: transparent;
}

.pricing-btn.ghost:hover {
  border-color: #0071e3;
  color: #0071e3;
}

.pricing-card.offline {
  border-color: #f59e0b;
  background: linear-gradient(160deg, rgba(245,158,11,0.06), var(--vp-c-bg));
}

.price-offline {
  color: #f59e0b !important;
}

.pricing-locations {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--vp-c-text-3);
  margin: -6px 0 4px;
}

.pricing-btn.offline {
  background: #f59e0b;
  color: #fff;
}

.pricing-btn.offline:hover {
  background: #d97706;
}

/* ── FINAL CTA ── */
.lp-cta-final {
  background: linear-gradient(135deg, #03071e 0%, #05112e 50%, #0a0a20 100%);
  padding: 100px 32px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.lp-cta-final::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 60% 60% at 20% 50%, rgba(0,113,227,0.25), transparent),
    radial-gradient(ellipse 50% 50% at 80% 50%, rgba(124,58,237,0.2), transparent);
}

.cta-final-inner {
  position: relative;
  z-index: 1;
  max-width: 600px;
  margin: 0 auto;
}

.cta-final-title {
  font-size: clamp(28px, 4vw, 44px);
  font-weight: 800;
  color: #fff;
  margin: 0 0 16px;
  letter-spacing: -0.02em;
}

.cta-final-sub {
  font-size: 16px;
  color: rgba(255,255,255,0.5);
  margin: 0 0 40px;
  line-height: 1.6;
}

.btn-cta-final {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 40px;
  background: #fff;
  color: #0071e3;
  font-size: 16px;
  font-weight: 800;
  border-radius: 14px;
  text-decoration: none;
  transition: transform 0.15s, box-shadow 0.2s;
  letter-spacing: -0.01em;
}

.btn-cta-final:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(255,255,255,0.15);
}

/* ── RESPONSIVE ── */
@media (max-width: 900px) {
  .value-grid {
    grid-template-columns: 1fr;
  }
  .value-vs {
    display: none;
  }
  .testimonials-grid {
    grid-template-columns: 1fr;
  }
  .pricing-grid {
    grid-template-columns: repeat(3, 1fr);
  }
  .path-panel {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

@media (max-width: 600px) {
  .lp-section {
    padding: 64px 20px;
  }
  .features-grid {
    grid-template-columns: 1fr;
  }
  .pricing-grid {
    grid-template-columns: 1fr;
  }
  .stats-inner {
    flex-direction: column;
    gap: 32px;
  }
  .stat-divider {
    width: 48px;
    height: 1px;
  }
  .path-tabs {
    gap: 8px;
  }
  .path-tab {
    min-width: 100px;
    padding: 12px 16px;
  }
}
</style>
