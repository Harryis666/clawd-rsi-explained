/* Shared scene helpers. */
(function () {
  'use strict';
  const RSI = window.RSI, C = RSI.C, M = RSI.M, D = RSI.D, T = RSI.T;
  const X = (RSI.X = {});
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
  /** count-up number formatting */
  X.num = (v, d = 0) => v.toFixed(d);
})();
