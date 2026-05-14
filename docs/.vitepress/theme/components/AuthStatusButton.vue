<template>
  <div class="auth-status">
    <button v-if="!isAuthenticated" class="auth-button" type="button" @click="handleLogin">
      <el-icon><User /></el-icon>
      <span>登录</span>
    </button>

    <el-dropdown v-else trigger="click" popper-class="lwa-auth-menu" @command="handleCommand">
      <button class="member-button" type="button">
        <span class="member-avatar">{{ avatarText }}</span>
        <span class="member-meta">
          <span class="member-name">{{ displayName }}</span>
          <span class="member-plan">{{ currentPlanName }}</span>
        </span>
        <el-icon class="member-arrow"><ArrowDown /></el-icon>
      </button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="account">
            <el-icon><UserFilled /></el-icon>
            我的账户
          </el-dropdown-item>
          <el-dropdown-item command="pricing">
            <el-icon><CreditCard /></el-icon>
            课程方案
          </el-dropdown-item>
          <el-dropdown-item command="refresh">
            <el-icon><Refresh /></el-icon>
            刷新权益
          </el-dropdown-item>
          <el-dropdown-item divided command="logout">
            <el-icon><SwitchButton /></el-icon>
            退出登录
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowDown, CreditCard, Refresh, SwitchButton, User, UserFilled } from '@element-plus/icons-vue'
import { useMembership } from '../composables/useMembership'

const {
  membership,
  currentPlanName,
  isAuthenticated,
  refreshMembership,
  resumePendingCheckout,
  startLogin,
  logout
} = useMembership()

const displayName = computed(() => {
  const user = membership.value.user || {}
  return user.name || user.nickname || user.email || '我的账户'
})

const avatarText = computed(() => displayName.value.slice(0, 1).toUpperCase())

onMounted(async () => {
  const resumed = await resumePendingCheckout()
  if (!resumed) await refreshMembership()
})

function handleLogin() {
  const started = startLogin()
  if (!started) ElMessage.warning('登录后端还没有配置，请先设置 VITE_AUTH_LOGIN_URL 和 VITE_MEMBERSHIP_API_URL。')
}

async function handleCommand(command) {
  if (command === 'account') {
    window.location.href = '/zh-cn/account/'
    return
  }

  if (command === 'pricing') {
    window.location.href = '/zh-cn/pricing/'
    return
  }

  if (command === 'refresh') {
    await refreshMembership()
    if (membership.value.error) {
      ElMessage.error(membership.value.error)
    } else {
      ElMessage.success('会员权益已刷新')
    }
    return
  }

  if (command === 'logout') {
    await logout()
  }
}
</script>

<style scoped>
.auth-status {
  display: flex;
  align-items: center;
  margin-left: 12px;
}

.auth-button,
.member-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 34px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition:
    border-color 0.2s,
    color 0.2s,
    background 0.2s;
}

.auth-button {
  padding: 0 12px;
}

.auth-button:hover,
.member-button:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

.member-button {
  padding: 3px 8px 3px 4px;
}

.member-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
  font-size: 12px;
  font-weight: 800;
}

.member-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.1;
}

.member-name {
  max-width: 92px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.member-plan {
  color: var(--vp-c-text-2);
  font-size: 11px;
  font-weight: 500;
}

.member-arrow {
  color: var(--vp-c-text-3);
}

@media (max-width: 768px) {
  .auth-status {
    margin: 14px 0 0;
  }

  .auth-button,
  .member-button {
    width: 100%;
  }
}
</style>
