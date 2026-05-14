import DefaultTheme from 'vitepress/theme'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
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
    app.use(ElementPlus)

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
