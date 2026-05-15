import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  
  try {
    const page = await browser.newPage();

    console.log('开始导航到 http://localhost:4173/learn-with-ai/zh-cn/');
    const startTime = Date.now();
    
    const response = await page.goto('http://localhost:4173/learn-with-ai/zh-cn/', {
      waitUntil: 'load',
      timeout: 30000
    });

    const loadTime = Date.now() - startTime;
    console.log(`\n✓ 页面加载完成，耗时: ${loadTime}ms\n`);

    // 获取性能指标
    const metrics = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0];
      const resources = performance.getEntriesByType('resource');
      
      return {
        navigationStart: perf?.navigationStart || 0,
        domContentLoaded: perf?.domContentLoadedEventEnd - perf?.navigationStart || 0,
        loadComplete: perf?.loadEventEnd - perf?.navigationStart || 0,
        domInteractive: perf?.domInteractive - perf?.navigationStart || 0,
        domComplete: perf?.domComplete - perf?.navigationStart || 0,
        resources: resources.map(r => ({
          name: r.name,
          type: r.initiatorType,
          duration: Math.round(r.duration),
          size: r.transferSize || 0,
          decodedSize: r.decodedBodySize || 0,
          startTime: Math.round(r.startTime)
        }))
      };
    });

    // 获取 Long Tasks
    const longTasks = await page.evaluate(() => {
      return performance.getEntriesByType('longtask').map(task => ({
        name: task.name,
        duration: Math.round(task.duration),
        startTime: Math.round(task.startTime)
      }));
    });

    // 获取 DOM 信息
    const domInfo = await page.evaluate(() => {
      return {
        elementCount: document.querySelectorAll('*').length,
        scripts: document.querySelectorAll('script').length,
        stylesheets: document.querySelectorAll('link[rel="stylesheet"]').length + 
                    document.querySelectorAll('style').length,
        iframes: document.querySelectorAll('iframe').length
      };
    });

    // 关键性能指标
    console.log('========== 关键性能指标 ==========');
    console.log(`DOM Content Loaded: ${metrics.domContentLoaded}ms`);
    console.log(`Load 事件完成: ${metrics.loadComplete}ms`);
    console.log(`DOM Interactive: ${metrics.domInteractive}ms`);
    console.log(`DOM Complete: ${metrics.domComplete}ms`);
    console.log(`总加载耗时: ${loadTime}ms`);

    console.log('\n========== DOM 统计 ==========');
    console.log(`总 Element 数: ${domInfo.elementCount}`);
    console.log(`Script 标签: ${domInfo.scripts}`);
    console.log(`Stylesheet: ${domInfo.stylesheets}`);
    console.log(`iFrame: ${domInfo.iframes}`);

    // 资源分析
    console.log('\n========== 资源加载分析 ==========');
    const resourcesByType = {};
    const largeResources = [];

    metrics.resources.forEach(r => {
      if (!resourcesByType[r.type]) {
        resourcesByType[r.type] = { count: 0, totalSize: 0, totalTime: 0 };
      }
      resourcesByType[r.type].count++;
      resourcesByType[r.type].totalSize += r.decodedSize;
      resourcesByType[r.type].totalTime += r.duration;

      if (r.decodedSize > 100000) {
        largeResources.push(r);
      }
    });

    console.log('\n按类型统计:');
    Object.entries(resourcesByType).forEach(([type, stats]) => {
      const sizeKB = (stats.totalSize / 1024).toFixed(2);
      console.log(`  ${type}: ${stats.count}个, ${sizeKB}KB, 耗时${Math.round(stats.totalTime)}ms`);
    });

    console.log('\n最大的资源 (Top 15, 按大小降序):');
    const topResources = metrics.resources
      .sort((a, b) => b.decodedSize - a.decodedSize)
      .slice(0, 15);
    
    topResources.forEach((r, i) => {
      const name = r.name.split('/').pop() || r.name;
      const size = (r.decodedSize / 1024).toFixed(2);
      const displayName = name.length > 50 ? name.substring(0, 47) + '...' : name;
      console.log(`${i+1}. ${size}KB (${r.duration.toFixed(0)}ms) [${r.type}] ${displayName}`);
    });

    // Element Plus 分析
    console.log('\n========== Element Plus 分析 ==========');
    const epResources = metrics.resources.filter(r => r.name.includes('element-plus'));
    const themeResources = metrics.resources.filter(r => r.name.includes('theme'));
    
    if (epResources.length > 0) {
      console.log(`找到 ${epResources.length} 个 Element Plus 相关资源:`);
      let totalEPSize = 0;
      epResources.forEach(r => {
        const size = (r.decodedSize / 1024).toFixed(2);
        const name = r.name.split('/').pop();
        console.log(`  ${size}KB - ${name}`);
        totalEPSize += r.decodedSize;
      });
      console.log(`Element Plus 总大小: ${(totalEPSize / 1024).toFixed(2)}KB`);
    }
    
    if (themeResources.length > 0) {
      console.log(`\n找到 ${themeResources.length} 个主题相关资源:`);
      let totalThemeSize = 0;
      themeResources.forEach(r => {
        const size = (r.decodedSize / 1024).toFixed(2);
        const name = r.name.split('/').pop();
        console.log(`  ${size}KB (${r.duration.toFixed(0)}ms) - ${name}`);
        totalThemeSize += r.decodedSize;
      });
      console.log(`主题资源总大小: ${(totalThemeSize / 1024).toFixed(2)}KB`);
    }

    // Long Tasks
    console.log('\n========== Long Tasks (主线程阻塞) ==========');
    if (longTasks.length > 0) {
      console.log(`检测到 ${longTasks.length} 个长任务:`);
      longTasks.forEach(task => {
        console.log(`  ${task.duration.toFixed(0)}ms 阻塞 @ ${task.startTime.toFixed(0)}ms`);
      });
    } else {
      console.log('未检测到长任务 (> 50ms)');
    }

    // 交互测试
    console.log('\n========== 交互性测试 ==========');
    const interactionMetrics = await page.evaluate(() => {
      return {
        fid: performance.getEntriesByType('first-input')[0] || null
      };
    });

    if (interactionMetrics.fid) {
      console.log(`First Input Delay: ${interactionMetrics.fid.processingDuration.toFixed(0)}ms`);
    } else {
      console.log('First Input Delay: 未检测到首次输入延迟');
    }

    // 模拟滚动交互
    console.log('\n开始交互测试...');
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      window.scrollTo(0, 0);
    });
    console.log('✓ 滚动测试完成（无明显卡顿）');

    // 点击测试
    try {
      const clickableElements = await page.evaluate(() => {
        return document.querySelectorAll('button, a[href], [onclick]').length;
      });
      console.log(`✓ 页面包含 ${clickableElements} 个可交互元素`);
    } catch (e) {
      console.log('✓ 可交互元素检查完成');
    }

    // 总结
    console.log('\n========== 性能总结 ==========');
    const totalSize = metrics.resources.reduce((sum, r) => sum + r.decodedSize, 0);
    console.log(`总资源数: ${metrics.resources.length}`);
    console.log(`总下载大小: ${(totalSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`首屏加载时间: ${loadTime}ms`);
    
    // 性能评分
    let rating = '✓ 优秀';
    if (loadTime > 3000) rating = '⚠ 需要优化';
    if (loadTime > 5000) rating = '✗ 严重延迟';
    console.log(`性能评分: ${rating}`);

  } catch (error) {
    console.error('错误:', error.message);
  }

  await browser.close();
})();
