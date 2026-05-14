import DefaultTheme from 'vitepress/theme'
import {
  ElAlert, ElButton, ElTag, ElIcon,
  ElSteps, ElStep,
  ElDropdown, ElDropdownMenu, ElDropdownItem,
  ElMessage,
} from 'element-plus'
// 仅加载用到的组件 CSS（比全量 element-plus/dist/index.css 小 ~85%）
import 'element-plus/theme-chalk/el-alert.css'
import 'element-plus/theme-chalk/el-button.css'
import 'element-plus/theme-chalk/el-tag.css'
import 'element-plus/theme-chalk/el-icon.css'
import 'element-plus/theme-chalk/el-step.css'
import 'element-plus/theme-chalk/el-steps.css'
import 'element-plus/theme-chalk/el-dropdown.css'
import 'element-plus/theme-chalk/el-dropdown-menu.css'
import 'element-plus/theme-chalk/el-dropdown-item.css'
import 'element-plus/theme-chalk/base.css'
import Viewer from 'viewerjs'
import 'viewerjs/dist/viewer.css'
import { onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRoute } from 'vitepress'
import './style.css'
import Layout from './Layout.vue'

// 核心 UI 组件
import HomeFeatures from './components/HomeFeatures.vue'
import StepBar from './components/StepBar.vue'
import SummaryCard from './components/SummaryCard.vue'
import ReadingProgress from './components/ReadingProgress.vue'
import ChapterIntroduction from './components/ChapterIntroduction.vue'
import CopyOrDownloadAsMarkdownButtons from './components/CopyOrDownloadAsMarkdownButtons/index.vue'

// 课程专属组件（新建，待创建）
import PricingPlans from './components/PricingPlans.vue'
import AudiencePathSelector from './components/AudiencePathSelector.vue'
import PromptLab from './components/PromptLab.vue'
import PaywallBlock from './components/PaywallBlock.vue'
import AccountCenter from './components/AccountCenter.vue'
import AuthForm from './components/AuthForm.vue'
import DeepPracticeWorkshop from './components/DeepPracticeWorkshop.vue'
import AIChat from './components/AIChat.vue'
import ConversationAnimator from './components/ConversationAnimator.vue'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    // Element Plus 按需注册（只注册实际用到的组件）
    app.component('ElAlert', ElAlert)
    app.component('ElButton', ElButton)
    app.component('ElTag', ElTag)
    app.component('ElIcon', ElIcon)
    app.component('ElSteps', ElSteps)
    app.component('ElStep', ElStep)
    app.component('ElDropdown', ElDropdown)
    app.component('ElDropdownMenu', ElDropdownMenu)
    app.component('ElDropdownItem', ElDropdownItem)
    app.config.globalProperties.$message = ElMessage

    // 核心 UI
    app.component('HomeFeatures', HomeFeatures)
    app.component('StepBar', StepBar)
    app.component('SummaryCard', SummaryCard)
    app.component('ReadingProgress', ReadingProgress)
    app.component('ChapterIntroduction', ChapterIntroduction)
    app.component('CopyOrDownloadAsMarkdownButtons', CopyOrDownloadAsMarkdownButtons)

    // 课程专属
    app.component('PricingPlans', PricingPlans)
    app.component('AudiencePathSelector', AudiencePathSelector)
    app.component('PromptLab', PromptLab)
    app.component('PaywallBlock', PaywallBlock)
    app.component('AccountCenter', AccountCenter)
    app.component('AuthForm', AuthForm)
    app.component('DeepPracticeWorkshop', DeepPracticeWorkshop)
    app.component('AIChat', AIChat)
    app.component('ConversationAnimator', ConversationAnimator)

    // Viewer.js + TypeIt 初始化
    let viewer = null

    const initViewer = () => {
      const container = document.querySelector('.vp-doc')
      if (!container) return
      if (viewer) {
        viewer.destroy()
        viewer = null
      }
      const images = container.querySelectorAll('img')
      if (images.length > 0) {
        viewer = new Viewer(container, {
          toolbar: { zoomIn: 1, zoomOut: 1, oneToOne: 1, reset: 1, rotateLeft: 1, rotateRight: 1, flipHorizontal: 1, flipVertical: 1 },
          navbar: images.length > 1,
          title: false
        })
      }
    }



    app.mixin({
      setup() {
        const route = useRoute()

        onMounted(() => {
          initViewer()
        })

        watch(
          () => route.path,
          async () => {
            await nextTick()
            if (viewer) { viewer.destroy(); viewer = null }
            initViewer()
          }
        )

        onBeforeUnmount(() => {
          if (viewer) { viewer.destroy(); viewer = null }
        })
      }
    })
  }
}
