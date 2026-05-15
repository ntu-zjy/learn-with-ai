<script setup>
import { ref, nextTick, onMounted } from 'vue'

const props = defineProps({
  systemPrompt: { type: String, default: '' },
  placeholder: { type: String, default: '在这里输入你的问题...' },
  title: { type: String, default: '和 AI 对话练习' },
  hint: { type: String, default: '' },
  starterPrompts: { type: Array, default: () => [] },
})

const messages = ref([])
const input = ref('')
const loading = ref(false)
const error = ref('')
// 用户自备 Key（兜底）
const apiKey = ref('')
const showKeyInput = ref(false)
// 是否使用服务端代理（有 OPENROUTER_API_KEY 环境变量时为 true）
const useProxy = ref(false)
const chatContainer = ref(null)

onMounted(async () => {
  // 探测后端代理是否可用
  try {
    const r = await fetch('/api/health')
    if (r.ok) {
      // 代理可用，不需要用户填 Key
      useProxy.value = true
      return
    }
  } catch (_e) { /* ignore */ }
  // 代理不可用，回退到用户 Key
  apiKey.value = localStorage.getItem('openrouter_key') || ''
  showKeyInput.value = !apiKey.value
})

const scrollToBottom = async () => {
  await nextTick()
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight
  }
}

const saveKey = () => {
  if (apiKey.value.trim()) {
    localStorage.setItem('openrouter_key', apiKey.value.trim())
    showKeyInput.value = false
    error.value = ''
  }
}

const useStarter = (prompt) => {
  input.value = prompt
}

const sendMessage = async () => {
  const text = input.value.trim()
  if (!text || loading.value) return

  if (!useProxy.value && !apiKey.value) {
    showKeyInput.value = true
    return
  }

  messages.value.push({ role: 'user', content: text })
  input.value = ''
  loading.value = true
  error.value = ''
  await scrollToBottom()

  const sysMessages = props.systemPrompt
    ? [{ role: 'system', content: props.systemPrompt }]
    : []

  const payload = {
    messages: [...sysMessages, ...messages.value],
    stream: true,
  }

  // 走后端代理时不传 model（由服务端读环境变量决定）
  // 走用户 Key 时带上 model
  const fetchUrl = useProxy.value ? '/api/chat' : 'https://openrouter.ai/api/v1/chat/completions'
  const headers = { 'Content-Type': 'application/json' }

  if (!useProxy.value) {
    payload.model = 'deepseek/deepseek-chat-v3-0324:free'
    headers['Authorization'] = `Bearer ${apiKey.value}`
    headers['HTTP-Referer'] = window.location.origin
    headers['X-Title'] = 'Learn With AI'
  }

  try {
    const resp = await fetch(fetchUrl, { method: 'POST', headers, body: JSON.stringify(payload) })

    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}))
      throw new Error(data.error?.message || `请求失败 (${resp.status})`)
    }

    messages.value.push({ role: 'assistant', content: '' })
    await scrollToBottom()
    const lastIdx = messages.value.length - 1

    const reader = resp.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop()
      for (const line of lines) {
        // SSE error event（OpenRouter 有时通过这个传错误）
        if (line.startsWith('event: error')) continue
        if (!line.startsWith('data: ')) continue
        const data = line.slice(6).trim()
        if (data === '[DONE]') continue
        try {
          const chunk = JSON.parse(data)
          // OpenRouter 在流中返回的错误
          if (chunk.error) {
            throw new Error(chunk.error.message || '模型返回错误，请重试')
          }
          const delta = chunk.choices?.[0]?.delta?.content
          if (delta) {
            messages.value[lastIdx].content += delta
            await scrollToBottom()
          }
        } catch (_e) {
          if (_e.message && !_e.message.includes('JSON')) throw _e
        }
      }
    }
  } catch (e) {
    error.value = e.message || '网络错误，请稍后重试'
    if (!useProxy.value && (e.message?.includes('401') || e.message?.includes('403'))) {
      showKeyInput.value = true
    }
    messages.value.pop()
  } finally {
    loading.value = false
    await scrollToBottom()
  }
}

const clearChat = () => {
  messages.value = []
  error.value = ''
}

const onKeydown = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    sendMessage()
  }
}
</script>

<template>
  <div class="ai-chat">
    <div class="chat-header">
      <div class="chat-title">
        <span class="chat-dot" />
        <span>{{ title }}</span>
      </div>
      <div class="chat-actions">
        <button v-if="messages.length" class="action-btn" @click="clearChat">清空对话</button>
        <button v-if="!useProxy" class="action-btn" @click="showKeyInput = !showKeyInput">
          {{ apiKey ? '更换 API Key' : '配置 API Key' }}
        </button>
      </div>
    </div>

    <div v-if="!useProxy && showKeyInput" class="key-panel">
      <p class="key-tip">
        需要 <a href="https://openrouter.ai/keys" target="_blank">OpenRouter API Key</a>（免费注册，DeepSeek 模型免费使用）
      </p>
      <div class="key-row">
        <input
          v-model="apiKey"
          type="password"
          placeholder="sk-or-..."
          class="key-input"
          @keydown.enter="saveKey"
        />
        <button class="send-btn" @click="saveKey">保存</button>
      </div>
    </div>

    <div v-if="hint && !messages.length" class="chat-hint">
      {{ hint }}
    </div>

    <div v-if="starterPrompts.length && !messages.length" class="starters">
      <button
        v-for="p in starterPrompts"
        :key="p"
        class="starter-btn"
        @click="useStarter(p)"
      >
        {{ p }}
      </button>
    </div>

    <div ref="chatContainer" class="chat-messages" :class="{ empty: !messages.length }">
      <div
        v-for="(msg, i) in messages"
        :key="i"
        class="message"
        :class="msg.role"
      >
        <div class="msg-label">{{ msg.role === 'user' ? '你' : 'AI' }}</div>
        <div class="msg-content" v-html="msg.content.replace(/\n/g, '<br>')" />
      </div>
      <div v-if="loading && messages[messages.length - 1]?.role !== 'assistant'" class="message assistant">
        <div class="msg-label">AI</div>
        <div class="msg-content typing"><span /><span /><span /></div>
      </div>
    </div>

    <div v-if="error" class="chat-error">{{ error }}</div>

    <div class="chat-input-row">
      <textarea
        v-model="input"
        :placeholder="placeholder"
        class="chat-input"
        rows="2"
        @keydown="onKeydown"
      />
      <button
        class="send-btn"
        :disabled="loading || !input.trim()"
        @click="sendMessage"
      >
        {{ loading ? '…' : '发送' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.ai-chat {
  margin: 24px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg);
  overflow: hidden;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.chat-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 13px;
}

.chat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 0 2px #22c55e33;
}

.chat-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 3px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 12px;
  cursor: pointer;
}

.action-btn:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

.key-panel {
  padding: 14px 16px;
  background: var(--vp-c-yellow-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}

.key-tip {
  margin: 0 0 10px;
  font-size: 13px;
  color: var(--vp-c-text-2);
}

.key-tip a {
  color: var(--vp-c-brand-1);
}

.key-row {
  display: flex;
  gap: 8px;
}

.key-input {
  flex: 1;
  padding: 6px 10px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 13px;
}

.chat-hint {
  padding: 14px 16px;
  font-size: 13px;
  color: var(--vp-c-text-2);
  border-bottom: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
}

.starters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.starter-btn {
  padding: 6px 12px;
  border: 1px solid var(--vp-c-brand-soft);
  border-radius: 20px;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.15s;
}

.starter-btn:hover {
  background: var(--vp-c-brand-1);
  color: #fff;
}

.chat-messages {
  min-height: 180px;
  max-height: 420px;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.chat-messages.empty {
  display: flex;
  align-items: center;
  justify-content: center;
}

.message {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 85%;
}

.message.user {
  align-self: flex-end;
  align-items: flex-end;
}

.message.assistant {
  align-self: flex-start;
  align-items: flex-start;
}

.msg-label {
  font-size: 11px;
  color: var(--vp-c-text-3);
  padding: 0 4px;
}

.msg-content {
  padding: 10px 14px;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.7;
}

.message.user .msg-content {
  background: var(--vp-c-brand-1);
  color: #fff;
  border-radius: 10px 10px 2px 10px;
}

.message.assistant .msg-content {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px 10px 10px 2px;
}

.typing {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 12px 16px;
}

.typing span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--vp-c-text-3);
  animation: typing-bounce 1.2s infinite;
}

.typing span:nth-child(2) { animation-delay: 0.2s; }
.typing span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing-bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
  40% { transform: translateY(-6px); opacity: 1; }
}

.chat-error {
  margin: 0 16px;
  padding: 8px 12px;
  border-radius: 6px;
  background: var(--vp-c-red-soft);
  color: var(--vp-c-red-1);
  font-size: 12px;
}

.chat-input-row {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--vp-c-divider);
}

.chat-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
  font-size: 13px;
  line-height: 1.5;
  resize: none;
  font-family: inherit;
}

.chat-input:focus {
  outline: none;
  border-color: var(--vp-c-brand-1);
}

.send-btn {
  padding: 8px 18px;
  border: none;
  border-radius: 8px;
  background: var(--vp-c-brand-1);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
  white-space: nowrap;
}

.send-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.send-btn:not(:disabled):hover {
  opacity: 0.85;
}
</style>
