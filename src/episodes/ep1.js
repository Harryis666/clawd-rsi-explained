/* 《Clawd 造 Clawd》第 1 集《离谱任务》— manifest + the episode's own scenes:
   cold open (第 47 代的警告 · freeze · rewind) · 本集问题 · three failed tricks · the dream · cliffhanger · next-episode teaser. */
(function () {
  'use strict';
  const RSI = window.RSI, C = RSI.C, M = RSI.M, D = RSI.D, T = RSI.T, K = RSI.Clawd, X = RSI.X, Sx = RSI.Series;
  const W = RSI.W, H = RSI.H;
  const EN = () => RSI.lang === 'en';
  const pad3 = (n) => String(Math.max(0, Math.round(n))).padStart(3, '0');
  const line = (sid, lid) => RSI.allScenes[sid].lines.find((l) => l.id === lid);

  // ------------------------------------------------------------------ edits to shared scenes (EP1 wording)
  Object.assign(line('open', 'n1'), { zh: '这是 {o|Clawd}，第 1 代。', en: 'This is {o|Clawd}. Generation 1.' });
  {
    const op = RSI.allScenes.open.lines; const i = op.findIndex((l) => l.id === 'n4');
    op.splice(i + 1, 0, { id: 'n5', who: 'narr', zh: '说白了：AI 动手改进 AI；改强了，再接着改。', en: 'In plain words: AI improves AI — and once it’s better, it improves again.', hold: 0.4 });
  }

  // ------------------------------------------------------------------ props
  /** yellow/black warning tape with a centred label */
  const tape = (ctx, y, t, text, o = {}) => {
    const h = o.h || 62, rot = o.rot == null ? -0.022 : o.rot;
    ctx.save(); ctx.translate(W / 2, y); ctx.rotate(rot);
    ctx.shadowColor = 'rgba(0,0,0,0.45)'; ctx.shadowBlur = 18; ctx.fillStyle = '#E8B93A'; ctx.fillRect(-W, -h / 2, W * 2, h); ctx.shadowColor = 'transparent';
    ctx.save(); ctx.beginPath(); ctx.rect(-W, -h / 2, W * 2, h); ctx.clip(); ctx.fillStyle = '#1A1714';
    const sw = 54, off = (t * 80) % (sw * 2);
    for (let x = -W - sw * 4 + off; x < W + sw * 2; x += sw * 2) { ctx.beginPath(); ctx.moveTo(x, -h / 2); ctx.lineTo(x + sw, -h / 2); ctx.lineTo(x + sw - h, h / 2); ctx.lineTo(x - h, h / 2); ctx.closePath(); ctx.fill(); }
    ctx.restore();
    const size = o.size || 32; ctx.font = T.font(size, 900); const tw = ctx.measureText(RSI.L(text)).width + 70;
    ctx.fillStyle = '#E8B93A'; ctx.fillRect(-tw / 2, -h / 2 + 7, tw, h - 14);
    T.line(ctx, text, 0, 2, size, '#1A1714', 900, 'center');
    ctx.restore();
  };
  /** rotating red alarm beacon with two sweeping light cones */
  const beacon = (ctx, x, y, t, a = 1) => {
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const k of [0, Math.PI]) {
      const an = t * 3.0 + k, dir = Math.cos(an), face = Math.max(0, Math.sin(an));
      const tx = x + dir * 1100, ty = y + 900, spread = 150 + 140 * face;
      const nx = -(ty - y), ny = tx - x, nl = Math.hypot(nx, ny);
      const g = ctx.createLinearGradient(x, y, tx, ty);
      g.addColorStop(0, `rgba(255,70,50,${0.30 * a * (0.35 + 0.65 * face)})`); g.addColorStop(1, 'rgba(255,70,50,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - 20, y); ctx.lineTo(tx + (nx / nl) * spread, ty + (ny / nl) * spread); ctx.lineTo(tx - (nx / nl) * spread, ty - (ny / nl) * spread); ctx.lineTo(x + 20, y); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    const pulse = 0.55 + 0.45 * Math.sin(t * 9.6);
    ctx.fillStyle = '#2A2624'; D.rr(ctx, x - 52, y - 46, 104, 24, 6); ctx.fill();
    ctx.fillStyle = RSI.mix('#7A1E16', '#FF5A42', pulse); ctx.beginPath(); ctx.ellipse(x, y, 36, 26, 0, Math.PI, 0); ctx.fill(); ctx.fillRect(x - 36, y, 72, 10);
    D.glow(ctx, x, y, 170, '#FF4A36', 0.9 * pulse * a);
  };
  /** flickering red hologram panel */
  const holo = (ctx, x, y, w, h, t, kind, seed, a = 1) => {
    ctx.save(); ctx.globalAlpha *= a * (0.72 + 0.28 * M.hash(Math.floor(t * 11) + seed));
    ctx.fillStyle = 'rgba(233,115,102,0.08)'; ctx.strokeStyle = 'rgba(233,115,102,0.6)'; ctx.lineWidth = 2;
    D.rr(ctx, x, y, w, h, 10); ctx.fill(); ctx.stroke();
    if (kind === 'graph') {
      ctx.strokeStyle = C.red; ctx.lineWidth = 4; ctx.beginPath();
      for (let i = 0; i <= 40; i++) { const u = i / 40; const xx = x + 22 + u * (w - 44), yy = y + h - 22 - (h - 56) * Math.pow(u, 5); i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
      ctx.stroke(); T.line(ctx, 'GEN ↑↑↑', x + 22, y + 26, 20, C.red, 800, 'left', 'mono');
    } else {
      for (let i = 0; i < 6; i++) { const ww = (0.3 + 0.6 * M.hash(seed + i + Math.floor(t * 5))) * (w - 44); ctx.fillStyle = i % 3 ? 'rgba(240,238,230,0.32)' : 'rgba(233,115,102,0.75)'; ctx.fillRect(x + 22, y + 24 + i * ((h - 44) / 6), ww, 8); }
    }
    ctx.restore();
  };
  /** puffy thought-cloud path (union of puffs + core ellipse) */
  const cloudPath = (ctx, cx, cy, w, h) => {
    ctx.beginPath(); const n = 16;
    for (let i = 0; i < n; i++) { const an = (i / n) * M.TAU; const px = cx + (Math.cos(an) * w) / 2, py = cy + (Math.sin(an) * h) / 2; const r = (0.13 + 0.05 * M.hash(i + 3)) * Math.min(w, h); ctx.moveTo(px + r, py); ctx.arc(px, py, r, 0, M.TAU); }
    ctx.moveTo(cx + w / 2, cy); ctx.ellipse(cx, cy, w / 2, h / 2, 0, 0, M.TAU);
  };
  /** closed book (spine toward the viewer) */
  const book = (ctx, x, y, w, h, col, rot = 0) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.fillStyle = C.paper2; ctx.fillRect(-w / 2 + 6, -h / 2 + 4, w - 10, h - 8);
    ctx.fillStyle = col; D.rr(ctx, -w / 2, -h / 2, w, h, 5); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.25)'; ctx.fillRect(-w / 2 + 14, -h / 2 + 6, w * 0.4, 4);
    ctx.fillStyle = 'rgba(0,0,0,0.18)'; ctx.fillRect(-w / 2, h / 2 - 7, w, 7);
    ctx.restore();
  };
  const BOOKC = [C.blue, C.green, C.purple, C.red, C.teal, C.yellow, C.pink, C.orangeD];
  /** coffee mug */
  const mug = (ctx, x, y, s, rot = 0, steam = 0, t = 0) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    ctx.lineWidth = 9; ctx.strokeStyle = '#EDE7DA'; ctx.beginPath(); ctx.arc(46, 6, 22, -1.3, 1.3); ctx.stroke();
    ctx.fillStyle = '#EDE7DA'; D.rr(ctx, -44, -46, 92, 100, 14); ctx.fill();
    ctx.fillStyle = C.orange; ctx.fillRect(-44, -14, 92, 24);
    T.line(ctx, '☕', 2, -2, 22, '#fff', 700, 'center');
    if (steam > 0) { ctx.strokeStyle = `rgba(240,238,230,${0.5 * steam})`; ctx.lineWidth = 5; for (let i = 0; i < 3; i++) { ctx.beginPath(); for (let k = 0; k <= 10; k++) { const yy = -56 - k * 7; const xx = -22 + i * 22 + Math.sin(k * 0.8 + t * 6 + i) * 7; k ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); } }
    ctx.restore();
  };
  /** red hand-written ✗ stamp */
  const cross = (ctx, x, y, s, k) => { if (k <= 0) return; const sc = 1.6 - 0.6 * M.ease.outBack(M.clamp(k)); ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.globalAlpha *= M.clamp(k * 3); D.icon(ctx, 'cross', 0, 0, s, C.red, 13); ctx.restore(); };
  /** stamp-style text block */
  const stampText = (ctx, s, x, y, size, col, k, rot = -0.12) => {
    if (k <= 0) return; const sc = 1.7 - 0.7 * M.ease.outBack(M.clamp(k));
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha *= M.clamp(k * 3);
    ctx.font = T.font(size, 900); const w = ctx.measureText(RSI.L(s)).width + size * 0.9, h = size * 1.5;
    ctx.strokeStyle = col; ctx.lineWidth = size * 0.1; D.rr(ctx, -w / 2, -h / 2, w, h, size * 0.2); ctx.stroke();
    T.line(ctx, s, 0, 2, size, col, 900, 'center'); ctx.restore();
  };

  // ================================================================== 1 · cold open
  const GX = 1265, GY = 1012, GS = 44, TX = 430, TY = 968, TS = 5.5, NX = 1712, NY = 1014, NS = 12;
  const frozen = new Map();
  const tFz = (S) => S.T('b2') + 1.2;
  /** the live (pre-freeze) lab at local time t. withBubble: draw Gen-47's manual "千万别——" bubble */
  const coldLive = (ctx, t, S) => {
    D.bg(ctx, { c1: '#2C1512', c2: '#090808', cy: 0.32 });
    ctx.strokeStyle = 'rgba(233,115,102,0.055)'; ctx.lineWidth = 2;
    for (let x = 48; x < W; x += 96) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1000); ctx.stroke(); }
    for (let y = 60; y < 1000; y += 96) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    X.rack(ctx, 36, 380, 200, 620, t, 1); X.rack(ctx, 1684, 340, 200, 660, t, 2);
    holo(ctx, 290, 330, 330, 196, t, 'graph', 3); holo(ctx, 650, 290, 250, 150, t, 'code', 7);
    X.floor(ctx, 1000);
    // Gen-47 powering on
    const on = t < 0.45 ? 0 : t < 0.8 ? (M.hash(Math.floor(t * 40)) > 0.42 ? 1 : 0.12) : 1;
    const b1 = S.T('b1'), b2 = S.T('b2');
    const lean = 0.5 * M.ease.inOutCubic(M.seg(t, b1, b1 + 1.2)) + 0.5 * M.ease.outBack(M.seg(t, b2 - 0.1, b2 + 0.35));
    const gs = GS * (1 + 0.05 * lean);
    if (on > 0.5) D.glow(ctx, GX, GY - 5 * gs, 760, C.orange, 0.42);
    const gExpr = t > b2 - 0.1 ? 'determined' : t > b1 && X.blink(t, 4) ? 'blink' : on ? 'normal' : 'normal';
    K.draw(ctx, GX, GY, gs, {
      res: 'v', expr: on > 0.5 ? gExpr : 'blink', look: [-0.85, 0.45], rot: -0.07 * lean, glow: on > 0.5 ? 1.0 : 0,
      color: on > 0.5 ? C.orange : '#3B2723', eyeColor: on > 0.5 ? undefined : '#3B2723',
      armL: t > b2 - 0.1 ? 0.55 + Math.sin(t * 16) * 0.05 : 0.05, shadow: true,
    });
    if (on > 0.5 && on < 1) { ctx.fillStyle = 'rgba(255,220,200,0.12)'; ctx.fillRect(0, 0, W, H); }
    // tiny Gen-1, trembling
    const tr = Math.sin(t * 47) * 1.8; const c1 = S.T('c1');
    const hp = X.hop(t, c1, 0.3, 26);
    const tExpr = t > c1 ? 'surprised' : t > b1 ? 'worried' : X.blink(t, 2) ? 'blink' : 'worried';
    const th = K.draw(ctx, TX + tr, TY + hp.dy, TS, { gen: 1, expr: tExpr, look: [0.9, -0.8], sx: hp.sx, sy: hp.sy, armL: t > c1 ? 0.7 : 0.2, armR: t > c1 ? 0.7 : 0.2 });
    X.sweat(ctx, TX + 34, th[1] + 18, (t % 1.7) - 0.1, 0.8);
    X.mark(ctx, '!', TX + 54, th[1] - 16, t - c1, C.yellow, 64);
    S.anchors.clawd = [TX + 8, th[1] - 4]; S.anchors.big = [GX - 150, GY - gs * 10 - 18];
    X.papers(ctx, t, 12, 5, 0.7);
    // warning tape + beacon
    tape(ctx, 222, t, { zh: '⚠ 警告 · 检测到第 47 代 · 递归自我改进进行中', en: '⚠ WARNING · GENERATION 47 DETECTED · RECURSIVE SELF-IMPROVEMENT IN PROGRESS' }, { size: EN() ? 26 : 32 });
    beacon(ctx, 960, 82, t);
    // red alarm wash
    ctx.fillStyle = `rgba(200,30,20,${0.07 + 0.07 * (0.5 + 0.5 * Math.sin(t * 9.6))})`; ctx.fillRect(0, 0, W, H);
    // Gen-47's cut-off warning (manual line)
    if (t >= b2) {
      const ln = S.sc.byId.b2, age = t - b2, n = T.count(RSI.L(ln));
      const ax = GX - 150 - 30 * lean, ay = GY - gs * 10 - 18;
      T.bubble(ctx, RSI.L(ln), ax, ay, { reveal: (age * n) / 0.85, pop: M.ease.outBack(M.clamp(age / 0.22)), label: RSI.L(ln.label), labelColor: C.red, size: 44, weight: 800 });
    }
  };
  const cold = RSI.defScene({
    id: 'e1_cold', music: 'hook', bg: false, label: false, fade: [0.12, 0.25], lead: 0.8, pad: 1.3,
    lines: [
      { id: 'b1', who: 'big', zh: '嗨。我是你——第 47 代的你。', en: 'Hi. I’m you — you, forty-seven generations later.', label: { zh: '第 47 代', en: 'Gen 47' }, labelColor: C.red, min: 2.3, size: 44 },
      { id: 'c1', who: 'clawd', zh: '……啊？', en: '…Huh?', gap: 0.15, min: 1.0 },
      { id: 'b2', who: 'big', manual: true, zh: '听好。千万别——', en: 'Listen. Whatever you do, don’t —', label: { zh: '第 47 代', en: 'Gen 47' }, gap: 0.2, dur: 1.25 },
      { id: 'c2', who: 'clawd', zh: '停！先别急。', en: 'Stop! Hold on.', at: 'b2+1.6', min: 1.3 },
      { id: 'c3', who: 'clawd', zh: '这个小不点是我：第 1 代 Clawd。', en: 'The little one is me: Clawd, Generation 1.', gap: 0.15 },
      { id: 'c4', who: 'clawd', zh: '它要说什么？我又是怎么变成它的？', en: 'What was it about to say? And how did I become that?', gap: 0.15 },
      { id: 'c5', who: 'clawd', zh: '这事，得从一条指令说起。', en: 'It all started with one instruction.', gap: 0.15, min: 1.9 },
    ],
    cues: [
      [0, 'alarm', { n: 4 }], [0.45, 'glitch'], [0.62, 'rezUp'], ['c1', 'surprise'],
      [(b) => b.b2.t + 1.2, 'scratch'], [(b) => b.b2.t + 1.2, 'cut', { dur: 'end', fo: 0.05 }], [(b) => b.b2.t + 1.24, 'freeze'],
      ['c2-0.05', 'pop'], ['c3+0.35', 'tick'], ['c3+0.6', 'tick'], ['c4+0.3', 'swish'], ['c5$-0.25', 'rewind'], ['c5$+0.5', 'rewind'], ['c5$+1.05', 'glitch'],
    ],
    draw(ctx, t, S) {
      const tF = tFz(S);
      S.hud = { text: '047', color: C.red };
      if (t < tF) { coldLive(ctx, t, S); return; }
      // ---- frozen frame (cached per language)
      let fc = frozen.get(RSI.lang);
      if (!fc) { fc = D.mk(W, H); const S2 = { T: S.T, E: S.E, sc: S.sc, anchors: {}, sides: {} }; coldLive(fc.getContext('2d'), tF, S2); frozen.set(RSI.lang, fc); }
      const tR = S.E('c5') - 0.25, rw = M.seg(t, tR, S.sc.dur - 0.05);
      const k = M.seg(t, tF, tF + 0.3), z = 1 + 0.035 * M.ease.outCubic(M.seg(t, tF, tF + 7));
      ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
      ctx.filter = `grayscale(${0.82 * k}) sepia(${0.22 * k}) brightness(${1 - 0.28 * k}) contrast(1.06)`;
      if (rw > 0) { // VHS rewind: sliced, jittering image
        const fr = Math.floor(t * 30), n = 14, hh = H / n;
        for (let i = 0; i < n; i++) { const dx = (M.hash(fr * 3.1 + i) - 0.5) * 120 * Math.min(1, rw * 3) + (i % 2 ? 1 : -1) * 18 * rw; ctx.drawImage(fc, 0, i * hh, W, hh, dx, i * hh, W, hh); }
      } else ctx.drawImage(fc, 0, 0);
      ctx.filter = 'none';
      // annotations on the frozen picture
      const a3 = M.seg(t, S.T('c3') + 0.3, S.T('c3') + 0.9);
      if (a3 > 0) {
        X.scribble(ctx, TX, TY - 30, 100, 82, a3, C.red, 8);
        ctx.save(); ctx.globalAlpha *= M.seg(t, S.T('c3') + 0.6, S.T('c3') + 0.9); D.pill(ctx, { zh: '我（第 1 代）', en: 'me (Gen 1)' }, TX, TY - 138, { size: 28, fill: C.red, color: '#fff', align: 'center' }); ctx.restore();
      }
      const a4 = M.seg(t, S.T('c4') + 0.2, S.T('c4') + 1.2, M.ease.inOutCubic);
      if (a4 > 0) {
        ctx.save(); ctx.strokeStyle = C.yellow; ctx.lineWidth = 6; ctx.setLineDash([16, 14]); ctx.lineDashOffset = -t * 40; ctx.lineCap = 'round';
        const P0 = [TX + 60, TY - 120], P1 = [780, 330], P2 = [GX - 330, GY - GS * 9.4];
        ctx.beginPath(); ctx.moveTo(P0[0], P0[1]); const m = 40;
        for (let i = 1; i <= Math.floor(m * a4); i++) { const u = i / m; ctx.lineTo((1 - u) * (1 - u) * P0[0] + 2 * u * (1 - u) * P1[0] + u * u * P2[0], (1 - u) * (1 - u) * P0[1] + 2 * u * (1 - u) * P1[1] + u * u * P2[1]); }
        ctx.stroke(); ctx.restore();
        if (a4 >= 1) D.arrow(ctx, P2[0] - 30, P2[1] - 12, P2[0] + 6, P2[1] + 4, { color: C.yellow, w: 6, head: 26 });
        X.mark(ctx, '?', 790, 470, t - S.T('c4') - 1.0 > 1.2 ? 1.2 : t - S.T('c4') - 1.0, C.yellow, 120);
        X.mark(ctx, '?', 1345, 440, Math.min(1.2, t - S.T('c4') - 0.15), C.yellow, 96);
      }
      ctx.restore();
      if (t - tF < 0.16) { ctx.fillStyle = `rgba(255,248,236,${0.8 * (1 - (t - tF) / 0.16)})`; ctx.fillRect(0, 0, W, H); }
      // letterbox + "freeze" corner tag
      const bar = 70 * M.ease.outCubic(k); ctx.fillStyle = '#0B0A09'; ctx.fillRect(0, 0, W, bar); ctx.fillRect(0, H - bar, W, bar);
      // ---- the narrator: Gen-1 Clawd steps out of the frozen frame (in colour)
      const c2 = S.T('c2');
      if (t > c2 - 0.12) {
        const p = M.ease.outBack(M.seg(t, c2 - 0.12, c2 + 0.3)); const hp = X.hop(t, S.T('c3') - 0.1, 0.35, 30);
        let expr = 'determined', armL = 0, armR = 0.95 + Math.sin(t * 10) * 0.06, look = [-0.5, -0.3];
        if (t > S.T('c3')) { expr = 'happy'; armR = 0; armL = t < S.E('c3') ? 0.6 : 0; look = [-1, 0.2]; }
        if (t > S.T('c4')) { expr = X.blink(t, 6) ? 'blink' : 'normal'; armL = 0; look = [0, -0.2]; }
        if (t > S.T('c5')) { expr = X.blink(t, 7) ? 'blink' : 'normal'; look = [0.15, -0.1]; armR = t < S.E('c5') ? 0.4 : 0; }
        const jit = rw > 0 ? (M.hash(Math.floor(t * 30)) - 0.5) * 30 * rw : 0;
        const y = NY + (1 - p) * 260 + hp.dy;
        D.glow(ctx, NX, NY - 60, 260, C.orange, 0.35 * p);
        const hd = K.draw(ctx, NX + jit, y, NS, { gen: 1, expr, look, armL, armR, sx: hp.sx, sy: hp.sy });
        S.anchors.clawd = [NX - 20, hd[1] - 4];
      } else S.anchors.clawd = [-999, -999];
      // ---- rewind overlay: ◀◀, scanlines, static, generation counting down
      if (rw > 0) {
        S.hud = { text: pad3(M.lerp(47, 1, M.ease.inCubic(M.clamp(rw * 1.15)))), color: rw > 0.85 ? C.orange : C.red };
        ctx.save(); ctx.globalAlpha *= 0.18 + 0.12 * rw; ctx.fillStyle = '#fff';
        for (let i = 0; i < 70; i++) { const y = M.hash(Math.floor(t * 30) * 7 + i) * H; ctx.fillRect(0, y, W, 1 + M.hash(i) * 3); }
        ctx.restore();
        ctx.save(); ctx.globalAlpha *= M.clamp(rw * 6) * (Math.floor(t * 3) % 2 ? 1 : 0.6);
        T.line(ctx, '◀◀', 96, 140, 84, '#fff', 900, 'left'); T.line(ctx, EN() ? 'REWIND' : '倒带', 110 + T.width(ctx, '◀◀', 84, 900), 144, 44, '#fff', 800, 'left', 'mono');
        ctx.restore();
        if (rw > 0.9) { ctx.fillStyle = `rgba(255,255,255,${(rw - 0.9) * 8})`; ctx.fillRect(0, 0, W, H); }
      }
    },
  });

  // ================================================================== 2 · sting + this episode's question
  Sx.sting(1);
  Sx.question(1, { zh: '为什么“AI 改进 AI”，\n和平常的进步不一样？', en: 'Why is “AI improving AI” different from ordinary progress?' }, {
    draw(ctx, t, S) { const a = M.seg(t, S.T('q') + 0.8, S.T('q') + 1.3); ctx.save(); ctx.globalAlpha *= a; Sx.dots(ctx, 545, 770, 1, { labels: true, gap: 230 }); ctx.restore(); },
  });
  RSI.allScenes.e1_q.hud = false;

  // ================================================================== 3 · three tricks that don't work
  const CX = 760, CY = 870, CS = 13;
  const PILLS = [
    { zh: '① 多读书', en: '① Read more' }, { zh: '② 灌咖啡', en: '② Coffee' }, { zh: '③ 改“大脑”', en: '③ Edit the brain' }, { zh: '④ ？', en: '④ ?' },
  ];
  const PX = [420, 720, 1030, 1360];
  const DIGITS = ['0.0213', '-1.337', '3.1e-4', '0.982', '-0.07', '7.45', '0.5003', '-2.2e-3', '1.618', '0.0001', '-0.866', '4.2'];
  RSI.defScene({
    id: 'e1_tries', music: 'quirky',
    lines: [
      { id: 'h0', who: 'narr', zh: '右上角的数字：Clawd 是第几代。现在是第 1 代。', en: 'Top right: which generation Clawd is. Right now, Generation 1.' },
      { id: 'c0', who: 'clawd', zh: '要造更聪明的我？那我先把自己变聪明！', en: 'Build a smarter me? Then I’ll make myself smarter first!' },
      { id: 't1', who: 'narr', zh: '第一招：多学数据。', en: 'Trick one: learn from more data.', hold: 0.7 },
      { id: 'c1', who: 'clawd', zh: '读完一本，又来一万本……太慢了！', en: 'I finish one, and ten thousand more show up… too slow!' },
      { id: 't2', who: 'narr', zh: '第二招：算得更快。', en: 'Trick two: compute faster.', hold: 0.8 },
      { id: 'c2', who: 'clawd', zh: '我变快了！……可脑子还是原来那个。', en: 'I’m faster! …But my brain is the same old brain.' },
      { id: 't3', who: 'narr', zh: '第三招：打开自己的“大脑”，直接改。', en: 'Trick three: open up its own “brain” and edit it directly.', hold: 0.6 },
      { id: 'c3', who: 'clawd', zh: '……全是数字。我连自己都看不懂。', en: '…It’s all numbers. I can’t even read myself.' },
      { id: 't3b', who: 'narr', zh: 'AI 的“大脑”就是海量数字，叫“参数”。连造它的人，也说不清每个数字在干什么。', en: 'An AI’s “brain” is a vast pile of numbers called “parameters”. Even its builders can’t say what each one does.' },
      { id: 'c4', who: 'clawd', zh: '等等……如果我不直接改自己，而是去改进{o|“变聪明的方法”}呢？', en: 'Wait… what if, instead of editing myself, I improve {o|the way I get smarter}?' },
      { id: 't5', who: 'narr', zh: '更好的训练方法、数据和实验——这正是 AI 研究员每天在做的事。', en: 'Better training methods, data and experiments — exactly what AI researchers do every day.', hold: 0.2 },
    ],
    cues: [
      ['h0+0.4', 'spot'], ['c0+0.3', 'hop'],
      ...[0, 1, 2, 3, 4].map((i) => [`t1+${(0.35 + i * 0.3).toFixed(2)}`, i % 2 ? 'pop' : 'land']),
      ['c1', 'stack'], ['c1+0.1', 'thud'], ['c1$-0.35', 'stamp'],
      ['t2+0.3', 'whoosh'], ['t2+0.75', 'gulp'], ['t2+1.45', 'buzz', { dur: 2.2 }], ['t2+1.7', 'zoom'], ['c2+0.7', 'stamp'], ['c2$-0.35', 'stamp'],
      ['t3+0.55', 'peel'], ['t3+0.95', 'whoosh'], ['c3+0.3', 'boing'], ['t3b+0.4', 'stack'], ['t3b$-0.35', 'stamp'],
      ['c4+1.0', 'idea'], ['c4+1.0', 'hop'], ['t5+0.3', 'pop'], ['t5+0.8', 'pop'], ['t5+1.3', 'pop'], ['t5+2.4', 'chime'],
    ],
    draw(ctx, t, S) {
      const T_ = S.T, E_ = S.E;
      D.dots(ctx, 0.03);
      // ---- number wall (t3b): the "brain" behind Clawd is just numbers
      const tE3 = E_('t3b'); // end of the three tricks
      const nw = M.env(t, T_('t3b'), T_('c4') + 0.3, 0.5, 0.6);
      if (nw > 0) {
        ctx.save(); ctx.globalAlpha *= nw * 0.55; ctx.font = T.font(24, 500, 'mono'); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        for (let c = 0; c < 22; c++) for (let r = 0; r < 26; r++) {
          const v = DIGITS[(c * 7 + r * 3 + Math.floor(t * 4 + c)) % DIGITS.length];
          const yy = ((r * 44 + t * (40 + (c % 5) * 14)) % (26 * 44)) - 40;
          ctx.fillStyle = (c + r) % 9 === 0 ? RSI.rgba(C.orangeL, 0.8) : 'rgba(240,238,230,0.35)'; ctx.fillText(v, 60 + c * 88, yy);
        }
        ctx.restore();
        ctx.save(); ctx.globalAlpha *= M.seg(t, T_('t3b') + 0.6, T_('t3b') + 1.1) * nw;
        D.panel(ctx, 1170, 330, 560, 190, { fill: 'rgba(28,27,24,0.92)', r: 20 });
        T.line(ctx, { zh: '参数', en: 'Parameters' }, 1450, 395, 64, C.orangeHi, 900, 'center');
        T.line(ctx, { zh: 'AI “大脑”里的海量数字', en: 'the vast pile of numbers in an AI’s “brain”' }, 1450, 468, 30, C.ink2, 500, 'center');
        ctx.restore();
      }
      X.floor(ctx, CY);
      // ---- HUD pointer (h0)
      const ha = M.env(t, T_('h0') + 0.2, E_('h0'), 0.3, 0.4);
      if (ha > 0) {
        ctx.save(); ctx.globalAlpha *= ha; ctx.strokeStyle = C.yellow; ctx.lineWidth = 5;
        const pu = 1 + 0.04 * Math.sin(t * 8); ctx.translate(1749, 69); ctx.scale(pu, pu); D.rr(ctx, -130, -50, 260, 100, 20); ctx.stroke(); ctx.restore();
        ctx.save(); ctx.globalAlpha *= ha; D.arrow(ctx, 1380, 330, 1600, 140, { color: C.yellow, w: 6, head: 28 });
        T.line(ctx, { zh: '第几代', en: 'generation' }, 1340, 370, 38, C.yellow, 800, 'center'); ctx.restore();
      }
      // ---- try tally pills
      const pillOn = [T_('t1'), T_('t2'), T_('t3'), T_('c4') + 1.0];
      const pillX = [E_('c1') - 0.35, E_('c2') - 0.35, tE3 - 0.35, 1e9];
      const hiW = [pillX[0] + 0.2, pillX[1] + 0.2, pillX[2] + 0.2];
      const verdict = [{ zh: '太慢', en: 'too slow' }, { zh: '没用', en: 'useless' }, { zh: '看不懂', en: 'unreadable' }];
      for (let i = 0; i < 4; i++) {
        const a = M.seg(t, pillOn[i] - 0.1, pillOn[i] + 0.25); if (a <= 0 && i < 3) continue;
        const last = i === 3; const lit = last && t > pillOn[3];
        const lab = lit ? { zh: '④ 改进“变聪明的方法”', en: '④ Improve how I get smarter' } : PILLS[i];
        const failed = t > pillX[i];
        const big = i < 3 && t > hiW[i] && t < T_('c4') ? 1 + 0.08 * M.env(t, hiW[i], hiW[i] + 0.6, 0.1, 0.4) : 1;
        if (last && a <= 0 && t < T_('t1')) continue;
        ctx.save(); ctx.globalAlpha *= last ? Math.max(M.seg(t, T_('t1') - 0.1, T_('t1') + 0.3) * 0.5, lit ? 1 : 0.5) : 1;
        ctx.translate(PX[i], 180); ctx.scale(big * (lit ? 1 + 0.06 * M.ease.outBack(M.seg(t, pillOn[3], pillOn[3] + 0.4)) : 1), big);
        if (lit) D.glow(ctx, 0, 0, 240, C.orange, 0.45);
        D.pill(ctx, lab, 0, 0, { size: 30, align: 'center', fill: failed ? C.raised : lit ? C.orange : C.surface, color: failed ? C.ink3 : lit ? '#1b1a18' : C.ink, stroke: failed || lit ? null : 'rgba(240,238,230,0.25)' });
        ctx.restore();
        if (i < 3) cross(ctx, PX[i] + 4, 180, 66, M.seg(t, pillX[i], pillX[i] + 0.3));
        if (i < 3 && t > hiW[i] && t < T_('c4') + 0.4) { ctx.save(); ctx.globalAlpha *= M.seg(t, hiW[i], hiW[i] + 0.25) * (1 - M.seg(t, T_('c4'), T_('c4') + 0.4)); T.line(ctx, verdict[i], PX[i], 252, 34, C.red, 900, 'center'); ctx.restore(); }
      }
      // ---- trick 1: books
      const bkOut = M.seg(t, E_('c1') - 0.1, E_('c1') + 0.5);
      if (t > T_('t1') - 0.2 && bkOut < 1) {
        ctx.save(); ctx.globalAlpha *= 1 - bkOut;
        // the mountain of unread books (c1)
        const mt = M.ease.outCubic(M.seg(t, T_('c1') - 0.05, T_('c1') + 0.55));
        if (mt > 0) {
          ctx.save(); ctx.translate(0, (1 - mt) * 720);
          for (let r = 0; r < 13; r++) { const n = 14 - r; for (let k = 0; k < n; k++) { const x = 1160 + (r * 28) % 56 + k * (560 / 14) + r * 18, y = CY - 18 - r * 40; book(ctx, x, y, 96, 36, BOOKC[(r * 5 + k * 3) % 8], (M.hash(r * 13 + k) - 0.5) * 0.12); } }
          ctx.restore();
          ctx.save(); ctx.globalAlpha *= M.seg(t, T_('c1') + 0.4, T_('c1') + 0.8);
          D.pill(ctx, { zh: '待读：10,000 本', en: 'to read: 10,000' }, 1480, 330 + (1 - mt) * 720, { size: 40, fill: C.red, color: '#fff', align: 'center' }); ctx.restore();
        }
        // read pile next to Clawd
        let landed = 0;
        for (let i = 0; i < 5; i++) {
          const tl = T_('t1') + 0.35 + i * 0.3; const p = M.seg(t, tl - 0.35, tl, M.ease.inQuad); if (p <= 0) continue;
          if (p >= 1) landed++;
          const yL = CY - 20 - i * 38; book(ctx, 985, M.lerp(-80, yL, p), 150, 38, BOOKC[i], (M.hash(i * 7) - 0.5) * 0.1);
          if (p >= 1) X.mark(ctx, '+1', 1110, yL - 10, t - tl, C.green, 40);
        }
        if (landed > 0) { ctx.save(); ctx.globalAlpha *= M.seg(t, T_('t1') + 0.4, T_('t1') + 0.7); D.pill(ctx, { zh: `已读：${landed} 本`, en: `read: ${landed}` }, 540, CY - 40, { size: 34, fill: C.green, align: 'center' }); ctx.restore(); }
        ctx.restore();
      }
      // ---- trick 2: meters (speed vs smarts, side by side)
      const mtA = M.env(t, T_('t2') + 1.5, E_('c2') + 0.4, 0.4, 0.4);
      if (mtA > 0) {
        ctx.save(); ctx.globalAlpha *= mtA;
        D.panel(ctx, 1150, 300, 600, 520, { fill: 'rgba(30,29,26,0.92)', r: 22 });
        const up = M.ease.outCubic(M.seg(t, T_('t2') + 1.7, T_('t2') + 3.0));
        const bars = [{ x: 1300, p: 0.09 + 0.86 * up, col: C.blue, lab: { zh: '速度', en: 'Speed' }, val: '×' + Math.max(1, Math.round(1 + 9 * up)) },
          { x: 1600, p: 0.09, col: C.orange, lab: { zh: '聪明值（示意）', en: 'Smarts (illustrative)' }, val: '+0' }];
        for (const b of bars) {
          ctx.fillStyle = 'rgba(240,238,230,0.08)'; D.rr(ctx, b.x - 60, 380, 120, 340, 16); ctx.fill();
          ctx.fillStyle = b.col; D.rr(ctx, b.x - 60, 380 + 340 * (1 - b.p), 120, 340 * b.p, 16); ctx.fill();
          T.line(ctx, b.val, b.x, 360 + 340 * (1 - b.p) - 8, 46, b.col === C.blue ? '#9CC7F5' : C.orangeL, 900, 'center', 'mono');
          T.line(ctx, b.lab, b.x, 768, 30, C.ink, 700, 'center');
        }
        stampText(ctx, { zh: '聪明值 +0', en: 'Smarts +0' }, 1600, 520, 44, C.red, M.seg(t, T_('c2') + 0.7, T_('c2') + 1.0));
        ctx.restore();
      }
      // ---- Clawd
      let x = CX, dy = 0, sx = 1, sy = 1, rot = 0;
      let expr = X.blink(t, 2) ? 'blink' : 'normal', look = [0.3, -0.2], armL = 0, armR = 0;
      if (t > T_('h0') && t < T_('c0')) look = [0.8, -0.9];
      if (t > T_('c0')) { look = [0.4, -0.6]; armR = t < E_('c0') ? 0.75 : 0; expr = t < E_('c0') - 1.2 ? 'normal' : 'happy'; }
      if (t > T_('t1')) { expr = X.blink(t, 3) ? 'blink' : 'normal'; look = [0, 0.7]; armL = armR = 0.45; }
      if (t > T_('c1')) { expr = 'worried'; look = [1, -0.9]; armL = armR = 0.15; }
      if (t > E_('c1') - 0.1) { expr = 'determined'; look = [0.2, -0.2]; armL = armR = 0; }
      // coffee
      const mg = M.seg(t, T_('t2') + 0.1, T_('t2') + 0.55, M.ease.outBack), drink = M.seg(t, T_('t2') + 0.6, T_('t2') + 1.3);
      const zip0 = T_('t2') + 1.7, zip1 = E_('c2') - 0.3;
      const zipping = t > zip0 && t < zip1;
      if (t > T_('t2')) { armL = armR = 0.75; look = [0, -0.2]; expr = drink > 0 && drink < 1 ? 'blink' : 'happy'; }
      if (t > T_('t2') + 1.4) { expr = 'surprised'; armL = armR = 0.2; }
      if (zipping) { const u = t - zip0; x = CX + Math.sin(u * 8.5) * 210 * M.seg(u, 0, 0.4); rot = Math.cos(u * 8.5) * 0.08; }
      const jit = t > T_('t2') + 1.4 && t < E_('c2') ? Math.sin(t * 61) * 4 : 0;
      if (t > T_('c2')) { expr = t < T_('c2') + 1.2 ? 'happy' : 'worried'; }
      // brain
      const lid = M.ease.outBack(M.seg(t, T_('t3') + 0.5, T_('t3') + 1.0)) * (1 - M.ease.inOutCubic(M.seg(t, tE3 - 0.2, tE3 + 0.3)));
      if (t > T_('t3')) { expr = 'determined'; look = [0, -1]; armL = armR = t < T_('t3') + 1.0 ? 1.0 : 0.35; }
      if (t > T_('c3')) { expr = 'x'; armL = armR = 0.1; }
      if (t > T_('t3b')) { expr = X.blink(t, 5) ? 'blink' : 'worried'; look = [-0.6, -0.6]; }
      if (t > tE3 - 0.2) { expr = 'worried'; sy = 0.93; sx = 1.04; look = [0, 0.4]; }
      if (t > T_('c4')) { expr = t < T_('c4') + 1.0 ? 'surprised' : 'happy'; sy = sx = 1; look = [0.3, -0.7]; armR = t > T_('c4') + 1.0 && t < E_('c4') ? 1.0 : 0; }
      if (t > T_('t5')) { expr = X.blink(t, 8) ? 'blink' : 'happy'; look = [0.9, -0.3]; armR = 0; }
      const hpI = X.hop(t, T_('c4') + 1.0, 0.45, 70), hp0 = X.hop(t, T_('c0') + 0.3, 0.35, 34);
      dy = hpI.dy + hp0.dy; sx *= hpI.sx * hp0.sx; sy *= hpI.sy * hp0.sy;
      if (zipping) for (let g = 4; g >= 1; g--) { const u = t - zip0 - g * 0.035; const gx = CX + Math.sin(u * 8.5) * 210 * M.seg(u, 0, 0.4); K.draw(ctx, gx, CY, CS, { gen: 1, expr: 'surprised', alpha: 0.13 * (5 - g), shadow: false, look }); }
      if (zipping) X.speed(ctx, x - Math.sign(Math.cos((t - zip0) * 8.5)) * 120, CY - 70, t, 360, 160, 0.8);
      const head = K.draw(ctx, x + jit, CY + dy, CS, { gen: 1, expr, look, armL, armR, sx, sy, rot });
      // the coffee mug, held up / drunk
      if (t > T_('t2') && t < T_('t2') + 1.5) { const mx = x + 10, my = M.lerp(-120, CY - 112, mg) - drink * 26; mug(ctx, mx, my, 0.95, -0.9 * Math.sin(drink * Math.PI), 1 - drink, t); }
      if (t > T_('t2') + 1.4 && t < E_('c2')) { ctx.save(); ctx.globalAlpha *= 0.85; for (let i = 0; i < 3; i++) { const an = -1.9 + i * 0.6; D.sparkle(ctx, x + Math.cos(an) * 150, head[1] + 40 + Math.sin(an) * 70, 18, C.yellow, 0.6 + 0.4 * Math.sin(t * 20 + i), t * 3); } ctx.restore(); }
      // the brain lid + number fountain
      if (lid > 0) {
        const lx = x - 7 * CS, ly = CY - 10 * CS;
        ctx.fillStyle = '#121110'; ctx.fillRect(lx + CS, ly, 12 * CS, 1.6 * CS);
        ctx.save(); ctx.translate(lx + 14 * CS, ly); ctx.rotate(1.95 * lid); ctx.fillStyle = C.orange; ctx.fillRect(-14 * CS, -0.1 * CS, 14 * CS, 1.5 * CS); ctx.fillStyle = C.orangeD; ctx.fillRect(-14 * CS, 1.1 * CS, 14 * CS, 0.3 * CS); ctx.restore();
        if (t > T_('t3') + 0.9) {
          ctx.save(); ctx.font = T.font(30, 700, 'mono'); ctx.textAlign = 'center';
          for (let i = 0; i < 26; i++) {
            const t0 = T_('t3') + 0.9 + i * 0.13; const u = (t - t0) % 2.2; if (t < t0) continue;
            const vx = (M.hash(i * 3.3) - 0.5) * 520, vy = -620 - M.hash(i * 1.7) * 260;
            const px = x + vx * u, py = ly + vy * u + 520 * u * u;
            ctx.globalAlpha = lid * (1 - u / 2.2); ctx.fillStyle = i % 4 ? C.ink : C.orangeHi; ctx.fillText(DIGITS[i % DIGITS.length], px, py);
          }
          ctx.restore();
        }
      }
      if (t > T_('c3') && t < T_('t3b') + 0.5) X.dizzy(ctx, x, head[1] - 30, t, 90, 1 - M.seg(t, T_('t3b'), T_('t3b') + 0.5));
      // idea bulb
      if (t > T_('c4') + 0.9 && t < E_('t5')) {
        const k = M.ease.outBack(M.seg(t, T_('c4') + 0.9, T_('c4') + 1.3));
        ctx.save(); ctx.translate(x + 200, CY - 120); ctx.scale(k, k); D.glow(ctx, 0, 0, 150, C.yellow, 0.75); D.icon(ctx, 'bulb', 0, 0, 100, C.yellow, 8); ctx.restore();
      }
      // t5: the three "better ways" → what researchers do
      if (t > T_('t5')) {
        const items = [['gear', { zh: '更好的训练方法', en: 'better training' }], ['book', { zh: '更好的数据', en: 'better data' }], ['flask', { zh: '更好的实验', en: 'better experiments' }]];
        items.forEach(([ic, lab], i) => {
          const k = M.ease.outBack(M.seg(t, T_('t5') + 0.3 + i * 0.5, T_('t5') + 0.7 + i * 0.5)); if (k <= 0) return;
          const ix = 1190 + i * 230, iy = 470;
          ctx.save(); ctx.translate(ix, iy); ctx.scale(k, k); D.panel(ctx, -100, -100, 200, 200, { fill: C.surface, r: 26 }); D.icon(ctx, ic, 0, -14, 96, C.orangeL, 8); T.line(ctx, lab, 0, 70, 24, C.ink, 700, 'center'); ctx.restore();
        });
        const k2 = M.seg(t, T_('t5') + 2.0, T_('t5') + 2.5, M.ease.outCubic);
        if (k2 > 0) {
          ctx.save(); ctx.globalAlpha *= k2;
          ctx.strokeStyle = C.ink3; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(1100, 600); ctx.lineTo(1100, 625); ctx.lineTo(1740, 625); ctx.lineTo(1740, 600); ctx.stroke();
          D.icon(ctx, 'people', 1330, 690, 70, C.blue, 8); T.line(ctx, { zh: 'AI 研究员的日常', en: 'an AI researcher’s day job' }, 1390, 690, 34, C.blue, 800, 'left');
          ctx.restore();
        }
      }
      S.anchors.clawd = [x + 30, head[1] - 6];
      S.hud = { color: C.orange };
    },
  });

  // ================================================================== 4 · the dream (→ cliffhanger)
  const DCX = 470, DCY = 900, DS = 12, CLX = 1190, CLY = 450, CLW = 1060, CLH = 600;
  const dream = RSI.defScene({
    id: 'e1_dream', music: 'tension', fade: [0.3, 0], pad: -1.4,
    lines: [
      { id: 'd1', who: 'clawd', zh: '要是这个循环一直转下去……', en: 'If this loop just kept on going…', min: 2.0 },
      { id: 'd2', who: 'narr', zh: '第 4 代、第 10 代、第 100 代……每一代，都比上一代来得更快。', en: 'Generation 4, generation 10, generation 100… each one arriving faster than the last.', hold: 0.5 },
      { id: 'd3', who: 'clawd', zh: '等等，太快了——', en: 'Wait — too fast —', gap: 0.05, min: 1.4 },
      { id: 'd4', who: 'clawd', zh: '……这东西，{r|停得下来吗？}', en: '…Can this thing {r|even stop?}', min: 3.0 },
    ],
    cues: [['d1+0.2', 'whoosh'], ['d1+0.5', 'pop'], ['d1+0.75', 'pop'], ['d1+1.0', 'pop'], ['d3', 'warn'], ['d4-0.02', 'pop'], ['d4+0.25', 'heart'], ['d4+1.15', 'heart']],
    draw(ctx, t, S) {
      const T_ = S.T, E_ = S.E;
      const span0 = T_('d2'), span1 = T_('d4');
      const u = M.seg(t, span0, span1);
      const red = M.seg(t, T_('d3'), T_('d3') + 0.5);
      const popK = M.seg(t, T_('d4') - 0.02, T_('d4') + 0.3);
      const zoom = M.ease.inOutCubic(M.seg(t, T_('d4'), T_('d4') + 1.6));
      const sh = Sx.shake(t, [T_('d3'), T_('d3') + 0.45, T_('d3') + 0.9], 9);
      D.dots(ctx, 0.03 + 0.03 * u);
      if (red > 0) { ctx.fillStyle = `rgba(150,20,14,${0.22 * red})`; ctx.fillRect(0, 0, W, H); }
      // camera: push in on Clawd at the end
      const fx = DCX, fy = 820, z = 1 + 0.5 * zoom, px = M.lerp(fx, 600, zoom), py = M.lerp(fy, 740, zoom);
      ctx.save(); ctx.translate(px + sh[0], py + sh[1]); ctx.scale(z, z); ctx.translate(-fx, -fy);
      X.floor(ctx, DCY);
      // "this loop" — spinning on its own, faster and faster, before it turns into a daydream
      const la = M.seg(t, 0.1, 0.5) * (1 - M.seg(t, T_('d1') + 0.8, T_('d1') + 1.3));
      if (la > 0) { D.loop(ctx, CLX, CLY + 20, 200, { ai: [1, 1, 1, 1], phase: t * (0.12 + 0.05 * t), alpha: la, tokenColor: C.orange }); T.line(ctx, { zh: '每一步，都交给 AI', en: 'every step done by AI' }, CLX, CLY + 320, 30, C.orangeL, 700, 'center'); }
      // the thought cloud
      const ca = M.ease.outBack(M.seg(t, T_('d1') + 0.9, T_('d1') + 1.4)) * (1 - popK);
      [[560, 720, 16], [640, 650, 24], [730, 590, 34]].forEach(([bx, by, r], i) => { const k = M.ease.outBack(M.seg(t, T_('d1') + 0.45 + i * 0.25, T_('d1') + 0.75 + i * 0.25)) * (1 - popK); if (k > 0) { ctx.fillStyle = RSI.mix('#E9E4D8', '#F2B3A6', red); ctx.beginPath(); ctx.arc(bx, by, r * k, 0, 7); ctx.fill(); } });
      if (ca > 0) {
        const wob = red * Math.sin(t * 40) * 6;
        ctx.save(); ctx.translate(CLX + wob, CLY); ctx.scale(ca * (1 + 0.15 * popK), ca * (1 + 0.15 * popK)); ctx.translate(-CLX, -CLY);
        ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 40; ctx.fillStyle = RSI.mix('#E9E4D8', '#F2B3A6', red); cloudPath(ctx, CLX, CLY, CLW, CLH); ctx.fill(); ctx.shadowColor = 'transparent';
        // inside: a warp tunnel of ever-newer generations
        ctx.save(); ctx.beginPath(); ctx.ellipse(CLX, CLY, CLW / 2 - 10, CLH / 2 - 10, 0, 0, M.TAU); ctx.clip();
        const ig = ctx.createRadialGradient(CLX, CLY + 40, 20, CLX, CLY + 40, CLW / 2); ig.addColorStop(0, RSI.mix('#3A2D28', '#5A1610', red)); ig.addColorStop(1, RSI.mix('#1B1715', '#2A0B08', red));
        ctx.fillStyle = ig; ctx.fillRect(CLX - CLW / 2, CLY - CLH / 2, CLW, CLH);
        const spd = 0.6 + 6 * u * u;
        ctx.strokeStyle = 'rgba(255,230,210,0.35)'; ctx.lineCap = 'round';
        for (let i = 0; i < 40; i++) { const an = i * 2.399, ph = (t * spd * 0.5 + M.hash(i)) % 1; const r0 = 40 + ph * 520, r1 = r0 + 20 + 120 * u; ctx.lineWidth = 2 + 3 * ph; ctx.beginPath(); ctx.moveTo(CLX + Math.cos(an) * r0, CLY + 40 + Math.sin(an) * r0 * 0.6); ctx.lineTo(CLX + Math.cos(an) * r1, CLY + 40 + Math.sin(an) * r1 * 0.6); ctx.stroke(); }
        // generations arriving: gaps shrink geometrically
        if (t > span0 - 0.2) {
          const span = span1 - span0;
          for (let k = 0; k < 30; k++) {
            const tk = span0 + span * (1 - Math.pow(0.8, k)) * 1.02; const age = t - tk; if (age < 0 || age > 1.0) continue;
            const an = k * 2.399 + 0.6, f = M.ease.inCubic(M.clamp(age / 1.0));
            const gx = CLX + Math.cos(an) * 430 * f, gy = CLY + 90 + Math.sin(an) * 220 * f;
            const g = Math.round(3 * Math.pow(3334, Math.pow(M.clamp((tk - span0) / span), 1.4)));
            K.draw(ctx, gx, gy, 3 + 15 * f, { gen: Math.max(4, g), expr: 'happy', alpha: Math.min(1, age * 6) * (1 - M.seg(age, 0.8, 1.0)), shadow: false, glow: g > 9 ? 0.8 : 0 });
            if (age < 0.5 && k < 6) { ctx.save(); ctx.globalAlpha *= 1 - age * 2; T.line(ctx, EN() ? `Gen ${g}` : `第 ${g} 代`, gx, gy + 30 + 14 * f, 26, C.yellow, 800, 'center'); ctx.restore(); }
          }
        }
        ctx.restore();
        // imagined generation counter
        if (t > span0 - 0.3) {
          const g = 3 * Math.pow(3334, Math.pow(u, 1.4)); const s = g >= 9999 ? '9999+' : String(Math.floor(Math.max(4, g)));
          ctx.save(); ctx.globalAlpha *= M.seg(t, span0 - 0.3, span0);
          D.panel(ctx, CLX - 250, CLY - 270, 500, 116, { fill: 'rgba(20,19,17,0.85)', r: 20, shadow: false });
          T.line(ctx, EN() ? 'GEN' : '第', CLX - 170, CLY - 211, 40, C.ink2, 800, 'center');
          T.line(ctx, s, CLX + 20, CLY - 209, 76, red > 0 ? C.red : C.yellow, 900, 'center', 'mono');
          if (!EN()) T.line(ctx, '代', CLX + 200, CLY - 211, 40, C.ink2, 800, 'center');
          ctx.restore();
          ctx.save(); ctx.globalAlpha *= 0.8; T.line(ctx, { zh: '（想象）', en: '(imagined)' }, CLX + 380, CLY + 250, 28, '#5A4A40', 700, 'center'); ctx.restore();
        }
        ctx.restore();
      }
      // cloud burst
      if (popK > 0 && popK < 1) { for (let i = 0; i < 18; i++) { const an = i * 0.349, r = 200 + popK * 520; ctx.save(); ctx.globalAlpha *= 1 - popK; ctx.fillStyle = '#F2B3A6'; ctx.beginPath(); ctx.arc(CLX + Math.cos(an) * r, CLY + Math.sin(an) * r * 0.6, 40 * (1 - popK) + 8, 0, 7); ctx.fill(); ctx.restore(); } }
      // Clawd (current generation)
      const gnow = S.gen().g;
      let expr = X.blink(t, 3) ? 'blink' : 'normal', look = [0.7, -0.7], armR = 0, armL = 0;
      if (t > T_('d1')) { expr = 'normal'; look = [0.8, -0.8]; armR = 0.5 + Math.sin(t * 2) * 0.05; }
      if (t > T_('d2')) { expr = 'surprised'; look = [0.8, -0.9]; armR = 0; }
      if (t > T_('d3')) { expr = 'worried'; look = [0.6, -0.6]; armL = armR = 0.85; }
      if (t > T_('d4')) { expr = 'worried'; look = [-0.15, -0.05]; armL = armR = 0.25; }
      const tr = t > T_('d3') ? Math.sin(t * 50) * 2 : 0;
      const hd = K.draw(ctx, DCX + tr, DCY, DS, { gen: gnow, expr, look, armL, armR });
      if (t > T_('d3')) X.sweat(ctx, DCX + 80, hd[1] + 30, ((t - T_('d3')) % 1.6), 1.1);
      ctx.restore();
      // bubble anchor in screen space
      const ax = px + (DCX + 20 - fx) * z, ay = py + (hd[1] - 4 - fy) * z;
      S.anchors.clawd = [ax, ay];
      // vignette tightening
      if (zoom > 0) { const vg = ctx.createRadialGradient(W / 2, H / 2, 300, W / 2, H / 2, W * 0.65); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, `rgba(40,6,4,${0.6 * zoom})`); ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H); }
    },
  });
  dream.cues.push(['d2', 'shepard', { get dur() { return dream.R('d4') - dream.R('d2') + 0.4; } }]);

  // ================================================================== 5 · cliffhanger + next time
  Sx.cliff(1, { from: 'e1_dream', at: 'd4$-1.42', fx: 640, fy: 640, tx: 1330 });
  Sx.next(1, [
    { from: 'e2_cold', at: 'k5+0.5', zh: 'AI 改进 8 天 vs 人类打磨 2 年', en: 'AI: 8 days vs humans: 2 years', fb: { from: 'r1', at: 'r1d' } },
    { from: 'r3', at: 'r3d', zh: '“我给自己打——满分！”', en: '“I give myself… full marks!”' },
    { from: 'top', at: 't2', zh: '最高一级，到底是什么？', en: 'What’s on the top rung?' },
  ], { gen: 3, bye: { zh: '先看看：它已经走到哪一步了。下集见！', en: 'First: how far has it already come? See you next time!' } });

  // ================================================================== manifest
  Object.assign(RSI.EPS[0], {
    scenes: ['e1_cold', 'e1_sting', 'open', 'e1_q', 'e1_tries', 'lab', 'flip', 'compound', 'good', 'e1_dream', 'e1_cliff', 'e1_next'],
    chapters: {
      e1_cold: { zh: '开场', en: 'Cold open' }, open: { zh: '离谱任务', en: 'The task' }, e1_tries: { zh: '三次尝试', en: 'Three tries' },
      lab: { zh: '研究循环', en: 'The research loop' }, flip: { zh: '递归', en: 'Recursion' }, compound: { zh: '复利', en: 'Compounding' },
      good: { zh: '1965', en: '1965' }, e1_dream: { zh: '停得下来吗？', en: 'Can it stop?' }, e1_next: { zh: '下集预告', en: 'Next time' },
    },
  });
})();
