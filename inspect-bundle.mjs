import fs from 'fs';
import path from 'path';

const themeFile = '/Users/zhangjingyuan/Downloads/learn-with-ai/docs/.vitepress/dist/assets/chunks/theme.DzMIZ-wV.js';

// 检查 theme 文件内容中的导入
const content = fs.readFileSync(themeFile, 'utf-8');

console.log('========== theme.DzMIZ-wV.js 内容分析 ==========\n');

// 查找 element-plus 相关代码
const epMatches = content.match(/element-plus/g) || [];
console.log(`"element-plus" 出现次数: ${epMatches.length}\n`);

// 查找导入语句
const importMatches = content.match(/from\s+["']([^"']+)["']/g) || [];
const uniqueImports = new Set(importMatches);
console.log(`检测到的导入模块:\n`);
Array.from(uniqueImports)
  .sort()
  .slice(0, 20)
  .forEach((imp, i) => {
    console.log(`  ${i+1}. ${imp}`);
  });

// 检查是否包含完整的 Element Plus
if (content.includes('ElButton') || content.includes('ElForm') || content.includes('ElModal')) {
  console.log('\n✓ 检测到 Element Plus 组件代码 (如 ElButton, ElForm 等)');
} else {
  console.log('\n✗ 未检测到标准 Element Plus 组件');
}

// 文件大小分析
const stats = fs.statSync(themeFile);
const sizeKB = (stats.size / 1024).toFixed(2);
const sizeMB = (stats.size / 1024 / 1024).toFixed(3);
console.log(`\n文件大小: ${sizeKB}KB (${sizeMB}MB)`);
console.log(`文件行数: ${content.split('\n').length}`);

// 查看前几行以理解结构
console.log('\n========== theme 文件开头 (前 500 字符) ==========');
console.log(content.substring(0, 500) + '...\n');

