<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  title: { type: String, default: 'AI 对话动画演示' },
  conversations: {
    type: Array,
    required: true,
    // [{ label: '普通问法', messages: [{ role: 'user'|'ai', text: '' }] }]
  },
  autoPlay: { type: Boolean, default: true },
  speed: { type: Number, default: 40 }, // ms per char
})

const activeIdx = ref(0)
const visibleMessages = ref([])
const typingIdx = ref(-1)
const displayedText = ref('')
const playing = ref(false)
let timer = null
let charTimer = null

const currentConv = () => props.conversations[activeIdx.value]

const clearTimers = () => {
  clearTimeout(timer)
  clearTimeout(charTimer)
}

const typeMessage = (text, done) => {
  let i = 0
  displayedText.value = ''
  const tick = () => {
    if (i <= text.length) {
      displayedText.value = text.slice(0, i)
      i++
      charTimer = setTimeout(tick, props.speed)
    } else {
      done()
    }
  }
  tick()
}

const playConversation = () => {
  clearTimers()
  visibleMessages.value = []
  typingIdx.value = -1
  displayedText.value = ''
  playing.value = true

  const msgs = currentConv().messages
  let msgIdx = 0

  const showNext = () => {
    if (msgIdx >= msgs.length) {
      playing.value = false
      typingIdx.value = -1
      return
    }
    const msg = msgs[msgIdx]
    typingIdx.value = msgIdx

    typeMessage(msg.text, () => {
      visibleMessages.value.push({ ...msg, text: msg.text })
      typingIdx.value = -1
      msgIdx++
      timer = setTimeout(showNext, 600)
    })
  }

  timer = setTimeout(showNext, 300)
}

const switchConv = (idx) => {
  if (idx === activeIdx.value) return
  clearTimers()
  activeIdx.value = idx
  playConversation()
}

const replay = () => playConversation()

onMounted(() => {
  if (props.autoPlay) playConversation()
})

onUnmounted(() => clearTimers())

watch(activeIdx, () => {})
</script>

<template>
  <div class="conv-animator">
    <div class="ca-header">
      <div class="ca-title">{{ title }}</div>
      <div class="ca-tabs">
        <button
          v-for="(conv, i) in conversations"
          :key="i"
          class="ca-tab"
          :class="{ active: activeIdx === i }"
          @click="switchConv(i)"
        >
          {{ conv.label }}
        </button>
      </div>
      <button class="ca-replay" :disabled="playing" @click="replay">
        {{ playing ? '演示中…' : '▶ 重播' }}
      </button>
    </div>

    <div class="ca-screen">
      <div class="ca-bar">
        <span class="dot red" /><span class="dot yellow" /><span class="dot green" />
        <span class="ca-bar-label">{{ currentConv().label }}</span>
      </div>
      <div class="ca-messages">
        <template v-for="(msg, i) in currentConv().messages" :key="i">
          <!-- already shown messages -->
          <div
            v-if="visibleMessages[i]"
            class="ca-msg"
            :class="msg.role"
          >
            <div class="ca-msg-label">{{ msg.role === 'user' ? '学生' : 'AI' }}</div>
            <div class="ca-msg-text">{{ msg.text }}</div>
          </div>
          <!-- currently typing -->
          <div
            v-else-if="typingIdx === i"
            class="ca-msg"
            :class="msg.role"
          >
            <div class="ca-msg-label">{{ msg.role === 'user' ? '学生' : 'AI' }}</div>
            <div class="ca-msg-text typing-text">
              {{ displayedText }}<span class="cursor">|</span>
            </div>
          </div>
        </template>

        <div v-if="!playing && !visibleMessages.length" class="ca-empty">
          点击上方标签选择对话场景，或点击「重播」
        </div>
      </div>
    </div>

    <div v-if="currentConv().insight" class="ca-insight">
      <span class="insight-icon">💡</span>
      <span>{{ currentConv().insight }}</span>
    </div>
  </div>
</template>

<style scoped>
.conv-animator {
  margin: 20px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  overflow: hidden;
  background: var(--vp-c-bg);
}

.ca-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px 14px;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}

.ca-title {
  font-weight: 600;
  font-size: 13px;
  color: var(--vp-c-text-1);
  margin-right: 4px;
}

.ca-tabs {
  display: flex;
  gap: 6px;
  flex: 1;
}

.ca-tab {
  padding: 4px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 20px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.ca-tab.active {
  background: var(--vp-c-brand-1);
  color: #fff;
  border-color: var(--vp-c-brand-1);
}

.ca-replay {
  padding: 4px 12px;
  border: 1px solid var(--vp-c-brand-soft);
  border-radius: 6px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
}

.ca-replay:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ca-screen {
  background: var(--vp-c-bg);
}

.ca-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}

.dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}
.dot.red { background: #ff5f57; }
.dot.yellow { background: #febc2e; }
.dot.green { background: #28c840; }

.ca-bar-label {
  margin-left: 8px;
  font-size: 12px;
  color: var(--vp-c-text-3);
}

.ca-messages {
  min-height: 200px;
  max-height: 360px;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ca-empty {
  margin: auto;
  color: var(--vp-c-text-3);
  font-size: 13px;
  text-align: center;
}

.ca-msg {
  display: flex;
  flex-direction: column;
  gap: 3px;
  max-width: 82%;
  animation: msg-in 0.2s ease;
}

.ca-msg.user {
  align-self: flex-end;
  align-items: flex-end;
}

.ca-msg.ai {
  align-self: flex-start;
  align-items: flex-start;
}

.ca-msg-label {
  font-size: 11px;
  color: var(--vp-c-text-3);
  padding: 0 4px;
}

.ca-msg-text {
  padding: 9px 13px;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.65;
  white-space: pre-wrap;
}

.ca-msg.user .ca-msg-text {
  background: var(--vp-c-brand-1);
  color: #fff;
  border-radius: 10px 10px 2px 10px;
}

.ca-msg.ai .ca-msg-text {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px 10px 10px 2px;
}

.typing-text {
  min-width: 24px;
}

.cursor {
  display: inline-block;
  color: var(--vp-c-brand-1);
  animation: blink 0.7s infinite;
  font-weight: 300;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

@keyframes msg-in {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

.ca-insight {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px 16px;
  background: var(--vp-c-brand-soft);
  border-top: 1px solid var(--vp-c-divider);
  font-size: 13px;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

.insight-icon {
  font-style: normal;
  flex-shrink: 0;
}
</style>
