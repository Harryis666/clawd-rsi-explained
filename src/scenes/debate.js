/* 第 3 集《爆炸，还是撞墙？》主体：一个数 r（两股力量 · 你猜？）· 两派之争（Clawd 当裁判）· 四堵墙（你猜？）。
   v3: the 'tree' scene (低处的果子 · 拔河的比方) is cut — ratio v0 now states the two forces directly. */
(function () {
  'use strict';
  const RSI = window.RSI, C = RSI.C, M = RSI.M, D = RSI.D, T = RSI.T, K = RSI.Clawd, X = RSI.X;
  const W = RSI.W, H = RSI.H;
  const EN = () => RSI.lang === 'en';
  /** hand position of a Clawd drawn at (x,y) with scale s (side −1 = left arm, +1 = right arm; arm = raise 0..1) */
  const hand = (x, y, s, side, arm) => [x + side * 8.7 * s, y + (-10 + 4 - arm * 3.2) * s];

  // ================================================================== ratio: one number, r — with a guess
  const RX0 = 330, RPX = 2.6;   // day 0 at x = 330; 2.6 px per day — one ruler for all three rows (500 days = 1300 px)
  const ROWS = [
    { y: 360, lab: 'r > 1', sub: { zh: '加速赢', en: 'speed-up wins' }, col: C.orange, f: (k) => 100 * Math.pow(0.75, k) },
    { y: 510, lab: 'r = 1', sub: { zh: '打平', en: 'a draw' }, col: C.yellow, f: () => 100 },
    { y: 660, lab: 'r < 1', sub: { zh: '阻力赢', en: 'drag wins' }, col: C.blue, f: (k) => 100 * Math.pow(1.5, k) },
  ];
  /** draw a row's blocks up to `days`; returns the number of finished generations */
  const blocks = (ctx, row, days) => {
    let x = 0, k = 0, gens = 0;
    while (k < 2000) {
      const L = row.f(k); if (x >= days - 1e-9 || x >= 500) break;
      const w = Math.min(L, days - x, 500 - x), full = w >= L - 1e-9;
      ctx.fillStyle = k % 2 ? row.col : RSI.mix(row.col, '#000000', 0.28);
      ctx.fillRect(RX0 + x * RPX, row.y - 26, Math.max(0.8, w * RPX - (L * RPX > 8 ? 3 : 0)), 52);
      if (full && L * RPX >= 96) T.line(ctx, EN() ? `${Math.round(L)} d` : `${Math.round(L)} 天`, RX0 + (x + L / 2) * RPX, row.y + 1, 22, '#1b1a18', 800, 'center');
      if (full) gens++;
      x += L; k++; if (L < 0.02) break;
    }
    return gens;
  };
  const GEN0 = [0.4, 1.0, 1.6, 2.2];                       // s after v0: generations 9–12 arrive (moved here from the cut 'tree' scene)
  const SPEEDUP = [0.34, 0.52, 0.74, 1.0], HARDER = [0.3, 0.5, 0.76, 1.0];
  RSI.defScene({
    id: 'ratio', music: 'tension', lead: 0.35,
    lines: [
      { id: 'v0', who: 'narr', zh: '每升一代，AI 更聪明、研究更快，这是{o|加速}；可容易的先做完了，后面越来越难，这是{b|阻力}。', en: 'Each generation, AI gets smarter and researches faster — that’s the {o|speed-up}. But the easy wins get used up and the rest gets harder — that’s the {b|drag}.', hold: 0.1 },
      { id: 'v1', who: 'narr', zh: '研究者把这两股力量写成一个数，叫 {O|r}：加速有多猛，除以变难有多快。', en: 'Researchers boil the two forces down to one number, {O|r}: how strong the speed-up is, divided by how fast things get harder.', hold: 0.2 },
      { id: 'v2', who: 'narr', zh: '{o|r 大于 1}：加速赢了，每一代都比上一代来得快——就像开头的 Clawd·A。', en: '{o|r > 1}: the speed-up wins, and each generation arrives faster than the last — like Clawd A at the start.', hold: 0.2 },
      { id: 'v2q', who: 'clawd', zh: '考考你：第一代 100 天，之后每代只要上一代的 3/4。无数代，一共要多久？', en: 'Quiz: the first generation takes 100 days, and each one after takes 3/4 as long as the one before. How long for infinitely many?', maxW: 700 },
      { id: 'v2r', who: 'narr', zh: '答案：约 400 天！无数代，挤进一年多一点——所以有人叫它“智能爆炸”。', en: 'The answer: about 400 days! Infinitely many generations in just over a year — that’s why some call it an “intelligence explosion”.', at: 'v2q$+1.5', hold: 0.5, kick: true },
      { id: 'v3', who: 'narr', zh: '{y|r 等于 1}：打成平手，稳步前进。{b|r 小于 1}：阻力赢了，越往后越慢——就像开头的 Clawd·B。', en: '{y|r = 1}: a draw — steady progress. {b|r < 1}: the drag wins, and it gets slower and slower — like Clawd B at the start.', hold: 0.3 },
      { id: 'v4', who: 'clawd', zh: '所以——现实里的 r，到底是多少？', en: 'So — what is r in the real world?', min: 2.0 },
    ],
    gen: GEN0.map((g, k) => [`v0+${g}`, 9 + k]),
    cues: [...GEN0.map((g) => [`v0+${(g - 0.2).toFixed(2)}`, 'hop']), ...GEN0.map((g) => [`v0+${g}`, 'pop']), ['v1+0.3', 'pop'], ['v2+0.4', 'build'], ['v2q+0.6', 'quizIn'],
      ...[0, 1, 2].map((k) => [(b) => b.v2q.t + 1.0 + ((b.v2r.t + 0.9) - (b.v2q.t + 1.0)) * k / 3, 'tick']), [(b) => b.v2r.t + 0.9, 'ding'],
      [(b) => b.v2r.t + 1.1, 'shepard', { dur: 1.6 }], [(b) => b.v2r.t + 2.7, 'boom'], ['v3+0.2', 'build'], ['v3+1.9', 'build']],
    draw(ctx, t, S) {
      D.dots(ctx, 0.03);
      // v0: the two forces, stated directly — one bar per generation on each side
      const tv0 = S.T('v0'), ga = M.seg(t, tv0 - 0.2, tv0 + 0.2) * (1 - M.seg(t, S.T('v1') - 0.1, S.T('v1') + 0.3));
      if (ga > 0) {
        ctx.save(); ctx.globalAlpha *= ga;
        const panel = (x0, title, sub, col, hs, ta) => {
          D.panel(ctx, x0, 180, 560, 630, { fill: 'rgba(28,27,24,0.88)', r: 22 });
          const k = M.seg(t, ta, ta + 0.3);
          ctx.save(); ctx.globalAlpha *= 0.45 + 0.55 * k;
          T.text(ctx, title, x0 + 280, 196, { size: 46, weight: 900, align: 'center' });
          T.line(ctx, sub, x0 + 280, 300, EN() ? 24 : 28, C.ink2, 600, 'center');
          ctx.restore();
          const base = 728;
          for (let i = 0; i < 4; i++) {
            const bx = x0 + 64 + i * 116;
            T.line(ctx, String(9 + i), bx + 42, base + 28, 24, C.ink3, 700, 'center', 'mono');
            const ti = tv0 + GEN0[i]; if (t < ti) continue;
            const pa = M.ease.outBack(M.seg(t, ti, ti + 0.4)), bh = hs[i] * 360 * pa;
            ctx.fillStyle = col; D.rr(ctx, bx, base - bh, 84, Math.max(1, bh), 8); ctx.fill();
          }
          T.line(ctx, { zh: '第几代 →', en: 'generation →' }, x0 + 280, base + 62, 22, C.ink3, 500, 'center');
        };
        panel(170, { zh: '{o|加速} ↑', en: '{o|speed-up} ↑' }, { zh: '更聪明 → 研究更快', en: 'smarter → faster research' }, C.orange, SPEEDUP, tv0);
        panel(1190, { zh: '{b|阻力} ↑', en: '{b|drag} ↑' }, { zh: '容易的先做完 → 越来越难', en: 'easy wins used up → harder' }, C.blue, HARDER, tv0 + 2.0);
        let k = -1; GEN0.forEach((g, i) => { if (t > tv0 + g - 0.2) k = i; });
        const hop = k >= 0 ? X.hop(t, tv0 + GEN0[k] - 0.2, 0.4, 46) : { dy: 0, sx: 1, sy: 1 };
        K.draw(ctx, 960, 780 + hop.dy, 6, { gen: S.gen().g, expr: t > tv0 + 2.4 ? 'worried' : hop.dy < -10 ? 'happy' : 'determined', look: t > tv0 + 2.4 ? [1, -0.3] : [-1, -0.3], armL: hop.dy < -10 ? 1 : 0.2, armR: hop.dy < -10 ? 1 : 0.2, sx: hop.sx, sy: hop.sy });
        ctx.restore();
      }
      const fa = M.seg(t, S.T('v1'), S.T('v1') + 0.4, M.ease.outCubic);
      ctx.save(); ctx.globalAlpha *= fa; T.text(ctx, { zh: '{O|r} = 加速 ÷ 变难', en: '{O|r} = speed-up ÷ difficulty' }, W / 2, 110 + (1 - fa) * 14, { size: 72, weight: 900, align: 'center' }); ctx.restore();
      // v1: the two forces become one fraction
      const fr = M.seg(t, S.T('v1') + 0.25, S.T('v1') + 0.7) * (1 - M.seg(t, S.T('v2') - 0.35, S.T('v2') + 0.1));
      if (fr > 0) {
        ctx.save(); ctx.globalAlpha *= fr; const nx = 1040, pk = M.ease.outBack(M.seg(t, S.T('v1') + 0.25, S.T('v1') + 0.7));
        T.text(ctx, '{O|r} =', 610, 392, { size: 130, weight: 900, align: 'right' });
        ctx.save(); ctx.translate(nx, 470); ctx.scale(pk, pk); ctx.translate(-nx, -470);
        T.line(ctx, { zh: '变聪明带来的加速', en: 'speed-up from getting smarter' }, nx, 388, EN() ? 44 : 54, C.orange, 900, 'center');
        ctx.fillStyle = C.ink; ctx.fillRect(nx - 360, 466, 720, 9);
        T.line(ctx, { zh: '问题变难的阻力', en: 'drag from harder problems' }, nx, 556, EN() ? 44 : 54, C.blue, 900, 'center');
        ctx.restore(); ctx.restore();
      }
      const sa = M.seg(t, S.T('v2'), S.T('v2') + 0.5);
      ctx.save(); ctx.globalAlpha *= sa;
      T.text(ctx, { zh: '每一格 = 造一代新 AI 花的时间（三行用同一把尺子）', en: 'each block = time to build one new generation (same ruler for all three rows)' }, W / 2, 196, { size: 28, weight: 400, align: 'center', color: C.ink3 });
      // day axis
      ctx.fillStyle = 'rgba(240,238,230,0.35)'; ctx.fillRect(RX0, 735, 500 * RPX, 2);
      for (let d = 0; d <= 500; d += 100) { const x = RX0 + d * RPX; ctx.fillRect(x - 1, 728, 2, 16); T.line(ctx, d === 500 ? (EN() ? '500 days' : '500 天') : String(d), x, 764, 22, C.ink3, 600, 'center', 'mono'); }
      ctx.restore();
      const tA = S.T('v2r') + 0.9, tBoom = tA + 1.8;
      const days = [
        t < tA + 0.2 ? 273.4375 * M.seg(t, S.T('v2') + 0.4, S.T('v2') + 2.6) : 273.4375 + (400 - 273.4375) * M.ease.inCubic(M.seg(t, tA + 0.2, tBoom)),
        500 * M.seg(t, S.T('v3') + 0.2, S.T('v3') + 2.0),
        500 * M.seg(t, S.T('v3') + 1.9, S.T('v3') + 3.9),
      ];
      const shown = [S.T('v2') + 0.1, S.T('v3'), S.T('v3') + 1.8];
      ROWS.forEach((row, i) => {
        const a = M.seg(t, shown[i] - 0.3, shown[i] + 0.2); if (a <= 0) return;
        ctx.save(); ctx.globalAlpha *= a;
        T.line(ctx, row.lab, 270, row.y - 8, 40, row.col, 900, 'right', 'mono');
        T.line(ctx, row.sub, 270, row.y + 30, 22, C.ink2, 600, 'right');
        ctx.fillStyle = 'rgba(240,238,230,0.07)'; ctx.fillRect(RX0, row.y - 30, 500 * RPX, 60);
        const gens = blocks(ctx, row, days[i]);
        const inf = i === 0 && t >= tBoom;
        T.line(ctx, inf ? (EN() ? '∞ gens' : '∞ 代') : EN() ? `${gens} gens` : `${gens} 代`, RX0 + 500 * RPX + 30, row.y, inf ? 40 : 32, row.col, 900, 'left');
        ctx.restore();
      });
      // the limit: infinitely many generations inside 400 days
      if (t > tBoom - 0.5) {
        const lx = RX0 + 400 * RPX, f = M.seg(t, tBoom - 0.5, tBoom), g = 1 - M.seg(t, tBoom, tBoom + 2.5);
        D.glow(ctx, lx, ROWS[0].y, 100 + 300 * f, C.orangeHi, Math.max(0.25, g)); D.sparkle(ctx, lx, ROWS[0].y, 26 + 26 * f, C.yellow, 0.9, t);
        if (t > tBoom) { ctx.save(); ctx.globalAlpha *= M.seg(t, tBoom, tBoom + 0.4); ctx.setLineDash([8, 8]); ctx.strokeStyle = RSI.rgba(C.orangeHi, 0.7); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(lx, 300); ctx.lineTo(lx, 725); ctx.stroke(); ctx.setLineDash([]);
          D.pill(ctx, { zh: '400 天：无数代', en: '400 days: infinitely many' }, lx, 278, { size: 24, fill: C.orangeHi, align: 'center' }); ctx.restore(); }
      }
      // callbacks to the cold open: Clawd A (glowing) and Clawd B (dizzy)
      const ia = M.seg(t, tBoom + 0.3, tBoom + 0.8);
      if (ia > 0) { K.draw(ctx, 1840, ROWS[0].y + 26, 3, { gen: 9, expr: 'happy', alpha: ia, glow: 10, tag: 'A' }); }
      const ib = M.seg(t, S.T('v3') + 3.9, S.T('v3') + 4.4);
      if (ib > 0) { const hb = K.draw(ctx, 1840, ROWS[2].y + 26, 3, { gen: 9, expr: 'x', alpha: ib, tag: 'B' }); X.dizzy(ctx, 1840, hb[1] + 4, t, 34, ib); }
      // the guess
      X.quiz(ctx, t, 1350, 405, { opts: [{ zh: '永远造不完', en: 'forever' }, { zh: '约 400 天', en: 'about 400 days' }, { zh: '约 4000 天', en: 'about 4,000 days' }], ans: 1, t0: S.T('v2q') + 0.6, tA, tEnd: tA + 1.4, w: 520 });
      // Clawd (bottom-left) asks the quiz and the final question
      const ca = M.seg(t, S.T('v2q') - 0.5, S.T('v2q'));
      if (ca > 0) {
        const surprised = t > tBoom && t < tBoom + 1.6;
        const hd = K.draw(ctx, 96, 1010, 4.5, { gen: S.gen().g, expr: surprised ? 'surprised' : t > S.T('v4') ? 'worried' : X.blink(t, 3) ? 'blink' : 'normal', look: [0.7, -0.6], alpha: ca });
        S.anchors.clawd = [110, hd[1]];
      }
    },
  });

  // ================================================================== debate: Clawd referees two camps of scientists
  const GX = 960, GY = 360, GR = 180;
  const gauge = (ctx, v, label, col) => {
    const a0 = Math.PI * 1.1, a1 = Math.PI * 1.9; const ang = (x) => a0 + (a1 - a0) * M.inv(0.5, 2.0, x);
    ctx.save(); ctx.lineWidth = 26; ctx.lineCap = 'butt';
    ctx.strokeStyle = RSI.rgba(C.blue, 0.8); ctx.beginPath(); ctx.arc(GX, GY, GR, ang(0.5), ang(0.97)); ctx.stroke();
    ctx.strokeStyle = RSI.rgba(C.yellow, 0.85); ctx.beginPath(); ctx.arc(GX, GY, GR, ang(0.97), ang(1.03)); ctx.stroke();
    ctx.strokeStyle = RSI.rgba(C.orange, 0.85); ctx.beginPath(); ctx.arc(GX, GY, GR, ang(1.03), ang(2.0)); ctx.stroke();
    for (const m of [0.5, 1, 1.5, 2]) { const an = ang(m); T.line(ctx, String(m), GX + Math.cos(an) * (GR + 42), GY + Math.sin(an) * (GR + 42), 24, C.ink2, 700, 'center', 'mono'); }
    T.line(ctx, { zh: '越来越慢', en: 'slower' }, GX - GR - 20, GY + 40, 22, C.blue, 700, 'center');
    T.line(ctx, { zh: '越来越快', en: 'faster' }, GX + GR + 20, GY + 40, 22, C.orange, 700, 'center');
    const an = ang(M.clamp(v, 0.5, 2.0)); ctx.strokeStyle = C.ink; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(GX, GY); ctx.lineTo(GX + Math.cos(an) * (GR - 20), GY + Math.sin(an) * (GR - 20)); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(GX, GY, 16, 0, 7); ctx.fill();
    T.line(ctx, label, GX, GY + 56, 40, col || C.ink, 900, 'center', 'mono');
    ctx.restore();
  };
  const flag = (ctx, x, y, col, side, k) => {
    if (k <= 0) return;
    const tx = x + side * 26, ty = y - 92;
    ctx.save(); ctx.globalAlpha *= M.clamp(k * 2);
    ctx.strokeStyle = '#D8D2C4'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x, y + 8); ctx.lineTo(tx, ty); ctx.stroke();
    ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx + side * 62, ty + 14); ctx.lineTo(tx + side * 4, ty + 40); ctx.closePath(); ctx.fill();
    ctx.restore();
  };
  RSI.defScene({
    id: 'debate', music: 'tension', lead: 0.6,
    lines: [
      { id: 'd1', who: 'narr', zh: '现实里的 r 是多少？科学家们分成了两派。', en: 'So what is r in reality? Scientists split into two camps.' },
      { id: 'd2', who: 'left', label: { zh: '加速派', en: 'The fast camp' }, labelColor: C.orange, zh: '有估计说：r 约等于 1.4，大于 1！每次“研发速度翻倍”，只需上一次约 3/4 的时间。', en: 'One estimate says r is about 1.4 — above 1! Each “doubling of research speed” takes only about 3/4 as long as the last.', maxW: 640 },
      { id: 'd3', who: 'card', zh: 'Chan、Hinton、Bengio 等（2026.9）：照此估计，约 17 个月后 AI 研发快 10 倍——一年的进展约 5 周完成（前提：没有别的瓶颈）。', en: 'Chan, Hinton, Bengio et al. (Sep 2026): on this estimate, AI R&D is 10× faster in about 17 months — a year of progress in ~5 weeks (assuming no other bottlenecks).', src: { zh: 'Chan 等 22 位作者，arXiv:2609.36054', en: 'Chan et al. (22 authors), arXiv:2609.36054' } },
      { id: 'd3b', who: 'clawd', zh: '3/4？跟刚才那道题一样……真要爆炸？', en: '3/4? Just like that quiz… so it really explodes?' },
      { id: 'd4', who: 'right', label: { zh: '怀疑派', en: 'The skeptics' }, labelColor: C.blue, zh: '别急。OpenAI 的研究员，用 AI 的量涨了 124 倍，做的实验却只多了 1.6 倍。', en: 'Not so fast. OpenAI’s researchers use 124× more AI — but run only 1.6× more experiments.', maxW: 520 },
      { id: 'd4b', who: 'right', label: { zh: '怀疑派', en: 'The skeptics' }, labelColor: C.blue, zh: '忙，不等于进步快。', en: 'Busy isn’t the same as fast progress.', gap: 0.1, maxW: 640 },
      { id: 'd6', who: 'narr', zh: '两派唯一的共识：现有的数据，还不足以下定论。', en: 'The one thing both camps agree on: the data so far can’t settle it.', hold: 0.3 },
      { id: 'd7', who: 'clawd', zh: '这局……判不了。', en: 'This round… no call.', min: 1.6 },
    ],
    cues: [['d1+0.3', 'hop'], ['d1+0.65', 'whoosh'], ['d2', 'swish'], ['d3', 'card'], ['d3b', 'surprise'], ['d4', 'swish'], ['d4+0.8', 'build'], ['d6+0.4', 'tick'], ['d7', 'boing']],
    draw(ctx, t, S) {
      D.dots(ctx, 0.03);
      const LX = 300, RX = 1620, PY = 770;
      const speakL = S.on('d2') || S.on('d3'), speakR = S.on('d4') || S.on('d4b');
      // the two scientists behind their podiums
      const hl = RSI.Human.stand(ctx, LX, PY + 30, 0.95, { t, look: 1, color: '#8A4A30', color2: C.orange, state: speakL ? 'wave' : 'stand' });
      const hr = RSI.Human.stand(ctx, RX, PY + 30, 0.95, { t, look: -1, color: C.blueD, color2: C.blue, state: speakR ? 'wave' : 'stand' });
      S.anchors.left = [LX + 40, hl[1] + 8]; S.anchors.right = [RX - 40, hr[1] + 8];
      const pod = (x, col, label) => { ctx.fillStyle = RSI.mix(col, '#000000', 0.55); D.rr(ctx, x - 150, PY - 6, 300, 150, 12); ctx.fill(); ctx.fillStyle = col; ctx.fillRect(x - 150, PY - 6, 300, 12); T.line(ctx, label, x, PY + 66, 34, C.ink, 900, 'center'); };
      pod(LX, C.orange, { zh: '加速派', en: 'FAST' }); pod(RX, C.blue, { zh: '怀疑派', en: 'SKEPTIC' });
      // the gauge
      const tL = S.T('d2'), tR = S.T('d4');
      let v = 1.0, lab = 'r = ?', col = C.ink;
      if (t > tL) { v = M.lerp(1.0, 1.4, M.seg(t, tL + 0.3, tL + 1.5, M.ease.outElastic)); lab = 'r ≈ 1.4'; col = C.orange; }
      if (t > tR) { const k = M.seg(t, tR + 0.3, tR + 1.3); v = M.lerp(1.4, 1.05 + 0.32 * Math.sin((t - tR) * 2.6), k); lab = k > 0.5 ? 'r ≈ ?' : 'r ≈ 1.4'; col = k > 0.5 ? C.yellow : C.orange; }
      gauge(ctx, v, lab, col);
      if (t > S.T('d6') + 0.4) X.mark(ctx, '?', GX + 175, 215, Math.min(1.0, t - S.T('d6') - 0.4), C.yellow, 96);
      if (t > S.T('d6') + 1.4) T.line(ctx, '?', GX + 175, 205, 96, C.yellow, 900, 'center');
      // fact card · the two bars, same scale
      S.card(ctx, 'd3', 560, 438, 800);
      const ba = M.seg(t, tR + 0.6, tR + 1.1) * (1 - M.seg(t, S.T('d6') - 0.2, S.T('d6') + 0.4));
      if (ba > 0) {
        const base = 752, maxH = 196, g1 = M.ease.outCubic(M.seg(t, tR + 0.8, tR + 2.0));
        ctx.save(); ctx.globalAlpha *= ba;
        T.line(ctx, { zh: 'OpenAI 研究员人均（与 2025 年相比）', en: 'per OpenAI researcher (vs 2025)' }, GX, 470, 24, C.ink3, 600, 'center');
        const h1 = maxH * g1; ctx.fillStyle = C.blue; D.rr(ctx, 690, base - h1, 130, Math.max(1, h1), 10); ctx.fill();
        T.line(ctx, '×124', 755, base - h1 - 26, 40, C.blue, 900, 'center', 'mono');
        T.line(ctx, { zh: '用 AI 的量', en: 'AI use' }, 755, base + 28, 26, C.ink, 700, 'center');
        const h2 = Math.max(2, maxH * (1.6 / 124) * g1); ctx.fillStyle = C.green; ctx.fillRect(1100, base - h2, 130, h2);
        T.line(ctx, '×1.6', 1165, base - 34, 40, C.green, 900, 'center', 'mono');
        T.line(ctx, { zh: '做的实验', en: 'experiments' }, 1165, base + 28, 26, C.ink, 700, 'center');
        if (g1 > 0.9) T.line(ctx, { zh: '← 只多了这么一点', en: '← only this much' }, 1244, base - 6, 24, C.yellow, 700, 'left');
        ctx.restore();
      }
      if (S.on('d4') || S.on('d4b')) X.src(ctx, { zh: 'Ramez Naam，Noahpinion，2026.9.27', en: 'Ramez Naam, Noahpinion, 2026-09-27' }); // v3.2: short, clear of the gauge
      // Clawd the referee, with two flags
      const t1 = S.T('d1') + 0.3; const enter = M.seg(t, t1, t1 + 0.45, M.ease.outCubic);
      const hop = X.hop(t, t1, 0.45, 60);
      const cx = M.lerp(1100, GX, enter), cy = 860 + hop.dy, s = 5.5;
      ctx.fillStyle = '#3A3732'; D.rr(ctx, GX - 70, 860, 140, 40, 8); ctx.fill(); ctx.fillStyle = 'rgba(240,238,230,0.12)'; ctx.fillRect(GX - 70, 860, 140, 4);
      const end = t > S.T('d7');
      const armL = end ? 0.75 : S.on('d2') ? 1 : 0.15, armR = end ? 0.75 : speakR ? 1 : 0.15;
      const look = speakL || t > S.T('d3b') && t < tR && !speakR ? [-1, -0.2] : speakR ? [1, -0.2] : [0, -0.3];
      const expr = end ? 'worried' : S.on('d3b') ? 'surprised' : X.blink(t, 5) ? 'blink' : 'determined';
      const ra = M.seg(t, t1 - 0.3, t1);
      if (ra > 0) {
        ctx.save(); ctx.globalAlpha *= ra;
        const hd = K.draw(ctx, cx, cy, s, { gen: S.gen().g, expr, look, armL, armR, sx: hop.sx, sy: hop.sy });
        const pl = hand(cx, cy, s, -1, armL), pr = hand(cx, cy, s, 1, armR);
        flag(ctx, pl[0], pl[1], C.orange, -1, enter); flag(ctx, pr[0], pr[1], C.blue, 1, enter);
        S.anchors.clawd = [cx, hd[1] - 6];
        ctx.restore();
      }
    },
  });

  // ================================================================== walls: four stations, one wall each
  const SP = 2200, WX = 1460, FL = 800, CS = 6.5;      // station spacing · wall x inside a station · floor · Clawd scale
  const STOP = WX - 60 - 62, LAND = 300;                // where Clawd bonks · where it lands in the next station
  const WALLS = [
    { name: { zh: '算力墙', en: 'Compute' }, icon: 'gpu', lit: 'w1' },
    { name: { zh: '品味墙', en: 'Taste' }, icon: 'bulb', lit: 'w2' },
    { name: { zh: '并行墙', en: 'Parallel' }, icon: 'people', lit: 'w3r' },
    { name: { zh: '现实墙', en: 'Reality' }, icon: 'globe', lit: 'w4' },
  ];
  const ARRIVE = ['w0b$+1.1', 'w1$+1.8', 'w2b$+1.8', 'w3s$+1.8'], LEAVE = ['w1$+0.2', 'w2b$+0.2', 'w3s$+0.2', 'w6+0.5'];
  const HOPD = 0.9;                                     // the hop over a wall (v2: 1.3 s)
  const shf = (spec, d) => { const m = spec.match(/^(.*?)([+-]\d+(?:\.\d+)?)$/); const base = m ? m[1] : spec, off = (m ? parseFloat(m[2]) : 0) + d; return base + (off >= 0 ? '+' : '') + off.toFixed(2); };
  const motion = (t, S) => {
    const ar = ARRIVE.map((s) => S.R(s)), lv = LEAVE.map((s) => S.R(s)), run0 = S.R('w0b$+0.1');
    const R = (o) => Object.assign(o, { ar, lv });
    if (t < run0) return R({ x: 360, dy: 0, cam: 0, mode: 'stand', k: 0 });
    if (t < ar[0]) return R({ x: M.lerp(360, STOP, M.seg(t, run0, ar[0])), dy: 0, cam: 0, mode: 'run', k: 0 });
    for (let k = 0; k < 4; k++) {
      const o = k * SP;
      if (k > 0 && t < ar[k]) return R({ x: o + M.lerp(LAND, STOP, M.seg(t, lv[k - 1] + HOPD, ar[k])), dy: 0, cam: o, mode: 'run', k });
      if (t < lv[k]) return R({ x: o + STOP, dy: 0, cam: o, mode: t < ar[k] + 0.35 ? 'bonk' : 'wait', k });
      const last = k === 3, p = M.seg(t, lv[k], lv[k] + HOPD);
      if (p < 1) {
        const px = Math.pow(M.seg(p, 0.22, 1), 1.4), x1 = last ? o + 1900 : o + SP + LAND;
        return R({ x: M.lerp(o + STOP, x1, px), dy: -Math.sin(p * Math.PI) * 560, cam: M.lerp(o, last ? o + 1300 : o + SP, M.ease.inOutCubic(p)), mode: 'hop', k });
      }
      if (last) return R({ x: o + 1900 + (t - lv[k] - HOPD) * 130, dy: 0, cam: o + 1300, mode: 'walk', k });
    }
    return R({ x: 3 * SP + 1900, dy: 0, cam: 3 * SP + 1300, mode: 'walk', k: 3 });
  };
  const brickWall = (ctx, sx, lit, w) => {
    const wh = 420, ww = 120, top = FL - wh;
    ctx.save(); ctx.beginPath(); ctx.rect(sx - ww / 2, top, ww, wh); ctx.clip();
    for (let r = 0; r < 14; r++) for (let c = -1; c < 3; c++) { const x = sx - ww / 2 + c * 60 + (r % 2 ? 30 : 0); ctx.fillStyle = (r * 3 + c + 9) % 3 ? '#8E4F3C' : '#7A4433'; ctx.fillRect(x + 1, top + r * 30 + 1, 57, 28); }
    ctx.restore();
    ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(sx + ww / 2 - 10, top, 10, wh);
    ctx.save(); ctx.globalAlpha *= lit ? 1 : 0.6;
    D.panel(ctx, sx - 150, top - 150, 300, 120, { fill: lit ? C.raised : C.surface, r: 16 });
    if (lit && w) { D.icon(ctx, w.icon, sx - 92, top - 90, 54, C.orange, 8); T.line(ctx, w.name, sx + 30, top - 90, EN() ? 34 : 40, C.ink, 900, 'center'); }
    else T.line(ctx, '?', sx, top - 88, 56, C.ink3, 900, 'center');
    ctx.restore();
  };
  const stampText = (ctx, s, x, y, size, col, k, rot = -0.12) => {
    if (k <= 0) return; const sc = 1.7 - 0.7 * M.ease.outBack(M.clamp(k));
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha *= M.clamp(k * 3);
    ctx.font = T.font(size, 900); const w = ctx.measureText(RSI.L(s)).width + size * 0.9, h = size * 1.5;
    ctx.fillStyle = 'rgba(20,10,8,0.6)'; D.rr(ctx, -w / 2, -h / 2, w, h, size * 0.2); ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = size * 0.1; D.rr(ctx, -w / 2, -h / 2, w, h, size * 0.2); ctx.stroke();
    T.line(ctx, s, 0, 2, size, col, 900, 'center'); ctx.restore();
  };
  const CROWD = [10, 100, 1000, 10000], crowdCache = new Map();
  const crowdCanvas = (n, g) => {
    const key = n + '|' + g; let c = crowdCache.get(key); if (c) return c;
    const w = 1180, h = 540; c = D.mk(w, h); const x = c.getContext('2d');
    const cols = Math.ceil(Math.sqrt((n * w) / h)), rows = Math.ceil(n / cols), cw = w / cols, ch = h / rows;
    const s = Math.min(5.2, cw / 21, ch / 13), r = M.rng(n + 7);
    let k = 0;
    for (let j = 0; j < rows && k < n; j++) for (let i = 0; i < cols && k < n; i++, k++) K.drawCached(x, (i + 0.5) * cw + (r() - 0.5) * cw * 0.25, (j + 1) * ch - ch * 0.12, s, { res: K.resFor(g), expr: r() < 0.12 ? 'blink' : 'normal' });
    crowdCache.set(key, c); return c;
  };
  const props = (ctx, k, t, S, m) => {
    if (k === 0) { // the compute wall: a training run that takes months
      const ma = M.ease.outBack(M.seg(t, S.T('w1') + 0.6, S.T('w1') + 1.0));
      if (ma > 0) {
        ctx.save(); ctx.translate(700, FL); ctx.scale(1, ma); ctx.translate(-700, -FL);
        ctx.fillStyle = '#2E2C29'; ctx.fillRect(690, 560, 20, FL - 560); ctx.fillRect(610, FL - 14, 180, 14);
        const p = D.terminal(ctx, 320, 250, 760, 320, { title: 'train.py' });
        T.line(ctx, EN() ? '$ train Clawd, gen 13' : '$ 训练第 13 代 Clawd', p.x, p.y + 10, 30, C.ink, 600, 'left', 'mono');
        const pr = 0.03 + 0.01 * M.seg(t, S.T('w1') + 1.2, m.lv[0]);
        X.bar(ctx, p.x, p.y + 60, 600, 30, pr, C.green);
        T.line(ctx, Math.round(pr * 100) + '%', p.x + 620, p.y + 75, 26, C.green, 800, 'left', 'mono');
        T.line(ctx, EN() ? 'time left: 87 days' : '预计剩余：87 天', p.x, p.y + 150, 36, C.yellow, 800, 'left');
        ctx.restore();
      }
    }
    if (k === 1) { // the taste wall: shadow evaluation, then the doors
      const da = M.env(t, S.T('w2') + 0.8, S.T('w2b') + 0.2, 0.35, 0.35);
      if (da > 0) {
        ctx.save(); ctx.globalAlpha *= da;
        D.panel(ctx, 200, 200, 980, 340, { fill: 'rgba(28,27,24,0.92)', r: 22 });
        D.pill(ctx, { zh: '影子评测', en: 'shadow evaluation' }, 690, 244, { size: 28, fill: C.yellow, align: 'center' });
        ctx.fillStyle = C.paper; D.rr(ctx, 270, 312, 190, 128, 10); ctx.fill(); ctx.strokeStyle = '#B9B2A2'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(272, 316); ctx.lineTo(365, 384); ctx.lineTo(458, 316); ctx.stroke();
        D.icon(ctx, 'lock', 365, 404, 44, C.red, 6);
        T.line(ctx, { zh: '还没发表的论文', en: 'unpublished papers' }, 365, 488, 26, C.ink, 700, 'center');
        D.arrow(ctx, 488, 376, 590, 376, { color: C.ink3, w: 5 });
        ctx.fillStyle = '#F4F1E6'; D.rr(ctx, 620, 302, 140, 150, 8); ctx.fill(); ctx.fillStyle = '#B9B2A2'; for (let i = 0; i < 4; i++) ctx.fillRect(642, 330 + i * 26, 96 - (i % 2) * 30, 8);
        T.line(ctx, { zh: '出成考题', en: 'turned into a test' }, 690, 488, 26, C.ink, 700, 'center');
        D.arrow(ctx, 790, 376, 890, 376, { color: C.ink3, w: 5 });
        K.draw(ctx, 1010, 444, 5, { gen: S.gen().g, expr: 'surprised', look: [-0.5, -0.4] });
        T.line(ctx, { zh: '不可能提前见过答案', en: 'can’t have seen the answers' }, 1010, 488, 26, C.ink, 700, 'center');
        ctx.restore();
      }
      const tb = S.T('w2b'), oa = M.seg(t, tb - 0.1, tb + 0.4);
      if (oa > 0) {
        ctx.save(); ctx.globalAlpha *= oa;
        [300, 470, 640, 810, 980].forEach((x, i) => {
          const open = i === 4 ? M.ease.inOutCubic(M.seg(t, tb + 1.0, tb + 1.6)) : 0, gold = i === 1 ? M.seg(t, tb + 3.8, tb + 4.4) : 0;
          ctx.fillStyle = '#2B2926'; ctx.fillRect(x - 66, FL - 250, 132, 250);
          if (open > 0) { ctx.fillStyle = RSI.rgba('#FFE7B0', 0.55 * open); ctx.fillRect(x - 58, FL - 242, 116, 242); }
          if (gold > 0) D.glow(ctx, x, FL - 120, 160, C.yellow, 0.7 * gold);
          const lw = 116 * (1 - 0.82 * open);
          ctx.fillStyle = '#7B5A3C'; ctx.fillRect(x - 58, FL - 242, lw, 242);
          ctx.fillStyle = '#C9A15A'; ctx.beginPath(); ctx.arc(x - 58 + lw - 16, FL - 120, 7, 0, 7); ctx.fill();
          if (gold > 0) { ctx.fillStyle = RSI.rgba(C.yellow, 0.9 * gold); ctx.fillRect(x - 58, FL - 246, 116, 5); ctx.fillRect(x + 56, FL - 242, 5, 242); ctx.fillRect(x - 62, FL - 242, 5, 242); }
          T.line(ctx, '?', x, FL - 286, 36, open > 0.5 ? C.ink3 : C.ink2, 900, 'center');
        });
        const g2 = M.seg(t, tb + 3.8, tb + 4.4);
        if (g2 > 0) { ctx.save(); ctx.globalAlpha *= g2; D.pill(ctx, { zh: '★ 真正的好点子在这儿', en: '★ the real breakthrough' }, 470, FL - 336, { size: 26, fill: C.yellow, align: 'center' }); ctx.restore(); }
        ctx.restore();
        stampText(ctx, { zh: '结论：我是对的！', en: 'Conclusion: I’m right!' }, STOP - 170, 560, 44, C.red, M.seg(t, tb + 2.6, tb + 2.75));
      }
    }
    if (k === 2) { // the parallel wall: ten thousand copies
      const t3 = S.T('w3'), lvl = CROWD.map((n, i) => t3 + 0.9 + i * 0.45);
      let li = -1; lvl.forEach((tt, i) => { if (t >= tt) li = i; });
      const out = M.seg(t, m.lv[2] - 0.35, m.lv[2] - 0.05);
      if (li >= 0 && out < 1) {
        const dim = 1 - 0.6 * M.env(t, S.T('w3q') + 0.2, S.T('w3s') + 0.2, 0.3, 0.4);
        const c = crowdCanvas(CROWD[li], S.gen().g), pop = 1 + 0.1 * (1 - M.ease.outCubic(M.seg(t, lvl[li], lvl[li] + 0.3)));
        ctx.save(); ctx.globalAlpha *= (1 - out) * dim; ctx.translate(670, 790); ctx.scale(pop, pop); ctx.translate(-670, -790); ctx.drawImage(c, 80, 250); ctx.restore();
        ctx.save(); ctx.globalAlpha *= 1 - out; D.pill(ctx, ['×10', '×100', '×1,000', '×10,000'][li], 940, 214, { size: 34, fill: C.orange, align: 'center' }); ctx.restore();
        const bA = M.seg(t, S.T('w3s') + 0.4, S.T('w3s') + 0.8) * (1 - out);
        if (bA > 0) {
          const r = M.rng(77);
          for (let i = 0; i < 44; i++) {
            const bx = 120 + r() * 1100, by = 300 + r() * 450, ti = S.T('w3s') + 0.4 + i * 0.03, k2 = M.ease.outBack(M.seg(t, ti, ti + 0.3)); if (k2 <= 0) continue;
            ctx.save(); ctx.globalAlpha *= bA; ctx.translate(bx, by); ctx.scale(k2, k2); D.glow(ctx, 0, 0, 34, C.yellow, 0.45); D.icon(ctx, 'bulb', 0, 0, 34, C.yellow, 5); ctx.restore();
          }
          ctx.save(); ctx.globalAlpha *= bA; D.pill(ctx, { zh: '全是同一个点子', en: 'all the same idea' }, 560, 214, { size: 30, fill: C.yellow, align: 'center' }); ctx.restore();
        }
      }
      X.quiz(ctx, t, 140, 170, { opts: [{ zh: '10000 倍', en: '10,000×' }, { zh: '1000 倍', en: '1,000×' }, { zh: '约 100 倍', en: 'about 100×' }], ans: 2, t0: S.T('w3q') + 0.5, tA: S.T('w3r') + 0.9, tEnd: S.T('w3r') + 1.6, w: 540 });
      const ta = M.env(t, S.T('w3r') + 2.0, S.T('w3s') + 0.4, 0.35, 0.35);
      if (ta > 0) {
        ctx.save(); ctx.globalAlpha *= ta;
        D.panel(ctx, 140, 170, 640, 350, { fill: 'rgba(28,27,24,0.94)', r: 22 });
        T.line(ctx, { zh: '平方根经验法则', en: 'square-root rule of thumb' }, 172, 224, 32, C.yellow, 900, 'left');
        const rows = [[{ zh: '4 个', en: '4' }, { zh: '约快 2 倍', en: '~2× faster' }], [{ zh: '100 个', en: '100' }, { zh: '约快 10 倍', en: '~10× faster' }], [{ zh: '10,000 个', en: '10,000' }, { zh: '约快 100 倍', en: '~100× faster' }]];
        rows.forEach((rw, i) => {
          const y = 302 + i * 74, hi = i === 2;
          if (hi) { ctx.fillStyle = RSI.rgba(C.orange, 0.18); D.rr(ctx, 160, y - 32, 600, 64, 14); ctx.fill(); }
          T.line(ctx, rw[0], 190, y, 32, hi ? C.orangeL : C.ink, 800, 'left'); T.line(ctx, '→', 440, y, 32, C.ink3, 800, 'center'); T.line(ctx, rw[1], 490, y, 32, hi ? C.orangeL : C.ink, 800, 'left');
        });
        ctx.restore();
      }
    }
    if (k === 3) { // the reality wall: chips, power plants, waiting
      ctx.fillStyle = '#5A5F68'; ctx.beginPath(); ctx.moveTo(40, FL); ctx.quadraticCurveTo(95, 650, 70, 560); ctx.lineTo(190, 560); ctx.quadraticCurveTo(165, 650, 220, FL); ctx.closePath(); ctx.fill();
      ctx.setLineDash([10, 8]); ctx.strokeStyle = 'rgba(240,238,230,0.4)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(70, 560); ctx.quadraticCurveTo(82, 500, 60, 440); ctx.lineTo(200, 440); ctx.quadraticCurveTo(178, 500, 190, 560); ctx.stroke(); ctx.setLineDash([]);
      T.line(ctx, { zh: '电厂 · 在建', en: 'power plant · building' }, 130, 408, 24, C.ink2, 700, 'center');
      ctx.fillStyle = '#3A3F47'; ctx.fillRect(260, 520, 620, FL - 520);
      ctx.fillStyle = '#4A505A'; ctx.beginPath(); ctx.moveTo(260, 520); for (let i = 0; i < 5; i++) { ctx.lineTo(260 + i * 124, 446); ctx.lineTo(260 + (i + 1) * 124, 520); } ctx.closePath(); ctx.fill();
      for (let i = 0; i < 6; i++) { ctx.fillStyle = RSI.rgba('#9FC3E8', 0.3 + 0.15 * Math.sin(t * 2 + i)); ctx.fillRect(290 + i * 98, 570, 62, 42); }
      ctx.fillStyle = '#23262B'; ctx.fillRect(525, 690, 90, FL - 690);
      T.line(ctx, { zh: '芯片工厂', en: 'CHIP FAB' }, 570, 655, 34, C.paper, 900, 'center');
      ctx.fillStyle = '#5A4430'; ctx.fillRect(1063, 590, 14, FL - 590);
      D.panel(ctx, 930, 474, 280, 124, { fill: C.raised, r: 14 });
      T.line(ctx, { zh: '排队等芯片……', en: 'waiting for chips…' }, 1070, 514, 28, C.ink, 800, 'center');
      T.line(ctx, { zh: '预计：好几年', en: 'expected: years' }, 1070, 560, 30, C.yellow, 900, 'center');
    }
  };
  RSI.defScene({
    id: 'walls', music: 'tension', lead: 0.5,
    lines: [
      { id: 'w0', who: 'narr', zh: '怀疑派还指出：路上有好几堵“墙”——也就是瓶颈。', en: 'The skeptics also point to “walls” on the road — bottlenecks.' },
      { id: 'w0b', who: 'clawd', zh: '墙？加速派说 r 大于 1——那我就全速冲过去！', en: 'Walls? The fast camp says r is above 1 — so I’ll charge right through!' },
      { id: 'w1', who: 'narr', zh: '{o|算力墙}：点子要靠实验验证，一次大训练要跑好几个月——想得再快，也得等它跑完。', en: '{o|The compute wall}: ideas must be tested by experiments, and a big training run takes months — however fast you think, you wait for it to finish.', at: 'w0b$+1.3', hold: 0.3 },
      { id: 'w2', who: 'narr', zh: '{o|品味墙}：普林斯顿的研究者，用“还没发表的论文”里的题目考 AI——它不可能提前见过答案。', en: '{o|The taste wall}: Princeton researchers tested AI on questions from papers not yet published — so it couldn’t have seen the answers.', at: 'w1$+2.0' },
      { id: 'w2b', who: 'narr', zh: '结果：AI 很会动手做实验，却不太会判断“该研究什么”——探索得太少，结论下得太快。', en: 'The result: AI was good at running experiments, but weak at judging what to research — it explored too little and concluded too fast.', gap: 0.2, hold: 0.8 },
      { id: 'w3', who: 'clawd', zh: '一个我不够快？那就复制一万个我，一起冲！', en: 'One of me isn’t fast enough? Then copy me ten thousand times and charge together!', at: 'w2b$+1.95' },
      { id: 'w3q', who: 'narr', zh: '考考你：一万个 Clawd 一起干，能快多少倍？', en: 'Quiz: ten thousand Clawds working together — how many times faster?', gap: 0.15 },
      { id: 'w3r', who: 'narr', zh: '答案：约 100 倍。这就是{o|并行墙}：按一条经验法则，速度只随数量的平方根增长——翻 4 倍，才快 2 倍。', en: 'The answer: about 100×. That’s {o|the parallel wall}: by a rule of thumb, speed grows only with the square root of the number — four times as many, only twice as fast.', at: 'w3q$+1.5', hold: 0.5, kick: true },
      { id: 'w3s', who: 'narr', zh: '因为它们常常想到一块儿去：一万个我，冒出的是同一个点子。', en: 'Because they often think alike: ten thousand of me, all having the same idea.', hold: 0.4 },
      { id: 'w4', who: 'narr', zh: '{o|现实墙}：有些事只能在真实世界里等——芯片要造，电厂要建。', en: '{o|The reality wall}: some things can only wait on the physical world — chips must be made, power plants built.', at: 'w3s$+1.95', hold: 0.3 },
      { id: 'w5', who: 'clawd', zh: '所以……不是爆炸，而是一路撞墙？', en: 'So… not an explosion, but wall after wall?' },
      { id: 'w6', who: 'narr', zh: '也可能：撞一堵，绕过去，再撞下一堵。两派真正吵的，是这些墙绕不绕得过去。', en: 'Or maybe: hit one, get past it, hit the next. What the camps really argue about is whether these walls can be got around.', hold: 0.6 },
    ],
    cues: [
      ['w0b$+0.1', 'whoosh'], ...ARRIVE.map((a) => [a, 'thud']), ...ARRIVE.map((a) => [shf(a, 0.05), 'boing']), ...LEAVE.map((a) => [a, 'hop']), ...LEAVE.map((a) => [shf(a, 0.35), 'whoosh']),
      ['w1+0.6', 'pop'], ['w1+3.1', 'snore'], ['w2+0.8', 'pop'], ['w2b+1.0', 'swish'], ['w2b+2.6', 'stamp'], ['w2b+3.8', 'chime'],
      ['w3+0.9', 'copy'], ['w3+1.35', 'copy'], ['w3+1.8', 'copy'], ['w3+2.25', 'copy'], ['w3q+0.5', 'quizIn'],
      ...[0, 1, 2].map((k) => [(b) => b.w3q.t + 0.9 + ((b.w3r.t + 0.9) - (b.w3q.t + 0.9)) * k / 3, 'tick']), [(b) => b.w3r.t + 0.9, 'ding'],
      ['w3s+0.4', 'idea'], ['w3s$+0.2', 'erase'], ['w4+0.4', 'build'], ['w6+1.4', 'land'],
    ],
    draw(ctx, t, S) {
      const m = motion(t, S), cam = m.cam;
      D.dots(ctx, 0.03, 48, -cam * 0.5, 0);
      X.floor(ctx, FL);
      for (let k = 0; k < 4; k++) { const o = k * SP - cam; if (o < -2400 || o > W + 200) continue; ctx.save(); ctx.translate(o, 0); props(ctx, k, t, S, m); ctx.restore(); }
      for (let k = 0; k < 4; k++) { const sx = k * SP + WX - cam; if (sx < -300 || sx > W + 300) continue; brickWall(ctx, sx, t > S.T(WALLS[k].lit) - 0.1, WALLS[k]); }
      const nx = 3 * SP + 2950 - cam; if (t > m.lv[3] + 0.5 && nx < W + 300) { ctx.save(); ctx.globalAlpha *= M.seg(t, m.lv[3] + 0.5, m.lv[3] + 1.2); brickWall(ctx, nx, false, null); ctx.restore(); }
      // Clawd
      const sx = m.x - cam, run = m.mode === 'run', walk = m.mode === 'walk';
      const bob = run ? -Math.abs(Math.sin(t * 14)) * 10 : walk ? -Math.abs(Math.sin(t * 7)) * 5 : 0;
      let expr = 'determined', look = [1, 0], armL = 0, armR = 0, sxq = 1, syq = 1;
      if (m.mode === 'stand') expr = S.on('w0b') ? 'determined' : X.blink(t, 2) ? 'blink' : 'normal';
      if (m.mode === 'bonk') { expr = 'x'; sxq = 0.85; syq = 1.1; }
      if (m.mode === 'hop') { expr = 'happy'; armL = armR = 1; }
      if (m.mode === 'walk') { expr = X.blink(t, 4) ? 'blink' : 'normal'; look = [1, -0.3]; }
      if (m.mode === 'wait') {
        expr = X.blink(t, 3) ? 'blink' : 'normal';
        if (m.k === 0) { const tw = S.T('w1'); if (t > tw + 2.0) look = [-1, 0]; if (t > tw + 3.0 && t < m.lv[0] - 0.5) { expr = 'sleep'; syq = 0.9; sxq = 1.04; } if (t >= m.lv[0] - 0.5) expr = 'surprised'; }
        if (m.k === 1) { const tb = S.T('w2b'); look = [-1, 0]; if (t > tb + 1.0) look = [-1, -0.2]; if (t > tb + 2.4 && t < tb + 3.8) { expr = 'happy'; armR = 1; } if (t > tb + 3.8) expr = 'surprised'; }
        if (m.k === 2) { expr = S.on('w3') ? 'determined' : X.blink(t, 3) ? 'blink' : 'normal'; look = [-1, -0.2]; }
        if (m.k === 3) { look = [-1, 0]; armL = 0.6; expr = t > S.T('w5') ? 'worried' : X.blink(t, 3) ? 'blink' : 'normal'; }
      }
      const hd = K.draw(ctx, sx, FL + m.dy + bob, CS, { gen: S.gen().g, expr, walk: run || walk ? t * (run ? 14 : 7) : null, look, armL, armR, sx: sxq, sy: syq });
      S.anchors.clawd = [sx, hd[1]];
      m.ar.forEach((a) => { const age = t - a; if (age > 0 && age < 1.2) for (let j = 0; j < 3; j++) D.sparkle(ctx, sx + Math.cos(t * 6 + j * 2.1) * 70, hd[1] - 10 + Math.sin(t * 6 + j * 2.1) * 20, 16, C.yellow, 1 - age / 1.2, t * 4); });
      if (m.mode === 'wait' && m.k === 0 && expr === 'sleep') for (let i = 0; i < 3; i++) { const ph = (t * 0.6 + i / 3) % 1; ctx.save(); ctx.globalAlpha *= Math.sin(ph * Math.PI); T.line(ctx, 'z', sx + 40 + ph * 60 + i * 6, hd[1] - 10 - ph * 90, 30 + i * 8, C.ink2, 800, 'center'); ctx.restore(); }
      if (m.k === 2 && m.mode === 'wait' && t > S.T('w3s') + 0.4) { D.glow(ctx, sx, hd[1] - 44, 50, C.yellow, 0.5); D.icon(ctx, 'bulb', sx, hd[1] - 44, 44, C.yellow, 6); }
      if (m.k === 3 && m.mode === 'wait') {
        const p = hand(sx, FL, CS, -1, 0.6); ctx.save(); ctx.translate(p[0] - 44, p[1] - 22); ctx.rotate(-0.12);
        ctx.fillStyle = C.paper; D.rr(ctx, -46, -24, 92, 48, 6); ctx.fill(); T.line(ctx, EN() ? 'No. 1024' : '第 1024 号', 0, 1, 20, '#1b1a18', 800, 'center'); ctx.restore();
      }
      const notes = {
        w1: { zh: 'OpenAI，2026.9：算力是另一道闸门', en: 'OpenAI, Sep 2026: compute is another gating factor' },
        w2: { zh: 'Kirgis & Kapoor（普林斯顿），arXiv:2607.27191 · 只测了 2 篇论文', en: 'Kirgis & Kapoor (Princeton), arXiv:2607.27191 · only 2 papers' },
        w3r: { zh: 'Toby Ord 的经验法则，引自 Ramez Naam（2026.9）', en: 'Toby Ord’s rule of thumb, via Ramez Naam (Sep 2026)' },
        w4: { zh: 'Ramez Naam，2026.9 · Epoch AI，2026.7', en: 'Ramez Naam, Sep 2026 · Epoch AI, Jul 2026' },
      };
      notes.w2b = notes.w2; notes.w3s = notes.w3r;
      for (const id in notes) if (S.on(id)) X.src(ctx, notes[id]);
    },
  });
})();
