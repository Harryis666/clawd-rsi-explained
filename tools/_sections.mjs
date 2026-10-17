// Print music sections (style, t0, t1) and scene list for one episode — QA helper for tools/_spectrum.py
// usage: EP=1 node tools/_sections.mjs [out.json]
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EP = +(process.env.EP || 1), lang = process.env.LANG_RSI || 'zh';
const browser = await chromium.launch({ executablePath: fs.existsSync('/usr/local/bin/chromium') ? '/usr/local/bin/chromium' : undefined });
const page = await browser.newPage();
await page.goto(pathToFileURL(path.join(root, 'index.html')).href + `?mode=render&lang=${lang}&ep=${EP}`);
await page.waitForFunction(() => window.RSI && RSI.ready && RSI.Audio);
const info = await page.evaluate(() => { RSI.Audio.build(); return { total: RSI.total, sections: RSI.Audio.sections, scenes: RSI.scenes.map((s) => ({ id: s.id, music: s.music || 'ambient', t0: +s.start.toFixed(2), t1: +(s.start + s.dur).toFixed(2) })) }; });
await browser.close();
const out = process.argv[2];
if (out) fs.writeFileSync(out, JSON.stringify(info, null, 1));
console.log(`EP${EP} total ${info.total.toFixed(1)}s`);
for (const s of info.sections) console.log(`${s.k.padEnd(9)} ${s.t0.toFixed(1).padStart(6)} – ${s.t1.toFixed(1).padStart(6)}`);
process.exit(0);
