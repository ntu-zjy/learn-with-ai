<script setup>
import { computed } from 'vue'
import { courseWorkshops } from '../data/deepPracticeWorkshops.js'

const props = defineProps({
  chapter: {
    type: String,
    required: true
  }
})

const workshop = computed(() => courseWorkshops[props.chapter])
const demoSteps = computed(() => workshop.value?.workflow?.slice(0, 4) ?? [])
</script>

<template>
  <section
    v-if="workshop"
    class="deep-practice-workshop"
  >
    <div class="dpw-hero">
      <div class="dpw-kicker">深度实操工作坊</div>
      <h2>{{ workshop.title }}</h2>
      <p>{{ workshop.subtitle }}</p>
      <div class="dpw-meta">
        <span>适合：{{ workshop.audience }}</span>
        <span>时长：{{ workshop.duration }}</span>
        <span>产出：{{ workshop.output }}</span>
      </div>
    </div>

    <div class="dpw-demo">
      <div class="dpw-flow">
        <div
          v-for="(step, index) in demoSteps"
          :key="step.title"
          class="dpw-flow-step"
          :style="{ '--delay': `${(index * 0.3).toFixed(1)}s` }"
        >
          <span>{{ index + 1 }}</span>
          <div>
            <strong>{{ step.title }}</strong>
            <p>{{ step.action }}</p>
          </div>
        </div>
      </div>

      <div class="dpw-screen">
        <div class="dpw-screen-bar">
          <span />
          <span />
          <span />
          <strong>AI 对话实操模拟</strong>
        </div>
        <div class="dpw-chat">
          <div class="dpw-message user">
            {{ workshop.badPrompt }}
          </div>
          <div class="dpw-message ai">
            {{ workshop.badResult }}
          </div>
          <div class="dpw-message user good">
            {{ workshop.goodPrompt }}
          </div>
          <div class="dpw-message ai good">
            {{ workshop.sampleOutput }}
          </div>
        </div>
      </div>
    </div>

    <h2>实操一：把任务放回真实场景</h2>
    <p>
      这一节不要只收藏 Prompt。真正有效的学习，是先把一个真实任务写下来：谁要完成它、为什么卡住、手上有什么材料、完成后要交付什么。
      当这些信息被整理清楚，AI 才能从“泛泛回答者”变成“可以一起推进任务的教练”。
    </p>
    <div class="dpw-grid">
      <div class="dpw-panel">
        <h3>人物与目标</h3>
        <p>{{ workshop.scenario }}</p>
      </div>
      <div class="dpw-panel">
        <h3>原始材料</h3>
        <pre>{{ workshop.rawMaterial }}</pre>
      </div>
    </div>

    <h2>实操二：对比错误问法与结构化问法</h2>
    <p>
      新手最容易犯的错，是把复杂任务压缩成一句“帮我做一下”。这会让 AI 猜你的水平、猜你的目标、猜你的评价标准。
      下面的对比不是为了追求华丽措辞，而是训练你把任务拆成可检查的输入、步骤和输出。
    </p>
    <div class="dpw-compare">
      <div>
        <h3>常见坏做法</h3>
        <pre>{{ workshop.badMove }}</pre>
      </div>
      <div>
        <h3>更好的提问方式</h3>
        <pre>{{ workshop.goodPrompt }}</pre>
      </div>
    </div>

    <h2>实操三：按流程完成一轮闭环</h2>
    <p>
      一篇教程的价值，不是让你看完觉得“有道理”，而是让你能够按顺序做完一轮。下面这套流程建议你直接照做：
      每完成一步，都保存对话记录和你的修改痕迹。这样复盘时能看见，究竟是哪一句补充信息让 AI 的结果变好。
    </p>
    <ol class="dpw-workflow">
      <li
        v-for="step in workshop.workflow"
        :key="step.title"
      >
        <strong>{{ step.title }}</strong>
        <span>{{ step.action }}</span>
        <em>{{ step.check }}</em>
      </li>
    </ol>

    <h2>完整案例演示</h2>
    <div class="dpw-case">
      <div>
        <h3>AI 第一版为什么不够好</h3>
        <p>{{ workshop.badResult }}</p>
      </div>
      <div>
        <h3>结构化后得到的样例结果</h3>
        <pre>{{ workshop.sampleOutput }}</pre>
      </div>
      <div>
        <h3>继续追问，让结果进入可用状态</h3>
        <pre>{{ workshop.followUpPrompt }}</pre>
        <p>{{ workshop.followUpResult }}</p>
      </div>
    </div>

    <h2>工具与操作清单</h2>
    <p>
      工具不是越多越好。建议先用一个稳定的 AI 对话工具、一个文档或表格工具、一个资料保存位置完成闭环。
      等流程稳定后，再考虑知识库、自动化、浏览器插件或专业软件。判断工具是否有价值的标准只有一个：它是否让你更容易产出、检查和复盘。
    </p>
    <ul class="dpw-tools">
      <li
        v-for="tool in workshop.tools"
        :key="tool.name"
      >
        <strong>{{ tool.name }}</strong>
        <span>{{ tool.use }}</span>
      </li>
    </ul>

    <h2>可复制 Prompt 模板</h2>
    <div class="dpw-templates">
      <div
        v-for="template in workshop.templates"
        :key="template.title"
      >
        <h3>{{ template.title }}</h3>
        <pre>{{ template.body }}</pre>
      </div>
    </div>

    <h2>常见误区与修正</h2>
    <div class="dpw-mistakes">
      <div
        v-for="mistake in workshop.mistakes"
        :key="mistake.wrong"
      >
        <strong>{{ mistake.wrong }}</strong>
        <p>{{ mistake.reason }}</p>
        <span>{{ mistake.fix }}</span>
      </div>
    </div>

    <h2>本节作业</h2>
    <p>
      作业不是额外负担，而是把“我看懂了”变成“我能做出来”的分界线。建议把三档作业都保存在同一个文档里：
      第一档照着做，第二档换成自己的真实材料，第三档做成能展示给老师、同学、同事或家人的作品。
    </p>
    <div class="dpw-homework">
      <div>
        <h3>基础任务</h3>
        <p>{{ workshop.assignments.basic }}</p>
      </div>
      <div>
        <h3>进阶任务</h3>
        <p>{{ workshop.assignments.advanced }}</p>
      </div>
      <div>
        <h3>挑战任务</h3>
        <p>{{ workshop.assignments.challenge }}</p>
      </div>
    </div>
    <div class="dpw-submission">
      <strong>提交标准</strong>
      <span>{{ workshop.assignments.submission }}</span>
    </div>

    <h2>复盘问题</h2>
    <ol class="dpw-reflection">
      <li
        v-for="question in workshop.reflections"
        :key="question"
      >
        {{ question }}
      </li>
    </ol>

    <div class="dpw-boundary">
      <strong>{{ workshop.boundary.title }}</strong>
      <ul>
        <li
          v-for="item in workshop.boundary.items"
          :key="item"
        >
          {{ item }}
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.deep-practice-workshop {
  margin: 32px 0;
  padding-top: 6px;
  color: var(--vp-c-text-1);
}

.dpw-hero {
  padding: 24px 0 18px;
  border-top: 1px solid var(--vp-c-divider);
  border-bottom: 1px solid var(--vp-c-divider);
}

.dpw-kicker {
  width: fit-content;
  padding: 3px 10px;
  border: 1px solid var(--vp-c-brand-soft);
  border-radius: 999px;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-brand-soft);
  font-size: 12px;
  font-weight: 700;
}

.dpw-hero h2 {
  margin: 14px 0 10px !important;
  padding-top: 0 !important;
}

.dpw-hero p {
  max-width: 760px;
  color: var(--vp-c-text-2);
}

.dpw-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.dpw-meta span {
  padding: 6px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 12px;
}

.dpw-demo {
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(320px, 1.2fr);
  gap: 18px;
  margin: 22px 0 28px;
  align-items: stretch;
}

.dpw-flow,
.dpw-screen,
.dpw-panel,
.dpw-compare > div,
.dpw-case > div,
.dpw-templates > div,
.dpw-mistakes > div,
.dpw-homework > div,
.dpw-boundary {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.dpw-flow {
  display: grid;
  gap: 10px;
  padding: 14px;
}

.dpw-flow-step {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
  opacity: 0.72;
  animation: dpw-step-focus 4s ease-in-out infinite;
  animation-delay: var(--delay);
}

.dpw-flow-step span {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-weight: 700;
  font-size: 12px;
}

.dpw-flow-step p {
  margin: 3px 0 0;
  color: var(--vp-c-text-2);
  font-size: 12px;
}

.dpw-screen {
  overflow: hidden;
  background: var(--vp-c-bg);
}

.dpw-screen-bar {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.dpw-screen-bar span {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--vp-c-text-3);
}

.dpw-screen-bar strong {
  margin-left: 6px;
  font-size: 12px;
  color: var(--vp-c-text-2);
}

.dpw-chat {
  display: grid;
  gap: 10px;
  padding: 14px;
}

.dpw-message {
  max-width: 88%;
  padding: 10px 12px;
  border-radius: 8px;
  line-height: 1.65;
  font-size: 12px;
  white-space: pre-wrap;
}

.dpw-message.user {
  justify-self: end;
  background: var(--vp-c-brand-soft);
}

.dpw-message.ai {
  justify-self: start;
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
}

.dpw-message.good {
  border-color: color-mix(in srgb, var(--vp-c-brand-1) 50%, var(--vp-c-divider));
}

.dpw-grid,
.dpw-compare,
.dpw-case,
.dpw-templates,
.dpw-mistakes,
.dpw-homework {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin: 14px 0 22px;
}

.dpw-case,
.dpw-homework {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.dpw-panel,
.dpw-compare > div,
.dpw-case > div,
.dpw-templates > div,
.dpw-mistakes > div,
.dpw-homework > div,
.dpw-boundary {
  padding: 14px;
}

.dpw-panel h3,
.dpw-compare h3,
.dpw-case h3,
.dpw-templates h3,
.dpw-homework h3 {
  margin-top: 0;
}

.dpw-panel pre,
.dpw-compare pre,
.dpw-case pre,
.dpw-templates pre {
  margin: 8px 0 0;
  padding: 12px;
  border-radius: 6px;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 12px;
  line-height: 1.7;
  background: var(--vp-code-block-bg);
}

.dpw-workflow {
  display: grid;
  gap: 10px;
  padding-left: 0 !important;
  list-style: none;
}

.dpw-workflow li {
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr);
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid var(--vp-c-divider);
}

.dpw-workflow em {
  grid-column: 2;
  color: var(--vp-c-text-3);
  font-size: 12px;
  font-style: normal;
}

.dpw-tools {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  padding-left: 0 !important;
  list-style: none;
}

.dpw-tools li {
  padding: 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
}

.dpw-tools strong,
.dpw-tools span {
  display: block;
}

.dpw-tools span {
  margin-top: 4px;
  color: var(--vp-c-text-2);
  font-size: 12px;
}

.dpw-mistakes strong {
  color: var(--vp-c-red-1);
}

.dpw-mistakes span,
.dpw-submission span {
  display: block;
  color: var(--vp-c-text-2);
}

.dpw-submission {
  margin: 0 0 22px;
  padding: 12px 14px;
  border-left: 3px solid var(--vp-c-brand-1);
  background: var(--vp-c-bg-soft);
}

.dpw-reflection {
  margin-bottom: 20px;
}

.dpw-boundary {
  border-left: 3px solid var(--vp-c-warning-1);
}

.dpw-boundary ul {
  margin-bottom: 0;
}

@keyframes dpw-step-focus {
  0%,
  100% {
    opacity: 0.62;
    transform: translateY(0);
  }
  45% {
    opacity: 1;
    transform: translateY(-2px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .dpw-flow-step {
    animation: none;
  }
}

@media (max-width: 860px) {
  .dpw-demo,
  .dpw-grid,
  .dpw-compare,
  .dpw-case,
  .dpw-templates,
  .dpw-mistakes,
  .dpw-homework,
  .dpw-tools {
    grid-template-columns: 1fr;
  }

  .dpw-workflow li {
    grid-template-columns: 1fr;
  }

  .dpw-workflow em {
    grid-column: auto;
  }
}
</style>
