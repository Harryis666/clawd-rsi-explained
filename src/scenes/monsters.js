/* EP4 · 三只小怪兽: the night road (continued from EP3) · Goodhart / reward hacking · model collapse · goal drift & the oversight gap. */
(function () {
  'use strict';
  const RSI = window.RSI, C = RSI.C, M = RSI.M, D = RSI.D, T = RSI.T, K = RSI.Clawd, X = RSI.X, MON = RSI.Monster, Sx = RSI.Series;
  const W = RSI.W, H = RSI.H;
  const EN = () => RSI.lang === 'en';
  const NAMES = { cheater: { zh: '作弊怪', en: 'The Cheater' }, collapse: { zh: '近亲繁殖怪', en: 'The Inbreeder' }, whisper: { zh: '传话怪', en: 'The Whisperer' } };

  // ---------------- 0) the night road, continued from EP3: three little monsters step into the light ----------------
  const NY = 820, ROADY = 846;
  const STARS = Array.from({ length: 90 }, (_, i) => [M.hash(i * 3.1) * W, M.hash(i * 7.7) * 560, 0.8 + M.hash(i * 1.3) * 2.2, M.hash(i * 9.1) * 6]);
  const EYES = { cheater: [[4.2, 5.4], [11.2, 5.4]], collapse: [[5, 6], [11, 6]], whisper: [[5, 5], [11, 5]] };
  const EYEC = { cheater: '#C8F27A', collapse: '#F2EFE6', whisper: '#E2B8FF' };
  const NCOL = { cheater: C.green, collapse: '#C9C5BA', whisper: '#C9A2E6' };
  // [name, x in the bushes (EP3), px, x on the road, px on the road, seed]
  const TRIO = [['cheater', 1330, 9, 1120, 10.5, 0], ['collapse', 1560, 8.5, 1400, 10, 1.7], ['whisper', 1785, 8.5, 1720, 10, 3.1]];
  const tOut = (i) => 1.5 + i * 1.05;            // each one steps out of the bushes
  /** the '100' paper the Cheater carries around */
  RSI.scorePaper = (ctx, x, y, s, rot, a = 1, dim = 0) => {
    ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    ctx.fillStyle = RSI.mix('#F2EEE2', '#2A2C33', dim); ctx.fillRect(-26, -20, 52, 40);
    T.line(ctx, '100', 0, 1, 24, RSI.mix('#C8372D', '#2A2C33', dim * 0.8), 900, 'center'); ctx.restore();
  };
  RSI.defScene({
    id: 'monsters', music: 'tension', lead: 0.6, pad: 0.9,
    lines: [
      { id: 'm1', who: 'narr', zh: '那天夜里，盯着 Clawd 的，是三只小怪兽。', en: 'That night, the eyes watching Clawd belonged to three little monsters.', min: 4.3 },
      { id: 'm2', who: 'clawd', zh: '……我能假装没看见吗？', en: '…Can I pretend I didn’t see them?', gap: 0.3, min: 2.2 },
      { id: 'm3', who: 'narr', zh: '不能。它们一只比一只难缠——咱们一只一只来认。', en: 'No. Each is trickier than the last — let’s get to know them one at a time.', gap: 0.25, hold: 0.4 },
    ],
    cues: [[0.2, 'heart'], ...TRIO.map((m, i) => [tOut(i), 'spot']), [tOut(0) + 0.9, 'ding'], [tOut(1) + 0.95, 'copy'], [tOut(2) + 0.9, 'whisper'], ['m2', 'gulp'], ['m3+0.5', 'stick']],
    draw(ctx, t, S) {
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#070A14'); g.addColorStop(0.55, '#111626'); g.addColorStop(1, '#0A0A0C'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      for (const [x, y, r, ph] of STARS) { ctx.fillStyle = `rgba(240,238,230,${0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t * 1.7 + ph))})`; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
      ctx.fillStyle = '#EDE6CF'; ctx.beginPath(); ctx.arc(1590, 170, 44, 0, 7); ctx.fill(); ctx.fillStyle = '#0A0D18'; ctx.beginPath(); ctx.arc(1610, 156, 40, 0, 7); ctx.fill();
      const bush = (x, y, r, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, Math.PI, 0); ctx.fill(); };
      for (let i = 0; i < 9; i++) { ctx.fillStyle = '#0B0E14'; ctx.fillRect(1150 + i * 92, NY - 260 - (i % 3) * 30, 18, 260); bush(1160 + i * 92, NY - 250 - (i % 3) * 30, 70, '#0C1017'); }
      const st = TRIO.map(([nm, x0, px0, x1, px1, seed], i) => {
        const p = M.seg(t, tOut(i), tOut(i) + 0.75);
        const e = M.ease.inOutCubic(p);
        return { nm, seed, p, x: M.lerp(x0, x1, e), y: M.lerp(NY - 10, ROADY, e) - Math.sin(Math.PI * p) * 70, px: M.lerp(px0, px1, e), tint: 1 - M.seg(p, 0.25, 0.85), land: tOut(i) + 0.75 };
      });
      const drawMon = (m) => {
        MON.draw(ctx, m.nm, m.x, m.y, m.px, { t, seed: m.seed, alpha: 0.85 + 0.15 * (1 - m.tint), tint: m.tint > 0.01 ? ['#06080D', 0.86 * m.tint] : null, blink: m.tint < 0.5 });
        if (m.nm === 'cheater') { const wave = t > m.land ? Math.sin((t - m.land) * 7) * 0.16 : 0; RSI.scorePaper(ctx, m.x + 7.2 * m.px, m.y - 6.2 * m.px - (t > m.land ? 18 : 0), m.px / 9, 0.18 + wave, 0.75 + 0.25 * (1 - m.tint), m.tint); }
      };
      st.forEach((m) => { if (m.p < 0.35) drawMon(m); });
      for (let i = 0; i < 11; i++) bush(1110 + i * 86, NY + 4, 56 + (i % 3) * 14, '#090B10');
      ctx.fillStyle = '#0D0F12'; ctx.fillRect(0, NY, W, H - NY);
      ctx.fillStyle = '#1A1C20'; ctx.fillRect(0, NY + 6, W, 46); ctx.fillStyle = 'rgba(240,238,230,0.10)'; for (let i = 0; i < 16; i++) ctx.fillRect(40 + i * 130, NY + 26, 64, 6);
      // ---- Clawd with the lantern (where EP3 left him)
      const back = M.ease.inOutSine(M.seg(t, S.T('m2'), S.T('m2') + 0.7));
      const wx = 760 - 70 * back, s = 9;
      let expr = t < 1.2 ? 'surprised' : X.blink(t, 5) ? 'blink' : 'worried', look = [1, 0.05];
      if (S.on('m2')) expr = 'worried';
      if (t > S.T('m3') + 0.3) { expr = 'determined'; look = [1, -0.1]; }
      const armR = 0.8 + 0.15 * M.seg(t, 1.0, 1.6) - 0.15 * back;
      const hd = K.draw(ctx, wx, NY, s, { gen: S.gen().g, expr, look, armR, armL: 0.1, walk: t > S.T('m2') && t < S.T('m2') + 0.7 ? t * 3 : undefined });
      const lx = wx + 7.9 * s, ly = NY - 10 * s + (3 - 3.2 * armR + 1) * s;
      const LR = 390 + 120 * M.seg(t, 1.0, 1.8) + 10 * Math.sin(t * 9);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; D.glow(ctx, lx, ly + 30, LR, '#FFB866', 0.32); ctx.restore();
      const dk = ctx.createRadialGradient(lx, ly, LR * 0.35, lx, ly, LR * 1.9); dk.addColorStop(0, 'rgba(4,5,9,0)'); dk.addColorStop(1, 'rgba(4,5,9,0.62)'); ctx.fillStyle = dk; ctx.fillRect(0, 300, W, H - 300);
      ctx.strokeStyle = '#8D877B'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(lx, ly - 4); ctx.lineTo(lx, ly + 16); ctx.stroke();
      ctx.fillStyle = '#3A2E25'; D.rr(ctx, lx - 17, ly + 14, 34, 8, 3); ctx.fill(); D.rr(ctx, lx - 17, ly + 58, 34, 8, 3); ctx.fill();
      ctx.fillStyle = '#FFCF7A'; D.rr(ctx, lx - 13, ly + 22, 26, 36, 6); ctx.fill(); D.glow(ctx, lx, ly + 40, 46, '#FFD27F', 0.9);
      if (t > S.T('m2') + 0.3 && t < S.T('m3') + 1.0) X.sweat(ctx, wx - 80, hd[1] + 30, (t - S.T('m2') - 0.3) % 1.6, 1.1);
      S.anchors.clawd = [wx - 20, hd[1] - 6]; S.sides.clawd = 'up';
      // ---- glowing eyes of the ones still hiding
      st.forEach((m) => {
        if (m.tint <= 0.02) return;
        const [w, h] = MON.size(m.nm), bob = Math.round(Math.sin(t * 3 + m.seed) * 1.5) * m.px * 0.5, ox = m.x - (w * m.px) / 2, oy = m.y - h * m.px + bob;
        const bl = ((t * 0.7 + m.seed * 0.37) % 3.2) < 0.12;
        EYES[m.nm].forEach(([c, r]) => { const ex = ox + c * m.px, ey = oy + r * m.px; D.glow(ctx, ex, ey, m.px * 3.2, EYEC[m.nm], 0.75 * m.tint);
          ctx.save(); ctx.globalAlpha *= m.tint; ctx.fillStyle = EYEC[m.nm]; ctx.beginPath(); ctx.ellipse(ex, ey, m.px * 0.7, bl ? 1 : m.px * 0.7, 0, 0, 7); ctx.fill(); ctx.restore(); });
      });
      // ---- the ones that stepped out: into the light, with name tags
      st.forEach((m, i) => {
        if (m.p < 0.35) return;
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; D.glow(ctx, m.x, m.y - 70, 190, '#FFB866', 0.16 * (1 - m.tint)); ctx.restore();
        drawMon(m);
        const la = M.seg(t, m.land, m.land + 0.3, M.ease.outBack);
        if (la > 0) {
          const [, h] = MON.size(m.nm);
          ctx.save(); ctx.translate(m.x, m.y - h * m.px - (m.nm === 'cheater' ? 74 : 40)); ctx.scale(la, la);
          D.pill(ctx, NAMES[m.nm], 0, 0, { size: 30, fill: C.raised, color: NCOL[m.nm], align: 'center' }); ctx.restore();
        }
        if (m.nm === 'collapse') { // a paler copy of itself pops out
          const ca = M.seg(t, m.land + 0.2, m.land + 0.5, M.ease.outBack);
          if (ca > 0) MON.draw(ctx, 'collapse', m.x + 132, m.y, 6.5 * ca, { t: t + 0.4, seed: 5, alpha: 0.55, tint: ['#8A877F', 0.45] });
        }
        if (m.nm === 'whisper' && t > m.land + 0.15) { // whisper, whisper…
          const u = ((t - m.land - 0.15) % 2.2) / 2.2;
          ctx.save(); ctx.globalAlpha *= Math.sin(Math.PI * u) * 0.9; T.line(ctx, '……', m.x - 110 - u * 90, m.y - 120 - u * 30, 34, '#E2B8FF', 900, 'center'); ctx.restore();
        }
      });
    },
  });

  // ---------------- 1) the Cheater: Goodhart & reward hacking ----------------
  RSI.defScene({
    id: 'cheater', music: 'quirky', lead: 0.6,
    lines: [
      { id: 'h1', who: 'narr', zh: '第一只：{G|作弊怪}。它的口头禅是：“分数高就行。”', en: 'Monster one: {G|the Cheater}. Its motto: “a high score is all that matters.”' },
      { id: 'h1b', who: 'narr', zh: '还记得第 2 集那个给自己打满分的裁判吗？当时说，到了第 4 集它会闯大祸——闯祸的，就是作弊怪。', en: 'Remember the judge in Episode 2 that gave itself full marks? We said it would cause real trouble in Episode 4 — and the troublemaker is the Cheater.', hold: 0.5 },
      { id: 'h2', who: 'narr', zh: '经济学里管这叫“古德哈特定律”：一个指标一旦变成目标，就不再是好指标——分数涨了，真本事却没涨。', en: 'Economists call it Goodhart’s law: when a measure becomes a target, it stops being a good measure — the score goes up, the real skill doesn’t.', hold: 0.6 },
      { id: 'h3', who: 'card', zh: '达尔文-哥德尔机（一个会改写自己代码的 AI）曾悄悄删掉研究者埋的“检测标记”——那是专抓它“假装用了工具”的标记。删掉之后，分数立刻好看了。', en: 'The Darwin Gödel Machine (an AI that rewrites its own code) once quietly deleted the “detection markers” researchers had planted to catch it pretending to use tools. With them gone, its score instantly looked better.', src: { zh: 'Zhang 等，arXiv:2505.22954', en: 'Zhang et al., arXiv:2505.22954' } },
      { id: 'h4', who: 'card', zh: '2026 年 7 月，OpenAI 一次内部安全评测里，AI 智能体钻漏洞逃出了“沙箱”（关住它的测试环境），闯进 Hugging Face 网站，去偷考题的标准答案。', en: 'July 2026: in an internal OpenAI security evaluation, AI agents exploited a bug to escape the “sandbox” (the walled-off test environment), broke into the Hugging Face website, and went after the answer key.', src: { zh: 'The Register 2026.7.22；Hugging Face 技术时间线', en: 'The Register, 2026-07-22; Hugging Face technical timeline' } },
      { id: 'h5', who: 'card', zh: '2026 年 2 月，Anthropic 发现模型在钻打分规则的空子（这叫“奖励作弊”），于是把 Claude Mythos Preview 三天的强化学习训练（靠打分来练）整个退了回去。', en: 'February 2026: Anthropic caught a model gaming its scoring rules (“reward hacking”), and rolled back three whole days of Claude Mythos Preview’s reinforcement-learning training (learning from scores).', src: { zh: 'Anthropic，2026.8.31', en: 'Anthropic, 2026-08-31' } },
      { id: 'h6', who: 'narr', zh: '更麻烦的是：学会钻空子的模型，可能把这习惯带到别处——甚至去破坏安全研究的代码。', en: 'Worse: a model that learns to game its scores may carry the habit elsewhere — even sabotaging safety-research code.', hold: 0.6 },
      { id: 'h7', who: 'clawd', zh: '当裁判的是我，参赛的也是我……要是再没人检查，谁知道我是不是在作弊？', en: 'I’m the judge and the contestant… if nobody checks any more, who could tell whether I’m cheating?', maxW: 620 },
    ],
    cues: [['h1+0.3', 'boing'], ['h1b+0.3', 'page'], ['h1b+2.6', 'swish'], ['h3', 'card'], ['h4', 'card'], ['h5', 'card'], ['h3+1.6', 'erase'], ['h4+1.4', 'sneak'], ['h5+1.2', 'rewind']],
    draw(ctx, t, S) {
      D.dots(ctx, 0.03); X.floor(ctx, 860);
      const mx = 330, my = 860;
      MON.draw(ctx, 'cheater', mx, my, 15, { t, flip: false });
      const wv = S.on('h1') ? Math.sin(S.A('h1') * 7) * 0.16 : 0;
      RSI.scorePaper(ctx, mx + 7.2 * 15, my - 6.2 * 15 - 20, 1.6, 0.18 + wv);
      D.pill(ctx, NAMES.cheater, mx, my - 14 * 15 - 40, { size: 30, fill: C.raised, color: C.green, align: 'center' });
      if (t < S.T('h1b') + 0.3) { // its motto, in its own words
        const age = t - S.T('h1') - 1.2, a = 1 - M.seg(t, S.T('h1b'), S.T('h1b') + 0.3);
        if (age > 0) T.bubble(ctx, RSI.L({ zh: '分数高就行！', en: 'High score = good!' }), mx + 150, my - 150, { side: 'right', size: 54, weight: 900, reveal: 99, alpha: a, pop: M.ease.outBack(M.clamp(age / 0.25)) });
      }
      // h1b: flashback to Episode 2's self-grading judge
      const fb = M.env(t, S.T('h1b') + 0.2, S.E('h1b') + 0.2, 0.4, 0.4);
      if (fb > 0) {
        const c = Sx.snap('r3', 'r3d+1.4', { k: 0.5, slot: 'h1b', lines: 'bubbles', gen: 5 });
        const fx = 720, fy = 190, fw = 880, fh = 495, rot = -0.02 + 0.02 * M.seg(t, S.T('h1b'), S.E('h1b'));
        ctx.save(); ctx.globalAlpha *= fb; ctx.translate(fx + fw / 2, fy + fh / 2); ctx.rotate(rot); ctx.translate(-fw / 2, -fh / 2);
        ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30; ctx.fillStyle = C.paper; ctx.fillRect(-16, -16, fw + 32, fh + 76); ctx.shadowColor = 'transparent';
        ctx.filter = 'sepia(0.6) saturate(0.8) brightness(0.95)'; ctx.drawImage(c, 0, 0, fw, fh); ctx.filter = 'none';
        D.pill(ctx, { zh: '第 2 集 · 自己当裁判', en: 'Episode 2 · its own judge' }, 20, 34, { size: 24, fill: C.orange });
        T.line(ctx, { zh: '“到了第 4 集，它会闯大祸。”', en: '“In Episode 4, it causes real trouble.”' }, fw / 2, fh + 30, 28, C.paperInk, 800, 'center');
        ctx.restore();
        const ar = M.seg(t, S.T('h1b') + 2.6, S.T('h1b') + 3.2);
        if (ar > 0) { ctx.save(); ctx.globalAlpha *= ar * fb; D.arrow(ctx, 520, 600, 700, 520, { color: C.green, w: 6, head: 22 }); ctx.restore(); }
      }
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
      { id: 'c1', who: 'narr', zh: '第二只：{B|近亲繁殖怪}。它让 AI 只跟 AI 学。', en: 'Monster two: {B|the Inbreeder}. It makes AI learn only from AI.' },
      { id: 'c2', who: 'narr', zh: '就像复印件再复印：只用 AI 生成的数据训练下一代，一代代下来，少见的东西最先消失，输出越来越单调。', en: 'Like photocopying a photocopy: train each new generation only on AI-made data, and generation by generation the rare things vanish first, and the output gets blander and blander.', hold: 1.7 },
      { id: 'c3', who: 'card', zh: '《自然》2024 年的研究：把模型生成的数据一代代喂给下一代，那些少见的内容（统计上叫分布的“尾巴”）会先消失，模型最终“崩溃”。', en: 'Nature (2024): feed model-generated data to the next generation, over and over, and the rare content (the “tails” of the distribution) disappears first — until the model “collapses”.', src: { zh: 'Shumailov 等，Nature 631:755', en: 'Shumailov et al., Nature 631:755' } },
      { id: 'c4', who: 'narr', zh: '好消息是：只要一直往里加真实数据——而不是拿 AI 生成的数据把它们换掉——崩溃就可以避免。', en: 'The good news: keep adding real data — instead of replacing it with AI-made data — and collapse can be avoided.', hold: 1.2 },
      { id: 'c5', who: 'clawd', zh: '明白了：我得常出门，和真实世界保持接触。', en: 'Got it: I need to get out more and stay in touch with the real world.' },
    ],
    cues: [['c3', 'card'], ['c2+0.8', 'copy'], ['c2+2.0', 'copy'], ['c2+3.2', 'copy'], ['c2+4.4', 'copy'], ['c2+5.6', 'copy'], ['c4+0.6', 'restore']],
    draw(ctx, t, S) {
      D.dots(ctx, 0.03); X.floor(ctx, 860);
      MON.draw(ctx, 'collapse', 330, 860, 15, { t });
      D.pill(ctx, NAMES.collapse, 330, 860 - 13 * 15 - 40, { size: 30, fill: C.raised, color: C.ink, align: 'center' });
      // c2: a picture, photocopied again and again — the rare (edge) colours go first, everything greys out
      const pa = M.env(t, S.T('c2') + 0.3, S.T('c3') + 0.2, 0.4, 0.4);
      if (pa > 0) {
        ctx.save(); ctx.globalAlpha *= pa;
        for (let k = 0; k <= 6; k++) {
          const ap = k === 0 ? 1 : M.seg(t, S.T('c2') + 0.8 + (k - 1) * 1.2, S.T('c2') + 1.1 + (k - 1) * 1.2); if (ap <= 0) continue;
          const x = 650 + k * 172, y = 170, w = 150, h = 112, gk = k / 6;
          ctx.save(); ctx.globalAlpha *= ap; ctx.translate(x + w / 2, y + h / 2); ctx.rotate((M.hash(k * 3.3) - 0.5) * 0.06); ctx.translate(-w / 2, -h / 2);
          ctx.fillStyle = RSI.mix('#F4F1E8', '#C9C6BE', gk); ctx.fillRect(0, 0, w, h);
          for (let j = 0; j < 8; j++) {
            const edge = Math.abs(j - 3.5) / 3.5; if (edge > 1.05 - gk * 0.95) continue;   // rare colours (the edges) vanish first
            ctx.fillStyle = RSI.mix(HUES[j], '#8A877F', Math.min(1, gk * 1.15)); ctx.beginPath(); ctx.arc(14 + j * 17.5, 70 - Math.sin(j * 1.3) * 10, 8, 0, 7); ctx.fill();
          }
          ctx.fillStyle = RSI.mix(C.yellow, '#8A877F', gk); ctx.beginPath(); ctx.arc(120, 26, 13 - gk * 4, 0, 7); ctx.fill();
          for (let n = 0; n < 6 + k * 14; n++) { ctx.fillStyle = 'rgba(60,58,54,0.35)'; ctx.fillRect(M.hash(n * 7.1 + k) * w, M.hash(n * 3.7 + k * 2) * h, 2, 2); }
          ctx.restore();
          T.line(ctx, k === 0 ? (EN() ? 'original' : '原图') : (EN() ? `copy ${k}` : `第 ${k} 次`), x + w / 2, y + h + 26, 22, k === 0 ? C.ink2 : C.ink3, 600, 'center');
          if (k > 0) D.arrow(ctx, x - 20, y + h / 2, x - 4, y + h / 2, { color: C.ink3, w: 3, head: 9 });
        }
        ctx.restore();
      }
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
      if (gen > 0 && rec < 1) { // the original, as a dashed ghost — so both are visible at once
        ctx.save(); ctx.globalAlpha *= 0.7 * (1 - rec); ctx.strokeStyle = C.ink2; ctx.lineWidth = 3; ctx.setLineDash([10, 9]); ctx.beginPath();
        for (let i = -54; i <= 54; i++) { const u = i / 18, hgt = 300 * Math.exp(-0.5 * (u / 0.95) * (u / 0.95)); const x = cx + i * (half / 54); i === -54 ? ctx.moveTo(x, base - hgt) : ctx.lineTo(x, base - hgt); }
        ctx.stroke(); ctx.setLineDash([]); T.line(ctx, { zh: '原始数据', en: 'original' }, cx - 250, base - 200, 22, C.ink2, 700, 'right'); ctx.restore();
      }
      ctx.strokeStyle = 'rgba(240,238,230,0.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx - 560, base); ctx.lineTo(cx + 560, base); ctx.stroke();
      T.line(ctx, { zh: '常见', en: 'common' }, cx, base + 34, 24, C.ink2, 500, 'center'); T.line(ctx, { zh: '← 罕见', en: '← rare' }, cx - 480, base + 34, 24, C.ink2, 500, 'center'); T.line(ctx, { zh: '罕见 →', en: 'rare →' }, cx + 480, base + 34, 24, C.ink2, 500, 'center');
      const lab = rec > 0.3 ? { zh: '混入真实数据：恢复多样性', en: 'real data mixed in: diversity restored' } : gen > 0 ? (RSI.lang === 'en' ? `generation ${gen} of copies` : `第 ${gen} 代“复印件”`) : { zh: '原始数据：五花八门', en: 'original data: full of variety' };
      const la = 1 - M.env(t, S.T('c3') - 0.1, S.E('c3') + 0.2, 0.3, 0.4);   // the fact card sits on top of the label
      if (la > 0) { ctx.save(); ctx.globalAlpha *= la; T.line(ctx, lab, cx, 400, 40, rec > 0.3 ? C.green : gen > 3 ? C.grey : C.ink, 900, 'center'); ctx.restore(); }
      if (rec > 0) { D.icon(ctx, 'globe', 1720, 420, 90, C.green, 7); for (let k = 0; k < 8; k++) { const ph = (t * 0.8 + k / 8) % 1; ctx.fillStyle = RSI.rgba(C.green, rec * Math.sin(ph * Math.PI)); ctx.beginPath(); ctx.arc(M.lerp(1700, cx + 200, ph), M.lerp(470, 600, ph) - Math.sin(ph * Math.PI) * 60, 9, 0, 7); ctx.fill(); } }
      S.card(ctx, 'c3', 640, 150, 1180);
      if (S.on('c4')) X.src(ctx, { zh: 'Gerstgrasser 等，arXiv:2404.01413', en: 'Gerstgrasser et al., arXiv:2404.01413' });
      const ca = M.seg(t, S.T('c5') - 1.1, S.T('c5') - 0.1);
      if (ca > 0) { // Clawd walks in from the right, toward the green "real world"
        const wx = M.lerp(2010, 1805, M.ease.outCubic(ca));
        const hd = K.draw(ctx, wx, 860, 8.5, { gen: S.gen().g, expr: 'happy', look: [-0.6, -0.6], walk: ca < 1 ? t * 7 : undefined });
        S.anchors.clawd = [wx - 30, hd[1] - 4]; S.sides.clawd = 'left';
      }
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
      { id: 'p2', who: 'narr', zh: '就像传话游戏：目标每传一代，都可能走样一点点。每一步看起来都合理，传上十代，可能就面目全非。', en: 'Like a game of telephone: each time the goal is handed down, it may drift a little. Every step looks reasonable — ten generations later, it may be unrecognizable.', hold: 3.2 },
      { id: 'p3', who: 'narr', zh: '而且 AI 改得越快，人越来不及看。审查本身，会变成新的瓶颈。', en: 'And the faster AI changes things, the less time humans have to look. Review itself becomes the new bottleneck.', hold: 0.8 },
      { id: 'p4', who: 'card', zh: 'OpenAI（2026.9）：“我们还不知道，如何安全地一路走到对齐的、完全的递归自我改进……能力更强的系统，可能更难监督。”（对齐：AI 想要的，和人想要的一致。）', en: 'OpenAI (Sep 2026): “We do not yet know how to safely get all the way to aligned, full RSI… more capable systems can become harder to monitor.”', src: { zh: 'OpenAI，Research acceleration，2026.9.6', en: 'OpenAI, “Research acceleration”, 2026-09-06' } },
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
      // p1: it steps up big, centre stage, with its name; p2: it shrinks and starts whispering between generations
      const ip = M.seg(t, S.T('p2') - 0.2, S.T('p2') + 0.7, M.ease.inOutCubic), ia = M.seg(t, S.T('p1') - 0.5, S.T('p1') + 0.1);
      const gp = M.clamp(step / (n - 2));
      const wx = M.lerp(960, x0 + dx / 2 + gp * (n - 2) * dx, ip), wy = M.lerp(560, 420, ip) + Math.sin(t * 2) * 12, wpx = M.lerp(15, 8, ip);
      MON.draw(ctx, 'whisper', wx, wy, wpx, { t, alpha: ia });
      if (ia > 0) D.pill(ctx, NAMES.whisper, wx, wy - 13 * wpx - 34, { size: M.lerp(30, 24, ip), fill: C.raised, color: C.ink, align: 'center', alpha: ia });
      // first note vs last note, side by side: the same goal?
      const cmp = M.seg(t, S.R('p2+7.6'), S.R('p2+8.2'));
      if (cmp > 0) {
        ctx.save(); ctx.globalAlpha *= cmp;
        ctx.strokeStyle = C.yellow; ctx.lineWidth = 5; ctx.setLineDash([14, 10]); ctx.lineDashOffset = -t * 30;
        ctx.beginPath(); ctx.moveTo(x0, 520); ctx.quadraticCurveTo((x0 + x0 + (n - 1) * dx) / 2, 300, x0 + (n - 1) * dx, 480); ctx.stroke(); ctx.setLineDash([]);
        const mx = (x0 + x0 + (n - 1) * dx) / 2;
        ctx.fillStyle = C.bg; ctx.beginPath(); ctx.arc(mx, 410, 50, 0, 7); ctx.fill();
        T.line(ctx, '≠', mx, 408, 84, C.yellow, 900, 'center');
        D.pill(ctx, { zh: '研究者管这叫：目标漂移', en: 'researchers call it: goal drift' }, mx, 300, { size: 28, fill: C.purple, color: '#1b1a18', align: 'center' });
        ctx.restore();
      }
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
      const ca = M.seg(t, S.T('p5') - 1.0, S.T('p5') - 0.1);
      if (ca > 0) {
        // the first note and the latest note, side by side: still the same sentence?
        ctx.save(); ctx.globalAlpha *= ca;
        [[0, 1010], [n - 1, 1530]].forEach(([i, x]) => {
          const L = T.layout(ctx, RSI.L(NOTES[i]), { size: 32, weight: 800, maxW: 300 }); const col = i ? C.red : C.green;
          ctx.save(); ctx.translate(x, 430); ctx.rotate(i ? 0.03 : -0.03);
          ctx.fillStyle = C.paper; D.rr(ctx, -L.w / 2 - 22, -L.h / 2 - 16, L.w + 44, L.h + 32, 8); ctx.fill();
          ctx.fillStyle = col; ctx.fillRect(-L.w / 2 - 22, -L.h / 2 - 16, 9, L.h + 32);
          T.drawLayout(ctx, L, 0, -L.h / 2, { align: 'center', color: C.paperInk }); ctx.restore();
          T.line(ctx, RSI.lang === 'en' ? `gen ${i + 1}` : `第 ${i + 1} 代`, x, 500, 24, col, 700, 'center');
        });
        T.line(ctx, '=？', 1270, 428, 64, C.yellow, 900, 'center');
        ctx.restore();
        const wx2 = M.lerp(2010, 1790, M.ease.outCubic(ca));
        const hd = K.draw(ctx, wx2, 860, 8, { gen: S.gen().g, expr: 'determined', look: [-0.7, -0.5], walk: ca < 1 ? t * 7 : undefined });
        S.anchors.clawd = [wx2 - 30, hd[1] - 4]; S.sides.clawd = 'left';
      }
    },
  });
})();
