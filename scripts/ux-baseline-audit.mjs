import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const baseURL = process.env.C2K_AUDIT_URL || 'http://127.0.0.1:4518';
const outputRoot = resolve('docs/audits/ux-baseline');
const screenshotDir = resolve(outputRoot, 'screenshots');

const desktopProjects = [
  'maia', 'c2k', 'flux', 'corne', 'spotify', 'dashboard', 'dotfiles',
  'secretgate', 'techdigest', 'lightning', 'propeller', 'panecmd',
  'playlistai', 'djtrainer', 'songsorter', 'momentplayer', 'alldifferent',
  'vibe', 'polymarket', 'calsync', 'parley',
];

const mobileProjects = [
  'maia', 'c2k', 'flux', 'corne', 'spotify', 'dashboard', 'dotfiles',
  'secretgate', 'techdigest', 'lightning', 'propeller', 'djtrainer',
  'songsorter', 'momentplayer', 'alldifferent', 'vibe', 'polymarket',
  'calsync', 'parley',
];

const showcaseProjects = new Set([
  'maia', 'c2k', 'flux', 'corne', 'spotify', 'dotfiles', 'lightning',
]);

const report = {
  generatedAt: new Date().toISOString(),
  baseURL,
  browser: {},
  desktop: {},
  mobile: {},
  reducedMotion: {},
};

await mkdir(screenshotDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
report.browser = {
  name: browser.browserType().name(),
  version: browser.version(),
};

function installDiagnostics(page, bucket) {
  bucket.console = [];
  bucket.pageErrors = [];
  bucket.requestFailures = [];
  bucket.httpFailures = [];

  page.on('console', (message) => {
    if (['warning', 'error'].includes(message.type())) {
      bucket.console.push({ type: message.type(), text: message.text() });
    }
  });
  page.on('pageerror', (error) => bucket.pageErrors.push(error.message));
  page.on('requestfailed', (request) => {
    bucket.requestFailures.push({
      method: request.method(),
      url: request.url(),
      error: request.failure()?.errorText || 'unknown',
    });
  });
  page.on('response', (response) => {
    if (response.status() >= 400) {
      bucket.httpFailures.push({ status: response.status(), url: response.url() });
    }
  });
}

async function settle(page, duration = 850) {
  await page.waitForTimeout(duration);
}

async function openPage(page, pathname) {
  const response = await page.goto(`${baseURL}${pathname}`, {
    waitUntil: 'domcontentloaded',
  });
  await settle(page, 1800);
  return { status: response?.status() ?? null, url: page.url() };
}

async function viewportMetrics(page) {
  return page.evaluate(() => {
    const root = document.documentElement;
    const body = document.body;
    const visible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.visibility !== 'hidden' && style.display !== 'none' && rect.width > 0 && rect.height > 0;
    };
    const focusables = [...document.querySelectorAll(
      'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )].filter(visible);

    return {
      viewport: { width: innerWidth, height: innerHeight, devicePixelRatio },
      document: {
        clientWidth: root.clientWidth,
        scrollWidth: Math.max(root.scrollWidth, body.scrollWidth),
        clientHeight: root.clientHeight,
        scrollHeight: Math.max(root.scrollHeight, body.scrollHeight),
      },
      horizontalOverflow: Math.max(root.scrollWidth, body.scrollWidth) - root.clientWidth,
      focusableCount: focusables.length,
      focusables: focusables.slice(0, 80).map((element) => ({
        tag: element.tagName.toLowerCase(),
        text: (element.getAttribute('aria-label') || element.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 100),
        href: element.getAttribute('href'),
        id: element.id || null,
        class: typeof element.className === 'string' ? element.className : null,
      })),
      projectSemantics: [...document.querySelectorAll('.dashboard-node, .mn-card')]
        .filter(visible)
        .map((element) => ({
          project: element.getAttribute('data-project'),
          tag: element.tagName.toLowerCase(),
          role: element.getAttribute('role'),
          tabindex: element.getAttribute('tabindex'),
          ariaExpanded: element.getAttribute('aria-expanded'),
        })),
      animationCount: document.getAnimations().length,
      runningAnimationCount: document.getAnimations().filter((animation) => animation.playState === 'running').length,
    };
  });
}

async function tabOrder(page, limit = 18) {
  await page.locator('body').click({ position: { x: 2, y: 2 }, force: true });
  const order = [];
  for (let index = 0; index < limit; index += 1) {
    await page.keyboard.press('Tab');
    order.push(await page.evaluate(() => {
      const element = document.activeElement;
      if (!element) return null;
      return {
        tag: element.tagName.toLowerCase(),
        text: (element.getAttribute('aria-label') || element.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 100),
        href: element.getAttribute('href'),
        id: element.id || null,
        class: typeof element.className === 'string' ? element.className : null,
      };
    }));
  }
  return order;
}

async function contrastHeuristic(page, maxItems = 30) {
  return page.evaluate((limit) => {
    function parseColor(value) {
      const match = value.match(/rgba?\(([^)]+)\)/);
      if (!match) return null;
      const parts = match[1].split(/[, /]+/).filter(Boolean).map(Number);
      return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
    }
    function composite(foreground, background) {
      const alpha = foreground.a + background.a * (1 - foreground.a);
      if (!alpha) return { r: 0, g: 0, b: 0, a: 0 };
      return {
        r: (foreground.r * foreground.a + background.r * background.a * (1 - foreground.a)) / alpha,
        g: (foreground.g * foreground.a + background.g * background.a * (1 - foreground.a)) / alpha,
        b: (foreground.b * foreground.a + background.b * background.a * (1 - foreground.a)) / alpha,
        a: alpha,
      };
    }
    function luminance(color) {
      const linear = [color.r, color.g, color.b].map((channel) => {
        const value = channel / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      });
      return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
    }
    function ratio(a, b) {
      const lighter = Math.max(luminance(a), luminance(b));
      const darker = Math.min(luminance(a), luminance(b));
      return (lighter + 0.05) / (darker + 0.05);
    }
    function backgroundFor(element) {
      const layers = [];
      let current = element;
      while (current) {
        const color = parseColor(getComputedStyle(current).backgroundColor);
        if (color && color.a > 0) layers.unshift(color);
        current = current.parentElement;
      }
      let result = { r: 0, g: 0, b: 0, a: 1 };
      for (const layer of layers) result = composite(layer, result);
      return result;
    }

    const seen = new Set();
    const samples = [];
    for (const element of document.querySelectorAll('body *')) {
      const directText = [...element.childNodes]
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent || '')
        .join(' ')
        .trim().replace(/\s+/g, ' ');
      if (!directText) continue;
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden' || rect.width <= 0 || rect.height <= 0) continue;
      if (rect.bottom < 0 || rect.top > innerHeight || rect.right < 0 || rect.left > innerWidth) continue;
      const foreground = parseColor(style.color);
      if (!foreground) continue;
      const background = backgroundFor(element);
      const compositedForeground = composite(foreground, background);
      const contrast = ratio(compositedForeground, background);
      const fontSize = Number.parseFloat(style.fontSize);
      const fontWeight = Number.parseInt(style.fontWeight, 10) || 400;
      const large = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700);
      const threshold = large ? 3 : 4.5;
      const key = `${directText.slice(0, 80)}|${style.color}|${style.backgroundColor}|${fontSize}`;
      if (seen.has(key)) continue;
      seen.add(key);
      samples.push({
        text: directText.slice(0, 120),
        selector: element.id ? `#${element.id}` : `${element.tagName.toLowerCase()}.${[...element.classList].join('.')}`,
        foreground: style.color,
        estimatedBackground: `rgb(${Math.round(background.r)}, ${Math.round(background.g)}, ${Math.round(background.b)})`,
        fontSize,
        fontWeight,
        ratio: Number(contrast.toFixed(2)),
        threshold,
        passes: contrast >= threshold,
      });
    }
    return samples.sort((a, b) => a.ratio - b.ratio).slice(0, limit);
  }, maxItems);
}

async function operateVisibleButtons(root, excludedSelectors = []) {
  const buttons = root.locator('button');
  const interactions = [];
  for (let index = 0; index < await buttons.count(); index += 1) {
    const button = buttons.nth(index);
    if (!(await button.isVisible())) continue;
    const excluded = await button.evaluate((element, selectors) => selectors.some((selector) => element.matches(selector)), excludedSelectors);
    if (excluded) continue;
    const descriptor = await button.evaluate((element) => ({
      text: (element.getAttribute('aria-label') || element.getAttribute('title') || element.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 100),
      class: element.className,
      disabled: element.disabled,
    }));
    if (!descriptor.disabled) {
      try {
        await button.click({ force: true, timeout: 1500 });
        await button.page().waitForTimeout(80);
        interactions.push({ ...descriptor, outcome: 'clicked' });
      } catch (error) {
        interactions.push({ ...descriptor, outcome: `error: ${error.message}` });
      }
    }
  }
  return interactions;
}

async function auditDesktopProjects(page) {
  const results = [];
  for (const project of desktopProjects) {
    const node = page.locator(`.dashboard-node[data-project="${project}"]`);
    const result = { project, present: await node.count() === 1, showcase: showcaseProjects.has(project) };
    if (!result.present) {
      results.push(result);
      continue;
    }
    await node.click({ force: true });
    await settle(page, 380);
    result.state2 = await node.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      const dashboard = element.closest('.dashboard').getBoundingClientRect();
      return {
        expanded: element.classList.contains('expanded'),
        rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
        clipped: rect.left < dashboard.left || rect.top < dashboard.top || rect.right > dashboard.right || rect.bottom > dashboard.bottom,
        detailVisible: getComputedStyle(element.querySelector('.node-detail')).display !== 'none',
      };
    });
    if (result.showcase) {
      await node.click({ force: true });
      await settle(page, 450);
      const overlay = page.locator('#dashboard-focus-overlay');
      result.state3 = {
        visible: await overlay.evaluate((element) => element.classList.contains('visible')),
        showcaseInOverlay: await page.locator('#dashboard-focus-content > :not(.focus-close)').count() > 0,
        controlInteractions: await operateVisibleButtons(
          page.locator('#dashboard-focus-content'),
          ['#focus-close'],
        ),
      };
      if (project === 'maia') {
        await page.screenshot({ path: resolve(screenshotDir, 'desktop-project-maia-focus.png') });
      }
    }
    await page.keyboard.press('Escape');
    await settle(page, 480);
    result.closedByEscape = showcaseProjects.has(project)
      ? !(await page.locator('#dashboard-focus-overlay').evaluate((element) => element.classList.contains('visible')))
      : !(await node.evaluate((element) => element.classList.contains('expanded')));
    results.push(result);
  }
  return results;
}

async function auditMobileProjects(page) {
  const results = [];
  for (const project of mobileProjects) {
    const card = page.locator(`.mn-card[data-project="${project}"]`);
    const result = { project, present: await card.count() === 1, showcase: showcaseProjects.has(project) };
    if (!result.present) {
      results.push(result);
      continue;
    }
    await card.scrollIntoViewIfNeeded();
    await card.click({ force: true });
    await settle(page, 520);
    result.state2 = await card.evaluate((element) => ({
      expanded: element.classList.contains('expanded'),
      height: element.getBoundingClientRect().height,
      horizontalOverflow: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) - document.documentElement.clientWidth,
      detailVisible: getComputedStyle(element.querySelector('.mn-card-detail')).display !== 'none',
    }));
    if (result.showcase) {
      await card.click({ force: true });
      await settle(page, 620);
      result.state3 = {
        focused: await card.evaluate((element) => element.classList.contains('focused')),
        showcaseInCard: await card.locator('.mn-card-showcase > *').count() > 0,
        controlInteractions: await operateVisibleButtons(card.locator('.mn-card-showcase')),
      };
      if (project === 'corne') {
        await page.screenshot({ path: resolve(screenshotDir, 'mobile-project-corne-focus.png') });
      }
    }
    await page.keyboard.press('Escape');
    await settle(page, 620);
    result.closedByEscape = !(await card.evaluate((element) => element.classList.contains('focused') || element.classList.contains('expanded')));
    results.push(result);
  }
  return results;
}

const desktopContext = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  colorScheme: 'dark',
});
const desktopPage = await desktopContext.newPage();
installDiagnostics(desktopPage, report.desktop);

report.desktop.homeNavigation = await openPage(desktopPage, '/');
await desktopPage.screenshot({ path: resolve(screenshotDir, 'desktop-home-dark.png') });
report.desktop.homeMetrics = await viewportMetrics(desktopPage);
report.desktop.homeContrast = await contrastHeuristic(desktopPage);

const themeToggle = desktopPage.locator('#theme-toggle');
await themeToggle.click();
await settle(desktopPage, 250);
report.desktop.theme = await desktopPage.evaluate(() => ({
  dataTheme: document.documentElement.dataset.theme || 'dark',
  storedTheme: localStorage.getItem('c2k-theme'),
  metaThemeColor: document.querySelector('meta[name="theme-color"]')?.getAttribute('content'),
}));
await desktopPage.screenshot({ path: resolve(screenshotDir, 'desktop-home-warm.png') });
await openPage(desktopPage, '/projects');
report.desktop.theme.persistedAcrossNavigation = await desktopPage.evaluate(() => ({
  dataTheme: document.documentElement.dataset.theme || 'dark',
  storedTheme: localStorage.getItem('c2k-theme'),
}));
await desktopPage.screenshot({ path: resolve(screenshotDir, 'desktop-projects-overview-warm.png') });

await desktopPage.evaluate(() => localStorage.setItem('c2k-theme', 'dark'));
await openPage(desktopPage, '/');
report.desktop.homeTabOrder = await tabOrder(desktopPage);
report.desktop.projectsNavigation = await openPage(desktopPage, '/projects');
await desktopPage.screenshot({ path: resolve(screenshotDir, 'desktop-projects-overview-dark.png') });
report.desktop.projectsMetrics = await viewportMetrics(desktopPage);
report.desktop.projectsContrast = await contrastHeuristic(desktopPage);
report.desktop.projectInteractions = await auditDesktopProjects(desktopPage);

report.desktop.navigationInteraction = await (async () => {
  await openPage(desktopPage, '/');
  await desktopPage.locator('.top-nav .nav-link[href="/projects"]').focus();
  await desktopPage.keyboard.press('Enter');
  await settle(desktopPage, 650);
  return {
    url: desktopPage.url(),
    scrollLeft: await desktopPage.locator('#swipe-container').evaluate((element) => element.scrollLeft),
    projectsCurrent: await desktopPage.locator('.top-nav .nav-link[href="/projects"]').evaluate((element) => element.classList.contains('active')),
  };
})();

await desktopContext.close();

const mobileContext = await browser.newContext({
  viewport: { width: 375, height: 812 },
  colorScheme: 'dark',
  isMobile: true,
  hasTouch: true,
});
const mobilePage = await mobileContext.newPage();
installDiagnostics(mobilePage, report.mobile);

report.mobile.homeNavigation = await openPage(mobilePage, '/');
await mobilePage.screenshot({ path: resolve(screenshotDir, 'mobile-home-dark.png') });
report.mobile.homeMetrics = await viewportMetrics(mobilePage);
report.mobile.homeContrast = await contrastHeuristic(mobilePage);
report.mobile.homeTabOrder = await tabOrder(mobilePage);
await openPage(mobilePage, '/');
await mobilePage.locator('#theme-toggle').click();
report.mobile.theme = await mobilePage.evaluate(() => ({
  dataTheme: document.documentElement.dataset.theme || 'dark',
  storedTheme: localStorage.getItem('c2k-theme'),
  metaThemeColor: document.querySelector('meta[name="theme-color"]')?.getAttribute('content'),
}));
await mobilePage.evaluate(() => localStorage.setItem('c2k-theme', 'dark'));

report.mobile.navigationInteraction = await (async () => {
  await openPage(mobilePage, '/');
  const projectsTab = mobilePage.locator('.bottom-tab[data-page="/projects"]');
  await projectsTab.focus();
  await mobilePage.keyboard.press('Enter');
  await settle(mobilePage, 700);
  return {
    url: mobilePage.url(),
    scrollLeft: await mobilePage.locator('#swipe-container').evaluate((element) => element.scrollLeft),
    projectsActive: await projectsTab.getAttribute('data-active'),
  };
})();

report.mobile.projectsNavigation = await openPage(mobilePage, '/projects');
await mobilePage.screenshot({ path: resolve(screenshotDir, 'mobile-projects-overview-dark.png') });
report.mobile.projectsMetrics = await viewportMetrics(mobilePage);
report.mobile.projectsContrast = await contrastHeuristic(mobilePage);
report.mobile.projectInteractions = await auditMobileProjects(mobilePage);

await mobileContext.close();

for (const device of [
  { name: 'desktop', viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false },
  { name: 'mobile', viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true },
]) {
  const context = await browser.newContext({
    viewport: device.viewport,
    isMobile: device.isMobile,
    hasTouch: device.hasTouch,
    reducedMotion: 'reduce',
    colorScheme: 'dark',
  });
  const page = await context.newPage();
  const diagnostics = {};
  installDiagnostics(page, diagnostics);
  await openPage(page, '/projects');
  report.reducedMotion[device.name] = {
    mediaMatches: await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches),
    metrics: await viewportMetrics(page),
    runningAnimations: await page.evaluate(() => document.getAnimations()
      .filter((animation) => animation.playState === 'running')
      .slice(0, 40)
      .map((animation) => ({
        target: animation.effect?.target?.className || animation.effect?.target?.id || animation.effect?.target?.tagName || null,
        currentTime: animation.currentTime,
        duration: animation.effect?.getTiming().duration,
        iterations: animation.effect?.getTiming().iterations,
      }))),
    diagnostics,
  };
  await context.close();
}

await browser.close();
await writeFile(resolve(outputRoot, 'evidence.json'), `${JSON.stringify(report, null, 2)}\n`);

console.log(JSON.stringify({
  evidence: resolve(outputRoot, 'evidence.json'),
  screenshots: screenshotDir,
  desktopProjects: report.desktop.projectInteractions.length,
  mobileProjects: report.mobile.projectInteractions.length,
  desktopShowcases: report.desktop.projectInteractions.filter((item) => item.state3?.visible).length,
  mobileShowcases: report.mobile.projectInteractions.filter((item) => item.state3?.focused).length,
}, null, 2));
