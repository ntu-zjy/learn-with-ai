import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  
  try {
    // 运行3次测试，取平均值
    const results = [];
    
    for (let run = 1; run <= 3; run++) {
      console.log(`\n===== 第 ${run} 次测试 =====`);
      const page = await browser.newPage();

      const startTime = Date.now();
      
      await page.goto('http://localhost:4173/learn-with-ai/zh-cn/', {
        waitUntil: 'load',
        timeout: 30000
      });

      const loadTime = Date.now() - startTime;
      
      const metrics = await page.evaluate(() => {
        const perf = performance.getEntriesByType('navigation')[0];
        const resources = performance.getEntriesByType('resource');
        
        return {
          domContentLoaded: perf?.domContentLoadedEventEnd - perf?.navigationStart || 0,
          loadComplete: perf?.loadEventEnd - perf?.navigationStart || 0,
          domInteractive: perf?.domInteractive - perf?.navigationStart || 0,
          resources: resources.map(r => ({
            name: r.name,
            type: r.initiatorType,
            duration: Math.round(r.duration),
            decodedSize: r.decodedBodySize || 0,
            transferSize: r.transferSize || 0,
            startTime: Math.round(r.startTime)
          }))
        };
      });

      console.log(`耗时: ${loadTime}ms`);
      results.push({ loadTime, metrics });
      
      await page.close();
    }

    // 计算平均值
    const avgLoadTime = Math.round(results.reduce((sum, r) => sum + r.loadTime, 0) / results.length);
    console.log(`\n========== 平均性能指标 ==========`);
    console.log(`平均加载时间: ${avgLoadTime}ms`);
    console.log(`最快: ${Math.min(...results.map(r => r.loadTime))}ms`);
    console.log(`最慢: ${Math.max(...results.map(r => r.loadTime))}ms`);

    // 合并所有测试数据进行分析
    const allResources = results[0].metrics.resources; // 用第一次的详细数据
    
    // 分类资源
    console.log('\n========== 资源详细分析 ==========');
    
    // JS 资源
    const jsResources = allResources.filter(r => r.name.endsWith('.js'));
    console.log(`\nJavaScript 文件 (${jsResources.length} 个):`);
    jsResources.forEach(r => {
      const name = r.name.split('/').pop();
      const sizeKB = (r.decodedSize / 1024).toFixed(2);
      const gzipKB = (r.transferSize / 1024).toFixed(2);
      console.log(`  ${sizeKB}KB (${gzipKB}KB gzip, ${r.duration}ms) - ${name}`);
    });

    // CSS 资源
    const cssResources = allResources.filter(r => r.name.endsWith('.css'));
    console.log(`\nCSS 文件 (${cssResources.length} 个):`);
    cssResources.forEach(r => {
      const name = r.name.split('/').pop();
      const sizeKB = (r.decodedSize / 1024).toFixed(2);
      const gzipKB = (r.transferSize / 1024).toFixed(2);
      console.log(`  ${sizeKB}KB (${gzipKB}KB gzip, ${r.duration}ms) - ${name}`);
    });

    // Font 资源
    const fontResources = allResources.filter(r => r.name.includes('font') || r.name.endsWith('.woff2'));
    console.log(`\nFont 文件 (${fontResources.length} 个):`);
    fontResources.forEach(r => {
      const name = r.name.split('/').pop();
      const sizeKB = (r.decodedSize / 1024).toFixed(2);
      console.log(`  ${sizeKB}KB - ${name}`);
    });

    // 其他资源
    console.log(`\n其他资源 (${allResources.length - jsResources.length - cssResources.length - fontResources.length} 个):`);
    allResources.filter(r => 
      !r.name.endsWith('.js') && 
      !r.name.endsWith('.css') && 
      !(r.name.includes('font') || r.name.endsWith('.woff2'))
    ).forEach(r => {
      const name = r.name.split('/').pop();
      const sizeKB = (r.decodedSize / 1024).toFixed(2);
      console.log(`  ${sizeKB}KB - ${name}`);
    });

    // 关键指标
    console.log('\n========== 关键瓶颈分析 ==========');
    
    const totalSize = allResources.reduce((sum, r) => sum + r.decodedSize, 0);
    const totalGzipSize = allResources.reduce((sum, r) => sum + r.transferSize, 0);
    const totalTime = allResources.reduce((sum, r) => sum + r.duration, 0);
    
    console.log(`\n总资源数: ${allResources.length}`);
    console.log(`总解压后大小: ${(totalSize / 1024).toFixed(2)}KB`);
    console.log(`总传输大小 (gzip): ${(totalGzipSize / 1024).toFixed(2)}KB`);
    console.log(`压缩率: ${((totalGzipSize / totalSize) * 100).toFixed(1)}%`);
    console.log(`所有资源加载总耗时: ${totalTime}ms`);
    
    // 找出最大的文件
    console.log('\n========== 最大的 5 个文件 ==========');
    allResources.sort((a, b) => b.decodedSize - a.decodedSize).slice(0, 5).forEach((r, i) => {
      const name = r.name.split('/').pop();
      const sizeKB = (r.decodedSize / 1024).toFixed(2);
      const percentTotal = ((r.decodedSize / totalSize) * 100).toFixed(1);
      console.log(`${i+1}. ${sizeKB}KB (${percentTotal}% 的总大小) - ${name}`);
    });

    // 最耗时的 5 个资源
    console.log('\n========== 加载最慢的 5 个资源 ==========');
    allResources.sort((a, b) => b.duration - a.duration).slice(0, 5).forEach((r, i) => {
      const name = r.name.split('/').pop();
      const sizeKB = (r.decodedSize / 1024).toFixed(2);
      console.log(`${i+1}. ${r.duration}ms (${sizeKB}KB) - ${name}`);
    });

    // 检查是否有串行加载问题
    console.log('\n========== 资源加载时间线 ==========');
    const sortedByStart = [...allResources].sort((a, b) => a.startTime - b.startTime);
    sortedByStart.slice(0, 8).forEach(r => {
      const name = r.name.split('/').pop();
      const endTime = r.startTime + r.duration;
      console.log(`${r.startTime.toString().padStart(5)}ms - ${endTime.toString().padStart(5)}ms (${r.duration.toString().padStart(4)}ms) ${name}`);
    });

  } catch (error) {
    console.error('错误:', error.message);
  }

  await browser.close();
})();
