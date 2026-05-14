import DefaultTheme from 'vitepress/theme'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import Viewer from 'viewerjs'
import 'viewerjs/dist/viewer.css'
import TypeIt from 'typeit'
import { onMounted, onBeforeUnmount, watch, nextTick } from 'vue'
import { useRoute, useData } from 'vitepress'
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

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app, router }) {
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

    const initTypewriter = () => {
      const { frontmatter } = useData ? useData() : {}
      const taglines = frontmatter?.value?.typingTagline
      const el = document.querySelector('.VPHero .tagline')
      if (!el || !Array.isArray(taglines) || taglines.length === 0) return
      el.innerHTML = ''
      new TypeIt(el, {
        speed: 60,
        deleteSpeed: 30,
        loop: true,
        waitUntilVisible: true
      })
        .pause(600)
        .exec(function () {
          taglines.forEach((line, i) => {
            if (i < taglines.length - 1) {
              this.type(line).pause(1200).delete()
            } else {
              this.type(line).pause(2000).delete()
            }
          })
        })
        .go()
    }

    app.mixin({
      setup() {
        const route = useRoute()

        onMounted(() => {
          initViewer()
        })

        watch(
          () => route.path,
          () => nextTick(() => {
            if (viewer) { viewer.destroy(); viewer = null }
            initViewer()
          })
        )

        onBeforeUnmount(() => {
          if (viewer) { viewer.destroy(); viewer = null }
        })
      }
    })
  }
}
