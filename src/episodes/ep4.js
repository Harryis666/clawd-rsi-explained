/* 《Clawd 造 Clawd》第 4 集《以后都不用再问我》— manifest + the episode's own scenes:
   cold open (第 47 次请求 · 疲惫的工程师 · 且慢！) · sting · recap · 本集问题 · post-credits card.
   v3: tighter cold open, 2-beat recap, no episode-number line, shorter egg.
   The body lives in src/scenes/monsters.js (monsters · cheater · collapse · telephone) and src/scenes/finale.js (permission · reveal · end · credits). */
(function () {
  'use strict';
  const RSI = window.RSI, C = RSI.C, M = RSI.M, D = RSI.D, T = RSI.T, K = RSI.Clawd, X = RSI.X, Sx = RSI.Series, MON = RSI.Monster;
  const W = RSI.W, H = RSI.H;
  const EN = () => RSI.lang === 'en';

  // ================================================================== 1 · cold open: the 47th request
  const TX = 560, TY = 92, TW = 960, TH = 790;   // the big screen
  const EX = 215, EY = 968, ES = 1.42;          // the engineer at the desk
  const GX = 1722, GY = 968, GS = 12.5;         // Gen-47 Clawd
  const LOGN = 46, L0 = 0.55, L1 = 2.3;         // approvals so far (gen 1→2 … 46→47), scrolled between L0 and L1
  const frozen = new Map();
  const tFz = (S) => S.E('k3') + 0.35;          // the frame freezes right as the key goes down
  const tSlam = (S) => S.E('k3') + 1.3;         // 醒木
  const EYES = [['#C8F27A', 1610, 430], ['#F2EFE6', 1770, 520], ['#E2B8FF', 1640, 640]];
  const room = (ctx, t) => {
    D.bg(ctx, { c1: '#1B2130', c2: '#07080B', cx: 0.55, cy: 0.4 });
    // window: the city at night
    const wx = 60, wy = 110, ww = 420, wh = 290;
    ctx.fillStyle = '#0B1426'; ctx.fillRect(wx, wy, ww, wh);
    for (let i = 0; i < 26; i++) { ctx.fillStyle = `rgba(240,238,230,${0.25 + 0.3 * M.hash(i * 5.3)})`; ctx.fillRect(wx + M.hash(i * 1.7) * ww, wy + M.hash(i * 2.9) * wh * 0.5, 2, 2); }
    ctx.fillStyle = '#EDE6CF'; ctx.beginPath(); ctx.arc(wx + 330, wy + 66, 26, 0, 7); ctx.fill(); ctx.fillStyle = '#0B1426'; ctx.beginPath(); ctx.arc(wx + 342, wy + 58, 23, 0, 7); ctx.fill();
    for (let b = 0; b < 7; b++) {
      const bx = wx + b * 62 - 6, bh = 70 + M.hash(b * 3.3) * 120; ctx.fillStyle = '#121A2B'; ctx.fillRect(bx, wy + wh - bh, 54, bh);
      for (let r = 0; r < 6; r++) for (let c = 0; c < 3; c++) if (M.hash(b * 31 + r * 7 + c) > 0.62 && wy + wh - bh + 12 + r * 22 < wy + wh - 8) { ctx.fillStyle = 'rgba(242,206,120,0.55)'; ctx.fillRect(bx + 8 + c * 16, wy + wh - bh + 12 + r * 22, 8, 10); }
    }
    ctx.strokeStyle = '#2A2F3A'; ctx.lineWidth = 12; ctx.strokeRect(wx, wy, ww, wh); ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh); ctx.stroke();
    // wall clock: 03:47
    const cx = 1745, cy = 215, r = 62;
    ctx.fillStyle = '#E9E5DA'; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill(); ctx.strokeStyle = '#3A3A3E'; ctx.lineWidth = 8; ctx.stroke();
    for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; ctx.fillStyle = '#3A3A3E'; ctx.fillRect(cx + Math.cos(a) * (r - 14) - 2, cy + Math.sin(a) * (r - 14) - 2, 5, 5); }
    const hand = (a, len, lw) => { ctx.strokeStyle = '#26262A'; ctx.lineWidth = lw; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.sin(a) * len, cy - Math.cos(a) * len); ctx.stroke(); };
    hand((3 + 47 / 60) / 12 * M.TAU, 30, 7); hand(47 / 60 * M.TAU, 46, 5);
    ctx.fillStyle = '#C8372D'; ctx.beginPath(); ctx.arc(cx, cy, 5, 0, 7); ctx.fill();
    T.line(ctx, '03:47', cx, cy + r + 30, 24, C.ink3, 700, 'center', 'mono');
    X.floor(ctx, EY);
  };
  const coldLive = (ctx, t, S) => {
    room(ctx, t);
    const tD = S.E('k1') - 0.3, k2 = S.T('k2'), k3 = S.T('k3'), e3 = S.E('k3');
    // ---- the engineer: tired, then tempted
    const st = t > k3 + 0.9 ? 'type' : t > k3 ? 'think' : 'look';
    D.glow(ctx, EX + 120, EY - 260, 260, C.blue, 0.16);
    const hh = RSI.Human.desk(ctx, EX, EY, ES, { state: st, t, laptop: false });
    for (let i = 0; i < 3; i++) { const x = EX + (150 + i * 26) * ES, y = EY - 120 * ES; ctx.fillStyle = i === 1 ? '#CFC9BB' : '#E2DCCF'; ctx.beginPath(); ctx.moveTo(x - 10, y - 34); ctx.lineTo(x + 10, y - 34); ctx.lineTo(x + 7, y); ctx.lineTo(x - 7, y); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#9C6B45'; ctx.fillRect(x - 10, y - 26, 20, 7); }
    if (t > k2 + 0.15 && t < k2 + 2.4) { // a long sigh
      for (let i = 0; i < 3; i++) { const u = M.seg(t, k2 + 0.15 + i * 0.18, k2 + 1.6 + i * 0.18); if (u <= 0 || u >= 1) continue; ctx.fillStyle = `rgba(200,210,226,${0.35 * (1 - u)})`; ctx.beginPath(); ctx.arc(EX + 30 + u * 70 + i * 10, hh[1] + 80 - u * 40, 9 + u * 14, 0, 7); ctx.fill(); }
    }
    S.anchors.human = [EX - 10, hh[1] - 4]; S.sides.human = 'up';
    // ---- the big screen
    D.glow(ctx, TX + TW / 2, TY + TH / 2, 760, C.blue, 0.10);
    const c = D.terminal(ctx, TX, TY, TW, TH, { title: 'clawd@lab: ~/gen-047' });
    const kLog = Math.floor(LOGN * M.seg(t, L0, L1));
    const x0 = c.x + 14, y0 = TY + 92;
    ctx.save(); ctx.beginPath(); ctx.rect(TX + 10, y0 - 22, TW - 20, 128); ctx.clip();
    for (let i = 0; i < 3; i++) {
      const n = kLog - 2 + i; if (n < 1) continue;
      ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(x0 + 8, y0 + i * 40, 8, 0, 7); ctx.fill();
      T.line(ctx, EN() ? `Gen ${n} → Gen ${n + 1}: approved` : `第 ${n} 代 → 第 ${n + 1} 代：已批准`, x0 + 30, y0 + i * 40, 24, i === 2 ? C.ink2 : C.ink3, 500, 'left');
    }
    ctx.restore();
    if (kLog > 0) D.pill(ctx, EN() ? `approved: ${kLog} times` : `已批准：${kLog} 次`, TX + TW - 30, y0, { size: 24, fill: kLog >= LOGN ? C.green : C.raised, color: kLog >= LOGN ? '#10230F' : C.ink2, align: 'right' });
    const s1 = M.seg(t, L1 + 0.25, L1 + 0.45);
    if (s1 > 0) { ctx.save(); ctx.globalAlpha *= s1; ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(x0 + 8, y0 + 132, 8, 0, 7); ctx.fill();
      T.line(ctx, { zh: '第 48 代：设计完成 → clawd_next/', en: 'Gen 48: design finished → clawd_next/' }, x0 + 30, y0 + 132, 24, C.ink2, 500, 'left'); ctx.restore(); }
    const da = M.seg(t, tD, tD + 0.35, M.ease.outCubic);
    const sel = t > k3 + 1.35 ? 1 : 0;
    const press = M.seg(t, e3 + 0.12, e3 + 0.3);
    ctx.save(); ctx.translate(0, (1 - da) * 18);
    RSI.drawPrompt(ctx, TX + 30, TY + 258, TW - 60, sel, t, { alpha: da, gen: 47, press });
    ctx.restore();
    // ---- Gen 47 beside the screen
    let expr = X.blink(t, 4) ? 'blink' : 'normal', look = [-1, -0.1], dy = 0;
    if (S.on ? S.on('k1') : (t >= S.T('k1') && t < S.E('k1'))) { expr = t - S.T('k1') < 2.5 ? 'happy' : 'normal'; dy = X.bob(t, 3, 9); }
    if (t > k3 + 0.5) { expr = 'worried'; look = [-1, -0.35]; }
    if (t > e3 + 0.1) expr = 'surprised';
    D.glow(ctx, GX, GY - 5 * GS, 380, C.orange, 0.3);
    const hd = K.draw(ctx, GX, GY + dy, GS, { gen: 47, expr, look, glow: 0.8, armL: t > tD && t < k2 + 1.2 ? 0.45 : 0.1 });
    S.anchors.clawd = [GX - 10, hd[1] - 6]; S.sides.clawd = 'up';
    T.line(ctx, EN() ? 'Gen 47' : '第 47 代', GX, GY + 40, 24, C.orangeL, 800, 'center');
  };
  const tag = (ctx, t, a = 1) => { ctx.save(); ctx.globalAlpha *= M.seg(t, 0.2, 0.6) * a; D.pill(ctx, { zh: '很多代以后 · 第 47 代', en: 'Many generations later · Gen 47' }, 60, 52, { size: 26, fill: C.orange }); ctx.restore(); };
  RSI.defScene({
    id: 'e4_cold', music: 'hook', label: false, fade: [0.1, 0.25], lead: 0.3, pad: 0.6,
    lines: [
      { id: 'k0', who: 'narr', zh: '很多代以后……', en: 'Many generations later…', at: 0.3, min: 1.5 },
      { id: 'k1', who: 'clawd', zh: '第 48 代设计好了。按规矩，训练之前得先问你。', en: 'Generation 48 is designed. Rules are rules: before I train it, I have to ask you.', at: 'k0+1.1', maxW: 560 },
      { id: 'k2', who: 'human', label: { zh: '工程师', en: 'Engineer' }, labelColor: C.blue, zh: '又来了……这都第 47 次了。每次都是“是”。', en: 'Again… that’s the 47th time. It’s always “yes”.', gap: 0.4, maxW: 520 },
      { id: 'k3', who: 'human', label: { zh: '工程师 · 心想', en: 'Engineer · thinking' }, labelColor: C.blue, zh: '要不……选 2 吧。以后就不用再问了。', en: 'Maybe… just pick 2. Then it won’t ask again.', gap: 0.15, maxW: 520 },
      { id: 'k4', who: 'clawd2', manual: true, zh: '且慢！', en: 'Hold it!', at: 'k3$+1.35', dur: 1.3 },
      { id: 'k5', who: 'clawd2', zh: '按下它之前——你得先见见三只小怪兽。', en: 'Before you press that — you need to meet three little monsters.', gap: 0.1, min: 2.6, maxW: 620 },
    ],
    cues: [
      [0.1, 'heart'], ...Array.from({ length: 10 }, (_, i) => [L0 + i * 0.17, 'tick']), [L1 + 0.3, 'ding'],
      ['k1$-0.3', 'whoosh'], ['k1$-0.05', 'pop'], ['k2+0.2', 'heart'], ['k3+1.35', 'tick'], ['k3$+0.12', 'key'],
      ['k3$+0.35', 'scratch'], ['k3$+0.37', 'freeze'], ['k3$+0.6', 'whoosh'], ['k3$+1.3', 'gavel', { big: 1 }], ['k5+1.0', 'buzz'], ['k5+1.2', 'whisper'],
    ],
    draw(ctx, t, S) {
      S.hud = { text: '047', color: C.orange };
      const tF = tFz(S), PC = [TX + TW / 2, 640];
      const zl = (tt) => 1 + 0.045 * M.ease.inOutSine(M.seg(tt, S.T('k2'), tF));
      if (t < tF) {
        const z = zl(t); ctx.save(); ctx.translate(PC[0], PC[1]); ctx.scale(z, z); ctx.translate(-PC[0], -PC[1]);
        coldLive(ctx, t, S); ctx.restore(); tag(ctx, t);
        for (const k of Object.keys(S.anchors)) { const a = S.anchors[k]; S.anchors[k] = [PC[0] + (a[0] - PC[0]) * z, PC[1] + (a[1] - PC[1]) * z]; }
        return;
      }
      // ---- frozen frame (cached per language)
      let fc = frozen.get(RSI.lang);
      if (!fc) { fc = D.mk(W, H); const S2 = { T: S.T, E: S.E, R: S.R, anchors: {}, sides: {} }; const g2 = fc.getContext('2d'); const z0 = zl(tF);
        g2.translate(PC[0], PC[1]); g2.scale(z0, z0); g2.translate(-PC[0], -PC[1]); coldLive(g2, tF, S2); frozen.set(RSI.lang, fc); }
      const k = M.seg(t, tF, tF + 0.3), z = 1 + 0.03 * M.ease.outCubic(M.seg(t, tF, tF + 6));
      const sh = Sx.shake(t, [tSlam(S)], 12);
      ctx.save(); ctx.translate(PC[0] + sh[0], PC[1] + sh[1]); ctx.scale(z, z); ctx.translate(-PC[0], -PC[1]);
      ctx.filter = `grayscale(${0.85 * k}) sepia(${0.2 * k}) brightness(${1 - 0.32 * k}) contrast(1.06)`;
      ctx.drawImage(fc, 0, 0); ctx.filter = 'none';
      ctx.restore();
      tag(ctx, t, 1 - 0.5 * k);
      if (t - tF < 0.16) { ctx.fillStyle = `rgba(255,248,236,${0.8 * (1 - (t - tF) / 0.16)})`; ctx.fillRect(0, 0, W, H); }
      // the pressed option, circled
      const ca = M.seg(t, tF + 0.2, tF + 0.7);
      if (ca > 0) { const z0 = zl(tF) * z, sx0 = PC[0] + (TX + 30 + 270 - PC[0]) * z0, sy0 = PC[1] + (TY + 258 + 376 - PC[1]) * z0; X.scribble(ctx, sx0, sy0, 290 * z0, 38 * z0, ca, C.red, 7); }
      // the storyteller slides in and slams the 醒木
      const ts = tSlam(S), sx = M.lerp(-360, 330, M.ease.outBack(M.seg(t, tF + 0.25, tF + 0.85)));
      D.glow(ctx, sx, 860, 420, C.orange, 0.26 * M.seg(t, tF + 0.3, tF + 0.9));
      const hd = Sx.teller(ctx, sx, 1012, 11, t, { slams: [ts], gen: 12, look: [0.8, -0.3] });
      S.anchors.clawd2 = [sx + 20, hd[1] - 6]; S.sides.clawd2 = 'up';
      const ln = S.sc.byId.k4;
      if (t >= ln.t && t < ln.t + ln.dur + 0.3) {
        const age = t - ln.t, a = 1 - M.seg(t, ln.t + ln.dur, ln.t + ln.dur + 0.3);
        T.bubble(ctx, RSI.L(ln), sx + 20, hd[1] - 6, { reveal: 99, alpha: a, pop: M.ease.outBack(M.clamp(age / 0.2)), size: EN() ? 60 : 72, weight: 900, side: 'up' });
      }
      // three pairs of eyes in the dark
      const ea = M.seg(t, S.T('k5') + 1.0, S.T('k5') + 1.6);
      if (ea > 0) EYES.forEach(([col, x, y], i) => {
        const bl = ((t * 0.8 + i * 0.41) % 2.6) < 0.12, ap = M.seg(t, S.T('k5') + 1.0 + i * 0.18, S.T('k5') + 1.3 + i * 0.18); if (ap <= 0) return;
        [-22, 22].forEach((dx) => { D.glow(ctx, x + dx, y, 34, col, 0.8 * ap); ctx.save(); ctx.globalAlpha *= ap; ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x + dx, y, 8, bl ? 1 : 8, 0, 0, 7); ctx.fill(); ctx.restore(); });
      });
    },
  });

  // ================================================================== 2 · sting · recap · this episode's question
  Sx.sting(4);
  Sx.recap(4, [
    { from: 'ratio', at: 'v3+2', zh: '一个数 r 决定快慢：大于 1 加速，小于 1 减速。', en: 'One number, r, sets the pace: above 1 it speeds up, below 1 it slows down.' },
    { from: 'e3_end', at: 'x3', zh: '路上还有好几堵墙……而夜路上，有东西在盯着 Clawd。', en: 'There are walls on the road… and on the night road, something was watching Clawd.' },
  ], { gen: 12 });
  RSI.allScenes.e4_recap.hud = false;
  Sx.question(4, { zh: '“以后都不用再问我”——\n这个选项，该按吗？', en: '“Don’t ask me again” —\nshould anyone press it?' }, {
    draw(ctx, t, S) { const a = M.seg(t, S.T('q') + 0.8, S.T('q') + 1.3); ctx.save(); ctx.globalAlpha *= a; Sx.dots(ctx, 620, 770, 4, { labels: true, gap: 230 }); ctx.restore(); },
  });
  RSI.allScenes.e4_q.hud = false;

  // ================================================================== 3 · post-credits: your turn
  RSI.defScene({
    id: 'e4_egg', music: 'outro', hud: false, label: false, lead: 0.4, pad: 1.5, fade: [0.4, 1.0],
    lines: [{ id: 'g1', who: 'clawd', zh: '如果是你，你会选几？在评论区告诉我。', en: 'If it were you — which would you pick? Tell me in the comments.', at: 0.4, min: 2.6, maxW: 620 }],
    cues: [[0.3, 'pop'], ['g1+0.8', 'tick'], ['g1+1.3', 'tick'], ['g1+1.8', 'tick'], ['g1$+0.3', 'chime']],
    draw(ctx, t, S) {
      D.bg(ctx, { c1: '#241A15', c2: '#0F0E0D' });
      Sx.tunnel(ctx, t, 0.5, 0.3);
      const a = M.seg(t, 0.3, 0.8, M.ease.outCubic);
      const sel = Math.max(0, Math.floor((t - S.T('g1') - 0.8) / 0.5)) % 3;
      ctx.save(); ctx.translate(820, 160 + (1 - a) * 20); ctx.scale(0.92, 0.92);
      RSI.drawPrompt(ctx, 0, 0, 1000, sel, t, { alpha: a, gen: 47, pulse: true });
      ctx.restore();
      const hp = X.hop(t, S.T('g1') + 0.1, 0.32, 20);
      const hd = K.draw(ctx, 430, 860 + hp.dy, 11, { gen: 47, expr: S.on('g1') ? 'happy' : X.blink(t, 2) ? 'blink' : 'normal', look: [0.7, -0.3], glow: 0.8, sx: hp.sx, sy: hp.sy, armR: S.on('g1') ? 0.8 + Math.sin(t * 6) * 0.1 : 0.2, alpha: a });
      S.anchors.clawd = [430, hd[1] - 6]; S.sides.clawd = 'up';
      const ea = M.seg(t, S.E('g1') - 0.4, S.E('g1') + 0.4);
      ctx.save(); ctx.globalAlpha *= ea;
      T.line(ctx, EN() ? `${RSI.L(RSI.SERIES.title)} · all 4 episodes · the end` : `《${RSI.L(RSI.SERIES.title)}》· 全 4 集 · 完`, W / 2, 790, 34, C.ink, 900, 'center');
      Sx.dots(ctx, W / 2, 880, 5, { labels: true, gap: 230 });
      ctx.restore();
    },
  });

  // ================================================================== manifest
  Object.assign(RSI.EPS[3], {
    scenes: ['e4_cold', 'e4_sting', 'e4_recap', 'e4_q', 'monsters', 'cheater', 'collapse', 'telephone', 'permission', 'reveal', 'end', 'credits', 'e4_egg'],
    chapters: {
      e4_cold: { zh: '开场', en: 'Cold open' }, e4_recap: { zh: '上回书说到', en: 'Previously' }, e4_q: { zh: '本集问题', en: 'This episode' },
      monsters: { zh: '三只小怪兽', en: 'Three little monsters' }, cheater: { zh: '作弊怪', en: 'The Cheater' }, collapse: { zh: '近亲繁殖怪', en: 'The Inbreeder' },
      telephone: { zh: '传话怪', en: 'The Whisperer' }, permission: { zh: '最后一个选项', en: 'The last option' }, reveal: { zh: '没说完的两句话', en: 'Two unfinished sentences' },
      end: { zh: '结语', en: 'Closing' }, credits: { zh: '片尾', en: 'Credits' },
    },
  });
})();
