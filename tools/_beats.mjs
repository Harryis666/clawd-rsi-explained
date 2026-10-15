// dev helper: short-drama beat density. A "beat" = scene cut, line start, subtitle page flip, camera kick/push, pop-word (花字) or sound cue.
// "content beats" = cuts, line starts, page flips and pop-words only (what the viewer reads).
// Reports gaps longer than GAP seconds (default 3) and lines that stay on screen longer than LONG seconds (default 4.5).
// env: EP=1,2,3,4  GAP=3  LONG=4.5  LANG_RSI=zh   (args: "list" to print every gap)
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exe = fs.existsSync('/usr/local/bin/chromium') ? '/usr/local/bin/chromium' : undefined;
const EPS = (process.env.EP || '1,2,3,4').split(',').map(Number);
const GAP = +(process.env.GAP || 3), LONG = +(process.env.LONG || 4.5);
const lang = process.env.LANG_RSI || 'zh';
const browser = await chromium.launch({ executablePath: exe });
const summary = [];
for (const ep of EPS) {
  const page = await browser.newPage();
  await page.goto(pathToFileURL(path.join(root, 'index.html')).href + `?mode=render&lang=${lang}&ep=${ep}`);
  await page.waitForFunction(() => window.RSI && RSI.ready, null, { timeout: 30000 });
  const d = await page.evaluate(() => {
    const ev = [], longs = [];
    // ambient / sustained cues are not beats
    const SOFT = RSI.SOFT_CUES || new Set(['heart', 'snore', 'roll', 'riser', 'shepard', 'drone', 'hum', 'wind', 'night']);
    for (const sc of RSI.scenes) {
      ev.push({ t: sc.start, k: 'CUT ' + sc.id, sc: sc.id, c: 1 });
      for (const ln of sc.lines || []) {
        ev.push({ t: sc.start + ln.t, k: `${ln.who}:${ln.id}`, sc: sc.id, c: 1 });
        if (ln.dur > 0) longs.push({ sc: sc.id, id: ln.id, who: ln.who, dur: ln.dur, t: sc.start + ln.t });
      }
      for (const tk of sc._kicks || []) ev.push({ t: sc.start + tk, k: 'kick', sc: sc.id });
      for (const p of sc._pops || []) ev.push({ t: sc.start + p.t, k: 'POP ' + (p.zh || ''), sc: sc.id, c: 1 });
      for (const f of sc._flips || []) ev.push({ t: sc.start + f, k: 'flip', sc: sc.id, c: 1 });
      for (const p of sc._push || []) ev.push({ t: sc.start + p.t, k: 'push' + (p.z > 1 ? '+' : '-'), sc: sc.id });
    }
    for (const c of RSI.cues) if (!SOFT.has(c.type)) ev.push({ t: c.t, k: 'sfx:' + c.type, sc: RSI.sceneAt(Math.min(c.t, RSI.total - 1e-3)).id });
    ev.push({ t: RSI.total, k: 'END', sc: '', c: 1 });
    ev.sort((a, b) => a.t - b.t);
    return { total: RSI.total, ev, longs, scenes: RSI.scenes.map((s) => ({ id: s.id, start: s.start, dur: s.dur })) };
  });
  await page.close();
  // merge beats closer than 0.3 s
  const beats = [];
  for (const e of d.ev) { const b = beats[beats.length - 1]; if (b && e.t - b.t < 0.3) b.k += ' + ' + e.k; else beats.push({ ...e }); }
  const gaps = [];
  for (let i = 1; i < beats.length; i++) gaps.push({ a: beats[i - 1], b: beats[i], g: beats[i].t - beats[i - 1].t });
  const big = gaps.filter((x) => x.g > GAP);
  const fmt = (t) => `${Math.floor(t / 60)}:${(t % 60).toFixed(1).padStart(4, '0')}`;
  const mean = d.total / Math.max(1, beats.length - 1);
  const longL = d.longs.filter((l) => l.dur > LONG);
  const cb = d.ev.filter((e) => e.c).map((e) => e.t); const cg = []; for (let i = 1; i < cb.length; i++) cg.push({ t: cb[i - 1], g: cb[i] - cb[i - 1], k: d.ev.filter((e) => e.c)[i - 1].k, sc: d.ev.filter((e) => e.c)[i - 1].sc });
  const cBig = cg.filter((x) => x.g > 5);
  console.log(`\n=== EP${ep} ${fmt(d.total)}  beats ${beats.length}  mean gap ${mean.toFixed(2)}s  max ${Math.max(...gaps.map((x) => x.g)).toFixed(2)}s  gaps>${GAP}s: ${big.length} (${big.reduce((s, x) => s + x.g, 0).toFixed(1)}s)  lines>${LONG}s: ${longL.length}`);
  for (const x of (process.argv.includes('list') ? gaps : big)) console.log(`  ${fmt(x.a.t)} → ${fmt(x.b.t)}  ${x.g.toFixed(2)}s  [${x.a.sc}] after "${x.a.k.slice(0, 70)}"`);
  if (longL.length) console.log('  long lines: ' + longL.map((l) => `${l.sc}/${l.id}(${l.who}) ${l.dur.toFixed(1)}s`).join(' · '));
  console.log(`  content beats ${cb.length}  mean ${(d.total / Math.max(1, cb.length - 1)).toFixed(2)}s  max ${Math.max(...cg.map((x) => x.g)).toFixed(2)}s  gaps>5s: ${cBig.length}` + (cBig.length ? '  → ' + cBig.map((x) => `${fmt(x.t)} ${x.g.toFixed(1)}s [${x.sc}] ${x.k.slice(0, 30)}`).join(' · ') : ''));
  if (process.env.CTOP) console.log('  top content gaps: ' + [...cg].sort((a, b) => b.g - a.g).slice(0, +process.env.CTOP).map((x) => `${fmt(x.t)} ${x.g.toFixed(2)}s [${x.sc}]`).join(' · '));
  summary.push({ ep, total: d.total, beats: beats.length, mean, max: Math.max(...gaps.map((x) => x.g)), over: big.length, long: longL.length, content: cb.length, cmax: Math.max(...cg.map((x) => x.g)), cover5: cBig.length });
}
console.log('\nSUMMARY ' + JSON.stringify(summary.map((s) => ({ ...s, total: +s.total.toFixed(1), mean: +s.mean.toFixed(2), max: +s.max.toFixed(2) }))));
await browser.close();
process.exit(0);
