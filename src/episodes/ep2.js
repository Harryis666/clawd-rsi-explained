/* 《Clawd 造 Clawd》第 2 集《爬到第几级了？》— manifest + the episode's own scenes:
   cold open (“AI 改进 AI”大赛：8 天 vs 2 年) · recap · 本集问题 · the fork in the fog · cliffhanger · next-episode teaser.
   The five rungs themselves live in src/scenes/ladder.js; the episode's answer in src/scenes/timeline2026.js (today). */
(function () {
  'use strict';
  const RSI = window.RSI, C = RSI.C, M = RSI.M, D = RSI.D, T = RSI.T, K = RSI.Clawd, X = RSI.X, Sx = RSI.Series;
  const W = RSI.W, H = RSI.H;
  const EN = () => RSI.lang === 'en';

  // ================================================================== 1 · cold open: the “AI improves AI” championship
  const ST = 560, REC = 1480;          // start line · human record line (x)
  const L1 = 690, L2 = 840;            // lane floors (y)
  const AX0 = 600, ASTEP = 125, HOP = 0.42;
  const BX = 250, BY = 520, BS = 13;   // commentator Clawd behind the booth desk
  const AGENT = '#7FA6D6';
  const tGo = (S) => S.R('k3$+0.25');
  const hopT = (S, i) => tGo(S) + 0.45 + i * HOP; // i = 0..7 (one hop per day)
  const days = (S, t) => { let d = 0; for (let i = 0; i < 8; i++) if (t >= hopT(S, i) + 0.38) d = i + 1; return d; };
  const stampText = (ctx, s, x, y, size, col, k, rot = -0.14) => {
    if (k <= 0) return; const sc = 1.7 - 0.7 * M.ease.outBack(M.clamp(k));
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc); ctx.globalAlpha *= M.clamp(k * 3);
    ctx.font = T.font(size, 900); const w = ctx.measureText(RSI.L(s)).width + size * 0.9, h = size * 1.5;
    ctx.fillStyle = 'rgba(20,10,8,0.55)'; D.rr(ctx, -w / 2, -h / 2, w, h, size * 0.2); ctx.fill();
    ctx.strokeStyle = col; ctx.lineWidth = size * 0.1; D.rr(ctx, -w / 2, -h / 2, w, h, size * 0.2); ctx.stroke();
    T.line(ctx, s, 0, 2, size, col, 900, 'center'); ctx.restore();
  };
  const agent = (ctx, x, y, s, o = {}) => {
    const hd = K.draw(ctx, x, y, s, Object.assign({ gen: 5, color: AGENT }, o));
    // racing bib
    ctx.save(); ctx.translate(x + (o.sx ? 0 : 0), y - 4.6 * s * (o.sy || 1)); ctx.fillStyle = C.paper; D.rr(ctx, -3.2 * s, -1.6 * s, 6.4 * s, 3.2 * s, s * 0.6); ctx.fill();
    T.line(ctx, 'AI', 0, 1, 2.4 * s, '#1b1a18', 900, 'center'); ctx.restore();
    return hd;
  };
  const crowd = (ctx, t, cheer) => {
    const cols = ['#4A4038', '#3E4652', '#4F3C3C', '#3F4A40', '#504A3A'];
    for (let row = 0; row < 3; row++) for (let k = 0; k < 42; k++) {
      const x = 500 + k * 34 + (row % 2) * 17, y = 486 + row * 30;
      const j = cheer * Math.max(0, Math.sin(t * 9 + k * 1.7 + row)) * 9;
      ctx.fillStyle = cols[(k * 7 + row * 3) % cols.length];
      ctx.beginPath(); ctx.arc(x, y - 16 - j, 12, 0, 7); ctx.fill(); D.rr(ctx, x - 16, y - 6 - j, 32, 30, 12); ctx.fill();
      if (cheer > 0.5 && (k + row) % 5 === 0) { ctx.strokeStyle = cols[(k + 2) % cols.length]; ctx.lineWidth = 6; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(x + 12, y - 4 - j); ctx.lineTo(x + 20, y - 34 - j * 1.5); ctx.stroke(); }
    }
  };
  RSI.defScene({
    id: 'e2_cold', music: 'hook', hud: false, label: false, fade: [0.1, 0.25], lead: 0.35, pad: 0.8,
    lines: [
      { id: 'k1', who: 'clawd', zh: '欢迎来到——“AI 改进 AI”大赛！', en: 'Welcome to — the “AI Improves AI” Championship!', min: 2.4 },
      { id: 'k2', who: 'clawd', zh: '1 号赛道：人类工程师，这个程序他们打磨了 2 年！', en: 'Lane one: human engineers — two years polishing this program!', min: 2.9 },
      { id: 'k3', who: 'clawd', zh: '2 号赛道：AI——它要改进的，正是它自己！', en: 'Lane two: the AI — and what it’s improving is itself!', min: 2.4 },
      { id: 'k5', who: 'clawd', zh: '第 8 天——冲线了！破纪录！', en: 'Day eight — over the line! A new record!', at: 'k3$+4.07', min: 2.0 },
      { id: 'k6', who: 'narr', zh: '这不是科幻：2026 年，一家 AI 公司公布了这项实验——AI 改进自己 8 天，胜过人类 2 年的打磨。', en: 'This isn’t science fiction: in 2026, an AI company published this experiment — an AI improving itself for 8 days beat two years of human polishing.', hold: 0.2 },
      { id: 'k7', who: 'clawd', zh: '……等等。AI，已经在改进自己了？', en: '…Wait. AI is already improving itself?', min: 2.4 },
    ],
    cues: [
      [0, 'fanfare'], [0.1, 'whoosh'], ['k2+0.4', 'riser', { dur: 1.9 }], ['k2+2.35', 'stamp'], ['k3+0.1', 'land'], ['k3+1.3', 'pop'],
      ['k3$+0.25', 'pop'], ['k3$+0.3', 'whoosh'], ['k3$+0.6', 'riser', { dur: 3.3 }],
      ...[0, 1, 2, 3, 4, 5, 6, 7].map((i) => ['k3$+' + (0.25 + 0.45 + i * HOP + 0.36).toFixed(2), 'tick']),
      ['k3$+4.03', 'tada'], ['k3$+4.3', 'stamp'], ['k6+0.3', 'swish'], ['k6+1.0', 'build'], ['k6+3.2', 'ding'],
      ['k7', 'surprise'], ['k7+0.85', 'thud'],
    ],
    draw(ctx, t, S) {
      const go = tGo(S), d = days(S, t), won = d >= 8, tWin = hopT(S, 7) + 0.38;
      const racing = t > go && !won;
      // ---- arena
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#15121A'); g.addColorStop(0.55, '#1C1714'); g.addColorStop(1, '#100E0C'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const push = 1.06 - 0.06 * M.ease.outCubic(M.seg(t, 0, 1.4));
      ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(push, push); ctx.translate(-W / 2, -H / 2);
      // spotlights
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      [[420, 0.7], [1500, -0.6]].forEach(([sx, ph], i) => {
        const tx = 1100 + Math.sin(t * 0.9 + ph * 3) * 520 + (won ? Math.sin(t * 6 + i) * 120 : 0), ty = 900;
        const gg = ctx.createLinearGradient(sx, -40, tx, ty); gg.addColorStop(0, 'rgba(255,236,200,0.16)'); gg.addColorStop(1, 'rgba(255,236,200,0)');
        ctx.fillStyle = gg; ctx.beginPath(); ctx.moveTo(sx - 18, -40); ctx.lineTo(tx - 220, ty); ctx.lineTo(tx + 220, ty); ctx.lineTo(sx + 18, -40); ctx.closePath(); ctx.fill();
      });
      ctx.restore();
      crowd(ctx, t, won ? 1 : racing ? 0.6 : 0.2);
      // ---- track
      ctx.fillStyle = '#6E3527'; D.rr(ctx, 520, 572, 1380, 300, 16); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.05)'; for (let x = 540; x < 1890; x += 46) ctx.fillRect(x, 580, 2, 284);
      ctx.fillStyle = 'rgba(245,240,230,0.75)'; ctx.fillRect(520, 572, 1380, 4); ctx.fillRect(520, 716, 1380, 4); ctx.fillRect(520, 868, 1380, 4);
      ctx.fillRect(ST - 3, 576, 6, 292);
      T.line(ctx, '1', ST - 34, 640, 40, 'rgba(245,240,230,0.6)', 900, 'center'); T.line(ctx, '2', ST - 34, 792, 40, 'rgba(245,240,230,0.6)', 900, 'center');
      // record line
      const ra = M.seg(t, S.T('k2') + 2.2, S.T('k2') + 2.6);
      if (ra > 0) {
        ctx.save(); ctx.globalAlpha *= ra; ctx.setLineDash([16, 12]); ctx.strokeStyle = won ? C.red : C.yellow; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(REC, 556); ctx.lineTo(REC, 872); ctx.stroke(); ctx.setLineDash([]);
        D.pill(ctx, { zh: '人类纪录', en: 'human record' }, REC, 548, { size: 26, fill: won ? C.red : C.yellow, color: won ? '#fff' : '#1b1a18', align: 'center' });
        ctx.restore();
      }
      // lane 1: two years of human polishing — 730 dense ticks
      const p2 = M.seg(t, S.T('k2') + 0.4, S.T('k2') + 2.3, M.ease.inOutCubic);
      if (p2 > 0) {
        const xe = ST + (REC - ST) * p2; ctx.fillStyle = RSI.rgba(C.blue, 0.85);
        for (let x = ST + 4; x < xe; x += 3) ctx.fillRect(x, L1 - 34, 1.6, 22);
        const dn = Math.round(730 * p2);
        if (p2 < 1) T.line(ctx, EN() ? `day ${dn}` : `第 ${dn} 天`, xe + 12, L1 - 24, 24, C.blue, 800, 'left');
        else { T.line(ctx, { zh: '2 年 = 730 天', en: '2 years = 730 days' }, (ST + REC) / 2, L1 - 62, 28, '#9CC4EE', 800, 'center'); }
      }
      for (let k = 0; k < 3; k++) { const pk = M.ease.outBack(M.seg(t, S.T('k2') + 2.3 + k * 0.12, S.T('k2') + 2.6 + k * 0.12)); if (pk <= 0) continue;
        RSI.Human.stand(ctx, REC - 120 + k * 46, L1 + 2, 0.32 * pk, { t: t + k, look: 1, alpha: 1 }); }
      // lane 2: the AI — eight sparse ticks
      if (t > S.T('k3')) {
        for (let i = 0; i < d; i++) { const x = AX0 + (i + 1) * ASTEP; ctx.fillStyle = C.orange; ctx.fillRect(x - 3, L2 - 34, 6, 22); T.line(ctx, String(i + 1), x, L2 + 4, 20, C.orangeL, 800, 'center'); }
        let ax = AX0, ay = 0, sx = 1, sy = 1, hopping = false;
        const drop = M.seg(t, S.T('k3') + 0.0, S.T('k3') + 0.35, M.ease.inCubic);
        if (t < go) { ay = -(1 - drop) * 380; }
        for (let i = 0; i < 8; i++) { const u = (t - hopT(S, i)) / 0.38; if (u >= 0 && u <= 1) { ax = M.lerp(AX0 + i * ASTEP, AX0 + (i + 1) * ASTEP, M.ease.inOutCubic(u)); ay = -Math.sin(u * Math.PI) * 46; hopping = true; sx = 0.94; sy = 1.08; } else if (u > 1) ax = AX0 + (i + 1) * ASTEP; }
        const expr = won ? 'happy' : t > go ? 'determined' : X.blink(t, 9) ? 'blink' : 'normal';
        const hd = agent(ctx, ax, L2 + ay, 6.2, { expr, look: [1, -0.1], armL: hopping ? 0.9 : won ? 1 : 0.2, armR: hopping ? 0.9 : won ? 1 : 0.2, sx, sy });
        if (racing && hopping) X.speed(ctx, ax - 90, L2 - 60, t, 120, 70, 0.8, 'rgba(240,238,230,0.4)');
        // “what it improves: itself”
        const ia = M.seg(t, S.T('k3') + 1.3, S.T('k3') + 1.6) * (1 - M.seg(t, go - 0.1, go + 0.2));
        if (ia > 0) { ctx.save(); ctx.globalAlpha *= ia; const bob = Math.sin(t * 7) * 5;
          D.pill(ctx, { zh: '改进对象：它自己', en: 'improving: itself' }, AX0 + 250, L2 - 120 + bob, { size: 28, fill: C.orange, align: 'center' });
          D.arrow(ctx, AX0 + 150, L2 - 104 + bob, AX0 + 52, hd[1] + 18, { color: C.orangeL, w: 5, head: 18 }); ctx.restore(); }
        // day pop above the runner
        if (t > go && d > 0) { const tl = hopT(S, d - 1) + 0.38, k = M.ease.outBack(M.seg(t, tl, tl + 0.2)); ctx.save(); ctx.translate(ax, hd[1] - 46); ctx.scale(k, k);
          T.line(ctx, EN() ? `Day ${d}` : `第 ${d} 天`, 0, 0, d === 8 ? 44 : 34, d === 8 ? C.yellow : C.orangeL, 900, 'center'); ctx.restore(); }
        if (won) { X.sparkles(ctx, AX0 + 8 * ASTEP, L2 - 60, t, 14, 190, C.yellow, 5); stampText(ctx, { zh: '破纪录！', en: 'NEW RECORD!' }, 1700, 650, 50, C.red, M.seg(t, tWin + 0.25, tWin + 0.5)); }
      }
      // go flash
      const gf = M.seg(t, go, go + 0.12) * (1 - M.seg(t, go + 0.7, go + 1.0));
      if (gf > 0) { ctx.save(); ctx.globalAlpha *= gf; T.line(ctx, { zh: '比赛开始！', en: 'GO!' }, 1120, 792, 84, C.paper, 900, 'center'); ctx.restore(); }
      // ---- banner + scoreboard
      ctx.save(); ctx.fillStyle = '#1E1B19'; D.rr(ctx, 560, 22, 800, 118, 18); ctx.fill(); ctx.strokeStyle = C.orange; ctx.lineWidth = 4; ctx.stroke();
      for (let i = 0; i < 26; i++) { const on = (Math.floor(t * 8) + i) % 3 === 0; ctx.fillStyle = on ? '#FFE3A6' : '#5A4A33'; ctx.beginPath(); ctx.arc(580 + i * 30.4, 30, 4, 0, 7); ctx.arc(580 + i * 30.4, 132, 4, 0, 7); ctx.fill(); }
      T.line(ctx, { zh: '“AI 改进 AI”大赛', en: 'The “AI Improves AI” Championship' }, 960, 82, EN() ? 44 : 60, C.paper, 900, 'center');
      ctx.restore();
      const box = (x, col, lab, val, a) => { if (a <= 0) return; ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = '#141312'; D.rr(ctx, x, 150, 348, 62, 12); ctx.fill(); ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.stroke();
        T.line(ctx, lab, x + 20, 182, 26, col, 800, 'left'); T.line(ctx, val, x + 330, 182, 32, C.paper, 900, 'right', 'mono'); ctx.restore(); };
      const hv = p2 >= 1 ? (EN() ? '2 yrs' : '2 年') : (EN() ? `${Math.round(730 * p2)} d` : `${Math.round(730 * p2)} 天`);
      box(600, C.blue, { zh: '人类 · 用时', en: 'Humans · time' }, hv, M.seg(t, S.T('k2'), S.T('k2') + 0.3));
      box(972, C.orange, { zh: 'AI · 用时', en: 'AI · time' }, t < go ? '—' : (EN() ? `${d} d` : `${d} 天`) + (won ? ' ✓' : ''), M.seg(t, S.T('k3'), S.T('k3') + 0.3));
      ctx.save(); ctx.globalAlpha *= 0.4 + 0.6 * (Math.floor(t * 2) % 2); ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(1394, 48, 9, 0, 7); ctx.fill(); ctx.restore();
      T.line(ctx, { zh: '直播', en: 'LIVE' }, 1410, 49, 22, C.red, 900, 'left');
      ctx.restore();
      // ---- time on one ruler (both quantities visible, pushed to the extreme)
      const ov = M.seg(t, S.T('k6') + 0.2, S.T('k6') + 0.7, M.ease.outCubic);
      if (ov > 0) {
        ctx.save(); ctx.globalAlpha *= ov; ctx.fillStyle = 'rgba(14,13,12,0.975)'; D.rr(ctx, 530, 560, 1360, 322, 18); ctx.fill(); ctx.strokeStyle = 'rgba(240,238,230,0.18)'; ctx.lineWidth = 2; ctx.stroke();
        T.line(ctx, { zh: '所用时间 · 同一把尺子', en: 'Time taken · same ruler' }, 572, 606, 28, C.ink2, 700, 'left');
        const q = M.seg(t, S.T('k6') + 1.0, S.T('k6') + 2.6, M.ease.outCubic), X0 = 720, LEN = 860;
        T.line(ctx, { zh: '人类', en: 'Humans' }, X0 - 24, 676, 32, C.blue, 900, 'right');
        ctx.fillStyle = C.blue; D.rr(ctx, X0, 652, Math.max(8, LEN * q), 48, 10); ctx.fill();
        T.line(ctx, { zh: '730 天（2 年）', en: '730 days (2 yrs)' }, X0 + LEN * q + 18, 676, 30, '#9CC4EE', 900, 'left');
        const q2 = M.seg(t, S.T('k6') + 3.0, S.T('k6') + 3.3);
        T.line(ctx, 'AI', X0 - 24, 786, 32, C.orange, 900, 'right');
        if (q2 > 0) { ctx.save(); ctx.globalAlpha *= q2; ctx.fillStyle = C.orange; ctx.fillRect(X0, 762, Math.max(3, LEN * 8 / 730), 48);
          T.line(ctx, { zh: '8 天', en: '8 days' }, X0 + 34, 786, 34, C.orange, 900, 'left');
          T.line(ctx, { zh: '← 只有这么一点', en: '← that tiny sliver' }, X0 + (EN() ? 190 : 150), 788, 26, C.ink2, 600, 'left'); ctx.restore(); }
        T.line(ctx, { zh: '真实实验 · 艺术化演绎 · 结果由该公司自己报告', en: 'real experiment · dramatised · results self-reported by the company' }, 1866, 852, 20, C.ink3, 500, 'right');
        ctx.restore();
      }
      // ---- the commentary booth
      ctx.fillStyle = '#24201C'; D.rr(ctx, 40, 232, 452, 316, 22); ctx.fill(); ctx.strokeStyle = 'rgba(240,238,230,0.14)'; ctx.lineWidth = 3; ctx.stroke();
      ctx.fillStyle = 'rgba(217,119,87,0.10)'; D.rr(ctx, 56, 248, 420, 246, 14); ctx.fill();
      let expr = 'happy', look = [0.6, 0.2], armL = 0.75 + Math.sin(t * 8) * 0.12, armR = 0.5, hop = { dy: 0, sx: 1, sy: 1 };
      if (t > S.T('k2')) { expr = 'normal'; look = [1, 0.5]; armL = 0.45; armR = 0.6; }
      if (t > S.T('k3')) { look = [1, 0.9]; armR = 0.3; }
      if (t > go) { expr = 'determined'; look = [1, 0.8]; armL = 0.5 + 0.4 * Math.max(0, Math.sin(t * 14)); armR = 0.5 + 0.4 * Math.max(0, Math.sin(t * 14 + 3)); }
      if (won) { expr = 'happy'; armL = armR = 1; hop = X.hop(t, tWin + 0.05, 0.45, 40); }
      if (t > S.T('k6')) { expr = X.blink(t, 4) ? 'blink' : 'normal'; look = [1, 0.4]; armL = armR = 0; hop = { dy: 0, sx: 1, sy: 1 }; }
      if (t > S.T('k7')) { expr = 'surprised'; look = [-0.1, -0.1]; armL = armR = 0.25; hop = X.hop(t, S.T('k7') + 0.35, 0.4, 34); }
      const hd = K.draw(ctx, BX, BY + hop.dy, BS, { gen: 3, expr, look, armL, armR, sx: hop.sx, sy: hop.sy, shadow: false });
      // desk mic on the left (knocked over at k7)
      const fall = M.ease.inCubic(M.seg(t, S.T('k7') + 0.5, S.T('k7') + 0.85));
      ctx.save(); ctx.translate(102, 496); ctx.rotate(-1.45 * fall); ctx.strokeStyle = '#8D877B'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -56); ctx.stroke();
      ctx.fillStyle = '#3A3835'; D.rr(ctx, -14, -96, 28, 42, 13); ctx.fill(); ctx.fillStyle = 'rgba(240,238,230,0.3)'; for (let i = 0; i < 3; i++) ctx.fillRect(-10, -88 + i * 10, 20, 3); ctx.restore();
      ctx.fillStyle = '#3B2E25'; D.rr(ctx, 56, 494, 420, 54, 12); ctx.fill(); ctx.fillStyle = '#4A3A2E'; ctx.fillRect(56, 494, 420, 9);
      T.line(ctx, { zh: '解说席', en: 'COMMENTARY' }, 266, 526, 26, C.orangeL, 900, 'center');
      if (t > S.T('k7') + 0.4) { X.mark(ctx, '?', BX - 60, hd[1] - 30, t - S.T('k7') - 0.4, C.yellow, 80); X.mark(ctx, '!', BX + 40, hd[1] - 44, t - S.T('k7') - 0.7, C.orangeL, 64); }
      S.anchors.clawd = [BX + 104, hd[1] + 40]; S.sides.clawd = 'right';
      // lane labels
      T.line(ctx, { zh: '1 号赛道', en: 'Lane 1' }, 90, 628, 34, C.paper, 900, 'left'); T.line(ctx, { zh: '人类工程师', en: 'human engineers' }, 90, 670, 26, '#9CC4EE', 700, 'left');
      T.line(ctx, { zh: '2 号赛道', en: 'Lane 2' }, 90, 780, 34, C.paper, 900, 'left'); T.line(ctx, { zh: 'AI 自己', en: 'the AI itself' }, 90, 822, 26, C.orangeL, 700, 'left');
      // tag (top-right)
      ctx.save(); ctx.globalAlpha *= M.seg(t, 0.8, 1.3); T.line(ctx, { zh: '真实实验 · 艺术化演绎', en: 'real experiment · dramatised' }, 1870, 186, 22, C.ink2, 600, 'right'); ctx.restore();
    },
  });

  // ================================================================== 2 · sting · recap · this episode's question
  Sx.sting(2);
  Sx.recap(2, [
    { from: 'flip', at: 'f4', zh: 'AI 改进“变聪明的方法”，一代造一代——而且越造越快。', en: 'AI improves “the way to get smarter”: each generation builds the next — faster and faster.' },
    { from: 'e1_dream', at: 'd4', zh: '可这个循环……停得下来吗？', en: 'But can this loop… ever stop?' },
  ], { gen: 3 });
  RSI.allScenes.e2_recap.hud = false;
  Sx.question(2, { zh: 'AI 已经在改进自己了吗？\n改到了哪一步？', en: 'Is AI already improving itself?\nHow far has it got?' }, {
    draw(ctx, t, S) { const a = M.seg(t, S.T('q') + 0.8, S.T('q') + 1.3); ctx.save(); ctx.globalAlpha *= a; Sx.dots(ctx, 545, 770, 2, { labels: true, gap: 230 }); ctx.restore(); },
  });
  RSI.allScenes.e2_q.hud = false;

  // ================================================================== 3 · the fork in the fog (end of the climb)
  const FX = 600, FY = 860, FS = 10;
  const bez = (P, u) => { const v = 1 - u; return [v * v * v * P[0][0] + 3 * v * v * u * P[1][0] + 3 * v * u * u * P[2][0] + u * u * u * P[3][0], v * v * v * P[0][1] + 3 * v * v * u * P[1][1] + 3 * v * u * u * P[2][1] + u * u * u * P[3][1]]; };
  const PA = [[770, 850], [1060, 800], [1230, 430], [1330, 40]];   // faster and faster → up into the fog
  const PB = [[770, 872], [1150, 884], [1440, 852], [1640, 846]];  // slower and slower → the wall
  const path = (ctx, P, p, col, w, dash) => { if (p <= 0) return; ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; if (dash) ctx.setLineDash(dash);
    ctx.beginPath(); const n = 60; for (let i = 0; i <= Math.floor(n * p); i++) { const q = bez(P, i / n); i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); } ctx.stroke(); ctx.restore(); };
  const board = (ctx, x, y, rot, w, text, col, glow) => {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    if (glow > 0) D.glow(ctx, w / 2, 0, w * 0.7, col, 0.45 * glow);
    ctx.fillStyle = '#6B5337'; ctx.beginPath(); ctx.moveTo(0, -34); ctx.lineTo(w - 34, -34); ctx.lineTo(w, 0); ctx.lineTo(w - 34, 34); ctx.lineTo(0, 34); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = RSI.mix('#6B5337', col, 0.35 + 0.65 * glow); ctx.lineWidth = 4; ctx.stroke();
    T.line(ctx, text, (w - 34) / 2 + 6, 2, EN() ? 26 : 32, RSI.mix(C.paper, col, 0.5 * glow), 900, 'center'); ctx.restore();
  };
  RSI.defScene({
    id: 'e2_end', music: 'tension', fade: [0.3, 0], lead: 0.7, pad: -0.6, chapter: { zh: '两种预测', en: 'Two forecasts' },
    lines: [
      { id: 'n1', who: 'narr', zh: '再往上会怎样？有两种预测。', en: 'What happens further up? There are two forecasts.', min: 2.2 },
      { id: 'n2', who: 'narr', zh: '一种说：循环越转越快，冲向“智能爆炸”；', en: 'One: the loop spins faster and faster, toward an “intelligence explosion”;', min: 2.7 },
      { id: 'n3', who: 'narr', zh: '另一种说：越转越慢，迟早撞墙。', en: 'the other: it spins slower and slower, and sooner or later hits a wall.', min: 2.5 },
      { id: 'n4', who: 'clawd', zh: '我……会走哪一条？', en: 'Which one… will I take?', min: 2.0 },
    ],
    cues: [[0.25, 'climb'], [0.7, 'land'], ['n1+1.1', 'thud'], ['n2+0.5', 'rocket'], ['n3+0.6', 'roll'], ['n3+2.25', 'thud'], ['n4', 'heart']],
    draw(ctx, t, S) {
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#4A5059'); g.addColorStop(0.45, '#2A2A2B'); g.addColorStop(1, '#100F0D'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // far fog bands
      for (let i = 0; i < 7; i++) { const x = ((i * 420 + t * (14 + i * 3) * (i % 2 ? 1 : -1)) % 2600 + 2600) % 2600 - 340; ctx.fillStyle = 'rgba(214,220,228,0.07)'; ctx.beginPath(); ctx.ellipse(x, 120 + i * 70, 560, 80, 0, 0, 7); ctx.fill(); }
      // the two roads (dim until named)
      const pa = M.seg(t, S.T('n2') + 0.2, S.T('n2') + 1.4, M.ease.inOutCubic), pb = M.seg(t, S.T('n3') + 0.2, S.T('n3') + 1.4, M.ease.inOutCubic);
      const sa = M.seg(t, S.T('n1') + 0.4, S.T('n1') + 1.6);
      path(ctx, PA, sa, 'rgba(240,238,230,0.16)', 26); path(ctx, PB, sa, 'rgba(240,238,230,0.16)', 26);
      path(ctx, PA, pa, RSI.rgba(C.orange, 0.85), 10, [22, 16]); path(ctx, PB, pb, RSI.rgba(C.blue, 0.85), 10, [22, 16]);
      // the wall at the end of road B
      ctx.save(); ctx.globalAlpha *= 0.35 + 0.65 * pb;
      for (let r = 0; r < 8; r++) for (let c = 0; c < 3; c++) { ctx.fillStyle = (r + c) % 2 ? '#7A4434' : '#6A3A2D'; ctx.fillRect(1650 + c * 44 + (r % 2) * 22, 600 + r * 34, 42, 31); }
      ctx.restore();
      // rocket up road A
      const ru = M.seg(t, S.T('n2') + 0.6, S.T('n2') + 2.4, M.ease.inCubic);
      if (ru > 0 && ru < 1) { const q = bez(PA, 0.25 + 0.75 * ru), q2 = bez(PA, 0.25 + 0.75 * ru + 0.01); const an = Math.atan2(q2[1] - q[1], q2[0] - q[0]);
        ctx.save(); ctx.translate(q[0], q[1]); ctx.rotate(an); ctx.globalAlpha *= 1 - M.seg(ru, 0.7, 1);
        ctx.fillStyle = '#FFB36B'; ctx.beginPath(); ctx.moveTo(-30, -8); ctx.lineTo(-60 - Math.random() * 0, 0); ctx.lineTo(-30, 8); ctx.fill(); D.glow(ctx, -34, 0, 60, C.orange, 0.8);
        ctx.fillStyle = C.paper; ctx.beginPath(); ctx.moveTo(26, 0); ctx.lineTo(-24, -14); ctx.lineTo(-24, 14); ctx.closePath(); ctx.fill(); ctx.restore(); }
      // ball rolling down road B, slowing, bonk
      const bu = M.seg(t, S.T('n3') + 0.6, S.T('n3') + 2.25), be = 1 - Math.pow(1 - bu, 2.4);
      if (bu > 0) { const q = bez(PB, 0.06 + 0.94 * be * 0.985); ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(q[0], q[1] - 18, 16, 0, 7); ctx.fill();
        if (bu >= 1) { const age = t - (S.T('n3') + 2.25); if (age < 1.4) for (let i = 0; i < 5; i++) { const an = -1.9 + i * 0.5; D.sparkle(ctx, q[0] + Math.cos(an) * (30 + age * 30), q[1] - 30 + Math.sin(an) * (30 + age * 30), 12, C.yellow, 1 - age / 1.4, an); } } }
      // near fog (hides where both roads end)
      const fg = ctx.createLinearGradient(0, 0, 0, 640); fg.addColorStop(0, 'rgba(200,206,214,0.62)'); fg.addColorStop(1, 'rgba(200,206,214,0)'); ctx.fillStyle = fg; ctx.fillRect(0, 0, W, 640);
      for (let i = 0; i < 6; i++) { const x = ((i * 380 + t * 22 * (i % 2 ? 1 : -1)) % 2400 + 2400) % 2400 - 240; ctx.fillStyle = 'rgba(206,212,220,0.10)'; ctx.beginPath(); ctx.ellipse(x, 380 + (i % 3) * 90, 420, 70, 0, 0, 7); ctx.fill(); }
      // ledge + the ladder Clawd just climbed
      ctx.fillStyle = '#2E2925'; ctx.beginPath(); ctx.moveTo(360, 1080); ctx.lineTo(370, 880); ctx.lineTo(420, 862); ctx.lineTo(790, 858); ctx.lineTo(830, 900); ctx.lineTo(860, 1080); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(240,238,230,0.08)'; ctx.fillRect(420, 858, 370, 3);
      ctx.strokeStyle = '#8C7A63'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(240, 1090); ctx.lineTo(262, 846); ctx.moveTo(360, 1090); ctx.lineTo(382, 846); ctx.stroke();
      ctx.strokeStyle = C.orange; ctx.lineWidth = 10; for (let k = 0; k < 4; k++) { const y = 900 + k * 60; ctx.beginPath(); ctx.moveTo(258 - k * 2, y); ctx.lineTo(378 - k * 2, y); ctx.stroke(); }
      // signpost
      const sp = M.ease.outBack(M.seg(t, S.T('n1') + 0.9, S.T('n1') + 1.3));
      if (sp > 0) {
        ctx.save(); ctx.translate(900, 860); ctx.scale(1, sp); ctx.translate(-900, -860);
        ctx.fillStyle = '#5A4430'; D.rr(ctx, 890, 580, 20, 282, 6); ctx.fill();
        board(ctx, 902, 640, -0.42, EN() ? 400 : 380, { zh: '越转越快 → 爆炸？', en: 'faster & faster → boom?' }, C.orange, M.seg(t, S.T('n2'), S.T('n2') + 0.4));
        board(ctx, 902, 742, 0.02, EN() ? 400 : 380, { zh: '越转越慢 → 撞墙？', en: 'slower & slower → wall?' }, C.blue, M.seg(t, S.T('n3'), S.T('n3') + 0.4));
        ctx.restore();
      }
      // Clawd (top generation of this episode)
      const hop = X.hop(t, 0.25, 0.5, 70); const climbX = M.lerp(310, FX, M.ease.inOutCubic(M.seg(t, 0.25, 0.75)));
      let expr = X.blink(t, 8) ? 'blink' : 'normal', look = [0.4, -0.9], armL = 0, armR = 0;
      if (t > S.T('n2')) { expr = 'surprised'; look = [0.8, -1]; }
      if (t > S.T('n3')) { expr = 'normal'; look = [1, 0.1]; }
      if (t > S.T('n3') + 2.25) { expr = 'worried'; }
      if (t > S.T('n4')) { expr = 'worried'; const sw = Math.sin((t - S.T('n4')) * 3.2); look = [0.9 * sw, sw > 0 ? -0.8 : 0.1]; armL = armR = 0.3; }
      const hd = K.draw(ctx, climbX, FY + hop.dy, FS, { gen: S.gen().g, expr, look, armL, armR, sx: hop.sx, sy: hop.sy });
      if (t > S.T('n4') + 0.6) X.sweat(ctx, climbX + 84, hd[1] + 34, (t - S.T('n4') - 0.6) % 1.7, 1.2);
      S.anchors.clawd = [climbX + 10, hd[1] - 6]; S.sides.clawd = 'up';
    },
  });

  // ================================================================== 4 · cliffhanger + next time
  Sx.cliff(2, { from: 'e2_end', at: 'n4$-0.6', fx: 800, fy: 640, tx: 1330, ty: -250 });
  Sx.next(2, [
    { from: 'e3_cold', at: 'k2', zh: '越改越快？还是越改越慢？', en: 'Faster — or slower?' },
    { from: 'walls', at: 'w3+1.0', zh: '一万个 Clawd，会快一万倍吗？', en: '10,000 Clawds — 10,000× faster?' },
    { from: 'e3_end', at: 'x3', zh: '……谁在那儿？', en: '…Who’s there?' },
  ], { gen: 8, bye: { zh: '爆炸，还是撞墙？下集见！', en: 'Explosion, or a wall? See you next time!' } });

  // ================================================================== manifest
  Object.assign(RSI.EPS[1], {
    scenes: ['e2_cold', 'e2_sting', 'e2_recap', 'e2_q', 'ladder', 'r1', 'r2', 'r3', 'r4', 'r5', 'today', 'top', 'e2_end', 'e2_cliff', 'e2_next'],
    chapters: {
      e2_cold: { zh: '开场', en: 'Cold open' }, e2_recap: { zh: '上回书说到', en: 'Previously' }, e2_q: { zh: '本集问题', en: 'This episode' },
      ladder: { zh: '五个层级', en: 'Five rungs' }, r1: { zh: '第 1 级', en: 'Rung 1' }, r2: { zh: '第 2 级', en: 'Rung 2' }, r3: { zh: '第 3 级', en: 'Rung 3' },
      r4: { zh: '第 4 级', en: 'Rung 4' }, r5: { zh: '第 5 级', en: 'Rung 5' }, today: { zh: '本集答案', en: 'The answer' }, top: { zh: '最高一级', en: 'The top rung' },
      e2_end: { zh: '两种预测', en: 'Two forecasts' }, e2_next: { zh: '下集预告', en: 'Next time' },
    },
  });
})();
