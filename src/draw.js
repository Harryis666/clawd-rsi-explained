/* RSI·Clawd — drawing primitives: panels, background, grain, icons, arrows, fact cards, loop diagram. */
(function () {
  'use strict';
  const RSI = window.RSI, C = RSI.C, M = RSI.M, T = RSI.T;
  const D = (RSI.D = {});
  const W = RSI.W, H = RSI.H;
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  D.mk = mk;
  D.rr = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.roundRect(x, y, w, h, Math.max(0, Math.min(r, w / 2, h / 2))); };
  D.panel = (ctx, x, y, w, h, o = {}) => {
    ctx.save();
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    if (o.shadow !== false) { ctx.shadowColor = 'rgba(0,0,0,0.38)'; ctx.shadowBlur = o.blur || 30; ctx.shadowOffsetY = 10; }
    ctx.fillStyle = o.fill || C.surface; D.rr(ctx, x, y, w, h, o.r == null ? 18 : o.r); ctx.fill();
    ctx.shadowColor = 'transparent';
    if (o.stroke !== false) { ctx.strokeStyle = o.stroke || 'rgba(240,238,230,0.10)'; ctx.lineWidth = o.lw || 2; ctx.stroke(); }
    ctx.restore();
  };
  // ---------- background, grain, vignette ----------
  let vig = null, grains = null;
  D.bg = (ctx, o = {}) => {
    const c1 = o.c1 || '#1D1C19', c2 = o.c2 || C.bg;
    const g = ctx.createRadialGradient(W * (o.cx || 0.5), H * (o.cy || 0.42), 80, W * 0.5, H * 0.5, W * 0.75);
    g.addColorStop(0, c1); g.addColorStop(1, c2);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  };
  D.dots = (ctx, a = 0.05, step = 48, ox = 0, oy = 0) => {
    ctx.fillStyle = `rgba(240,238,230,${a})`;
    const sx = ((ox % step) + step) % step, sy = ((oy % step) + step) % step;
    for (let y = sy; y < H; y += step) for (let x = sx; x < W; x += step) ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
  };
  D.post = (ctx, frame) => {
    if (!vig) {
      vig = mk(W, H); const v = vig.getContext('2d');
      const g = v.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, W * 0.72);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.42)');
      v.fillStyle = g; v.fillRect(0, 0, W, H);
      grains = [];
      for (let k = 0; k < 4; k++) {
        const c = mk(256, 256), gx = c.getContext('2d'), id = gx.createImageData(256, 256), r = M.rng(99 + k);
        for (let i = 0; i < id.data.length; i += 4) { const n = r() * 255; id.data[i] = id.data[i + 1] = id.data[i + 2] = n; id.data[i + 3] = 255; }
        gx.putImageData(id, 0, 0); grains.push(c);
      }
    }
    ctx.drawImage(vig, 0, 0);
    ctx.save(); ctx.globalAlpha = 0.045; ctx.globalCompositeOperation = 'overlay';
    const gc = grains[frame & 3]; const ox = Math.floor(M.hash(frame) * 256), oy = Math.floor(M.hash(frame + 7) * 256);
    ctx.translate(-ox, -oy);
    for (let y = 0; y < H + 256; y += 256) for (let x = 0; x < W + 256; x += 256) ctx.drawImage(gc, x, y);
    ctx.restore();
  };
  D.glow = (ctx, x, y, r, color, a = 1) => {
    if (a <= 0 || r <= 0) return;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, RSI.rgba(color, 0.55 * a)); g.addColorStop(0.4, RSI.rgba(color, 0.18 * a)); g.addColorStop(1, RSI.rgba(color, 0));
    ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2);
  };
  D.sparkle = (ctx, x, y, s, color = C.yellow, a = 1, rot = 0) => {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = color; ctx.beginPath();
    for (let i = 0; i < 8; i++) { const r = i % 2 ? s * 0.22 : s; const an = (i * Math.PI) / 4; ctx.lineTo(Math.cos(an) * r, Math.sin(an) * r); }
    ctx.closePath(); ctx.fill(); ctx.restore();
  };
  // ---------- arrows ----------
  D.arrow = (ctx, x1, y1, x2, y2, o = {}) => {
    const c = o.color || C.ink2, w = o.w || 4, hs = o.head || 16;
    const an = Math.atan2(y2 - y1, x2 - x1);
    ctx.save(); ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round';
    if (o.dash) ctx.setLineDash(o.dash);
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2 - Math.cos(an) * hs * 0.7, y2 - Math.sin(an) * hs * 0.7); ctx.stroke();
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - Math.cos(an - 0.45) * hs, y2 - Math.sin(an - 0.45) * hs);
    ctx.lineTo(x2 - Math.cos(an + 0.45) * hs, y2 - Math.sin(an + 0.45) * hs);
    ctx.closePath(); ctx.fill(); ctx.restore();
  };
  D.arcArrow = (ctx, cx, cy, r, a0, a1, o = {}) => {
    const c = o.color || C.ink2, w = o.w || 4, hs = o.head || 16;
    ctx.save(); ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = w; ctx.lineCap = 'round';
    const back = hs * 0.6 / r;
    ctx.beginPath(); ctx.arc(cx, cy, r, a0, a1 - back); ctx.stroke();
    const x2 = cx + Math.cos(a1) * r, y2 = cy + Math.sin(a1) * r; const tan = a1 + Math.PI / 2;
    ctx.beginPath(); ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - Math.cos(tan - 0.45) * hs, y2 - Math.sin(tan - 0.45) * hs);
    ctx.lineTo(x2 - Math.cos(tan + 0.45) * hs, y2 - Math.sin(tan + 0.45) * hs);
    ctx.closePath(); ctx.fill(); ctx.restore();
  };
  // ---------- icons (line style, box size s centered at x,y) ----------
  D.icon = (ctx, name, x, y, s, color = C.ink, lw) => {
    ctx.save(); ctx.translate(x, y); const k = s / 100; ctx.scale(k, k);
    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = (lw || 7) ; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const P = () => ctx.beginPath(), S = () => ctx.stroke(), F = () => ctx.fill();
    switch (name) {
      case 'bulb': P(); ctx.arc(0, -12, 30, Math.PI * 0.8, Math.PI * 2.2); ctx.lineTo(14, 22); ctx.lineTo(-14, 22); ctx.closePath(); S();
        P(); ctx.moveTo(-12, 34); ctx.lineTo(12, 34); ctx.moveTo(-8, 44); ctx.lineTo(8, 44); S();
        P(); ctx.moveTo(-8, 8); ctx.lineTo(0, -6); ctx.lineTo(8, 8); S(); break;
      case 'flask': P(); ctx.moveTo(-12, -42); ctx.lineTo(-12, -10); ctx.lineTo(-36, 34); ctx.quadraticCurveTo(-38, 42, -28, 42); ctx.lineTo(28, 42); ctx.quadraticCurveTo(38, 42, 36, 34); ctx.lineTo(12, -10); ctx.lineTo(12, -42); S();
        P(); ctx.moveTo(-20, -42); ctx.lineTo(20, -42); S(); P(); ctx.moveTo(-26, 18); ctx.lineTo(26, 18); S();
        P(); ctx.arc(-6, 30, 4, 0, 7); ctx.arc(10, 26, 3, 0, 7); F(); break;
      case 'chart': P(); ctx.moveTo(-40, -40); ctx.lineTo(-40, 40); ctx.lineTo(42, 40); S();
        P(); ctx.moveTo(-28, 20); ctx.lineTo(-8, -2); ctx.lineTo(8, 10); ctx.lineTo(34, -28); S();
        P(); ctx.moveTo(22, -30); ctx.lineTo(35, -29); ctx.lineTo(34, -16); S(); break;
      case 'check': P(); ctx.moveTo(-32, 2); ctx.lineTo(-10, 26); ctx.lineTo(34, -26); S(); break;
      case 'cross': P(); ctx.moveTo(-28, -28); ctx.lineTo(28, 28); ctx.moveTo(28, -28); ctx.lineTo(-28, 28); S(); break;
      case 'decide': P(); ctx.moveTo(-26, 44); ctx.lineTo(-26, -40); S(); P(); ctx.moveTo(-26, -40); ctx.lineTo(30, -28); ctx.lineTo(-26, -6); ctx.closePath(); S(); break;
      case 'gpu': D.rr(ctx, -40, -40, 80, 80, 10); S(); D.rr(ctx, -20, -20, 40, 40, 4); S();
        P(); for (let i = -1; i <= 1; i++) { ctx.moveTo(i * 20, -40); ctx.lineTo(i * 20, -52); ctx.moveTo(i * 20, 40); ctx.lineTo(i * 20, 52); ctx.moveTo(-40, i * 20); ctx.lineTo(-52, i * 20); ctx.moveTo(40, i * 20); ctx.lineTo(52, i * 20); } S(); break;
      case 'clock': P(); ctx.arc(0, 0, 40, 0, 7); S(); P(); ctx.moveTo(0, 0); ctx.lineTo(0, -26); ctx.moveTo(0, 0); ctx.lineTo(18, 10); S(); break;
      case 'moon': P(); ctx.arc(0, 0, 38, 0.9, 5.4); ctx.arc(18, -10, 30, 4.6, 1.75, true); ctx.closePath(); F(); break;
      case 'sun': P(); ctx.arc(0, 0, 22, 0, 7); F(); P(); for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4; ctx.moveTo(Math.cos(a) * 32, Math.sin(a) * 32); ctx.lineTo(Math.cos(a) * 44, Math.sin(a) * 44); } S(); break;
      case 'gavel': ctx.save(); ctx.rotate(-0.6); D.rr(ctx, -34, -40, 50, 26, 6); S(); P(); ctx.moveTo(-9, -14); ctx.lineTo(-9, 30); S(); ctx.restore(); P(); ctx.moveTo(-10, 42); ctx.lineTo(40, 42); S(); break;
      case 'warning': P(); ctx.moveTo(0, -42); ctx.lineTo(44, 36); ctx.lineTo(-44, 36); ctx.closePath(); S(); P(); ctx.moveTo(0, -12); ctx.lineTo(0, 10); S(); P(); ctx.arc(0, 23, 4.5, 0, 7); F(); break;
      case 'lock': D.rr(ctx, -32, -6, 64, 48, 8); S(); P(); ctx.arc(0, -10, 20, Math.PI, 0); ctx.lineTo(20, -6); ctx.moveTo(-20, -6); ctx.lineTo(-20, -10); S(); break;
      case 'code': P(); ctx.moveTo(-18, -26); ctx.lineTo(-42, 0); ctx.lineTo(-18, 26); ctx.moveTo(18, -26); ctx.lineTo(42, 0); ctx.lineTo(18, 26); ctx.moveTo(8, -36); ctx.lineTo(-8, 36); S(); break;
      case 'gear': P(); for (let i = 0; i < 16; i++) { const a = (i * Math.PI) / 8; const r = i % 2 ? 30 : 42; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); S(); P(); ctx.arc(0, 0, 12, 0, 7); S(); break;
      case 'eye': P(); ctx.moveTo(-44, 0); ctx.quadraticCurveTo(0, -40, 44, 0); ctx.quadraticCurveTo(0, 40, -44, 0); S(); P(); ctx.arc(0, 0, 12, 0, 7); F(); break;
      case 'book': P(); ctx.moveTo(0, -30); ctx.quadraticCurveTo(-24, -42, -44, -34); ctx.lineTo(-44, 34); ctx.quadraticCurveTo(-24, 26, 0, 38); ctx.quadraticCurveTo(24, 26, 44, 34); ctx.lineTo(44, -34); ctx.quadraticCurveTo(24, -42, 0, -30); ctx.lineTo(0, 38); S(); break;
      case 'globe': P(); ctx.arc(0, 0, 40, 0, 7); S(); P(); ctx.ellipse(0, 0, 16, 40, 0, 0, 7); S(); P(); ctx.moveTo(-40, 0); ctx.lineTo(40, 0); S(); break;
      case 'people': P(); ctx.arc(-16, -16, 13, 0, 7); S(); P(); ctx.arc(-16, 40, 26, Math.PI, 0); S(); P(); ctx.arc(22, -10, 11, 0, 7); S(); P(); ctx.arc(22, 40, 22, Math.PI * 1.1, 0); S(); break;
      default: P(); ctx.arc(0, 0, 30, 0, 7); S();
    }
    ctx.restore();
  };
  // ---------- terminal window ----------
  D.terminal = (ctx, x, y, w, h, o = {}) => {
    D.panel(ctx, x, y, w, h, { fill: o.fill || '#191917', r: 16, alpha: o.alpha });
    ctx.save(); if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    ctx.fillStyle = '#232220'; D.rr(ctx, x, y, w, 46, 16); ctx.fill(); ctx.fillRect(x, y + 30, w, 16);
    ['#E96A5E', '#E9B44C', '#6CC070'].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x + 26 + i * 24, y + 23, 7, 0, 7); ctx.fill(); });
    if (o.title) T.line(ctx, o.title, x + w / 2, y + 24, 20, C.ink3, 500, 'center', 'mono');
    ctx.restore();
    return { x: x + 30, y: y + 70 };
  };
  // ---------- fact card ("现实" check) ----------
  /** card = {tag, body, src}; age = seconds since appear (or 1e9 for fully shown). Returns height. */
  D.factCard = (ctx, x, y, w, card, age, o = {}) => {
    if (age < 0) return 0;
    const a = M.clamp(age / 0.35) * (o.alpha == null ? 1 : o.alpha);
    const dy = (1 - M.ease.outCubic(M.clamp(age / 0.45))) * 26;
    const size = o.size || 34;
    const L = T.layout(ctx, RSI.L(card.body), { size, weight: 500, maxW: w - 76, lh: 1.5 });
    const srcL = card.src ? T.layout(ctx, (RSI.lang === 'en' ? 'Source: ' : '来源：') + RSI.L(card.src), { size: 21, weight: 400, maxW: w - 76, lh: 1.35 }) : null;
    const h = 74 + L.h + (srcL ? srcL.h + 18 : 0) + 30;
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(0, dy);
    D.panel(ctx, x, y, w, h, { fill: o.fill || C.surface, r: 18 });
    ctx.fillStyle = o.accent || C.orange; D.rr(ctx, x, y, 8, h, 4); ctx.fill();
    const tag = RSI.L(card.tag || { zh: '现实', en: 'Reality check' });
    ctx.font = T.font(22, 700); const tw = ctx.measureText(tag).width + 28;
    ctx.fillStyle = o.tagColor || C.yellow; D.rr(ctx, x + 38, y + 24, tw, 36, 18); ctx.fill();
    ctx.fillStyle = '#1b1a18'; ctx.textBaseline = 'middle'; ctx.fillText(tag, x + 52, y + 43); ctx.textBaseline = 'alphabetic';
    const rev = o.instant ? 1e9 : Math.max(0, (age - 0.25) * (o.cps || 34));
    T.drawLayout(ctx, L, x + 38, y + 74, { reveal: rev });
    if (srcL) T.drawLayout(ctx, srcL, x + 38, y + 74 + L.h + 18, { color: C.ink3, alpha: M.clamp((rev - L.n) / 10) });
    ctx.restore();
    return h;
  };
  // ---------- research loop diagram ----------
  D.LOOP = [
    { zh: '想法', en: 'Idea', icon: 'bulb' }, { zh: '实验', en: 'Experiment', icon: 'flask' },
    { zh: '评估', en: 'Evaluate', icon: 'chart' }, { zh: '决定', en: 'Decide', icon: 'decide' },
  ];
  /** o: {ai:[0..1 x4] share done by AI, phase: token position in loops (float), alpha, nodeR, labels, trail} */
  D.loop = (ctx, cx, cy, R, o = {}) => {
    const ai = o.ai || [0, 0, 0, 0]; const nr = o.nodeR || 74; const alpha = o.alpha == null ? 1 : o.alpha;
    ctx.save(); ctx.globalAlpha *= alpha;
    const ang = (i) => -Math.PI / 2 + (i * Math.PI) / 2;
    // ring arrows
    for (let i = 0; i < 4; i++) {
      const a0 = ang(i) + nr / R + 0.06, a1 = ang(i + 1) - nr / R - 0.06;
      D.arcArrow(ctx, cx, cy, R, a0, a1, { color: o.ringColor || 'rgba(240,238,230,0.35)', w: 5, head: 18 });
    }
    // token + trail
    if (o.phase != null) {
      const ph = o.phase; const col = o.tokenColor || C.yellow;
      for (let k = 12; k >= 0; k--) {
        const p = ph - k * (o.trail || 0.012); const a = ang(0) + p * Math.PI * 2;
        const tx = cx + Math.cos(a) * R, ty = cy + Math.sin(a) * R;
        ctx.fillStyle = RSI.rgba(col, (1 - k / 13) * 0.7); ctx.beginPath(); ctx.arc(tx, ty, 13 - k * 0.6, 0, 7); ctx.fill();
      }
      const a = ang(0) + ph * Math.PI * 2; D.glow(ctx, cx + Math.cos(a) * R, cy + Math.sin(a) * R, 60, col, 0.9);
    }
    for (let i = 0; i < 4; i++) {
      const nx = cx + Math.cos(ang(i)) * R, ny = cy + Math.sin(ang(i)) * R; const s = M.clamp(ai[i]);
      const col = RSI.mix(C.blue, C.orange, s);
      ctx.save(); ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 20;
      ctx.fillStyle = C.raised; ctx.beginPath(); ctx.arc(nx, ny, nr, 0, 7); ctx.fill(); ctx.restore();
      // share ring: blue (human) vs orange (AI)
      ctx.lineWidth = 9; ctx.lineCap = 'butt';
      ctx.strokeStyle = C.blue; ctx.beginPath(); ctx.arc(nx, ny, nr - 5, -Math.PI / 2 + s * Math.PI * 2, -Math.PI / 2 + Math.PI * 2); if (s < 0.999) ctx.stroke();
      ctx.strokeStyle = C.orange; ctx.beginPath(); ctx.arc(nx, ny, nr - 5, -Math.PI / 2, -Math.PI / 2 + s * Math.PI * 2); if (s > 0.001) ctx.stroke();
      D.icon(ctx, D.LOOP[i].icon, nx, ny - 14, nr * 0.62, col, 8);
      T.line(ctx, D.LOOP[i], nx, ny + nr * 0.5, Math.round(nr * 0.32), C.ink, 700, 'center');
      if (o.hi === i) D.glow(ctx, nx, ny, nr * 1.9, C.yellow, 0.5);
    }
    ctx.restore();
  };
  /** sticky note with optional peel (0..1) */
  D.sticky = (ctx, x, y, w, h, text, o = {}) => {
    const peel = o.peel || 0; if (peel >= 1) return;
    ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.rotate((o.rot || -0.03) + peel * 0.5);
    ctx.translate(peel * 420, -peel * 260); ctx.globalAlpha *= 1 - M.clamp((peel - 0.6) / 0.4);
    ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 8;
    ctx.fillStyle = o.color || '#F3D46B'; ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = 'rgba(0,0,0,0.06)'; ctx.fillRect(-w / 2, -h / 2, w, 26);
    T.text(ctx, text, 0, -h / 2 + (o.ty || h * 0.32), { size: o.size || 40, weight: 700, align: 'center', color: '#3A3220', maxW: w - 40 });
    ctx.restore();
  };
  /** simple axes */
  D.axes = (ctx, x, y, w, h, o = {}) => {
    ctx.save(); ctx.strokeStyle = o.color || 'rgba(240,238,230,0.45)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + h); ctx.lineTo(x + w, y + h); ctx.stroke();
    if (o.xl) T.line(ctx, o.xl, x + w, y + h + 34, 26, C.ink2, 500, 'right');
    if (o.yl) { ctx.save(); ctx.translate(x - 30, y); ctx.rotate(-Math.PI / 2); T.line(ctx, o.yl, 0, 0, 26, C.ink2, 500, 'right'); ctx.restore(); }
    ctx.restore();
  };
  /** polyline from function over [0,1] with progress p (0..1 drawn). returns last point */
  D.curve = (ctx, fx, fy, n, p, o = {}) => {
    ctx.save(); ctx.strokeStyle = o.color || C.orange; ctx.lineWidth = o.w || 6; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    if (o.glow) { ctx.shadowColor = o.color || C.orange; ctx.shadowBlur = o.glow; }
    ctx.beginPath(); let last = null; const m = Math.max(1, Math.floor(n * p));
    for (let i = 0; i <= m; i++) { const u = (i / n); const X = fx(u), Y = fy(u); if (!isFinite(Y)) break; if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); last = [X, Y]; }
    ctx.stroke(); ctx.restore(); return last;
  };
  /** pill label */
  D.pill = (ctx, s, x, y, o = {}) => {
    const size = o.size || 24; ctx.font = T.font(size, o.weight || 700);
    const w = ctx.measureText(RSI.L(s)).width + size * 1.2, h = size * 1.6;
    const bx = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
    ctx.save(); if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    ctx.fillStyle = o.fill || C.orange; D.rr(ctx, bx, y - h / 2, w, h, h / 2); ctx.fill();
    if (o.stroke) { ctx.strokeStyle = o.stroke; ctx.lineWidth = 2; ctx.stroke(); }
    ctx.fillStyle = o.color || '#1b1a18'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
    ctx.fillText(RSI.L(s), bx + w / 2, y + 1); ctx.restore();
    return w;
  };
})();
