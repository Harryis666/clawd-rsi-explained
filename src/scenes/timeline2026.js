/* 第五章 2026，我们走到哪了: history timeline, today's loop, the AL scale, forecasts. */
(function () {
  'use strict';
  const RSI = window.RSI, C = RSI.C, M = RSI.M, D = RSI.D, T = RSI.T, K = RSI.Clawd, X = RSI.X;
  const W = RSI.W, H = RSI.H;
  RSI.chapterCard({ id: 'ch5', music: 'reflect', num: { zh: '第五章', en: 'Chapter 5' }, title: { zh: '2026，我们走到哪了？', en: '2026: where are we?' }, sub: { zh: '从一句猜想，到一份 KPI', en: 'From a conjecture to a KPI' }, label: { zh: '第五章 · 2026，我们走到哪了？', en: 'Ch.5 · 2026: where are we?' } });

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

  // ---------------- today: who does what in the loop; the AL scale ----------------
  RSI.defScene({
    id: 'today', music: 'reflect', lead: 0.6,
    lines: [
      { id: 's1', who: 'narr', zh: '把今天的研究循环拆开看：写代码、跑实验，AI 已经包办了大部分；', en: 'Break today\'s research loop apart: writing code and running experiments — AI already does most of it;' },
      { id: 's2', who: 'narr', zh: '而提出好问题、判断什么重要、决定要不要放行，仍主要靠人。', en: 'while asking good questions, judging what matters and deciding what ships still mostly rests with humans.', hold: 0.6 },
      { id: 's3', who: 'narr', zh: 'Epoch AI 把自动化程度分成六级：从 AL0（完全不用 AI）到 AL5（完全自主）。', en: 'Epoch AI splits automation into six levels: from AL0 (no AI) to AL5 (fully autonomous).' },
      { id: 's4', who: 'narr', zh: '以 Anthropic 公布的数据为例：九成以上的研发工作至少达到 AL3“协作”，约四分之一到了 AL4“主导”，AL5 仍然是零。', en: 'Take Anthropic\'s published numbers: over 90% of R&D work is at least AL3 “collaborates”, about a quarter reaches AL4 “leads”, and AL5 is still zero.', hold: 1.6 },
    ],
    draw(ctx, t, S) {
      D.dots(ctx, 0.03);
      const share = [0.25, 0.85, 0.6, 0.12];
      const p = [M.seg(t, S.T('s1') + 0.5, S.T('s1') + 2.5, M.ease.outCubic), M.seg(t, S.T('s2') + 0.3, S.T('s2') + 2.0, M.ease.outCubic)];
      const ai = [share[0] * p[1], share[1] * p[0], share[2] * p[0], share[3] * p[1]];
      const mv = M.seg(t, S.T('s3') - 0.4, S.T('s3') + 0.6, M.ease.inOutCubic);
      const lx = M.lerp(W / 2, 470, mv), ls = M.lerp(1, 0.78, mv);
      ctx.save(); ctx.translate(lx, 480); ctx.scale(ls, ls);
      D.loop(ctx, 0, 0, 250, { ai, phase: t * 0.25, tokenColor: C.yellow });
      const labs = [[0, -250], [250, 0], [0, 250], [-250, 0]];
      labs.forEach((l, i) => { const v = Math.round(ai[i] * 100); if (v > 0) T.line(ctx, `AI ≈ ${v}%`, l[0] * 1.62, l[1] * 1.0 + (i === 0 ? -105 : i === 2 ? 105 : 0), 26, C.orangeL, 700, 'center'); });
      T.line(ctx, { zh: '示意，非精确统计', en: 'illustrative, not measured' }, 0, 0, 24, C.ink3, 500, 'center');
      ctx.restore();
      if (mv > 0) {
        ctx.save(); ctx.globalAlpha *= mv;
        const x0 = 900, x1 = 1800, y = 420; const lv = ['AL0', 'AL1', 'AL2', 'AL3', 'AL4', 'AL5'];
        const names = [{ zh: '不用 AI', en: 'no AI' }, { zh: '辅助', en: 'assists' }, { zh: '分担', en: 'shares' }, { zh: '协作', en: 'collaborates' }, { zh: '主导', en: 'leads' }, { zh: '完全自主', en: 'autonomous' }];
        const cw = (x1 - x0) / 6;
        lv.forEach((l, i) => { const x = x0 + i * cw; ctx.fillStyle = i === 3 ? RSI.rgba(C.yellow, 0.25) : i === 4 ? RSI.rgba(C.orange, 0.3) : C.surface; D.rr(ctx, x + 4, y - 50, cw - 8, 100, 12); ctx.fill();
          T.line(ctx, l, x + cw / 2, y - 14, 30, i === 5 ? C.ink3 : C.ink, 900, 'center', 'mono'); T.line(ctx, names[i], x + cw / 2, y + 24, 22, C.ink2, 500, 'center'); });
        // Anthropic distribution bar
        const q = M.seg(t, S.T('s4') + 0.6, S.T('s4') + 3.0, M.ease.outCubic);
        const by = 600; const segs = [[{ zh: '≤AL2', en: '≤AL2' }, 0.08, C.grey], [{ zh: 'AL3 协作', en: 'AL3' }, 0.66, C.yellow], [{ zh: 'AL4 主导 26%', en: 'AL4 26%' }, 0.26, C.orange], [{ zh: 'AL5 0%', en: 'AL5 0%' }, 0.0, C.ink3]];
        if (q > 0) {
          T.line(ctx, { zh: 'Anthropic 的 AI 研发工作（2026.8）', en: 'Anthropic AI R&D work (Aug 2026)' }, x0, by - 40, 26, C.ink2, 700, 'left');
          let x = x0; segs.forEach((s2, i) => { const w = (x1 - x0) * s2[1] * q; if (w > 0) { ctx.fillStyle = s2[2]; ctx.fillRect(x, by, Math.max(0, w - 3), 64); if (w > 120) T.line(ctx, s2[0], x + w / 2, by + 32, 22, '#1b1a18', 900, 'center'); } x += w; });
          ctx.globalAlpha *= M.seg(q, 0.9, 1); D.pill(ctx, { zh: 'AL5：0%', en: 'AL5: 0%' }, x1, by + 110, { size: 24, fill: C.raised, color: C.ink, align: 'right' });
          X.src(ctx, { zh: 'Epoch AI 自动化等级；Anthropic Institute，2026.9.17', en: 'Epoch AI automation levels; Anthropic Institute, 2026-09-17' });
        }
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
