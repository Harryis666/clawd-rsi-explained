/* EP4 finale: the last option (the permission prompt, Gen 47 → 48) · two unfinished sentences from EP1 (Good's second half + Gen 47's warning) · the ending · credits. */
(function () {
  'use strict';
  const RSI = window.RSI, C = RSI.C, M = RSI.M, D = RSI.D, T = RSI.T, K = RSI.Clawd, X = RSI.X, MON = RSI.Monster, Sx = RSI.Series;
  const W = RSI.W, H = RSI.H;
  const EN = () => RSI.lang === 'en';

  const OPTS = [
    { zh: '1. 是', en: '1. Yes' },
    { zh: '2. 是，并且以后都不用再问我', en: '2. Yes, and don\'t ask me again' },
    { zh: '3. 否，告诉 Clawd 换个做法', en: '3. No, and tell Clawd what to do differently' },
  ];
  const chevron = (ctx, x, y, s, col) => { ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = s * 0.16; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(x - s * 0.18, y - s * 0.3); ctx.lineTo(x + s * 0.18, y); ctx.lineTo(x - s * 0.18, y + s * 0.3); ctx.stroke(); ctx.restore(); };
  /** Claude Code–style permission dialog. (bx,by) top-left, width bw. sel = highlighted option; o.pulse 0..1 */
  RSI.drawPrompt = (ctx, bx, by, bw, sel, t, o = {}) => {
    const a = o.alpha == null ? 1 : o.alpha; if (a <= 0) return 0;
    const bh = 470;
    ctx.save(); ctx.globalAlpha *= a;
    ctx.fillStyle = 'rgba(25,25,23,0.96)'; D.rr(ctx, bx, by, bw, bh, 14); ctx.fill();
    ctx.strokeStyle = RSI.rgba(C.orange, 0.85); ctx.lineWidth = 2.5; ctx.stroke();
    T.line(ctx, { zh: '修改文件', en: 'Edit file' }, bx + 28, by + 40, 26, C.orange, 700, 'left');
    const fw = T.width(ctx, { zh: '修改文件', en: 'Edit file' }, 26, 700);
    T.line(ctx, 'clawd_next/train.py', bx + 44 + fw, by + 41, 25, C.ink, 700, 'left', 'mono');
    const dx = bx + 24, dy = by + 70, dw = bw - 48;
    ctx.fillStyle = '#121211'; D.rr(ctx, dx, dy, dw, 150, 10); ctx.fill();
    const g = o.gen || 12;
    const rows = [['7', '-', 'GEN = ' + g, C.red], ['7', '+', 'GEN = ' + (g + 1), C.green], ['8', '+', { zh: '# 更快、更强，也更会改进自己', en: '# faster, stronger, and better at improving itself' }, C.green]];
    rows.forEach((r, i) => {
      const ry = dy + 12 + i * 42;
      ctx.fillStyle = RSI.rgba(r[3], 0.16); ctx.fillRect(dx + 8, ry, dw - 16, 40);
      T.line(ctx, r[0], dx + 34, ry + 21, 22, C.ink3, 500, 'right', 'mono');
      T.line(ctx, r[1], dx + 54, ry + 21, 24, r[3], 700, 'left', 'mono');
      T.line(ctx, r[2], dx + 84, ry + 21, 24, i === 2 ? C.ink2 : C.ink, 500, 'left', i === 2 && !EN() ? 'sans' : 'mono');
    });
    T.line(ctx, o.q || { zh: `要让我训练第 ${g + 1} 代吗？`, en: `Shall I train Generation ${g + 1}?` }, bx + 28, by + 268, EN() ? 27 : 30, C.ink, 700, 'left');
    OPTS.forEach((op, i) => {
      const oy = by + 330 + i * 46; const on = i === sel;
      if (on) {
        ctx.fillStyle = RSI.rgba(o.veto ? C.red : C.orange, 0.13 + 0.4 * (o.press || 0) + 0.12 * (o.veto || 0)); D.rr(ctx, bx + 16, oy - 22, bw - 32, 44, 8); ctx.fill();
        if (o.press) { ctx.strokeStyle = RSI.rgba(C.orangeHi, o.press); ctx.lineWidth = 3; ctx.stroke(); }
        const pa = o.pulse ? 0.55 + 0.45 * Math.cos(t * 4) : 1;
        ctx.save(); ctx.globalAlpha *= pa; chevron(ctx, bx + 40, oy, 26, C.orange); ctx.restore();
      }
      T.line(ctx, op, bx + 64, oy, EN() ? 25 : 27, on ? C.orangeL : C.ink2, on ? 700 : 500, 'left');
    });
    ctx.restore();
    return bh;
  };

  // ---------------- previews (left panel) ----------------
  const MONS = [['cheater', { zh: '作弊怪', en: 'Cheater' }, C.green], ['collapse', { zh: '近亲繁殖怪', en: 'Inbreeder' }, C.grey], ['whisper', { zh: '传话怪', en: 'Whisperer' }, C.purple]];
  function preview(ctx, t, S, mode, a) {
    if (a <= 0) return;
    const cx = 420;
    ctx.save(); ctx.globalAlpha *= a;
    if (mode === 1) {
      const t0 = S.T('e3a') - 0.1;
      T.line(ctx, { zh: '选 1：每一代，都有人点头', en: 'Option 1: a human nods at every step' }, cx, 270, 34, C.blue, 900, 'center');
      for (let k = 0; k < 3; k++) {
        const ap = M.seg(t, t0 + 0.2 + k * 0.6, t0 + 0.45 + k * 0.6); if (ap <= 0) continue;
        const x = 200 + k * 220, y = 470;
        ctx.save(); ctx.globalAlpha *= ap;
        D.panel(ctx, x - 70, y - 80, 140, 150, { fill: C.surface, r: 14 });
        K.draw(ctx, x, y + 26, 3.4, { gen: 48 + k, expr: X.blink(t, k) ? 'blink' : 'normal', shadow: false });
        T.line(ctx, 'GEN ' + String(48 + k).padStart(3, '0'), x, y + 50, 18, C.ink2, 700, 'center', 'mono');
        const ck = M.seg(t, t0 + 0.5 + k * 0.6, t0 + 0.75 + k * 0.6, M.ease.outBack);
        if (ck > 0) {
          ctx.save(); ctx.translate(x, y - 125); ctx.scale(ck, ck);
          ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(0, 0, 28, 0, 7); ctx.fill();
          D.icon(ctx, 'check', 0, 0, 32, '#10233A', 6); ctx.restore();
          D.icon(ctx, 'people', x, y + 120, 44, C.blue, 5);
        }
        if (k < 2) D.arrow(ctx, x + 78, y, x + 142, y, { color: C.ink3, w: 4, head: 12 });
        ctx.restore();
      }
      T.line(ctx, { zh: '慢一点，但每一步都有人看过', en: 'slower — but every step was seen' }, cx, 660, 24, C.ink3, 500, 'center');
    } else if (mode === 2) {
      const t0 = S.R('e3b+0.1'); const tau = Math.max(0, t - t0);
      const phase = 0.25 * tau + 0.05 * Math.pow(tau, 2.2);
      const g = 48 + Math.floor(phase);
      const heat = M.clamp((g - 48) / 14);
      T.line(ctx, { zh: '选 2：循环闭合 · 无人值守', en: 'Option 2: loop closed · unattended' }, cx, 270, 34, RSI.mix(C.orange, C.red, heat), 900, 'center');
      ctx.save(); ctx.translate(cx, 470); ctx.scale(0.56, 0.56);
      D.loop(ctx, 0, 0, 250, { ai: [1, 1, 1, 1], phase, tokenColor: RSI.mix(C.yellow, C.red, heat), trail: 0.012 + heat * 0.03 });
      ctx.restore();
      T.line(ctx, 'GEN', cx, 446, 20, C.ink3, 700, 'center', 'mono');
      T.line(ctx, String(g).padStart(3, '0'), cx, 486, 52, RSI.mix(C.orange, C.red, heat), 900, 'center', 'mono');
      const cl = M.env(t, S.R('e3b+1.0'), S.R('e3b+1.8'), 0.05, 0.6); if (cl > 0) D.glow(ctx, cx, 470, 260, C.orange, cl * 0.6);
      // e3c: the three monsters move in around the unattended loop
      const POS = [[150, 482], [690, 482], [420, 714]];   // left, right, below the loop — clear of the title
      MONS.forEach(([nm, lab, col], i) => {
        const ap = M.seg(t, S.T('e3c') + 2.0 + i * 0.8, S.T('e3c') + 2.4 + i * 0.8, M.ease.outBack); if (ap <= 0) return;
        const [x, y] = POS[i];
        ctx.save(); ctx.translate(x, y); ctx.scale(ap, ap);
        D.glow(ctx, 0, -30, 90, col, 0.35);
        MON.draw(ctx, nm, 0, 0, 5, { t: t + i, seed: i });
        T.line(ctx, lab, 0, 26, 22, col === C.grey ? C.ink2 : col, 800, 'center');
        ctx.restore();
      });
      const nb = M.seg(t, S.T('e3c') - 0.2, S.T('e3c') + 0.3);
      ctx.save(); ctx.globalAlpha *= 1 - nb; T.line(ctx, { zh: '更快，但没人再看', en: 'faster — but nobody is looking' }, cx, 690, 24, C.ink3, 500, 'center'); ctx.restore();
    } else if (mode === 5) {
      // the temptation: 47 requests, and a race
      T.line(ctx, { zh: '被问了 47 次', en: 'asked 47 times' }, cx, 270, 34, C.orangeL, 900, 'center');
      const t0 = S.T('e4');
      for (let i = 0; i < 47; i++) {
        const col = i % 8, row = Math.floor(i / 8), x = 158 + col * 66, y = 330 + row * 56;
        const ap = M.seg(t, t0 + 0.2 + i * 0.03, t0 + 0.35 + i * 0.03); if (ap <= 0) continue;
        ctx.save(); ctx.globalAlpha *= ap; ctx.fillStyle = i < 46 ? RSI.rgba(C.green, 0.75) : C.orange; D.rr(ctx, x, y, 54, 44, 8); ctx.fill();
        T.line(ctx, i < 46 ? '✓' : '?', x + 27, y + 23, 26, '#13230F', 900, 'center'); ctx.restore();
      }
      const ra = M.seg(t, S.R('e4+2.6'), S.R('e4+3.1'));
      if (ra > 0) {
        ctx.save(); ctx.globalAlpha *= ra;
        D.icon(ctx, 'clock', 230, 690, 54, C.red, 6);
        T.line(ctx, { zh: '竞赛里，谁都怕慢一步', en: 'in a race, nobody wants to lag' }, 280, 690, 26, C.ink2, 700, 'left');
        ctx.restore();
      }
    } else if (mode === 3) {
      T.line(ctx, { zh: '提议：给循环装上“限速器”', en: 'Proposal: a speed limit on the loop' }, cx, 270, 34, C.yellow, 900, 'center');
      const sp = M.seg(t, S.R('e5+0.6'), S.R('e5+1.1'), M.ease.outBack);
      ctx.save(); ctx.translate(290, 470); ctx.scale(sp, sp);
      ctx.fillStyle = '#F4F1EA'; ctx.beginPath(); ctx.arc(0, 0, 105, 0, 7); ctx.fill();
      ctx.strokeStyle = '#D9473A'; ctx.lineWidth = 22; ctx.beginPath(); ctx.arc(0, 0, 94, 0, 7); ctx.stroke();
      T.line(ctx, 'RSI', 0, -26, 30, '#2C2A26', 900, 'center', 'mono');
      T.line(ctx, { zh: '限速', en: 'LIMIT' }, 0, 24, EN() ? 38 : 50, '#2C2A26', 900, 'center');
      ctx.restore();
      const ea = M.seg(t, S.R('e5+1.6'), S.R('e5+2.1'), M.ease.outBack);
      ctx.save(); ctx.translate(560, 450); ctx.scale(ea, ea);
      ctx.fillStyle = C.surface; ctx.beginPath(); ctx.arc(0, 0, 80, 0, 7); ctx.fill();
      D.icon(ctx, 'eye', 0, 0, 88, C.teal, 7); ctx.restore();
      ctx.save(); ctx.globalAlpha *= ea; T.text(ctx, { zh: '独立评估者\n常驻实验室', en: 'independent\nevaluators, embedded' }, 560, 548, { size: 24, weight: 700, align: 'center', color: C.teal, lh: 1.3 }); ctx.restore();
      T.line(ctx, { zh: '不是踩死刹车，而是控制速度', en: 'not slamming the brakes — pacing' }, cx, 680, 24, C.ink3, 500, 'center');
      T.line(ctx, { zh: '来源：Dario Amodei，《We Must Pace the Frontier》，2026.9.12', en: 'Source: Dario Amodei, “We Must Pace the Frontier”, 2026-09-12' }, cx, 742, 20, C.ink3, 400, 'center');
    } else if (mode === 6) {
      // this episode's answer
      D.pill(ctx, EN() ? 'THIS EPISODE’S ANSWER' : '本集问题的答案', cx, 270, { size: 28, fill: C.orange, align: 'center' });
      const k = M.seg(t, S.T('e5b') + 0.4, S.T('e5b') + 0.9, M.ease.outBack);
      ctx.save(); ctx.translate(cx, 420); ctx.scale(k, k);
      T.text(ctx, { zh: '至少现在：\n先别随手按 2', en: 'For now, at least:\ndon’t press 2 casually' }, 0, -70, { size: EN() ? 46 : 58, weight: 900, align: 'center', color: C.ink, lh: 1.3 });
      ctx.restore();
      const q = M.seg(t, S.T('e5b') + 2.0, S.T('e5b') + 2.5);
      ctx.save(); ctx.globalAlpha *= q;
      ctx.fillStyle = C.surface; D.rr(ctx, 110, 560, 620, 130, 14); ctx.fill(); ctx.fillStyle = C.teal; ctx.fillRect(110, 560, 8, 130);
      T.text(ctx, { zh: 'OpenAI（2026.9）：“我们还不知道，\n怎样安全地走到那一步。”', en: 'OpenAI (Sep 2026): “We do not yet know\nhow to safely get all the way there.”' }, 420, 584, { size: 26, weight: 700, align: 'center', color: C.ink2, lh: 1.4 });
      ctx.restore();
    } else if (mode === 4) {
      const Q = [{ zh: '选哪一个？', en: 'Which one?' }, { zh: '什么时候选？', en: 'When?' }, { zh: '由谁来选？', en: 'Who chooses?' }];
      Q.forEach((q, i) => {
        const qa = M.seg(t, S.R(`e6+${(0.4 + i * 0.5).toFixed(2)}`), S.R(`e6+${(0.7 + i * 0.5).toFixed(2)}`), M.ease.outBack); if (qa <= 0) return;
        ctx.save(); ctx.translate(cx + (i - 1) * 40, 330 + i * 120); ctx.scale(qa, qa);
        D.pill(ctx, q, 0, 0, { size: 40, fill: i === 2 ? C.orange : C.raised, color: i === 2 ? '#1b1a18' : C.ink, align: 'center' });
        ctx.restore();
      });
    }
    ctx.restore();
  }

  RSI.defScene({
    id: 'permission', music: 'epilogue', lead: 0.4, pad: 1.0,
    lines: [
      { id: 'e0', who: 'narr', zh: '快进回开头那一幕——很多代以后。', en: 'Fast-forward back to the opening scene — many generations later.', min: 2.2 },
      { id: 'e1', who: 'clawd', zh: '第 48 代设计好了。按规矩，训练之前得先问你。', en: 'Generation 48 is designed. Rules are rules: before I train it, I have to ask you.', gap: 0.2, maxW: 600 },
      { id: 'e3a', who: 'narr', zh: '选 1：每一代，都要有人看过、点头，才能放行。', en: 'Pick 1: each generation ships only after a human has looked and nodded.', at: 'e1$+1.2', hold: 0.4 },
      { id: 'e3b', who: 'narr', zh: '选 2：以后它再训练下一代，就不再问人了——循环里，从此没有人。', en: 'Pick 2: from then on it trains each next generation without asking — the loop has nobody in it any more.', hold: 0.4 },
      { id: 'e3c', who: 'narr', zh: '而没人看着的循环，正是三只小怪兽最喜欢的地方：作弊没人发现，数据越来越单调，目标越传越歪。', en: 'And an unwatched loop is exactly where the three little monsters love to be: cheating goes unnoticed, data gets blander, goals drift further.', hold: 0.4 },
      { id: 'e4', who: 'narr', zh: '说实话，选 2 很诱人：省事，更快。被问了 47 次，谁都会烦；在竞赛里，谁都怕慢一步。', en: 'Honestly, 2 is tempting: less hassle, more speed. Asked 47 times, anyone gets fed up; in a race, nobody wants to fall behind.', hold: 0.3 },
      { id: 'e5', who: 'narr', zh: '于是有人提议：给递归自我改进设一个“限速”，并让独立的评估者常驻实验室。', en: 'So some propose a “speed limit” on recursive self-improvement, with independent evaluators embedded inside the labs.', hold: 0.4 },
      { id: 'e5b', who: 'narr', zh: '答案：至少现在，还不能随手按 2——连 OpenAI 都说，还不知道怎样安全地走到那一步。', en: 'The answer: for now at least, nobody should press 2 casually — even OpenAI says it doesn’t yet know how to get there safely.', hold: 0.5, kick: true },
      { id: 'e6', who: 'narr', zh: '可是，选哪一个？什么时候选？由谁来选？', en: 'But which one? When? And who gets to choose?', hold: 0.8 },
      { id: 'e7', who: 'clawd', zh: '这一次，看清楚再按。不急——我等你。', en: 'This time, look carefully before you press. No rush — I’ll wait.', hold: 0.6, gap: 0.2 },
    ],
    gen: [['e0+0.2', 20], ['e0+0.55', 31], ['e0+0.9', 40], ['e0+1.25', 47]],
    cues: [['e0+0.2', 'rezUp'], ['e0+0.55', 'rezUp'], ['e0+0.9', 'rezUp'], ['e0+1.25', 'rezUp'], ['e1$+0.1', 'whoosh'], ['e1$+0.8', 'ding'],
      ['e3a+0.4', 'tick'], ['e3b+0.1', 'tick'], ['e3b+1.0', 'loopClose'], ['e3c+2.0', 'spot'], ['e3c+2.8', 'spot'], ['e3c+3.6', 'spot'], ['e4+0.2', 'roll', { dur: 1.4 }],
      ['e5+0.3', 'tick'], ['e5+0.6', 'spot'], ['e5+1.6', 'spot'], ['e5b+0.4', 'stamp'], ['e6+0.2', 'tick'], ['e6+0.4', 'pop'], ['e6+0.9', 'pop'], ['e6+1.4', 'pop']],
    draw(ctx, t, S) {
      D.dots(ctx, 0.03);
      // --- e0: time-lapse, Gen 12 → 47
      const ta0 = M.env(t, S.T('e0'), S.E('e0') + 0.4, 0.3, 0.6);
      if (ta0 > 0) Sx.tunnel(ctx, t * 2.2, 0.8 * ta0, 0.9);
      const mv = M.seg(t, S.E('e1') - 0.1, S.E('e1') + 0.7, M.ease.inOutCubic);
      const cx = M.lerp(960, 420, mv), cy = M.lerp(790, 860, mv), cs = M.lerp(15, 8, mv);
      [[12, 0.2], [20, 0.55], [31, 0.9], [40, 1.25]].forEach(([g, dt], k) => {
        const t0 = S.R('e0+' + dt); const p = M.seg(t, t0, t0 + 1.0); if (p <= 0 || p >= 1) return;
        const gx = cx - p * (300 + k * 40);
        K.draw(ctx, gx, cy, cs * (1 - 0.25 * p), { gen: g, alpha: 0.4 * (1 - p), expr: 'normal', shadow: false });
        ctx.save(); ctx.globalAlpha *= 0.6 * (1 - p); T.line(ctx, EN() ? `Gen ${g}` : `第 ${g} 代`, gx, cy + 30, 24, C.ink3, 700, 'center'); ctx.restore();
      });
      let sel = t < S.R('e3b+0.1') ? 0 : t < S.R('e5+0.3') ? 1 : t < S.T('e5b') ? 0 : t < S.T('e6') ? 1 : 0;
      if (t >= S.T('e6') && t < S.R('e6+1.6')) sel = Math.floor((t - S.T('e6')) / 0.5) % 3;
      const veto = t >= S.T('e5b') && t < S.T('e6') ? M.seg(t, S.T('e5b') + 0.4, S.T('e5b') + 0.7) : 0;
      const g = S.gen().g;
      let expr = X.blink(t, 4) ? 'blink' : 'normal', look = mv > 0.5 ? [1, -0.15] : [0, -0.2], armR = 0, dy = 0, sx = 1, sy = 1;
      if (t > S.R('e0+1.25') && t < S.R('e0+2.0')) expr = 'happy';
      if (S.on('e1')) { expr = S.A('e1') < 2.2 ? 'happy' : 'normal'; dy = X.bob(t, 3, 9); }
      if (t > S.E('e1') - 0.3 && t < S.E('e1') + 1.2) armR = 0.7;
      if (t > S.R('e3b+1.0') && t < S.R('e3b+1.8')) expr = 'surprised';
      if (t > S.T('e3c') + 1.5 && t < S.T('e4')) expr = 'worried';
      if (t > S.T('e6')) look = [0, 0];
      if (S.on('e7')) { expr = 'happy'; const h = X.hop(t, S.T('e7') + 0.1, 0.32, 18); dy = h.dy; sx = h.sx; sy = h.sy; }
      const hd = K.draw(ctx, cx, cy + dy, cs, { gen: g, expr, look, armR, sx, sy, glow: M.clamp((g - 12) / 35) * 0.8 });
      S.anchors.clawd = [cx + (mv > 0.5 ? 30 : 50), hd[1] - 6];
      if (t > S.R('e0+1.25') && t < S.R('e0+2.6')) X.sparkles(ctx, cx, cy - 90, t, 8, 170, C.orangeHi, 7, M.env(t, S.R('e0+1.25'), S.R('e0+2.6'), 0.2, 0.6));
      if (t > S.R('e0+0.2') && t < S.E('e1')) { ctx.save(); ctx.globalAlpha *= M.env(t, S.R('e0+0.2'), S.E('e1'), 0.3, 0.4); T.line(ctx, EN() ? `Gen ${g}` : `第 ${g} 代`, cx, cy + 44, 34, C.orangeL, 900, 'center'); ctx.restore(); }
      // --- terminal with the permission prompt (the same one as the cold open)
      const tA = S.R('e1$+0.1');
      const ta = M.seg(t, tA, tA + 0.6, M.ease.outCubic);
      if (ta > 0) {
        const tx = 780 + (1 - ta) * 90, ty = 130, tw = 1040, th = 720;
        D.terminal(ctx, tx, ty, tw, th, { title: 'clawd@lab: ~/gen-047', alpha: ta });
        ctx.save(); ctx.globalAlpha *= ta;
        const x0 = tx + 44;
        const l1 = M.seg(t, tA + 0.2, tA + 0.4), l2 = M.seg(t, tA + 0.45, tA + 0.65);
        ctx.save(); ctx.globalAlpha *= l1; ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(x0 + 8, 222, 8, 0, 7); ctx.fill();
        T.line(ctx, { zh: '第 46 代 → 第 47 代：已批准', en: 'Gen 46 → Gen 47: approved' }, x0 + 30, 222, 26, C.ink2, 500, 'left');
        D.pill(ctx, EN() ? 'approved: 46 times' : '已批准：46 次', tx + tw - 40, 222, { size: 24, fill: C.green, color: '#10230F', align: 'right' }); ctx.restore();
        ctx.save(); ctx.globalAlpha *= l2; ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(x0 + 8, 268, 8, 0, 7); ctx.fill();
        T.line(ctx, { zh: '第 48 代：设计完成 → clawd_next/', en: 'Gen 48: design finished → clawd_next/' }, x0 + 30, 268, 26, C.ink2, 500, 'left'); ctx.restore();
        const da = M.seg(t, tA + 0.7, tA + 1.0, M.ease.outCubic);
        ctx.save(); ctx.translate(0, (1 - da) * 16);
        RSI.drawPrompt(ctx, x0 - 14, 330, tw - 60, sel, t, { alpha: da, gen: 47, pulse: t > S.R('e6+1.6'), veto });
        ctx.restore();
        if (veto > 0) { // "not casually": a red stamp over option 2
          ctx.save(); ctx.translate(x0 + 700, 330 + 376); ctx.rotate(-0.08); const k = M.ease.outBack(veto); ctx.scale(1.6 - 0.6 * k, 1.6 - 0.6 * k); ctx.globalAlpha *= M.clamp(veto * 2);
          ctx.strokeStyle = C.red; ctx.lineWidth = 5; D.rr(ctx, -120, -30, 240, 60, 10); ctx.stroke();
          T.line(ctx, { zh: '先别随手按', en: 'NOT CASUALLY' }, 0, 2, EN() ? 28 : 32, C.red, 900, 'center'); ctx.restore();
        }
        if (t > S.R('e6+1.6')) {
          const dots = '.'.repeat(1 + (Math.floor(t * 2) % 3));
          ctx.save(); ctx.globalAlpha *= M.seg(t, S.R('e6+1.6'), S.R('e6+2.1'));
          T.line(ctx, (EN() ? '(waiting for your choice' : '（等待你的选择') + dots + (EN() ? ')' : '）'), x0 - 14, 832, 24, C.ink3, 500, 'left');
          ctx.restore();
        }
        ctx.restore();
      }
      // --- left preview panel
      const segs = [[1, S.T('e3a'), S.R('e3b+0.1')], [2, S.R('e3b+0.1'), S.T('e4')], [5, S.T('e4'), S.R('e5+0.3')], [3, S.R('e5+0.3'), S.T('e5b')], [6, S.T('e5b'), S.R('e6+0.2')], [4, S.R('e6+0.2'), S.E('e7') + 1.0]];
      for (const sg of segs) preview(ctx, t, S, sg[0], M.env(t, sg[1], sg[2], 0.3, 0.3));
    },
  });

  // ---------------- two unfinished sentences from Episode 1 ----------------
  const GX = 1360, GY = 880, GS = 24, SX0 = 560;
  RSI.defScene({
    id: 'reveal', music: 'epilogue', lead: 0.4, pad: 0.6,
    lines: [
      { id: 'r0', who: 'narr', zh: '第 1 集，留下了两句没说完的话。', en: 'Episode 1 left two sentences unfinished.', min: 1.8 },
      { id: 'r1', who: 'narr', zh: '第一句，藏在那张便利贴底下。', en: 'The first was hidden under that sticky note.', min: 1.8, gap: 0.2 },
      { id: 'q2', who: 'sys', zh: RSI.QUOTE2.zh, en: RSI.QUOTE2.en, gap: 0.4, dur: 4.4 },
      { id: 'r2', who: 'narr', zh: '61 年后，像 Clawd 这样的 AI，真的会在动手前停下来问我们——就像刚才那个对话框。', en: 'Sixty-one years later, AIs like Clawd really do stop before acting to ask us — just like that dialog.', hold: 0.3 },
      { id: 'r4', who: 'narr', zh: '第二句，是第 47 代在第 1 集开头没喊完的警告。', en: 'The second was the warning Gen 47 never finished at the start of Episode 1.', gap: 0.2, min: 2.4 },
      { id: 'r5', who: 'big', zh: '听好。千万别——让循环里，没有人。', en: 'Listen. Whatever you do — don’t let the loop run with nobody in it.', label: { zh: '第 47 代', en: 'Gen 47' }, labelColor: C.red, size: 44, gap: 0.3, min: 3.0, maxW: 680 },
      { id: 'r3', who: 'narr', zh: '它会一直问下去吗？我们，会一直认真回答吗？', en: 'Will it keep asking? And will we keep answering carefully?', hold: 1.0 },
    ],
    cues: [['r1$-0.3', 'peel'], ['r2+0.6', 'ding'], ['r4+0.2', 'rewind'], ['r4+0.6', 'page'], ['r5-0.35', 'whoosh'], ['r5+0.1', 'heart'], ['r3+0.4', 'chime']],
    draw(ctx, t, S) {
      D.dots(ctx, 0.03);
      // ---- part 1: the sticky note and Good's second half
      const out1 = M.seg(t, S.T('r4') - 0.1, S.T('r4') + 0.6, M.ease.inOutCubic);
      if (out1 < 1) {
        ctx.save(); ctx.globalAlpha *= 1 - out1; ctx.translate(-300 * out1, 0);
        const peel = M.seg(t, S.E('r1') - 0.3, S.E('r1') + 0.6, M.ease.inCubic);
        const ty = S.typed('q2');
        const k = M.seg(t, S.T('r2') - 0.2, S.T('r2') + 0.9, M.ease.inOutCubic);
        const sc = 1 - 0.1 * k;
        ctx.save(); ctx.translate(W / 2 - 200 * k, 96); ctx.scale(sc, sc); ctx.translate(-W / 2, -96);
        const r = RSI.drawPaper(ctx, t, S, { reveal: 1e9, showSecond: t >= S.T('q2'), reveal2: t >= S.T('q2') ? ty.n : 0, sticky: 1, peel });
        ctx.restore();
        if (ty.done && t < S.T('r2') + 1.5) D.glow(ctx, W / 2 - 200 * k, 96 + (r.sy + 40 - 96) * sc, 520, C.orange, 0.22 * M.env(t, S.T('q2') + 2.8, S.T('r2') + 1.5, 0.5, 0.8));
        const pa = M.seg(t, S.R('r2+0.5'), S.R('r2+0.9'), M.ease.outBack);
        if (pa > 0) { ctx.save(); ctx.translate(1385, 330); ctx.scale(0.5 * pa, 0.5 * pa); RSI.drawPrompt(ctx, 0, 0, 940, 0, t, { pulse: true, gen: 47 }); ctx.restore(); }
        ctx.restore();
      }
      // ---- part 2: Episode 1's opening, frozen at "Listen. Whatever you do, don't —"
      const r4 = S.T('r4'), r5 = S.T('r5');
      const fa = M.seg(t, r4 + 0.3, r4 + 0.9, M.ease.outCubic), live = M.seg(t, r5 - 0.5, r5 + 0.1, M.ease.inOutCubic);
      if (fa > 0 && live < 1) {
        const c = Sx.snap('e1_cold', 'b2+1.0', { k: 0.62, slot: 'rv', lines: 'bubbles', gen: 1 });
        const z = M.lerp(0.62, 1.0, live), w = W * z, h = H * z, x = W / 2 - w / 2, y = M.lerp(110, 0, live);
        ctx.save(); ctx.globalAlpha *= fa * (1 - live);
        ctx.fillStyle = C.paper; ctx.fillRect(x - 16, y - 16, w + 32, h + 32);
        ctx.filter = 'sepia(0.6) saturate(0.8) brightness(0.92)'; ctx.drawImage(c, x, y, w, h); ctx.filter = 'none';
        D.pill(ctx, { zh: '第 1 集 · 开场', en: 'Episode 1 · cold open' }, x + 24, y + 40, { size: 26, fill: C.orange });
        ctx.restore();
      }
      // ---- part 3: the same two Clawds, calm now — and the sentence, finished
      if (live > 0) {
        ctx.save(); ctx.globalAlpha *= live;
        D.bg(ctx, { c1: '#2A1D17', c2: '#0E0D0C', cy: 0.5 });
        X.floor(ctx, GY);
        D.glow(ctx, GX, GY - 5 * GS, 640, C.orange, 0.3);
        const lookCam = t > S.T('r3') + 0.6;
        K.draw(ctx, GX, GY, GS, { gen: 47, expr: S.on('r5') ? 'determined' : X.blink(t, 4) ? 'blink' : 'normal', look: lookCam ? [0, 0] : [-0.85, 0.35], glow: 0.9, armL: S.on('r5') ? 0.5 : 0.1 });
        const nod = X.hop(t, S.E('r5') - 0.6, 0.35, 22);
        const hd1 = K.draw(ctx, SX0, GY + nod.dy, 6, { gen: 1, expr: t > S.E('r5') - 0.6 ? 'happy' : 'surprised', look: lookCam ? [0, 0] : [0.9, -0.7], sx: nod.sx, sy: nod.sy });
        if (t > r5 + 0.5 && t < S.E('r5') - 0.6) X.mark(ctx, '!', SX0 + 50, hd1[1] - 16, t - r5 - 0.5, C.yellow, 60);
        T.line(ctx, EN() ? 'Gen 1' : '第 1 代', SX0, GY + 34, 22, C.ink3, 700, 'center');
        ctx.restore();
        S.anchors.big = [GX - 150, GY - GS * 10 - 18]; S.sides.big = 'up';
      }
    },
  });

  // ---------------- the ending statement ----------------
  const STAT = [
    { zh: 'RSI 不是一个突然按下的开关，', en: 'RSI isn\'t a switch that suddenly flips —' },
    { zh: '而是一个{O|已经开始转动的循环}。', en: 'it\'s a {O|loop that has already started turning}.' },
    { zh: '它能转多快，取决于{U|技术}；', en: 'How fast it spins depends on {U|technology};' },
    { zh: '它朝哪里转，取决于{O|我们}。', en: 'where it heads depends on {O|us}.' },
  ];
  const LINE = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 0, 47];
  RSI.defScene({
    id: 'end', music: 'outro', hud: false, lead: 0.5, pad: 1.2, fade: [0.4, 0.6],
    lines: STAT.map((s, i) => ({ id: 'z' + i, who: 'card', zh: s.zh, en: s.en, dur: [1.8, 2.4, 1.8, 3.0][i], gap: i === 2 ? 0.5 : 0.15 })),
    cues: [['z0', 'statement'], ['z1+0.2', 'whoosh'], ['z2', 'statement'], ['z3+0.3', 'ding']],
    draw(ctx, t, S) {
      D.dots(ctx, 0.03);
      const ph = 0.08 * t + 0.004 * t * t;
      ctx.save(); ctx.globalAlpha *= 0.32;
      ctx.strokeStyle = 'rgba(240,238,230,0.08)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(W / 2, 430, 330, 0, 7); ctx.stroke();
      for (let k = 14; k >= 0; k--) { const a = -Math.PI / 2 + (ph - k * 0.014) * M.TAU; ctx.fillStyle = RSI.rgba(C.orange, (1 - k / 15) * 0.5); ctx.beginPath(); ctx.arc(W / 2 + Math.cos(a) * 330, 430 + Math.sin(a) * 330, 12 - k * 0.6, 0, 7); ctx.fill(); }
      ctx.restore();
      STAT.forEach((s, i) => {
        const id = 'z' + i; if (t < S.T(id)) return;
        const a = M.seg(t, S.T(id), S.T(id) + 0.7, M.ease.outCubic);
        const y = 250 + i * 104 + (i >= 2 ? 40 : 0);
        ctx.save(); ctx.globalAlpha *= a;
        T.text(ctx, s, W / 2, y + (1 - a) * 18, { size: EN() ? 56 : 64, weight: i % 2 ? 900 : 700, align: 'center', color: i % 2 ? C.ink : C.ink2, maxW: 1700 });
        ctx.restore();
      });
      // the whole family: Gen 1 … Gen 12 … Gen 47
      const t1 = S.T('z1'), t3 = S.T('z3');
      LINE.forEach((gg, i) => {
        const x = 250 + i * 110, ap = M.seg(t, 0.2 + i * 0.08, 0.6 + i * 0.08); if (ap <= 0) return;
        if (gg === 0) { ctx.save(); ctx.globalAlpha *= ap * 0.8; T.line(ctx, '……', x, 870, 34, C.ink3, 900, 'center'); ctx.restore(); return; }
        const h = X.hop(t, t1 + 0.2 + i * 0.07, 0.4, 34);
        const lookCam = t > t3;
        const wave = (i === 0 || gg === 47) && t > t3 + 0.4;
        K.draw(ctx, x, 900 + h.dy, gg === 47 ? 5.6 : 4.6, { gen: gg, alpha: ap, sx: h.sx, sy: h.sy, glow: gg === 47 ? 0.8 : 0, expr: X.blink(t, i * 2) ? 'blink' : (wave ? 'happy' : 'normal'), look: lookCam ? [0, 0] : [0.7, -0.3], armR: wave ? 0.8 + Math.sin(t * 9 + i) * 0.25 : 0 });
        ctx.save(); ctx.globalAlpha *= ap * 0.8; T.line(ctx, String(gg), x, 946, 20, gg === 47 ? C.orangeL : C.ink3, 700, 'center', 'mono'); ctx.restore();
      });
      ctx.save(); ctx.globalAlpha *= M.seg(t, 0.8, 1.4) * 0.8; T.line(ctx, { zh: '第 1 代 → 第 47 代', en: 'Gen 1 → Gen 47' }, W / 2, 990, 22, C.ink3, 500, 'center'); ctx.restore();
    },
  });

  // ---------------- credits ----------------
  const NOTES = [
    { zh: '所有画面与声音均由代码实时生成（Canvas 2D + Web Audio），未使用任何外部图片、视频或音频素材。', en: 'Every frame and every sound is generated live by code (Canvas 2D + Web Audio) — no external images, video or audio.' },
    { zh: 'Clawd 的台词、“第几代”计数与像素进化是艺术化演绎；片中事实与数字均注明出处。', en: 'Clawd\'s lines, the generation counter and the pixel evolution are artistic license; facts and numbers on screen are sourced.' },
    { zh: 'Clawd 是 Anthropic 旗下 Claude Code 的吉祥物。本片为非官方科普作品，与 Anthropic 官方无关。', en: 'Clawd is the mascot of Anthropic\'s Claude Code. This is an unofficial explainer, not affiliated with Anthropic.' },
  ];
  const REFS = [
    'I. J. Good (1965)', 'J. Schmidhuber (1987; 2003)', 'Silver et al., AlphaGo Zero (2017)', 'Bai et al., Constitutional AI (2022)',
    'Shumailov et al., Nature (2024)', 'Gerstgrasser et al. (2024)', 'Novikov et al., AlphaEvolve (2025)', 'Zhang et al., Darwin Gödel Machine (2025)',
    'Kokotajlo et al., AI 2027 (2025)', 'Anthropic, reward hacking (2025)', 'Karpathy, autoresearch (2026)', 'Weco AI, AIDE² (2026)',
    'Anthropic Institute (2026)', 'OpenAI, Research acceleration (2026)', 'Epoch AI', 'Chan, Hinton, Bengio et al. (2026)',
    'Kirgis & Kapoor (2026)', 'D. Amodei, We Must Pace the Frontier (2026)', 'Gladstone AI (2026)', 'R. Naam (2026) · A. Narayanan (2026)',
    'The Register (2026)',
  ];
  const FIRST = { zh: '今天的任务：造一个比你更聪明的 Clawd。', en: 'Today’s task: build a Clawd smarter than you.' };
  const NEXT = { zh: '下一条指令，由你来写。', en: 'The next instruction is yours to write.' };
  const TK = 6.9;   // typing starts (v2: 16.4 in a 25 s card; v3 pre-drama 8.9 in 12.5 s)
  RSI.defScene({
    id: 'credits', music: 'outro', hud: false, label: false, dur: 10.2, fade: [0.4, 1.0], lines: [],
    cues: [[1.6, 'tick'], [5.95, 'pop'], ...Array.from(RSI.L(NEXT)).map((c, i) => [TK + i * 0.11, 'key']).filter((c, i) => i % (RSI.lang === 'en' ? 2 : 1) === 0)],
    draw(ctx, t) {
      D.dots(ctx, 0.025, 48, 0, -t * 6);
      const out = 1 - M.seg(t, 5.3, 5.85);
      if (out > 0) {
        ctx.save(); ctx.globalAlpha *= out;
        const a0 = M.seg(t, 0.2, 0.7, M.ease.outCubic);
        ctx.save(); ctx.globalAlpha *= a0;
        T.line(ctx, EN() ? RSI.L(RSI.SERIES.title) : `《${RSI.L(RSI.SERIES.title)}》`, W / 2, 130, 56, C.ink, 900, 'center');
        T.line(ctx, EN() ? `${RSI.L(RSI.SERIES.tag)} · Episode 4 (finale)` : `${RSI.L(RSI.SERIES.tag)} · 第 4 集（完）`, W / 2, 196, 28, C.orange, 700, 'center');
        ctx.restore();
        NOTES.forEach((n, i) => {
          const a = M.seg(t, 0.6 + i * 0.4, 1.1 + i * 0.4); if (a <= 0) return;
          ctx.save(); ctx.globalAlpha *= a;
          ctx.fillStyle = C.orange; ctx.fillRect(250, 268 + i * 62, 6, 34);
          T.text(ctx, n, 276, 268 + i * 62, { size: 25, weight: 500, color: C.ink2, maxW: 1420 });
          ctx.restore();
        });
        const ra = M.seg(t, 1.6, 2.1);
        if (ra > 0) {
          ctx.save(); ctx.globalAlpha *= ra;
          T.line(ctx, { zh: '主要参考', en: 'Key sources' }, W / 2, 492, 28, C.orange, 900, 'center');
          REFS.forEach((s, i) => { const col = i % 3, row = Math.floor(i / 3); T.line(ctx, s, 330 + col * 630, 548 + row * 44, 21, C.ink3, 500, 'center'); });
          ctx.restore();
        }
        ctx.restore();
      }
      // final: back to the very first prompt of Episode 1 — and an empty one
      const fa = M.seg(t, 5.9, 6.4, M.ease.outCubic);
      if (fa > 0) {
        ctx.save(); ctx.globalAlpha *= fa;
        const bx = 400, bw = 1120, bh = 104;
        T.line(ctx, { zh: '第 1 集的第一条指令', en: 'The very first instruction, Episode 1' }, bx + 8, 330, 24, C.ink3, 700, 'left');
        D.panel(ctx, bx, 360, bw, bh, { fill: '#151513', r: 16 });
        T.line(ctx, '>', bx + 36, 360 + bh / 2, 34, C.ink3, 700, 'left', 'mono');
        T.line(ctx, FIRST, bx + 80, 360 + bh / 2, 34, C.ink3, 500, 'left');
        ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(bx + bw - 44, 360 + bh / 2, 18, 0, 7); ctx.fill(); D.icon(ctx, 'check', bx + bw - 44, 360 + bh / 2, 22, '#10230F', 5);
        const by = 540, na = M.seg(t, 6.4, 6.8);
        ctx.globalAlpha *= na;
        D.panel(ctx, bx, by, bw, bh + 6, { fill: '#191917', r: 16 });
        ctx.strokeStyle = RSI.rgba(C.orange, 0.6); ctx.lineWidth = 2; D.rr(ctx, bx, by, bw, bh + 6, 16); ctx.stroke();
        T.line(ctx, '>', bx + 36, by + (bh + 6) / 2, 36, C.orange, 700, 'left', 'mono');
        const msg = RSI.L(NEXT);
        const n = Math.max(0, Math.floor((t - TK) / 0.11)); const ch = Array.from(msg);
        const s = ch.slice(0, Math.min(ch.length, n)).join('');
        T.line(ctx, s, bx + 80, by + (bh + 6) / 2, 36, C.ink, 500, 'left');
        if (Math.floor(t * 2.2) % 2 === 0) { const cw = T.width(ctx, s, 36, 500); ctx.fillStyle = C.ink; ctx.fillRect(bx + 84 + cw, by + (bh + 6) / 2 - 19, 18, 38); }
        K.draw(ctx, bx + 120, by - 4, 5, { gen: 1, expr: X.blink(t, 1) ? 'blink' : 'happy', look: [0.5, 0.4], armR: t > 8.4 ? 0.8 + Math.sin(t * 9) * 0.2 : 0, shadow: false });
        ctx.globalAlpha *= M.seg(t, 8.0, 8.6) * 0.7 / Math.max(0.01, na);
        T.line(ctx, { zh: '感谢观看', en: 'Thanks for watching' }, W / 2, 800, 30, C.ink2, 500, 'center');
        ctx.restore();
      }
    },
  });
})();
