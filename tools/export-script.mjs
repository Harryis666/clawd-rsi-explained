// Export one episode's full script (every timed line, zh + en) from the live timeline.
// Usage: EP=1 node tools/export-script.mjs [out.json]   (default out/script_ep<N>.json)
// Writes JSON (for docs generation) — see tools/make-storyboard.mjs.
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EP = +(process.env.EP || 1);
const out = path.resolve(process.argv[2] || path.join(root, `out/script_ep${EP}.json`));
fs.mkdirSync(path.dirname(out), { recursive: true });

const browser = await chromium.launch({ executablePath: (process.env.CHROME_PATH || (fs.existsSync('/usr/local/bin/chromium') ? '/usr/local/bin/chromium' : undefined)) });
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto(pathToFileURL(path.join(root, 'index.html')).href + `?mode=render&ep=${EP}`);
await page.waitForFunction(() => window.RSI && RSI.ready);
const data = await page.evaluate((EP) => ({
  ep: EP, epInfo: RSI.EPS[EP - 1], total: RSI.total,
  chapters: RSI.chapters.map((c) => ({ t: c.t, id: c.id, label: c.label })),
  gens: RSI.genEvents.map((g) => ({ t: g.t, g: g.g })),
  scenes: RSI.scenes.map((sc) => ({
    id: sc.id, start: sc.start, dur: sc.dur, music: sc.music || 'ambient', chapter: sc.chapter || null,
    lines: (sc.lines || []).map((ln) => ({ id: ln.id || null, who: ln.who, t: sc.start + ln.t, dur: ln.dur, zh: ln.zh || '', en: ln.en || '', label: ln.label || null, src: ln.src || null })),
  })),
}), EP);
fs.writeFileSync(out, JSON.stringify(data, null, 1));
console.log('scenes', data.scenes.length, 'lines', data.scenes.reduce((s, x) => s + x.lines.length, 0), 'total', data.total.toFixed(2));
await page.close(); await browser.close(); process.exit(0);
