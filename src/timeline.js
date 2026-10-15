/* RSI·Clawd — timeline: scenes, line timing, captions & bubbles, HUD (generation counter), frame renderer. */
(function () {
  'use strict';
  const RSI = window.RSI, C = RSI.C, M = RSI.M, T = RSI.T, D = RSI.D;
  RSI.scenes = []; RSI.chapters = []; RSI.cues = []; RSI.genEvents = [];
  /** every scene ever defined, by id (a later definition with the same id replaces the earlier one) */
  RSI.allScenes = {};
  RSI.defScene = (d) => { RSI.allScenes[d.id] = d; return d; };
  RSI.genStart = 1;
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
    // v3 short-drama pacing: faster base reading rate, shorter minimum (v2: card 2.6+n/8, narr 1.2+n/8.6, others 1.0+n/7.6, min 2.0)
    const base = ln.who === 'card' ? 1.8 + n / 10.5 : ln.who === 'narr' ? 0.85 + n / 10 : 0.7 + n / 9;
    return Math.max(ln.min || 1.4, base) + (ln.hold || 0);
  };
  /** time all lines of one scene (idempotent; also used for flashbacks / teasers of scenes outside the current episode) */
  RSI.prepScene = (sc) => {
    if (sc._prepped) return sc;
    const byId = {}; let cur = sc.lead == null ? 0.3 : sc.lead;
    for (const ln of sc.lines || (sc.lines = [])) {
      ln.dur = ln.dur != null ? ln.dur : RSI.lineDur(ln);
      ln.t = ln.at != null ? resolve(ln.at, byId, sc) : cur + (ln.gap != null ? ln.gap : 0.15);
      if (!ln.par) cur = Math.max(cur, ln.t + ln.dur);
      if (ln.id) byId[ln.id] = ln;
      if (ln.who === 'card' || ln.who === 'sys') ln.manual = ln.manual !== false;
    }
    sc.byId = byId;
    sc.dur = sc.dur != null ? sc.dur : Math.max(sc.minDur || 0, cur + (sc.pad == null ? 0.35 : sc.pad));
    sc.R = (spec) => resolve(spec, byId, sc);
    // camera kicks: a quick punch-in when a character starts talking (and on narr lines flagged kick:true)
    sc._kicks0 = sc.kick === false ? [] : sc.lines.filter((ln) => !ln.manual && ln.kick !== false && (CHAR[ln.who] || ln.who === 'big' || ln.kick)).map((ln) => ln.t).sort((a, b) => a - b);
    sc._kicks = sc._kicks0.slice();
    sc._prepped = true;
    return sc;
  };
  /** build the timeline of one episode (RSI.ep, 1-based) from the series manifest (src/series.js) */
  RSI.build = (ep) => {
    if (ep != null) RSI.ep = ep;
    const E = RSI.EPS && RSI.EPS[(RSI.ep || 1) - 1];
    if (E) {
      RSI.scenes = E.scenes.map((id) => { const sc = RSI.allScenes[id]; if (!sc) throw new Error('episode ' + E.n + ': unknown scene ' + id); return sc; });
      RSI.genStart = E.genStart || 1; RSI.epInfo = E;
    }
    let t0 = 0; RSI.chapters = []; RSI.cues = []; RSI.genEvents = [];
    for (const sc of RSI.scenes) {
      RSI.prepScene(sc); sc.start = t0;
      const chap = (E && E.chapters && E.chapters[sc.id]) || sc.chapter;
      if (chap) RSI.chapters.push({ t: t0, label: chap, id: sc.id });
      for (const c of sc.cues || []) RSI.cues.push(Object.assign({ t: t0 + sc.R(c[0]), type: c[1] }, c[2] || {}));
      for (const g of sc.gen || []) RSI.genEvents.push({ t: t0 + sc.R(g[0]), g: g[1] });
      t0 += sc.dur;
    }
    for (const sc of RSI.scenes) RSI.dramaPrep(sc, sc.start);
    RSI.genEvents.sort((a, b) => a.t - b.t);
    RSI.cues.sort((a, b) => a.t - b.t);
    RSI.total = t0;
    return t0;
  };
  /** current generation at absolute time */
  RSI.genAt = (ta) => {
    if (RSI._genOverride != null) return { g: RSI._genOverride, since: 1e9, prev: RSI._genOverride };
    let g = RSI.genStart || 1, since = 1e9, prev = g;
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

  // =====================================================================================================
  // v3 short-drama layer (短剧节奏): one-line subtitle pages · 花字 pop words · automatic camera pushes.
  // Goal: something on screen changes at least every ~3 s (see docs/research/05_short_drama_pacing_zh.md).
  // =====================================================================================================
  const PAGE = { zh: { max: 20, min: 7, fit: 30 }, en: { max: 60, min: 18, fit: 84 } };
  const cnt = (s, lang) => (lang === 'en' ? T.plain(s).trim().length : T.count(s));
  /** split a caption into short pages at punctuation (never inside {x|…} colour spans or manual line breaks) */
  RSI.splitPages = (text, lang) => {
    const P = PAGE[lang];
    if (/\n/.test(text) || cnt(text, lang) <= P.max) return [text];
    const ch = Array.from(text), segs = []; let cur = '', depth = 0;
    for (let i = 0; i < ch.length; i++) {
      const c = ch[i]; cur += c;
      if (c === '{') depth++; else if (c === '}') depth = Math.max(0, depth - 1);
      if (depth) continue;
      let cut = false;
      if (lang === 'zh') cut = '。！？；：，'.includes(c) || (c === '—' && ch[i - 1] === '—' && ch[i + 1] !== '—');
      else cut = (/[.!?;:,]/.test(c) && ch[i + 1] === ' ') || (c === '—' && ch[i + 1] === ' ' && ch[i - 1] === ' ');
      if (!cut) continue;
      while (i + 1 < ch.length && '”’）)」』》'.includes(ch[i + 1])) cur += ch[++i];
      segs.push(cur); cur = '';
    }
    if (cur.trim()) segs.push(cur);
    const pages = [];
    for (const s of segs) {
      const last = pages[pages.length - 1];
      if (last != null && cnt(last + s, lang) <= P.max) pages[pages.length - 1] = last + s; else pages.push(s);
    }
    // no tiny pages: fold a short first/last page into its neighbour when the pair still fits on one line
    if (pages.length > 1 && cnt(pages[pages.length - 1], lang) < P.min && cnt(pages[pages.length - 2] + pages[pages.length - 1], lang) <= P.fit) pages.splice(-2, 2, pages[pages.length - 2] + pages[pages.length - 1]);
    if (pages.length > 1 && cnt(pages[0], lang) < P.min && cnt(pages[0] + pages[1], lang) <= P.fit) pages.splice(0, 2, pages[0] + pages[1]);
    return pages.map((s) => s.trim()).filter(Boolean);
  };
  /** pages of a narrator line for the current language: [{s, t0, t1}] (times relative to the line start) */
  RSI.pagesOf = (ln) => {
    const lang = RSI.lang === 'en' ? 'en' : 'zh';
    const key = lang + ':' + ln.dur;
    if (ln._pg && ln._pg.key === key) return ln._pg.pages;
    const text = RSI.L(ln);
    let ss = ln.who === 'narr' && !ln.noPage && ln.dur >= 2.6 ? RSI.splitPages(text, lang) : [text];
    const w = ss.map((s) => cnt(s, lang) + (lang === 'en' ? 8 : 3)), W0 = w.reduce((a, b) => a + b, 0);
    let acc = 0; const pages = ss.map((s, i) => { const t0 = acc; acc += (ln.dur * w[i]) / W0; return { s, t0, t1: acc }; });
    ln._pg = { key, pages };
    return pages;
  };
  /** 花字 positions (screen space, 1920×1080) */
  const POP_POS = { tl: [420, 250], tc: [960, 215], tr: [1490, 255], l: [400, 500], c: [960, 470], r: [1520, 500], bl: [430, 790], bc: [960, 760], br: [1490, 790] };
  const POP_ROT = [-5, 4, -3, 6];
  const SOFT_CUES = new Set(['heart', 'snore', 'roll', 'riser', 'shepard', 'drone', 'hum', 'wind', 'night']);
  RSI.SOFT_CUES = SOFT_CUES;
  const PUSH_GAP = 3.0, PUSH_EVERY = 2.5, PUSH_Z = 0.055, PUSH_T = 0.32;
  /** per-episode short-drama prep for one scene (start time t0): flips, pops (+ their cues & kicks), camera pushes */
  RSI.dramaPrep = (sc, t0) => {
    // subtitle page flips
    sc._flips = [];
    for (const ln of sc.lines) if (ln.who === 'narr' && !ln.manual) for (const pg of RSI.pagesOf(ln).slice(1)) sc._flips.push(ln.t + pg.t0);
    // pops: scene-local list + the central table (src/episodes/pops.js)
    const raw = [].concat(sc.pops || [], (RSI.POPS && RSI.POPS[sc.id]) || []);
    sc._pops = raw.map((p, i) => {
      const o = Array.isArray(p) ? Object.assign({ at: p[0], zh: p[1], en: p[2] }, p[3] || {}) : Object.assign({}, p);
      o.t = sc.R(o.at); o.i = i; o.dur = o.dur || (o.style === 'stamp' ? 1.5 : 1.25);
      return o;
    }).sort((a, b) => a.t - b.t);
    for (const p of sc._pops) {
      const sfx = p.sfx === undefined ? (p.style === 'stamp' ? 'stamp' : p.style === 'tag' ? 'pop' : 'huazi') : p.sfx;
      if (sfx) RSI.cues.push({ t: t0 + p.t, type: sfx, v: p.i, pop: true });
    }
    sc._kicks = (sc._kicks0 || []).concat(sc._pops.filter((p) => p.kick !== false && p.style !== 'tag').map((p) => p.t)).sort((a, b) => a - b);
    // automatic camera pushes in any stretch longer than PUSH_GAP without a beat
    sc._push = [];
    if (sc.cam === false || sc.isCard) return;
    const beats = [0, sc.dur, ...sc.lines.map((l) => l.t), ...sc._flips, ...sc._kicks, ...sc._pops.map((p) => p.t)];
    for (const c of RSI.cues) if (c.t >= t0 && c.t < t0 + sc.dur && !SOFT_CUES.has(c.type)) beats.push(c.t - t0);
    beats.sort((a, b) => a - b);
    let z = 0, k = 0; const F = sc.focus || [RSI.W / 2, RSI.H * 0.46];
    for (let i = 1; i < beats.length; i++) {
      const a = beats[i - 1], b = beats[i], g = b - a;
      if (g <= PUSH_GAP) continue;
      const n = Math.ceil(g / PUSH_EVERY) - 1;
      for (let j = 1; j <= n; j++) { z = z ? 0 : 1; sc._push.push({ t: a + (g * j) / (n + 1), z: z ? 1 + (sc.camZ || PUSH_Z) : 1, f: F }); k++; }
      if (z && b < sc.dur - 0.2) { z = 0; sc._push.push({ t: b, z: 1, f: F }); }
    }
  };
  /** camera zoom & focus at scene time t (automatic pushes) */
  RSI.camAt = (sc, t) => {
    let z = 1, cur = 1; const P = sc._push || [];
    for (const p of P) {
      if (t < p.t) break;
      const e = M.ease.inOutCubic(M.clamp((t - p.t) / PUSH_T));
      z = M.lerp(cur, p.z, e); if (e >= 1) cur = p.z;
    }
    return { z, f: sc.focus || [RSI.W / 2, RSI.H * 0.46] };
  };
  const POP_COL = () => ({ y: C.yellow, o: C.orange, r: C.red, b: C.blue, g: C.green, w: '#FFFFFF', p: C.purple || '#B58CFF' });
  function drawPops(ctx, sc, t) {
    for (const p of sc._pops || []) {
      const age = t - p.t; if (age < 0 || age > p.dur) continue;
      const st = p.style || 'pop', col = POP_COL()[p.c || (st === 'stamp' ? 'r' : 'y')] || p.c;
      const kIn = M.clamp(age / (st === 'stamp' ? 0.13 : 0.2));
      const s0 = st === 'stamp' ? M.lerp(2.3, 1, M.ease.outCubic(kIn)) : M.lerp(0.35, 1, M.ease.outBack(kIn));
      const a = M.clamp(age / 0.05) * (1 - M.seg(age, p.dur - 0.2, p.dur));
      const pos = Array.isArray(p.pos) ? p.pos : POP_POS[p.pos || 'tr'];
      const size = p.size || (st === 'tag' ? 52 : st === 'stamp' ? 92 : 96);
      const rot = (p.rot != null ? p.rot : st === 'stamp' ? -8 : POP_ROT[p.i % 4]) * Math.PI / 180;
      const drift = st === 'pop' ? -10 * M.ease.outCubic(M.seg(age, 0.2, p.dur)) : 0;
      ctx.save(); ctx.globalAlpha *= a;
      ctx.font = T.font(size, 900); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
      const rows = String(RSI.L(p)).split('\n'), lh = size * 1.12;
      const wMax = Math.max(...rows.map((r) => ctx.measureText(r).width));
      // auto-fit (long English words): shrink to ≤ maxW and keep the whole box inside a 40 px safe margin
      const boxW = wMax + size * (st === 'pop' ? 0.35 : 0.9), boxH = rows.length * lh + size * 0.4;
      const fit = Math.min(1, (p.maxW || 820) / boxW), hw = boxW * fit / 2 + 6, hh = boxH * fit / 2 + 6;
      const px = M.clamp(pos[0], 40 + hw, RSI.W - 40 - hw), py = M.clamp(pos[1], 40 + hh, RSI.H - 40 - hh);
      ctx.translate(px, py + drift); ctx.rotate(rot); ctx.scale(s0 * fit, s0 * fit);
      if (st === 'tag' || st === 'stamp') {
        const bw = wMax + size * 0.9, bh = rows.length * lh + size * 0.4;
        if (st === 'tag') { ctx.fillStyle = 'rgba(0,0,0,0.35)'; D.rr(ctx, -bw / 2 + 6, -bh / 2 + 8, bw, bh, bh / 2.4); ctx.fill(); ctx.fillStyle = col; D.rr(ctx, -bw / 2, -bh / 2, bw, bh, bh / 2.4); ctx.fill(); }
        else { ctx.fillStyle = 'rgba(12,10,9,0.55)'; D.rr(ctx, -bw / 2, -bh / 2, bw, bh, 14); ctx.fill(); ctx.lineWidth = size * 0.1; ctx.strokeStyle = col; D.rr(ctx, -bw / 2, -bh / 2, bw, bh, 14); ctx.stroke(); }
      }
      rows.forEach((r, i) => {
        const y = (i - (rows.length - 1) / 2) * lh;
        if (st === 'tag') { ctx.fillStyle = '#1b1a18'; ctx.fillText(r, 0, y + size * 0.04); return; }
        ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillText(r, size * 0.05, y + size * 0.09);
        ctx.lineWidth = size * 0.24; ctx.strokeStyle = 'rgba(14,12,11,0.96)'; ctx.strokeText(r, 0, y);
        if (st === 'pop') { ctx.lineWidth = size * 0.08; ctx.strokeStyle = 'rgba(255,255,255,0.92)'; ctx.strokeText(r, 0, y); }
        ctx.fillStyle = col; ctx.fillText(r, 0, y);
      });
      ctx.restore();
    }
  }
  RSI.drawPops = drawPops;

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

  /** mode: undefined = everything · 'noNarr' = skip narrator captions · 'bubbles' = only anchored speech bubbles · 'captions' = everything else */
  function drawLines(ctx, sc, S, t, mode) {
    for (const ln of sc.lines) {
      if (ln.manual || t < ln.t || t > ln.t + ln.dur) continue;
      if ((mode === 'noNarr' || mode === 'bubbles') && ln.who === 'narr') continue;
      const age = t - ln.t; const a = M.env(t, ln.t, ln.t + ln.dur, 0.12, 0.2);
      const reveal = age * RSI.lineRate(ln); const text = RSI.L(ln);
      if (ln.who === 'narr') {
        const pages = RSI.pagesOf(ln);
        if (pages.length === 1) { T.caption(ctx, text, { alpha: a, reveal }); continue; }
        let pg = pages[0]; for (const q of pages) if (age >= q.t0) pg = q;
        const pa = age - pg.t0, pop = pg.t0 > 0 ? 1 + 0.05 * (1 - M.ease.outCubic(M.clamp(pa / 0.14))) : 1;
        ctx.save(); ctx.translate(RSI.W / 2, RSI.H - 100); ctx.scale(pop, pop); ctx.translate(-RSI.W / 2, -(RSI.H - 100));
        T.caption(ctx, pg.s, { alpha: a, reveal: pa * Math.max(RSI.lineRate(ln), 30) });
        ctx.restore();
        continue;
      }
      let an = ln.anchor ? (typeof ln.anchor === 'function' ? ln.anchor(S) : ln.anchor) : S.anchors[ln.who];
      if (mode === 'bubbles' && !an) continue;
      if (mode === 'captions' && an) continue;
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
    const E = RSI.epInfo; let s = null;
    if (E) s = RSI.lang === 'en' ? `EP ${E.n} · ${RSI.L(E.title)}` : `第 ${E.n} 集 · ${RSI.L(E.title)}`;
    else { let ch = null; for (const c of RSI.chapters) if (c.t <= ta + 0.01) ch = c; if (ch) s = RSI.L(ch.label); }
    if (!s) return;
    ctx.save(); ctx.globalAlpha = 0.55 * M.seg(ta - sc.start, 0, 0.6);
    T.line(ctx, s, 56, 56, 22, C.ink2, 500, 'left');
    ctx.restore();
  }
  const helpers = new Map();
  const helperFor = (sc) => { let S = helpers.get(sc); if (!S) { S = helper(sc); helpers.set(sc, S); } return S; };
  /**
   * Draw any (prepped) scene at local time t — used for freeze frames, flashbacks and "next episode" teasers.
   * o: {lines (default true), gen (constant generation while drawing), bg (default true)}
   */
  RSI.drawSceneAt = (ctx, sc, t, o = {}) => {
    RSI.prepScene(sc);
    const S = helperFor(sc); const saved = [S.t, S.anchors, S.sides, S.hud];
    S.t = t; S.anchors = {}; S.sides = {}; S.hud = null; S.frame = o.frame || 0; S.flash = true;
    const g0 = RSI._genOverride; if (o.gen != null) RSI._genOverride = o.gen;
    ctx.save();
    if (o.bg !== false && sc.bg !== false) D.bg(ctx, sc.bg || {});
    ctx.save(); sc.draw(ctx, t, S); ctx.restore();
    if (o.lines !== false) drawLines(ctx, sc, S, t, o.lines === 'bubbles' ? 'noNarr' : undefined);
    ctx.restore();
    RSI._genOverride = g0; S.flash = false;
    [S.t, S.anchors, S.sides, S.hud] = saved;
  };
  // ---------- camera kick (v3): +3.5 % punch-in, eased back over half a second ----------
  const KICK_A = 0.035, KICK_UP = 0.07, KICK_DN = 0.5, KICK_C = [RSI.W / 2, RSI.H * 0.45];
  RSI.kickAt = (sc, t) => {
    let k = 0;
    for (const tk of sc._kicks || []) {
      const age = t - tk; if (age < 0) break; if (age > KICK_UP + KICK_DN) continue;
      k = Math.max(k, age < KICK_UP ? M.ease.outCubic(age / KICK_UP) : 1 - M.ease.inOutCubic((age - KICK_UP) / KICK_DN));
    }
    return k * KICK_A;
  };
  RSI.renderFrame = (ctx, ta, frame = 0) => {
    ta = M.clamp(ta, 0, RSI.total - 1e-4);
    const sc = RSI.sceneAt(ta); const t = ta - sc.start;
    const S = helperFor(sc);
    S.t = t; S.anchors = {}; S.sides = {}; S.hud = null; S.frame = frame; S.noLines = false;
    ctx.save();
    if (sc.bg !== false) D.bg(ctx, sc.bg || {});
    // the picture and the speech bubbles ride the camera kick; narrator captions, HUD and labels stay put
    const kk = RSI.kickAt(sc, t), cam = RSI.camAt(sc, t);
    ctx.save();
    if (cam.z !== 1) { ctx.translate(cam.f[0], cam.f[1]); ctx.scale(cam.z, cam.z); ctx.translate(-cam.f[0], -cam.f[1]); }
    if (kk > 0) { ctx.translate(KICK_C[0], KICK_C[1]); ctx.scale(1 + kk, 1 + kk); ctx.translate(-KICK_C[0], -KICK_C[1]); }
    ctx.save(); sc.draw(ctx, t, S); ctx.restore();
    if (!S.noLines) drawLines(ctx, sc, S, t, 'bubbles');
    ctx.restore();
    if (!S.noLines) drawLines(ctx, sc, S, t, 'captions');
    if (sc.over) { ctx.save(); sc.over(ctx, t, S); ctx.restore(); }
    drawPops(ctx, sc, t);
    chapterLabel(ctx, sc, ta);
    hud(ctx, sc, ta, S);
    const fi = sc.fade ? sc.fade[0] : 0.2, fo = sc.fade ? sc.fade[1] : 0.2;
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
