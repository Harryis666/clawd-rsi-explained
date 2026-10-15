// Render still frames for visual QA.
// usage: node tools/stills.mjs [info] sceneId@sec ... | <absSeconds> ...   (env: LANG_RSI=zh|en, OUT=dir, SHEET=name)
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exe = (process.env.CHROME_PATH || (fs.existsSync('/usr/local/bin/chromium') ? '/usr/local/bin/chromium' : undefined));
const lang = process.env.LANG_RSI || 'zh';
const out = process.env.OUT || path.join(root, 'out/stills');
fs.mkdirSync(out, { recursive: true });
const args = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: exe, args: ['--disable-gpu-vsync'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('[page]', m.text()); });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto(pathToFileURL(path.join(root, 'index.html')).href + `?mode=render&lang=${lang}`);
await page.waitForFunction(() => window.RSI && RSI.ready, null, { timeout: 30000 });
const info = await page.evaluate(() => ({ total: RSI.total, scenes: RSI.scenes.map((s) => ({ id: s.id, start: +s.start.toFixed(2), dur: +s.dur.toFixed(2) })) }));
if (args.includes('info')) console.log(JSON.stringify(info));
const files = [];
for (const a of args) {
  if (a === 'info') continue;
  let t; const [id, tt] = a.split('@');
  if (tt === undefined) t = parseFloat(id);
  else {
    const sc = info.scenes.find((s) => s.id === id); if (!sc) { console.log('no scene', id); continue; }
    if (tt === 'end') t = sc.start + sc.dur - 0.05;
    else if (/^[\d.]+$/.test(tt)) t = sc.start + parseFloat(tt);
    else t = await page.evaluate(([id, spec]) => { const s = RSI.scenes.find((x) => x.id === id); return s.start + s.R(spec); }, [id, tt]);
  }
  const t0 = Date.now();
  const data = await page.evaluate((t) => RSI.framePNG(t, Math.round(t * 30)), t);
  const f = path.join(out, `${lang}_${a.replace(/[^\w@.-]/g, '_')}.png`);
  fs.writeFileSync(f, Buffer.from(data.split(',')[1], 'base64'));
  files.push(f); console.log('wrote', path.basename(f), `t=${t.toFixed(2)}`, `${Date.now() - t0}ms`);
}
await browser.close();
if (process.env.SHEET && files.length) {
  const sheet = path.join(out, `sheet_${process.env.SHEET}.jpg`);
  execFileSync('magick', ['montage', ...files, '-tile', '2x', '-geometry', '960x540+4+4', '-background', '#000', '-quality', '85', sheet]);
  console.log('sheet', sheet);
}
