// dev helper: per-line timing report (base reading time vs min/hold/explicit dur, idle gaps). EP=N node tools/_lines.mjs [sceneIds…]
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EP = +(process.env.EP || 1);
const browser = await chromium.launch({ executablePath: (fs.existsSync('/usr/local/bin/chromium') ? '/usr/local/bin/chromium' : undefined) });
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto(pathToFileURL(path.join(root, 'index.html')).href + `?mode=render&ep=${EP}`);
await page.waitForFunction(() => window.RSI && RSI.ready);
const rows = await page.evaluate(() => {
  const out = [];
  for (const sc of RSI.scenes) {
    let prevEnd = sc.lead == null ? 0.3 : sc.lead;
    const ls = [...(sc.lines || [])].sort((a, b) => a.t - b.t);
    for (const ln of ls) {
      const n = RSI.T.count(ln.zh || '');
      const base = ln.who === 'card' ? 1.8 + n / 10.5 : ln.who === 'narr' ? 0.85 + n / 10 : 0.7 + n / 9;
      out.push({ sc: sc.id, id: ln.id, who: ln.who, t: +ln.t.toFixed(2), dur: +ln.dur.toFixed(2), base: +base.toFixed(2), min: ln.min || null, hold: ln.hold || null, fixed: ln.at != null ? String(ln.at) : null, idle: +(ln.t - prevEnd).toFixed(2), n: +n.toFixed(1) });
      prevEnd = Math.max(prevEnd, ln.t + ln.dur);
    }
    out.push({ sc: sc.id, id: '(end)', who: '', t: +sc.dur.toFixed(2), dur: 0, base: 0, idle: +(sc.dur - prevEnd).toFixed(2) });
  }
  return out;
});
const want = process.argv.slice(2);
for (const r of rows) {
  if (want.length && !want.includes(r.sc)) continue;
  const pad = r.dur - Math.max(r.base, 0) ;
  console.log(`${r.sc.padEnd(11)} ${String(r.id).padEnd(6)} ${String(r.who).padEnd(6)} t${String(r.t).padStart(6)} d${String(r.dur).padStart(5)} base${String(r.base).padStart(5)} ${r.min ? 'min' + r.min : ''}${r.hold ? ' hold' + r.hold : ''}${r.fixed ? ' at:' + r.fixed : ''} idle${r.idle}${r.id !== '(end)' && pad > 0.6 ? '  <PAD ' + pad.toFixed(1) : ''}`);
}
await page.close(); await browser.close(); process.exit(0);
