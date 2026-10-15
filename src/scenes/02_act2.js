/* 第二章 一架五级的梯子: a simplified ladder of self-improvement, with 2025–2026 evidence. */
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
  RSI.chapterCard({ id: 'ch2', music: 'build', num: { zh: '第二章', en: 'Chapter 2' }, title: { zh: '一架五级的梯子', en: 'A five-rung ladder' }, sub: { zh: 'AI 现在能改进自己的哪些部分？', en: 'Which parts of itself can AI improve today?' }, label: { zh: '第二章 · 一架五级的梯子', en: 'Ch.2 · A five-rung ladder' } });

  RSI.defScene({
    id: 'ladder', music: 'build', lead: 0.8,
    lines: [
      { id: 'a1', who: 'narr', zh: '“自我改进”不是一个开关，而是一架梯子：越往上，AI 能改动的东西越核心。', en: '“Self-improvement” isn\'t a switch; it\'s a ladder. The higher you go, the more core the things AI can change.', hold: 0.8 },
      { id: 'a2', who: 'narr', zh: '为了好懂，我们把它简化成五级。', en: 'To keep it simple, we\'ll use five rungs.' },
      { id: 'a3', who: 'clawd', zh: '我先站在地面上。', en: 'I\'ll start on the ground.', hold: 0.4 },
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
    },
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
      { id: 'r1b', who: 'narr', zh: '2026 年 3 月，Karpathy 开源了 autoresearch：AI 改训练代码，训练 5 分钟，看分数，好就留下、差就扔掉，整夜循环。', en: 'In March 2026, Andrej Karpathy open-sourced autoresearch: an AI edits training code, trains for 5 minutes, checks the score, keeps or discards — all night long.', hold: 0.8 },
      { id: 'r1j', who: 'narr', zh: '他在说明里开玩笑：未来的智能体会声称，代码库已经进化到第 10,205 代——反正也没人看得懂了。', en: 'His README jokes that future agents will claim the codebase is on its 10,205th generation — not that anyone can still read it.' },
      { id: 'r1c', who: 'card', zh: '达尔文-哥德尔机（2025）：AI 反复改写自己的代码，编程基准 SWE-bench 成绩从 20% 提升到 50%。', en: 'Darwin Gödel Machine (2025): an agent that keeps rewriting its own code raised its SWE-bench score from 20% to 50%.', src: { zh: 'Zhang 等，arXiv:2505.22954', en: 'Zhang et al., arXiv:2505.22954' } },
      { id: 'r1d', who: 'card', zh: 'Weco AIDE²（2026）：让研究智能体改进自己。无人值守 8 天，它找到的方案胜过人类工程师打磨 2 年的版本。', en: 'Weco AIDE² (2026): a research agent improving itself. In 8 unattended days it found a harness better than the one humans refined over 2 years.', src: { zh: 'Weco AI，arXiv:2609.26457', en: 'Weco AI, arXiv:2609.26457' } },
      { id: 'r1e', who: 'clawd', zh: '改改自己的工作流程？这个我也会。', en: 'Tweak my own workflow? I can do that.' },
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
      { id: 'r2b', who: 'narr', zh: '2017 年的 AlphaGo Zero 不看人类棋谱，只和自己下棋。3 天后，它以 100 比 0 击败了当年战胜李世石的版本。', en: 'In 2017, AlphaGo Zero studied no human games — it only played itself. After 3 days it beat the version that defeated Lee Sedol, 100 to 0.', hold: 0.8 },
      { id: 'r2c', who: 'narr', zh: '今天的大模型也用类似的办法：自己出题、自己解答，挑出做对的，再拿来训练自己。', en: 'Today\'s models do something similar: write problems, solve them, keep the correct ones, and train on them.', hold: 0.6 },
      { id: 'r2d', who: 'clawd', zh: '自己出题自己做……这个我擅长。', en: 'Set my own homework and do it… I\'m good at that.' },
    ],
    cues: [['r2b+5.2', 'score']],
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
      // 100 : 0
      const sc = S.R('r2b+5.2');
      if (t > sc) {
        const a = M.env(t, sc, S.E('r2c'), 0.3, 0.5); const k = M.ease.outBack(M.seg(t, sc, sc + 0.4));
        ctx.save(); ctx.globalAlpha *= a; ctx.translate(1540, 470); ctx.scale(k, k);
        T.line(ctx, '100 : 0', 0, 0, 120, C.orange, 900, 'center');
        T.line(ctx, { zh: 'AlphaGo Zero（3 天自学） vs 击败李世石的 AlphaGo', en: 'AlphaGo Zero (3 days) vs the AlphaGo that beat Lee Sedol' }, 0, 96, 24, C.ink2, 500, 'center');
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
      { id: 'r3e', who: 'narr', zh: '记住这一级。{r|后面会出事。}', en: 'Remember this rung. {r|It will come back to bite.}', hold: 0.6 },
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
      { id: 'r4a', who: 'narr', zh: '第 4 级：改进让自己变强的工具和基础设施。', en: 'Rung 4: improving the tools and infrastructure that make it stronger.' },
      { id: 'r4b', who: 'card', zh: 'AlphaEvolve（2025）：AI 发现的一个矩阵计算优化，让关键计算内核提速 23%，把 Gemini 的训练时间缩短了 1%——而 AlphaEvolve 自己就跑在 Gemini 上。', en: 'AlphaEvolve (2025): a matrix-math trick found by AI sped up a key kernel by 23% and cut Gemini\'s training time by 1% — and AlphaEvolve itself runs on Gemini.', src: { zh: 'Google DeepMind，arXiv:2506.13131', en: 'Google DeepMind, arXiv:2506.13131' } },
      { id: 'r4c', who: 'card', zh: 'Anthropic 的“加速测试”：让模型把一段小模型训练代码改快。2025 年 5 月约快 3 倍；2026 年 4 月约快 52 倍。熟练工程师花 4–8 小时，大约能做到 4 倍。', en: 'Anthropic\'s speed-up test: make a small model\'s training code faster. May 2025: ~3×. April 2026: ~52×. A skilled engineer gets ~4× in 4–8 hours.', src: { zh: 'Anthropic Institute，2026.6', en: 'Anthropic Institute, June 2026' }, hold: 0.8 },
      { id: 'r4d', who: 'card', zh: '智谱（2026.9）：由 GLM-5.3 驱动的 Infra Agent，在 10 万张以上国产加速卡上搭建推理集群，从首次运行到上线不到两周，吞吐约提升 3 倍。团队强调：这还不是 RSI，目标设定和风险判断仍由人来做。', en: 'Zhipu (Sep 2026): an Infra Agent driven by GLM-5.3 built an inference cluster on 100k+ domestic accelerators — first run to launch in under two weeks, ~3× throughput. The team stresses: this is not yet RSI; humans still set goals and judge risk.', src: { zh: '智谱技术博客，2026.9.17', en: 'Zhipu tech blog, 2026-09-17' } },
      { id: 'r4e', who: 'clawd', zh: '我在给自己修跑道。', en: 'I\'m paving my own runway.' },
    ],
    cues: [['r4b', 'card'], ['r4c', 'card'], ['r4d', 'card']],
    draw(ctx, t, S) {
      const cardW = 1130, cx = 640, cy = 270;
      S.card(ctx, 'r4b', cx, cy, cardW); S.card(ctx, 'r4c', cx, cy, cardW); S.card(ctx, 'r4d', cx, cy, cardW);
      // AlphaEvolve visual: chip with speed gauge
      if (S.on('r4b')) {
        const a = M.env(t, S.T('r4b') + 0.6, S.E('r4b'), 0.4, 0.4); ctx.save(); ctx.globalAlpha *= a;
        D.icon(ctx, 'gpu', 820, 690, 150, C.orangeL, 6);
        const p = M.seg(t, S.T('r4b') + 1.2, S.T('r4b') + 3, M.ease.outCubic);
        T.line(ctx, `+${Math.round(23 * p)}%`, 1010, 660, 64, C.orange, 900, 'left'); T.line(ctx, { zh: '内核速度', en: 'kernel speed' }, 1010, 724, 24, C.ink2, 500, 'left');
        T.line(ctx, `−${(1 * p).toFixed(1)}%`, 1340, 660, 64, C.green, 900, 'left'); T.line(ctx, { zh: 'Gemini 训练时间', en: 'Gemini training time' }, 1340, 724, 24, C.ink2, 500, 'left');
        ctx.restore();
      }
      if (S.on('r4c')) {
        const a = M.env(t, S.T('r4c') + 0.8, S.E('r4c'), 0.4, 0.4); ctx.save(); ctx.globalAlpha *= a;
        const bars = [[{ zh: 'AI · 2025.5', en: 'AI · May 2025' }, 3, C.orangeD], [{ zh: '熟练工程师 · 4–8 小时', en: 'skilled human · 4–8 h' }, 4, C.blue], [{ zh: 'AI · 2026.4', en: 'AI · Apr 2026' }, 52, C.orange]];
        bars.forEach((b, j) => { const yy = 640 + j * 76; const p = M.seg(t, S.T('r4c') + 1.2 + j * 0.5, S.T('r4c') + 2.4 + j * 0.5, M.ease.outCubic);
          T.line(ctx, b[0], 1000, yy, 26, C.ink2, 500, 'right'); X.bar(ctx, 1030, yy - 20, 700 * (b[1] / 52) * p + 6, 40, 1, b[2]); T.line(ctx, `≈${Math.round(b[1] * p)}×`, 1050 + 700 * (b[1] / 52) * p, yy, 30, b[2], 900, 'left'); });
        ctx.restore();
      }
      if (S.on('r4d')) {
        const a = M.env(t, S.T('r4d') + 1.0, S.E('r4d'), 0.4, 0.4); ctx.save(); ctx.globalAlpha *= a;
        for (let r = 0; r < 3; r++) for (let c = 0; c < 14; c++) { const on = M.hash(r * 31 + c + Math.floor(t * 4)) > 0.3; ctx.fillStyle = on ? RSI.rgba(C.green, 0.8) : 'rgba(240,238,230,0.12)'; D.rr(ctx, 700 + c * 78, 700 + r * 50, 64, 34, 6); ctx.fill(); }
        ctx.restore();
      }
    },
  });

  // ---- Rung 5: doing research ----
  rungScene(5, {
    id: 'r5',
    lines: [
      { id: 'r5a', who: 'narr', zh: '第 5 级：自己做 AI 研究。', en: 'Rung 5: doing AI research itself.' },
      { id: 'r5b', who: 'card', zh: 'OpenAI（2026.9）：宣布实现“自动化研究实习生”——能在人的指导下，完成研究员要花几天的明确任务。在其研究团队里，每 1 个人类工作日，对应 3.1 个智能体工作日。', en: 'OpenAI (Sep 2026): says it reached an “automated research intern” — doing well-defined tasks that take a researcher days, under human direction. Its research org now logs 3.1 agent-workdays per human workday.', src: { zh: 'OpenAI，Research acceleration，2026.9.6', en: 'OpenAI, “Research acceleration”, 2026-09-06' } },
      { id: 'r5c', who: 'card', zh: 'Anthropic（2026.9）：在可测量的 AI 研发工作中，由 Claude“主导”的部分从 2 月的不到 1% 升到 8 月的 26%；“协作”及以上超过 90%。', en: 'Anthropic (Sep 2026): of measurable AI R&D work, the share Claude “leads” rose from under 1% in February to 26% in August; over 90% is at least “collaborative”.', src: { zh: 'Anthropic Institute，2026.9.17', en: 'Anthropic Institute, 2026-09-17' } },
      { id: 'r5d', who: 'clawd', zh: '实习生……我这是升职了？', en: 'An intern… did I just get promoted?' },
      { id: 'r5e', who: 'narr', zh: '不过，“主导”仍在人的监督之下：选题、判断、最后放行，还掌握在人手里。', en: 'Still, “leading” happens under human supervision: choosing problems, judging, and final sign-off remain in human hands.', hold: 0.6 },
    ],
    cues: [['r5b', 'card'], ['r5c', 'card']],
    draw(ctx, t, S) {
      S.card(ctx, 'r5b', 640, 270, 1130); S.card(ctx, 'r5c', 640, 270, 1130);
      const g = S.gen().g;
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
    lines: [
      { id: 't1', who: 'narr', zh: '梯子顶端，是完全的闭环：从提出问题到训练出下一代，全程不需要人。', en: 'At the top is a fully closed loop: from posing the question to training the next generation, no human needed.' },
      { id: 't2', who: 'narr', zh: '截至 2026 年 10 月，还没有任何实验室公开宣称走到了这一步。', en: 'As of October 2026, no lab has publicly claimed to have reached it.' },
      { id: 't3', who: 'clawd', zh: '那我们……离顶端还有多远？', en: 'So… how far are we from the top?' },
      { id: 't4', who: 'narr', zh: '这取决于一场正在进行的大辩论。', en: 'That depends on a great debate happening right now.', hold: 0.6 },
    ],
    draw(ctx, t, S) {
      D.dots(ctx, 0.03);
      const zoom = M.seg(t, 0, 3.5, M.ease.inOutCubic);
      ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(1 + zoom * 0.25, 1 + zoom * 0.25); ctx.translate(-W / 2 + zoom * 300, -H / 2 + zoom * 120);
      RSI.drawLadder(ctx, t, { cur: 5 });
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
