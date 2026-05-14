#!/usr/bin/env node
/**
 * 把 .md 文件中内联的 :conversations="[...]" 数据
 * 提取到 <script setup> 块，避免中文引号破坏 Vue 模板解析。
 */

const fs = require('fs')
const path = require('path')

const files = process.argv.slice(2)

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8')

  // 已经用 script setup 处理过的（含 convData 变量）跳过
  if (content.includes('const convData') || content.includes('const conv')) {
    console.log(`SKIP (already converted): ${file}`)
    continue
  }

  // 找到 :conversations="..." 属性块（跨多行），提取其中的 JSON
  // 策略：找到 :conversations=" 然后数括号层级，直到匹配的 ]"
  const marker = ':conversations="'
  const markerIdx = content.indexOf(marker)
  if (markerIdx === -1) {
    console.log(`SKIP (no :conversations): ${file}`)
    continue
  }

  const dataStart = markerIdx + marker.length
  let depth = 0
  let i = dataStart
  let inStr = false
  let strChar = null
  let escape = false

  while (i < content.length) {
    const ch = content[i]
    if (escape) { escape = false; i++; continue }
    if (ch === '\\') { escape = true; i++; continue }

    if (!inStr) {
      if (ch === '"' || ch === "'") {
        inStr = true
        strChar = ch
      } else if (ch === '[' || ch === '{') {
        depth++
      } else if (ch === ']' || ch === '}') {
        depth--
        if (depth === 0) {
          // found end of array
          break
        }
      }
    } else {
      if (ch === strChar) inStr = false
    }
    i++
  }

  if (depth !== 0) {
    console.log(`ERROR (unbalanced brackets): ${file}`)
    continue
  }

  const dataEnd = i + 1 // include the closing ]
  const rawData = content.slice(dataStart, dataEnd)

  // After the ], there should be a closing " — skip it
  const afterData = content.slice(dataEnd)
  if (!afterData.trimStart().startsWith('"') && !afterData.trimStart().startsWith('\n  />') && !afterData.trimStart().startsWith('\n/>')) {
    // The closing " might be right there or on same line
  }

  // Replace the full :conversations="[...]" with :conversations="convData"
  const fullAttr = content.slice(markerIdx, dataEnd + 1) // +1 to include closing "
  const newContent = content.replace(fullAttr, ':conversations="convData"')

  // Now insert <script setup> block right after frontmatter
  // Find the end of frontmatter (second ---)
  const fmEnd = newContent.indexOf('---', 3) + 3
  const scriptBlock = `\n\n<script setup>\nconst convData = ${rawData}\n</script>`

  // Check if there's already a <script setup>
  let finalContent
  if (newContent.includes('<script setup>')) {
    // Insert the const before </script>
    finalContent = newContent.replace(
      '<script setup>',
      `<script setup>\nconst convData = ${rawData}\n`
    )
    // But we need to remove the duplicate definition if re-running
  } else {
    finalContent = newContent.slice(0, fmEnd) + scriptBlock + newContent.slice(fmEnd)
  }

  fs.writeFileSync(file, finalContent, 'utf8')
  console.log(`DONE: ${file}`)
}
