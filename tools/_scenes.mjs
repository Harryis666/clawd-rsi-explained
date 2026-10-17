// Debug helper: list scene start/duration for one episode.  usage: EP=1 node tools/_scenes.mjs
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EP = +(process.env.EP || 1), lang = process.env.LANG_RSI || 'zh';
const browser = await chromium.launch({ executablePath: fs.existsSync('/usr/local/bin/chromium') ? '/usr/local/bin/chromium' : undefined });
const page = await browser.newPage({ viewport: { width: 640, height: 360 } });
await page.goto(pathToFileURL(path.join(root, 'index.html')).href + `?mode=render&lang=${lang}&ep=${EP}`);
await page.waitForFunction(() => window.RSI && RSI.ready);
const rows = await page.evaluate(() => RSI.scenes.map((s) => [s.id, +s.start.toFixed(2), +s.dur.toFixed(2)]));
console.log(rows.map((r) => r.join('\t')).join('\n'), '\ntotal', await page.evaluate(() => RSI.total.toFixed(2)));
await browser.close(); process.exit(0);
