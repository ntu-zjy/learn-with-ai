import { defineConfig } from 'vitepress'
import markdownItKatex from 'markdown-it-katex'

const isSealos = !!process.env.SEALOS || process.env.SEALOS === '1'
const base = process.env.BASE || (isSealos ? '/' : '/learn-with-ai/')

const siteUrl = process.env.SITE_URL || 'https://learn-with-ai.example.com'

const commonHead = [
  ['link', { rel: 'icon', href: `${base}logo.png`.replace('//', '/') }],
  ['link', { rel: 'stylesheet', href: `${base}style.css`.replace('//', '/') }],
  ['meta', { name: 'theme-color', content: '#6366f1' }],
  ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0' }],
  [
    'meta',
    {
      name: 'keywords',
      content:
        'AI学习,AI时代学习,AI辅助学习,Prompt技巧,AI思维,学生AI,考研AI,求职AI,中年AI,商业AI,炒股AI,AI教程,人工智能学习方法'
    }
  ],
  ['meta', { name: 'author', content: 'Learn With AI' }]
]

const commonThemeConfig = {
  logo: '/logo.png',
  siteTitle: 'Learn With AI',
  search: { provider: 'local' },
  outline: { level: [1, 6], label: '本页导航' },
  footer: {
    message: '用 AI，学得更深、更快、更有价值',
    copyright: `© ${new Date().getFullYear()} Learn With AI. 保留所有权利。`
  }
}

// ── 侧边栏：免费入门 ─────────────────────────────────────────────
const freeIntroSidebar = [
  {
    text: '免费入门',
    collapsed: false,
    items: [
      { text: '为什么这门课与众不同', link: '/zh-cn/free/why-different/' },
      { text: '什么是 AI 思维？', link: '/zh-cn/free/ai-mindset/' },
      { text: 'AI 学习 vs 普通搜索', link: '/zh-cn/free/ai-vs-search/' },
      { text: '你的第一次 AI 对话实验', link: '/zh-cn/free/first-conversation/' },
      { text: '选择你的学习路径', link: '/zh-cn/free/choose-path/' }
    ]
  }
]

// ── 侧边栏：青少年模块 ────────────────────────────────────────────
const youthSidebar = [
  {
    text: '青少年：AI 学习启蒙',
    collapsed: false,
    items: [
      { text: '学习路线图', link: '/zh-cn/youth/learning-map/' },
      { text: '用 AI 写更好的作文', link: '/zh-cn/youth/ai-writing/' },
      { text: '用 AI 攻克数学难题', link: '/zh-cn/youth/ai-math/' },
      { text: '用 AI 背单词记知识', link: '/zh-cn/youth/ai-vocabulary/' },
      { text: 'AI 辅助课后复习系统', link: '/zh-cn/youth/ai-review-system/' }
    ]
  },
  {
    text: '进阶：AI 学习力提升',
    collapsed: true,
    items: [
      { text: '如何向 AI 提出好问题', link: '/zh-cn/youth/ask-better/' },
      { text: '用 AI 制作知识脑图', link: '/zh-cn/youth/knowledge-map/' },
      { text: 'AI 帮你做项目研究', link: '/zh-cn/youth/project-research/' }
    ]
  }
]

// ── 侧边栏：青年模块 ──────────────────────────────────────────────
const youngAdultSidebar = [
  {
    text: '青年：AI 驱动的成长',
    collapsed: false,
    items: [
      { text: '学习路线图', link: '/zh-cn/young-adult/learning-map/' },
      { text: 'Prompt 思维精讲', link: '/zh-cn/young-adult/prompt-thinking/' },
      { text: '用 AI 制定学习计划', link: '/zh-cn/young-adult/study-plan/' },
      { text: '拆解复杂知识的 AI 方法', link: '/zh-cn/young-adult/decompose-knowledge/' },
      { text: '构建你的 AI 知识库', link: '/zh-cn/young-adult/knowledge-base/' }
    ]
  },
  {
    text: '考研与深造',
    collapsed: false,
    items: [
      { text: 'AI 辅助考研备考全流程', link: '/zh-cn/young-adult/exam-prep/' },
      { text: '用 AI 精读论文', link: '/zh-cn/young-adult/paper-reading/' },
      { text: 'AI 助力申请文书', link: '/zh-cn/young-adult/application-essay/' }
    ]
  },
  {
    text: '求职与职业规划',
    collapsed: false,
    items: [
      { text: 'AI 打造完美简历', link: '/zh-cn/young-adult/resume/' },
      { text: 'AI 面试模拟与复盘', link: '/zh-cn/young-adult/interview-prep/' },
      { text: '用 AI 做职业路径分析', link: '/zh-cn/young-adult/career-planning/' },
      { text: 'AI 加速技能提升', link: '/zh-cn/young-adult/skill-upgrade/' }
    ]
  }
]

// ── 侧边栏：中年模块 ──────────────────────────────────────────────
const middleAgedSidebar = [
  {
    text: '中年：AI 商业洞察',
    collapsed: false,
    items: [
      { text: '学习路线图', link: '/zh-cn/middle-aged/learning-map/' },
      { text: '用 AI 快速了解一个行业', link: '/zh-cn/middle-aged/industry-research/' },
      { text: '商业机会的 AI 扫描方法', link: '/zh-cn/middle-aged/opportunity-scan/' },
      { text: 'AI 辅助商业计划书', link: '/zh-cn/middle-aged/business-plan/' }
    ]
  },
  {
    text: '投资与财富',
    collapsed: false,
    items: [
      { text: 'AI 辅助股票分析入门', link: '/zh-cn/middle-aged/stock-analysis/' },
      { text: '用 AI 读懂财报', link: '/zh-cn/middle-aged/financial-report/' },
      { text: 'AI 助力资产配置思考', link: '/zh-cn/middle-aged/asset-allocation/' }
    ]
  },
  {
    text: '人生决策',
    collapsed: false,
    items: [
      { text: '打造你的个人 AI 助手系统', link: '/zh-cn/middle-aged/personal-ai-system/' },
      { text: 'AI 时代的终身学习框架', link: '/zh-cn/middle-aged/lifelong-learning/' }
    ]
  }
]

export default defineConfig({
  markdown: {
    config: (md) => {
      md.use(markdownItKatex)
    }
  },
  base: base,
  ignoreDeadLinks: true,

  vite: {
    server: { watch: { ignored: ['**/docs/.vitepress/dist/**'] } },
    build: { chunkSizeWarningLimit: 2000 }
  },

  sitemap: {
    hostname: siteUrl,
    changefreq: 'weekly'
  },

  locales: {
    root: {
      label: '',
      lang: 'zh-CN',
      link: '/zh-cn/',
      themeConfig: {
        ...commonThemeConfig,
        notFound: {
          title: '页面未找到',
          quote: '你访问的页面不存在。',
          linkText: '返回首页',
          linkUrl: '/zh-cn/'
        }
      }
    },
    'zh-cn': {
      label: '简体中文',
      lang: 'zh-CN',
      link: '/zh-cn/',
      title: 'Learn With AI — AI 时代的学习革命',
      description:
        '不是教你用什么 AI 工具，而是教你用 AI 思考、学习、成长。面向青少年、青年、中年三类人群，打造专属 AI 学习力。',
      head: commonHead,
      themeConfig: {
        ...commonThemeConfig,
        notFound: {
          title: '页面未找到',
          quote: '你访问的页面不存在，可能已被移动或删除。',
          linkText: '返回首页',
          linkUrl: '/zh-cn/'
        },
        outline: { level: [1, 6], label: '本页导航' },
        nav: [
          { text: '首页', link: '/zh-cn/' },
          {
            text: '免费入门',
            link: '/zh-cn/free/why-different/',
            activeMatch: '/zh-cn/free/'
          },
          {
            text: '青少年课程',
            link: '/zh-cn/youth/learning-map/',
            activeMatch: '/zh-cn/youth/'
          },
          {
            text: '青年课程',
            link: '/zh-cn/young-adult/learning-map/',
            activeMatch: '/zh-cn/young-adult/'
          },
          {
            text: '中年课程',
            link: '/zh-cn/middle-aged/learning-map/',
            activeMatch: '/zh-cn/middle-aged/'
          },
          {
            text: '立即加入',
            link: '/zh-cn/pricing/'
          }
        ],
        sidebar: {
          '/zh-cn/free/': freeIntroSidebar,
          '/zh-cn/youth/': youthSidebar,
          '/zh-cn/young-adult/': youngAdultSidebar,
          '/zh-cn/middle-aged/': middleAgedSidebar
        }
      }
    }
  }
})
