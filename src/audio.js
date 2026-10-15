/* RSI·Clawd — audio engine. Every sound is synthesized with the Web Audio API — no samples:
   chapter music (9 styles), character "babble" voices, typing clicks and ~40 sound effects.
   One deterministic event list drives both live playback (lookahead scheduler) and offline
   rendering (chunked OfflineAudioContext + overlap-add, see tools/render-audio.mjs). */
(function () {
  'use strict';
  const RSI = window.RSI, M = RSI.M, T = RSI.T;
  const AU = (RSI.Audio = {});
  const EMIN = 0.0001;
  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const NN = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const n = (s) => { const m = /^([A-G])([#b]?)(-?\d)$/.exec(s); return NN[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (parseInt(m[3], 10) + 1) * 12; };
  const ns = (s) => s.split(' ').map(n);
  const pick = (r, a) => a[Math.floor(r() * a.length) % a.length];
  const hashStr = (s) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };

  // ---------------------------------------------------------------- graph
  function noiseBuf(ac) {
    if (ac._noise) return ac._noise;
    const len = ac.sampleRate * 2, b = ac.createBuffer(1, len, ac.sampleRate), d = b.getChannelData(0), r = M.rng(12345);
    for (let i = 0; i < len; i++) d[i] = r() * 2 - 1;
    return (ac._noise = b);
  }
  function irBuf(ac) {
    if (ac._ir) return ac._ir;
    const sr = ac.sampleRate, len = Math.floor(sr * 3.2), b = ac.createBuffer(2, len, sr);
    for (let c = 0; c < 2; c++) {
      const d = b.getChannelData(c), r = M.rng(777 + c * 31);
      for (let i = 0; i < len; i++) { const x = i / len; const a = Math.min(1, i / (sr * 0.015)); d[i] = (r() * 2 - 1) * Math.pow(1 - x, 3.2) * a * (1 - 0.5 * x); }
      // a few early reflections
      for (const [ms, g] of [[11, 0.5], [23, 0.35], [37, 0.3], [53, 0.22]]) { const j = Math.floor((ms + c * 3) * sr / 1000); if (j < len) d[j] += g; }
    }
    return (ac._ir = b);
  }
  function graph(ac, dest, o = {}) {
    const G = { ac };
    G.master = ac.createGain(); G.master.gain.value = o.master == null ? 1 : o.master;
    if (o.live) {
      const comp = ac.createDynamicsCompressor(); comp.threshold.value = -12; comp.knee.value = 10; comp.ratio.value = 3.5; comp.attack.value = 0.005; comp.release.value = 0.25;
      G.master.connect(comp); comp.connect(dest); G.comp = comp;
    } else G.master.connect(dest);
    const bus = (v) => { const g = ac.createGain(); g.gain.value = v; g.connect(G.master); return g; };
    G.music = bus(AU.mix.music); G.sfx = bus(AU.mix.sfx); G.voice = bus(AU.mix.voice);
    G.verb = ac.createConvolver(); G.verb.normalize = true; G.verb.buffer = irBuf(ac);
    const vo = ac.createGain(); vo.gain.value = AU.mix.verb; G.verb.connect(vo); vo.connect(G.master);
    G.noise = noiseBuf(ac);
    return G;
  }
  AU.mix = { music: 0.5, sfx: 0.7, voice: 0.6, verb: 0.55 };
  /** per-style loudness trims (calibrated from tools/render-audio.mjs loudness reports) */
  AU.secGain = { ambient: 1.4, title: 0.89, lofi: 1, build: 1, tension: 1.45, quirky: 2.2, reflect: 1.06, epilogue: 1.25, outro: 1.06 }; // calibrated from audio_v1 per-section RMS (tools/render-audio.mjs loudness report)
  function out(G, node, a, send, pan) {
    let x = node; const ac = G.ac;
    if (pan) { const p = ac.createStereoPanner(); p.pan.value = M.clamp(pan, -1, 1); x.connect(p); x = p; }
    x.connect(G[a.bus || 'music']);
    const s = a.send != null ? a.send : send;
    if (s > 0) { const g = ac.createGain(); g.gain.value = s; x.connect(g); g.connect(G.verb); }
  }
  function osc(G, type, f, t0, t1) { const o = G.ac.createOscillator(); o.type = type; o.frequency.setValueAtTime(f, t0); o.start(t0); o.stop(t1); return o; }
  function noiseSrc(G, t0, t1, off) { const s = G.ac.createBufferSource(); s.buffer = G.noise; s.loop = true; s.start(t0, ((off || 0) * 0.7919) % 1.9); s.stop(t1); return s; }
  const V = (a, d) => (a.vel == null ? d : a.vel) * (a.g == null ? 1 : a.g);
  const gainNode = (G, v) => { const g = G.ac.createGain(); g.gain.value = v; return g; };
  const lp = (G, f, q = 0.7, type = 'lowpass') => { const b = G.ac.createBiquadFilter(); b.type = type; b.frequency.value = f; b.Q.value = q; return b; };

  // ---------------------------------------------------------------- instruments
  const I = (AU.I = {});
  I.pad = (G, t, a) => { // notes[], dur, vel, cut, at, rel, wave
    const at = a.at || 1.0, rel = a.rel || 2.0, dur = Math.max(a.dur, at + 0.05), end = t + dur + rel * 1.6;
    const c = a.cut || 1100, f = lp(G, c * 0.6, 0.6);
    f.frequency.setValueAtTime(c * 0.55, t); f.frequency.linearRampToValueAtTime(c, t + at + 0.4); f.frequency.linearRampToValueAtTime(c * 0.7, t + dur + rel);
    const g = G.ac.createGain(), v = V(a, 0.5) * 0.045 / Math.sqrt(a.notes.length / 4);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + at); g.gain.setValueAtTime(v, t + dur); g.gain.setTargetAtTime(0, t + dur, rel / 4);
    f.connect(g); out(G, g, a, 0.6, a.pan);
    for (const m of a.notes) for (const d of [-7, 6]) { const o = osc(G, a.wave || 'sawtooth', mtof(m), t, end); o.detune.value = d + (a.det || 0); o.connect(f); }
  };
  I.ep = (G, t, a) => { // FM electric piano
    const f0 = mtof(a.m), v = V(a, 0.6) * 0.06, dur = Math.max(0.6, a.dur || 1.2), end = t + dur + 0.9;
    const car = osc(G, 'sine', f0, t, end), mod = osc(G, 'sine', f0 * (a.ratio || 1), t, end), mg = G.ac.createGain();
    mg.gain.setValueAtTime(f0 * (a.idx || 1.5), t); mg.gain.exponentialRampToValueAtTime(f0 * 0.06 + 0.01, t + 0.9);
    mod.connect(mg); mg.connect(car.frequency);
    const g = G.ac.createGain();
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.006); g.gain.exponentialRampToValueAtTime(v * 0.32, t + 0.5);
    g.gain.setValueAtTime(v * 0.32, t + dur); g.gain.setTargetAtTime(0, t + dur, 0.16);
    car.connect(g); out(G, g, a, 0.3, a.pan);
  };
  I.bell = (G, t, a) => { // FM bell / marimba (ratio 4)
    const f0 = mtof(a.m), v = V(a, 0.5) * 0.05, dec = a.dur || 2.2, end = t + dec + 0.05;
    const car = osc(G, 'sine', f0, t, end), mod = osc(G, 'sine', f0 * (a.ratio || 3.5), t, end), mg = G.ac.createGain();
    if (a.det) { car.detune.value = a.det; mod.detune.value = a.det; }
    mg.gain.setValueAtTime(f0 * (a.idx == null ? 2.0 : a.idx), t); mg.gain.exponentialRampToValueAtTime(f0 * 0.04 + 0.01, t + dec * 0.6);
    mod.connect(mg); mg.connect(car.frequency);
    const g = G.ac.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.003); g.gain.exponentialRampToValueAtTime(EMIN, t + dec);
    car.connect(g); out(G, g, a, 0.55, a.pan);
  };
  I.pluck = (G, t, a) => {
    const f0 = mtof(a.m), v = V(a, 0.5) * 0.06, dec = a.dur || 0.35, end = t + dec + 0.05;
    const o = osc(G, a.wave || 'triangle', f0, t, end); if (a.det) o.detune.value = a.det;
    const c = a.cut || 3200, f = lp(G, c, a.q || 1.2);
    f.frequency.setValueAtTime(c, t); f.frequency.exponentialRampToValueAtTime(Math.max(180, c * 0.15), t + dec);
    o.connect(f);
    if (a.wave2) { const o2 = osc(G, a.wave2, f0 * 2, t, end); o2.detune.value = 5; const g2 = gainNode(G, 0.28); o2.connect(g2); g2.connect(f); }
    const g = G.ac.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.004); g.gain.exponentialRampToValueAtTime(EMIN, t + dec);
    f.connect(g); out(G, g, a, 0.22, a.pan);
  };
  I.bass = (G, t, a) => {
    const f0 = mtof(a.m), v = V(a, 0.6) * 0.12, dur = Math.max(0.08, a.dur || 0.5), end = t + dur + 0.3;
    const o = osc(G, 'sine', f0, t, end), o2 = osc(G, 'triangle', f0, t, end), c = a.cut || 650, f = lp(G, c, 0.8);
    f.frequency.setValueAtTime(c, t); f.frequency.exponentialRampToValueAtTime(Math.max(140, c * 0.4), t + dur);
    const g2 = gainNode(G, 0.55); o2.connect(g2); g2.connect(f); o.connect(f);
    const g = G.ac.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.012); g.gain.setTargetAtTime(v * 0.65, t + 0.012, 0.15); g.gain.setTargetAtTime(0, t + dur, 0.05);
    f.connect(g); out(G, g, a, 0.04);
  };
  I.kick = (G, t, a) => {
    const v = V(a, 0.8) * 0.3, end = t + 0.5;
    const o = osc(G, 'sine', 150, t, end); o.frequency.exponentialRampToValueAtTime(50, t + 0.1); o.frequency.exponentialRampToValueAtTime(40, t + 0.4);
    const g = G.ac.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(v * 0.45, t + 0.08); g.gain.exponentialRampToValueAtTime(EMIN, t + 0.42);
    o.connect(g); out(G, g, a, 0.02);
    const s = noiseSrc(G, t, t + 0.03, a.off), f = lp(G, 1600, 0.7, 'highpass'), gc = G.ac.createGain();
    gc.gain.setValueAtTime(v * 0.22, t); gc.gain.exponentialRampToValueAtTime(EMIN, t + 0.016); s.connect(f); f.connect(gc); out(G, gc, a, 0);
  };
  I.snare = (G, t, a) => {
    const v = V(a, 0.6) * 0.26, dec = a.dur || 0.18;
    const s = noiseSrc(G, t, t + dec + 0.05, a.off == null ? 0.3 : a.off), f = lp(G, a.f || 1900, 0.7, 'bandpass'), g = G.ac.createGain();
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(EMIN, t + dec); s.connect(f); f.connect(g); out(G, g, a, 0.22, a.pan);
    const o = osc(G, 'triangle', 190, t, t + 0.1); o.frequency.exponentialRampToValueAtTime(140, t + 0.08);
    const go = G.ac.createGain(); go.gain.setValueAtTime(v * 0.8, t); go.gain.exponentialRampToValueAtTime(EMIN, t + 0.08); o.connect(go); out(G, go, a, 0.08);
  };
  I.hat = (G, t, a) => {
    const v = V(a, 0.4) * 0.1, dec = a.dur || 0.045;
    const s = noiseSrc(G, t, t + dec + 0.03, a.off == null ? 0.7 : a.off), f = lp(G, a.f || 7500, 0.7, 'highpass'), g = G.ac.createGain();
    g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(EMIN, t + dec); s.connect(f); f.connect(g); out(G, g, a, 0.06, a.pan == null ? 0.22 : a.pan);
  };
  I.wood = (G, t, a) => {
    const v = V(a, 0.5) * 0.11, f0 = a.f || 880;
    for (const [mul, k] of [[1, 1], [1.48, 0.45]]) {
      const o = osc(G, 'sine', f0 * mul, t, t + 0.12), g = G.ac.createGain();
      g.gain.setValueAtTime(v * k, t); g.gain.exponentialRampToValueAtTime(EMIN, t + 0.07); o.connect(g); out(G, g, a, 0.14, a.pan);
    }
  };
  I.crackle = (G, t, a) => {
    const s = noiseSrc(G, t, t + 0.012, a.off), f = lp(G, a.f || 3000, 2, 'bandpass'), g = G.ac.createGain();
    g.gain.setValueAtTime(V(a, 0.3) * 0.1, t); g.gain.exponentialRampToValueAtTime(EMIN, t + 0.008); s.connect(f); f.connect(g); out(G, g, a, 0, a.pan);
  };
  I.drone = (G, t, a) => {
    const v = V(a, 0.5) * 0.07, dur = Math.max(a.dur, 1), end = t + dur + 3, g = G.ac.createGain();
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + (a.at || 2)); g.gain.setValueAtTime(v, t + dur); g.gain.setTargetAtTime(0, t + dur, 0.6);
    for (const [mul, det, k, w] of [[1, 0, 1, 'sine'], [2, 5, 0.3, 'triangle'], [3, -4, 0.08, 'triangle']]) {
      const o = osc(G, w, mtof(a.m) * mul, t, end); o.detune.value = det; const gk = gainNode(G, k); o.connect(gk); gk.connect(g);
    }
    out(G, g, a, 0.2);
  };
  I.blip = (G, t, a) => { // character voice syllable
    const dur = a.dur || 0.06, v = V(a, 0.5) * 0.1, end = t + dur + 0.03;
    const o = osc(G, a.wave || 'square', a.f, t, end); o.frequency.exponentialRampToValueAtTime(a.f * (a.glide || 0.92), t + dur);
    const f = lp(G, a.cut || 2400, 2.5), g = G.ac.createGain();
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.006); g.gain.setValueAtTime(v, t + dur * 0.55); g.gain.exponentialRampToValueAtTime(EMIN, t + dur);
    o.connect(f); f.connect(g); out(G, g, a, 0.1, a.pan);
  };
  I.key = (G, t, a) => { // keyboard click
    const v = V(a, 0.5);
    const s = noiseSrc(G, t, t + 0.04, a.off), f = lp(G, a.f || 3200, 1.4, 'bandpass'), g = G.ac.createGain();
    g.gain.setValueAtTime(v * 0.2, t); g.gain.exponentialRampToValueAtTime(EMIN, t + 0.026); s.connect(f); f.connect(g); out(G, g, a, 0.04, a.pan);
    const th = a.th || 170, o = osc(G, 'sine', th, t, t + 0.05); o.frequency.exponentialRampToValueAtTime(th * 0.7, t + 0.04);
    const go = G.ac.createGain(); go.gain.setValueAtTime(v * 0.16, t); go.gain.exponentialRampToValueAtTime(EMIN, t + 0.04); o.connect(go); out(G, go, a, 0);
  };
  I.tone = (G, t, a) => { // generic sweep: f0,f1,dur,wave,vel,at,hold,cut,q,vib[rate,depth],lin
    const dur = a.dur || 0.2, end = t + dur + 0.05, v = V(a, 0.5) * 0.18, at = a.at || 0.005;
    const o = osc(G, a.wave || 'sine', a.f0, t, end);
    if (a.f1) { if (a.lin) o.frequency.linearRampToValueAtTime(a.f1, t + dur); else o.frequency.exponentialRampToValueAtTime(a.f1, t + dur); }
    if (a.vib) { const l = osc(G, 'sine', a.vib[0], t, end), lg = gainNode(G, a.vib[1]); l.connect(lg); lg.connect(o.frequency); }
    let x = o; if (a.cut) { const f = lp(G, a.cut, a.q || 0.8); o.connect(f); x = f; }
    const g = G.ac.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + at);
    if (a.hold) g.gain.setValueAtTime(v, t + at + a.hold);
    g.gain.exponentialRampToValueAtTime(EMIN, t + Math.max(dur, at + (a.hold || 0) + 0.01));
    x.connect(g); out(G, g, a, 0.18, a.pan);
  };
  I.noise = (G, t, a) => { // filtered noise: dur, vel, type, f0, f1, f2, q, at
    const dur = a.dur || 0.3, v = V(a, 0.5) * 0.22, at = a.at || 0.004;
    const s = noiseSrc(G, t, t + dur + 0.05, a.off), f = lp(G, a.f0 || 1000, a.q || 1, a.type || 'bandpass');
    f.frequency.setValueAtTime(a.f0 || 1000, t);
    if (a.f2) { f.frequency.exponentialRampToValueAtTime(a.f1, t + dur * (a.mid || 0.5)); f.frequency.exponentialRampToValueAtTime(a.f2, t + dur); }
    else if (a.f1) f.frequency.exponentialRampToValueAtTime(a.f1, t + dur);
    const g = G.ac.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + at); g.gain.exponentialRampToValueAtTime(EMIN, t + Math.max(dur, at + 0.01));
    s.connect(f); f.connect(g); out(G, g, a, 0.2, a.pan);
  };
  I.shepard = (G, t, a) => { // endlessly rising Shepard tone
    const dur = a.dur || 6, N = 6, P = a.period || 2.4, steps = Math.max(8, Math.ceil(dur * 40));
    const g = G.ac.createGain(), v = V(a, 0.5) * 0.06;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.8); g.gain.setValueAtTime(v, t + dur - 0.25); g.gain.linearRampToValueAtTime(0, t + dur);
    out(G, g, a, 0.35);
    for (let k = 0; k < N; k++) {
      const fc = new Float32Array(steps), gc = new Float32Array(steps);
      for (let i = 0; i < steps; i++) { const tt = (i / (steps - 1)) * dur; const ph = ((k + tt / P) % N) / N; fc[i] = 45 * Math.pow(2, ph * N); gc[i] = Math.pow(Math.sin(Math.PI * ph), 2); }
      const o = G.ac.createOscillator(); o.type = 'sine'; o.frequency.value = fc[0]; o.frequency.setValueCurveAtTime(fc, t, dur); o.start(t); o.stop(t + dur + 0.05);
      const gk = G.ac.createGain(); gk.gain.value = gc[0]; gk.gain.setValueCurveAtTime(gc, t, dur); o.connect(gk); gk.connect(g);
    }
  };

  // ---------------------------------------------------------------- SFX (cue type → primitive events)
  const h = (x) => M.hash(x * 1.37 + 0.5);
  const SFX = (AU.SFX = {
    key: (P, c) => P(c.t, 'key', { f: 2500 + h(c.t) * 1700, th: 140 + h(c.t + 1) * 70, vel: 0.5 + h(c.t + 2) * 0.3, off: h(c.t + 3) * 2 }),
    enter: (P, c) => { P(c.t, 'key', { f: 2000, th: 115, vel: 1.0 }); P(c.t + 0.035, 'key', { f: 1600, th: 95, vel: 0.6 }); },
    boot: (P, c) => {
      ns('D4 A4 D5 F#5').forEach((m, i) => P(c.t + i * 0.07, 'tone', { f0: mtof(m), dur: 1.6, at: 0.25, vel: 0.22, wave: 'triangle', cut: 2600, send: 0.5 }));
      P(c.t, 'tone', { f0: 220, f1: 880, dur: 0.5, vel: 0.1, wave: 'square', cut: 1800 });
      P(c.t + 0.55, 'bell', { m: n('D6'), vel: 0.4, dur: 2.4 });
    },
    pop: (P, c) => { P(c.t, 'tone', { f0: 380, f1: 950, dur: 0.09, vel: 0.6 }); P(c.t + 0.02, 'tone', { f0: 1400, dur: 0.05, vel: 0.15, wave: 'triangle' }); },
    whoosh: (P, c) => P(c.t, 'noise', { f0: 300, f1: 2600, f2: 600, dur: 0.6, q: 0.9, vel: 0.55, at: 0.22 }),
    land: (P, c) => { P(c.t, 'tone', { f0: 110, f1: 42, dur: 0.28, vel: 0.95, send: 0.05 }); P(c.t, 'noise', { type: 'lowpass', f0: 700, dur: 0.12, vel: 0.45 }); },
    surprise: (P, c) => { P(c.t, 'tone', { f0: 520, f1: 1250, dur: 0.12, vel: 0.32, wave: 'square', cut: 3000 }); P(c.t + 0.12, 'tone', { f0: 700, f1: 1700, dur: 0.15, vel: 0.28, wave: 'square', cut: 3000 }); },
    chapter: (P, c) => {
      P(c.t, 'tone', { f0: 58, f1: 50, dur: 2.4, vel: 0.9, send: 0.1 });
      P(c.t, 'bell', { m: n('D5'), vel: 0.55, dur: 3.6, ratio: 2.0, idx: 1.4 }); P(c.t + 0.06, 'bell', { m: n('A5'), vel: 0.35, dur: 3.2, ratio: 2.0, idx: 1.2 });
      P(c.t, 'noise', { type: 'lowpass', f0: 2400, f1: 300, dur: 1.4, vel: 0.22 });
    },
    titleHit: (P, c) => {
      P(c.t, 'kick', { vel: 1 }); P(c.t, 'noise', { type: 'highpass', f0: 6000, dur: 2.0, vel: 0.28 });
      P(c.t, 'pad', { notes: ns('D3 A3 D4 F#4 A4 E5'), dur: 0.9, at: 0.02, rel: 2.4, vel: 0.9, cut: 2600, send: 0.7 });
      P(c.t, 'bell', { m: n('D6'), vel: 0.45, dur: 3.0 }); P(c.t + 0.04, 'bell', { m: n('A6'), vel: 0.3, dur: 2.6 });
    },
    stick: (P, c) => { P(c.t, 'noise', { type: 'lowpass', f0: 1500, dur: 0.07, vel: 0.85 }); P(c.t, 'tone', { f0: 140, f1: 90, dur: 0.09, vel: 0.5 }); },
    flipNode: (P, c) => { P(c.t, 'tone', { f0: 600, f1: 1200, dur: 0.07, vel: 0.22, wave: 'square', cut: 2600 }); P(c.t + 0.04, 'bell', { m: n('E6'), vel: 0.38, dur: 1.2 }); },
    build: (P, c) => {
      ns('D5 F#5 A5 D6 F#6 A6').forEach((m, i) => P(c.t + i * 0.075, 'bell', { m, vel: 0.3, dur: 1.3, pan: (i / 5 - 0.5) * 0.8 }));
      P(c.t + 0.1, 'noise', { type: 'highpass', f0: 5000, dur: 0.7, vel: 0.14, at: 0.45 });
    },
    rezUp: (P, c) => {
      P(c.t, 'tone', { f0: 300, f1: 1600, dur: 0.45, vel: 0.2, wave: 'sawtooth', cut: 2400, q: 4 });
      P(c.t + 0.4, 'bell', { m: n('A6'), vel: 0.3, dur: 1.3 }); P(c.t + 0.4, 'tone', { f0: 1200, f1: 2400, dur: 0.15, vel: 0.1 });
    },
    statement: (P, c) => {
      P(c.t, 'tone', { f0: 73, f1: 52, dur: 2.0, vel: 0.9, send: 0.1 }); P(c.t, 'noise', { type: 'lowpass', f0: 900, f1: 120, dur: 1.3, vel: 0.4 });
      P(c.t, 'bell', { m: n('D5'), vel: 0.45, dur: 3.2, ratio: 2.0, idx: 1.2 }); P(c.t + 0.05, 'bell', { m: n('A5'), vel: 0.32, dur: 3.0, ratio: 2.0, idx: 1.0 });
    },
    climb: (P, c) => ns('A4 D5 F#5').forEach((m, i) => P(c.t + i * 0.13, 'pluck', { m, vel: 0.55, dur: 0.2, wave: 'square', cut: 2600 })),
    card: (P, c) => { P(c.t, 'noise', { f0: 1900, f1: 900, dur: 0.13, vel: 0.3 }); P(c.t + 0.02, 'pluck', { m: n('A5'), vel: 0.4, dur: 0.28 }); P(c.t + 0.08, 'pluck', { m: n('E6'), vel: 0.25, dur: 0.28 }); },
    score: (P, c) => ns('A5 D6 F#6').forEach((m, i) => P(c.t + i * 0.09, 'bell', { m, vel: 0.35, dur: 0.9 })),
    ding: (P, c) => { P(c.t, 'bell', { m: n('A5'), vel: 0.5, dur: 2.0 }); P(c.t + 0.12, 'bell', { m: n('E6'), vel: 0.35, dur: 1.8 }); },
    warn: (P, c) => { for (let i = 0; i < 4; i++) P(c.t + i * 0.17, 'tone', { f0: i % 2 ? 660 : 880, dur: 0.15, vel: 0.17, wave: 'square', cut: 1800, hold: 0.09 }); },
    hop: (P, c) => { P(c.t, 'tone', { f0: 280, f1: 640, dur: 0.12, vel: 0.4, wave: 'triangle' }); P(c.t + 0.12, 'tone', { f0: 640, f1: 360, dur: 0.1, vel: 0.22, wave: 'triangle', lin: 1 }); },
    rope: (P, c) => {
      P(c.t, 'tone', { f0: 85, f1: 96, dur: 0.6, vel: 0.22, wave: 'sawtooth', cut: 650, vib: [7, 6], at: 0.08 });
      P(c.t, 'noise', { f0: 500, dur: 0.5, vel: 0.2, q: 3 });
      P(c.t + 0.75, 'tone', { f0: 72, f1: 82, dur: 0.6, vel: 0.18, wave: 'sawtooth', cut: 550, vib: [5, 5], at: 0.08 });
    },
    shepard: (P, c) => P(c.t, 'shepard', { dur: c.dur || 6, vel: 0.6 }),
    boom: (P, c) => {
      P(c.t, 'noise', { type: 'lowpass', f0: 3600, f1: 110, dur: 2.8, vel: 1.0, q: 0.5 });
      P(c.t, 'tone', { f0: 70, f1: 27, dur: 2.2, vel: 1.0, send: 0.2 }); P(c.t, 'kick', { vel: 1 });
      P(c.t + 0.02, 'noise', { type: 'highpass', f0: 3000, dur: 1.3, vel: 0.25 });
    },
    thud: (P, c) => { P(c.t, 'tone', { f0: 92, f1: 40, dur: 0.32, vel: 0.95, send: 0.05 }); P(c.t, 'noise', { type: 'lowpass', f0: 520, dur: 0.16, vel: 0.55 }); },
    spot: (P, c) => {
      P(c.t, 'tone', { f0: 200, f1: 120, dur: 0.12, vel: 0.4 });
      P(c.t, 'noise', { f0: 600, f1: 3200, dur: 0.9, vel: 0.16, at: 0.5 }); P(c.t + 0.05, 'bell', { m: n('D6'), vel: 0.2, dur: 1.6 });
    },
    erase: (P, c) => { for (let i = 0; i < 4; i++) P(c.t + i * 0.13, 'noise', { f0: 2600 + i * 120, f1: 3400, dur: 0.11, q: 6, vel: 0.35 }); },
    sneak: (P, c) => ns('A3 C4 A3 E4').forEach((m, i) => P(c.t + i * 0.17, 'pluck', { m, vel: 0.5, dur: 0.11, wave: 'triangle', cut: 1600 })),
    rewind: (P, c) => { P(c.t, 'tone', { f0: 1400, f1: 200, dur: 0.9, vel: 0.15, wave: 'sawtooth', cut: 3000, vib: [18, 60] }); P(c.t, 'noise', { f0: 4000, f1: 800, dur: 0.9, vel: 0.2 }); },
    copy: (P, c) => { P(c.t, 'tone', { f0: 980, dur: 0.05, vel: 0.2, wave: 'square', cut: 3000 }); P(c.t + 0.07, 'tone', { f0: 1470, dur: 0.06, vel: 0.2, wave: 'square', cut: 3000 }); },
    restore: (P, c) => {
      ns('D5 F#5 A5 D6').forEach((m, i) => P(c.t + i * 0.1, 'bell', { m, vel: 0.4, dur: 2.5 }));
      P(c.t, 'pad', { notes: ns('D3 A3 F#4 A4'), dur: 1.6, at: 0.4, rel: 1.6, vel: 0.6, cut: 1800 });
    },
    whisper: (P, c) => {
      const k = c.k || 0;
      P(c.t, 'noise', { f0: 900 + k * 150, f1: 1700, dur: 0.85, q: 4, vel: 0.32, at: 0.28 });
      P(c.t, 'tone', { f0: 220 * Math.pow(2, (k * 0.7) / 12), dur: 0.85, vel: 0.05 * (1 + k), vib: [5, 4 + k * 3], at: 0.2, wave: 'triangle' });
    },
    stack: (P, c) => { for (let i = 0; i < 10; i++) P(c.t + i * 0.09, 'noise', { f0: 1700 + h(i) * 900, dur: 0.05, vel: 0.24, q: 1.5 }); },
    zoom: (P, c) => { P(c.t, 'noise', { f0: 400, f1: 3000, dur: 0.75, vel: 0.35, at: 0.5 }); P(c.t, 'tone', { f0: 300, f1: 1200, dur: 0.75, vel: 0.1, at: 0.5 }); },
    tick: (P, c) => { P(c.t, 'tone', { f0: 2200, dur: 0.03, vel: 0.25 }); P(c.t, 'noise', { type: 'highpass', f0: 4000, dur: 0.02, vel: 0.2 }); },
    loopClose: (P, c) => {
      P(c.t, 'tone', { f0: 300, f1: 900, dur: 0.6, vel: 0.22, at: 0.4 });
      P(c.t + 0.6, 'key', { f: 1500, th: 220, vel: 1.0 }); P(c.t + 0.6, 'tone', { f0: 90, f1: 58, dur: 0.32, vel: 0.6 }); P(c.t + 0.62, 'bell', { m: n('D6'), vel: 0.3, dur: 1.4 });
    },
    peel: (P, c) => {
      P(c.t, 'noise', { f0: 1500, f1: 5000, dur: 0.5, vel: 0.35, q: 2, at: 0.05 });
      for (let i = 0; i < 6; i++) P(c.t + 0.05 + i * 0.06, 'noise', { type: 'highpass', f0: 4000, dur: 0.015, vel: 0.2 });
    },
  });

  // ---------------------------------------------------------------- music
  const CH = {
    Dmaj9: ['D2', 'F#3 A3 C#4 E4'], Bm9: ['B1', 'D3 F#3 A3 C#4'], Gmaj9: ['G1', 'B2 D3 F#3 A3'], A13sus: ['A1', 'D3 G3 B3 E4'],
    D: ['D2', 'D3 F#3 A3 D4'], Bm: ['B1', 'D3 F#3 B3 D4'], G: ['G1', 'D3 G3 B3 D4'], A: ['A1', 'C#3 E3 A3 C#4'],
    Dm: ['D2', 'D3 F3 A3 D4'], Bb: ['Bb1', 'D3 F3 Bb3 D4'], Gm: ['G1', 'D3 G3 Bb3 D4'], A7: ['A1', 'C#3 E3 G3 A3'],
    Gmaj7: ['G1', 'B2 D3 F#3 B3'], Fsm: ['F#1', 'C#3 F#3 A3 C#4'], Em7: ['E2', 'D3 G3 B3 E4'],
  };
  const chord = (k) => ({ b: n(CH[k][0]), v: ns(CH[k][1]) });
  const PENTA = ns('D5 E5 F#5 A5 B5 D6');
  function grid(sec, bpm, fn) { const bd = 60 / bpm, bar = bd * 4; let i = 0; for (let tb = sec.t0; tb < sec.t1 - 0.05; tb += bar, i++) fn(i, tb, bd, bar); }
  const scene = (id) => RSI.scenes.find((s) => s.id === id);
  const cueT = (type, after = 0) => { const c = RSI.cues.find((x) => x.type === type && x.t >= after); return c ? c.t : null; };
  const STY = (AU.STY = {});
  STY.ambient = (sec, P, r) => grid(sec, 64, (i, tb, bd, bar) => {
    const ch = chord(['Dmaj9', 'Bm9', 'Gmaj9', 'A13sus'][Math.floor(i / 2) % 4]);
    if (i % 2 === 0) { P(tb, 'pad', { notes: ch.v, dur: bar * 2, vel: 0.4, cut: 950, at: 2.4, rel: 3.0 }); P(tb, 'drone', { m: ch.b + 12, dur: bar * 2, vel: 0.32, at: 2.0 }); }
    for (let b = 0; b < 4; b++) if (r() < 0.3 && tb + b * bd > sec.t0 + 2.6) P(tb + b * bd + (r() < 0.5 ? bd / 2 : 0), 'bell', { m: pick(r, PENTA), vel: 0.16 + r() * 0.12, dur: 3.0, pan: (r() - 0.5) * 0.8 });
  });
  STY.title = (sec, P, r) => grid(sec, 120, (i, tb, bd, bar) => {
    const ch = chord(['Dmaj9', 'Bm9', 'Gmaj9', 'A13sus', 'Dmaj9'][i] || 'Dmaj9');
    P(tb, 'pad', { notes: ch.v, dur: bar, vel: 0.5, cut: 1700, at: 0.25, rel: 1.4 });
    P(tb, 'bass', { m: ch.b + 12, dur: bar * 0.9, vel: 0.6 });
    const arp = ch.v.concat(ch.v.map((m) => m + 12));
    for (let s = 0; s < 16; s++) P(tb + (s * bd) / 4, 'pluck', { m: arp[s % 8] + 12, vel: 0.26 + (s % 4 === 0 ? 0.14 : 0), dur: 0.22, wave: 'square', cut: 2600, pan: ((s % 8) / 7 - 0.5) * 0.6 });
    for (let b = 0; b < 4; b++) { if (i > 0 || b > 0) P(tb + b * bd, 'kick', { vel: 0.5 }); P(tb + b * bd + bd / 2, 'hat', { vel: 0.32, off: r() }); }
    P(tb + bd, 'snare', { vel: 0.35 }); P(tb + 3 * bd, 'snare', { vel: 0.38 });
  });
  STY.lofi = (sec, P, r) => grid(sec, 86, (i, tb, bd, bar) => {
    const ch = chord(['Dmaj9', 'Bm9', 'Gmaj9', 'A13sus'][i % 4]); const id = sec.idAt(tb + 0.01);
    const sw = (x) => x + ((Math.round(x * 2) % 2) ? 0.1 : 0);
    const drums = id !== 'good' && id !== 'ch1';
    P(tb, 'pad', { notes: ch.v, dur: bar, vel: 0.2, cut: 800, at: 0.6, rel: 1.0, wave: 'triangle' });
    ch.v.forEach((m, k) => {
      P(tb + k * 0.012, 'ep', { m, dur: bd * 2.2, vel: 0.42 + r() * 0.08, pan: (k - 1.5) * 0.15 });
      P(tb + sw(2.5) * bd + k * 0.012, 'ep', { m, dur: bd * 1.2, vel: 0.24, pan: (k - 1.5) * 0.15 });
    });
    P(tb, 'bass', { m: ch.b + 12, dur: bd * 1.6, vel: 0.62 }); P(tb + sw(2.5) * bd, 'bass', { m: ch.b + 12, dur: bd * 0.8, vel: 0.45 }); P(tb + 3.5 * bd, 'bass', { m: ch.b + 19, dur: bd * 0.45, vel: 0.32 });
    if (drums) {
      P(tb, 'kick', { vel: 0.7 }); P(tb + sw(2.5) * bd, 'kick', { vel: 0.55 }); if (r() < 0.4) P(tb + sw(3.5) * bd, 'kick', { vel: 0.38 });
      P(tb + bd, 'snare', { vel: 0.4, f: 1700 }); P(tb + 3 * bd, 'snare', { vel: 0.42, f: 1700 });
      for (let e = 0; e < 8; e++) P(tb + sw(e / 2) * bd, 'hat', { vel: e % 2 ? 0.2 : 0.32, off: r() });
    }
    for (let c = 0; c < 6; c++) P(tb + r() * bar, 'crackle', { vel: 0.2 + r() * 0.4, f: 2000 + r() * 4000, off: r() * 2, pan: r() - 0.5 });
    if ((id === 'lab' || id === 'flip' || id === 'compound') && i % 2 === 1) {
      const mel = [ns('A5 F#5 E5'), ns('B5 A5 F#5'), ns('D6 B5 A5'), ns('E5 F#5 A5')][Math.floor(i / 2) % 4];
      mel.forEach((m, k) => P(tb + (k * 0.75 + 0.5) * bd, 'bell', { m, vel: 0.2, dur: 1.6, pan: 0.2 }));
    }
  });
  STY.build = (sec, P, r) => grid(sec, 104, (i, tb, bd, bar) => {
    const prog = Math.floor(i / 8) % 2 ? ['Bm', 'G', 'D', 'A'] : ['D', 'Bm', 'G', 'A'];
    const ch = chord(prog[i % 4]); const id = sec.idAt(tb + 0.01);
    const L = { ch2: 0, ladder: 0, r1: 1, r2: 2, r3: 3, r4: 4, r5: 5, top: 1 }[id]; const lv = L == null ? 1 : L;
    P(tb, 'pad', { notes: ch.v, dur: bar, vel: 0.3 + lv * 0.03, cut: 900 + lv * 200, at: 0.4, rel: 1.2 });
    const arp = ch.v.map((m) => m + 12), pat = [0, 1, 2, 3, 2, 1, 3, 2], steps = lv >= 3 ? 16 : 8;
    for (let s = 0; s < steps; s++) P(tb + (s * bar) / steps, 'pluck', { m: arp[pat[s % 8]] + (lv >= 4 && s % 8 === 7 ? 12 : 0), vel: 0.2 + (s % 4 === 0 ? 0.1 : 0), dur: 0.22, wave: 'triangle', wave2: lv >= 2 ? 'square' : null, cut: 2000 + lv * 300, pan: s % 2 ? 0.25 : -0.25 });
    if (lv >= 1) for (let b = 0; b < 4; b++) if (lv >= 3 || b % 2 === 0) P(tb + b * bd, 'kick', { vel: 0.58 });
    if (lv >= 2) for (let e = 0; e < 8; e++) P(tb + (e * bd) / 2, 'bass', { m: ch.b + 12, dur: bd * 0.42, vel: e % 2 ? 0.38 : 0.52, cut: 520 + lv * 80 });
    if (lv >= 3) for (let e = 1; e < 8; e += 2) P(tb + (e * bd) / 2, 'hat', { vel: 0.3, off: r() });
    if (lv >= 4) { P(tb + bd, 'snare', { vel: 0.42 }); P(tb + 3 * bd, 'snare', { vel: 0.44 }); }
    if (lv >= 5 || (lv === 4 && i % 4 >= 2)) {
      const tones = ch.v.map((m) => m + 24); [0, 0.75, 1.5, 2, 3].forEach((b) => { if (r() < 0.8) P(tb + b * bd, 'bell', { m: pick(r, tones), vel: 0.22, dur: 1.2, pan: (r() - 0.5) * 0.5 }); });
    }
  });
  STY.tension = (sec, P, r) => grid(sec, 112, (i, tb, bd, bar) => {
    const ch = chord(['Bm', 'G', 'D', 'A'][i % 4]); const id = sec.idAt(tb + 0.01);
    const L = { ch3: 0, tree: 1, ratio: 2, debate: 1, walls: 3 }[id]; const lv = L == null ? 1 : L;
    if (i % 2 === 0) P(tb, 'drone', { m: n('B1'), dur: bar * 2, vel: 0.45, at: 0.8 });
    P(tb, 'pad', { notes: ch.v, dur: bar, vel: 0.28, cut: 700 + lv * 160, at: 0.3, rel: 0.9 });
    for (let e = 0; e < 8; e++) P(tb + (e * bd) / 2, 'pluck', { m: ch.b + 24, vel: e % 2 ? 0.28 : 0.42, dur: 0.16, wave: 'sawtooth', cut: 900 + lv * 220, q: 3 });
    for (let s = 0; s < 16; s++) P(tb + (s * bd) / 4, 'hat', { vel: s % 4 === 0 ? 0.28 : 0.13, dur: 0.03, f: 9000, off: r(), pan: 0.3 });
    if (lv >= 2) { P(tb, 'kick', { vel: 0.6 }); P(tb + 2 * bd, 'kick', { vel: 0.58 }); }
    if (lv >= 3) { P(tb + bd, 'snare', { vel: 0.4 }); P(tb + 3 * bd, 'snare', { vel: 0.42 }); P(tb + 1.5 * bd, 'kick', { vel: 0.4 }); }
    if (lv >= 1 && i % 4 === 3) for (let k = 0; k < 4; k++) P(tb + (3 + k / 4) * bd, 'tone', { f0: 190 - k * 22, f1: 95 - k * 10, dur: 0.2, vel: 0.32, send: 0.2 });
  });
  STY.quirky = (sec, P, r) => {
    const col = scene('collapse'), tel = scene('telephone');
    const rest = col ? cueT('restore', col.start) : null;
    const p0 = col ? col.start + 4 : 0, p1 = rest || (col ? col.start + col.dur : 0);
    const scale = ns('D5 E5 F5 G5 A5 Bb5 C#6 D6');
    grid(sec, 96, (i, tb, bd, bar) => {
      const k = ['Dm', 'Bb', 'Gm', 'A7'][i % 4], ch = chord(k), id = sec.idAt(tb + 0.01);
      const root = ch.b + 12;
      [0, 1, 2, 3].forEach((b) => P(tb + b * bd, 'pluck', { m: b % 2 ? root + 7 : root, vel: 0.5, dur: 0.14, wave: 'triangle', cut: 1200 }));
      [0.5, 1.5, 2.5, 3.5].forEach((b, j) => P(tb + b * bd, 'wood', { f: j % 2 ? 1250 : 900, vel: 0.32, pan: j % 2 ? 0.3 : -0.3 }));
      if (id !== 'ch4') { P(tb, 'kick', { vel: 0.45 }); P(tb + 2 * bd, 'snare', { vel: 0.3, f: 2600, dur: 0.08 }); }
      if (i % 2 === 0) P(tb, 'pad', { notes: ch.v, dur: bar * 2, vel: 0.2, cut: 800, at: 0.5, rel: 1.0, wave: 'triangle' });
      let div = 0; if (id === 'collapse' && tb >= p0 && tb < p1) div = M.clamp((tb - p0) / Math.max(1, p1 - p0 - 2));
      const det = id === 'telephone' && tel ? M.clamp((tb - tel.start) / tel.dur) * 50 : 0;
      const tones = scale.filter((m) => ch.v.some((c) => (m - c) % 12 === 0)).concat(pick(r, scale));
      [0, 0.5, 1.5, 2, 2.75, 3.5].forEach((b) => {
        if (r() < 0.28) return;
        let m = pick(r, tones); if (div > 0) m = Math.round(M.lerp(m, n('A5'), M.ease.inQuad(div)));
        P(tb + b * bd, 'bell', { m, ratio: 4.0, idx: 1.3 * (1 - div * 0.85), dur: 0.5, vel: 0.27, pan: (r() - 0.5) * 0.6, det: (r() - 0.5) * det * 2 });
      });
    });
  };
  STY.reflect = (sec, P, r) => grid(sec, 100, (i, tb, bd, bar) => {
    const ch = chord(['Gmaj7', 'A', 'Fsm', 'Bm9'][i % 4]); const id = sec.idAt(tb + 0.01);
    ch.v.forEach((m, k) => P(tb + k * 0.015, 'ep', { m, dur: bd * 3.4, vel: 0.36, pan: (k - 1.5) * 0.15 }));
    P(tb, 'bass', { m: ch.b + 12, dur: bd * 1.8, vel: 0.55 }); P(tb + 2 * bd, 'bass', { m: ch.b + 12, dur: bd * 1.5, vel: 0.44 });
    if (id !== 'ch5') {
      P(tb, 'kick', { vel: 0.48 }); P(tb + 2 * bd, 'kick', { vel: 0.42 });
      P(tb + bd, 'wood', { f: 1800, vel: 0.22 }); P(tb + 3 * bd, 'wood', { f: 1800, vel: 0.22 });
      for (let e = 0; e < 8; e++) P(tb + (e * bd) / 2, 'hat', { vel: e % 2 ? 0.14 : 0.2, off: r() });
    }
    if (id === 'history') for (let b = 0; b < 4; b++) P(tb + b * bd, 'tone', { f0: 2400, dur: 0.03, vel: 0.1, send: 0.1 });
    if ((id === 'today' || id === 'forecasts') && i % 2 === 0) {
      const tones = ch.v.map((m) => m + 24); [0.5, 1.5, 2.25, 3].forEach((b) => { if (r() < 0.75) P(tb + b * bd, 'bell', { m: pick(r, tones), vel: 0.17, dur: 1.8, pan: (r() - 0.5) * 0.5 }); });
    }
  });
  STY.epilogue = (sec, P, r) => {
    const perm = scene('permission'); const hb0 = perm ? perm.start + perm.R('e2') : 1e9, hb1 = perm ? perm.start + perm.dur : 0;
    grid(sec, 70, (i, tb, bd, bar) => {
      const ch = chord(['Bm9', 'Gmaj9', 'Dmaj9', 'A13sus'][i % 4]); const id = sec.idAt(tb + 0.01);
      P(tb, 'pad', { notes: ch.v, dur: bar, vel: id === 'reveal' ? 0.46 : 0.36, cut: id === 'reveal' ? 1400 : 850, at: 1.2, rel: 2.0 });
      if (i % 2 === 0) P(tb, 'drone', { m: n('D2'), dur: bar * 2, vel: 0.32 });
      if (tb >= hb0 - 0.01 && tb < hb1) for (const b of [0, 2]) { P(tb + b * bd, 'kick', { vel: 0.32 }); P(tb + b * bd + 0.26, 'kick', { vel: 0.2 }); }
      const tones = ch.v.map((m) => m + 24);
      for (let b = 0; b < 4; b++) if (r() < 0.4) P(tb + b * bd + (r() < 0.3 ? bd / 2 : 0), 'bell', { m: pick(r, tones), vel: 0.15, dur: 2.4, ratio: 2.0, idx: 1.0, pan: (r() - 0.5) * 0.6 });
    });
  };
  STY.outro = (sec, P, r) => {
    const prog = ['Dmaj9', 'Bm9', 'Gmaj9', 'A13sus', 'Dmaj9', 'Bm9', 'Gmaj9', 'A13sus', 'Gmaj9', 'A13sus', 'Gmaj9', 'A13sus', 'Dmaj9'];
    grid(sec, 76, (i, tb, bd, bar) => {
      const k = prog[Math.min(i, prog.length - 1)], ch = chord(k), last = i >= 12;
      P(tb, 'pad', { notes: ch.v, dur: last ? bar * 1.2 : bar, vel: i >= 10 ? 0.3 : 0.4, cut: 1200, at: 0.8, rel: last ? 3.0 : 1.8 });
      if (i < 10) P(tb, 'bass', { m: ch.b + 12, dur: bd * 3.5, vel: 0.45 });
      if (i < 8) { const arp = ch.v.concat([ch.v[1] + 12, ch.v[2] + 12]); for (let s = 0; s < 8; s++) P(tb + (s * bd) / 2, 'ep', { m: arp[s % arp.length] + 12, dur: 0.7, vel: 0.2 + (s % 4 === 0 ? 0.06 : 0), pan: (s / 7 - 0.5) * 0.5 }); }
      else if (i < 12) { if (r() < 0.8) P(tb + bd, 'bell', { m: ch.v[2] + 24, vel: 0.15, dur: 3.0, ratio: 2.0, idx: 1.0 }); }
      if (last) { P(tb, 'bell', { m: n('D6'), vel: 0.35, dur: 4.0, ratio: 2.0, idx: 1.2 }); P(tb + 0.08, 'bell', { m: n('A6'), vel: 0.22, dur: 3.6, ratio: 2.0, idx: 1.0 }); P(tb, 'drone', { m: n('D2'), dur: bar, vel: 0.35, at: 0.6 }); }
    });
  };

  // ---------------------------------------------------------------- voices & typing
  const VOICE = {
    clawd: { f: 620, wave: 'square', cut: 2600 }, clawd2: { f: 720, wave: 'square', cut: 3000 }, clawd3: { f: 830, wave: 'square', cut: 3200 },
    left: { f: 330, wave: 'triangle', cut: 1900 }, right: { f: 470, wave: 'sawtooth', cut: 1500 }, monster: { f: 190, wave: 'sawtooth', cut: 900 }, human: { f: 400, wave: 'triangle', cut: 2000 },
  };
  const PUNCT = /[\s，。！？、；：“”‘’（）《》…—,.!?;:'"()\-–>]/;
  function lineEvents(P) {
    for (const sc of RSI.scenes) for (const ln of sc.lines) {
      const V = VOICE[ln.who]; if (!V && ln.who !== 'sys') continue;
      const text = Array.from(T.plain(RSI.L(ln))); const rate = RSI.lineRate(ln); const t0 = sc.start + ln.t;
      if (V) {
        const q = /[？?]\s*$/.test(text.join('')); let k = 0;
        text.forEach((ch, i) => {
          if (PUNCT.test(ch)) return; if (/[A-Za-z0-9]/.test(ch) && (k++ % 2)) return;
          const tt = t0 + i / rate; if (tt > t0 + ln.dur - 0.1) return;
          const hh = M.hash(ch.codePointAt(0) * 0.37 + i * 0.11);
          const semi = (hh - 0.5) * 6 + (q && i > text.length - 5 ? 3 : 0);
          P(tt, 'blip', { f: V.f * Math.pow(2, semi / 12), wave: V.wave, cut: V.cut, vel: 0.45 + hh * 0.25, dur: 0.05 + hh * 0.02 }, 'voice');
        });
      } else {
        text.forEach((ch, i) => { if (/\s/.test(ch)) return; const tt = t0 + i / rate; if (tt > t0 + ln.dur) return; const hh = M.hash(i * 3.1 + t0); P(tt, 'key', { f: 2400 + hh * 1800, th: 140 + hh * 70, vel: 0.32 + hh * 0.2, off: hh * 2 }, 'sfx'); });
      }
    }
  }

  // ---------------------------------------------------------------- event list
  AU.build = () => {
    const ev = [];
    const P0 = (t, f, a, bus) => { if (!I[f]) throw new Error('no instrument ' + f); ev.push({ t, f, a: Object.assign({ bus }, a) }); };
    const secs = [];
    for (const sc of RSI.scenes) {
      const k = sc.music || 'ambient', last = secs[secs.length - 1];
      if (last && last.k === k) { last.t1 = sc.start + sc.dur; last.sc.push(sc); } else secs.push({ k, t0: sc.start, t1: sc.start + sc.dur, sc: [sc] });
    }
    const mutes = RSI.cues.filter((c) => c.type === 'boom').map((c) => [c.t - 0.15, c.t + 2.4]);
    for (const sec of secs) {
      sec.idAt = (t) => { let id = sec.sc[0].id; for (const s of sec.sc) if (s.start <= t) id = s.id; return id; };
      const r = M.rng(hashStr(sec.k) ^ Math.floor(sec.t0 * 10));
      const sg = AU.secGain[sec.k] || 1;
      const P = (t, f, a) => { if (t < sec.t0 - 0.001 || t >= sec.t1 - 0.05) return; for (const m of mutes) if (t >= m[0] && t < m[1]) return; P0(t, f, Object.assign({}, a, { g: (a.g || 1) * sg }), 'music'); };
      (STY[sec.k] || STY.ambient)(sec, P, r);
    }
    AU.sections = secs.map((s) => ({ k: s.k, t0: s.t0, t1: s.t1 }));
    for (const c of RSI.cues) (SFX[c.type] || SFX.pop)((t, f, a) => P0(t, f, a, 'sfx'), c);
    lineEvents(P0);
    ev.sort((a, b) => a.t - b.t);
    AU.events = ev;
    return ev.length;
  };
  const lower = (t) => { const E = AU.events; let lo = 0, hi = E.length; while (lo < hi) { const m = (lo + hi) >> 1; if (E[m].t < t) lo = m + 1; else hi = m; } return lo; };

  // ---------------------------------------------------------------- live playback
  let ac = null, G = null, timer = 0, playing = false, t0 = 0, c0 = 0, idx = 0;
  AU.init = () => {
    if (!AU.events) AU.build();
    if (ac) return;
    try { ac = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'playback' }); } catch (e) { ac = null; }
  };
  AU.ok = () => !!ac && playing && ac.state === 'running';
  AU.time = () => t0 + Math.max(0, ac.currentTime - c0);
  AU.play = (t) => {
    if (!ac) return; AU.stop();
    if (ac.state === 'suspended') ac.resume();
    G = graph(ac, ac.destination, { live: true });
    t0 = t; c0 = ac.currentTime + 0.1; playing = true; idx = lower(t);
    const g = G;
    const tick = () => {
      if (g !== G) return;
      const horizon = t0 + (ac.currentTime - c0) + 0.4;
      while (idx < AU.events.length && AU.events[idx].t < horizon) {
        const e = AU.events[idx++]; const ct = c0 + (e.t - t0);
        if (ct < ac.currentTime - 0.02) continue;
        try { I[e.f](g, Math.max(ct, ac.currentTime + 0.005), e.a); } catch (err) { /* skip */ }
      }
    };
    tick(); timer = setInterval(tick, 50);
  };
  AU.stop = () => {
    if (timer) clearInterval(timer); timer = 0; playing = false;
    if (G && ac) { const g = G; G = null; try { g.master.gain.setTargetAtTime(0, ac.currentTime, 0.03); } catch (e) { /* */ } setTimeout(() => { try { g.master.disconnect(); if (g.comp) g.comp.disconnect(); } catch (e) { /* */ } }, 400); }
  };

  // ---------------------------------------------------------------- offline rendering
  /** render events starting in [a,b) into a buffer covering [a, b+tail]. stem: 'music'|'sfx'|'voice'|undefined */
  AU.renderChunk = async (a, b, tail, sr, stem) => {
    if (!AU.events) AU.build();
    const len = Math.ceil((b - a + tail) * sr), oc = new OfflineAudioContext(2, len, sr), g = graph(oc, oc.destination, {});
    let k = 0;
    for (let i = lower(a); i < AU.events.length && AU.events[i].t < b; i++) { const e = AU.events[i]; if (stem && e.a.bus !== stem) continue; I[e.f](g, e.t - a, e.a); k++; }
    const buf = await oc.startRendering();
    return { buf, k };
  };
  AU.renderChunkB64 = async (a, b, tail, sr, stem) => {
    const { buf, k } = await AU.renderChunk(a, b, tail, sr, stem);
    const L = buf.getChannelData(0), R = buf.getChannelData(1), f = new Float32Array(L.length * 2);
    for (let i = 0; i < L.length; i++) { f[2 * i] = L[i]; f[2 * i + 1] = R[i]; }
    const u = new Uint8Array(f.buffer); let s = ''; const CH = 0x8000;
    for (let i = 0; i < u.length; i += CH) s += String.fromCharCode.apply(null, u.subarray(i, i + CH));
    return { b64: btoa(s), k, len: L.length };
  };
  AU.stats = () => { const c = {}; for (const e of AU.events) c[e.f] = (c[e.f] || 0) + 1; return { n: AU.events.length, c, sections: AU.sections }; };
})();
