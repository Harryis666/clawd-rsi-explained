/* RSI·Clawd — timeline: scenes, line timing, captions & bubbles, HUD (generation counter), frame renderer. */
(function () {
  'use strict';
  const RSI = window.RSI, C = RSI.C, M = RSI.M, T = RSI.T, D = RSI.D;
  RSI.scenes = []; RSI.chapters = []; RSI.cues = []; RSI.genEvents = [];
  RSI.defScene = (d) => { RSI.scenes.push(d); return d; };
  const CHAR = { clawd: 1, clawd2: 1, clawd3: 1, monster: 1, human: 1, left: 1, right: 1, user: 1 };
  RSI.isChar = (who) => !!CHAR[who];

  function resolve(spec, byId, sc) {
    if (typeof spec === 'number') return spec;
    if (typeof spec === 'function') return spec(byId);
    const m = /^([\w-]+)(\$?)([+-][\d.]+)?$/.exec(spec);
    if (!m) throw new Error('bad time spec ' + spec + ' in ' + sc.id);
    const ln = byId[m[1]]; if (!ln) throw new Error('unknown line ' + m[1] + ' in ' + sc.id);
    return (m[2] ? ln.t + ln.dur : ln.t) + (m[3] ? parseFloat(m[3]) : 0);
  }
  RSI.lineDur = (ln) => {
    const n = T.count(ln.zh || '');
    const base = ln.who === 'card' ? 2.6 + n / 8 : ln.who === 'narr' ? 1.2 + n / 8.6 : 1.0 + n / 7.6;
    return Math.max(ln.min || 2.0, base) + (ln.hold || 0);
  };
  RSI.build = () => {
    let t0 = 0; RSI.chapters = []; RSI.cues = []; RSI.genEvents = [];
    for (const sc of RSI.scenes) {
      sc.start = t0; const byId = {}; let cur = sc.lead == null ? 0.7 : sc.lead;
      for (const ln of sc.lines || (sc.lines = [])) {
        ln.dur = ln.dur != null ? ln.dur : RSI.lineDur(ln);
        ln.t = ln.at != null ? resolve(ln.at, byId, sc) : cur + (ln.gap != null ? ln.gap : 0.35);
        if (!ln.par) cur = Math.max(cur, ln.t + ln.dur);
        if (ln.id) byId[ln.id] = ln;
        if (ln.who === 'card' || ln.who === 'sys') ln.manual = ln.manual !== false;
      }
      sc.byId = byId;
      sc.dur = sc.dur != null ? sc.dur : Math.max(sc.minDur || 0, cur + (sc.pad == null ? 1.0 : sc.pad));
      sc.R = (spec) => resolve(spec, byId, sc);
      if (sc.chapter) RSI.chapters.push({ t: t0, label: sc.chapter, id: sc.id });
      for (const c of sc.cues || []) RSI.cues.push(Object.assign({ t: t0 + resolve(c[0], byId, sc), type: c[1] }, c[2] || {}));
      for (const g of sc.gen || []) RSI.genEvents.push({ t: t0 + resolve(g[0], byId, sc), g: g[1] });
      t0 += sc.dur;
    }
    RSI.genEvents.sort((a, b) => a.t - b.t);
    RSI.cues.sort((a, b) => a.t - b.t);
    RSI.total = t0;
    return t0;
  };
  /** current generation at absolute time */
  RSI.genAt = (ta) => {
    let g = 1, since = 1e9, prev = 1;
    for (const e of RSI.genEvents) { if (e.t <= ta) { prev = g; g = e.g; since = ta - e.t; } else break; }
    return { g, since, prev };
  };
  RSI.sceneAt = (ta) => {
    const S = RSI.scenes; let lo = 0, hi = S.length - 1;
    while (lo < hi) { const mid = (lo + hi + 1) >> 1; if (S[mid].start <= ta) lo = mid; else hi = mid - 1; }
    return S[lo];
  };
  // typewriter rate for a line (chars/s), always finishing by ~60% of its duration
  RSI.lineRate = (ln) => {
    const n = T.count(RSI.L(ln));
    const base = ln.who === 'narr' ? 26 : ln.who === 'card' ? 34 : ln.who === 'sys' || ln.who === 'user' ? 16 : 15;
    return Math.max(base, n / Math.max(0.5, ln.dur * 0.6 - (ln.who === 'card' ? 0.25 : 0)));
  };

  function helper(sc) {
    const S = {
      sc, t: 0, anchors: {}, sides: {},
      T: (id) => sc.byId[id].t, E: (id) => sc.byId[id].t + sc.byId[id].dur,
      A: (id) => S.t - sc.byId[id].t,
      P: (id, ease) => M.seg(S.t, sc.byId[id].t, sc.byId[id].t + sc.byId[id].dur, ease),
      on: (id) => S.t >= sc.byId[id].t && S.t < sc.byId[id].t + sc.byId[id].dur,
      R: (spec) => sc.R(spec),
      abs: () => sc.start + S.t,
      gen: () => RSI.genAt(sc.start + S.t),
      /** draw the fact card attached to line id */
      card: (ctx, id, x, y, w, o = {}) => {
        const ln = sc.byId[id]; const age = S.t - ln.t; if (age < 0) return 0;
        const end = o.until != null ? sc.R(o.until) : ln.keep ? 1e9 : ln.t + ln.dur;
        if (S.t > end) return 0;
        const a = 1 - M.seg(S.t, end - 0.4, end);
        return D.factCard(ctx, x, y, w, { tag: ln.tag, body: ln, src: ln.src }, age, Object.assign({ alpha: a, cps: RSI.lineRate(ln) }, o));
      },
      /** typed text of a manual line: returns {s, done, age} */
      typed: (id) => {
        const ln = sc.byId[id]; const age = S.t - ln.t; const full = RSI.L(ln); const chars = Array.from(T.plain(full));
        const n = Math.max(0, Math.floor(age * RSI.lineRate(ln)));
        return { s: chars.slice(0, n).join(''), done: n >= chars.length, age, n, full };
      },
    };
    return S;
  }

  function drawLines(ctx, sc, S, t) {
    for (const ln of sc.lines) {
      if (ln.manual || t < ln.t || t > ln.t + ln.dur) continue;
      const age = t - ln.t; const a = M.env(t, ln.t, ln.t + ln.dur, 0.15, 0.25);
      const reveal = age * RSI.lineRate(ln); const text = RSI.L(ln);
      if (ln.who === 'narr') { T.caption(ctx, text, { alpha: a, reveal }); continue; }
      let an = ln.anchor ? (typeof ln.anchor === 'function' ? ln.anchor(S) : ln.anchor) : S.anchors[ln.who];
      if (an) {
        T.bubble(ctx, text, an[0], an[1], { reveal, alpha: a, pop: M.ease.outBack(M.clamp(age / 0.22)), side: ln.side || S.sides[ln.who] || 'up', label: ln.label && RSI.L(ln.label), labelColor: ln.labelColor, maxW: ln.maxW || 760, dx: ln.dx, dy: ln.dy, size: ln.size });
      } else {
        T.caption(ctx, text, { alpha: a, reveal, speaker: ln.label ? RSI.L(ln.label) : 'Clawd', speakerColor: ln.labelColor });
      }
    }
  }
  // ---------- HUD: generation counter ----------
  function hud(ctx, sc, ta, S) {
    if (sc.hud === false) return;
    const { g, since, prev } = RSI.genAt(ta);
    const o = S.hud || {};
    const x = RSI.W - 56, y = 52;
    const flip = M.clamp(since / 0.5);
    const a = (o.alpha == null ? 1 : o.alpha) * M.seg(ta - sc.start, 0, 0.5);
    ctx.save(); ctx.globalAlpha *= a;
    const show = o.text || String(g).padStart(3, '0');
    const showPrev = String(prev).padStart(3, '0');
    ctx.font = T.font(22, 700, 'mono'); ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    const w = 230, h = 78;
    D.panel(ctx, x - w, y - 22, w, h, { fill: 'rgba(28,27,24,0.82)', r: 14, blur: 16 });
    ctx.fillStyle = C.ink3; ctx.textAlign = 'left'; ctx.fillText('GEN', x - w + 20, y + 4);
    ctx.font = T.font(16, 500); ctx.fillText(RSI.lang === 'en' ? 'generation' : '第几代', x - w + 20, y + 32);
    ctx.textAlign = 'right';
    ctx.save(); ctx.beginPath(); ctx.rect(x - w + 80, y - 20, w - 82, h - 4); ctx.clip();
    ctx.font = T.font(44, 700, 'mono');
    const col = o.color || C.orange;
    if (flip < 1 && !o.text) {
      const e = M.ease.outCubic(flip);
      ctx.fillStyle = RSI.rgba(col, 1 - e); ctx.fillText(showPrev, x - 18, y + 17 - e * 44);
      ctx.fillStyle = col; ctx.fillText(show, x - 18, y + 17 + (1 - e) * 44);
    } else { ctx.fillStyle = col; ctx.fillText(show, x - 18, y + 17); }
    ctx.restore();
    if (flip < 1) D.glow(ctx, x - 70, y + 16, 120, col, (1 - flip) * 0.8);
    ctx.restore();
  }
  function chapterLabel(ctx, sc, ta) {
    if (sc.label === false || sc.isCard) return;
    let ch = null; for (const c of RSI.chapters) if (c.t <= ta + 0.01) ch = c;
    if (!ch) return;
    ctx.save(); ctx.globalAlpha = 0.55 * M.seg(ta - sc.start, 0, 0.6);
    T.line(ctx, ch.label, 56, 56, 22, C.ink2, 500, 'left');
    ctx.restore();
  }
  const helpers = new Map();
  RSI.renderFrame = (ctx, ta, frame = 0) => {
    ta = M.clamp(ta, 0, RSI.total - 1e-4);
    const sc = RSI.sceneAt(ta); const t = ta - sc.start;
    let S = helpers.get(sc); if (!S) { S = helper(sc); helpers.set(sc, S); }
    S.t = t; S.anchors = {}; S.sides = {}; S.hud = null; S.frame = frame;
    ctx.save();
    if (sc.bg !== false) D.bg(ctx, sc.bg || {});
    ctx.save(); sc.draw(ctx, t, S); ctx.restore();
    drawLines(ctx, sc, S, t);
    chapterLabel(ctx, sc, ta);
    hud(ctx, sc, ta, S);
    const fi = sc.fade ? sc.fade[0] : 0.4, fo = sc.fade ? sc.fade[1] : 0.4;
    const k = Math.min(fi > 0 ? M.seg(t, 0, fi) : 1, fo > 0 ? 1 - M.seg(t, sc.dur - fo, sc.dur) : 1);
    if (k < 1) { ctx.fillStyle = `rgba(10,10,9,${1 - k})`; ctx.fillRect(0, 0, RSI.W, RSI.H); }
    D.post(ctx, frame);
    ctx.restore();
  };
  /** Chapter title card scene factory */
  RSI.chapterCard = (o) => RSI.defScene({
    id: o.id, chapter: o.label, isCard: true, music: o.music, hud: false, dur: o.dur || 4.2, fade: [0.3, 0.45], lines: [],
    cues: [[0.15, 'chapter']],
    draw(ctx, t) {
      D.dots(ctx, 0.04, 48, 0, -t * 10);
      const a = M.seg(t, 0.1, 0.7, M.ease.outCubic);
      ctx.save(); ctx.globalAlpha = a;
      T.line(ctx, o.num, RSI.W / 2, 400 - (1 - a) * 20, 34, C.orange, 700, 'center');
      T.line(ctx, o.title, RSI.W / 2, 500, 88, C.ink, 900, 'center');
      const lw = 520 * M.seg(t, 0.4, 1.4, M.ease.inOutCubic);
      ctx.fillStyle = C.orange; ctx.fillRect(RSI.W / 2 - lw / 2, 572, lw, 5);
      if (o.sub) { ctx.globalAlpha = M.seg(t, 0.9, 1.6); T.line(ctx, o.sub, RSI.W / 2, 640, 34, C.ink2, 400, 'center'); }
      ctx.restore();
    },
  });
})();
