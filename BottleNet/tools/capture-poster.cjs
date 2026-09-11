/* Render mockups/poster.html to a PNG using an installed Chrome or Edge.
   Usage: node tools/capture-poster.cjs [output.png] */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');

const root = path.join(__dirname, '..');
const out = path.resolve(process.argv[2] || path.join(root, 'mockups', 'bottlenet-devices.png'));
const port = 8099;
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png' };
const browsers = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
];
const browser = browsers.find(p => fs.existsSync(p));
if (!browser) {
  console.error('No Chrome or Edge found. Install one, or add its path to browsers[].');
  process.exit(1);
}

const server = http.createServer((req, res) => {
  const file = path.join(root, decodeURIComponent(req.url.split('?')[0]));
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    res.end(buf);
  });
});

server.listen(port, () => {
  try {
    execFileSync(browser, [
      '--headless=new', '--disable-gpu', '--hide-scrollbars',
      '--force-device-scale-factor=2', '--window-size=1600,1000',
      '--virtual-time-budget=6000', `--screenshot=${out}`,
      `http://localhost:${port}/mockups/poster.html`,
    ], { stdio: 'inherit' });
    console.log(`Wrote ${out} (3200 x 2000 px)`);
  } finally {
    server.close();
  }
});
