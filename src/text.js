/* RSI·Clawd — text layout: CJK-aware wrapping, rich markup {o|…}, typewriter reveal, bubbles, captions. */
(function () {
  'use strict';
  const RSI = window.RSI, C = RSI.C, M = RSI.M;
  const T = (RSI.T = {});
  T.SANS = '"Noto Sans SC","Noto Sans CJK SC","PingFang SC","Hiragino Sans GB","Microsoft YaHei","Source Han Sans SC",sans-serif';
  T.SERIF = '"Noto Serif CJK SC","Noto Serif SC","Source Han Serif SC","Songti SC","SimSun",serif';
  T.MONO = '"JetBrains Mono","Liberation Mono","Andale Mono","SF Mono",Menlo,Consolas,' + T.SANS;
  T.font = (size, weight = 400, fam = 'sans') =>
    `${weight} ${size}px ${fam === 'mono' ? T.MONO : fam === 'serif' ? T.SERIF : T.SANS}`;

  // Style keys usable as {k|text}. Values: [colorOnDark, colorOnLight, bold?]
  const STY = {
    o: [C.orange, '#C2552F'], b: [C.blue, '#2F6DB5'], g: [C.green, '#2E8A57'], r: [C.red, '#C8443A'],
    y: [C.yellow, '#A87A12'], p: [C.purple, '#8A4FB0'], t: [C.teal, '#1F8797'], d: [C.ink3, '#8A857A'],
    B: [null, null, 1], O: [C.orange, '#C2552F', 1], Y: [C.yellow, '#A87A12', 1], G: [C.green, '#2E8A57', 1],
    R: [C.red, '#C8443A', 1], U: [C.blue, '#2F6DB5', 1], m: [null, null, 0, 'mono'],
  };
  T.STY = STY;
  T.parse = (s) => {
    const runs = []; let i = 0; let m; const re = /\{([a-zA-Z]+)\|([^{}]*)\}/g;
    while ((m = re.exec(s))) {
      if (m.index > i) runs.push({ s: s.slice(i, m.index), k: '' });
      runs.push({ s: m[2], k: m[1] }); i = re.lastIndex;
    }
    if (i < s.length) runs.push({ s: s.slice(i), k: '' });
    return runs;
  };
  T.plain = (s) => String(s).replace(/\{[a-zA-Z]+\|([^{}]*)\}/g, '$1');
  /** count of "visible" characters (for timing) */
  T.count = (s) => {
    let p = T.plain(s); let n = 0;
    p = p.replace(/[A-Za-z0-9][A-Za-z0-9.,%+×\-'’/:_]*/g, (w) => { n += Math.max(1, w.length / 4); return ''; });
    return n + Array.from(p).filter((ch) => ch.trim() !== '').length;
  };
  T.opts = (def, o) => { const r = Object.assign({}, def); for (const k in o) if (o[k] !== undefined) r[k] = o[k]; return r; };

  const CLOSE = '，。！？、；：”’）》」』…—％～·.,!?;:)]%';
  const OPEN = '“‘（《「『([';
  const isCJK = (ch) => /[\u2E80-\u9FFF\uF900-\uFAFF\uFF00-\uFFEF\u3000-\u303F\u2018-\u201F\u2026\u2014]/.test(ch);

  function tokenize(runs) {
    const out = [];
    for (const r of runs) {
      const chars = Array.from(r.s); let i = 0;
      while (i < chars.length) {
        const ch = chars[i];
        if (ch === '\n') { out.push({ br: 1, p: [] }); i++; continue; }
        if (ch === ' ') { out.push({ sp: 1, p: [{ t: ' ', k: r.k }] }); i++; continue; }
        if (ch === '…' || ch === '—') { let j = i; while (j < chars.length && chars[j] === ch) j++; out.push({ p: [{ t: chars.slice(i, j).join(''), k: r.k }], cl: 1 }); i = j; continue; }
        if (isCJK(ch)) { out.push({ p: [{ t: ch, k: r.k }], cl: CLOSE.includes(ch) ? 1 : 0, op: OPEN.includes(ch) ? 1 : 0 }); i++; continue; }
        let j = i; while (j < chars.length && chars[j] !== ' ' && chars[j] !== '\n' && !isCJK(chars[j])) j++;
        out.push({ p: [{ t: chars.slice(i, j).join(''), k: r.k }] }); i = j;
      }
    }
    // glue: closing punct sticks to previous atom, opening punct to next atom
    const g = [];
    for (let i = 0; i < out.length; i++) {
      const a = out[i];
      if (a.cl && g.length && !g[g.length - 1].br && !g[g.length - 1].sp) { g[g.length - 1].p.push(...a.p); continue; }
      if (a.op && i + 1 < out.length && !out[i + 1].br && !out[i + 1].sp) { out[i + 1].p.unshift(...a.p); continue; }
      g.push(a);
    }
    return g;
  }
  const fontFor = (o, k) => {
    const st = STY[k]; const bold = st && st[2]; const fam = (st && st[3]) || o.fam;
    return T.font(o.size, bold ? Math.max(o.weight, 700) : o.weight, fam);
  };
  const cache = new Map();
  /** layout(ctx, text, {size, weight, fam, maxW, lh}) → {lines:[{w, pieces:[{t,k,x}]}], w, h, n, lineH} */
  T.layout = (ctx, text, o = {}) => {
    o = T.opts({ size: 40, weight: 400, fam: 'sans', maxW: 1e9, lh: 1.45 }, o);
    if (o.balance) {
      const L0 = T.layout(ctx, text, Object.assign({}, o, { balance: false }));
      if (L0.lines.length < 2) return L0;
      const sum = L0.lines.reduce((a, l) => a + l.w, 0);
      const L1 = T.layout(ctx, text, Object.assign({}, o, { balance: false, maxW: Math.min(o.maxW, Math.ceil(sum / L0.lines.length + o.size * 1.5)) }));
      return L1.lines.length === L0.lines.length ? L1 : L0;
    }
    const key = [text, o.size, o.weight, o.fam, o.maxW, o.lh].join('\u0001');
    let L = cache.get(key); if (L) return L;
    const atoms = tokenize(T.parse(String(text)));
    for (const a of atoms) {
      a.w = 0;
      for (const pc of a.p) { ctx.font = fontFor(o, pc.k); pc.w = ctx.measureText(pc.t).width; a.w += pc.w; }
    }
    const lines = []; let cur = { w: 0, pieces: [] };
    const push = () => { while (cur.pieces.length && cur.pieces[cur.pieces.length - 1].t === ' ') { cur.w -= cur.pieces.pop().w; } lines.push(cur); cur = { w: 0, pieces: [] }; };
    for (const a of atoms) {
      if (a.br) { push(); continue; }
      if (a.sp && cur.pieces.length === 0) continue;
      if (cur.w + a.w > o.maxW && cur.pieces.length && !a.sp) push();
      for (const pc of a.p) { cur.pieces.push({ t: pc.t, k: pc.k, x: cur.w, w: pc.w }); cur.w += pc.w; }
    }
    if (cur.pieces.length || !lines.length) push();
    let n = 0; for (const ln of lines) for (const pc of ln.pieces) { pc.n0 = n; n += Array.from(pc.t).length; }
    const lineH = o.size * o.lh;
    L = { lines, w: Math.max(...lines.map((l) => l.w)), h: lineH * lines.length, n, lineH, o };
    if (cache.size > 4000) cache.clear();
    cache.set(key, L); return L;
  };
  /** draw a layout. y = top of first line. opts: align, color, reveal (chars), light (bubble palette), alpha */
  T.drawLayout = (ctx, L, x, y, d = {}) => {
    const o = L.o; const light = d.light ? 1 : 0; const reveal = d.reveal == null ? 1e9 : d.reveal;
    ctx.save(); ctx.textBaseline = 'alphabetic';
    if (d.alpha != null) ctx.globalAlpha *= d.alpha;
    const asc = o.size * 0.88 + (L.lineH - o.size) / 2;
    L.lines.forEach((ln, i) => {
      const lx = d.align === 'center' ? x - ln.w / 2 : d.align === 'right' ? x - ln.w : x;
      const ly = y + i * L.lineH + asc;
      for (const pc of ln.pieces) {
        if (pc.n0 >= reveal) break;
        const st = STY[pc.k];
        ctx.font = fontFor(o, pc.k);
        ctx.fillStyle = (st && st[light]) || d.color || (light ? C.paperInk : C.ink);
        const chars = Array.from(pc.t); const s = reveal - pc.n0 >= chars.length ? pc.t : chars.slice(0, Math.max(0, Math.floor(reveal - pc.n0))).join('');
        if (s) ctx.fillText(s, lx + pc.x, ly);
      }
    });
    ctx.restore();
    return L;
  };
  T.text = (ctx, text, x, y, o = {}) => T.drawLayout(ctx, T.layout(ctx, RSI.L(text), o), x, y, o);
  /** single-line quick text with baseline middle */
  T.line = (ctx, s, x, y, size, color = C.ink, weight = 400, align = 'left', fam = 'sans') => {
    ctx.font = T.font(size, weight, fam); ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'middle';
    ctx.fillText(RSI.L(s), x, y); ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  };
  T.width = (ctx, s, size, weight = 400, fam = 'sans') => { ctx.font = T.font(size, weight, fam); return ctx.measureText(RSI.L(s)).width; };

  /** Speech bubble. anchor (ax, ay) = point the tail touches. Returns box. */
  T.bubble = (ctx, text, ax, ay, o = {}) => {
    o = T.opts({ size: 38, weight: 500, maxW: 760, pad: 26, reveal: 1e9, alpha: 1, pop: 1, side: 'up', fill: C.ink, minX: 40, maxX: RSI.W - 40, minY: 30 }, o);
    const L = T.layout(ctx, text, { size: o.size, weight: o.weight, maxW: o.maxW, lh: 1.4, balance: true });
    const w = L.w + o.pad * 2, h = L.h + o.pad * 1.5;
    let bx, by, tx, ty;
    const gap = 26;
    if (o.side === 'up' || o.side === 'down') {
      bx = M.clamp(ax - w / 2 + (o.dx || 0), o.minX, o.maxX - w);
      by = o.side === 'up' ? ay - gap - h : ay + gap;
      by = Math.max(o.minY, by);
      tx = M.clamp(ax, bx + 30, bx + w - 30); ty = o.side === 'up' ? by + h : by;
    } else {
      bx = o.side === 'right' ? ax + gap : ax - gap - w;
      by = M.clamp(ay - h / 2 + (o.dy || 0), o.minY, RSI.H - 40 - h);
      tx = o.side === 'right' ? bx : bx + w; ty = M.clamp(ay, by + 24, by + h - 24);
    }
    const sc = 0.82 + 0.18 * o.pop;
    ctx.save();
    ctx.globalAlpha *= o.alpha;
    ctx.translate(ax, ay); ctx.scale(sc, sc); ctx.translate(-ax, -ay);
    ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
    ctx.fillStyle = o.fill;
    RSI.D.rr(ctx, bx, by, w, h, 22); ctx.fill();
    ctx.shadowColor = 'transparent';
    // tail
    ctx.beginPath();
    if (o.side === 'up' || o.side === 'down') {
      const s = o.side === 'up' ? 1 : -1;
      ctx.moveTo(tx - 16, ty - s * 2); ctx.lineTo(ax, ay - s * 6); ctx.lineTo(tx + 16, ty - s * 2);
    } else {
      const s = o.side === 'right' ? 1 : -1;
      ctx.moveTo(tx + s * 2, ty - 14); ctx.lineTo(ax + s * 6, ay); ctx.lineTo(tx + s * 2, ty + 14);
    }
    ctx.closePath(); ctx.fill();
    if (o.label) {
      ctx.font = T.font(22, 700); const lw = ctx.measureText(o.label).width + 24;
      ctx.fillStyle = o.labelColor || C.orange; RSI.D.rr(ctx, bx + 18, by - 16, lw, 32, 16); ctx.fill();
      ctx.fillStyle = '#1b1a18'; ctx.textBaseline = 'middle'; ctx.fillText(o.label, bx + 30, by); ctx.textBaseline = 'alphabetic';
    }
    T.drawLayout(ctx, L, bx + o.pad, by + o.pad * 0.75, { light: o.fill === C.ink || o.light, reveal: o.reveal, color: o.color });
    ctx.restore();
    return { x: bx, y: by, w, h };
  };

  /** Bottom subtitle (narration). */
  T.caption = (ctx, text, o = {}) => {
    o = T.opts({ size: 40, weight: 500, maxW: 1480, alpha: 1, reveal: 1e9, y: RSI.H - 64 }, o);
    const L = T.layout(ctx, text, { size: o.size, weight: o.weight, maxW: o.maxW, lh: 1.42, balance: true });
    const padX = 34, padY = 16;
    const w = L.w + padX * 2, h = L.h + padY * 2;
    const x = RSI.W / 2 - w / 2, y = o.y - h;
    ctx.save(); ctx.globalAlpha *= o.alpha;
    ctx.fillStyle = 'rgba(16,15,14,0.78)'; RSI.D.rr(ctx, x, y, w, h, 18); ctx.fill();
    if (o.speaker) {
      ctx.font = T.font(24, 700); const lw = ctx.measureText(o.speaker).width + 24;
      ctx.fillStyle = o.speakerColor || C.orange; RSI.D.rr(ctx, x + 18, y - 18, lw, 34, 17); ctx.fill();
      ctx.fillStyle = '#1b1a18'; ctx.textBaseline = 'middle'; ctx.fillText(o.speaker, x + 30, y - 1); ctx.textBaseline = 'alphabetic';
    }
    T.drawLayout(ctx, L, RSI.W / 2, y + padY, { align: 'center', reveal: o.reveal });
    ctx.restore();
    return { x, y, w, h };
  };
})();
