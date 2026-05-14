<script setup>
import DefaultTheme from 'vitepress/theme'
import { useData } from 'vitepress'
import { onMounted } from 'vue'
import TypeIt from 'typeit'
import AuthStatusButton from './components/AuthStatusButton.vue'

const { frontmatter } = useData()

onMounted(() => {
  const taglines = frontmatter.value?.typingTagline
  const el = document.querySelector('.VPHero .tagline')
  if (!el || !Array.isArray(taglines) || taglines.length === 0) return
  el.innerHTML = ''
  const instance = new TypeIt(el, { speed: 60, deleteSpeed: 30, loop: true, waitUntilVisible: true })
  taglines.forEach((line) => {
    instance.type(line).pause(1800).delete(null, { delay: 20 })
  })
  instance.go()
})
</script>

<template>
  <DefaultTheme.Layout>
    <template #nav-bar-content-after>
      <AuthStatusButton />
    </template>
    <template #nav-screen-content-after>
      <AuthStatusButton />
    </template>
  </DefaultTheme.Layout>
</template>
