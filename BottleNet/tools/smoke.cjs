const { chromium } = require(process.env.PLAYWRIGHT_MODULE);
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const artifacts = path.join(root, 'artifacts');
fs.mkdirSync(artifacts, { recursive: true });
const server = http.createServer((req, res) => {
    const file = path.join(root, decodeURIComponent(req.url.split('?')[0] === '/' ? '/index.html' : req.url.split('?')[0]));
    if (!file.startsWith(root + path.sep)) {
        res.writeHead(403).end();
        return;
    }
    fs.readFile(file, (error, data) => { if (error) {
        res.writeHead(404).end();
        return;
    } res.setHeader('Content-Type', file.endsWith('.svg') ? 'image/svg+xml' : file.endsWith('.css') ? 'text/css' : file.endsWith('.js') ? 'application/javascript' : 'text/html'); res.end(data); });
});
(async () => {
    await new Promise(r => server.listen(0, '127.0.0.1', r));
    let browser;
    try {
        browser = await chromium.launch({ channel: 'chrome', headless: true });
        const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } }), errors = [];
        page.on('pageerror', e => errors.push(e.message));
        const url = `http://127.0.0.1:${server.address().port}`;
        await page.route('**/*', route => route.request().url().startsWith(url) ? route.continue() : route.abort());
        await page.goto(url);
        assert(await page.locator('.brand-mark img').evaluate(img => img.complete && img.naturalWidth > 0));
        await page.locator('#deposit-button').click();
        assert.equal(await page.locator('#accept-bottle, #reject-bottle').count(), 0);
        await page.locator('summary').click();
        await page.locator('#preview-state').selectOption('accepted');
        await page.waitForTimeout(1100);
        assert.equal(await page.locator('#session-bottles').textContent(), '3');
        await page.locator('#preview-state').selectOption('rejected');
        await page.waitForTimeout(1100);
        assert.match(await page.locator('#deposit-feedback').textContent(), /rejected/);
        await page.locator('#finish-deposit').click();
        await page.locator('summary').click();
        await page.screenshot({ path: path.join(artifacts, 'portal-desktop.png'), fullPage: true });
        await page.setViewportSize({ width: 390, height: 844 });
        await page.screenshot({ path: path.join(artifacts, 'portal-mobile.png'), fullPage: true });
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        await page.goto(`${url}/admin/index.html`);
        await page.locator('.pin-fields input').first().fill('9');
        await page.locator('#pin-form button').click();
        assert.match(await page.locator('#pin-error').textContent(), /Incorrect/);
        for (let i = 0; i < 4; i++)
            await page.locator('.pin-fields input').nth(i).fill(String(i + 1));
        await page.locator('#pin-form button').click();
        await page.locator('#dashboard-view').waitFor({ state: 'visible' });
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
        await page.screenshot({ path: path.join(artifacts, 'admin-mobile.png'), fullPage: true });
        await page.setViewportSize({ width: 1440, height: 1000 });
        await page.screenshot({ path: path.join(artifacts, 'admin-desktop.png'), fullPage: true });
        await page.locator('[data-tab="transactions"]').click();
        await page.locator('#transaction-filter').selectOption('rejected');
        assert.equal(await page.locator('#transaction-rows tr').count(), 2);
        await page.locator('[data-tab="settings"]').click();
        await page.locator('#minutes-large').fill('15');
        await page.locator('#settings-form button').click();
        await page.goto(url);
        await page.locator('[data-sheet="rates"]').click();
        assert.equal(await page.locator('#rate-large').textContent(), '15 minutes');
        await page.locator('#sheet-rates .sheet-close').click();
        await page.locator('summary').click();
        await page.locator('#preview-state').selectOption('full');
        assert(await page.locator('#deposit-button').isDisabled());
        assert.deepEqual(errors, []);
        console.log('PASS: deposit acceptance/rejection, PIN login, transaction filtering, settings sync, bin-full state, desktop/mobile overflow.');
    }
    finally {
        if (browser)
            await browser.close();
        server.close();
    }
})().catch(e => { console.error(e); process.exitCode = 1; });
