/* 尾声 The last option: the permission prompt, the second half of Good's sentence, the ending, credits. */
(function () {
  'use strict';
  const RSI = window.RSI, C = RSI.C, M = RSI.M, D = RSI.D, T = RSI.T, K = RSI.Clawd, X = RSI.X;
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
    const rows = [['7', '-', 'GEN = 12', C.red], ['7', '+', 'GEN = 13', C.green], ['8', '+', { zh: '# 更快、更强，也更会改进自己', en: '# faster, stronger, and better at improving itself' }, C.green]];
    rows.forEach((r, i) => {
      const ry = dy + 12 + i * 42;
      ctx.fillStyle = RSI.rgba(r[3], 0.16); ctx.fillRect(dx + 8, ry, dw - 16, 40);
      T.line(ctx, r[0], dx + 34, ry + 21, 22, C.ink3, 500, 'right', 'mono');
      T.line(ctx, r[1], dx + 54, ry + 21, 24, r[3], 700, 'left', 'mono');
      T.line(ctx, r[2], dx + 84, ry + 21, 24, i === 2 ? C.ink2 : C.ink, 500, 'left', i === 2 && !EN() ? 'sans' : 'mono');
    });
    T.line(ctx, { zh: 'Clawd 想要修改下一代的自己。是否继续？', en: 'Clawd wants to modify the next generation of itself. Proceed?' }, bx + 28, by + 268, EN() ? 25 : 28, C.ink, 700, 'left');
    OPTS.forEach((op, i) => {
      const oy = by + 330 + i * 46; const on = i === sel;
      if (on) {
        ctx.fillStyle = RSI.rgba(C.orange, 0.13); D.rr(ctx, bx + 16, oy - 22, bw - 32, 44, 8); ctx.fill();
        const pa = o.pulse ? 0.55 + 0.45 * Math.cos(t * 4) : 1;
        ctx.save(); ctx.globalAlpha *= pa; chevron(ctx, bx + 40, oy, 26, C.orange); ctx.restore();
      }
      T.line(ctx, op, bx + 64, oy, EN() ? 25 : 27, on ? C.orangeL : C.ink2, on ? 700 : 500, 'left');
    });
    ctx.restore();
    return bh;
  };

  // ---------------- previews (left panel) ----------------
  function preview(ctx, t, S, mode, a) {
    if (a <= 0) return;
    const cx = 420, cy = 450;
    ctx.save(); ctx.globalAlpha *= a;
    if (mode === 1) {
      const t0 = S.T('e3a');
      T.line(ctx, { zh: '选 1：每一代，都有人点头', en: 'Option 1: a human nods at every step' }, cx, 270, 34, C.blue, 900, 'center');
      for (let k = 0; k < 3; k++) {
        const ap = M.seg(t, t0 + 0.3 + k * 0.9, t0 + 0.6 + k * 0.9); if (ap <= 0) continue;
        const x = 200 + k * 220, y = 470;
        ctx.save(); ctx.globalAlpha *= ap;
        D.panel(ctx, x - 70, y - 80, 140, 150, { fill: C.surface, r: 14 });
        K.draw(ctx, x, y + 26, 3.4, { gen: 13 + k, expr: X.blink(t, k) ? 'blink' : 'normal', shadow: false });
        T.line(ctx, 'GEN ' + String(13 + k).padStart(3, '0'), x, y + 50, 18, C.ink2, 700, 'center', 'mono');
        const ck = M.seg(t, t0 + 0.7 + k * 0.9, t0 + 0.95 + k * 0.9, M.ease.outBack);
        if (ck > 0) {
          ctx.save(); ctx.translate(x, y - 125); ctx.scale(ck, ck);
          ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(0, 0, 28, 0, 7); ctx.fill();
          D.icon(ctx, 'check', 0, 0, 32, '#10233A', 6); ctx.restore();
          D.icon(ctx, 'people', x, y + 120, 44, C.blue, 5);
        }
        if (k < 2) D.arrow(ctx, x + 78, y, x + 142, y, { color: C.ink3, w: 4, head: 12 });
        ctx.restore();
      }
      T.line(ctx, { zh: '慢一点，但每一步都有人看过', en: 'slower — but every step was seen' }, cx, 640, 24, C.ink3, 500, 'center');
    } else if (mode === 2) {
      const t0 = S.R('e3b+0.1'); const tau = Math.max(0, t - t0);
      const phase = 0.25 * tau + 0.05 * Math.pow(tau, 2.2);
      const g = 13 + Math.floor(phase);
      const heat = M.clamp((g - 13) / 14);
      T.line(ctx, { zh: '选 2：循环闭合 · 无人值守', en: 'Option 2: loop closed · unattended' }, cx, 270, 34, RSI.mix(C.orange, C.red, heat), 900, 'center');
      ctx.save(); ctx.translate(cx, 470); ctx.scale(0.56, 0.56);
      D.loop(ctx, 0, 0, 250, { ai: [1, 1, 1, 1], phase, tokenColor: RSI.mix(C.yellow, C.red, heat), trail: 0.012 + heat * 0.03 });
      ctx.restore();
      T.line(ctx, 'GEN', cx, 446, 20, C.ink3, 700, 'center', 'mono');
      T.line(ctx, String(g).padStart(3, '0'), cx, 486, 52, RSI.mix(C.orange, C.red, heat), 900, 'center', 'mono');
      // "closing" flash on the ring
      const cl = M.env(t, S.R('e3b+1.0'), S.R('e3b+1.8'), 0.05, 0.6); if (cl > 0) D.glow(ctx, cx, 470, 260, C.orange, cl * 0.6);
      T.line(ctx, { zh: '更快，但没人再看', en: 'faster — but nobody is looking' }, cx, 690, 24, C.ink3, 500, 'center');
    } else if (mode === 3) {
      T.line(ctx, { zh: '提议：给循环装上“限速器”', en: 'Proposal: a speed limit on the loop' }, cx, 270, 34, C.yellow, 900, 'center');
      const sp = M.seg(t, S.R('e5+0.8'), S.R('e5+1.3'), M.ease.outBack);
      ctx.save(); ctx.translate(290, 470); ctx.scale(sp, sp);
      ctx.fillStyle = '#F4F1EA'; ctx.beginPath(); ctx.arc(0, 0, 105, 0, 7); ctx.fill();
      ctx.strokeStyle = '#D9473A'; ctx.lineWidth = 22; ctx.beginPath(); ctx.arc(0, 0, 94, 0, 7); ctx.stroke();
      T.line(ctx, 'RSI', 0, -26, 30, '#2C2A26', 900, 'center', 'mono');
      T.line(ctx, { zh: '限速', en: 'LIMIT' }, 0, 24, EN() ? 38 : 50, '#2C2A26', 900, 'center');
      ctx.restore();
      const ea = M.seg(t, S.R('e5+2.0'), S.R('e5+2.5'), M.ease.outBack);
      ctx.save(); ctx.translate(560, 450); ctx.scale(ea, ea);
      ctx.fillStyle = C.surface; ctx.beginPath(); ctx.arc(0, 0, 80, 0, 7); ctx.fill();
      D.icon(ctx, 'eye', 0, 0, 88, C.teal, 7); ctx.restore();
      ctx.save(); ctx.globalAlpha *= ea; T.text(ctx, { zh: '独立评估者\n常驻实验室', en: 'independent\nevaluators, embedded' }, 560, 548, { size: 24, weight: 700, align: 'center', color: C.teal, lh: 1.3 }); ctx.restore();
      T.line(ctx, { zh: '不是踩死刹车，而是控制速度', en: 'not slamming the brakes — pacing' }, cx, 690, 24, C.ink3, 500, 'center');
    } else if (mode === 4) {
      const Q = [{ zh: '选哪一个？', en: 'Which one?' }, { zh: '什么时候选？', en: 'When?' }, { zh: '由谁来选？', en: 'Who chooses?' }];
      Q.forEach((q, i) => {
        const qa = M.seg(t, S.R(`e6+${0.8 + i * 0.7}`), S.R(`e6+${1.1 + i * 0.7}`), M.ease.outBack); if (qa <= 0) return;
        ctx.save(); ctx.translate(cx + (i - 1) * 40, 330 + i * 120); ctx.scale(qa, qa);
        D.pill(ctx, q, 0, 0, { size: 40, fill: i === 2 ? C.orange : C.raised, color: i === 2 ? '#1b1a18' : C.ink, align: 'center' });
        ctx.restore();
      });
    }
    ctx.restore();
  }

  RSI.defScene({
    id: 'permission', music: 'epilogue', lead: 0.6, pad: 2.6,
    lines: [
      { id: 'e0', who: 'narr', zh: '几代之后。', en: 'A few generations later.', min: 2.8 },
      { id: 'e1', who: 'clawd', zh: '下一代已经准备好了。不过按规矩，我得先问你。', en: 'The next generation is ready. But rules are rules — I have to ask you first.', gap: 0.4 },
      { id: 'e2', who: 'narr', zh: 'RSI 最关键的问题，也许就藏在这个小小的选项里。', en: 'Maybe the crux of RSI hides in this tiny prompt.', gap: 1.5, hold: 0.4 },
      { id: 'e3a', who: 'narr', zh: '选 1：每一代都要有人看过、点头，才能放行。', en: 'Pick 1: each generation ships only after a human has looked and nodded.', hold: 1.0 },
      { id: 'e3b', who: 'narr', zh: '选 2：循环就闭上了——从此，它自己改进自己。', en: 'Pick 2: the loop closes — from then on, it improves itself.', hold: 1.0 },
      { id: 'e4', who: 'narr', zh: '说实话，选 2 很诱人：省事，而且更快。在竞赛里，谁都怕慢一步。', en: 'Honestly, 2 is tempting: less hassle, more speed. In a race, nobody wants to fall behind.', hold: 0.8 },
      { id: 'e5', who: 'narr', zh: '所以有人提议：给递归自我改进设一个“限速”，并让独立的评估者常驻实验室。', en: 'So some propose a “speed limit” on recursive self-improvement, with independent evaluators embedded inside the labs.', hold: 1.4 },
      { id: 'e6', who: 'narr', zh: '选哪一个？什么时候选？由谁来选？', en: 'Which one? When? And who gets to choose?', hold: 2.0 },
      { id: 'e7', who: 'clawd', zh: '不急。我等你。', en: 'No rush. I\'ll wait.', hold: 1.2, gap: 0.5 },
    ],
    gen: [['e0+0.3', 9], ['e0+0.8', 10], ['e0+1.3', 11], ['e0+1.8', 12]],
    cues: [['e0+0.3', 'rezUp'], ['e0+0.8', 'rezUp'], ['e0+1.3', 'rezUp'], ['e0+1.8', 'rezUp'], ['e1$+0.1', 'whoosh'], ['e1$+0.8', 'ding'],
      ['e3a+0.4', 'tick'], ['e3b+0.1', 'tick'], ['e3b+1.0', 'loopClose'], ['e5+0.3', 'tick'], ['e5+0.9', 'spot'], ['e5+2.1', 'spot'], ['e6+0.2', 'tick'], ['e6+0.8', 'pop'], ['e6+1.5', 'pop'], ['e6+2.2', 'pop']],
    draw(ctx, t, S) {
      D.dots(ctx, 0.03);
      // --- Clawd: evolves (gen 8 → 12), then steps aside
      const g10 = S.R('e0+0.8');
      const mv = M.seg(t, S.E('e1') - 0.1, S.E('e1') + 0.7, M.ease.inOutCubic);
      const cx = M.lerp(960, 420, mv), cy = M.lerp(790, 860, mv), cs = M.lerp(15, 8, mv);
      // ghosts of previous generations sliding away
      [8, 9, 10, 11].forEach((g, k) => {
        const t0 = S.R(`e0+${(0.3 + k * 0.5).toFixed(1)}`); const p = M.seg(t, t0, t0 + 1.4); if (p <= 0 || p >= 1) return;
        K.draw(ctx, cx - p * (260 + k * 30), cy, cs, { gen: g, alpha: 0.35 * (1 - p), expr: 'normal', shadow: false });
      });
      const sel = t < S.R('e3b+0.1') ? 0 : t < S.R('e5+0.3') ? 1 : t < S.R('e6+0.2') ? 2 : 0;
      let expr = X.blink(t, 4) ? 'blink' : 'normal', look = mv > 0.5 ? [1, -0.15] : [0, -0.2], armR = 0, dy = 0, sx = 1, sy = 1;
      if (t > S.R('e0+1.8') && t < S.R('e0+2.6')) expr = 'happy';
      if (S.on('e1')) { expr = S.A('e1') < 2.2 ? 'happy' : 'normal'; dy = X.bob(t, 3, 9); }
      if (t > S.E('e1') - 0.3 && t < S.R('e2+1.5')) armR = 0.7;
      if (t > S.R('e3b+1.0') && t < S.R('e3b+1.8')) expr = 'surprised';
      if (t > S.T('e6')) look = [0, 0];
      if (S.on('e7')) { expr = 'happy'; const h = X.hop(t, S.T('e7') + 0.1, 0.32, 18); dy = h.dy; sx = h.sx; sy = h.sy; }
      let res = undefined, res2, mix;
      if (t >= g10 - 0.01 && t < g10 + 0.6) { res = 0.125; res2 = 'v'; mix = M.seg(t, g10, g10 + 0.6); }
      const hd = K.draw(ctx, cx, cy + dy, cs, { gen: S.gen().g, res, res2, mix, expr, look, armR, sx, sy });
      S.anchors.clawd = [cx + (mv > 0.5 ? 30 : 50), hd[1] - 6];
      if (t > S.R('e0+1.8') && t < S.R('e0+3.4')) X.sparkles(ctx, cx, cy - 90, t, 8, 170, C.orangeHi, 7, M.env(t, S.R('e0+1.8'), S.R('e0+3.4'), 0.2, 0.6));
      // --- terminal with the permission prompt
      const tA = S.R('e1$+0.1');
      const ta = M.seg(t, tA, tA + 0.6, M.ease.outCubic);
      if (ta > 0) {
        const tx = 780 + (1 - ta) * 90, ty = 130, tw = 1040, th = 720;
        D.terminal(ctx, tx, ty, tw, th, { title: 'clawd@lab: ~/gen-012', alpha: ta });
        ctx.save(); ctx.globalAlpha *= ta;
        const x0 = tx + 44;
        const l1 = M.seg(t, tA + 0.2, tA + 0.4), l2 = M.seg(t, tA + 0.45, tA + 0.65);
        ctx.save(); ctx.globalAlpha *= l1; ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(x0 + 8, 222, 8, 0, 7); ctx.fill();
        T.line(ctx, { zh: '第 12 代：训练完成 · 评测全部通过', en: 'Gen 12: training done · all evals passed' }, x0 + 30, 222, 26, C.ink2, 500, 'left'); ctx.restore();
        ctx.save(); ctx.globalAlpha *= l2; ctx.fillStyle = C.orange; ctx.beginPath(); ctx.arc(x0 + 8, 268, 8, 0, 7); ctx.fill();
        T.line(ctx, { zh: '已生成下一代 → clawd_next/', en: 'Next generation built → clawd_next/' }, x0 + 30, 268, 26, C.ink2, 500, 'left'); ctx.restore();
        const da = M.seg(t, tA + 0.7, tA + 1.0, M.ease.outCubic);
        ctx.save(); ctx.translate(0, (1 - da) * 16);
        RSI.drawPrompt(ctx, x0 - 14, 330, tw - 60, sel, t, { alpha: da, pulse: t > S.T('e6') });
        ctx.restore();
        if (t > S.T('e6') + 1.0) {
          const dots = '.'.repeat(1 + (Math.floor(t * 2) % 3));
          ctx.save(); ctx.globalAlpha *= M.seg(t, S.T('e6') + 1.0, S.T('e6') + 1.6);
          T.line(ctx, (EN() ? '(waiting for your choice' : '（等待你的选择') + dots + (EN() ? ')' : '）'), x0 - 14, 832, 24, C.ink3, 500, 'left');
          ctx.restore();
        }
        ctx.restore();
      }
      // --- left preview panel
      const segs = [[1, S.T('e3a'), S.R('e3b+0.1')], [2, S.R('e3b+0.1'), S.R('e5+0.3')], [3, S.R('e5+0.3'), S.R('e6+0.2')], [4, S.R('e6+0.2'), S.E('e7') + 1.6]];
      for (const sg of segs) preview(ctx, t, S, sg[0], M.env(t, sg[1], sg[2], 0.3, 0.3));
      const sa = M.env(t, S.T('e5') + 0.5, S.R('e6+0.2'), 0.3, 0.3);
      if (sa > 0) { ctx.save(); ctx.globalAlpha *= sa; T.line(ctx, { zh: '来源：Dario Amodei，《We Must Pace the Frontier》，2026.9.12', en: 'Source: Dario Amodei, “We Must Pace the Frontier”, 2026-09-12' }, 420, 742, 20, C.ink3, 400, 'center'); ctx.restore(); }
    },
  });

  // ---------------- the second half of the sentence ----------------
  RSI.defScene({
    id: 'reveal', music: 'epilogue', lead: 0.6, pad: 1.4,
    lines: [
      { id: 'r1', who: 'narr', zh: '还记得开头那张便利贴吗？', en: 'Remember the sticky note from the beginning?', min: 2.6 },
      { id: 'q2', who: 'sys', zh: RSI.QUOTE2.zh, en: RSI.QUOTE2.en, gap: 0.9, dur: 5.6 },
      { id: 'r2', who: 'narr', zh: '六十一年后，机器真的学会了停下来，问我们。', en: 'Sixty-one years later, machines really have learned to stop and ask us.', hold: 0.8 },
      { id: 'r3', who: 'narr', zh: '接下来的问题是：它会一直问下去吗？我们，又会一直认真回答吗？', en: 'The next questions: will they keep asking? And will we keep answering carefully?', hold: 2.4 },
    ],
    cues: [['r1$-0.3', 'peel'], ['r2+0.6', 'ding']],
    draw(ctx, t, S) {
      D.dots(ctx, 0.03);
      const peel = M.seg(t, S.E('r1') - 0.3, S.E('r1') + 0.6, M.ease.inCubic);
      const ty = S.typed('q2');
      const k = M.seg(t, S.T('r2') - 0.2, S.T('r2') + 0.9, M.ease.inOutCubic);
      const sc = 1 - 0.1 * k;
      ctx.save(); ctx.translate(W / 2 - 200 * k, 96); ctx.scale(sc, sc); ctx.translate(-W / 2, -96);
      const r = RSI.drawPaper(ctx, t, S, { reveal: 1e9, showSecond: t >= S.T('q2'), reveal2: t >= S.T('q2') ? ty.n : 0, sticky: 1, peel });
      ctx.restore();
      if (ty.done && t < S.T('r2') + 1.5) D.glow(ctx, W / 2 - 200 * k, 96 + (r.sy + 40 - 96) * sc, 520, C.orange, 0.22 * M.env(t, S.T('q2') + 3.6, S.T('r2') + 1.5, 0.6, 0.8));
      // the prompt pops up like a notification: the machine is asking
      const pa = M.seg(t, S.R('r2+0.5'), S.R('r2+0.9'), M.ease.outBack);
      if (pa > 0) {
        ctx.save(); ctx.translate(1385, 330); ctx.scale(0.5 * pa, 0.5 * pa);
        RSI.drawPrompt(ctx, 0, 0, 940, 0, t, { pulse: true });
        ctx.restore();
      }
      const ca = M.seg(t, S.T('r3') - 0.2, S.T('r3') + 0.6, M.ease.outCubic);
      if (ca > 0) K.draw(ctx, 1712, M.lerp(1150, 960, ca), 7, { gen: 12, expr: X.blink(t, 3) ? 'blink' : 'normal', look: [0, 0], shadow: false });
    },
  });

  // ---------------- the ending statement ----------------
  const STAT = [
    { zh: 'RSI 不是一个突然按下的开关，', en: 'RSI isn\'t a switch that suddenly flips —' },
    { zh: '而是一个{O|越转越快的循环}。', en: 'it\'s a {O|loop that keeps spinning faster}.' },
    { zh: '它能转多快，取决于{U|技术}；', en: 'How fast it spins depends on {U|technology};' },
    { zh: '它朝哪里转，取决于{O|我们}。', en: 'where it heads depends on {O|us}.' },
  ];
  RSI.defScene({
    id: 'end', music: 'outro', hud: false, lead: 0.8, pad: 2.4, fade: [0.5, 0.8],
    lines: STAT.map((s, i) => ({ id: 'z' + i, who: 'card', zh: s.zh, en: s.en, dur: [2.6, 3.4, 2.6, 4.6][i], gap: i === 2 ? 1.1 : 0.2 })),
    cues: [['z0', 'statement'], ['z1+0.2', 'whoosh'], ['z2', 'statement'], ['z3+0.3', 'ding']],
    draw(ctx, t, S) {
      D.dots(ctx, 0.03);
      // a faint loop that slowly speeds up
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
      // twelve generations, from pixels to vector
      const t1 = S.T('z1'), t3 = S.T('z3');
      for (let i = 0; i < 12; i++) {
        const x = 300 + i * 120, ap = M.seg(t, 0.2 + i * 0.08, 0.6 + i * 0.08); if (ap <= 0) continue;
        const h = X.hop(t, t1 + 0.2 + i * 0.07, 0.4, 34);
        const lookCam = t > t3;
        const wave = (i === 0 || i === 11) && t > t3 + 0.4;
        K.draw(ctx, x, 900 + h.dy, 4.6, { gen: i + 1, alpha: ap, sx: h.sx, sy: h.sy, expr: X.blink(t, i * 2) ? 'blink' : (wave ? 'happy' : 'normal'), look: lookCam ? [0, 0] : [0.7, -0.3], armR: wave ? 0.8 + Math.sin(t * 9 + i) * 0.25 : 0 });
        ctx.save(); ctx.globalAlpha *= ap * 0.8; T.line(ctx, String(i + 1), x, 946, 20, C.ink3, 700, 'center', 'mono'); ctx.restore();
      }
      ctx.save(); ctx.globalAlpha *= M.seg(t, 1.2, 2.0) * 0.8; T.line(ctx, { zh: '第 1 代 → 第 12 代', en: 'Gen 1 → Gen 12' }, W / 2, 990, 22, C.ink3, 500, 'center'); ctx.restore();
    },
  });

  // ---------------- credits ----------------
  const NOTES = [
    { zh: '所有画面与声音均由代码实时生成（Canvas 2D + Web Audio），未使用任何外部图片、视频或音频素材。', en: 'Every frame and every sound is generated live by code (Canvas 2D + Web Audio) — no external images, video or audio.' },
    { zh: 'Clawd 的台词、“第几代”计数与像素进化是艺术化演绎；事实、数字与出处见仓库 docs/ 目录。', en: 'Clawd\'s lines, the generation counter and the pixel evolution are artistic license; facts, numbers and sources are in the repo\'s docs/.' },
    { zh: 'Clawd 是 Anthropic 旗下 Claude Code 的吉祥物。本片为非官方科普作品，与 Anthropic 官方无关。', en: 'Clawd is the mascot of Anthropic\'s Claude Code. This is an unofficial explainer, not affiliated with Anthropic.' },
  ];
  const REFS = [
    'I. J. Good (1965)', 'J. Schmidhuber (1987; 2003)', 'Silver et al., AlphaGo Zero (2017)', 'Bai et al., Constitutional AI (2022)',
    'Shumailov et al., Nature (2024)', 'Gerstgrasser et al. (2024)', 'Novikov et al., AlphaEvolve (2025)', 'Zhang et al., Darwin Gödel Machine (2025)',
    'Kokotajlo et al., AI 2027 (2025)', 'Karpathy, autoresearch (2026)', 'Weco AI, AIDE² (2026)', 'Anthropic Institute (2026)',
    'OpenAI, Research acceleration (2026)', 'Epoch AI', 'Chan, Hinton, Bengio et al. (2026)', 'D. Amodei, We Must Pace the Frontier (2026)',
    'Gladstone AI (2026)', 'R. Naam (2026) · A. Narayanan (2026)',
  ];
  RSI.defScene({
    id: 'credits', music: 'outro', hud: false, label: false, dur: 24, fade: [0.6, 1.6], lines: [],
    cues: Array.from(RSI.L({ zh: '下一条指令，由你来写。', en: 'The next instruction is yours to write.' })).map((c, i) => [15.62 + i * 0.11, 'key']).filter((c, i) => i % (RSI.lang === 'en' ? 2 : 1) === 0),
    draw(ctx, t) {
      D.dots(ctx, 0.025, 48, 0, -t * 6);
      const out = 1 - M.seg(t, 13.6, 14.6);
      if (out > 0) {
        ctx.save(); ctx.globalAlpha *= out;
        const a0 = M.seg(t, 0.3, 1.2, M.ease.outCubic);
        ctx.save(); ctx.globalAlpha *= a0;
        T.line(ctx, { zh: '我让 Clawd 造了一个更聪明的自己', en: 'I Let Clawd Build a Smarter Clawd' }, W / 2, 130, 52, C.ink, 900, 'center');
        T.line(ctx, { zh: '一部关于递归自我改进（RSI）的纯代码动画', en: 'A pure-code animation about recursive self-improvement (RSI)' }, W / 2, 192, 28, C.orange, 700, 'center');
        ctx.restore();
        NOTES.forEach((n, i) => {
          const a = M.seg(t, 1.2 + i * 0.6, 1.9 + i * 0.6); if (a <= 0) return;
          ctx.save(); ctx.globalAlpha *= a;
          ctx.fillStyle = C.orange; ctx.fillRect(250, 268 + i * 62, 6, 34);
          T.text(ctx, n, 276, 268 + i * 62, { size: 25, weight: 500, color: C.ink2, maxW: 1420 });
          ctx.restore();
        });
        const ra = M.seg(t, 3.6, 4.4);
        if (ra > 0) {
          ctx.save(); ctx.globalAlpha *= ra;
          T.line(ctx, { zh: '主要参考', en: 'Key sources' }, W / 2, 492, 28, C.orange, 900, 'center');
          REFS.forEach((s, i) => { const col = i % 3, row = Math.floor(i / 3); T.line(ctx, s, 330 + col * 630, 548 + row * 44, 21, C.ink3, 500, 'center'); });
          ctx.restore();
        }
        const ga = M.seg(t, 5.0, 5.8, M.ease.outBack);
        if (ga > 0) { ctx.save(); ctx.translate(W / 2, 880); ctx.scale(ga, ga); D.pill(ctx, 'github.com/Harryis666/clawd-rsi-explained', 0, 0, { size: 30, fill: C.orange, align: 'center' }); ctx.restore(); }
        ctx.save(); ctx.globalAlpha *= M.seg(t, 5.6, 6.4); T.line(ctx, { zh: '源代码 · 分镜 · 调研记录 · 事实核查', en: 'source code · storyboard · research log · fact check' }, W / 2, 944, 24, C.ink3, 500, 'center'); ctx.restore();
        ctx.restore();
      }
      // final: back to the prompt
      const fa = M.seg(t, 14.8, 15.6, M.ease.outCubic);
      if (fa > 0) {
        ctx.save(); ctx.globalAlpha *= fa;
        const bx = 460, by = 470, bw = 1000, bh = 110;
        D.panel(ctx, bx, by, bw, bh, { fill: '#191917', r: 16 });
        ctx.strokeStyle = RSI.rgba(C.orange, 0.6); ctx.lineWidth = 2; D.rr(ctx, bx, by, bw, bh, 16); ctx.stroke();
        T.line(ctx, '>', bx + 36, by + bh / 2, 36, C.orange, 700, 'left', 'mono');
        const msg = RSI.L({ zh: '下一条指令，由你来写。', en: 'The next instruction is yours to write.' });
        const n = Math.max(0, Math.floor((t - 15.6) / 0.11)); const ch = Array.from(msg);
        const s = ch.slice(0, Math.min(ch.length, n)).join('');
        T.line(ctx, s, bx + 80, by + bh / 2, 36, C.ink, 500, 'left');
        if (Math.floor(t * 2.2) % 2 === 0) { const cw = T.width(ctx, s, 36, 500); ctx.fillStyle = C.ink; ctx.fillRect(bx + 84 + cw, by + bh / 2 - 19, 18, 38); }
        const hd = K.draw(ctx, bx + 120, by - 4, 5, { gen: 1, expr: X.blink(t, 1) ? 'blink' : 'happy', look: [0.5, 0.4], armR: t > 19.5 ? 0.8 + Math.sin(t * 9) * 0.2 : 0, shadow: false });
        void hd;
        ctx.globalAlpha *= M.seg(t, 19.0, 20.0) * 0.7;
        T.line(ctx, { zh: '感谢观看', en: 'Thanks for watching' }, W / 2, 700, 30, C.ink2, 500, 'center');
        ctx.restore();
      }
    },
  });
})();
