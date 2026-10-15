/* RSI·Clawd — core utilities (math, color, rng, language). Pure code, no assets. */
(function () {
  'use strict';
  const RSI = (window.RSI = window.RSI || {});
  RSI.W = 1920;
  RSI.H = 1080;
  RSI.FPS = 30;
  RSI.lang = 'zh';

  const M = (RSI.M = {});
  M.TAU = Math.PI * 2;
  M.clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  M.lerp = (a, b, t) => a + (b - a) * t;
  M.inv = (a, b, x) => M.clamp((x - a) / (b - a));
  M.smooth = (t) => t * t * (3 - 2 * t);
  M.ease = {
    lin: (t) => t,
    inQuad: (t) => t * t,
    outQuad: (t) => t * (2 - t),
    inOutQuad: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
    inCubic: (t) => t * t * t,
    outCubic: (t) => 1 - Math.pow(1 - t, 3),
    inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    outBack: (t) => { const s = 1.70158; return 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2); },
    outElastic: (t) => (t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin(((t * 10 - 0.75) * M.TAU) / 3) + 1),
    inOutSine: (t) => -(Math.cos(Math.PI * t) - 1) / 2,
    outExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    inExpo: (t) => (t === 0 ? 0 : Math.pow(2, 10 * t - 10)),
  };
  /** progress of t inside [a,b] (clamped), optionally eased */
  M.seg = (t, a, b, ease) => { const p = M.clamp((t - a) / (b - a || 1e-9)); return ease ? ease(p) : p; };
  /** 0→1 fade in over [a,a+fi], hold, 1→0 over [b-fo,b] */
  M.env = (t, a, b, fi = 0.4, fo = 0.4) => Math.max(0, Math.min(M.seg(t, a, a + fi), 1 - M.seg(t, b - fo, b)));
  M.rng = (seed) => {
    let s = seed >>> 0;
    return () => {
      s = (s + 0x6d2b79f5) >>> 0;
      let r = Math.imul(s ^ (s >>> 15), 1 | s);
      r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  };
  M.hash = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  M.hash2 = (a, b) => M.hash(a * 57.31 + b * 113.97);
  M.noise1 = (x) => { const i = Math.floor(x), f = x - i; const u = f * f * (3 - 2 * f); return M.lerp(M.hash(i), M.hash(i + 1), u); };
  M.wobble = (t, f = 1, seed = 0) => M.noise1(t * f + seed * 17.3) * 2 - 1;
  M.pingpong = (t) => 1 - Math.abs(((t % 2) + 2) % 2 - 1);

  // Palette — warm "terminal" dark theme + Clawd orange.
  RSI.C = {
    bg: '#141413', bg2: '#1C1B18', surface: '#22211E', raised: '#2E2C28', line: 'rgba(240,238,230,0.16)',
    ink: '#F0EEE6', ink2: 'rgba(240,238,230,0.66)', ink3: 'rgba(240,238,230,0.40)',
    orange: '#D97757', orangeD: '#A9533A', orangeL: '#F2A687', orangeHi: '#FFC9A8',
    paper: '#F1EADC', paper2: '#E6DCC8', paperInk: '#2C2A26', paperInk2: '#6F6A60',
    blue: '#5E9FE8', blueD: '#2F6DB5', green: '#72BC8F', red: '#E97366', yellow: '#EAC26B',
    purple: '#BF8EDA', teal: '#4FB9C9', pink: '#DF84A8', grey: '#8A877F', skin: '#E8BE98', skinD: '#C99773',
  };
  const hexToRgb = (hex) => {
    let h = hex.replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  };
  RSI.hexToRgb = hexToRgb;
  RSI.rgba = (hex, a) => { if (hex.startsWith('rgba')) return hex; const [r, g, b] = hexToRgb(hex); return `rgba(${r},${g},${b},${a})`; };
  RSI.mix = (h1, h2, t) => {
    const a = hexToRgb(h1), b = hexToRgb(h2);
    const c = a.map((v, i) => Math.round(v + (b[i] - v) * t));
    return '#' + c.map((v) => v.toString(16).padStart(2, '0')).join('');
  };
  /** Pick the current-language string from {zh, en} or return plain strings. */
  RSI.L = (o) => {
    const v = o == null ? '' : typeof o === 'string' ? o : o[RSI.lang] != null ? o[RSI.lang] : o.zh;
    // English mode: the CJK-first font stack draws curly quotes full-width (“Today’ s”), so use straight ones
    return RSI.lang === 'en' && typeof v === 'string' ? v.replace(/[’‘]/g, "'").replace(/[“”]/g, '"') : v;
  };
})();
