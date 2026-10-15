// dev helper: print absolute peak times of every pop word (for stills QA). EP=N [LANG_RSI=zh] node tools/_poptimes.mjs
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const browser = await chromium.launch({ executablePath: fs.existsSync('/usr/local/bin/chromium') ? '/usr/local/bin/chromium' : undefined });
const page = await browser.newPage();
await page.goto(pathToFileURL(path.join(root, 'index.html')).href + `?mode=render&lang=${process.env.LANG_RSI || 'zh'}&ep=${process.env.EP || 1}`);
await page.waitForFunction(() => window.RSI && RSI.ready);
const ts = await page.evaluate(() => RSI.scenes.flatMap((sc) => (sc._pops || []).map((p) => +(sc.start + p.t + 0.4).toFixed(2))));
console.log(ts.join(' '));
await browser.close(); process.exit(0);
