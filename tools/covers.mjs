// Render the four episode covers (1920×1080 PNG thumbnails) → out/covers/ep<N>_<lang>.png
// usage: node tools/covers.mjs        env: LANG_RSI=zh|en
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const lang = process.env.LANG_RSI || 'zh';
const dir = path.join(root, 'out/covers'); fs.mkdirSync(dir, { recursive: true });
const browser = await chromium.launch({ executablePath: (process.env.CHROME_PATH || (fs.existsSync('/usr/local/bin/chromium') ? '/usr/local/bin/chromium' : undefined)) });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on('pageerror', (e) => { console.log('[pageerror]', e.message); });
await page.goto(pathToFileURL(path.join(root, 'index.html')).href + `?mode=cover&lang=${lang}`);
await page.waitForFunction(() => window.RSI && RSI.ready, null, { timeout: 60000 });
for (let n = 1; n <= 4; n++) {
  const url = await page.evaluate((n) => RSI.coverPNG(n), n);
  const f = path.join(dir, `ep${n}_${lang}.png`);
  fs.writeFileSync(f, Buffer.from(url.slice(url.indexOf(',') + 1), 'base64'));
  console.log('wrote', path.relative(root, f));
}
await page.close(); await browser.close(); process.exit(0);
