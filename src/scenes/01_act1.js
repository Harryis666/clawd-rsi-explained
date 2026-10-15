/* 第一章 变得「更会变强」: the research loop, I. J. Good 1965, the flip, compounding. */
(function () {
  'use strict';
  const RSI = window.RSI, C = RSI.C, M = RSI.M, D = RSI.D, T = RSI.T, K = RSI.Clawd, X = RSI.X;
  const W = RSI.W, H = RSI.H;

  RSI.chapterCard({ id: 'ch1', music: 'lofi', num: { zh: '第一章', en: 'Chapter 1' }, title: { zh: '变得「更会变强」', en: 'Getting better at getting better' }, sub: { zh: 'RSI 到底是什么？', en: 'What is RSI, exactly?' }, label: { zh: '第一章 · 变得「更会变强」', en: 'Ch.1 · Getting better at getting better' } });

  // ---------------- the human research loop ----------------
  RSI.defScene({
    id: 'lab', music: 'lofi', lead: 0.8,
    lines: [
      { id: 'l1', who: 'narr', zh: '先看看今天的 AI 是怎么变强的：靠人。', en: 'First, how does AI get better today? Through people.' },
      { id: 'l2', who: 'narr', zh: '研究员提出{b|想法}，写代码做{b|实验}，看{b|评估}分数，再{b|决定}下一步。', en: 'Researchers come up with an {b|idea}, run an {b|experiment}, {b|evaluate} the score, then {b|decide} what to do next.', hold: 1.0 },
      { id: 'l3', who: 'narr', zh: '这样转一圈，往往要几天到几周——研究员还得吃饭、睡觉、开组会。', en: 'One lap takes days to weeks — and researchers also need to eat, sleep and sit through meetings.', hold: 1.2 },
      { id: 'l4', who: 'clawd', zh: '所以这个圈转得慢，是因为……人要睡觉？', en: 'So the loop is slow because… humans need sleep?', maxW: 470 },
    ],
    draw(ctx, t, S) {
      D.dots(ctx, 0.03);
      X.floor(ctx, 820);
      const day = t / 7; const night = (day % 1) > 0.62;
      const hl = t < S.T('l2') ? -1 : t < S.E('l2') ? Math.min(3, Math.floor(M.seg(t, S.T('l2'), S.T('l2') + 4.6) * 4)) : -1;
      const st = night ? 'sleep' : hl === 1 ? 'type' : hl === 0 || hl === 2 ? 'think' : 'type';
      RSI.Human.desk(ctx, 330, 820, 1.35, { state: st, t });
      // day counter
      ctx.save();
      D.panel(ctx, 120, 120, 300, 92, { fill: 'rgba(34,33,30,0.9)', r: 16 });
      D.icon(ctx, night ? 'moon' : 'sun', 172, 166, 52, night ? C.purple : C.yellow, 8);
      T.line(ctx, RSI.lang === 'en' ? `Day ${1 + Math.floor(day)}` : `第 ${1 + Math.floor(day)} 天`, 220, 166, 36, C.ink, 700);
      ctx.restore();
      // loop
      const ph = t / 14;
      D.loop(ctx, 1240, 450, 240, { ai: [0, 0, 0, 0], phase: ph, hi: hl, tokenColor: C.blue });
      T.line(ctx, { zh: '一圈 ≈ 几天到几周', en: 'one lap ≈ days to weeks' }, 1240, 450, 32, C.ink2, 500, 'center');
      // Clawd watching
      const cx = 1680, cy = 870; const ex = t > S.T('l4') ? 'worried' : X.blink(t, 3) ? 'blink' : 'normal';
      const head = K.draw(ctx, cx, cy + X.bob(t, 2), 7, { gen: 1, expr: ex, look: [-0.8, -0.2] });
      S.anchors.clawd = [cx - 40, head[1]];
      if (night) { for (let k = 0; k < 3; k++) { const p2 = (t * 0.5 + k / 3) % 1; ctx.save(); ctx.globalAlpha = Math.sin(p2 * Math.PI) * 0.8; T.line(ctx, 'Z', 470 + p2 * 50, 470 - p2 * 80 - k * 10, 28 + k * 8, C.ink2, 700, 'center'); ctx.restore(); } }
    },
  });

  // ---------------- I. J. Good, 1965 ----------------
  const QUOTE = {
    zh: '“既然设计机器也是一种智力活动，那么一台超智能机器就能设计出更好的机器；届时无疑会出现一场‘智能爆炸’，人类的智力将被远远甩在后面。因此，第一台超智能机器，将是人类需要做出的最后一项发明，”',
    en: '“Since the design of machines is one of these intellectual activities, an ultraintelligent machine could design even better machines; there would then unquestionably be an ‘intelligence explosion,’ and the intelligence of man would be left far behind. Thus the first ultraintelligent machine is the last invention that man need ever make,”',
  };
  RSI.QUOTE2 = { zh: '“……前提是，这台机器足够温顺，愿意告诉我们如何控制它。”', en: '“…provided that the machine is docile enough to tell us how to keep it under control.”' };
  RSI.drawPaper = (ctx, t, S, o) => {
    const px = 330, py = 96, pw = 1260, ph = 780;
    ctx.save(); ctx.translate(W / 2, py + ph / 2); ctx.rotate(-0.012); ctx.translate(-W / 2, -(py + ph / 2));
    ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 40; ctx.shadowOffsetY = 14;
    ctx.fillStyle = C.paper; ctx.fillRect(px, py, pw, ph); ctx.shadowColor = 'transparent';
    ctx.fillStyle = 'rgba(120,100,70,0.08)'; for (let i = 0; i < 26; i++) ctx.fillRect(px, py + 60 + i * 28, pw, 1);
    T.text(ctx, 'I. J. Good · 1965', px + 70, py + 56, { size: 30, weight: 700, fam: 'serif', color: '#7A5B3A' });
    T.text(ctx, { zh: '《关于第一台超智能机器的推测》', en: 'Speculations Concerning the First Ultraintelligent Machine' }, px + 70, py + 102, { size: 26, weight: 400, fam: 'serif', color: C.paperInk2 });
    const L = T.layout(ctx, RSI.L(QUOTE), { size: RSI.lang === 'en' ? 38 : 42, weight: 600, fam: 'serif', maxW: pw - 140, lh: 1.62 });
    T.drawLayout(ctx, L, px + 70, py + 180, { color: C.paperInk, reveal: o.reveal });
    // sticky note covering the second half
    const sy = py + 180 + L.h + 26;
    if (o.showSecond) {
      const L2 = T.layout(ctx, RSI.L(RSI.QUOTE2), { size: RSI.lang === 'en' ? 38 : 42, weight: 700, fam: 'serif', maxW: pw - 140, lh: 1.62, balance: true });
      T.drawLayout(ctx, L2, px + 70, sy, { color: '#A23B1E', reveal: o.reveal2 });
    }
    if (o.sticky) D.sticky(ctx, px + 70, sy - 14, Math.min(pw - 140, 820), 130, { zh: '后半句 · 留到最后再看', en: 'Second half · save it for the end' }, { peel: o.peel || 0, size: 38, rot: -0.02, ty: 66 });
    ctx.restore();
    return { sy };
  };
  RSI.defScene({
    id: 'good', music: 'lofi', lead: 0.6,
    lines: [
      { id: 'g1', who: 'narr', zh: '这个想法并不新。1965 年，曾与图灵共事的英国数学家 I. J. Good 写道：', en: 'The idea isn\'t new. In 1965, I. J. Good — a British mathematician who had worked with Alan Turing — wrote:' },
      { id: 'q', who: 'sys', zh: QUOTE.zh, en: QUOTE.en, at: 'g1+1.2', dur: 9.5, par: 1 },
      { id: 'g2', who: 'narr', zh: '这句话还有后半句。我们先把它贴起来，留到最后再看。', en: 'The sentence has a second half. Let\'s cover it up for now — we\'ll read it at the very end.', at: 'q$+0.2' },
      { id: 'g3', who: 'narr', zh: '此后六十年，它主要是科幻和哲学的话题。直到最近，它开始出现在实验室的论文、博客和时间表里。', en: 'For sixty years it was mostly a topic for sci-fi and philosophy. Only recently did it start showing up in lab papers, blogs and timelines.' },
    ],
    cues: [['g2+0.4', 'stick']],
    draw(ctx, t, S) {
      const ty = S.typed('q');
      RSI.drawPaper(ctx, t, S, { reveal: t < S.T('q') ? 0 : ty.n, sticky: t > S.T('g2') + 0.3 ? 1 : 0, peel: 0 });
      // sticky slap animation
      if (t > S.T('g2') + 0.3 && t < S.T('g2') + 0.6) { ctx.fillStyle = `rgba(255,240,200,${0.25 * (1 - M.seg(t, S.T('g2') + 0.3, S.T('g2') + 0.6))})`; ctx.fillRect(0, 0, W, H); }
    },
  });

  // ---------------- the flip: AI in the loop ----------------
  const flipPhase = (t, S) => { // integrated token speed
    const a = S.R('f3+1.0'), b = S.R('f4$+0.4');
    const v0 = 0.12, v1 = 0.3, v2 = 0.7;
    if (t < a) return t * v0; if (t < b) return a * v0 + (t - a) * v1; return a * v0 + (b - a) * v1 + (t - b) * v2;
  };
  const buildFx = (ctx, t, t0, fromX, fromY, toX, toY, seed) => {
    const p = t - t0; if (p < 0 || p > 2.0) return;
    for (let i = 0; i < 46; i++) {
      const st = M.hash(seed + i) * 0.7; const q = M.clamp((p - st) / 0.9); if (q <= 0 || q >= 1) continue;
      const e = M.ease.inOutCubic(q); const x = M.lerp(fromX, toX + (M.hash(seed + i * 5) - 0.5) * 150, e);
      const y = M.lerp(fromY, toY - M.hash(seed + i * 9) * 90, e) - Math.sin(q * Math.PI) * (120 + M.hash(i) * 80);
      ctx.fillStyle = i % 3 ? C.orange : C.orangeHi; const s = 8 + M.hash(i + seed) * 8; ctx.fillRect(x - s / 2, y - s / 2, s, s);
    }
  };
  RSI.defScene({
    id: 'flip', music: 'lofi', lead: 0.6,
    lines: [
      { id: 'f1', who: 'narr', zh: '现在，把循环里的人，换成 AI 自己。', en: 'Now, replace the human in the loop with the AI itself.' },
      { id: 'f2', who: 'clawd', zh: '想点子、跑实验、打分、做决定——都交给我。', en: 'Ideas, experiments, grading, decisions — leave it all to me.', hold: 0.6 },
      { id: 'f3', who: 'narr', zh: '如果 Clawd 造出的第 2 代更聪明，那第 2 代改进第 3 代时，也会做得更好、更快。', en: 'If the Gen-2 Clawd it builds is smarter, then Gen 2 will do a better, faster job building Gen 3.', hold: 0.8 },
      { id: 'f4', who: 'clawd2', zh: '嗨，前辈。下一代交给我吧！', en: 'Hey, senior. I\'ll take the next one!' },
      { id: 'f5', who: 'narr', zh: '这就是{o|递归}：每一轮的成果，都变成下一轮的工具。', en: 'That\'s the {o|recursion}: each round\'s output becomes the next round\'s tool.', hold: 1.0 },
    ],
    gen: [['f3+1.0', 2], ['f4$+0.4', 3]],
    cues: [['f2+0.2', 'flipNode'], ['f2+0.9', 'flipNode'], ['f2+1.6', 'flipNode'], ['f2+2.3', 'flipNode'], ['f3+0.2', 'build'], ['f3+1.0', 'rezUp'], ['f4$-0.2', 'build'], ['f4$+0.4', 'rezUp']],
    draw(ctx, t, S) {
      D.dots(ctx, 0.03); X.floor(ctx, 800);
      const f2 = S.T('f2'); const ai = [0, 1, 2, 3].map((i) => M.seg(t, f2 + 0.2 + i * 0.7, f2 + 0.6 + i * 0.7, M.ease.outCubic));
      D.loop(ctx, 560, 430, 230, { ai, phase: flipPhase(t, S), tokenColor: C.orange, trail: 0.02 });
      const g = S.gen().g;
      T.line(ctx, g >= 3 ? { zh: '越转越快', en: 'faster and faster' } : g >= 2 ? { zh: '转得更快了', en: 'spinning faster' } : { zh: 'AI 在循环里', en: 'AI in the loop' }, 560, 430, 32, C.orangeL, 700, 'center');
      // generations lineup
      const t2 = S.R('f3+1.0'), t3 = S.R('f4$+0.4');
      const x1 = 1130, x2 = 1420, x3 = 1720, fy = 800;
      const e1 = t > t2 ? 'normal' : X.blink(t, 1) ? 'blink' : 'happy';
      const h1 = K.draw(ctx, x1, fy, 10, { gen: 1, expr: t > t2 ? 'surprised' : e1, look: t > t2 ? [1, 0] : [0, 0], armL: t > f2 && t < S.E('f2') ? 0.8 : 0, armR: t > f2 && t < S.E('f2') ? 0.8 : 0, tag: 'GEN 1' });
      S.anchors.clawd = [x1, h1[1]];
      buildFx(ctx, t, S.T('f3') + 0.2, x1 + 60, fy - 60, x2, fy - 40, 11);
      if (t > t2 - 0.6) {
        const m = M.seg(t, t2 - 0.6, t2 + 0.2); const hp = X.hop(t, t2 + 0.25, 0.4, 30);
        const h2 = K.draw(ctx, x2, fy + hp.dy, 10, { gen: 2, expr: t > S.T('f4') && t < S.E('f4') ? 'happy' : X.blink(t, 2) ? 'blink' : 'normal', look: t > S.T('f4') ? [-0.8, 0] : [0, 0], sx: hp.sx, sy: hp.sy, alpha: m, armR: t > S.T('f4') && t < S.E('f4') ? 0.9 : 0, tag: 'GEN 2', tagFill: C.orangeD });
        S.anchors.clawd2 = [x2, h2[1]];
        if (m < 1) D.glow(ctx, x2, fy - 50, 220, C.orangeHi, 1 - m);
      }
      buildFx(ctx, t, S.E('f4') - 0.2, x2 + 60, fy - 60, x3, fy - 40, 23);
      if (t > t3 - 0.5) {
        const m = M.seg(t, t3 - 0.5, t3 + 0.1); const hp = X.hop(t, t3 + 0.2, 0.4, 36);
        K.draw(ctx, x3, fy + hp.dy, 10, { gen: 3, expr: X.blink(t, 4) ? 'blink' : 'happy', sx: hp.sx, sy: hp.sy, alpha: m, tag: 'GEN 3', tagFill: C.orange, tagColor: '#1b1a18' });
        if (m < 1) D.glow(ctx, x3, fy - 50, 220, C.orangeHi, 1 - m);
        X.sparkles(ctx, x3, fy - 60, t, 7, 140, C.yellow, 5, M.seg(t, t3, t3 + 0.5));
      }
      // arrows between generations
      if (t > t2) { ctx.save(); ctx.globalAlpha = M.seg(t, t2, t2 + 0.4); D.arrow(ctx, x1 + 95, fy - 140, x2 - 95, fy - 140, { color: C.ink3, w: 4 }); ctx.restore(); }
      if (t > t3) { ctx.save(); ctx.globalAlpha = M.seg(t, t3, t3 + 0.4); D.arrow(ctx, x2 + 95, fy - 140, x3 - 95, fy - 140, { color: C.orangeL, w: 5 }); ctx.restore(); }
    },
  });

  // ---------------- compounding staircase ----------------
  RSI.defScene({
    id: 'compound', music: 'lofi', lead: 0.6,
    lines: [
      { id: 'k1', who: 'narr', zh: '普通的进步像爬楼梯：每一步，台阶差不多高。', en: 'Ordinary progress is like climbing stairs: every step is about the same height.' },
      { id: 'k2', who: 'narr', zh: 'RSI 的关键在于：被改进的，正是“改进”这件事本身。于是台阶越来越高，步子也越来越快。', en: 'The key to RSI: the thing being improved is improvement itself. So the steps get taller — and come faster.', hold: 0.6 },
      { id: 'k3', who: 'narr', manual: true, zh: '不只是变强，而是变得{o|更会变强}。', en: 'Not just getting better — getting {o|better at getting better}.', dur: 4.2 },
      { id: 'k4', who: 'clawd', zh: '听起来……会一发不可收拾？', en: 'Sounds like… it could spiral out of control?' },
      { id: 'k5', who: 'narr', zh: '会不会，取决于几个具体问题。先看看：今天的 AI，已经爬到了第几级。', en: 'Whether it does depends on some concrete questions. First: how high has today\'s AI already climbed?' },
    ],
    cues: [['k3+0.1', 'statement']],
    draw(ctx, t, S) {
      D.dots(ctx, 0.03);
      const ox = 200, oy = 830, gw = 1300, gh = 600;
      D.axes(ctx, ox, oy - gh, gw, gh, { xl: { zh: '轮次 →', en: 'rounds →' }, yl: { zh: '能力 →', en: 'capability →' } });
      // linear stairs (blue)
      const n = 10, sw = gw / n;
      const pa = M.seg(t, S.T('k1'), S.T('k1') + 3.5);
      ctx.save(); ctx.strokeStyle = C.blue; ctx.lineWidth = 6; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(ox, oy);
      const stepsA = Math.floor(pa * n);
      for (let i = 0; i < stepsA; i++) { ctx.lineTo(ox + i * sw, oy - (i + 1) * 34); ctx.lineTo(ox + (i + 1) * sw, oy - (i + 1) * 34); }
      ctx.stroke(); ctx.restore();
      if (pa > 0.3) T.line(ctx, { zh: '人来改进：每步差不多高', en: 'humans improving: equal steps' }, ox + gw - 10, oy - 34 * n - 40, 28, C.blue, 700, 'right');
      // accelerating stairs (orange): step i width shrinks, height grows
      const pb = M.seg(t, S.T('k2') + 0.6, S.T('k2') + 5.0);
      let x = ox, y = oy, w0 = 260, h0 = 22; const pts = [[x, y]];
      for (let i = 0; i < 14; i++) { const w = w0 * Math.pow(0.78, i), h = h0 * Math.pow(1.42, i); y -= h; pts.push([x, y]); x += w; pts.push([x, y]); if (y < oy - gh) break; }
      const total = pts.length - 1; const m = pb * total;
      ctx.save(); ctx.strokeStyle = C.orange; ctx.lineWidth = 7; ctx.lineJoin = 'round'; ctx.shadowColor = C.orange; ctx.shadowBlur = 16;
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i <= Math.floor(m); i++) ctx.lineTo(pts[i][0], Math.max(oy - gh, pts[i][1]));
      if (m < total && Math.floor(m) + 1 <= total) { const a = pts[Math.floor(m)], b = pts[Math.floor(m) + 1]; const f = m - Math.floor(m); ctx.lineTo(M.lerp(a[0], b[0], f), Math.max(oy - gh, M.lerp(a[1], b[1], f))); }
      ctx.stroke(); ctx.restore();
      if (pb > 0.5) T.line(ctx, { zh: 'AI 改进 AI：台阶越来越高、越来越快', en: 'AI improving AI: taller, faster steps' }, ox + 520, oy - gh + 30, 28, C.orange, 700, 'left');
      // little Clawd riding the orange stairs
      const ci = Math.min(total, Math.max(0, Math.floor(m))); const cp = pts[ci];
      if (pb > 0) K.draw(ctx, Math.min(cp[0] + 10, ox + gw), Math.max(oy - gh + 10, cp[1]), 3.2, { gen: 3, expr: 'happy', shadow: false });
      // big statement
      if (t > S.T('k3')) {
        const a = M.env(t, S.T('k3'), S.E('k3') + 30, 0.4, 0.4); const sc = 0.94 + 0.06 * M.ease.outBack(M.seg(t, S.T('k3'), S.T('k3') + 0.5));
        ctx.save(); ctx.globalAlpha *= a; ctx.fillStyle = 'rgba(20,20,19,0.82)'; ctx.fillRect(0, 0, W, H);
        ctx.translate(W / 2, 470); ctx.scale(sc, sc);
        T.text(ctx, RSI.L(S.sc.byId.k3), 0, -60, { size: RSI.lang === 'en' ? 70 : 84, weight: 900, align: 'center', maxW: 1600 });
        ctx.restore();
        const hx = 1600, hy = 860; const hd = K.draw(ctx, hx, hy, 8, { gen: 3, expr: t > S.T('k4') && t < S.E('k4') ? 'worried' : X.blink(t, 6) ? 'blink' : 'normal', look: [-0.5, -0.3], alpha: M.seg(t, S.T('k4') - 0.8, S.T('k4') - 0.2) });
        S.anchors.clawd = [hx - 30, hd[1]];
      }
    },
  });
})();
