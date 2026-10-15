/* 第五章 2026，我们走到哪了: history timeline, today's loop, the AL scale, forecasts. */
(function () {
  'use strict';
  const RSI = window.RSI, C = RSI.C, M = RSI.M, D = RSI.D, T = RSI.T, K = RSI.Clawd, X = RSI.X;
  const W = RSI.W, H = RSI.H;

  const EV = [
    [1965.8, { zh: 'I. J. Good：“智能爆炸”', en: 'I. J. Good: “intelligence explosion”' }],
    [1987.5, { zh: '施密德胡伯毕业论文：学习如何学习', en: 'Schmidhuber thesis: learning to learn' }],
    [2003.7, { zh: '哥德尔机：可证明地改写自己', en: 'Gödel Machine: provable self-rewrites' }],
    [2017.8, { zh: 'AlphaGo Zero：只和自己下棋', en: 'AlphaGo Zero: self-play only' }],
    [2022.9, { zh: 'Constitutional AI：\nAI 当裁判', en: 'Constitutional AI: AI as judge' }],
    [2024.5, { zh: '《自然》：AI 学 AI 的数据，\n会越学越“糊”', en: 'Nature: models trained on AI data degrade' }],
    [2025.3, { zh: 'AI 2027 情景', en: 'AI 2027 scenario' }],
    [2025.4, { zh: 'AlphaEvolve ·\n达尔文-哥德尔机', en: 'AlphaEvolve · Darwin Gödel Machine' }],
    [2026.2, { zh: 'Karpathy\nautoresearch', en: 'Karpathy’s autoresearch' }],
    [2026.3, { zh: 'ICLR RSI 研讨会', en: 'ICLR workshop on RSI' }],
    [2026.45, { zh: 'Anthropic\n《当 AI 开始构建自己》', en: 'Anthropic: “When AI builds itself”' }],
    [2026.55, { zh: '智能体入侵\nHugging Face 事件', en: 'Agents break into Hugging Face' }],
    [2026.68, { zh: 'OpenAI：\n自动化研究实习生', en: 'OpenAI: automated research intern' }],
    [2026.7, { zh: 'Dario：\n给前沿“定速”', en: 'Dario: “We Must Pace the Frontier”' }],
    [2026.71, { zh: 'Claude 主导 26%\n智谱 Infra Agent', en: 'Claude leads 26% · Zhipu Infra Agent' }],
    [2026.74, { zh: 'Hinton、Bengio 等：\n几年内或自动化\n大部分 AI 研发', en: 'Hinton, Bengio et al.: most AI R&D could be automated within years' }],
    [2026.79, { zh: 'Gladstone 报告：\n内部人士估计\n3–12 个月内开始', en: 'Gladstone: insiders expect RSI to start within 3–12 months' }],
  ];
  const DATES = ['1965', '1987', '2003', '2017', '2022.12', '2024.7', '2025.4', '2025.5', '2026.3', '2026.4', '2026.6', '2026.7', '2026.9.6', '2026.9.12', '2026.9.17', '2026.9.28', '2026.10.14'];
  RSI.defScene({
    id: 'history', music: 'reflect', lead: 0.6,
    lines: [
      { id: 'y1', who: 'narr', zh: '回头看，这个想法沉睡了很久。', en: 'Looking back, the idea slept for a long time.' },
      { id: 'y2', who: 'narr', zh: '1987 年，施密德胡伯在毕业论文里写下会“学习如何学习”的程序；2003 年，他又提出能先证明改进有效、再改写自己的“哥德尔机”。', en: 'In 1987, Jürgen Schmidhuber\'s thesis described programs that “learn how to learn”; in 2003 he proposed the Gödel Machine, which rewrites itself only after proving the change helps.', hold: 0.6 },
      { id: 'y3', who: 'narr', zh: '然后，事情突然密集起来。', en: 'Then, suddenly, things got crowded.', hold: 0.6 },
      { id: 'y4', who: 'narr', zh: '2026 年，RSI 从一个哲学问题，变成了实验室的 KPI。', en: 'In 2026, RSI went from a philosophy question to a lab KPI.', hold: 3.0 },
    ],
    cues: [['y3+0.3', 'zoom']],
    draw(ctx, t, S) {
      D.dots(ctx, 0.03);
      const ax0 = 140, ax1 = 1780, y0 = 560;
      const z = M.seg(t, S.T('y3') + 0.2, S.T('y3') + 2.4, M.ease.inOutCubic);
      const lin = (yr) => ax0 + ((yr - 1960) / (2027.2 - 1960)) * (ax1 - ax0);
      const recent0 = 4; const nR = EV.length - recent0;
      const eq = (i) => (i < recent0 ? -600 + i * 140 : ax0 + 60 + ((i - recent0) / (nR - 1)) * (ax1 - ax0 - 120));
      ctx.strokeStyle = 'rgba(240,238,230,0.4)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(ax0 - 40, y0); ctx.lineTo(ax1 + 40, y0); ctx.stroke();
      // decade ticks (fade during zoom)
      ctx.save(); ctx.globalAlpha *= 1 - z;
      for (let yr = 1960; yr <= 2020; yr += 10) { const x = lin(yr); ctx.fillStyle = C.ink3; ctx.fillRect(x - 1, y0 - 10, 2, 20); T.line(ctx, String(yr), x, y0 + 40, 22, C.ink3, 500, 'center', 'mono'); }
      T.text(ctx, { zh: '沉睡六十年', en: 'sixty quiet years' }, (lin(1966) + lin(2016)) / 2, 236, { size: 44, weight: 900, color: C.ink2, align: 'center' });
      ctx.strokeStyle = C.ink3; ctx.setLineDash([6, 8]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(lin(1966), 318); ctx.lineTo(lin(2016), 318); ctx.stroke(); ctx.setLineDash([]);
      ctx.restore();
      const appear = (i) => (i < recent0 ? M.seg(t, 0.4 + i * 0.5, 0.8 + i * 0.5) : M.seg(t, S.T('y3') - 0.2 + (i - recent0) * 0.05, S.T('y3') + 0.2 + (i - recent0) * 0.05));
      EV.forEach((e, i) => {
        const a = appear(i); if (a <= 0) return;
        const x = M.lerp(lin(e[0]), eq(i), z); if (x < -400) return;
        const rec = i >= recent0; const col = rec ? (e[0] >= 2026 ? C.orange : C.yellow) : C.blue;
        ctx.save(); ctx.globalAlpha *= a;
        ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y0, rec ? 11 : 13, 0, 7); ctx.fill();
        if (rec && z < 0.2) D.glow(ctx, x, y0, 60, col, 0.6 * (1 - z * 5));
        // labels: early events always (when unzoomed); recent ones after zoom, alternating rows
        const la = rec ? M.seg(z, 0.6, 1) : 1 - z;
        if (la > 0) {
          const k = rec ? (i - recent0) % 4 : i % 2; const up = rec ? k < 2 : k === 0; const off = rec ? (k % 2 ? 200 : 90) : 110;
          const ly = up ? y0 - off : y0 + off;
          ctx.globalAlpha *= la; ctx.strokeStyle = RSI.rgba(col, 0.5); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y0 + (up ? -14 : 14)); ctx.lineTo(x, ly + (up ? 30 : -34)); ctx.stroke();
          T.line(ctx, DATES[i], x, ly + (up ? -14 : -12), rec ? 22 : 26, col, 900, 'center', 'mono');
          const L = T.layout(ctx, RSI.L(e[1]), { size: rec ? 21 : 24, weight: 500, maxW: rec ? 236 : 400, lh: 1.3, balance: true });
          T.drawLayout(ctx, L, x, ly + (up ? -14 - 14 - L.h : 14), { align: 'center', color: C.ink });
        }
        ctx.restore();
      });
      const pa = t > S.T('y4') + 0.4 ? M.seg(t, S.T('y4') + 0.4, S.T('y4') + 0.9, M.ease.outBack) : 0;
      if (z > 0) { ctx.save(); ctx.globalAlpha *= M.seg(z, 0.5, 1) * (1 - M.clamp(pa * 2)); T.line(ctx, { zh: '2022 → 2026：越来越挤', en: '2022 → 2026: more and more crowded' }, W / 2, 180, 40, C.orange, 900, 'center'); ctx.restore(); }
      if (pa > 0) {
        ctx.save(); ctx.translate(W / 2, 190); ctx.scale(pa, pa); D.pill(ctx, { zh: '哲学问题  →  写进计划、定了时间表的目标', en: 'philosophy question  →  a goal with a timeline' }, 0, 0, { size: 34, fill: C.orange, align: 'center' }); ctx.restore();
      }
    },
  });

  // ---------------- today (EP2): who does what in the EP1 research loop → this episode's answer ----------------
  RSI.defScene({
    id: 'today', music: 'reflect', lead: 0.6,
    lines: [
      { id: 's1', who: 'narr', zh: '把第 1 集那个研究循环拆开看：想法、实验、评估、决定。今天，“实验”这一步，AI 已经包办了大部分，“评估”也做了不少；', en: 'Take apart the research loop from Episode 1: idea, experiment, evaluation, decision. Today AI already does most of the experimenting, and a fair share of the evaluating;' },
      { id: 's2', who: 'narr', zh: '而“想法”和“决定”——想出好问题、拍板放行——仍然主要靠人。', en: 'while “idea” and “decision” — asking good questions, giving the final go-ahead — still mostly rest with humans.', hold: 0.6 },
      { id: 's3', who: 'narr', zh: '所以，本集问题的答案是：是的，AI 已经在改进自己——但拍板的，还是人。', en: 'So the answer to this episode’s question: yes, AI is already improving itself — but humans still make the call.', hold: 1.4 },
    ],
    cues: [['s1+1.2', 'flipNode'], ['s1+2.6', 'flipNode'], ['s2+0.4', 'pop'], ['s2+0.9', 'pop'], ['s3+0.3', 'statement'], ['s3+2.6', 'stamp']],
    draw(ctx, t, S) {
      D.dots(ctx, 0.03);
      const share = [0.25, 0.85, 0.5, 0.1];
      const p = [M.seg(t, S.T('s1') + 0.8, S.T('s1') + 3.2, M.ease.outCubic), M.seg(t, S.T('s2') + 0.2, S.T('s2') + 1.6, M.ease.outCubic)];
      const ai = [share[0] * p[1], share[1] * p[0], share[2] * p[0], share[3] * p[1]];
      const mv = M.seg(t, S.T('s3') - 0.3, S.T('s3') + 0.7, M.ease.inOutCubic);
      const lx = M.lerp(W / 2, 560, mv), ls = M.lerp(1, 0.84, mv);
      ctx.save(); ctx.translate(lx, 470); ctx.scale(ls, ls);
      D.loop(ctx, 0, 0, 250, { ai, phase: t * 0.25, tokenColor: C.yellow });
      const labs = [[0, -250], [250, 0], [0, 250], [-250, 0]];
      labs.forEach((l, i) => { const v = Math.round(ai[i] * 100); if (v > 0) T.line(ctx, `AI ≈ ${v}%`, l[0] * 1.62, l[1] * 1.0 + (i === 0 ? -105 : i === 2 ? 105 : 0), 26, C.orangeL, 700, 'center'); });
      // the human-held nodes: idea (top) and decision (left)
      const hk = M.seg(t, S.T('s2') + 0.3, S.T('s2') + 0.9);
      if (hk > 0) {
        [[0, -250, S.T('s2') + 0.4], [-250, 0, S.T('s2') + 0.9]].forEach((n) => { const k = M.ease.outBack(M.seg(t, n[2], n[2] + 0.35)); if (k <= 0) return;
          ctx.save(); ctx.translate(n[0] + 66, n[1] - 62); ctx.scale(k, k); ctx.fillStyle = C.blue; ctx.beginPath(); ctx.arc(0, 0, 30, 0, 7); ctx.fill(); D.icon(ctx, 'people', 0, 0, 34, '#0f1a26', 5); ctx.restore(); });
      }
      T.line(ctx, { zh: '示意，非精确统计', en: 'illustrative, not measured' }, 0, 0, 24, C.ink3, 500, 'center');
      ctx.restore();
      // legend
      ctx.save(); ctx.globalAlpha *= M.seg(t, S.T('s1') + 0.8, S.T('s1') + 1.4) * (1 - mv);
      ctx.fillStyle = C.orange; ctx.fillRect(1430, 860, 30, 10); T.line(ctx, { zh: 'AI 做的部分', en: 'done by AI' }, 1474, 866, 24, C.ink2, 500, 'left');
      ctx.fillStyle = C.blue; ctx.fillRect(1430, 900, 30, 10); T.line(ctx, { zh: '人做的部分', en: 'done by humans' }, 1474, 906, 24, C.ink2, 500, 'left');
      ctx.restore();
      // this episode's answer
      if (mv > 0) {
        ctx.save(); ctx.globalAlpha *= mv; const x0 = 1010;
        D.pill(ctx, { zh: '本集答案', en: 'This episode’s answer' }, x0, 300, { size: 30, fill: C.orange });
        T.line(ctx, { zh: 'AI 已经在改进自己', en: 'AI is already improving itself' }, x0, 400, RSI.lang === 'en' ? 50 : 62, C.ink, 900, 'left');
        const k1 = M.ease.outBack(M.seg(t, S.T('s3') + 1.0, S.T('s3') + 1.3));
        if (k1 > 0) { ctx.save(); ctx.translate(x0 + (RSI.lang === 'en' ? 790 : 590), 400); ctx.scale(k1, k1); D.icon(ctx, 'check', 0, 0, 58, C.green, 10); ctx.restore(); }
        const k2 = M.seg(t, S.T('s3') + 1.8, S.T('s3') + 2.3, M.ease.outCubic);
        ctx.save(); ctx.globalAlpha *= k2; ctx.translate((1 - k2) * 30, 0);
        T.line(ctx, { zh: '但拍板的，还是人', en: 'but humans still make the call' }, x0, 510, RSI.lang === 'en' ? 50 : 62, C.yellow, 900, 'left');
        ctx.restore();
        const k3 = M.ease.outBack(M.seg(t, S.T('s3') + 2.6, S.T('s3') + 2.9));
        if (k3 > 0) { ctx.save(); ctx.translate(x0 + 160, 660); ctx.rotate(-0.08); ctx.scale(k3, k3); D.icon(ctx, 'gavel', 0, 0, 120, C.blue, 9); ctx.restore();
          T.line(ctx, { zh: '截至 2026 年秋', en: 'as of autumn 2026' }, x0 + 300, 680, 26, C.ink3, 600, 'left'); }
        ctx.restore();
      }
    },
  });

  // ---------------- forecasts ----------------
  const FC = [
    { x: 0.05, up: 1, col: C.red, who: { zh: 'Gladstone 报告（2026.10）', en: 'Gladstone report (Oct 2026)' }, what: { zh: '多数受访内部人士：3–12 个月内开始', en: 'most insiders interviewed: starts within 3–12 months' } },
    { x: 0.30, up: 0, col: C.orange, who: { zh: 'Jack Clark（2026.5）', en: 'Jack Clark (May 2026)' }, what: { zh: '2028 年底前发生的概率约 60%', en: '~60% chance by end of 2028' } },
    { x: 0.42, up: 1, col: C.orange, who: { zh: 'OpenAI 目标', en: 'OpenAI goal' }, what: { zh: '2028 年 3 月：自动化 AI 研究员', en: 'Mar 2028: automated AI researcher' } },
    { x: 0.60, up: 0, col: C.yellow, who: { zh: 'AI Futures（2026 Q1）', en: 'AI Futures (Q1 2026)' }, what: { zh: '“自动化程序员”中位数：2028 年中–2030 年中', en: '“automated coder” medians: mid-2028 to mid-2030' } },
    { x: 0.80, up: 1, col: C.blue, who: { zh: 'Ramez Naam（2026.9）', en: 'Ramez Naam (Sep 2026)' }, what: { zh: '怀疑“爆炸”：瓶颈在实验和现实', en: 'skeptical: bottlenecks in experiments & reality' } },
    { x: 0.97, up: 0, col: C.blue, who: { zh: 'Arvind Narayanan（2026.7）', en: 'Arvind Narayanan (Jul 2026)' }, what: { zh: '除非出现断裂，AI 仍是“普通技术”', en: 'AI stays a “normal technology” unless something breaks' } },
  ];
  RSI.defScene({
    id: 'forecasts', music: 'reflect', lead: 0.6,
    lines: [
      { id: 'o1', who: 'narr', zh: '那么，什么时候会到顶？预测五花八门。', en: 'So when do we reach the top? Forecasts are all over the map.', hold: 6.5 },
      { id: 'o2', who: 'narr', zh: '还要提醒一句：这些数字大多来自实验室自己的测量，用的是自己的评估——有时，裁判就是 AI。', en: 'One caveat: most of these numbers come from labs measuring themselves, with their own evaluations — sometimes with AI as the judge.', hold: 0.6 },
      { id: 'o3', who: 'clawd', zh: '谁来当裁判？……这个问题，我好像在哪儿听过。', en: 'Who\'s the judge?… I feel like I\'ve heard that question before.' },
    ],
    cues: FC.map((f, i) => [`o1+${(0.8 + i * 0.9).toFixed(1)}`, 'tick']),
    draw(ctx, t, S) {
      D.dots(ctx, 0.03);
      const x0 = 250, x1 = 1670, y = 520;
      const g = ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, C.red); g.addColorStop(0.45, C.yellow); g.addColorStop(1, C.blue);
      ctx.fillStyle = g; D.rr(ctx, x0, y - 6, x1 - x0, 12, 6); ctx.fill();
      T.line(ctx, { zh: '很快', en: 'very soon' }, x0 - 30, y, 30, C.red, 900, 'right'); T.line(ctx, { zh: '很慢 / 未必', en: 'slow / maybe not' }, x1 + 30, y, 30, C.blue, 900, 'left');
      FC.forEach((f, i) => {
        const ti = S.R(`o1+${(0.8 + i * 0.9).toFixed(1)}`); const a = M.seg(t, ti, ti + 0.4); if (a <= 0) return;
        const x = x0 + f.x * (x1 - x0); const up = f.up; const ly = up ? y - 70 : y + 70;
        ctx.save(); ctx.globalAlpha *= a;
        ctx.fillStyle = f.col; ctx.beginPath(); ctx.arc(x, y, 14, 0, 7); ctx.fill(); ctx.strokeStyle = C.bg; ctx.lineWidth = 4; ctx.stroke();
        ctx.strokeStyle = RSI.rgba(f.col, 0.6); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y + (up ? -16 : 16)); ctx.lineTo(x, ly); ctx.stroke();
        const bw = 330; const bx = M.clamp(x - bw / 2, 40, W - 40 - bw);
        const L = T.layout(ctx, RSI.L(f.what), { size: 23, weight: 500, maxW: bw - 30, lh: 1.35 }); const bh = L.h + 70;
        const by = up ? ly - bh : ly;
        D.panel(ctx, bx, by, bw, bh, { fill: C.surface, r: 14 }); ctx.fillStyle = f.col; ctx.fillRect(bx, up ? by + bh - 5 : by, bw, 5);
        T.line(ctx, f.who, bx + 16, by + 30, 22, f.col, 900, 'left'); T.drawLayout(ctx, L, bx + 16, by + 52, {});
        ctx.restore();
      });
      if (t > S.T('o2')) {
        const a = M.seg(t, S.T('o2'), S.T('o2') + 0.6);
        ctx.save(); ctx.globalAlpha *= a; D.icon(ctx, 'gavel', 1640, 840, 80, C.yellow, 8);
        T.line(ctx, { zh: '自我测量 · 自我评估 · AI 当裁判', en: 'self-measured · self-evaluated · AI-judged' }, 1560, 845, 28, C.yellow, 700, 'right'); ctx.restore();
      }
      const ca = M.seg(t, S.T('o3') - 0.6, S.T('o3'));
      if (ca > 0) { const hd = K.draw(ctx, 300, 900, 6, { gen: S.gen().g, expr: 'worried', look: [0.6, -0.4], alpha: ca }); S.anchors.clawd = [320, hd[1]]; }
    },
  });
})();
