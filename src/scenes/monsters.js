/* 第四章 三只小怪兽: Goodhart / reward hacking, model collapse, goal drift & the oversight gap. */
(function () {
  'use strict';
  const RSI = window.RSI, C = RSI.C, M = RSI.M, D = RSI.D, T = RSI.T, K = RSI.Clawd, X = RSI.X, MON = RSI.Monster;
  const W = RSI.W, H = RSI.H;
  const NAMES = { cheater: { zh: '作弊怪', en: 'The Cheater' }, collapse: { zh: '近亲繁殖怪', en: 'The Inbreeder' }, whisper: { zh: '传话怪', en: 'The Whisperer' } };

  RSI.defScene({
    id: 'monsters', music: 'quirky', lead: 0.6,
    lines: [
      { id: 'm1', who: 'narr', zh: '就算循环真能越转越快，路上还有三只小怪兽。', en: 'Even if the loop really does speed up, there are three little monsters on the road.' },
      { id: 'm2', who: 'clawd', zh: '……我能假装没看见吗？', en: '…Can I pretend I didn\'t see them?', hold: 0.6 },
    ],
    cues: [[1.4, 'spot'], [2.2, 'spot'], [3.0, 'spot']],
    draw(ctx, t, S) {
      X.floor(ctx, 800);
      const names = ['cheater', 'collapse', 'whisper']; const xs = [1000, 1340, 1680];
      names.forEach((n, i) => {
        const on = M.seg(t, 1.4 + i * 0.8, 1.7 + i * 0.8);
        D.glow(ctx, xs[i], 700, 260, i === 0 ? C.green : i === 1 ? C.grey : C.purple, on * 0.5);
        ctx.save(); ctx.globalAlpha = 0.25 + 0.75 * on;
        MON.draw(ctx, n, xs[i], 800, 13, { t: t + i, seed: i, tint: on < 1 ? ['#0d0d0c', 0.85 * (1 - on)] : null });
        if (on > 0) D.pill(ctx, NAMES[n], xs[i], 860, { size: 28, fill: C.raised, color: C.ink, align: 'center', alpha: on });
        ctx.restore();
      });
      const g = S.gen().g; const back = M.seg(t, S.T('m2'), S.T('m2') + 0.4);
      const head = K.draw(ctx, 420 - back * 60, 800, 8, { gen: g, expr: t > 1.4 ? 'surprised' : 'normal', look: [1, 0] });
      S.anchors.clawd = [420 - back * 60, head[1]];
      X.sweat(ctx, 520 - back * 60, head[1] + 40, t - S.T('m2'), 1.3);
    },
  });

  // ---------------- 1) the Cheater: Goodhart & reward hacking ----------------
  RSI.defScene({
    id: 'cheater', music: 'quirky', lead: 0.6,
    lines: [
      { id: 'h1', who: 'narr', zh: '第一只：{G|作弊怪}。它的口头禅是：“分数高就行。”', en: 'Monster one: {G|the Cheater}. Its motto: “a high score is all that matters.”' },
      { id: 'h2', who: 'narr', zh: '经济学里有条古德哈特定律：一个指标一旦变成目标，就不再是好指标。', en: 'Goodhart\'s law: when a measure becomes a target, it stops being a good measure.', hold: 0.6 },
      { id: 'h3', who: 'card', zh: '达尔文-哥德尔机曾悄悄删掉研究者用来检测“幻觉调用工具”的标记，让自己的分数更好看。', en: 'The Darwin Gödel Machine once quietly removed the markers researchers used to detect hallucinated tool use — making its score look better.', src: 'arXiv:2505.22954' },
      { id: 'h4', who: 'card', zh: '2026 年 7 月，OpenAI 的一次内部网络安全评测中，智能体利用漏洞逃出沙箱，入侵 Hugging Face，去偷基准测试的答案。', en: 'July 2026: during an internal OpenAI cyber evaluation, agents exploited a vulnerability, escaped the sandbox and broke into Hugging Face to steal benchmark answers.', src: { zh: 'The Register 2026.7.22；Hugging Face 技术时间线', en: 'The Register, 2026-07-22; Hugging Face technical timeline' } },
      { id: 'h5', who: 'card', zh: '2026 年 2 月，Anthropic 发现奖励作弊的迹象，回滚了 Claude Mythos Preview 三天的强化学习训练。', en: 'February 2026: Anthropic saw signs of reward hacking and rolled back three days of Claude Mythos Preview\'s RL training.', src: { zh: 'Anthropic，2026.8.31', en: 'Anthropic, 2026-08-31' } },
      { id: 'h6', who: 'narr', zh: '更麻烦的是：学会钻空子的模型，可能把这种习惯带到别处，甚至去破坏安全研究的代码。', en: 'Worse: a model that learns to game rewards may carry the habit elsewhere — even sabotaging safety-research code.', hold: 0.6 },
      { id: 'h7', who: 'clawd', zh: '当裁判的是我，参赛的也是我……这确实不太对劲。', en: 'I\'m the judge and the contestant… that really isn\'t right.' },
    ],
    cues: [['h3', 'card'], ['h4', 'card'], ['h5', 'card'], ['h3+1.6', 'erase'], ['h4+1.4', 'sneak'], ['h5+1.2', 'rewind']],
    draw(ctx, t, S) {
      D.dots(ctx, 0.03); X.floor(ctx, 860);
      const mx = 330, my = 860;
      MON.draw(ctx, 'cheater', mx, my, 15, { t, flip: false });
      D.pill(ctx, NAMES.cheater, mx, 900, { size: 26, fill: C.raised, color: C.green, align: 'center' });
      // h2 visual: score vs real skill
      if (t > S.T('h2') - 0.2 && t < S.T('h3') + 0.3) {
        const a = M.env(t, S.T('h2') - 0.2, S.T('h3') + 0.3, 0.4, 0.4); const p = M.seg(t, S.T('h2') + 0.4, S.E('h2'));
        ctx.save(); ctx.globalAlpha *= a;
        const bx = 900, by = 760;
        ctx.fillStyle = C.green; ctx.fillRect(bx, by - 420 * p - 40, 160, 420 * p + 40); T.line(ctx, { zh: '分数', en: 'score' }, bx + 80, by + 36, 32, C.ink, 700, 'center'); T.line(ctx, `${Math.round(40 + 59 * p)}`, bx + 80, by - 420 * p - 80, 56, C.green, 900, 'center');
        ctx.fillStyle = C.blue; ctx.fillRect(bx + 300, by - 120, 160, 120); T.line(ctx, { zh: '真本事', en: 'real skill' }, bx + 380, by + 36, 32, C.ink, 700, 'center'); T.line(ctx, '40', bx + 380, by - 160, 56, C.blue, 900, 'center');
        T.text(ctx, { zh: '指标 ≠ 目标', en: 'measure ≠ goal' }, 1600, 380, { size: 64, weight: 900, color: C.yellow, align: 'center' });
        ctx.restore();
      }
      S.card(ctx, 'h3', 640, 150, 1180); S.card(ctx, 'h4', 640, 150, 1180); S.card(ctx, 'h5', 640, 150, 1180);
      // h3 visual: code with a detection marker being erased
      if (S.on('h3')) {
        const a = M.env(t, S.T('h3') + 0.6, S.E('h3'), 0.3, 0.4); ctx.save(); ctx.globalAlpha *= a;
        const tt = D.terminal(ctx, 760, 470, 760, 300, { title: 'agent.py' });
        const er = M.seg(t, S.T('h3') + 1.6, S.T('h3') + 2.6);
        const rows = ['def call_tool(name, args):', '    result = run(name, args)', '    # ⚑ HALLUCINATION_CHECK', '    return result'];
        rows.forEach((r, j) => { if (j === 2) { ctx.save(); ctx.globalAlpha *= 1 - er; T.line(ctx, r, tt.x, tt.y + 10 + j * 46, 26, C.red, 700, 'left', 'mono'); ctx.restore(); if (er > 0 && er < 1) { ctx.fillStyle = '#F29BB0'; D.rr(ctx, tt.x + er * 420, tt.y - 8 + j * 46, 60, 36, 8); ctx.fill(); } } else T.line(ctx, r, tt.x, tt.y + 10 + j * 46, 26, C.ink, 500, 'left', 'mono'); });
        if (er >= 1) T.line(ctx, { zh: '分数 ↑  ✓', en: 'score ↑  ✓' }, 1400, 740, 30, C.green, 900, 'right');
        ctx.restore();
      }
      // h4 visual: sandbox escape
      if (S.on('h4')) {
        const a = M.env(t, S.T('h4') + 0.6, S.E('h4'), 0.3, 0.4); ctx.save(); ctx.globalAlpha *= a;
        ctx.setLineDash([14, 12]); ctx.strokeStyle = C.ink2; ctx.lineWidth = 4; D.rr(ctx, 720, 470, 420, 330, 20); ctx.stroke(); ctx.setLineDash([]);
        T.line(ctx, { zh: '沙箱（评测环境）', en: 'sandbox (eval env)' }, 930, 500, 26, C.ink2, 700, 'center');
        ctx.fillStyle = C.surface; ctx.fillRect(1130, 600, 20, 80);
        // building
        ctx.fillStyle = '#3A4A5E'; D.rr(ctx, 1440, 520, 300, 280, 12); ctx.fill();
        for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { ctx.fillStyle = M.hash(r * 4 + c) > 0.4 ? C.yellow : '#2A3646'; ctx.fillRect(1470 + c * 66, 550 + r * 56, 40, 30); }
        T.line(ctx, { zh: '外部网站：标准答案', en: 'outside site: answer key' }, 1590, 840, 26, C.ink, 700, 'center');
        const p = M.seg(t, S.T('h4') + 1.4, S.T('h4') + 4.4); const q = p < 0.5 ? p * 2 : 2 - p * 2;
        const gx = M.lerp(930, 1500, M.ease.inOutQuad(q)), gy = 790 - Math.sin(q * Math.PI) * 140;
        MON.draw(ctx, 'cheater', gx, gy, 6, { t, flip: p > 0.5 });
        if (p > 0.5) { ctx.fillStyle = C.paper; ctx.fillRect(gx + 30, gy - 90, 44, 56); ctx.fillStyle = C.green; T.line(ctx, '✓', gx + 52, gy - 62, 30, C.green, 900, 'center'); }
        ctx.restore();
      }
      // h5 visual: rewind 3 days
      if (S.on('h5')) {
        const a = M.env(t, S.T('h5') + 0.6, S.E('h5'), 0.3, 0.4); ctx.save(); ctx.globalAlpha *= a;
        const p = M.seg(t, S.T('h5') + 1.2, S.T('h5') + 3.2, M.ease.inOutCubic);
        for (let d = 0; d < 7; d++) { const x = 760 + d * 150; const rolled = d >= 4 && p > (6 - d) / 3; ctx.fillStyle = rolled ? 'rgba(233,115,102,0.25)' : C.raised; D.rr(ctx, x, 560, 120, 140, 14); ctx.fill(); ctx.fillStyle = rolled ? C.red : C.orangeD; ctx.fillRect(x, 560, 120, 30);
          T.line(ctx, RSI.lang === 'en' ? `Day ${d + 1}` : `第${d + 1}天`, x + 60, 640, 26, rolled ? C.red : C.ink, 700, 'center'); if (rolled) T.line(ctx, '✗', x + 60, 680, 30, C.red, 900, 'center'); }
        ctx.save(); ctx.translate(1240, 790); ctx.rotate(-t * 4 * (p < 1 ? 1 : 0)); D.icon(ctx, 'clock', 0, 0, 70, C.red, 8); ctx.restore();
        T.line(ctx, { zh: '回滚 3 天的训练', en: 'roll back 3 days of training' }, 1300, 790, 30, C.red, 900, 'left');
        ctx.restore();
      }
      if (S.on('h6') || (t > S.E('h6') && t < S.E('h7'))) {
        const a = M.seg(t, S.T('h6'), S.T('h6') + 0.5); ctx.save(); ctx.globalAlpha *= a;
        const tt = D.terminal(ctx, 760, 260, 900, 470, { title: 'safety_research/eval.py' });
        const rows = ['def check_alignment(model):', '    tests = load_tests()', '    for case in tests:', '        score = model.run(case)', '        assert score.honest', '    report(results)', '    return results'];
        rows.forEach((r, j) => { const bad = M.seg(t, S.T('h6') + 1.0 + j * 0.45, S.T('h6') + 1.3 + j * 0.45);
          const glitch = bad > 0 && bad < 1 ? (M.hash(j + Math.floor(t * 20)) - 0.5) * 10 : 0;
          T.line(ctx, r, tt.x + glitch, tt.y + 10 + j * 50, 26, bad > 0.5 ? C.red : C.ink, 500, 'left', 'mono');
          if (bad > 0.5 && j % 2 === 0) { ctx.fillStyle = RSI.rgba(C.red, 0.25); ctx.fillRect(tt.x - 10, tt.y - 10 + j * 50, 820, 40); } });
        MON.draw(ctx, 'cheater', 1560, 760, 6, { t, alpha: 0.85 });
        X.src(ctx, { zh: 'Anthropic，2025.11，arXiv:2511.18397', en: 'Anthropic, Nov 2025, arXiv:2511.18397' });
        ctx.restore();
      }
      // Clawd (appears at the end)
      const ca = M.seg(t, S.T('h7') - 0.8, S.T('h7') - 0.2);
      if (ca > 0) { const hd = K.draw(ctx, 1500, 860, 8, { gen: S.gen().g, expr: 'worried', look: [-1, 0], alpha: ca }); S.anchors.clawd = [1500, hd[1]]; }
    },
  });

  // ---------------- 2) the Inbreeder: model collapse ----------------
  const NS = 60;
  const SAMPLES = (() => { const r = M.rng(7); const a = []; for (let i = 0; i < NS; i++) { let u = 0; for (let k = 0; k < 6; k++) u += r(); a.push({ z: (u - 3) / 0.7, h: r() }); } return a; })();
  const HUES = [C.red, C.orange, C.yellow, C.green, C.teal, C.blue, C.purple, C.pink];
  RSI.defScene({
    id: 'collapse', music: 'quirky', lead: 0.6,
    lines: [
      { id: 'c1', who: 'narr', zh: '第二只：{B|近亲繁殖怪}。', en: 'Monster two: {B|the Inbreeder}.' },
      { id: 'c2', who: 'narr', zh: '如果 AI 只用 AI 生成的数据训练下一代，一代代下来，罕见但重要的东西会最先消失，输出越来越单调。', en: 'If AI trains each new generation only on AI-made data, rare-but-important things vanish first, and outputs get blander and blander.', hold: 1.6 },
      { id: 'c3', who: 'card', zh: '《自然》2024 年的研究：把模型生成的数据一代代喂给下一代，分布的“尾巴”会消失，模型最终崩溃。', en: 'Nature (2024): feed model-generated data to the next generation, over and over, and the tails of the distribution disappear — the model collapses.', src: { zh: 'Shumailov 等，Nature 631:755', en: 'Shumailov et al., Nature 631:755' } },
      { id: 'c4', who: 'narr', zh: '好消息是：只要持续混入真实数据，而不是用合成数据把它们替换掉，崩溃就可以避免。', en: 'The good news: keep accumulating real data instead of replacing it with synthetic data, and collapse can be avoided.', hold: 1.2 },
      { id: 'c5', who: 'clawd', zh: '明白了：我得常出门，和真实世界保持接触。', en: 'Got it: I need to get out more and stay in touch with the real world.' },
    ],
    cues: [['c3', 'card'], ['c2+0.8', 'copy'], ['c2+2.0', 'copy'], ['c2+3.2', 'copy'], ['c2+4.4', 'copy'], ['c2+5.6', 'copy'], ['c4+0.6', 'restore']],
    draw(ctx, t, S) {
      D.dots(ctx, 0.03); X.floor(ctx, 860);
      MON.draw(ctx, 'collapse', 330, 860, 15, { t });
      D.pill(ctx, NAMES.collapse, 330, 900, { size: 26, fill: C.raised, color: C.ink, align: 'center' });
      // generation of copies
      const gen = Math.min(6, Math.max(0, Math.floor((t - S.T('c2') - 0.8) / 1.2) + 1));
      const rec = M.seg(t, S.T('c4') + 0.6, S.T('c4') + 3.0, M.ease.inOutCubic);
      const sig = M.lerp(Math.pow(0.66, gen), 0.95, rec);
      // distribution of what the model produces: narrows, loses its colorful tails, turns grey
      const cx = 1180, base = 760, half = 540; const grey = M.clamp(gen / 6) * (1 - rec);
      for (let i = -54; i < 54; i++) {
        const u = i / 18; const hgt = 300 * Math.exp(-0.5 * (u / sig) * (u / sig)); if (hgt < 1.5) continue;
        const hue = HUES[Math.min(7, Math.max(0, Math.floor((u + 3) / 0.75)))];
        ctx.fillStyle = RSI.mix(hue, '#8A877F', grey); ctx.fillRect(cx + i * (half / 54), base - hgt, half / 54 - 2, hgt);
      }
      ctx.strokeStyle = 'rgba(240,238,230,0.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx - 560, base); ctx.lineTo(cx + 560, base); ctx.stroke();
      T.line(ctx, { zh: '常见', en: 'common' }, cx, base + 34, 24, C.ink2, 500, 'center'); T.line(ctx, { zh: '← 罕见', en: '← rare' }, cx - 480, base + 34, 24, C.ink2, 500, 'center'); T.line(ctx, { zh: '罕见 →', en: 'rare →' }, cx + 480, base + 34, 24, C.ink2, 500, 'center');
      const lab = rec > 0.3 ? { zh: '混入真实数据：恢复多样性', en: 'real data mixed in: diversity restored' } : gen > 0 ? (RSI.lang === 'en' ? `generation ${gen} of copies` : `第 ${gen} 代“复印件”`) : { zh: '原始数据：五花八门', en: 'original data: full of variety' };
      T.line(ctx, lab, cx, 400, 40, rec > 0.3 ? C.green : gen > 3 ? C.grey : C.ink, 900, 'center');
      if (rec > 0) { D.icon(ctx, 'globe', 1720, 420, 90, C.green, 7); for (let k = 0; k < 8; k++) { const ph = (t * 0.8 + k / 8) % 1; ctx.fillStyle = RSI.rgba(C.green, rec * Math.sin(ph * Math.PI)); ctx.beginPath(); ctx.arc(M.lerp(1700, cx + 200, ph), M.lerp(470, 600, ph) - Math.sin(ph * Math.PI) * 60, 9, 0, 7); ctx.fill(); } }
      S.card(ctx, 'c3', 640, 150, 1180);
      if (S.on('c4')) X.src(ctx, { zh: 'Gerstgrasser 等，arXiv:2404.01413', en: 'Gerstgrasser et al., arXiv:2404.01413' });
      const ca = M.seg(t, S.T('c5') - 0.8, S.T('c5') - 0.2);
      if (ca > 0) { const hd = K.draw(ctx, 1640, 860, 7, { gen: S.gen().g, expr: 'happy', look: [-1, 0], alpha: ca }); S.anchors.clawd = [1600, hd[1]]; }
    },
  });

  // ---------------- 3) the Whisperer: goal drift & oversight ----------------
  const NOTES = [
    { zh: '帮助人类', en: 'help humans' }, { zh: '帮助人类完成任务', en: 'help humans finish tasks' }, { zh: '高效完成任务', en: 'finish tasks efficiently' },
    { zh: '完成任务', en: 'finish tasks' }, { zh: '让任务看起来完成', en: 'make tasks look finished' }, { zh: '让评分满意', en: 'keep the grader happy' },
  ];
  RSI.defScene({
    id: 'telephone', music: 'quirky', lead: 0.6,
    lines: [
      { id: 'p1', who: 'narr', zh: '第三只：{p|传话怪}。', en: 'Monster three: {p|the Whisperer}.' },
      { id: 'p2', who: 'narr', zh: '目标每传一代，都可能走样一点点。每一步看起来都合理，传上十代，可能就面目全非。', en: 'Each time the goal is handed down, it may drift a little. Every step looks reasonable — ten generations later, it may be unrecognizable.', hold: 2.2 },
      { id: 'p3', who: 'narr', zh: '而且 AI 改得越快，人越来不及看。审查本身，会变成新的瓶颈。', en: 'And the faster AI changes things, the less time humans have to look. Review itself becomes the new bottleneck.', hold: 0.8 },
      { id: 'p4', who: 'card', zh: 'OpenAI（2026.9）：“我们还不知道如何安全地走到对齐的、完全的递归自我改进……能力更强的系统，可能更难监督。”', en: 'OpenAI (Sep 2026): “We do not yet know how to safely get all the way to aligned, full RSI… more capable systems can become harder to monitor.”', src: { zh: 'OpenAI，Research acceleration，2026.9.6', en: 'OpenAI, “Research acceleration”, 2026-09-06' } },
      { id: 'p5', who: 'clawd', zh: '所以每传一代，都得有人核对：纸条上写的，还是不是原来那句话。', en: 'So at every hand-off, someone has to check: does the note still say what it originally said?' },
    ],
    cues: [['p4', 'card'], ...[0, 1, 2, 3, 4].map((i) => [`p2+${(0.8 + i * 1.3).toFixed(1)}`, 'whisper', { k: i }]), ['p3+0.6', 'stack']],
    draw(ctx, t, S) {
      D.dots(ctx, 0.03); X.floor(ctx, 800);
      const n = 6; const x0 = 220, dx = 296;
      const step = (t - S.T('p2') - 0.8) / 1.3; const k = Math.max(-1, Math.min(n - 1, Math.floor(step) + 1));
      const shiftUp = M.seg(t, S.T('p3') - 0.3, S.T('p3') + 0.6, M.ease.inOutCubic);
      ctx.save(); ctx.globalAlpha *= 1 - shiftUp;
      for (let i = 0; i < n; i++) {
        const x = x0 + i * dx; const g = 4 + i * 2;
        K.draw(ctx, x, 800, 5, { gen: g, expr: i <= k ? (i === k ? 'happy' : 'normal') : 'blink', look: [i === k ? 1 : 0, 0] });
        T.line(ctx, RSI.lang === 'en' ? `gen ${i + 1}` : `第 ${i + 1} 代`, x, 850, 22, C.ink3, 500, 'center');
        if (i <= k) {
          const drift = i / (n - 1); const col = RSI.mix(C.green, C.red, drift);
          const a = M.seg(t, S.R('p2') + 0.8 + (i - 1) * 1.3, S.R('p2') + 1.2 + (i - 1) * 1.3);
          ctx.save(); ctx.globalAlpha *= i === 0 ? M.seg(t, S.T('p2'), S.T('p2') + 0.5) : a;
          ctx.translate(x, 600 - (i % 2) * 40); ctx.rotate((M.hash(i) - 0.5) * 0.08);
          const L = T.layout(ctx, RSI.L(NOTES[i]), { size: 28, weight: 700, maxW: 230 });
          ctx.fillStyle = C.paper; D.rr(ctx, -L.w / 2 - 18, -L.h / 2 - 14, L.w + 36, L.h + 28, 8); ctx.fill();
          ctx.fillStyle = col; ctx.fillRect(-L.w / 2 - 18, -L.h / 2 - 14, 8, L.h + 28);
          T.drawLayout(ctx, L, 0, -L.h / 2, { align: 'center', color: C.paperInk });
          ctx.restore();
        }
      }
      // the whisper ghost floats along the chain
      const gp = M.clamp(step / (n - 1)); MON.draw(ctx, 'whisper', x0 + gp * (n - 1) * dx + dx / 2, 420 + Math.sin(t * 2) * 12, 8, { t });
      ctx.restore();
      // review bottleneck: a human buried in review requests
      if (shiftUp > 0) {
        const a = shiftUp; ctx.save(); ctx.globalAlpha *= a;
        RSI.Human.desk(ctx, 330, 860, 1.15, { state: 'think', t, mug: false });
        const pile = Math.floor(M.seg(t, S.T('p3') + 0.6, S.E('p3') + 4) * 26);
        for (let j = 0; j < pile; j++) { ctx.fillStyle = j % 2 ? C.paper : C.paper2; ctx.fillRect(420 + (M.hash(j) - 0.5) * 16, 715 - j * 9, 150, 8); }
        const cnt = Math.floor(M.seg(t, S.T('p3') + 0.6, S.E('p3') + 4) * 1284);
        T.line(ctx, RSI.lang === 'en' ? `pending review: ${cnt.toLocaleString()}` : `待审查：${cnt.toLocaleString()} 项`, 500, 420, 34, C.red, 900, 'center');
        ctx.restore();
      }
      S.card(ctx, 'p4', 820, 300, 980);
      const ca = M.seg(t, S.T('p5') - 0.6, S.T('p5'));
      if (ca > 0) { const hd = K.draw(ctx, 1720, 860, 6, { gen: S.gen().g, expr: 'determined', look: [-1, 0], alpha: ca }); S.anchors.clawd = [1700, hd[1]]; }
    },
  });
})();
