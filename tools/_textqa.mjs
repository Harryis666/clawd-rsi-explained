// Text-layout QA (v3.2 type scale): renders frames headlessly, records every fillText/strokeText box plus panel,
// caption and bubble boxes, then reports text that leaves the frame, overlaps other text, overflows its panel,
// or is covered by a later caption / bubble / panel.
// usage: EP=1 node tools/_textqa.mjs [step=0.5] [from] [to]   env: LANG_RSI=zh|en, OUT=out/textqa_ep1.json, SMALL=38 (also list text under 38 px)
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const EP = +(process.env.EP || 1), lang = process.env.LANG_RSI || 'zh';
const step = +(process.argv[2] || 0.5);
const browser = await chromium.launch({ executablePath: fs.existsSync('/usr/local/bin/chromium') ? '/usr/local/bin/chromium' : undefined });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto(pathToFileURL(path.join(root, 'index.html')).href + `?mode=render&lang=${lang}&ep=${EP}`);
await page.waitForFunction(() => window.RSI && RSI.ready);
const total = await page.evaluate(() => RSI.total);
const from = +(process.argv[3] || 0), to = Math.min(total, +(process.argv[4] || total));
await page.evaluate((SMALL) => {
  const Q = (RSI.QA = { on: false, rec: [], tag: [], small: SMALL });
  const P = CanvasRenderingContext2D.prototype;
  const box = (ctx, x0, y0, x1, y1) => {
    const m = ctx.getTransform(); const pts = [[x0, y0], [x1, y0], [x0, y1], [x1, y1]].map(([x, y]) => [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]);
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  };
  const tagNow = () => Q.tag[Q.tag.length - 1] || '';
  for (const name of ['fillText', 'strokeText']) {
    const orig = P[name];
    P[name] = function (s, x, y, mw) {
      if (Q.on && String(s).trim()) {
        const m = this.measureText(s);
        const b = box(this, x - m.actualBoundingBoxLeft, y - m.actualBoundingBoxAscent, x + m.actualBoundingBoxRight, y + m.actualBoundingBoxDescent);
        const px = parseFloat((/(\d+(?:\.\d+)?)px/.exec(this.font) || [0, 0])[1]) * Math.hypot(this.getTransform().a, this.getTransform().b);
        Q.rec.push({ k: 't', s: String(s), b, a: this.globalAlpha, tag: tagNow(), px: Math.round(px) });
      }
      return orig.call(this, s, x, y, mw);
    };
  }
  const D = RSI.D, T = RSI.T, pan = D.panel;
  D.panel = function (ctx, x, y, w, h, o = {}) { if (Q.on) Q.rec.push({ k: 'p', b: box(ctx, x, y, x + w, y + h), a: ctx.globalAlpha * (o.alpha == null ? 1 : o.alpha), tag: tagNow() }); return pan.apply(this, arguments); };
  const wrap = (obj, key, tag, rec) => { const f = obj[key]; obj[key] = function () { Q.tag.push(tag); try { const r = f.apply(this, arguments); if (Q.on && rec && r && r.w) Q.rec.push({ k: 'p', b: box(arguments[0], r.x, r.y, r.x + r.w, r.y + r.h), a: arguments[0].globalAlpha, tag, box: tag }); return r; } finally { Q.tag.pop(); } }; };
  wrap(T, 'bubble', 'bub', true); wrap(T, 'caption', 'cap', true); wrap(RSI, 'drawPops', 'pop', false);
  RSI.qaFrame = (t) => {
    Q.rec = []; Q.on = true; try { RSI.draw(t, Math.round(t * 30)); } finally { Q.on = false; }
    const R = Q.rec, out = [], W = RSI.W, H = RSI.H;
    const area = (b) => Math.max(0, b[2] - b[0]) * Math.max(0, b[3] - b[1]);
    const inter = (a, b) => area([Math.max(a[0], b[0]), Math.max(a[1], b[1]), Math.min(a[2], b[2]), Math.min(a[3], b[3])]);
    // group multi-pass text (shadow / stroke / fill of the same string at the same place)
    const txt = []; R.forEach((r, i) => { if (r.k !== 't' || r.a < 0.35) return; const g = txt.find((q) => q.s === r.s && Math.abs(q.b[0] - r.b[0]) < 12 && Math.abs(q.b[1] - r.b[1]) < 12); if (g) { g.last = i; return; } txt.push(Object.assign({ i, last: i }, r)); });
    const sc = RSI.sceneAt(t);
    const SMALL = RSI.QA.small || 0;
    if (SMALL) for (const q of txt) if (q.px < SMALL && q.tag !== 'cap') out.push({ type: 'small', s: q.s, px: q.px, tag: q.tag });
    for (const q of txt) {
      const b = q.b; if (b[0] < 6 || b[1] < 6 || b[2] > W - 6 || b[3] > H - 6) out.push({ type: 'off', s: q.s, px: q.px, tag: q.tag, b: b.map(Math.round) });
    }
    for (let i = 0; i < txt.length; i++) for (let j = i + 1; j < txt.length; j++) {
      const A = txt[i], B = txt[j]; const ov = inter(A.b, B.b); if (ov <= 0) continue;
      const fr = ov / Math.max(1, Math.min(area(A.b), area(B.b))); if (fr < 0.2) continue;
      out.push({ type: 'overlap', s: A.s, s2: B.s, tag: A.tag + '|' + B.tag, fr: +fr.toFixed(2), px: A.px, px2: B.px });
    }
    // panels / caption / bubble boxes: overflow (text drawn after the box, centred inside it, crossing its edge) and cover (box drawn after the text)
    R.forEach((p, pi) => {
      if (p.k !== 'p' || p.a < 0.5) return;
      for (const q of txt) {
        const b = q.b, cx = (b[0] + b[2]) / 2, cy = (b[1] + b[3]) / 2, ov = inter(b, p.b);
        if (ov <= 0) continue;
        if (q.i > pi && cx > p.b[0] && cx < p.b[2] && cy > p.b[1] && cy < p.b[3]) {
          const e = Math.max(p.b[0] - b[0], p.b[1] - b[1], b[2] - p.b[2], b[3] - p.b[3]);
          if (e > 6 && !(p.box && q.tag === p.box && e < 14)) out.push({ type: 'overflow', s: q.s, px: q.px, by: Math.round(e), tag: (p.box || 'panel') + '>' + q.tag });
        } else if (q.last < pi && ov / Math.max(1, area(b)) > 0.3 && q.tag !== p.box) out.push({ type: 'cover', s: q.s, px: q.px, by: p.box || 'panel', fr: +(ov / area(b)).toFixed(2) });
      }
    });
    return { id: sc.id, lt: +(t - sc.start).toFixed(2), out };
  };
}, +(process.env.SMALL || 0));
const agg = new Map();
for (let t = from; t < to; t += step) {
  const r = await page.evaluate((t) => RSI.qaFrame(t), t);
  for (const o of r.out) {
    const key = [r.id, o.type, o.s, o.s2 || '', o.tag || ''].join('¦');
    const g = agg.get(key); if (g) { g.t1 = +t.toFixed(2); g.n++; g.worst = Math.max(g.worst, o.fr || o.by || 0); }
    else agg.set(key, { id: r.id, type: o.type, s: o.s, s2: o.s2, tag: o.tag, px: o.px, px2: o.px2, t0: +t.toFixed(2), t1: +t.toFixed(2), lt: r.lt, n: 1, worst: o.fr || o.by || 0, b: o.b });
  }
}
await browser.close();
const list = [...agg.values()].sort((a, b) => a.t0 - b.t0);
const outFile = process.env.OUT || path.join(root, `out/textqa_ep${EP}_${lang}.json`);
fs.mkdirSync(path.dirname(outFile), { recursive: true }); fs.writeFileSync(outFile, JSON.stringify(list, null, 1));
const cnt = {}; for (const g of list) cnt[g.type] = (cnt[g.type] || 0) + 1;
console.log(`EP${EP} ${lang}: ${list.length} issue groups`, JSON.stringify(cnt), '→', path.relative(root, outFile));
process.exit(0);
