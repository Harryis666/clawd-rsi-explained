/* Shared scene helpers. */
(function () {
  'use strict';
  const RSI = window.RSI, C = RSI.C, M = RSI.M, D = RSI.D, T = RSI.T;
  const X = (RSI.X = {});
  const W = RSI.W;
  X.blink = (t, seed = 0) => { const p = 3.1 + M.hash(seed) * 1.4; const ph = (t + M.hash(seed + 3) * p) % p; return ph < 0.13; };
  /** hop: returns {dy, sx, sy} for a hop starting at t0 */
  X.hop = (t, t0, dur = 0.5, h = 60) => {
    const p = (t - t0) / dur;
    if (p < -0.15 || p > 1.25) return { dy: 0, sx: 1, sy: 1 };
    if (p < 0) { const k = M.smooth((p + 0.15) / 0.15); return { dy: 0, sx: 1 + 0.12 * k, sy: 1 - 0.12 * k }; }
    if (p <= 1) { const k = 4 * p * (1 - p); return { dy: -h * k, sx: 1 - 0.06 * k, sy: 1 + 0.08 * k }; }
    const k = 1 - (p - 1) / 0.25; return { dy: 0, sx: 1 + 0.14 * k, sy: 1 - 0.14 * k };
  };
  X.floor = (ctx, y, a = 1) => {
    const g = ctx.createLinearGradient(0, y, 0, RSI.H);
    g.addColorStop(0, `rgba(0,0,0,${0.18 * a})`); g.addColorStop(1, `rgba(0,0,0,${0.32 * a})`);
    ctx.fillStyle = g; ctx.fillRect(0, y, RSI.W, RSI.H - y);
    ctx.fillStyle = `rgba(240,238,230,${0.10 * a})`; ctx.fillRect(0, y, RSI.W, 2);
  };
  /** standard idle Clawd options at time t */
  X.idle = (t, seed = 0, extra = {}) => Object.assign({ expr: X.blink(t, seed) ? 'blink' : 'normal' }, extra);
  X.bob = (t, amp = 4, f = 2.2, seed = 0) => Math.sin(t * f + seed) * amp;
  /** exclamation / question mark pop above a point */
  X.mark = (ctx, ch, x, y, age, color = C.yellow, size = 64) => {
    if (age < 0 || age > 1.6) return;
    const a = M.env(age, 0, 1.6, 0.1, 0.4); const sc = M.ease.outBack(M.clamp(age / 0.25));
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y - 10 * M.clamp(age / 0.3)); ctx.scale(sc, sc);
    T.line(ctx, ch, 0, 0, size, color, 900, 'center'); ctx.restore();
  };
  /** sweat drop */
  X.sweat = (ctx, x, y, age, s = 1) => {
    if (age < 0 || age > 1.8) return; const a = M.env(age, 0, 1.8, 0.15, 0.4);
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y + age * 18); ctx.scale(s, s); ctx.fillStyle = '#8CC8F0';
    ctx.beginPath(); ctx.moveTo(0, -18); ctx.quadraticCurveTo(12, 0, 0, 8); ctx.quadraticCurveTo(-12, 0, 0, -18); ctx.fill(); ctx.restore();
  };
  /** simple rising sparkles around a point */
  X.sparkles = (ctx, x, y, t, n = 8, r = 120, color = C.yellow, seed = 1, a = 1) => {
    for (let i = 0; i < n; i++) {
      const ph = (t * 0.5 + M.hash(seed + i)) % 1; const an = M.hash(seed + i * 3) * M.TAU;
      const rr = r * (0.5 + M.hash(seed + i * 7) * 0.6);
      D.sparkle(ctx, x + Math.cos(an) * rr, y + Math.sin(an) * rr * 0.6 - ph * 40, 6 + M.hash(i + seed) * 10, color, a * Math.sin(ph * Math.PI), ph * 3);
    }
  };
  /** label text centered with optional background */
  X.title = (ctx, s, x, y, size = 56, color = C.ink, weight = 900) => T.line(ctx, s, x, y, size, color, weight, 'center');
  /** progress bar */
  X.bar = (ctx, x, y, w, h, p, color, bg = 'rgba(240,238,230,0.10)') => {
    ctx.fillStyle = bg; D.rr(ctx, x, y, w, h, h / 2); ctx.fill();
    if (p > 0) { ctx.fillStyle = color; D.rr(ctx, x, y, Math.max(h, w * M.clamp(p)), h, h / 2); ctx.fill(); }
  };
  /** small source note at top-right, under the HUD */
  X.src = (ctx, s, a = 1) => { ctx.save(); ctx.globalAlpha *= a; T.line(ctx, (RSI.lang === 'en' ? 'Source: ' : '来源：') + RSI.L(s), RSI.W - 58, 136, 21, C.ink3, 400, 'right'); ctx.restore(); };
  // ---------------- v2 helpers ----------------
  /** server rack with blinking LEDs */
  X.rack = (ctx, x, y, w, h, t, seed = 1) => {
    ctx.fillStyle = '#1A1918'; D.rr(ctx, x, y, w, h, 10); ctx.fill(); ctx.strokeStyle = 'rgba(240,238,230,0.12)'; ctx.lineWidth = 2; ctx.stroke();
    const n = Math.floor((h - 30) / 46);
    for (let i = 0; i < n; i++) {
      const yy = y + 18 + i * 46; ctx.fillStyle = '#262523'; D.rr(ctx, x + 14, yy, w - 28, 34, 5); ctx.fill();
      for (let k = 0; k < 5; k++) { const on = M.hash(seed * 31 + i * 7 + k + Math.floor(t * (3 + (k % 3)))) > 0.45; ctx.fillStyle = on ? (k === 4 && M.hash(i + seed) > 0.6 ? C.red : C.green) : 'rgba(240,238,230,0.12)'; ctx.fillRect(x + 28 + k * 16, yy + 13, 8, 8); }
      ctx.fillStyle = 'rgba(240,238,230,0.08)'; ctx.fillRect(x + w - 90, yy + 10, 60, 14);
    }
  };
  /** flying paper sheets */
  X.papers = (ctx, t, n = 10, seed = 3, a = 1) => {
    ctx.save(); ctx.globalAlpha *= a;
    for (let i = 0; i < n; i++) {
      const sp = 140 + M.hash(seed + i) * 260, x = ((M.hash(seed + i * 3) * (W + 300) + t * sp) % (W + 300)) - 150;
      const y = 180 + M.hash(seed + i * 5) * 640 + Math.sin(t * 1.7 + i) * 50;
      ctx.save(); ctx.translate(x, y); ctx.rotate(t * (M.hash(i + seed) - 0.5) * 4 + i); ctx.scale(1, 0.55 + 0.45 * Math.abs(Math.sin(t * 2 + i)));
      ctx.fillStyle = C.paper; ctx.fillRect(-26, -34, 52, 68); ctx.fillStyle = 'rgba(60,50,40,0.35)'; for (let k = 0; k < 5; k++) ctx.fillRect(-18, -24 + k * 11, 36 - (k % 2) * 12, 3);
      ctx.restore();
    }
    ctx.restore();
  };
  /** speed lines streaming to the left behind a point */
  X.speed = (ctx, x, y, t, w = 500, hgt = 260, a = 1, color = 'rgba(240,238,230,0.5)') => {
    ctx.save(); ctx.globalAlpha *= a; ctx.strokeStyle = color; ctx.lineCap = 'round';
    for (let i = 0; i < 14; i++) { const yy = y + (M.hash(i * 3.1) - 0.5) * hgt; const len = 60 + M.hash(i * 5.7) * 160; const ph = ((t * (2.2 + M.hash(i) * 2) + M.hash(i * 9)) % 1); const xx = x - ph * w;
      ctx.lineWidth = 3 + M.hash(i * 2) * 4; ctx.globalAlpha = a * (1 - ph); ctx.beginPath(); ctx.moveTo(xx, yy); ctx.lineTo(xx - len, yy); ctx.stroke(); }
    ctx.restore();
  };
  /** dizzy stars orbiting a point */
  X.dizzy = (ctx, x, y, t, r = 70, a = 1) => { for (let i = 0; i < 3; i++) { const an = t * 5 + (i * M.TAU) / 3; D.sparkle(ctx, x + Math.cos(an) * r, y + Math.sin(an) * r * 0.32, 16, C.yellow, a, an); } };
  /** hand-drawn circle (progress p) */
  X.scribble = (ctx, x, y, rx, ry, p, color = C.red, lw = 7) => {
    if (p <= 0) return; ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.beginPath();
    const n = 60, m = Math.floor(n * 1.15 * M.clamp(p));
    for (let i = 0; i <= m; i++) { const an = -2.2 + (i / n) * M.TAU; const k = 1 + 0.06 * Math.sin(i * 0.7) + i / n * 0.08; const px = x + Math.cos(an) * rx * k, py = y + Math.sin(an) * ry * k; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.stroke(); ctx.restore();
  };
  /** big quiz countdown ring: p = 0..1 elapsed; n = seconds label */
  X.countdown = (ctx, x, y, r, p, label, color = C.yellow) => {
    ctx.save(); ctx.lineWidth = 12; ctx.strokeStyle = 'rgba(240,238,230,0.14)'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.stroke();
    ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + M.TAU * (1 - M.clamp(p))); ctx.stroke();
    T.line(ctx, label, x, y + 4, r * 0.9, color, 900, 'center'); ctx.restore();
  };
  /**
   * "你猜？" quiz panel (curiosity gap): options pop in at t0, a 3-2-1 ring runs until tA, then the answer lights up.
   * o: {opts:[{zh,en}], ans (index), t0, tA, tEnd, w, title, color}
   */
  X.quiz = (ctx, t, x, y, o) => {
    const t0 = o.t0, tA = o.tA, tEnd = o.tEnd == null ? Infinity : o.tEnd; if (t < t0 || t > tEnd + 0.4) return;
    const w = o.w || 500, n = o.opts.length, oh = 70, gap = 16, h = 112 + n * (oh + gap);
    const a = M.seg(t, t0, t0 + 0.3) * (1 - M.seg(t, tEnd, tEnd + 0.4)); const k = M.ease.outBack(M.seg(t, t0, t0 + 0.35));
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(x + w / 2, y + h / 2); ctx.scale(0.9 + 0.1 * k, 0.9 + 0.1 * k); ctx.translate(-w / 2, -h / 2);
    D.panel(ctx, 0, 0, w, h, { fill: 'rgba(28,27,24,0.92)', r: 22, blur: 24 });
    ctx.strokeStyle = RSI.rgba(o.color || C.yellow, 0.7); ctx.lineWidth = 3; D.rr(ctx, 0, 0, w, h, 22); ctx.stroke();
    T.line(ctx, o.title || { zh: '你猜？', en: 'Your guess?' }, 32, 58, 44, o.color || C.yellow, 900, 'left');
    const done = t >= tA;
    if (!done) { // 3-2-1 ring
      const p = M.seg(t, t0 + 0.4, tA); const left = Math.max(1, Math.ceil(3 * (1 - p) - 1e-6));
      X.countdown(ctx, w - 62, 56, 30, p, String(left), o.color || C.yellow);
    }
    o.opts.forEach((op, i) => {
      const ti = t0 + 0.25 + i * 0.16; if (t < ti) return; const ki = M.ease.outBack(M.seg(t, ti, ti + 0.3));
      const yy = 112 + i * (oh + gap); const right = i === o.ans;
      const lit = done ? M.seg(t, tA, tA + 0.25) : 0;
      ctx.save(); ctx.globalAlpha *= M.clamp(ki) * (done && !right ? 1 - 0.65 * lit : 1);
      ctx.translate(w / 2, yy + oh / 2); ctx.scale(right && done ? 1 + 0.06 * Math.sin(Math.min(1, (t - tA) / 0.35) * Math.PI) : 1, 1); ctx.translate(-w / 2, -(yy + oh / 2));
      ctx.fillStyle = right && done ? RSI.mix(C.surface, C.green, lit) : C.surface; D.rr(ctx, 28, yy, w - 56, oh, oh / 2); ctx.fill();
      T.line(ctx, 'ABCD'[i], 70, yy + oh / 2 + 1, 28, right && done ? '#10240f' : C.ink3, 900, 'center', 'mono');
      T.line(ctx, op, 112, yy + oh / 2 + 1, 32, right && done ? '#10240f' : C.ink, 800, 'left');
      if (right && done) D.icon(ctx, 'check', w - 74, yy + oh / 2, 34, '#10240f', 7);
      ctx.restore();
    });
    ctx.restore();
  };
  /** count-up number formatting */
  X.num = (v, d = 0) => v.toFixed(d);
})();
