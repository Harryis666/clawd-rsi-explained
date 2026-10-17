/* 2026，我们走到哪了: today's loop (EP2) and the forecasts (EP3). v3: the 1965→2026 history timeline was cut. */
(function () {
  'use strict';
  const RSI = window.RSI, C = RSI.C, M = RSI.M, D = RSI.D, T = RSI.T, K = RSI.Clawd, X = RSI.X;
  const W = RSI.W, H = RSI.H;

  // ---------------- today (EP2): who does what in the EP1 research loop → this episode's answer ----------------
  RSI.defScene({
    id: 'today', music: 'reflect',
    lines: [
      { id: 's1', who: 'narr', zh: '回到第 1 集的研究循环：今天，“实验”大部分已经交给 AI，“评估”也做了不少；', en: 'Back to Episode 1’s research loop: today AI does most of the experimenting, and a fair share of the evaluating;' },
      { id: 's2', who: 'narr', zh: '而“想法”和“决定”——想出好问题、拍板放行——仍然主要靠人。', en: 'while “idea” and “decision” — asking good questions, giving the final go-ahead — still mostly rest with humans.', hold: 0.3 },
      { id: 's3', who: 'narr', zh: '所以答案是：AI 已经在改进自己——但拍板的，还是人。', en: 'So the answer: AI is already improving itself — but humans still make the call.', hold: 0.8, kick: true },
    ],
    cues: [['s1+1.0', 'flipNode'], ['s1+2.2', 'flipNode'], ['s2+0.4', 'pop'], ['s2+0.9', 'pop'], ['s3+0.3', 'statement'], ['s3+2.2', 'stamp']],
    draw(ctx, t, S) {
      D.dots(ctx, 0.03);
      const share = [0.25, 0.85, 0.5, 0.1];
      const p = [M.seg(t, S.T('s1') + 0.6, S.T('s1') + 2.6, M.ease.outCubic), M.seg(t, S.T('s2') + 0.2, S.T('s2') + 1.6, M.ease.outCubic)];
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
      ctx.save(); ctx.globalAlpha *= M.seg(t, S.T('s1') + 0.6, S.T('s1') + 1.2) * (1 - mv);
      ctx.fillStyle = C.orange; ctx.fillRect(1430, 860, 30, 10); T.line(ctx, { zh: 'AI 做的部分', en: 'done by AI' }, 1474, 866, 24, C.ink2, 500, 'left');
      ctx.fillStyle = C.blue; ctx.fillRect(1430, 900, 30, 10); T.line(ctx, { zh: '人做的部分', en: 'done by humans' }, 1474, 906, 24, C.ink2, 500, 'left');
      ctx.restore();
      // this episode's answer
      if (mv > 0) {
        ctx.save(); ctx.globalAlpha *= mv; const x0 = 1010;
        D.pill(ctx, { zh: '本集答案', en: 'This episode’s answer' }, x0, 300, { size: 30, fill: C.orange });
        T.line(ctx, { zh: 'AI 已经在改进自己', en: 'AI is already improving itself' }, x0, 400, RSI.lang === 'en' ? 50 : 62, C.ink, 900, 'left');
        const k1 = M.ease.outBack(M.seg(t, S.T('s3') + 0.8, S.T('s3') + 1.1));
        if (k1 > 0) { ctx.save(); ctx.translate(x0 + (RSI.lang === 'en' ? 790 : 590), 400); ctx.scale(k1, k1); D.icon(ctx, 'check', 0, 0, 58, C.green, 10); ctx.restore(); }
        const k2 = M.seg(t, S.T('s3') + 1.4, S.T('s3') + 1.9, M.ease.outCubic);
        ctx.save(); ctx.globalAlpha *= k2; ctx.translate((1 - k2) * 30, 0);
        T.line(ctx, { zh: '但拍板的，还是人', en: 'but humans still make the call' }, x0, 510, RSI.lang === 'en' ? 50 : 62, C.yellow, 900, 'left');
        ctx.restore();
        const k3 = M.ease.outBack(M.seg(t, S.T('s3') + 2.2, S.T('s3') + 2.5));
        if (k3 > 0) { ctx.save(); ctx.translate(x0 + 160, 660); ctx.rotate(-0.08); ctx.scale(k3, k3); D.icon(ctx, 'gavel', 0, 0, 120, C.blue, 9); ctx.restore();
          T.line(ctx, { zh: '截至 2026 年秋', en: 'as of autumn 2026' }, x0 + 300, 680, 26, C.ink3, 600, 'left'); }
        ctx.restore();
      }
    },
  });

  // ---------------- forecasts ----------------
  // v3.2: wider cards (phone type), names and affiliations on their own lines, explicit card slots so nothing collides
  const FC = [
    { x: 0.05, up: 1, bx: 40, col: C.red, who: { zh: 'Gladstone 报告', en: 'Gladstone report' }, what: { zh: '2026.10 · 多数受访的实验室内部人士：3–12 个月内就会开始', en: 'Oct 2026 · most lab insiders interviewed: it starts within 3–12 months' } },
    { x: 0.30, up: 0, bx: 300, col: C.orange, who: { zh: 'Jack Clark', en: 'Jack Clark' }, org: { zh: 'Anthropic 联合创始人', en: 'Anthropic co-founder' }, what: { zh: '2026.5 · 2028 年底前实现的概率约 60%', en: 'May 2026 · ~60% chance by the end of 2028' } },
    { x: 0.42, up: 1, bx: 590, col: C.orange, who: { zh: 'OpenAI 的目标', en: 'OpenAI’s goal' }, what: { zh: '2028 年 3 月：做出“自动化 AI 研究员”——能自己搞 AI 研究的 AI', en: 'March 2028: an “automated AI researcher” — an AI that does AI research itself' } },
    { x: 0.60, up: 0, bx: 840, col: C.yellow, who: { zh: 'AI Futures 团队', en: 'AI Futures Project' }, what: { zh: '2026 Q1 · “自动化程序员”（顶尖程序员水平）：预计 2028 年中–2030 年中', en: 'Q1 2026 · an “automated coder” (top-programmer level): mid-2028 to mid-2030' } },
    { x: 0.80, up: 1, bx: 1140, col: C.blue, who: { zh: 'Ramez Naam', en: 'Ramez Naam' }, org: { zh: '未来学家', en: 'futurist' }, what: { zh: '2026.9 · 怀疑“爆炸”：瓶颈在实验和现实世界', en: 'Sep 2026 · skeptical of a “boom”: the bottlenecks are experiments and the real world' } },
    { x: 0.97, up: 0, bx: 1380, col: C.blue, who: { zh: 'Arvind Narayanan', en: 'Arvind Narayanan' }, org: { zh: '普林斯顿大学', en: 'Princeton' }, what: { zh: '2026.7 · 除非出现断裂，AI 仍是一种“普通技术”', en: 'Jul 2026 · unless something breaks, AI stays a “normal technology”' } },
  ];
  const FCT = (i) => `o1+${(0.6 + i * 0.85).toFixed(2)}`;
  RSI.defScene({
    id: 'forecasts', music: 'reflect', chapter: { zh: '什么时候？', en: 'When?' },
    lines: [
      { id: 'o1', who: 'narr', zh: '那么，AI 什么时候会真正“自己造自己”？预测五花八门。', en: 'So when will AI truly start “building itself”? The forecasts are all over the map.', hold: 4.4 },
      { id: 'o2', who: 'narr', zh: '注意：这些数字大多是实验室自己量、自己评的——有时打分的裁判就是 AI。', en: 'Note: most of these numbers are measured and graded by the labs themselves — sometimes the judge is an AI.', hold: 0.3 },
      { id: 'o3', who: 'clawd', zh: 'AI 当裁判？……这不就是第 2 集那个“自己给自己打分”吗？', en: 'An AI as the judge?… Isn’t that the “grading yourself” from Episode 2?', min: 3.0, maxW: 700 },
    ],
    cues: [...FC.map((f, i) => [FCT(i), 'tick']), ['o2+0.4', 'gavel'], ['o3', 'surprise'], ['o3+1.3', 'rewind'], ['o3+1.5', 'page']],
    draw(ctx, t, S) {
      D.dots(ctx, 0.03);
      const dim = 1 - 0.78 * M.seg(t, S.T('o3') - 0.3, S.T('o3') + 0.3);
      ctx.save(); ctx.globalAlpha *= dim;
      const x0 = 250, x1 = 1600, y = 520;
      const g = ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, C.red); g.addColorStop(0.45, C.yellow); g.addColorStop(1, C.blue);
      ctx.fillStyle = g; D.rr(ctx, x0, y - 6, x1 - x0, 12, 6); ctx.fill();
      T.line(ctx, { zh: '很快', en: 'very soon' }, x0 - 30, y, 30, C.red, 900, 'right'); T.line(ctx, { zh: '很慢 / 未必', en: 'slow / maybe not' }, x1 + 30, y, 30, C.blue, 900, 'left');
      T.line(ctx, { zh: 'AI 什么时候会“自己造自己”？', en: 'When will AI “build itself”?' }, W / 2, 150, 44, C.ink, 900, 'center');
      FC.forEach((f, i) => {
        const ti = S.R(FCT(i)); const a = M.seg(t, ti, ti + 0.4); if (a <= 0) return;
        const x = x0 + f.x * (x1 - x0); const up = f.up; const ly = up ? y - 70 : y + 70;
        ctx.save(); ctx.globalAlpha *= a;
        ctx.fillStyle = f.col; ctx.beginPath(); ctx.arc(x, y, 14, 0, 7); ctx.fill(); ctx.strokeStyle = C.bg; ctx.lineWidth = 4; ctx.stroke();
        ctx.strokeStyle = RSI.rgba(f.col, 0.6); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y + (up ? -16 : 16)); ctx.lineTo(x, ly); ctx.stroke();
        const bw = 500, bx = f.bx, tw = bw - 32;
        const L = T.layout(ctx, RSI.L(f.what), { size: 23, weight: 500, maxW: tw, lh: 1.35 });
        const wWho = T.width(ctx, f.who, 22, 900), wOrg = f.org ? T.width(ctx, f.org, 19, 600) : 0, org2 = f.org && wWho + 14 + wOrg > tw;
        const top = org2 ? 92 : 58, bh = top + L.h + 16;
        const by = up ? ly - bh : ly;
        D.panel(ctx, bx, by, bw, bh, { fill: C.surface, r: 14 }); ctx.fillStyle = f.col; ctx.fillRect(bx, up ? by + bh - 5 : by, bw, 5);
        T.line(ctx, f.who, bx + 16, by + 32, 22, f.col, 900, 'left');
        if (f.org) T.line(ctx, f.org, org2 ? bx + 16 : bx + 16 + wWho + 14, org2 ? by + 68 : by + 33, 19, C.ink2, 600, 'left');
        T.drawLayout(ctx, L, bx + 16, by + top - 4, {});
        ctx.restore();
      });
      if (t > S.T('o2')) {
        const a = M.seg(t, S.T('o2') + 0.3, S.T('o2') + 0.8);
        ctx.save(); ctx.globalAlpha *= a; D.icon(ctx, 'gavel', 1700, 852, 76, C.yellow, 8);
        T.line(ctx, { zh: '自己量 · 自己评 · 有时 AI 当裁判', en: 'self-measured · self-graded · sometimes AI-judged' }, 1640, 858, 28, C.yellow, 700, 'right'); ctx.restore();
      }
      ctx.restore();
      // ---- Clawd remembers Episode 2’s self-grading judge
      const ca = M.seg(t, S.T('o3') - 0.5, S.T('o3') - 0.1);
      if (ca > 0) {
        const tt = t - S.T('o3'), hop = X.hop(t, S.T('o3') + 0.05, 0.4, 34);
        const expr = tt < 1.2 ? 'surprised' : 'worried';
        const hd = K.draw(ctx, 330, 860 + hop.dy, 9, { gen: S.gen().g, expr, look: tt < 1.2 ? [0.2, -0.6] : [0.8, -0.8], armR: tt > 1.2 ? 0.55 : 0.2, sx: hop.sx, sy: hop.sy, alpha: ca });
        S.anchors.clawd = [430, hd[1] + 40]; S.sides.clawd = 'right';
        if (tt > 0.15 && tt < 1.6) X.mark(ctx, '!', 300, hd[1] - 30, tt - 0.15, C.yellow, 70);
        const ka = M.ease.outBack(M.seg(t, S.T('o3') + 1.3, S.T('o3') + 1.7));
        if (ka > 0) {
          // memory dots from Clawd’s head to the picture
          ctx.save(); ctx.globalAlpha *= M.clamp(ka); ctx.fillStyle = 'rgba(240,238,230,0.75)';
          [[400, hd[1] - 40, 9], [450, hd[1] - 110, 13], [510, hd[1] - 190, 17]].forEach(([x, y2, r]) => { ctx.beginPath(); ctx.arc(x, y2, r, 0, 7); ctx.fill(); });
          ctx.restore();
          const fx = 560, fy = 260, fw = 520, fh = 292;
          const c = RSI.Series.snap('r3', RSI.prepScene(RSI.allScenes.r3).R('r3d') + 0.6 + Math.min(1.5, Math.max(0, tt - 1.3)) * 0.4, { slot: 'o3', k: 0.4 });
          ctx.save(); ctx.translate(fx + fw / 2, fy + fh / 2); ctx.scale(ka, ka); ctx.rotate(-0.02);
          ctx.fillStyle = C.paper; ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 24; ctx.fillRect(-fw / 2 - 14, -fh / 2 - 14, fw + 28, fh + 28); ctx.shadowColor = 'transparent';
          ctx.filter = 'sepia(0.7) saturate(0.8) contrast(1.05) brightness(0.95)'; ctx.drawImage(c, -fw / 2, -fh / 2, fw, fh); ctx.filter = 'none';
          ctx.restore();
          ctx.save(); ctx.globalAlpha *= M.clamp(ka);
          D.pill(ctx, { zh: '第 2 集 · 第 3 级：自己当裁判', en: 'Episode 2 · Rung 3: its own judge' }, fx + fw / 2, fy - 34, { size: 26, fill: C.orange, align: 'center' });
          ctx.restore();
        }
      }
    },
  });
})();
