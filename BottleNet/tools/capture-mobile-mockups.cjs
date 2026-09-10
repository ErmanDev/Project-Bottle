const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'mobile-mockups');
const screens = path.join(output, 'screens');
fs.mkdirSync(screens, { recursive: true });
const types = { '.css': 'text/css', '.js': 'application/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.html': 'text/html' };
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
  fs.readFile(file, (error, data) => {
    if (error) { res.writeHead(404).end(); return; }
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    res.end(data);
  });
});

(async () => {
  let browser;
  try {
    await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
    const origin = `http://127.0.0.1:${server.address().port}`;
    browser = await chromium.launch({ channel: 'chrome', headless: true });
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
    await context.route('**/*', route => route.request().url().startsWith(origin) ? route.continue() : route.abort());
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.clock.install({ time: new Date('2026-09-08T09:41:00+08:00') });
    await page.clock.pauseAt(new Date('2026-09-08T09:41:00+08:00'));
    await page.goto(origin);
    assert(await page.locator('.brand-mark img').evaluate(img => img.complete && img.naturalWidth > 0));
    await page.screenshot({ path: path.join(screens, 'portal.png') });
    await page.screenshot({ path: path.join(screens, 'portal-full.png'), fullPage: true });

    await page.goto(`${origin}/admin/index.html`);
    await page.screenshot({ path: path.join(screens, 'pin.png') });
    for (let i = 0; i < 4; i++) await page.locator('.pin-fields input').nth(i).fill(String(i + 1));
    await page.locator('#pin-form button').click();
    await page.locator('#dashboard-view').waitFor({ state: 'visible' });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await page.screenshot({ path: path.join(screens, 'dashboard.png') });
    await page.screenshot({ path: path.join(screens, 'dashboard-full.png'), fullPage: true });

    await page.setViewportSize({ width: 1240, height: 1180 });
    await page.goto(`${origin}/mobile-mockups/index.html`);
    assert(await page.locator('img').evaluateAll(images => images.every(img => img.complete && img.naturalWidth > 0)));
    await page.screenshot({ path: path.join(output, 'overview.png'), fullPage: true });
    for (const name of ['portal', 'pin', 'dashboard']) {
      await page.locator(`#${name}`).screenshot({ path: path.join(output, `${name}-mockup.png`) });
    }
    await page.setViewportSize({ width: 390, height: 844 });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    assert.deepEqual(errors, []);
    console.log('Created 4 framed mockups and 5 source screenshots in mobile-mockups. Images loaded and responsive layout passed.');
  } finally {
    if (browser) await browser.close();
    server.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
