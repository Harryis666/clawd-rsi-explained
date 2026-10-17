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
    /** v3.1: chain of biquads [type, Hz, Q, dB] → `to`; returns the chain input */
    const eq = (spec, to) => {
      const ns = spec.map(([type, f, q, db]) => { const b = ac.createBiquadFilter(); b.type = type; b.frequency.value = f; if (q != null) b.Q.value = q; if (db != null) b.gain.value = db; return b; });
      ns.reduce((x, y) => { x.connect(y); return y; }).connect(to); return ns[0];
    };
    const bus = (v, spec) => { const g = ac.createGain(); g.gain.value = v; g.connect(spec ? eq(spec, G.master) : G.master); return g; };
    G.mduck = ac.createGain(); G.mduck.connect(eq(AU.eq.music, G.master)); // music-only ducking (record-scratch stops, freeze frames) → v3.1 warm EQ
    G.music = ac.createGain(); G.music.gain.value = AU.mix.music; G.music.connect(G.mduck);
    // v3.1 bass bus: gentle asymmetric saturation adds 2nd/3rd harmonics, so the bass line is still heard on phone speakers
    G.mbass = ac.createGain(); G.mbass.gain.value = AU.bass.drive;
    const ws = ac.createWaveShaper(); ws.curve = satCurve(); ws.oversample = '2x';
    const bo = ac.createGain(); bo.gain.value = AU.bass.level / AU.bass.drive; G.mbass.connect(ws); ws.connect(bo); bo.connect(G.music);
    G.sfx = bus(AU.mix.sfx, AU.eq.sfx); G.voice = bus(AU.mix.voice, AU.eq.voice);
    G.verb = ac.createConvolver(); G.verb.normalize = true; G.verb.buffer = irBuf(ac);
    const vo = ac.createGain(); vo.gain.value = AU.mix.verb; G.verb.connect(vo); vo.connect(eq(AU.eq.verb, G.master));
    G.mverb = ac.createConvolver(); G.mverb.normalize = true; G.mverb.buffer = irBuf(ac);
    const mvo = ac.createGain(); mvo.gain.value = AU.mix.verb; G.mverb.connect(mvo); mvo.connect(eq(AU.eq.verb, G.mduck));
    // v3.2 echo: a dark dotted-eighth delay (band-limited feedback) — gives the softer recap 筝 a little space
    const E = AU.echo; G.mecho = ac.createDelay(2); G.mecho.delayTime.value = E.time;
    const ehp = lp(G, E.hp, 0.5, 'highpass'), elp = lp(G, E.lp, 0.5), efb = gainNode(G, E.fb), eo = gainNode(G, E.level);
    G.mecho.connect(ehp); ehp.connect(elp); elp.connect(efb); efb.connect(G.mecho); elp.connect(eo); eo.connect(G.music);
    G.noise = noiseBuf(ac);
    return G;
  }
  /** soft asymmetric tanh curve (unity small-signal gain) for the bass bus */
  function satCurve() {
    if (satCurve.c) return satCurve.c;
    const N = 4096, c = new Float32Array(N), k = AU.bass.sat, b = 0.12, y0 = Math.tanh(b), s = k * (1 - y0 * y0);
    for (let i = 0; i < N; i++) { const x = (i / (N - 1)) * 2 - 1; c[i] = (Math.tanh(k * x + b) - y0) / s; }
    return (satCurve.c = c);
  }
  AU.mix = { music: 0.5, sfx: 0.7, voice: 0.6, verb: 0.55 };
  /** v3.1 warm mix (feedback: 降一点中高频、适当提升低频，更柔和不烧心). Per-bus EQ: [type, Hz, Q, dB] */
  AU.eq = {
    music: [['highpass', 28, 0.7], ['lowshelf', 150, null, 2.5], ['peaking', 3000, 0.9, -2.5], ['highshelf', 7000, null, -1]],
    sfx: [['peaking', 3200, 0.9, -2]],
    voice: [['peaking', 1900, 1.2, -3], ['highshelf', 6000, null, -1.5]], // the square-wave babble's 3rd harmonic sits at ~1.6–2.2 kHz
    verb: [['highpass', 180, 0.7], ['lowpass', 4500, 0.6]], // darker, less muddy reverb returns
  };
  /** v3.1 bass: sub-octave sine level (re the main bass layer), bus drive into the saturator, saturation amount, output level */
  AU.bass = { sub: 0.6, drive: 3, sat: 1.6, level: 1.0 };
  /** v3.1 BGM softening, applied to every music event in AU.build (SFX and voices keep their own settings) */
  AU.soft = { cut: 0.78, q: 1.6, bell: 0.75, ep: 0.85, zheng: [0.5, 3200], wood: [0.8, 0.8], crackle: 0.75, snare: 0.85, hat: 0.9, tick: 1700 };
  /** v3.2 recap 筝 (feedback: 高频刺耳 → 降高频、略提中低频、加一点谐波和回声): bright, cut, warm dB (+400 Hz / −1.5× above 2.2 kHz), harm, echo, reverb send */
  AU.soft.zheng = [0.42, 3000, 3, 0.3, 0.26, 0.34];
  AU.soft.clap = 1150;
  /** v3.2 music echo bus: dotted eighth at 96 BPM (the story tempo), dark band-limited repeats */
  AU.echo = { time: 0.469, fb: 0.3, lp: 2200, hp: 260, level: 0.8 };
  AU.voiceTone = { cut: 0.75, q: 1.0 }; // character "babble": lower, less resonant filter (v3: cut ×1, Q 2.5)
  function soften(f, a) {
    const S = AU.soft;
    if (f === 'pluck') { a.cut = (a.cut || 3200) * S.cut; a.q = Math.min(a.q || 1.2, S.q); if (a.wave2 === 'square') a.wave2 = 'triangle'; }
    else if (f === 'bell') a.idx = (a.idx == null ? 2.0 : a.idx) * S.bell;
    else if (f === 'ep') a.idx = (a.idx || 1.5) * S.ep;
    else if (f === 'zheng') {
      const z = S.zheng; a.bright = Math.min(a.bright || 0.62, z[0]); a.cut = Math.min(a.cut || 5200, z[1]);
      if (a.warm == null) a.warm = z[2]; if (a.harm == null) a.harm = z[3]; if (a.echo == null) a.echo = z[4]; if (a.send == null) a.send = z[5];
    }
    else if (f === 'clap') a.f = Math.min(a.f || 1300, S.clap);
    else if (f === 'wood') { a.f = (a.f || 880) * S.wood[0]; a.vel = (a.vel == null ? 0.5 : a.vel) * S.wood[1]; }
    else if (f === 'crackle') a.vel = (a.vel == null ? 0.3 : a.vel) * S.crackle;
    else if (f === 'snare') a.f = (a.f || 1900) * S.snare;
    else if (f === 'hat') a.vel = (a.vel == null ? 0.4 : a.vel) * S.hat;
    else if (f === 'tone' && !a.f1 && a.f0 > S.tick) a.f0 = S.tick + (a.f0 - S.tick) * 0.25; // high ticks → lower, rounder ticks
    return a;
  }
  /** per-style loudness trims (calibrated from tools/render-audio.mjs loudness reports) */
  // v3.1 re-calibration (keeps each section within ~1 LU of v3): the new bass lines made tension / epilogue louder (×0.9 / ×0.82),
  // the softer timbres made story / tease / outro quieter (×1.24 / ×1.21 / ×1.12); softer wood blocks and ticks did the same to two cold opens
  AU.hookGain = { split: 1.25, tense: 1.18 };
  AU.secGain = { ambient: 1.4, title: 0.89, lofi: 1, build: 1, tension: 1.3, quirky: 2.2, reflect: 1.06, epilogue: 1.02, outro: 1.19, story: 1.2, tease: 1.15, hook: 1.0, none: 1,
    brain: 0.98, eureka: 1.02, groove: 1.08, stairs: 1.21, retro: 1.2 }; // v3.2: EP1 re-score styles (≈ the old quirky/lofi level, −27.8 LUFS music stem); story 1.36 → 1.2 (the warmer 筝 is fuller) // calibrated from audio_v1 per-section RMS (tools/render-audio.mjs loudness report)
  function out(G, node, a, send, pan) {
    let x = node; const ac = G.ac;
    if (pan) { const p = ac.createStereoPanner(); p.pan.value = M.clamp(pan, -1, 1); x.connect(p); x = p; }
    x.connect(G[a.bus || 'music']);
    const s = a.send != null ? a.send : send;
    if (s > 0) { const g = ac.createGain(); g.gain.value = s; x.connect(g); g.connect(!a.bus || a.bus === 'music' ? G.mverb : G.verb); }
    if (a.echo > 0 && G.mecho) { const g = ac.createGain(); g.gain.value = a.echo; x.connect(g); g.connect(G.mecho); }
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
    const hp = lp(G, a.hp || 110, 0.6, 'highpass'); f.connect(hp); hp.connect(g); out(G, g, a, 0.6, a.pan);
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
  I.bass = (G, t, a) => { // v3.1: round mid layer (sine + triangle, low-passed) + clean sub-octave sine → saturating bass bus
    const f0 = mtof(a.m), v = V(a, 0.6) * 0.12, dur = Math.max(0.08, a.dur || 0.5), end = t + dur + 0.3;
    const o = osc(G, 'sine', f0, t, end), o2 = osc(G, 'triangle', f0, t, end), c = a.cut || 650, f = lp(G, c, 0.8);
    f.frequency.setValueAtTime(c, t); f.frequency.exponentialRampToValueAtTime(Math.max(140, c * 0.4), t + dur);
    const g2 = gainNode(G, 0.55); o2.connect(g2); g2.connect(f); o.connect(f);
    const g = G.ac.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.012); g.gain.setTargetAtTime(v * 0.65, t + 0.012, 0.15); g.gain.setTargetAtTime(0, t + dur, 0.05);
    f.connect(g);
    const sub = a.sub == null ? AU.bass.sub : a.sub;
    if (sub > 0) { const os = osc(G, 'sine', f0 / 2, t, end), gs = gainNode(G, sub); os.connect(gs); gs.connect(g); }
    if (G.mbass && (!a.bus || a.bus === 'music')) g.connect(G.mbass); else out(G, g, a, 0.04);
  };
  I.kick = (G, t, a) => {
    const v = V(a, 0.8) * 0.3, end = t + 0.6; // v3.1: 140→48→38 Hz, longer body, click 0.22 → 0.12
    const o = osc(G, 'sine', 140, t, end); o.frequency.exponentialRampToValueAtTime(48, t + 0.1); o.frequency.exponentialRampToValueAtTime(38, t + 0.45);
    const g = G.ac.createGain(); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(v * 0.5, t + 0.09); g.gain.exponentialRampToValueAtTime(EMIN, t + 0.5);
    o.connect(g); out(G, g, a, 0.02);
    const s = noiseSrc(G, t, t + 0.03, a.off), f = lp(G, 1600, 0.7, 'highpass'), gc = G.ac.createGain();
    gc.gain.setValueAtTime(v * 0.12, t); gc.gain.exponentialRampToValueAtTime(EMIN, t + 0.016); s.connect(f); f.connect(gc); out(G, gc, a, 0);
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
    for (const [mul, det, k, w] of [[1, 0, 1, 'sine'], [2, 5, 0.3, 'triangle'], [3, -4, 0.08, 'triangle']].concat(a.sub ? [[0.5, 0, a.sub, 'sine']] : [])) {
      const o = osc(G, w, mtof(a.m) * mul, t, end); o.detune.value = det; const gk = gainNode(G, k); o.connect(gk); gk.connect(g);
    }
    out(G, g, a, 0.2);
  };
  I.blip = (G, t, a) => { // character voice syllable
    const dur = a.dur || 0.06, v = V(a, 0.5) * 0.1, end = t + dur + 0.03;
    const o = osc(G, a.wave || 'square', a.f, t, end); o.frequency.exponentialRampToValueAtTime(a.f * (a.glide || 0.92), t + dur);
    const f = lp(G, (a.cut || 2400) * AU.voiceTone.cut, AU.voiceTone.q), g = G.ac.createGain();
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
  function ksBuf(ac, f, dur, bright) { // Karplus–Strong plucked string with fractional-delay tuning
    const cache = ac._ks || (ac._ks = new Map()); const key = f.toFixed(2) + '|' + dur + '|' + bright;
    let b = cache.get(key); if (b) return b;
    const sr = ac.sampleRate, len = Math.ceil(sr * dur), D0 = sr / f - 0.5, N = Math.floor(D0), fr = D0 - N;
    b = ac.createBuffer(1, len, sr); const y = b.getChannelData(0); const r = M.rng(Math.round(f * 13));
    let lpv = 0; const rho = Math.pow(0.5, 1 / (f * Math.max(0.25, dur * 0.42)));
    for (let i = 0; i < len; i++) {
      if (i <= N + 1) { const nz = r() * 2 - 1; lpv += bright * (nz - lpv); y[i] = lpv; continue; }
      const a0 = 0.5 * (y[i - N] + y[i - N - 1]), a1 = i - N - 2 >= 0 ? 0.5 * (y[i - N - 1] + y[i - N - 2]) : a0;
      y[i] = rho * ((1 - fr) * a0 + fr * a1);
    }
    for (let i = 0; i < Math.min(len, 64); i++) y[i] *= i / 64;
    cache.set(key, b); return b;
  }
  I.zheng = (G, t, a) => { // plucked string (古筝-like): m, dur, vel, bright, cut; v3.2: warm (dB), harm (soft sine body), echo (send)
    const f0 = mtof(a.m), dur = a.dur || 1.6;
    const b = ksBuf(G.ac, f0, dur, a.bright || 0.62), src = G.ac.createBufferSource(); src.buffer = b;
    let x = lp(G, a.cut || 5200, 0.6); src.connect(x);
    if (a.warm) { // a little more body around 400 Hz, a gentle shelf off the top
      const pk = lp(G, 400, 0.7, 'peaking'), hs = lp(G, 2200, 0.7, 'highshelf'); pk.gain.value = a.warm; hs.gain.value = -1.5 * a.warm;
      x.connect(pk); pk.connect(hs); x = hs;
    }
    const g = gainNode(G, V(a, 0.5) * 0.55); x.connect(g);
    if (a.harm) for (const [mul, k] of [[1, 1], [2, 0.32]]) { // round sine body under the string (fundamental + a touch of 2nd harmonic)
      const o = osc(G, 'sine', f0 * mul, t, t + dur + 0.05), go = G.ac.createGain(), hv = 0.22 * a.harm * k;
      go.gain.setValueAtTime(0, t); go.gain.linearRampToValueAtTime(hv, t + 0.012); go.gain.exponentialRampToValueAtTime(EMIN, t + dur * 0.75);
      o.connect(go); go.connect(g);
    }
    out(G, g, a, 0.22, a.pan); src.start(t);
  };
  I.clap = (G, t, a) => { // v3.2 hand clap: three quick band-passed noise bursts + a short room tail
    const v = V(a, 0.5) * 0.26, f0 = a.f || 1300, o0 = a.off || 0;
    [0, 0.011, 0.023].forEach((d, k) => {
      const s = noiseSrc(G, t + d, t + d + 0.03, o0 + k * 0.31), f = lp(G, f0, 1.1, 'bandpass'), g = G.ac.createGain();
      g.gain.setValueAtTime(v * (k === 2 ? 1 : 0.7), t + d); g.gain.exponentialRampToValueAtTime(EMIN, t + d + 0.013); s.connect(f); f.connect(g); out(G, g, a, 0.18, a.pan);
    });
    const s = noiseSrc(G, t + 0.023, t + 0.22, o0 + 0.9), f = lp(G, f0 * 0.9, 0.9, 'bandpass'), g = G.ac.createGain();
    g.gain.setValueAtTime(v * 0.6, t + 0.023); g.gain.exponentialRampToValueAtTime(EMIN, t + 0.17); s.connect(f); f.connect(g); out(G, g, a, 0.26, a.pan);
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
    // ---- v2 series grammar
    logo: (P, c) => { // sonic logo: the motif in 8-bit (pixel Clawd), then again a fifth higher & smooth (vector Clawd)
      const mot = ns('D5 A5 F#5 D6'), dt = [0, 0.14, 0.28, 0.46];
      mot.forEach((m, i) => P(c.t + dt[i], 'pluck', { m, vel: 0.62, dur: 0.22, wave: 'square', cut: 3400, pan: -0.25 }));
      mot.forEach((m, i) => P(c.t + 0.9 + dt[i] * 0.9, 'bell', { m: m + 7, vel: 0.5, dur: 1.8, ratio: 2.0, idx: 1.1, pan: 0.25 }));
      P(c.t + 0.9, 'pad', { notes: ns('D3 A3 E4 F#4 A4'), dur: 1.3, at: 0.08, rel: 1.8, vel: 0.6, cut: 2400, send: 0.6 });
      P(c.t, 'tone', { f0: 70, f1: 46, dur: 0.6, vel: 0.6 }); P(c.t + 0.9, 'kick', { vel: 0.6 });
      P(c.t + 0.86, 'noise', { type: 'highpass', f0: 5000, dur: 1.2, vel: 0.14, at: 0.05 });
    },
    logoEnd: (P, c) => {
      ns('A5 E6 C#6 A6').forEach((m, i) => P(c.t + i * 0.12, 'bell', { m, vel: 0.42, dur: 1.6, ratio: 2.0, idx: 1.0 }));
      P(c.t + 0.55, 'bell', { m: n('D6'), vel: 0.5, dur: 3.0, ratio: 2.0, idx: 1.2 }); P(c.t, 'kick', { vel: 0.8 });
      P(c.t, 'pad', { notes: ns('D3 A3 F#4 A4 E5'), dur: 2.2, at: 0.05, rel: 2.6, vel: 0.6, cut: 2200, send: 0.7 });
    },
    stamp: (P, c) => { P(c.t, 'tone', { f0: 130, f1: 58, dur: 0.24, vel: 1.0, send: 0.25 }); P(c.t, 'noise', { type: 'lowpass', f0: 1200, dur: 0.09, vel: 0.7 }); P(c.t + 0.005, 'wood', { f: 420, vel: 0.8 }); },
    gavel: (P, c) => { // 醒木 — a hard wooden block slapped on the storyteller's table
      const v = c.big ? 1.15 : 1;
      P(c.t, 'noise', { type: 'highpass', f0: 2400, dur: 0.03, vel: 1.1 * v, at: 0.001, send: 0.5 });
      P(c.t, 'noise', { type: 'bandpass', f0: 1150, q: 2.2, dur: 0.15, vel: 1.0 * v, at: 0.001, send: 0.55 });
      P(c.t, 'tone', { f0: 260, f1: 150, dur: 0.13, vel: 1.0 * v, send: 0.5 });
      P(c.t, 'wood', { f: 1020, vel: 1.4 * v, send: 0.5 }); P(c.t, 'wood', { f: 610, vel: 1.0 * v, send: 0.4 });
      P(c.t, 'tone', { f0: 95, f1: 48, dur: 0.3, vel: 0.85 * v });
    },
    scratch: (P, c) => { // record scratch
      P(c.t, 'noise', { f0: 650, f1: 4200, dur: 0.1, q: 5, vel: 1.0, at: 0.004 });
      P(c.t + 0.1, 'noise', { f0: 4200, f1: 420, dur: 0.17, q: 5, vel: 0.9, at: 0.004 });
      P(c.t, 'tone', { f0: 280, f1: 1400, dur: 0.1, vel: 0.4, wave: 'sawtooth', cut: 3000 });
      P(c.t + 0.1, 'tone', { f0: 1400, f1: 180, dur: 0.17, vel: 0.4, wave: 'sawtooth', cut: 3000 });
    },
    freeze: (P, c) => { // freeze-frame: shutter + sub drop + shimmer
      P(c.t, 'noise', { type: 'highpass', f0: 3500, dur: 0.02, vel: 0.9 }); P(c.t + 0.045, 'noise', { type: 'highpass', f0: 3000, dur: 0.025, vel: 0.7 });
      P(c.t, 'tone', { f0: 110, f1: 36, dur: 0.9, vel: 0.9, send: 0.2 }); P(c.t, 'noise', { type: 'lowpass', f0: 2000, f1: 200, dur: 0.6, vel: 0.35 });
      P(c.t + 0.02, 'bell', { m: n('A6'), vel: 0.25, dur: 2.2 }); P(c.t + 0.02, 'bell', { m: n('D#6'), vel: 0.18, dur: 2.0 });
    },
    riser: (P, c) => { const d = c.dur || 2; P(c.t, 'noise', { f0: 300, f1: 6000, dur: d, q: 1.2, vel: 0.5, at: d * 0.95 }); P(c.t, 'tone', { f0: 110, f1: 880, dur: d, vel: 0.12, wave: 'sawtooth', cut: 2200, at: d * 0.9 }); },
    swish: (P, c) => { P(c.t - 0.12, 'noise', { f0: 1500, f1: 7000, dur: 0.24, q: 1.4, vel: 0.5, at: 0.18 }); P(c.t, 'kick', { vel: 0.55 }); },
    page: (P, c) => { P(c.t, 'noise', { f0: 2500, f1: 5200, dur: 0.22, q: 1.2, vel: 0.32, at: 0.08 }); P(c.t + 0.16, 'noise', { type: 'highpass', f0: 4000, dur: 0.05, vel: 0.22 }); },
    gliss: (P, c) => ns(c.down ? 'D6 B5 A5 F#5 E5 D5 B4 A4 F#4 E4 D4' : 'D4 E4 F#4 A4 B4 D5 E5 F#5 A5 B5 D6').forEach((m, i) => P(c.t + i * 0.035, 'zheng', { m, vel: 0.4, dur: 1.2, bright: 0.4, cut: 2600, warm: 3, harm: 0.3, echo: 0.22, send: 0.3 })), // v3.2 softer
    cut: () => {}, // music duck window (handled in AU.build)
    quizIn: (P, c) => { P(c.t, 'tone', { f0: 440, f1: 880, dur: 0.12, vel: 0.35, wave: 'square', cut: 2600 }); P(c.t + 0.13, 'bell', { m: n('E6'), vel: 0.4, dur: 1.2 }); P(c.t + 0.13, 'bell', { m: n('B6'), vel: 0.25, dur: 1.0 }); },
    tada: (P, c) => { ns('D5 F#5 A5 D6').forEach((m, i) => P(c.t + i * 0.07, 'pluck', { m, vel: 0.55, dur: 0.3, wave: 'square', cut: 3200 })); P(c.t + 0.28, 'bell', { m: n('D6'), vel: 0.5, dur: 2.0 }); P(c.t + 0.28, 'noise', { type: 'highpass', f0: 6000, dur: 1.0, vel: 0.2 }); P(c.t + 0.28, 'kick', { vel: 0.6 }); },
    buzzer: (P, c) => { P(c.t, 'tone', { f0: 150, f1: 140, dur: 0.5, vel: 0.35, wave: 'sawtooth', cut: 1200, hold: 0.35 }); P(c.t, 'tone', { f0: 156, dur: 0.5, vel: 0.25, wave: 'square', cut: 900, hold: 0.35 }); },
    alarm: (P, c) => { const k = c.n || 3; for (let i = 0; i < k; i++) { P(c.t + i * 0.62, 'tone', { f0: 620, f1: 980, dur: 0.5, vel: 0.2, wave: 'sawtooth', cut: 2000, at: 0.05, lin: 1 }); } },
    glitch: (P, c) => { for (let i = 0; i < 9; i++) { const hh = h(c.t * 7 + i); P(c.t + i * 0.035, 'tone', { f0: 200 + hh * 1800, dur: 0.03, vel: 0.22, wave: 'square', cut: 4000 }); if (i % 3 === 0) P(c.t + i * 0.035, 'noise', { type: 'highpass', f0: 2000 + hh * 3000, dur: 0.03, vel: 0.3 }); } },
    boing: (P, c) => { P(c.t, 'tone', { f0: 210, f1: 140, dur: 0.7, vel: 0.5, wave: 'triangle', vib: [16, 60] }); P(c.t, 'tone', { f0: 92, f1: 40, dur: 0.3, vel: 0.9 }); P(c.t, 'noise', { type: 'lowpass', f0: 600, dur: 0.14, vel: 0.6 }); },
    rocket: (P, c) => { const d = c.dur || 2.2; P(c.t, 'noise', { type: 'lowpass', f0: 300, f1: 1400, dur: d, vel: 0.7, at: 0.2, q: 0.7 }); P(c.t, 'tone', { f0: 120, f1: 600, dur: d, vel: 0.14, wave: 'sawtooth', cut: 1400, at: 0.3 }); P(c.t, 'kick', { vel: 1 }); P(c.t, 'tone', { f0: 70, f1: 30, dur: 1.4, vel: 0.9 }); },
    heart: (P, c) => { P(c.t, 'tone', { f0: 70, f1: 42, dur: 0.18, vel: 0.9 }); P(c.t + 0.22, 'tone', { f0: 64, f1: 40, dur: 0.16, vel: 0.65 }); },
    gulp: (P, c) => { for (let i = 0; i < 3; i++) P(c.t + i * 0.2, 'tone', { f0: 420, f1: 170, dur: 0.11, vel: 0.35, wave: 'sine' }); },
    buzz: (P, c) => P(c.t, 'tone', { f0: 70, f1: 74, dur: c.dur || 1.2, vel: 0.22, wave: 'square', cut: 700, vib: [28, 14], at: 0.05, hold: (c.dur || 1.2) * 0.7 }),
    idea: (P, c) => { P(c.t, 'tone', { f0: 1200, dur: 0.04, vel: 0.25 }); ns('A5 E6 A6').forEach((m, i) => P(c.t + 0.05 + i * 0.08, 'bell', { m, vel: 0.42, dur: 1.6 })); P(c.t + 0.05, 'noise', { type: 'highpass', f0: 7000, dur: 0.8, vel: 0.18, at: 0.05 }); },
    fanfare: (P, c) => { [['D5', 0, 0.16], ['D5', 0.18, 0.1], ['D5', 0.3, 0.1], ['A5', 0.42, 0.7]].forEach(([m, d, l]) => { P(c.t + d, 'pluck', { m: n(m), vel: 0.6, dur: l + 0.1, wave: 'sawtooth', cut: 2600 }); P(c.t + d, 'pluck', { m: n(m) - 12, vel: 0.4, dur: l + 0.1, wave: 'square', cut: 1800 }); }); P(c.t + 0.42, 'kick', { vel: 0.8 }); P(c.t + 0.42, 'noise', { type: 'highpass', f0: 5000, dur: 1.2, vel: 0.25 }); },
    roll: (P, c) => { const d = c.dur || 1.5, k = Math.floor(d / 0.05); for (let i = 0; i < k; i++) P(c.t + i * 0.05, 'snare', { vel: 0.15 + 0.4 * (i / k), dur: 0.08, off: h(i) }); },
    snore: (P, c) => { for (let i = 0; i < (c.n || 2); i++) { P(c.t + i * 1.6, 'noise', { type: 'lowpass', f0: 380, f1: 520, dur: 0.8, vel: 0.35, at: 0.6 }); P(c.t + i * 1.6 + 0.9, 'tone', { f0: 900, f1: 1300, dur: 0.25, vel: 0.08, wave: 'sine' }); } },
    chime: (P, c) => ns(c.notes || 'D6 A6').forEach((m, i) => P(c.t + i * 0.1, 'bell', { m, vel: 0.35, dur: 1.4 })),
    key: (P, c) => P(c.t, 'key', { f: 2500 + h(c.t) * 1700, th: 140 + h(c.t + 1) * 70, vel: 0.5 + h(c.t + 2) * 0.3, off: h(c.t + 3) * 2 }),
    enter: (P, c) => { P(c.t, 'key', { f: 2000, th: 115, vel: 1.0 }); P(c.t + 0.035, 'key', { f: 1600, th: 95, vel: 0.6 }); },
    boot: (P, c) => {
      ns('D4 A4 D5 F#5').forEach((m, i) => P(c.t + i * 0.07, 'tone', { f0: mtof(m), dur: 1.6, at: 0.25, vel: 0.22, wave: 'triangle', cut: 2600, send: 0.5 }));
      P(c.t, 'tone', { f0: 220, f1: 880, dur: 0.5, vel: 0.1, wave: 'square', cut: 1800 });
      P(c.t + 0.55, 'bell', { m: n('D6'), vel: 0.4, dur: 2.4 });
    },
    pop: (P, c) => { P(c.t, 'tone', { f0: 380, f1: 950, dur: 0.09, vel: 0.6 }); P(c.t + 0.02, 'tone', { f0: 1400, dur: 0.05, vel: 0.15, wave: 'triangle' }); },
    huazi: (P, c) => { // v3 花字 pop-word hit: snap + upward chirp + a short bright bell (pitch steps with the pop index)
      const st = [0, 3, 5, 7, 10][(c.v || 0) % 5];
      P(c.t - 0.05, 'noise', { f0: 2000, f1: 5500, dur: 0.07, q: 1.3, vel: 0.18, at: 0.05 }); // v3.1: 2.5→8 kHz, 0.22
      P(c.t, 'tone', { f0: 480, f1: 1250, dur: 0.075, vel: 0.38, wave: 'triangle' }); // v3.1: 520→1500 Hz
      P(c.t + 0.02, 'bell', { m: n('A5') + st, vel: 0.17, dur: 0.55, ratio: 2.0, idx: 0.8 });
      P(c.t, 'kick', { vel: 0.36 });
    },
    whoosh: (P, c) => P(c.t, 'noise', { f0: 300, f1: 2600, f2: 600, dur: 0.6, q: 0.9, vel: 0.55, at: 0.22 }),
    ffwd: (P, c) => { // v3.2 EP2 race fast-forward: tape whir rising + ticks that speed up (days flying by)
      const d = c.dur || 2.4;
      P(c.t, 'tone', { f0: 160, f1: 620, dur: d, vel: 0.13, wave: 'sawtooth', cut: 1500, vib: [11, 9], at: 0.25 });
      P(c.t, 'noise', { f0: 600, f1: 2600, dur: d, q: 1.1, vel: 0.22, at: d * 0.6 });
      for (let i = 0; i < 22; i++) { const u = Math.sqrt(i / 22); P(c.t + d * u, 'tone', { f0: 1500 + i * 25, dur: 0.025, vel: 0.17 }); }
      P(c.t + d - 0.05, 'noise', { type: 'lowpass', f0: 1400, f1: 200, dur: 0.25, vel: 0.35 });
    },
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
    if (i % 2 === 0) { P(tb, 'pad', { notes: ch.v, dur: bar * 2, vel: 0.4, cut: 950, at: 2.4, rel: 3.0 }); P(tb, 'drone', { m: ch.b + 12, dur: bar * 2, vel: 0.32, at: 2.0, sub: 0.5 }); }
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
    // v3.1 walking bass: every 2nd bar the fifth is cut short and a diatonic step leads into the next chord's root
    const nb = chord(['Dmaj9', 'Bm9', 'Gmaj9', 'A13sus'][(i + 1) % 4]).b + 12;
    P(tb, 'bass', { m: ch.b + 12, dur: bd * 1.6, vel: 0.62 }); P(tb + sw(2.5) * bd, 'bass', { m: ch.b + 12, dur: bd * 0.8, vel: 0.45 }); P(tb + 3.5 * bd, 'bass', { m: ch.b + 19, dur: bd * (i % 2 ? 0.22 : 0.45), vel: 0.32 });
    if (i % 2) P(tb + 3.75 * bd, 'bass', { m: nb + 2, dur: bd * 0.2, vel: 0.3, sub: 0.5 });
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
    if (lv >= 2) for (let e = 0; e < 8; e++) P(tb + (e * bd) / 2, 'bass', { m: ch.b + 12, dur: bd * 0.42, vel: e % 2 ? 0.38 : 0.52, cut: 520 + lv * 80, sub: e % 2 ? 0.35 : 0.75 });
    if (lv < 2) P(tb, 'bass', { m: ch.b + 12, dur: bar * 0.92, vel: id === 'top' ? 0.2 : 0.4, cut: 420 }); // v3.1: soft held bass under the first rungs (quieter in the fog at the top)
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
    // v3.1 bass pulse under the saw ostinato (half notes; quarter notes from level 2)
    (lv >= 2 ? [0, 1, 2, 3] : [0, 2]).forEach((b) => P(tb + b * bd, 'bass', { m: ch.b + 12, dur: bd * (lv >= 2 ? 0.55 : 1.3), vel: 0.26 + lv * 0.03, cut: 380 + lv * 60, sub: 0.5 }));
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
      [0, 2].forEach((b) => P(tb + b * bd, 'bass', { m: root, dur: bd * 0.45, vel: 0.2, cut: 480 })); // v3.1 bouncy bass under the plucks
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
    const perm = scene('permission'); const hb0 = perm ? perm.start + perm.R('e3a') : 1e9, hb1 = perm ? perm.start + perm.dur : 0;
    grid(sec, 70, (i, tb, bd, bar) => {
      const ch = chord(['Bm9', 'Gmaj9', 'Dmaj9', 'A13sus'][i % 4]); const id = sec.idAt(tb + 0.01);
      P(tb, 'pad', { notes: ch.v, dur: bar, vel: id === 'reveal' ? 0.46 : 0.36, cut: id === 'reveal' ? 1400 : 850, at: 1.2, rel: 2.0 });
      if (i % 2 === 0) P(tb, 'drone', { m: n('D2'), dur: bar * 2, vel: 0.24 });
      P(tb, 'bass', { m: ch.b + 12, dur: bar * 0.95, vel: id === 'reveal' ? 0.42 : 0.34, cut: 360, sub: 0.55 }); // v3.1 warm held bass
      if (tb >= hb0 - 0.01 && tb < hb1) for (const b of [0, 2]) { P(tb + b * bd, 'kick', { vel: 0.32 }); P(tb + b * bd + 0.26, 'kick', { vel: 0.2 }); }
      const tones = ch.v.map((m) => m + 24);
      for (let b = 0; b < 4; b++) if (r() < 0.4) P(tb + b * bd + (r() < 0.3 ? bd / 2 : 0), 'bell', { m: pick(r, tones), vel: 0.15, dur: 2.4, ratio: 2.0, idx: 1.0, pan: (r() - 0.5) * 0.6 });
    });
  };
  // ---- v2 styles
  STY.none = () => {};
  /** 说书 (storyteller) — pentatonic 筝 arpeggios, 梆子 woodblock, low drum: recaps & 本集问题 cards */
  STY.story = (sec, P, r) => {
    const ARP = { D: ns('D4 A4 D5 F#5 E5 D5 A4 F#4'), Bm: ns('B3 F#4 B4 D5 F#5 D5 B4 F#4'), G: ns('G3 D4 G4 B4 D5 B4 G4 D4'), A: ns('A3 E4 A4 B4 E5 B4 A4 E4') };
    grid(sec, 96, (i, tb, bd, bar) => {
      const k = ['D', 'Bm', 'G', 'A'][i % 4], ch = chord(k);
      if (i % 4 === 0) ns('D4 E4 F#4 A4 B4 D5').forEach((m, j) => P(tb - 0.22 + j * 0.036, 'zheng', { m, vel: 0.24, dur: 1.0 }));
      ARP[k].forEach((m, s2) => { P(tb + s2 * bd / 2, 'zheng', { m, vel: (s2 % 2 ? 0.33 : 0.45) + r() * 0.05, dur: 1.4, pan: (s2 / 7 - 0.5) * 0.5 }); });
      // v3.2: the little ornaments were the harshest notes → an octave lower and softer
      if (i % 2 === 1) [0, 0.5, 0.75].forEach((b) => P(tb + (3 + b) * bd, 'zheng', { m: pick(r, ns('D5 E5 F#5 A5')), vel: 0.19, dur: 1.0, pan: 0.3 }));
      P(tb, 'pad', { notes: ch.v, dur: bar, vel: 0.22, cut: 820, at: 0.5, rel: 1.0, wave: 'triangle' });
      P(tb, 'bass', { m: ch.b + 12, dur: bd * 1.8, vel: 0.46 }); P(tb + 2 * bd, 'bass', { m: ch.b + 19, dur: bd * 1.4, vel: 0.34 });
      [[0, 820, 0.36], [1.5, 820, 0.26], [2, 600, 0.34], [3, 820, 0.26], [3.5, 820, 0.2]].forEach(([b, f, v]) => P(tb + b * bd, 'wood', { f, vel: v, pan: f > 700 ? 0.25 : -0.2 })); // v3.2 lower, softer 梆子
      P(tb, 'tone', { f0: 150, f1: 80, dur: 0.22, vel: 0.5, send: 0.15 }); P(tb + 2 * bd, 'tone', { f0: 150, f1: 80, dur: 0.18, vel: 0.36, send: 0.15 });
    });
  };
  /** 下集预告: driving build until the end card (cue logoEnd), then a calm pad */
  STY.tease = (sec, P, r) => {
    const tEnd = cueT('logoEnd', sec.t0 - 0.01) || sec.t1;
    const P2 = (t, f, a) => { if (t < tEnd - 0.02) P(t, f, a); };
    grid(sec, 132, (i, tb, bd, bar) => {
      const ch = chord(['D', 'Bm', 'G', 'A'][i % 4]); const lv = Math.min(3, i);
      for (let e = 0; e < 16; e++) P2(tb + e * bd / 4, 'bass', { m: ch.b + 12 + (e % 8 === 7 ? 12 : 0), dur: bd * 0.2, vel: e % 4 === 0 ? 0.55 : 0.36, cut: 600 + lv * 120, sub: e % 4 === 0 ? 0.8 : 0.3 });
      for (let b = 0; b < 4; b++) { P2(tb + b * bd, 'kick', { vel: 0.62 }); P2(tb + b * bd + bd / 2, 'hat', { vel: 0.3, off: r() }); }
      if (lv >= 1) { P2(tb + bd, 'snare', { vel: 0.38 }); P2(tb + 3 * bd, 'snare', { vel: 0.4 }); }
      const arp = ch.v.map((m) => m + 12); for (let s2 = 0; s2 < 8; s2++) P2(tb + s2 * bd / 2, 'pluck', { m: arp[s2 % 4] + (s2 >= 4 ? 12 : 0), vel: 0.24, dur: 0.2, wave: 'square', cut: 2400 + lv * 300, pan: s2 % 2 ? 0.3 : -0.3 });
      P2(tb, 'pad', { notes: ch.v, dur: bar, vel: 0.26, cut: 1000 + lv * 300, at: 0.2, rel: 0.6 });
    });
    if (tEnd < sec.t1) grid({ t0: tEnd + 0.6, t1: sec.t1 }, 70, (i, tb, bd, bar) => {
      const ch = chord(['Dmaj9', 'Gmaj9'][i % 2]); P(tb, 'pad', { notes: ch.v, dur: bar, vel: 0.34, cut: 1300, at: 0.6, rel: 2.0 });
      P(tb, 'bass', { m: ch.b + 12, dur: bar * 0.8, vel: 0.35 });
      [0.5, 1.5, 2.5].forEach((b) => { if (r() < 0.7) P(tb + b * bd, 'bell', { m: pick(r, ch.v.map((m) => m + 24)), vel: 0.18, dur: 2.0, ratio: 2.0, idx: 1.0 }); });
    });
  };
  /** cold opens: one punchy groove per episode */
  STY.hook = (sec, Ph, r) => {
    const mode = { e1_cold: 'chaos', e2_cold: 'race', e3_cold: 'split', e4_cold: 'tense' }[sec.sc[0].id] || 'chaos';
    const mg = AU.hookGain[mode] || 1, P = mg === 1 ? Ph : (t, f, a) => Ph(t, f, Object.assign({}, a, { g: (a.g == null ? 1 : a.g) * mg }));
    if (mode === 'chaos') grid(sec, 128, (i, tb, bd, bar) => {
      const ch = chord(['Dm', 'Bb', 'Gm', 'A7'][i % 4]); const bl = [0, 0, 12, 0, 10, 0, 7, 12];
      bl.forEach((d, e) => P(tb + e * bd / 2, 'bass', { m: ch.b + 12 + d, dur: bd * 0.4, vel: e % 2 ? 0.45 : 0.6, cut: 800, sub: e % 2 ? 0.4 : 0.8 }));
      for (let b = 0; b < 4; b++) { P(tb + b * bd, 'kick', { vel: 0.66 }); P(tb + b * bd + bd / 2, 'hat', { vel: 0.34, off: r() }); }
      P(tb + bd, 'snare', { vel: 0.42 }); P(tb + 3 * bd, 'snare', { vel: 0.46 });
      ch.v.forEach((m) => { P(tb, 'pluck', { m: m + 12, vel: 0.3, dur: 0.3, wave: 'sawtooth', cut: 2200 }); P(tb + 2.5 * bd, 'pluck', { m: m + 12, vel: 0.22, dur: 0.2, wave: 'sawtooth', cut: 2200 }); });
      if (i % 2 === 1) for (let s2 = 0; s2 < 8; s2++) P(tb + s2 * bd / 2, 'pluck', { m: ch.v[s2 % 4] + 24, vel: 0.18, dur: 0.12, wave: 'square', cut: 3000, pan: 0.3 });
    });
    else if (mode === 'race') {
      // v3.2: the race now has a fast-forward (day 8 → day 730): the band plays double time, the tune jumps an octave like a sped-up tape
      const ff0 = at('e2_cold', 'k5b+0.85'), ff1 = at('e2_cold', 'k5b+3.25');
      const inFF = (t) => ff0 != null && t >= ff0 - 0.01 && t < ff1;
      const raceBar = (i, tb, bd, bar, ff) => {
        const Q = ff ? (t, f, a) => { if (inFF(t)) P(t, f, a); } : (t, f, a) => { if (!inFF(t)) P(t, f, a); };
        const ch = chord(['D', 'G', 'A', 'D'][i % 4]);
        for (let b = 0; b < 4; b++) { [0, 0.5, 0.75].forEach((x) => Q(tb + (b + x) * bd, 'bass', { m: ch.b + 12, dur: bd * 0.22, vel: x ? 0.38 : 0.6, cut: 900, sub: x ? 0.3 : 0.8 })); Q(tb + b * bd, 'kick', { vel: ff ? 0.5 : 0.58 }); Q(tb + b * bd + bd / 2, 'hat', { vel: 0.3, off: r() }); }
        Q(tb + bd, 'snare', { vel: 0.4 }); Q(tb + 3 * bd, 'snare', { vel: 0.42 });
        const mel = [ns('D5 F#5 A5 F#5'), ns('G5 B5 D6 B5'), ns('A5 C#6 E6 C#6'), ns('D6 A5 F#5 D5')][i % 4];
        mel.forEach((m, k) => Q(tb + k * bd, 'pluck', ff ? { m: m + 12, vel: 0.2, dur: 0.12, wave: 'triangle', cut: 2600 } : { m, vel: 0.3, dur: 0.25, wave: 'square', cut: 2800 }));
        Q(tb, 'pad', { notes: ch.v, dur: bar, vel: 0.22, cut: 1600, at: ff ? 0.03 : 0.1, rel: 0.5 });
      };
      grid(sec, 150, (i, tb, bd, bar) => raceBar(i, tb, bd, bar, false));
      if (ff0 != null) { let i0 = Math.floor((ff0 - sec.t0) / 1.6); grid({ t0: sec.t0 + i0 * 1.6, t1: ff1 }, 300, (i, tb, bd, bar) => raceBar(i0 * 2 + i, tb, bd, bar, true)); }
    }
    else if (mode === 'split') grid(sec, 112, (i, tb, bd, bar) => {
      const ch = chord(['Dm', 'A7', 'Dm', 'A7'][i % 4]);
      [0, 2].forEach((b, k) => P(tb + b * bd, 'bass', { m: ch.b + 12 + (k ? 7 : 0), dur: bd * 0.8, vel: 0.6, cut: 500 }));
      [1, 3].forEach((b) => ch.v.forEach((m) => P(tb + b * bd, 'pluck', { m: m + 12, vel: 0.2, dur: 0.12, wave: 'triangle', cut: 1800 })));
      for (let e = 0; e < 8; e++) P(tb + e * bd / 2, 'hat', { vel: e % 2 ? 0.16 : 0.26, off: r() });
      P(tb, 'kick', { vel: 0.55 }); P(tb + 2 * bd, 'kick', { vel: 0.5 });
      [0.5, 1.5, 2.5, 3.5].forEach((b, j) => P(tb + b * bd, 'wood', { f: j % 2 ? 1300 : 950, vel: 0.28 }));
    });
    else grid(sec, 66, (i, tb, bd, bar) => { // tense: heartbeat + drone + rising strings
      if (i % 2 === 0) P(tb, 'drone', { m: n('D2'), dur: bar * 2, vel: 0.5, at: 0.6 });
      for (let b = 0; b < 4; b += 2) { P(tb + b * bd, 'kick', { vel: 0.5 }); P(tb + b * bd + 0.24, 'kick', { vel: 0.32 }); }
      for (let b = 0; b < 8; b++) P(tb + b * bd / 2, 'tone', { f0: 3200, dur: 0.02, vel: 0.07 });
      P(tb, 'pad', { notes: ns(['D4 F4 A4', 'D4 G4 Bb4', 'C#4 E4 A4', 'D4 F4 A4'][i % 4]), dur: bar, vel: 0.3, cut: 600 + i * 120, at: 1.2, rel: 1.4 });
    });
  };

  // ---- v3.2 EP1 re-score (feedback: from ~1:13 the music never changed and dragged) — the music now turns with the story every 7–30 s
  const at = (id, spec) => { const s = scene(id); return s ? s.start + s.R(spec) : null; };
  const crash = (P, t, v) => { P(t, 'noise', { type: 'highpass', f0: 3600, dur: 1.5, vel: v, at: 0.004, send: 0.3 }); P(t, 'noise', { f0: 2400, f1: 1500, dur: 0.45, q: 0.8, vel: v * 0.5 }); };
  /** 打开“大脑”: 16th-note square arps over a sub bass (a thinking machine), a hiccup when Clawd sees nothing but numbers,
   *  bell “digits” falling under 参数 — then everything drops out for “等等……” and a riser lands on the idea */
  STY.brain = (sec, P, r) => {
    const tc3 = at('e1_tries', 'c3'), tb3 = at('e1_tries', 't3b'), tc4 = at('e1_tries', 'c4'), drop = tc4 == null ? sec.t1 : tc4;
    const P2 = (t, f, a) => { if (t < drop - 0.03) P(t, f, a); };
    const stut = tc3 == null ? [0, 0] : [tc3 + 0.3, tc3 + 1.3];
    grid(sec, 120, (i, tb, bd, bar) => {
      const ch = chord(['Dm', 'Bb', 'Gm', 'A7'][i % 4]), up = M.clamp((tb - sec.t0) / Math.max(1, drop - sec.t0));
      P2(tb, 'pad', { notes: ch.v, dur: bar, vel: 0.2, cut: 800 + up * 500, at: 0.25, rel: 0.7 });
      [[0, 0, 0.62, 0.9, 0.9], [1.5, 12, 0.32, 0.25, 0.22], [2, 0, 0.55, 0.85, 0.9], [3.5, 12, 0.3, 0.25, 0.22], [3.75, 7, 0.28, 0.25, 0.22]]
        .forEach(([b, d, v, sub, len]) => P2(tb + b * bd, 'bass', { m: ch.b + 12 + d, dur: bd * len, vel: v, cut: 520, sub }));
      const arp = ch.v.concat(ch.v.map((m) => m + 12));
      for (let q = 0; q < 16; q++) {
        const t = tb + (q * bd) / 4; if (t >= stut[0] && t < stut[1]) continue;
        P2(t, 'pluck', { m: arp[(q + 2 * i) % 8] + 12, vel: 0.15 + (q % 4 === 0 ? 0.08 : 0), dur: 0.13, wave: 'square', cut: 1300 + up * 1000, pan: q % 2 ? 0.28 : -0.28 });
      }
      [0, 1.5, 2].forEach((b) => P2(tb + b * bd, 'kick', { vel: b ? 0.42 : 0.56 }));
      [1, 3].forEach((b) => P2(tb + b * bd, 'snare', { vel: 0.22, f: 2100, dur: 0.07 }));
      for (let e = 0; e < 8; e++) P2(tb + (e + 0.5) * bd / 2, 'hat', { vel: 0.16, dur: 0.03, off: r() });
    });
    // the hiccup (“……全是数字”): one note re-triggered in 32nds, stepping down
    for (let q = 0; q < 16 && tc3 != null; q++) P2(stut[0] + q * 0.0625, 'pluck', { m: n('A5') - 2 * Math.floor(q / 4), vel: 0.21 - q * 0.007, dur: 0.055, wave: 'square', cut: 2000, pan: q % 2 ? 0.4 : -0.4 });
    // falling “digits” under 参数: bell plinks stepping down the D-minor scale
    const DIG = ns('D6 C6 A5 G5 F5 E5 D5 C5');
    for (let q = 0; q < 18 && tb3 != null; q++) P2(tb3 + 0.3 + q * 0.19 + r() * 0.04, 'bell', { m: DIG[q % 8], vel: 0.13 + r() * 0.05, dur: 0.6, ratio: 3.5, idx: 1.0, pan: (r() - 0.5) * 0.9 });
    // the drop (“等等……”): a held low chord, a sub thump, and a riser that lands on the idea
    if (tc4 != null && sec.t1 - tc4 > 0.3) {
      const d = sec.t1 - tc4 - 0.03;
      P(tc4, 'pad', { notes: ns('D3 A3 E4'), dur: d, vel: 0.24, cut: 700, at: 0.12, rel: 0.5 });
      P(tc4, 'tone', { f0: 90, f1: 45, dur: 0.5, vel: 0.45 });
      P(tc4 + 0.05, 'noise', { f0: 400, f1: 4500, dur: d, q: 1.1, vel: 0.3, at: d * 0.92 });
      P(tc4 + 0.05, 'tone', { f0: 147, f1: 587, dur: d, vel: 0.07, wave: 'sawtooth', cut: 1800, at: d * 0.9 });
    }
  };
  /** the idea (改进“变聪明的方法”): bright and bouncy — octave bass, kick + clap, shaker, a marimba hook */
  STY.eureka = (sec, P, r) => grid(sec, 120, (i, tb, bd, bar) => {
    const k = ['D', 'G', 'Bm', 'A'][i % 4], ch = chord(k);
    P(tb, 'pad', { notes: ch.v, dur: bar, vel: 0.24, cut: 1500, at: 0.06, rel: 0.5 });
    for (let e = 0; e < 8; e++) P(tb + (e * bd) / 2, 'bass', { m: ch.b + 12 + (e % 2 ? 12 : 0), dur: bd * 0.32, vel: e % 2 ? 0.34 : 0.56, cut: 700, sub: e % 2 ? 0.2 : 0.8 });
    [0, 2, 2.5].forEach((b) => P(tb + b * bd, 'kick', { vel: b === 2.5 ? 0.4 : 0.6 }));
    [1, 3].forEach((b) => P(tb + b * bd, 'clap', { vel: 0.5, off: r() }));
    for (let q = 0; q < 16; q++) P(tb + (q * bd) / 4, 'hat', { vel: q % 4 === 2 ? 0.28 : 0.13, f: 6500, dur: 0.035, off: r(), pan: 0.35 }); // shaker
    const HOOK = { D: 'A4 D5 F#5 A5 F#5 D5 E5', G: 'B4 D5 G5 B5 G5 D5 E5', Bm: 'B4 D5 F#5 B5 A5 F#5 D5', A: 'A4 C#5 E5 A5 G5 F#5 E5' }, RH = [0, 0.5, 1, 1.5, 2, 3, 3.5];
    ns(HOOK[k]).forEach((m, j) => P(tb + RH[j] * bd, 'bell', { m, vel: j === 3 ? 0.34 : 0.27, dur: 0.6, ratio: 4.0, idx: 1.1, pan: -0.15 }));
  });
  /** lab → flip at 96 BPM (one lab “day” = 2 bars = 5 s; its night = the last 3 beats).
   *  Lab: a lazy day-time groove with typing clicks; at night only a music-box lullaby; a ba-dum-tss on Clawd's joke.
   *  Flip: a crash on 第四招, then a funk vamp that levels up with each generation (lead + 16th hats at Gen 2, up a tone at Gen 3)
   *  and a “recursion” motif that doubles its speed every time round. */
  STY.groove = (sec, P, r) => {
    const lab = scene('lab'), flip = scene('flip');
    const fl0 = flip ? flip.start : sec.t1;
    const sw = (b) => b + (Math.abs((b % 1) - 0.5) < 1e-6 ? 0.1 : 0);
    if (lab) {
      const E4 = at('lab', 'l4$'), e8 = 60 / 96 / 2;
      const tss = E4 == null ? 1e9 : lab.start + Math.floor((E4 - 0.02 - lab.start) / e8) * e8, ba = tss - e8;
      grid({ t0: lab.start, t1: fl0 - 0.4 }, 96, (i, tb, bd, bar) => {
        const ch = chord(['Gmaj7', 'Fsm', 'Em7', 'A'][i % 4]), night = i % 2 === 1;
        const L = (t, f, a) => { if (t < ba - 0.01 && t < fl0 - 0.1) P(t, f, a); };
        const day = (b) => !night || b < 1 - 1e-6;
        P(tb, 'pad', { notes: ch.v, dur: bar, vel: night ? 0.16 : 0.2, cut: night ? 700 : 900, at: 0.4, rel: 1.0, wave: 'triangle' });
        // day: Rhodes, bass, a lazy swung beat, typing
        if (day(0)) ch.v.forEach((m, k) => L(tb + k * 0.012, 'ep', { m, dur: bd * (night ? 0.9 : 2.2), vel: 0.36, pan: (k - 1.5) * 0.15 }));
        [[0, 0, 0.58, 1.5], [2.5, 7, 0.42, 0.8], [3.75, 12, 0.3, 0.22]].forEach(([b, d, v, len]) => { if (day(b)) L(tb + sw(b) * bd, 'bass', { m: ch.b + 12 + d, dur: bd * len, vel: v, cut: 520 }); });
        if (!night) ch.v.forEach((m, k) => L(tb + sw(2.5) * bd + k * 0.012, 'ep', { m, dur: bd * 1.1, vel: 0.22, pan: (k - 1.5) * 0.15 }));
        [[0, 'kick', 0.62], [2.5, 'kick', 0.45], [1, 'snare', 0.32], [3, 'snare', 0.34]].forEach(([b, f, v]) => { if (day(b)) L(tb + sw(b) * bd, f, f === 'snare' ? { vel: v, f: 1700 } : { vel: v }); });
        for (let e = 0; e < 8; e++) if (day(e / 2)) L(tb + sw(e / 2) * bd, 'hat', { vel: e % 2 ? 0.16 : 0.26, off: r() });
        for (let q = 0; q < 16; q++) if (day(q / 4) && r() < 0.42) L(tb + (q * bd) / 4 + r() * 0.02, 'key', { f: 2300 + r() * 1200, th: 140 + r() * 60, vel: 0.26 + r() * 0.16, off: r() * 2, pan: -0.35 });
        // night: a music-box lullaby over the soft pad
        if (night) { const tones = ch.v.map((m) => m + 24); [[1, 2], [1.5, 1], [2, 3], [2.5, 2], [3, 0]].forEach(([b, j], k) => L(tb + b * bd, 'bell', { m: tones[j], vel: 0.2 - k * 0.012, dur: 1.5, ratio: 3.0, idx: 0.55, pan: 0.25 })); }
      });
      if (E4 != null) { // ba-dum-tss for “……人要睡觉？”
        P(ba, 'snare', { vel: 0.42, f: 1700 }); P(ba, 'tone', { f0: 210, f1: 150, dur: 0.16, vel: 0.5 });
        P(tss - e8 / 2, 'tone', { f0: 150, f1: 100, dur: 0.2, vel: 0.55 });
        P(tss, 'kick', { vel: 0.5 }); P(tss, 'noise', { type: 'highpass', f0: 4200, dur: 0.9, vel: 0.26, at: 0.003, send: 0.3 });
      }
    }
    if (!flip) return;
    const f1 = at('flip', 'f1'), g2 = at('flip', 'f3+1.0'), g3 = at('flip', 'f4$+0.4'), f5 = at('flip', 'f5');
    const bar0 = (60 / 96) * 4, tr0 = f1 + Math.ceil((g3 - f1) / bar0 - 1e-6) * bar0; // Gen 3 → up a whole tone from the next bar line
    crash(P, f1, 0.24); P(f1, 'kick', { vel: 0.8 }); P(f1, 'bass', { m: n('E2'), dur: 0.5, vel: 0.6, cut: 600 });
    [0, 1, 2].forEach((k) => P(f1 - 0.33 + k * 0.105, 'snare', { vel: 0.18 + k * 0.08, f: 1900, dur: 0.07 })); // pickup fill
    grid({ t0: f1, t1: sec.t1 }, 96, (i, tb, bd, bar) => {
      const tr = tb >= tr0 - 0.01 ? 2 : 0, ch = chord(i % 2 ? 'A7' : 'Em7'), R = ch.b + 12 + tr, s16 = bd / 4;
      const lead2 = (t) => t >= g2 - 0.01, lv3 = (t) => t >= g3 - 0.01;
      P(tb, 'pad', { notes: ch.v.map((m) => m + tr), dur: bar, vel: 0.17, cut: 1000, at: 0.1, rel: 0.6 });
      [[0, 0, 0.6, 0.3], [3, 12, 0.34, 0.12], [6, 0, 0.48, 0.25], [8, 7, 0.4, 0.2], [10, 0, 0.5, 0.25], [11, 12, 0.3, 0.1], [14, 10, 0.36, 0.2]]
        .forEach(([q, d, v, len]) => P(tb + q * s16, 'bass', { m: R + d, dur: bd * len * 1.6, vel: v, cut: 750, sub: d ? 0.2 : 0.7 }));
      [[0, 0.66], [7, 0.42], [10, 0.5]].forEach(([q, v]) => P(tb + q * s16, 'kick', { vel: v }));
      [[4, 0.4], [12, 0.42], [7, 0.1], [15, 0.12]].forEach(([q, v]) => P(tb + q * s16, 'snare', { vel: v, f: 1900, dur: v < 0.2 ? 0.05 : 0.15 }));
      for (let q = 0; q < 16; q++) { const t = tb + q * s16; if (q % 2 === 0 || lead2(t)) P(t, 'hat', { vel: q % 4 === 2 ? 0.3 : q % 2 ? 0.12 : 0.2, f: 7000, dur: 0.035, off: r(), pan: 0.3 }); }
      [2, 6, 9, 14].forEach((q) => ch.v.forEach((m, k) => P(tb + q * s16 + k * 0.004, 'pluck', { m: m + 12 + tr, vel: 0.12, dur: 0.09, wave: 'triangle', wave2: 'square', cut: 1800, pan: 0.2 })));
      const LEAD = i % 2 ? [[0, 'E5'], [2, 'G5'], [3, 'A5'], [6, 'C#6'], [8, 'B5'], [10, 'A5'], [11, 'G5'], [14, 'E5']] : [[0, 'E5'], [2, 'G5'], [3, 'A5'], [6, 'B5'], [8, 'A5'], [10, 'G5'], [11, 'E5'], [14, 'D5']];
      LEAD.forEach(([q, nn]) => { const t = tb + q * s16; if (lead2(t) && (f5 == null || t < f5 + 0.3)) P(t, 'pluck', { m: n(nn) + tr, vel: 0.22, dur: 0.18, wave: 'sawtooth', cut: 2100, q: 1.2, pan: -0.2 }); });
      [1, 3].forEach((b) => { const t = tb + b * bd; if (lv3(t)) P(t, 'clap', { vel: 0.42, off: r() }); });
    });
    // 递归: one motif, played again and again — twice as fast each time
    if (f5 != null) {
      const MOT = ['E5', 'G5', 'B5', 'E6'];
      let t = f5 + 0.5; for (let rep2 = 0; rep2 < 4; rep2++) { const d = 0.3125 / Math.pow(2, rep2); MOT.forEach((nn, k) => { const tr = t >= tr0 - 0.01 ? 2 : 0; P(t, 'bell', { m: n(nn) + tr, vel: 0.24 + rep2 * 0.03, dur: 0.7, ratio: 4.0, idx: 1.1, pan: (k / 3 - 0.5) * 0.6 }); t += d; }); }
      P(t, 'bell', { m: n('E6') + (t >= tr0 ? 2 : 0), vel: 0.34, dur: 1.4, ratio: 4.0, idx: 1.2 });
    }
  };
  /** compounding staircase: ten even marimba steps for “people improve AI” (one per blue step, 8ths at 115 BPM), then the orange staircase —
   *  ever-wider leaps, drums speeding up and a riser — slammed to a stop on the statement; an “uh-oh” in the bass for Clawd */
  STY.stairs = (sec, P, r) => {
    const tk1 = at('compound', 'k1'), tk2 = at('compound', 'k2'), tk3 = at('compound', 'k3'), tk4 = at('compound', 'k4');
    if (tk1 == null) return;
    const e8 = 2.6 / 10, BLUE = ns('D4 E4 F#4 G4 A4 B4 C#5 D5 E5 F#5'), ORNG = ns('D4 E4 G4 B4 E5 A5 D6 A6');
    P(sec.t0, 'pad', { notes: ns('D3 A3 D4 F#4'), dur: tk2 - sec.t0, vel: 0.2, cut: 900, at: 0.3, rel: 0.8, wave: 'triangle' });
    for (let i = 0; i < 10; i++) {
      const t = tk1 + e8 * (i + 1);
      P(t, 'bell', { m: BLUE[i], vel: 0.32, dur: 0.9, ratio: 4.0, idx: 1.0, pan: -0.3 + i * 0.06 });
      if (i % 2 === 0) { P(t, 'kick', { vel: 0.45 }); P(t, 'bass', { m: n(i % 4 === 0 ? 'D2' : 'A1') + 12, dur: e8 * 1.6, vel: 0.45, cut: 500 }); }
      else P(t, 'snare', { vel: 0.16, f: 1800, dur: 0.06 });
      P(t + e8 / 2, 'hat', { vel: 0.12, off: r() });
    }
    // waiting on the last blue step: a soft tick-tock until the orange stairs start
    for (let t = tk1 + e8 * 11; t < tk2 + 0.35; t += e8 * 2) P(t, 'wood', { f: 760, vel: 0.2, pan: 0.2 });
    // the orange staircase
    ['D', 'G', 'A'].forEach((k, j) => P(tk2 + 0.4 + j * 1.2, 'pad', { notes: chord(k).v, dur: 1.2, vel: 0.22 + j * 0.03, cut: 1000 + j * 300, at: 0.08, rel: 0.4 }));
    for (let i = 0; i < 8; i++) {
      const t = tk2 + 0.4 + 0.45 * i;
      P(t, 'bell', { m: ORNG[i], vel: 0.28 + i * 0.012, dur: 1.1, ratio: 4.0, idx: 1.1, pan: 0.3 - i * 0.06 });
      P(t, 'kick', { vel: 0.5 + i * 0.03 }); P(t, 'bass', { m: n('D2') + 12 + (i >= 6 ? 12 : 0), dur: 0.3, vel: 0.5, cut: 650, sub: 0.7 });
    }
    for (let t = tk2 + 0.4, d = 0.225; t < tk3 - 0.04; t += d, d = Math.max(0.045, d * 0.9)) P(t, 'hat', { vel: 0.14 + 0.18 * M.clamp((t - tk2) / (tk3 - tk2)), off: r() });
    const rz = tk2 + 2.2; P(rz, 'noise', { f0: 300, f1: 5000, dur: tk3 - rz, q: 1.2, vel: 0.3, at: (tk3 - rz) * 0.95 });
    for (let t = tk2 + 4.0, d = 0.12; t < tk3 - 0.04; t += d, d = Math.max(0.04, d * 0.85)) P(t, 'snare', { vel: 0.14 + 0.3 * M.clamp((t - tk2 - 4.0) / (tk3 - tk2 - 4.0)), f: 1900, dur: 0.06, off: r() });
    // the stop: one sustained chord under the statement, darker under Clawd's worry
    if (tk3 != null) P(tk3, 'pad', { notes: ns('D3 A3 E4 F#4 A4'), dur: (tk4 || sec.t1) - tk3 + 0.2, vel: 0.3, cut: 1100, at: 0.35, rel: 1.6 });
    if (tk4 != null) {
      P(tk4, 'pad', { notes: ns('B2 F#3 D4'), dur: sec.t1 - tk4, vel: 0.22, cut: 800, at: 0.3, rel: 1.0 });
      [[0.4, 'E3', 0.3, 0.97], [0.72, 'C#3', 0.7, 0.94]].forEach(([d, nn, len, gl]) => { // uh-oh
        const f = mtof(n(nn)); P(tk4 + d, 'tone', { f0: f, f1: f * gl, dur: len, wave: 'triangle', vel: 0.34, cut: 900, vib: [5, 3], at: 0.02 });
        P(tk4 + d, 'bass', { m: n(nn) - 12, dur: len * 0.9, vel: 0.42, cut: 500, sub: 0.5 });
      });
    }
  };
  /** 1965: a little swing combo at 116 BPM — walking bass, ride, brushes, vibraphone Charleston comping, vinyl crackle;
   *  stop-time on “这句话还没完” until the sticky note slaps on, then a jazzy button */
  STY.retro = (sec, P, r) => {
    const tg2 = at('good', 'g2'), slap = at('good', 'g2b+0.85'), stop0 = tg2 == null ? sec.t1 : tg2, slapT = slap == null ? sec.t1 : slap;
    const PR = ['Dmaj9', 'Bm9', 'Em7', 'A13sus'], sw = (b) => b + (Math.abs((b % 1) - 0.5) < 1e-6 ? 1 / 6 : 0);
    const vibes = (t, notes, v, dur) => notes.forEach((m, k) => P(t + k * 0.012, 'bell', { m, ratio: 1, idx: 0.55, dur, vel: v, pan: (k - 1.5) * 0.2 }));
    grid(sec, 116, (i, tb, bd, bar) => {
      const ch = chord(PR[i % 4]), nx = chord(PR[(i + 1) % 4]), F = (t) => t < stop0 - 0.02;
      const R = ch.b + 12, walk = [R, R + (i % 2 ? 3 : 4), R + 7, nx.b + 12 + (r() < 0.5 ? 1 : -1)];
      walk.forEach((m, b) => { if (F(tb + b * bd)) P(tb + b * bd, 'bass', { m, dur: bd * 0.85, vel: b ? 0.42 : 0.55, cut: 600, sub: 0.45 }); });
      [0, 1, 1 + 2 / 3, 2, 3, 3 + 2 / 3].forEach((b, k) => { const t = tb + b * bd; if (F(t)) P(t, 'hat', { f: 5200, dur: 0.22, vel: k % 3 === 2 ? 0.15 : 0.24, off: r(), pan: 0.3 }); });
      [1, 3].forEach((b) => { const t = tb + b * bd; if (F(t)) P(t, 'noise', { f0: 1700, f1: 3200, dur: 0.22, q: 0.7, vel: 0.15, at: 0.03, pan: -0.2 }); });
      [[0, 0.3], [2, 0.24]].forEach(([b, v]) => { const t = tb + b * bd; if (F(t)) P(t, 'kick', { vel: v }); });
      if (F(tb)) vibes(tb, ch.v.map((m) => m + 12), 0.2, 1.3);
      if (F(tb + sw(1.5) * bd)) vibes(tb + sw(1.5) * bd, ch.v.map((m) => m + 12), 0.16, 0.9);
      for (let c = 0; c < 5; c++) P(tb + r() * bar, 'crackle', { vel: 0.2 + r() * 0.4, f: 2000 + r() * 3000, off: r() * 2, pan: r() - 0.5 });
      // stop-time: a short band hit on beats 1 and 3 while the narrator holds the floor
      [0, 2].forEach((b) => { const t = tb + b * bd; if (t > stop0 + 0.2 && t < slapT - 0.25) { vibes(t, ch.v.map((m) => m + 12), 0.24, 0.5); P(t, 'bass', { m: R, dur: bd * 0.4, vel: 0.5, cut: 600 }); P(t, 'kick', { vel: 0.36 }); P(t, 'hat', { f: 5200, dur: 0.12, vel: 0.26, off: r() }); } });
    });
    // the button: the sticky note lands on a D6/9
    if (slap != null && slapT < sec.t1 - 0.1) {
      vibes(slapT, ns('A4 B4 E5 F#5'), 0.3, 1.8); P(slapT, 'bass', { m: n('D2') + 12, dur: 0.9, vel: 0.6, cut: 600, sub: 0.7 }); P(slapT, 'kick', { vel: 0.5 });
      P(slapT, 'noise', { type: 'highpass', f0: 4200, dur: 1.4, vel: 0.2, at: 0.003, send: 0.35 });
      vibes(slapT + 0.75, ns('D5 F#5 A5 B5 E6').reverse().map((m) => m - 12), 0.12, 1.4);
    }
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
    big: { f: 300, wave: 'sawtooth', cut: 1500 }, agent: { f: 520, wave: 'triangle', cut: 2400 },
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
        text.forEach((ch, i) => { if (/\s/.test(ch)) return; const tt = t0 + i / rate; if (tt > t0 + ln.dur) return; const hh = M.hash(i * 3.1 + t0); P(tt, 'key', { f: 2100 + hh * 1500, th: 140 + hh * 70, vel: 0.32 + hh * 0.2, off: hh * 2 }, 'sfx'); });
      }
    }
  }

  // ---------------------------------------------------------------- event list
  AU.build = () => {
    const ev = [];
    const P0 = (t, f, a, bus) => { if (!I[f]) throw new Error('no instrument ' + f); ev.push({ t, f, a: Object.assign({ bus }, a) }); };
    const secs = [];
    for (const sc of RSI.scenes) {
      const parts = []; let a = sc.start, k = sc.music || 'ambient';
      for (const [spec, k2] of sc.musicAt || []) { const b = sc.start + sc.R(spec); if (b > a + 0.05) parts.push([k, a, b]); a = b; k = k2; } // v3.2: musicAt = [[timeSpec, style], …]
      parts.push([k, a, sc.start + sc.dur]);
      for (const [k1, t0, t1] of parts) {
        const last = secs[secs.length - 1];
        if (last && last.k === k1) { last.t1 = t1; if (last.sc[last.sc.length - 1] !== sc) last.sc.push(sc); } else secs.push({ k: k1, t0, t1, sc: [sc] });
      }
    }
    const cdur = (c) => { if (c.dur === 'end') { const sc = RSI.sceneAt(c.t + 1e-3); return sc.start + sc.dur - c.t; } return c.dur || 2; };
    const mutes = RSI.cues.filter((c) => c.type === 'boom').map((c) => [c.t - 0.15, c.t + 2.4])
      .concat(RSI.cues.filter((c) => c.type === 'cut').map((c) => [c.t - 0.01, c.t + cdur(c)]));
    AU.ducks = RSI.cues.filter((c) => c.type === 'cut').map((c) => ({ t0: c.t, t1: c.t + cdur(c), fi: c.fi || 0.02, fo: c.fo == null ? 0.3 : c.fo, depth: c.depth || 0 }));
    for (const sec of secs) {
      sec.idAt = (t) => { let id = sec.sc[0].id; for (const s of sec.sc) if (s.start <= t) id = s.id; return id; };
      const r = M.rng(hashStr(sec.k) ^ Math.floor(sec.t0 * 10));
      const sg = AU.secGain[sec.k] || 1;
      const P = (t, f, a) => { if (t < sec.t0 - 0.001 || t >= sec.t1 - 0.05) return; for (const m of mutes) if (t >= m[0] && t < m[1]) return; P0(t, f, soften(f, Object.assign({}, a, { g: (a.g || 1) * sg })), 'music'); };
      (STY[sec.k] || STY.ambient)(sec, P, r);
    }
    AU.sections = secs.map((s) => ({ k: s.k, t0: s.t0, t1: s.t1 }));
    for (const c of RSI.cues) (SFX[c.type] || SFX.pop)((t, f, a) => P0(t, f, a, 'sfx'), c);
    lineEvents(P0);
    ev.sort((a, b) => a.t - b.t);
    AU.events = ev;
    return ev.length;
  };
  /** music duck gain at absolute time t */
  AU.duckAt = (t) => {
    let g = 1;
    for (const d of AU.ducks || []) {
      let v = 1;
      if (t >= d.t0 - d.fi && t < d.t0) v = M.lerp(1, d.depth, (t - (d.t0 - d.fi)) / d.fi);
      else if (t >= d.t0 && t < d.t1) v = d.depth;
      else if (t >= d.t1 && t < d.t1 + d.fo) v = M.lerp(d.depth, 1, (t - d.t1) / d.fo);
      g = Math.min(g, v);
    }
    return g;
  };
  /** schedule the duck envelope on G.mduck for absolute times [a, b] mapped to context time ct = t - a + c0 */
  function applyDucks(G, a, b, c0 = 0) {
    if (!AU.ducks || !AU.ducks.some((d) => d.t1 + d.fo >= a && d.t0 - d.fi <= b)) return;
    const step = 0.01, n2 = Math.max(2, Math.ceil((b - a) / step)), curve = new Float32Array(n2);
    for (let i = 0; i < n2; i++) curve[i] = AU.duckAt(a + i * step);
    G.mduck.gain.setValueCurveAtTime(curve, c0, (n2 - 1) * step);
  }
  AU.reset = () => { AU.events = null; AU.ducks = null; };
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
    const g = G; try { applyDucks(G, t, RSI.total + 1, c0); } catch (e) { /* */ }
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
    applyDucks(g, a, b + tail, 0);
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
