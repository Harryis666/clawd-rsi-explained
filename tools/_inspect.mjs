// Debug helper: dump speakers, cue counts and music sections.  usage: node tools/_inspect.mjs
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
const browser = await chromium.launch({ executablePath: (process.env.CHROME_PATH || (fs.existsSync('/usr/local/bin/chromium') ? '/usr/local/bin/chromium' : undefined)) });
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
await page.goto(pathToFileURL(path.join(root, 'index.html')).href + `?mode=render`);
await page.waitForFunction(() => window.RSI && RSI.ready);
const r = await page.evaluate(() => {
  const who = {}; const cues = {}; const music = [];
  for (const sc of RSI.scenes) {
    for (const ln of sc.lines) { const k = ln.who; who[k] = who[k] || { n: 0, chars: 0 }; who[k].n++; who[k].chars += RSI.T.count(ln.zh || ''); }
    const m = music[music.length - 1]; if (!m || m.k !== sc.music) music.push({ k: sc.music, t: +sc.start.toFixed(1) });
  }
  for (const c of RSI.cues) { cues[c.type] = (cues[c.type] || 0) + 1; }
  const params = [...new Set(RSI.cues.filter((c) => Object.keys(c).length > 2).map((c) => c.type + ':' + Object.keys(c).filter((k) => k !== 't' && k !== 'type').join(',')))];
  return { who, cues, params, music, total: RSI.total, gens: RSI.genEvents.length };
});
console.log(JSON.stringify(r));
await browser.close(); process.exit(0);
