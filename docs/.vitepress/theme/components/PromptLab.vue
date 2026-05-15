<template>
  <div class="prompt-lab">
    <div class="lab-header">
      <span class="lab-icon">🧪</span>
      <div>
        <div class="lab-title">Prompt 实验室</div>
        <div class="lab-subtitle">对比"普通 Prompt"与"优化 Prompt"的效果差异</div>
      </div>
    </div>

    <div class="scenario-tabs">
      <button
        v-for="s in scenarios"
        :key="s.id"
        class="tab-btn"
        :class="{ active: activeScenario === s.id }"
        @click="activeScenario = s.id"
      >
        {{ s.label }}
      </button>
    </div>

    <div class="comparison-area">
      <div class="prompt-col">
        <div class="col-label bad">普通 Prompt</div>
        <div class="prompt-box bad-prompt">{{ currentScenario.bad }}</div>
        <div class="response-box">
          <div class="response-label">AI 回复效果</div>
          <div class="response-text bad-response">{{ currentScenario.badResponse }}</div>
          <div class="response-verdict bad-verdict">{{ currentScenario.badVerdict }}</div>
        </div>
      </div>

      <div class="arrow-divider">→</div>

      <div class="prompt-col">
        <div class="col-label good">优化 Prompt</div>
        <div class="prompt-box good-prompt">{{ currentScenario.good }}</div>
        <div class="response-box">
          <div class="response-label">AI 回复效果</div>
          <div class="response-text good-response">{{ currentScenario.goodResponse }}</div>
          <div class="response-verdict good-verdict">{{ currentScenario.goodVerdict }}</div>
        </div>
      </div>
    </div>

    <div class="lab-tip">
      <SvgIcon name="lightbulb" :size="16" class="tip-icon" />
      <span>{{ currentScenario.tip }}</span>
    </div>

    <div class="copy-section">
      <div class="copy-label">复制这条优化 Prompt 去用：</div>
      <div class="copy-row">
        <code class="copy-code">{{ currentScenario.good }}</code>
        <button class="copy-btn" @click="copy(currentScenario.good)">
          {{ copied ? '已复制 ✓' : '复制' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SvgIcon from './SvgIcon.vue'

const activeScenario = ref('study')
const copied = ref(false)

const scenarios = [
  { id: 'study', label: '制定学习计划' },
  { id: 'resume', label: '优化简历' },
  { id: 'research', label: '行业调研' },
  { id: 'essay', label: '辅助写作' }
]

const scenarioData = {
  study: {
    bad: '帮我制定一个学习计划',
    good: '我是大三学生，目标是6个月后通过计算机专业考研（数学、英语、专业课）。目前每天能抽出3小时。请帮我制定一个分阶段的备考计划，包括每个阶段的重点和每日时间分配。',
    badResponse: '好的，学习计划如下：第一周复习基础知识，第二周做练习题，第三周模拟考试……（无法针对你的具体情况）',
    goodResponse: '根据你的情况，建议分3个阶段：第1-2月打基础（数学：高数+线代，每日90分钟；英语：单词+阅读，60分钟；专业课：教材精读，30分钟）；第3-4月强化训练……',
    badVerdict: '太泛了，无法真正用起来',
    goodVerdict: '针对性强，可以直接执行',
    tip: '关键改进：加入了"身份"、"具体目标"、"时间限制"、"资源约束"——这四个要素让 AI 的回答从通用变成专属。'
  },
  resume: {
    bad: '帮我改一下简历',
    good: '我是应届毕业生，应聘互联网公司产品经理岗位（JD附后）。以下是我的简历草稿：[粘贴内容]。请帮我：1)找出与JD不匹配的地方；2)用更有说服力的方式改写项目经历，突出数据和成果；3)建议添加或删除的内容。',
    badResponse: '你的简历需要：1.增加工作经验描述 2.优化格式 3.添加技能……（没有针对你的实际内容）',
    goodResponse: '对比JD分析：①"用户调研"能力匹配，但你的描述缺少数据支撑；②建议将"参与了XX项目"改为"主导用户调研，收集200+样本，推动功能迭代3次，DAU提升12%"……',
    badVerdict: '空洞建议，对简历没有实质帮助',
    goodVerdict: '直接给出可用的改写方案',
    tip: '改进要点：提供了具体职位、JD和草稿内容，告诉AI要做的3件事，让AI的任务范围清晰可执行。'
  },
  research: {
    bad: '帮我了解一下新能源汽车行业',
    good: '我是一个想在新能源汽车供应链领域创业的35岁人士，有机械制造背景。请帮我用"投资人视角"分析新能源汽车行业：1)2024-2025年的核心增长驱动力；2)供应链中哪些细分赛道供需缺口最大；3)对机械制造背景的创业者，最具可行性的切入点是什么？请给出具体的公司案例。',
    badResponse: '新能源汽车行业概况：目前市场规模约XXX亿，主要企业有比亚迪、特斯拉、蔚来……（泛泛的百科内容）',
    goodResponse: '从供应链切入，三大高价值细分：①热管理系统（2025年市场增速30%+，外资份额高，国产替代空间大）；②大功率充电模块……结合你的机械背景，建议优先考虑……',
    badVerdict: '你能搜索到，没有独特价值',
    goodVerdict: '直指创业决策，有实操参考价值',
    tip: '核心技巧：指定"分析视角"（投资人视角）、提供自身背景约束、要求具体的输出格式，让AI给出真正有价值的洞察而不是百科摘要。'
  },
  essay: {
    bad: '帮我写一篇关于AI的文章',
    good: '请帮我写一篇800字的公众号文章，主题是"AI如何帮助普通人每天节省2小时"。目标读者是25-40岁的职场人，他们对AI有兴趣但觉得"门槛高用不起来"。文章需要：开头用一个具体场景吸引读者；中间给出3个可以立刻上手的方法，每个方法配一个真实可用的Prompt；结尾有一个行动号召。文风要接地气，避免使用"赋能"、"革命"等词。',
    badResponse: '人工智能时代已经到来，它正在改变我们的工作和生活方式。本文将探讨AI的应用和未来……（八股文写法）',
    goodResponse: '周一早上9点，李明又对着邮件发愁——要回复客户、要写周报、要整理会议记录……直到他学会了这三件事……[完整呈现3个可操作方法+对应Prompt]……今晚，就花5分钟试试第一个方法吧。',
    badVerdict: '写出来的文章空洞，无法发布',
    goodVerdict: '可以直接修改发布的质量',
    tip: '写作类Prompt三要素：1)明确长度和平台；2)定义目标读者的认知水平和痛点；3)要求具体的结构和禁用词——让AI的创作有边界。'
  }
}

const currentScenario = computed(() => scenarioData[activeScenario.value])

function copy(text) {
  navigator.clipboard.writeText(text).then(() => {
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
  })
}
</script>

<style scoped>
.prompt-lab {
  border: 1px solid var(--vp-c-divider);
  border-radius: 20px;
  padding: 28px;
  background: var(--vp-c-bg-soft);
  margin: 28px 0;
}

.lab-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.lab-icon {
  font-size: 32px;
}

.lab-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.lab-subtitle {
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.scenario-tabs {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.tab-btn {
  padding: 7px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 20px;
  background: transparent;
  font-size: 13px;
  cursor: pointer;
  color: var(--vp-c-text-2);
  transition: all 0.2s;
}

.tab-btn.active {
  background: var(--vp-c-brand-1);
  color: #fff;
  border-color: var(--vp-c-brand-1);
}

.comparison-area {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  margin-bottom: 20px;
}

.prompt-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.arrow-divider {
  font-size: 24px;
  color: var(--vp-c-brand-1);
  padding-top: 36px;
  flex-shrink: 0;
}

.col-label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 3px 10px;
  border-radius: 6px;
  width: fit-content;
}

.col-label.bad {
  background: var(--vp-c-red-soft);
  color: var(--vp-c-red-1);
}

.col-label.good {
  background: var(--vp-c-green-soft);
  color: var(--vp-c-green-1);
}

.prompt-box {
  padding: 14px;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.7;
  font-family: var(--vp-font-family-mono);
  min-height: 60px;
}

.bad-prompt {
  background: color-mix(in srgb, var(--vp-c-red-soft) 40%, transparent);
  border: 1px solid var(--vp-c-red-soft);
  color: var(--vp-c-text-1);
}

.good-prompt {
  background: color-mix(in srgb, var(--vp-c-green-soft) 40%, transparent);
  border: 1px solid var(--vp-c-green-soft);
  color: var(--vp-c-text-1);
}

.response-box {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.response-label {
  font-size: 11px;
  font-weight: 700;
  color: var(--vp-c-text-3);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.response-text {
  font-size: 13px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.response-verdict {
  font-size: 12px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
  width: fit-content;
}

.bad-verdict {
  background: var(--vp-c-red-soft);
  color: var(--vp-c-red-1);
}

.good-verdict {
  background: var(--vp-c-green-soft);
  color: var(--vp-c-green-1);
}

.lab-tip {
  background: var(--vp-c-yellow-soft);
  border-left: 3px solid var(--vp-c-yellow-1);
  padding: 12px 16px;
  border-radius: 0 10px 10px 0;
  font-size: 13px;
  color: var(--vp-c-text-1);
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  line-height: 1.6;
}

.tip-icon {
  flex-shrink: 0;
}

.copy-section {
  background: var(--vp-c-bg);
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 14px 16px;
}

.copy-label {
  font-size: 12px;
  color: var(--vp-c-text-2);
  margin-bottom: 8px;
}

.copy-row {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.copy-code {
  flex: 1;
  font-size: 12px;
  font-family: var(--vp-font-family-mono);
  color: var(--vp-c-text-1);
  word-break: break-all;
  line-height: 1.6;
}

.copy-btn {
  flex-shrink: 0;
  padding: 6px 14px;
  background: var(--vp-c-brand-1);
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: background 0.2s;
}

.copy-btn:hover {
  background: var(--vp-c-brand-2);
}

@media (max-width: 640px) {
  .comparison-area {
    flex-direction: column;
  }

  .arrow-divider {
    padding-top: 0;
    align-self: center;
    transform: rotate(90deg);
  }
}
</style>
