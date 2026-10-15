/* 第 2 集《爬到第几级了？》: a simplified five-rung ladder of self-improvement, with 2025–2026 evidence.
   Each rung = one more generation of Clawd (HUD). Quizzes (curiosity gaps) on rungs 2 and 4. */
(function () {
  'use strict';
  const RSI = window.RSI, C = RSI.C, M = RSI.M, D = RSI.D, T = RSI.T, K = RSI.Clawd, X = RSI.X;
  const W = RSI.W, H = RSI.H;
  const RUNGS = [
    { zh: '改进做事方法', en: 'Improve how it works', sub: { zh: '提示词 · 代码 · 工作流', en: 'prompts · code · workflows' } },
    { zh: '自己出题陪练', en: 'Make its own practice', sub: { zh: '合成数据 · 自我对弈', en: 'synthetic data · self-play' } },
    { zh: '自己当裁判', en: 'Be its own judge', sub: { zh: 'AI 给 AI 打分', en: 'AI grading AI' } },
    { zh: '改进工具与基建', en: 'Improve tools & infra', sub: { zh: '芯片调度 · 训练代码 · 推理集群', en: 'kernels · training code · clusters' } },
    { zh: '自己做 AI 研究', en: 'Do AI research itself', sub: { zh: '提想法 · 跑实验 · 下结论', en: 'ideas · experiments · conclusions' } },
  ];
  const LX = 210, LW = 150, BOT = 920, STEP = 128;
  const rungY = (i) => BOT - i * STEP; // i = 0 ground … 5
  RSI.drawLadder = (ctx, t, o = {}) => {
    const build = o.build == null ? 1 : o.build; const cur = o.cur || 0;
    ctx.save();
    const topY = rungY(5) - 70; const railH = (BOT - topY) * M.clamp(build * 1.4);
    ctx.strokeStyle = '#8C7A63'; ctx.lineWidth = 12; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(LX, BOT); ctx.lineTo(LX, BOT - railH); ctx.moveTo(LX + LW, BOT); ctx.lineTo(LX + LW, BOT - railH); ctx.stroke();
    for (let i = 1; i <= 5; i++) {
      const a = M.clamp((build - 0.15 * i) / 0.2); if (a <= 0) continue;
      const y = rungY(i); const on = i === cur, done = i < cur;
      ctx.globalAlpha = a; ctx.strokeStyle = on ? C.orange : done ? '#B49A78' : '#6E604F'; ctx.lineWidth = on ? 12 : 10;
      ctx.beginPath(); ctx.moveTo(LX, y); ctx.lineTo(LX + LW, y); ctx.stroke();
      const lx = LX + LW + 34;
      ctx.fillStyle = on ? C.orange : done ? C.raised : C.surface; ctx.beginPath(); ctx.arc(lx + 18, y - 4, 20, 0, 7); ctx.fill();
      T.line(ctx, String(i), lx + 18, y - 3, 24, on ? '#1b1a18' : C.ink2, 900, 'center');
      T.line(ctx, RUNGS[i - 1], lx + 50, y - 4, RSI.lang === 'en' ? 21 : on ? 27 : 25, on ? C.ink : done ? C.ink2 : C.ink3, on ? 900 : 500, 'left');
      if (on) D.glow(ctx, LX + LW / 2, y, 160, C.orange, 0.35);
    }
    ctx.globalAlpha = M.clamp((build - 0.9) / 0.1);
    // the top: closed loop?
    const ty = rungY(5) - 112; const pulse = 0.5 + 0.5 * Math.sin(t * 2);
    ctx.setLineDash([10, 10]); ctx.strokeStyle = RSI.rgba(C.yellow, 0.55 + 0.3 * pulse); ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(LX + LW / 2, ty, 40, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    T.line(ctx, '?', LX + LW / 2, ty + 2, 46, C.yellow, 900, 'center');
    T.line(ctx, { zh: '闭环？', en: 'Closed loop?' }, LX + LW + 34, ty, 30, C.yellow, 900, 'left');
    ctx.restore();
  };
  /** Clawd on the ladder; climbs from rung a to b during [t0, t0+0.9] */
  const ladderClawd = (ctx, t, S, a, b, t0, o = {}) => {
    const p = M.seg(t, t0, t0 + 0.9);
    const y = M.lerp(rungY(a), rungY(b), M.ease.inOutCubic(p)) - Math.sin(p * Math.PI) * 50;
    const land = t - (t0 + 0.9); let sx = 1, sy = 1; if (land > 0 && land < 0.25) { const k = 1 - land / 0.25; sx = 1 + 0.15 * k; sy = 1 - 0.15 * k; }
    const g = S.gen().g;
    const head = K.draw(ctx, LX + LW / 2, y, 5.2, Object.assign({ gen: g, expr: X.blink(t, g) ? 'blink' : 'normal', armL: p > 0 && p < 1 ? 0.9 : 0, armR: p > 0 && p < 1 ? 0.9 : 0, sx, sy, look: [0.8, 0] }, o));
    S.anchors.clawd = [LX + LW / 2 + 20, head[1]];
    S.sides.clawd = 'right';
    return head;
  };
  const header = (ctx, t, i, x = 640, y = 150) => {
    const a = M.seg(t, 0.2, 0.8, M.ease.outCubic);
    ctx.save(); ctx.globalAlpha *= a; ctx.translate((1 - a) * 30, 0);
    D.pill(ctx, RSI.lang === 'en' ? `Rung ${i}` : `第 ${i} 级`, x, y + 4, { size: 26, fill: C.orange });
    T.line(ctx, RUNGS[i - 1], x + (RSI.lang === 'en' ? 150 : 150), y + 2, 54, C.ink, 900, 'left');
    T.line(ctx, RUNGS[i - 1].sub, x + 2, y + 66, 28, C.ink2, 400, 'left');
    ctx.restore();
  };

  RSI.defScene({
    id: 'ladder', music: 'build', lead: 0.8,
    lines: [
      { id: 'a1', who: 'narr', zh: '“改进自己”不是一个开关，而是一架梯子——越往上，AI 能改动的东西越核心。', en: '“Improving itself” isn’t a switch, it’s a ladder — the higher you go, the more core the things AI can change.', hold: 0.6 },
      { id: 'a2', who: 'narr', zh: '为了好懂，我们把它简化成五级。', en: 'To keep it simple, we\'ll use five rungs.' },
      { id: 'a3', who: 'clawd', zh: '我先站在地面上。每学会一级本事，我就升一代——看右上角的数字！', en: 'I’ll start on the ground. Each rung I master makes me a new generation — watch the number in the top-right!', hold: 0.9 },
    ],
    draw(ctx, t, S) {
      D.dots(ctx, 0.03);
      RSI.drawLadder(ctx, t, { build: M.seg(t, 0.3, 4.0), cur: 0 });
      ladderClawd(ctx, t, S, 0, 0, -9);
      // overview on the right
      const a = M.seg(t, 2.0, 2.8);
      ctx.save(); ctx.globalAlpha *= a;
      T.text(ctx, { zh: '越往上 ↑', en: 'Higher up ↑' }, 900, 300, { size: 64, weight: 900, color: C.orange });
      T.text(ctx, { zh: '改动的东西越核心\n需要人插手的地方越少', en: 'the more core the changes\nthe less humans need to step in' }, 900, 410, { size: 44, weight: 500, lh: 1.6 });
      T.text(ctx, { zh: '注：五级是本片为讲解做的简化分类，并非行业标准。', en: 'Note: the five rungs are a simplification made for this film, not an industry standard.' }, 900, 640, { size: 24, weight: 400, color: C.ink3, maxW: 900 });
      ctx.restore();
      // pointer to the generation counter (top-right)
      const pa = M.seg(t, S.T('a3') + 1.5, S.T('a3') + 2.0, M.ease.outCubic) * (1 - M.seg(t, S.E('a3') + 0.2, S.E('a3') + 0.6));
      if (pa > 0) {
        const bob = Math.sin(t * 6) * 7; ctx.save(); ctx.globalAlpha *= pa;
        D.arrow(ctx, 1530, 262 + bob, 1640 + bob * 0.4, 128 + bob, { color: C.yellow, w: 7, head: 26 });
        D.pill(ctx, { zh: '第几代', en: 'generation' }, 1510, 300 + bob, { size: 30, fill: C.yellow, align: 'center' });
        ctx.restore();
      }
    },
    cues: [['a3+1.5', 'pop']],
  });

  const rungScene = (i, def) => RSI.defScene(Object.assign({
    music: 'build', lead: 1.4, rung: i,
    gen: [[1.3, 3 + i]], cues: [[0.4, 'climb'], [1.3, 'rezUp']].concat(def.cues || []),
  }, def, {
    draw(ctx, t, S) {
      D.dots(ctx, 0.03);
      RSI.drawLadder(ctx, t, { cur: i });
      ladderClawd(ctx, t, S, i - 1, i, 0.4, def.clawd ? def.clawd(t, S) : {});
      ctx.save(); ctx.translate(50, 0);
      header(ctx, t, i);
      def.draw(ctx, t, S);
      ctx.restore();
    },
  }));

  // ---- Rung 1: autoresearch loop + DGM + AIDE² ----
  rungScene(1, {
    id: 'r1',
    lines: [
      { id: 'r1a', who: 'narr', zh: '第 1 级：改进自己的做事方法。', en: 'Rung 1: improving how it does its work.' },
      { id: 'r1b', who: 'narr', zh: '2026 年 3 月，曾任特斯拉 AI 负责人的 Karpathy 开源了 autoresearch：AI 改代码、训练 5 分钟、看分数，好就留下，差就扔掉，整夜循环。', en: 'In March 2026, Andrej Karpathy — formerly Tesla’s head of AI — open-sourced autoresearch: an AI edits code, trains for 5 minutes, checks the score, keeps it or throws it away, all night long.', hold: 0.6 },
      { id: 'r1j', who: 'narr', zh: '他还开玩笑：将来的 AI 会说，代码已经进化到第 10,205 代——反正也没人看得懂了。', en: 'He even joked that future agents will claim the code is on its 10,205th generation — not that anyone can still read it.' },
      { id: 'r1c', who: 'card', zh: '达尔文-哥德尔机（2025）：AI 反复改写自己的代码，在 SWE-bench（一套修真实代码 bug 的考试）上，成绩从 20% 提到 50%。', en: 'Darwin Gödel Machine (2025): an agent that keeps rewriting its own code raised its score on SWE-bench (a test of fixing real-world code bugs) from 20% to 50%.', src: { zh: 'Zhang 等，arXiv:2505.22954', en: 'Zhang et al., arXiv:2505.22954' } },
      { id: 'r1d', who: 'card', zh: '开头那场比赛，就是 Weco 公司的 AIDE²（2026）：研究智能体（会自己做实验的 AI）改进自己 8 天，胜过人类打磨 2 年的版本。', en: 'The race from the opening is Weco’s AIDE² (2026): a research agent (an AI that runs its own experiments) improved itself for 8 days and beat the version humans polished for 2 years.', src: { zh: 'Weco AI，arXiv:2609.26457（公司自报）', en: 'Weco AI, arXiv:2609.26457 (self-reported)' } },
      { id: 'r1e', who: 'clawd', zh: '改进自己的做事方法？这个，我也会。', en: 'Improving how I work? That, I can do.' },
    ],
    cues: [['r1c', 'card'], ['r1d', 'card']],
    draw(ctx, t, S) {
      // autoresearch terminal
      const x = 640, y = 270, w = 600, h = 400;
      const tt = D.terminal(ctx, x, y, w, h, { title: 'autoresearch · train.py' });
      const rate = 2.2; const n = Math.max(0, Math.floor((t - S.T('r1b')) * rate));
      const rows = [];
      let best = 1.012;
      for (let k = 0; k < n; k++) { const v = 1.012 - k * 0.0021 + (M.hash(k + 3) - 0.62) * 0.012; const keep = v < best; if (keep) best = v; rows.push([k + 1, v, keep]); }
      const vis = rows.slice(-8);
      ctx.save(); ctx.beginPath(); ctx.rect(x, y + 50, w, h - 60); ctx.clip();
      vis.forEach((r, j) => {
        const yy = tt.y + j * 40 + 8;
        T.line(ctx, `#${String(r[0]).padStart(3, '0')}`, tt.x, yy, 24, C.ink3, 500, 'left', 'mono');
        T.line(ctx, `val_bpb ${r[1].toFixed(4)}`, tt.x + 90, yy, 24, C.ink, 500, 'left', 'mono');
        T.line(ctx, r[2] ? (RSI.lang === 'en' ? 'keep ✓' : '留下 ✓') : (RSI.lang === 'en' ? 'discard ✗' : '扔掉 ✗'), tt.x + 340, yy, 24, r[2] ? C.green : C.red, 700, 'left');
      });
      ctx.restore();
      if (t > S.T('r1b')) { D.icon(ctx, 'moon', x + w - 40, y + 24, 26, C.purple, 6); T.line(ctx, { zh: '5 分钟 / 次', en: '5 min / run' }, x + w - 70, y + 24, 20, C.ink3, 500, 'right'); }
      // the 10,205th generation joke → HUD override
      if (t > S.T('r1j') + 1.2 && t < S.E('r1j')) { S.hud = { text: '10205', color: C.yellow }; }
      // cards
      S.card(ctx, 'r1c', 1280, 270, 520);
      S.card(ctx, 'r1d', 1280, 270, 520);
      if (t > S.T('r1c')) {
        const p = M.seg(t, S.T('r1c') + 0.6, S.T('r1c') + 2.0, M.ease.outCubic);
        const a = 1 - M.seg(t, S.E('r1c') - 0.4, S.E('r1c'));
        if (a > 0) {
          ctx.save(); ctx.globalAlpha *= a; const bx = 1300, by = 700;
          T.line(ctx, 'SWE-bench', bx, by - 20, 24, C.ink2, 700, 'left');
          X.bar(ctx, bx, by + 10, 500, 30, 0.2, C.blue); T.line(ctx, '20%', bx + 520, by + 25, 26, C.blue, 700, 'left');
          X.bar(ctx, bx, by + 60, 500, 30, 0.2 + 0.3 * p, C.orange); T.line(ctx, `${Math.round(20 + 30 * p)}%`, bx + 520, by + 75, 26, C.orange, 700, 'left');
          ctx.restore();
        }
      }
      if (t > S.T('r1d') + 0.8) {
        const a = M.env(t, S.T('r1d') + 0.8, S.E('r1d'), 0.4, 0.4); ctx.save(); ctx.globalAlpha *= a;
        T.line(ctx, { zh: '8 天', en: '8 days' }, 1390, 750, 64, C.orange, 900, 'center'); T.line(ctx, 'vs', 1560, 752, 32, C.ink3, 700, 'center'); T.line(ctx, { zh: '2 年', en: '2 years' }, 1720, 750, 64, C.blue, 900, 'center');
        T.line(ctx, { zh: 'AI 自己改进', en: 'AI self-improving' }, 1390, 812, 24, C.ink2, 500, 'center'); T.line(ctx, { zh: '人类打磨', en: 'human-built' }, 1720, 812, 24, C.ink2, 500, 'center');
        ctx.restore();
      }
    },
  });

  // ---- Rung 2: self-play ----
  rungScene(2, {
    id: 'r2',
    lines: [
      { id: 'r2a', who: 'narr', zh: '第 2 级：自己出题、自己当陪练。', en: 'Rung 2: making its own practice problems — and being its own sparring partner.' },
      { id: 'r2b', who: 'narr', zh: '2017 年的 AlphaGo Zero，不看人类棋谱，只跟自己下棋。', en: 'In 2017, AlphaGo Zero studied no human games. It only played against itself.', hold: 0.3 },
      { id: 'r2q', who: 'clawd', zh: '只跟自己下……要练多久，才能赢过当年打败李世石的 AlphaGo？', en: 'Only itself… so how long until it beats the AlphaGo that defeated Lee Sedol?' },
      { id: 'r2r', who: 'narr', zh: '答案是：3 天。3 天后，它以 100 比 0，完胜那个版本。', en: 'The answer: three days. After 3 days, it beat that version 100 to 0.', at: 'r2q$+2.7', hold: 0.6 },
      { id: 'r2c', who: 'narr', zh: '今天的大模型也用类似的办法：自己出题、自己解答，挑出做对的，再拿来训练自己。', en: 'Today\'s models do something similar: write problems, solve them, keep the correct ones, and train on them.', hold: 0.6 },
      { id: 'r2d', who: 'clawd', zh: '自己出题自己做……这个我擅长。', en: 'Set my own homework and do it… I\'m good at that.' },
    ],
    cues: [['r2q+0.8', 'quizIn'], ...[0, 1, 2].map((k) => [(b) => b.r2q.t + 1.2 + ((b.r2r.t + 0.9) - (b.r2q.t + 1.2)) * k / 3, 'tick']), [(b) => b.r2r.t + 0.9, 'ding'], [(b) => b.r2r.t + 2.6, 'score']],
    draw(ctx, t, S) {
      const bx = 700, by = 290, bs = 480, n = 19, cell = bs / (n - 1);
      ctx.save(); ctx.fillStyle = '#C9A46A'; D.rr(ctx, bx - 30, by - 30, bs + 60, bs + 60, 12); ctx.fill();
      ctx.strokeStyle = 'rgba(40,30,20,0.6)'; ctx.lineWidth = 2;
      for (let i = 0; i < n; i++) { ctx.beginPath(); ctx.moveTo(bx, by + i * cell); ctx.lineTo(bx + bs, by + i * cell); ctx.moveTo(bx + i * cell, by); ctx.lineTo(bx + i * cell, by + bs); ctx.stroke(); }
      const games = Math.max(0, (t - S.T('r2b')) * 1.6); const g = Math.floor(games); const mv = Math.floor((games - g) * 60);
      for (let k = 0; k < mv; k++) {
        const r = M.rng(g * 977 + k * 13 + 5); const ix = Math.floor(r() * n), iy = Math.floor(r() * n);
        ctx.fillStyle = k % 2 ? '#F4F1E6' : '#1E1D1B'; ctx.beginPath(); ctx.arc(bx + ix * cell, by + iy * cell, cell * 0.45, 0, 7); ctx.fill();
      }
      ctx.restore();
      // two Clawds playing
      K.draw(ctx, bx - 90, by + bs + 20, 3.2, { gen: S.gen().g, expr: 'determined', look: [1, -0.4], shadow: false });
      K.draw(ctx, bx + bs + 90, by + bs + 20, 3.2, { gen: S.gen().g, expr: 'determined', look: [-1, -0.4], shadow: false, color: '#E8E2D2' });
      const self = { zh: `自我对弈：第 ${(g * 1237 + mv * 3).toLocaleString()} 局`, en: `self-play game #${(g * 1237 + mv * 3).toLocaleString()}` };
      if (t > S.T('r2b')) T.line(ctx, self, bx + bs / 2, by + bs + 70, 26, C.ink2, 500, 'center', 'sans');
      // the guess
      X.quiz(ctx, t, 1250, 250, { opts: [{ zh: '3 年', en: '3 years' }, { zh: '3 个月', en: '3 months' }, { zh: '3 天', en: '3 days' }], ans: 2, t0: S.T('r2q') + 0.8, tA: S.T('r2r') + 0.9, tEnd: S.T('r2r') + 2.3 });
      // 100 : 0
      const sc = S.T('r2r') + 2.6;
      if (t > sc) {
        const a = M.env(t, sc, S.E('r2c'), 0.3, 0.5); const k = M.ease.outBack(M.seg(t, sc, sc + 0.4));
        ctx.save(); ctx.globalAlpha *= a; ctx.translate(1540, 470); ctx.scale(k, k);
        T.line(ctx, '100 : 0', 0, 0, 120, C.orange, 900, 'center');
        T.line(ctx, { zh: 'AlphaGo Zero（自学 3 天） vs 击败李世石的 AlphaGo', en: 'AlphaGo Zero (3 days) vs the AlphaGo that beat Lee Sedol' }, 0, 96, 24, C.ink2, 500, 'center');
        ctx.restore();
      }
      if (t > S.T('r2c')) {
        const a = M.seg(t, S.T('r2c'), S.T('r2c') + 0.5); ctx.save(); ctx.globalAlpha *= a;
        const items = [{ zh: '出题', en: 'pose' }, { zh: '解题', en: 'solve' }, { zh: '检查对错', en: 'check' }, { zh: '拿来训练', en: 'train' }];
        items.forEach((it, j) => { const xx = 1300 + j * 140, yy = 720; const on = M.seg(t, S.T('r2c') + 0.4 + j * 0.5, S.T('r2c') + 0.8 + j * 0.5);
          ctx.fillStyle = RSI.rgba(C.orange, 0.15 + 0.6 * on); D.rr(ctx, xx - 62, yy - 30, 124, 60, 30); ctx.fill(); T.line(ctx, it, xx, yy, 24, C.ink, 700, 'center');
          if (j < 3) D.arrow(ctx, xx + 64, yy, xx + 78, yy, { color: C.ink3, w: 3, head: 10 }); });
        T.line(ctx, { zh: '例：STaR（2022）· Absolute Zero（2025）', en: 'e.g. STaR (2022) · Absolute Zero (2025)' }, 1510, 790, 22, C.ink3, 400, 'center');
        ctx.restore();
      }
    },
  });

  // ---- Rung 3: being its own judge ----
  rungScene(3, {
    id: 'r3',
    lines: [
      { id: 'r3a', who: 'narr', zh: '第 3 级：自己当裁判。', en: 'Rung 3: being its own judge.' },
      { id: 'r3b', who: 'narr', zh: '人类没法给海量回答一个个打分，于是让 AI 按一套原则，去给 AI 的回答打分。', en: 'Humans can\'t grade millions of answers one by one, so an AI follows a set of principles to grade AI answers.' },
      { id: 'r3c', who: 'narr', zh: '甚至让模型给自己打分，再用这些分数训练自己。', en: 'Some setups even let a model score itself — and train on those scores.' },
      { id: 'r3d', who: 'clawd3', zh: '嗯……我觉得我答得很好。满分！', en: 'Hmm… I think I answered brilliantly. Full marks!' },
      { id: 'r3e', who: 'narr', zh: '记住这一级：自己给自己打分。{r|到了第 4 集，它会闯大祸。}', en: 'Remember this rung: grading yourself. {r|In Episode 4, it causes real trouble.}', hold: 0.8 },
    ],
    cues: [['r3d+1.4', 'ding'], ['r3e+0.3', 'warn']],
    draw(ctx, t, S) {
      const g = S.gen().g;
      // judge bench
      const jx = 1400, jy = 640;
      ctx.fillStyle = '#5A4632'; D.rr(ctx, jx - 230, jy - 10, 460, 220, 14); ctx.fill(); ctx.fillStyle = '#6B543C'; ctx.fillRect(jx - 230, jy - 10, 460, 26);
      const jh = K.draw(ctx, jx, jy - 8, 7, { gen: g, expr: t > S.T('r3d') && t < S.E('r3d') ? 'happy' : 'determined', look: [-0.8, 0], armR: t > S.T('r3d') + 1.2 && t < S.T('r3d') + 1.6 ? 1 : 0.3 });
      D.icon(ctx, 'gavel', jx + 150, jy - 60, 70, C.yellow, 9);
      T.line(ctx, { zh: '裁判', en: 'JUDGE' }, jx, jy + 100, 34, C.paper, 900, 'center');
      S.anchors.clawd3 = [jx + 90, jh[1]];
      // contestant Clawd with answer sheets
      const cx = 900, cy = 760;
      K.draw(ctx, cx, cy, 6, { gen: g, expr: X.blink(t, 7) ? 'blink' : 'normal', look: [1, -0.3], armR: 0.6 });
      for (let k = 0; k < 3; k++) { const p = M.seg(t, S.T('r3b') + 0.8 + k * 0.8, S.T('r3b') + 1.6 + k * 0.8, M.ease.inOutCubic);
        if (p <= 0) continue; const x = M.lerp(cx + 80, jx - 160 + k * 30, p), y = M.lerp(cy - 90, jy - 150 - k * 12, p) - Math.sin(p * Math.PI) * 120;
        ctx.save(); ctx.translate(x, y); ctx.rotate(-0.1 + k * 0.1); ctx.fillStyle = C.paper; ctx.fillRect(-40, -52, 80, 104); ctx.fillStyle = C.paperInk2; for (let j = 0; j < 5; j++) ctx.fillRect(-28, -36 + j * 16, 56 - (j % 2) * 18, 5); ctx.restore(); }
      // score cards
      if (t > S.T('r3c')) {
        const scores = ['9.5', '9.8', '10', '10', '10'];
        scores.forEach((s, k) => { const tk = S.T('r3c') + 0.5 + k * 0.45; if (t < tk) return; const k2 = M.ease.outBack(M.seg(t, tk, tk + 0.3));
          ctx.save(); ctx.translate(1060 + k * 150, 300); ctx.scale(k2, k2); ctx.fillStyle = C.ink; D.rr(ctx, -56, -44, 112, 88, 10); ctx.fill();
          T.line(ctx, s, 0, 2, 48, k > 1 ? C.orangeD : C.paperInk, 900, 'center'); ctx.restore(); });
      }
      T.line(ctx, { zh: '例：Constitutional AI / RLAIF（2022）· Self-Rewarding LM（2024）', en: 'e.g. Constitutional AI / RLAIF (2022) · Self-Rewarding LMs (2024)' }, 1240, 880, 22, C.ink3, 400, 'center');
      if (t > S.T('r3e')) {
        const a = M.seg(t, S.T('r3e'), S.T('r3e') + 0.3); const sh = Math.sin(t * 40) * 4 * (1 - M.seg(t, S.T('r3e'), S.T('r3e') + 0.6));
        ctx.save(); ctx.globalAlpha *= a; D.icon(ctx, 'warning', 760 + sh, 380, 130, C.red, 8); ctx.restore();
      }
    },
  });

  // ---- Rung 4: tools & infrastructure ----
  rungScene(4, {
    id: 'r4',
    lines: [
      { id: 'r4a', who: 'narr', zh: '第 4 级：改进让自己变强的工具——AI 训练和运行时用的那些代码和机器。', en: 'Rung 4: improving the tools that make it stronger — the code and machines AI is trained and run on.' },
      { id: 'r4b', who: 'card', zh: 'AlphaEvolve（2025）：AI 找到更快的矩阵算法，让一段核心计算提速 23%，Gemini 的训练时间缩短了 1%——而 AlphaEvolve 自己，就跑在 Gemini 上。', en: 'AlphaEvolve (2025): AI found a faster way to do matrix math, speeding up a core piece of computation by 23% and cutting Gemini’s training time by 1% — and AlphaEvolve itself runs on Gemini.', src: { zh: 'Google DeepMind，arXiv:2506.13131', en: 'Google DeepMind, arXiv:2506.13131' } },
      { id: 'r4c', who: 'narr', zh: 'Anthropic 有个“加速测试”：给 AI 一段训练小模型的代码，看它能把代码改快多少倍。', en: 'Anthropic runs a “speed-up test”: give an AI some code that trains a small model, and see how many times faster it can make it.' },
      { id: 'r4h', who: 'narr', zh: '熟练工程师花 4 到 8 小时，大约能快 4 倍；2025 年 5 月的 AI，约 3 倍——还不如人。', en: 'A skilled engineer, given 4 to 8 hours, gets about 4×. The AI of May 2025: about 3× — worse than a human.', hold: 0.4 },
      { id: 'r4q', who: 'clawd', zh: '那 2026 年 4 月的 AI 呢？', en: 'And the AI of April 2026?', min: 2.0 },
      { id: 'r4r', who: 'narr', zh: '答案：约 52 倍——是人类成绩的 13 倍。从不如人到远超人类，不到一年。', en: 'The answer: about 52× — thirteen times the human result. From worse than a human to far beyond, in under a year.', at: 'r4q$+2.7', hold: 0.9 },
      { id: 'r4e', who: 'clawd', zh: '我在给自己修路——路越好，我跑得越快。', en: 'I’m paving my own road — the better the road, the faster I run.', hold: 1.0 },
    ],
    cues: [['r4b', 'card'], ['r4h+0.5', 'build'], ['r4q+0.5', 'quizIn'], ...[0, 1, 2].map((k) => [(b) => b.r4q.t + 0.9 + ((b.r4r.t + 0.9) - (b.r4q.t + 0.9)) * k / 3, 'tick']), [(b) => b.r4r.t + 0.9, 'ding'], [(b) => b.r4r.t + 1.0, 'rocket'], ['r4e-0.1', 'roll'], ['r4e+1.6', 'whoosh']],
    draw(ctx, t, S) {
      const cardW = 1130, cx = 640, cy = 270;
      S.card(ctx, 'r4b', cx, cy, cardW);
      // AlphaEvolve visual: chip with speed gauge + the self-referential loop
      if (S.on('r4b')) {
        const a = M.env(t, S.T('r4b') + 0.6, S.E('r4b'), 0.4, 0.4); ctx.save(); ctx.globalAlpha *= a;
        D.icon(ctx, 'gpu', 820, 690, 150, C.orangeL, 6);
        const p = M.seg(t, S.T('r4b') + 1.2, S.T('r4b') + 3, M.ease.outCubic);
        T.line(ctx, `+${Math.round(23 * p)}%`, 1010, 660, 64, C.orange, 900, 'left'); T.line(ctx, { zh: '核心计算速度', en: 'kernel speed' }, 1010, 724, 24, C.ink2, 500, 'left');
        T.line(ctx, `−${(1 * p).toFixed(1)}%`, 1340, 660, 64, C.green, 900, 'left'); T.line(ctx, { zh: 'Gemini 训练时间', en: 'Gemini training time' }, 1340, 724, 24, C.ink2, 500, 'left');
        const q = M.seg(t, S.T('r4b') + 4.5, S.T('r4b') + 5.3, M.ease.outCubic);
        if (q > 0) {
          ctx.globalAlpha *= q; const y0 = 840;
          const wA = D.pill(ctx, 'AlphaEvolve', 760, y0, { size: 26, fill: C.orange });
          const gx = 1240; D.pill(ctx, 'Gemini', gx, y0, { size: 26, fill: C.blue, color: '#0f1a26' });
          D.arrow(ctx, 760 + wA + 14, y0 - 10, gx - 14, y0 - 10, { color: C.ink2, w: 4, head: 14 });
          D.arrow(ctx, gx - 14, y0 + 12, 760 + wA + 14, y0 + 12, { color: C.ink3, w: 4, head: 14 });
          T.line(ctx, { zh: '让它训练更快', en: 'trains it faster' }, (760 + wA + gx) / 2, y0 - 34, 22, C.ink2, 600, 'center');
          T.line(ctx, { zh: '更强的它，又驱动 AlphaEvolve', en: 'a stronger Gemini powers AlphaEvolve' }, (760 + wA + gx) / 2, y0 + 40, 22, C.ink3, 600, 'center');
        }
        ctx.restore();
      }
      // Anthropic speed-up test: humans vs AI on one scale, then the guess
      const tS = S.T('r4c'), tEnd = S.E('r4r') + 0.2;
      if (t > tS && t < tEnd + 0.5) {
        const a = M.seg(t, tS + 0.2, tS + 0.7) * (1 - M.seg(t, tEnd, tEnd + 0.5)); ctx.save(); ctx.globalAlpha *= a;
        D.pill(ctx, { zh: '加速测试', en: 'Speed-up test' }, 770, 300, { size: 28, fill: C.orange });
        T.line(ctx, { zh: '训练代码，能改快几倍？', en: 'How much faster?' }, 772, 368, 40, C.ink, 900, 'left');
        D.icon(ctx, 'code', 820, 470, 74, C.ink2, 6); T.line(ctx, 'train.py', 880, 470, 30, C.ink2, 600, 'left', 'mono');
        const tq = S.T('r4r') + 0.9;
        const bars = [
          [{ zh: '熟练工程师 · 4–8 小时', en: 'skilled engineer · 4–8 h' }, 4, C.blue, S.T('r4h') + 0.5],
          [{ zh: 'AI · 2025 年 5 月', en: 'AI · May 2025' }, 3, C.orangeD, S.T('r4h') + 3.0],
          [{ zh: 'AI · 2026 年 4 月', en: 'AI · Apr 2026' }, 52, C.orange, tq],
        ];
        const X0 = 1030, LEN = 700;
        bars.forEach((b, j) => {
          const yy = 650 + j * 80; if (t < b[3] - 0.3) return;
          const p = M.seg(t, b[3], b[3] + (j === 2 ? 1.4 : 0.8), M.ease.outCubic);
          T.line(ctx, b[0], X0 - 30, yy, 26, j === 2 ? C.ink : C.ink2, j === 2 ? 800 : 500, 'right');
          X.bar(ctx, X0, yy - 20, LEN * (b[1] / 52) * p + 8, 40, 1, b[2]);
          T.line(ctx, `≈${Math.max(1, Math.round(b[1] * p))}×`, X0 + 22 + LEN * (b[1] / 52) * p, yy, 30, b[2], 900, 'left');
        });
        if (t < tq) { // the empty runway the third bar will fill
          ctx.save(); ctx.setLineDash([10, 10]); ctx.strokeStyle = 'rgba(240,238,230,0.22)'; ctx.lineWidth = 3; D.rr(ctx, X0, 810 - 20, LEN + 8, 40, 20); ctx.stroke(); ctx.restore();
          if (t > S.T('r4q')) T.line(ctx, '?', X0 + LEN / 2, 812, 40, C.yellow, 900, 'center');
        }
        const c13 = M.seg(t, tq + 1.6, tq + 2.0, M.ease.outBack);
        if (c13 > 0) { ctx.save(); ctx.translate(1500, 742); ctx.scale(c13, c13); D.pill(ctx, { zh: '= 人类成绩的 13 倍', en: '= 13× the human result' }, 0, 0, { size: 32, fill: C.yellow, align: 'center' }); ctx.restore(); }
        T.line(ctx, { zh: '来源：Anthropic Institute，2026.6', en: 'Source: Anthropic Institute, June 2026' }, 1738, 880, 20, C.ink3, 400, 'right');
        ctx.restore();
        X.quiz(ctx, t, 1250, 250, { opts: [{ zh: '5 倍', en: '5×' }, { zh: '15 倍', en: '15×' }, { zh: '50 倍以上', en: '50× or more' }], ans: 2, t0: S.T('r4q') + 0.5, tA: tq, tEnd: tq + 1.4 });
      }
      // "paving my own road": Clawd paves — and the better the road, the faster it runs
      if (t > S.T('r4e') - 0.3) {
        const t0 = S.T('r4e') - 0.3, u = M.seg(t, t0, S.E('r4e') + 0.2);
        const a = M.seg(t, t0, t0 + 0.4); ctx.save(); ctx.globalAlpha *= a;
        const RX0 = 680, RX1 = 1790, RY = 760;
        const fx = RX0 + 60 + (RX1 - RX0 - 140) * (0.3 * u + 0.7 * u * u);
        ctx.fillStyle = 'rgba(240,238,230,0.10)'; ctx.fillRect(RX0, RY + 46, RX1 - RX0, 3);
        ctx.fillStyle = '#3A3936'; ctx.fillRect(RX0, RY - 44, fx - RX0, 88);
        ctx.fillStyle = '#55524C'; ctx.fillRect(RX0, RY - 44, fx - RX0, 7); ctx.fillRect(RX0, RY + 37, fx - RX0, 7);
        ctx.fillStyle = C.yellow; for (let x = RX0 + 24; x < fx - 50; x += 80) ctx.fillRect(x, RY - 3, 44, 6);
        [[880, { zh: '更快的计算', en: 'faster maths' }], [1300, { zh: '更快的训练代码', en: 'faster training code' }]].forEach(([x, lab]) => { if (fx > x + 120) T.line(ctx, lab, x, RY - 22, 22, 'rgba(232,185,58,0.85)', 800, 'left'); });
        ctx.fillStyle = 'rgba(240,238,230,0.22)'; for (let k = 0; k < 30; k++) { const gx = fx + 40 + M.hash(k * 7.1) * (RX1 - fx); if (gx < RX1) ctx.fillRect(gx, RY - 38 + M.hash(k * 3.3) * 76, 7, 7); }
        // speed streaks behind Clawd (only on the paved part)
        const len = 40 + 360 * u;
        ctx.strokeStyle = 'rgba(240,238,230,0.45)'; ctx.lineCap = 'round'; ctx.lineWidth = 4;
        for (let k = 0; k < 4; k++) { const y = RY - 70 - k * 16, x1 = fx - 90 - (k % 2) * 30, x0 = Math.max(RX0 + 10, x1 - len * (0.6 + 0.4 * M.hash(k + Math.floor(t * 8)))); if (x1 > x0 + 10 && u > 0.15) { ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke(); } }
        // roller + Clawd pushing it
        const sp = 0.4 + 3 * u;
        ctx.save(); ctx.translate(fx + 30, RY + 8); ctx.rotate(t * sp * 5);
        ctx.fillStyle = '#9C968A'; ctx.beginPath(); ctx.arc(0, 0, 32, 0, 7); ctx.fill(); ctx.strokeStyle = '#6A655C'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(-24, 0); ctx.lineTo(24, 0); ctx.stroke(); ctx.restore();
        ctx.strokeStyle = '#B9B2A4'; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(fx + 30, RY + 8); ctx.lineTo(fx - 24, RY - 60); ctx.stroke();
        const hop = Math.abs(Math.sin(t * (6 + sp * 4))) * 9;
        K.draw(ctx, fx - 58, RY + 26 - hop, 4.6, { gen: S.gen().g, expr: u > 0.45 ? 'happy' : 'determined', look: [1, 0], armR: 0.9, armL: 0.6, shadow: false, rot: -0.1 * u });
        ctx.restore();
      }
    },
  });

  // ---- Rung 5: doing research ----
  rungScene(5, {
    id: 'r5',
    lines: [
      { id: 'r5a', who: 'narr', zh: '第 5 级：自己做 AI 研究。', en: 'Rung 5: doing AI research itself.' },
      { id: 'r5b', who: 'card', zh: 'OpenAI（2026.9）：宣布做出了“自动化研究实习生”——在人的指导下，能完成研究员要花几天的明确任务。在它的研究团队里，人类每干 1 天，AI 智能体就要干 3.1 天的活。', en: 'OpenAI (Sep 2026): announced an “automated research intern” — under human direction, it completes well-defined tasks that take a researcher days. In its research teams, for every day a human works, AI agents put in 3.1 days.', src: { zh: 'OpenAI，Research acceleration，2026.9.6', en: 'OpenAI, “Research acceleration”, 2026-09-06' } },
      { id: 'r5c', who: 'card', zh: 'Anthropic（2026.9）：在能衡量的 AI 研发工作里，由 Claude“主导”的部分，从 2 月的不到 1% 涨到 8 月的 26%；至少达到“协作”的，超过 90%。', en: 'Anthropic (Sep 2026): of measurable AI R&D work, the share Claude “leads” rose from under 1% in February to 26% in August; over 90% is at least “collaborative”.', src: { zh: 'Anthropic Institute，2026.9.17', en: 'Anthropic Institute, 2026-09-17' } },
      { id: 'r5d', who: 'clawd', zh: '实习生……我这是升职了？', en: 'An intern… did I just get promoted?' },
      { id: 'r5e', who: 'narr', zh: '不过，“主导”仍在人的监督之下：选题、判断、最后放行，还掌握在人手里。', en: 'Still, “leading” happens under human supervision: choosing problems, judging, and final sign-off remain in human hands.', hold: 0.6 },
    ],
    cues: [['r5b', 'card'], ['r5c', 'card'], ['r5d+0.3', 'stick']],
    draw(ctx, t, S) {
      S.card(ctx, 'r5b', 640, 270, 1130); S.card(ctx, 'r5c', 640, 270, 1130);
      const g = S.gen().g;
      // "an intern… did I just get promoted?" — a staff badge clips onto ladder-Clawd (drawn in un-shifted coords)
      if (t > S.T('r5d') + 0.3) {
        const k = M.ease.outBack(M.seg(t, S.T('r5d') + 0.3, S.T('r5d') + 0.6));
        ctx.save(); ctx.translate(-50, 0);
        const bx = LX + LW / 2 + 6, by = rungY(5) - 26;
        ctx.strokeStyle = C.blue; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(bx - 14, by - 22); ctx.lineTo(bx, by - 8); ctx.lineTo(bx + 14, by - 22); ctx.stroke();
        ctx.save(); ctx.translate(bx, by); ctx.scale(k, k); ctx.fillStyle = C.paper; D.rr(ctx, -16, -8, 32, 22, 4); ctx.fill(); ctx.fillStyle = C.blue; ctx.fillRect(-16, -8, 32, 6); ctx.restore();
        // enlarged copy of the badge, with a leader line
        const ex = 640, ey = 450; ctx.globalAlpha *= M.seg(t, S.T('r5d') + 0.4, S.T('r5d') + 0.7);
        ctx.strokeStyle = 'rgba(240,238,230,0.35)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(bx + 18, by + 8); ctx.lineTo(ex - 112, ey - 20); ctx.stroke();
        ctx.save(); ctx.translate(ex, ey); ctx.rotate(-0.05); ctx.scale(k, k);
        ctx.fillStyle = C.paper; D.rr(ctx, -110, -50, 220, 112, 12); ctx.fill(); ctx.fillStyle = C.blue; D.rr(ctx, -110, -50, 220, 30, 12); ctx.fill(); ctx.fillRect(-110, -32, 220, 12);
        T.line(ctx, { zh: '研究部', en: 'RESEARCH' }, 0, -34, 18, '#fff', 800, 'center');
        T.line(ctx, { zh: '实习生', en: 'INTERN' }, 0, 6, 40, C.paperInk, 900, 'center');
        T.line(ctx, 'Clawd', 0, 44, 18, C.paperInk2, 600, 'center');
        ctx.restore(); ctx.restore();
      }
      // agent office: many little Clawds working, few humans supervising
      const a = M.seg(t, S.T('r5b') + 1.0, S.T('r5b') + 1.6);
      if (a > 0) {
        ctx.save(); ctx.globalAlpha *= a;
        const cols = 12, rows = 3; const show = Math.floor(M.seg(t, S.T('r5b') + 1.0, S.T('r5b') + 4) * cols * rows);
        for (let k = 0; k < show; k++) { const c = k % cols, r = Math.floor(k / cols); const x = 700 + c * 82, y = 690 + r * 74;
          K.drawCached(ctx, x, y + (Math.floor(t * 6 + k) % 2), 2.4, { res: 1, expr: (Math.floor(t * 3 + k * 7) % 11 === 0) ? 'blink' : 'normal', armL: 0, armR: (Math.floor(t * 6 + k) % 2) * 0.4 }); }
        RSI.Human.stand(ctx, 1760, 900, 0.62, { t, look: -1 });
        ctx.restore();
      }
      const p2 = S.on('r5c') ? M.seg(t, S.T('r5c') + 1.0, S.T('r5c') + 3, M.ease.outCubic) : 0;
      if (S.on('r5c')) {
        // share meter
        ctx.save(); ctx.globalAlpha *= M.env(t, S.T('r5c') + 0.8, S.E('r5c'), 0.3, 0.4);
        ctx.fillStyle = 'rgba(20,20,19,0.88)'; D.rr(ctx, 680, 620, 1100, 290, 18); ctx.fill();
        T.line(ctx, { zh: 'Claude “主导”的研发工作占比', en: 'Share of R&D work Claude “leads”' }, 720, 668, 26, C.ink2, 500, 'left');
        X.bar(ctx, 720, 700, 1020, 46, 0.26 * p2, C.orange); T.line(ctx, `${Math.round(26 * p2)}%`, 740 + 1020 * 0.26 * p2, 724, 34, C.orange, 900, 'left');
        T.line(ctx, { zh: '2026 年 2 月：<1%  →  8 月：26%', en: 'Feb 2026: <1%  →  Aug: 26%' }, 720, 790, 24, C.ink3, 500, 'left');
        X.bar(ctx, 720, 826, 1020, 24, 0.9 * p2, C.yellow); T.line(ctx, { zh: '“协作”及以上 >90%', en: '≥ “collaborates”: >90%' }, 1740, 880, 22, C.yellow, 700, 'right');
        ctx.restore();
      }
    },
  });

  RSI.defScene({
    id: 'top', music: 'build', lead: 0.6,
    cues: [0, 1, 2, 3, 4].map((i) => ['t0+' + (0.4 + i * 0.32).toFixed(2), 'tick']),
    lines: [
      { id: 't0', who: 'narr', zh: '五级梯子，每一级都已经有了真实的例子。', en: 'Five rungs — and every one of them already has real examples.', hold: 0.5 },
      { id: 't1', who: 'narr', zh: '梯子顶端，是完全的闭环：从提出问题到训练出下一代，全程不需要人。', en: 'At the top is a fully closed loop: from posing the question to training the next generation, no human needed.' },
      { id: 't2', who: 'narr', zh: '截至 2026 年 10 月，还没有任何实验室公开宣称走到了这一步。', en: 'As of October 2026, no lab has publicly claimed to have reached it.' },
      { id: 't3', who: 'clawd', zh: '那我们……离顶端还有多远？', en: 'So… how far are we from the top?', hold: 0.5 },

    ],
    draw(ctx, t, S) {
      D.dots(ctx, 0.03);
      const zoom = M.seg(t, 0, 3.5, M.ease.inOutCubic);
      ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(1 + zoom * 0.25, 1 + zoom * 0.25); ctx.translate(-W / 2 + zoom * 300, -H / 2 + zoom * 120);
      RSI.drawLadder(ctx, t, { cur: 5 });
      for (let i = 1; i <= 5; i++) { const k = M.ease.outBack(M.seg(t, S.T('t0') + 0.4 + (i - 1) * 0.32, S.T('t0') + 0.7 + (i - 1) * 0.32)); if (k > 0) { ctx.save(); ctx.translate(LX - 48, rungY(i) - 4); ctx.scale(k, k); D.icon(ctx, 'check', 0, 0, 36, C.green, 7); ctx.restore(); } }
      const g = S.gen().g;
      const head = K.draw(ctx, LX + LW / 2, rungY(5), 5.2, { gen: g, expr: t > S.T('t3') ? 'worried' : X.blink(t, 2) ? 'blink' : 'normal', look: [0.2, -1] });
      ctx.restore();
      const hx = (LX + LW / 2 - W / 2 + zoom * 300) * (1 + zoom * 0.25) + W / 2, hy = (head[1] - H / 2 + zoom * 120) * (1 + zoom * 0.25) + H / 2;
      S.anchors.clawd = [hx + 30, hy]; S.sides.clawd = 'right';
      // dotted path to the closed loop, fog
      const a = M.seg(t, S.T('t1'), S.T('t1') + 1);
      ctx.save(); ctx.globalAlpha *= a;
      D.loop(ctx, 1300, 420, 190, { ai: [1, 1, 1, 1], phase: t * 0.5, nodeR: 62, alpha: 0.85, tokenColor: C.yellow });
      T.line(ctx, { zh: '全程无人？', en: 'no humans?' }, 1300, 420, 30, C.yellow, 900, 'center');
      ctx.restore();
      if (t > S.T('t2')) { const b = M.seg(t, S.T('t2'), S.T('t2') + 0.6); ctx.save(); ctx.globalAlpha *= b; D.pill(ctx, { zh: '截至 2026.10：尚无实验室宣布实现', en: 'As of Oct 2026: no lab claims it' }, 1300, 700, { size: 30, fill: C.raised, color: C.ink, align: 'center' }); ctx.restore(); }
    },
  });
})();
