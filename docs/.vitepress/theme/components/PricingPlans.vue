<template>
  <div class="pricing-page">
    <div class="pricing-header">
      <h2>选择适合你的方案</h2>
      <p>所有方案包含 14 天无理由退款保障</p>
    </div>
    <div class="billing-toggle">
      <button :class="{ active: billing === 'yearly' }" @click="billing = 'yearly'">按年付（省 40%）</button>
      <button :class="{ active: billing === 'monthly' }" @click="billing = 'monthly'">按月付</button>
    </div>
    <div class="pay-type-toggle" aria-label="支付方式">
      <span>支付方式</span>
      <button :class="{ active: payType === 'alipay' }" type="button" @click="payType = 'alipay'">
        支付宝
      </button>
      <button :class="{ active: payType === 'wxpay' }" type="button" @click="payType = 'wxpay'">
        微信支付
      </button>
    </div>
    <el-alert
      v-if="checkoutNotice"
      class="checkout-notice"
      :title="checkoutNotice"
      type="success"
      show-icon
      :closable="false"
    />
    <el-alert
      v-if="membership.error"
      class="checkout-notice"
      :title="membership.error"
      type="warning"
      show-icon
      :closable="false"
    />
    <div class="plans-grid">
      <div
        v-for="plan in plans"
        :key="plan.id"
        class="plan-card"
        :class="{ highlight: plan.highlight, current: plan.id !== 'free' && hasPlanAccess(plan.id) }"
      >
        <div v-if="plan.badge" class="plan-badge">{{ plan.badge }}</div>
        <div class="plan-header">
          <div class="plan-icon">{{ plan.icon }}</div>
          <div class="plan-name">{{ plan.name }}</div>
          <div class="plan-tagline">{{ plan.tagline }}</div>
        </div>
        <div class="plan-pricing">
          <span class="plan-price">{{ billing === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice }}</span>
          <span class="plan-period">{{ billing === 'yearly' ? '/ 年' : '/ 月' }}</span>
        </div>
        <div v-if="billing === 'yearly' && plan.savings" class="plan-savings">
          比月付节省 {{ plan.savings }}
        </div>
        <ul class="plan-features">
          <li v-for="f in plan.features" :key="f.text" :class="f.included ? '' : 'excluded'">
            <span class="check">{{ f.included ? '✓' : '✗' }}</span>
            {{ f.text }}
          </li>
        </ul>
        <button
          class="plan-cta"
          type="button"
          :class="plan.highlight ? 'cta-primary' : 'cta-secondary'"
          :disabled="plan.id !== 'free' && (membership.loading || hasPlanAccess(plan.id))"
          @click="handlePlanClick(plan)"
        >
          {{ getCtaText(plan) }}
        </button>
        <div class="plan-audience">适合：{{ plan.audience }}</div>
      </div>
    </div>
    <div class="faq-section">
      <h3>常见问题</h3>
      <div v-for="q in faqs" :key="q.q" class="faq-item" @click="q.open = !q.open">
        <div class="faq-q">{{ q.q }} <span>{{ q.open ? '−' : '+' }}</span></div>
        <div v-if="q.open" class="faq-a">{{ q.a }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { planLevel, useMembership } from '../composables/useMembership'

const billing = ref('yearly')
const payType = ref('alipay')
const checkoutNotice = ref('')

const { membership, currentPlan, isAuthenticated, startCheckout, refreshMembership } = useMembership()

const plans = [
  {
    id: 'free',
    icon: '🌱',
    name: '免费体验',
    tagline: '零门槛开始 AI 学习之旅',
    yearlyPrice: '¥0',
    monthlyPrice: '¥0',
    savings: null,
    badge: null,
    highlight: false,
    audience: '所有人',
    cta: '立即开始',
    features: [
      { text: 'AI 思维入门 5 节课', included: true },
      { text: '路径选择器', included: true },
      { text: '基础 Prompt 模板 10 条', included: true },
      { text: '青少年/青年/中年专项课程', included: false },
      { text: '完整 Prompt 模板库', included: false },
      { text: 'AI 对话练习场', included: false }
    ]
  },
  {
    id: 'basic',
    icon: '🎒',
    name: '基础版',
    tagline: '青少年 + 青年入门专项',
    yearlyPrice: '¥99',
    monthlyPrice: '¥14',
    savings: '约 ¥69',
    badge: null,
    highlight: false,
    audience: '学生 / 家长',
    cta: '订阅基础版',
    features: [
      { text: '免费内容全部解锁', included: true },
      { text: '青少年完整课程', included: true },
      { text: '青年入门课程', included: true },
      { text: 'Prompt 模板库（50 条）', included: true },
      { text: '考研 / 求职专项', included: false },
      { text: '商业洞察 / 投资专项', included: false }
    ]
  },
  {
    id: 'pro',
    icon: '🚀',
    name: '进阶版',
    tagline: '考研、求职、职业规划全覆盖',
    yearlyPrice: '¥299',
    monthlyPrice: '¥39',
    savings: '约 ¥169',
    badge: '最受欢迎',
    highlight: true,
    audience: '18-35 岁青年',
    cta: '订阅进阶版',
    features: [
      { text: '基础版全部内容', included: true },
      { text: '考研备考全流程', included: true },
      { text: 'AI 面试模拟与复盘', included: true },
      { text: '职业路径分析', included: true },
      { text: 'Prompt 模板库（200 条）', included: true },
      { text: '商业洞察 / 投资专项', included: false }
    ]
  },
  {
    id: 'premium',
    icon: '💼',
    name: '高级版',
    tagline: '商业洞察 + 投资决策 + 终身学习',
    yearlyPrice: '¥599',
    monthlyPrice: '¥79',
    savings: '约 ¥349',
    badge: null,
    highlight: false,
    audience: '35-55 岁中年',
    cta: '订阅高级版',
    features: [
      { text: '进阶版全部内容', included: true },
      { text: '行业快速调研方法论', included: true },
      { text: 'AI 辅助股票分析', included: true },
      { text: '个人 AI 助手系统', included: true },
      { text: 'Prompt 模板库（500+ 条）', included: true },
      { text: '优先新课程访问权', included: true }
    ]
  }
]

const faqs = reactive([
  {
    q: '付费内容是如何解锁的？',
    a: '订阅后，你的账号会自动解锁对应层级的所有内容。登录后即可访问所有已付费章节，无需额外操作。',
    open: false
  },
  {
    q: '可以中途升级方案吗？',
    a: '可以，随时可以升级到更高级别方案，升级时只需补差价，按剩余天数比例计算。',
    open: false
  },
  {
    q: '退款政策是什么？',
    a: '所有付费方案支持 14 天无理由退款，如遇内容质量问题可随时申请。',
    open: false
  },
  {
    q: '内容会持续更新吗？',
    a: '是的。AI 领域变化很快，我们承诺每月更新内容，订阅期内所有更新免费享受。',
    open: false
  }
])

const paidPlanIds = computed(() => plans.filter((plan) => plan.id !== 'free').map((plan) => plan.id))

onMounted(async () => {
  const params = new URLSearchParams(window.location.search)
  const checkout = params.get('checkout') || params.get('payment')

  if (checkout === 'success') {
    checkoutNotice.value = '支付完成，正在同步你的会员权益。'
    await refreshMembership()
  }

  if (checkout === 'cancel') {
    ElMessage.info('支付已取消，你可以随时重新选择方案。')
  }
})

function isCurrentPlan(planId) {
  return currentPlan.value === planId
}

function hasPlanAccess(planId) {
  return planLevel(currentPlan.value) >= planLevel(planId)
}

function getCtaText(plan) {
  if (plan.id === 'free') return '立即开始'
  if (isCurrentPlan(plan.id)) return '当前方案'
  if (hasPlanAccess(plan.id)) return '已包含'
  if (!isAuthenticated.value) return `登录并${plan.cta}`
  if (paidPlanIds.value.includes(currentPlan.value) && planLevel(plan.id) > planLevel(currentPlan.value)) return `升级到${plan.name}`
  return plan.cta
}

async function handlePlanClick(plan) {
  if (plan.id === 'free') {
    window.location.href = '/zh-cn/free/why-different/'
    return
  }

  const started = await startCheckout({ plan: plan.id, billing: billing.value, payType: payType.value })
  if (!started && membership.value.error) ElMessage.warning(membership.value.error)
}
</script>

<style scoped>
.pricing-page {
  max-width: 960px;
  margin: 0 auto;
  padding: 40px 24px;
}

.pricing-header {
  text-align: center;
  margin-bottom: 32px;
}

.pricing-header h2 {
  font-size: 28px;
  font-weight: 800;
  color: var(--vp-c-text-1);
  margin-bottom: 8px;
}

.pricing-header p {
  color: var(--vp-c-text-2);
}

.billing-toggle {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-bottom: 40px;
  background: var(--vp-c-bg-soft);
  border-radius: 10px;
  padding: 4px;
  width: fit-content;
  margin-left: auto;
  margin-right: auto;
}

.billing-toggle button {
  padding: 8px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  background: transparent;
  color: var(--vp-c-text-2);
  transition: all 0.2s;
}

.billing-toggle button.active {
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-weight: 700;
  box-shadow: 0 1px 4px rgba(0,0,0,.1);
}

.pay-type-toggle {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: -24px auto 36px;
  color: var(--vp-c-text-2);
  font-size: 13px;
}

.pay-type-toggle button {
  padding: 7px 14px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}

.pay-type-toggle button.active {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.checkout-notice {
  margin: -16px auto 28px;
  max-width: 680px;
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 64px;
}

.plan-card {
  position: relative;
  border: 1px solid var(--vp-c-divider);
  border-radius: 20px;
  padding: 28px 20px;
  background: var(--vp-c-bg-soft);
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: box-shadow 0.2s;
}

.plan-card:hover {
  box-shadow: 0 4px 20px rgba(0,0,0,.08);
}

.plan-card.highlight {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
}

.plan-card.current {
  border-color: var(--vp-c-green-1);
}

.plan-badge {
  position: absolute;
  top: -13px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--vp-c-brand-1);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 14px;
  border-radius: 20px;
  white-space: nowrap;
}

.plan-header {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
}

.plan-icon {
  font-size: 28px;
  margin-bottom: 4px;
}

.plan-name {
  font-size: 17px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.plan-tagline {
  font-size: 12px;
  color: var(--vp-c-text-2);
  line-height: 1.5;
}

.plan-pricing {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.plan-price {
  font-size: 30px;
  font-weight: 800;
  color: var(--vp-c-brand-1);
}

.plan-period {
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.plan-savings {
  font-size: 12px;
  color: var(--vp-c-green-1);
  background: var(--vp-c-green-soft);
  padding: 3px 8px;
  border-radius: 6px;
  width: fit-content;
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
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.plan-features li.excluded {
  opacity: 0.4;
}

.check {
  flex-shrink: 0;
  font-weight: 700;
  color: var(--vp-c-brand-1);
}

.excluded .check {
  color: var(--vp-c-text-3);
}

.plan-cta {
  display: block;
  width: 100%;
  text-align: center;
  padding: 11px;
  border: 0;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  font-family: inherit;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s;
}

.plan-cta:disabled {
  cursor: default;
  opacity: 0.72;
}

.cta-primary {
  background: var(--vp-c-brand-1);
  color: #fff;
}

.cta-primary:hover {
  background: var(--vp-c-brand-2);
}

.cta-secondary {
  border: 1px solid var(--vp-c-divider);
  color: var(--vp-c-text-1);
  background: var(--vp-c-bg);
}

.cta-secondary:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.plan-audience {
  font-size: 11px;
  color: var(--vp-c-text-3);
  text-align: center;
}

/* FAQ */
.faq-section {
  max-width: 640px;
  margin: 0 auto;
}

.faq-section h3 {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 20px;
  color: var(--vp-c-text-1);
}

.faq-item {
  border-bottom: 1px solid var(--vp-c-divider);
  padding: 16px 0;
  cursor: pointer;
}

.faq-q {
  display: flex;
  justify-content: space-between;
  font-size: 15px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.faq-a {
  margin-top: 10px;
  font-size: 14px;
  color: var(--vp-c-text-2);
  line-height: 1.7;
}

@media (max-width: 768px) {
  .plans-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .plans-grid {
    grid-template-columns: 1fr;
  }
}
</style>
