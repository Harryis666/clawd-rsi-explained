/* 第三章 爆炸，还是撞墙？: low-hanging fruit, the ratio r, the debate, the walls. */
(function () {
  'use strict';
  const RSI = window.RSI, C = RSI.C, M = RSI.M, D = RSI.D, T = RSI.T, K = RSI.Clawd, X = RSI.X;
  const W = RSI.W, H = RSI.H;
  RSI.chapterCard({ id: 'ch3', music: 'tension', num: { zh: '第三章', en: 'Chapter 3' }, title: { zh: '爆炸，还是撞墙？', en: 'Explosion, or a wall?' }, sub: { zh: '这个循环会越转越快吗？', en: 'Will the loop keep speeding up?' }, label: { zh: '第三章 · 爆炸，还是撞墙？', en: 'Ch.3 · Explosion, or a wall?' } });

  // ---------------- low-hanging fruit + tug of war ----------------
  const FRUITS = (() => { const r = M.rng(42); const a = []; for (let i = 0; i < 16; i++) a.push({ x: 300 + r() * 520, y: 640 - Math.pow(r(), 0.8) * 420, s: 18 + r() * 8 }); a.sort((p, q) => q.y - p.y); return a; })();
  RSI.defScene({
    id: 'tree', music: 'tension', lead: 0.6,
    lines: [
      { id: 'e1', who: 'narr', zh: '每一代 AI 都更聪明，能摘到更高处的果子。', en: 'Each AI generation is smarter, so it can reach higher fruit.' },
      { id: 'e2', who: 'narr', zh: '可低处的果子总是先被摘完。越往后，每一点进步都更难拿到。', en: 'But the low-hanging fruit goes first. The further you go, the harder each bit of progress gets.', hold: 0.6 },
      { id: 'e3', who: 'narr', zh: '于是这是一场拔河：一边是“变聪明带来的加速”，一边是“问题变难的阻力”。', en: 'So it\'s a tug-of-war: “speed-up from getting smarter” versus “drag from problems getting harder”.', hold: 1.4 },
    ],
    cues: [[1.6, 'hop'], [3.4, 'hop'], [5.2, 'hop'], [7.0, 'hop'], [8.8, 'hop'], ['e3+0.6', 'rope']],
    draw(ctx, t, S) {
      D.dots(ctx, 0.03); X.floor(ctx, 760);
      const shift = M.seg(t, S.T('e3') - 0.2, S.T('e3') + 0.8, M.ease.inOutCubic) * -120;
      ctx.save(); ctx.translate(shift, 0);
      // tree
      ctx.fillStyle = '#5B4330'; ctx.beginPath(); ctx.moveTo(530, 760); ctx.lineTo(600, 760); ctx.lineTo(585, 420); ctx.lineTo(545, 420); ctx.fill();
      const blobs = [[560, 300, 230], [400, 380, 170], [720, 380, 170], [470, 220, 150], [650, 220, 150], [560, 480, 160]];
      for (const b of blobs) { ctx.fillStyle = '#2F5A3E'; ctx.beginPath(); ctx.arc(b[0], b[1], b[2], 0, 7); ctx.fill(); }
      for (const b of blobs) { ctx.fillStyle = '#3B7050'; ctx.beginPath(); ctx.arc(b[0] - 20, b[1] - 24, b[2] * 0.75, 0, 7); ctx.fill(); }
      // successive hops: gen k reaches height H_k, picks fruits below that height
      const hops = [1.6, 3.4, 5.2, 7.0, 8.8]; const reach = [600, 520, 430, 340, 280];
      let picked = 0; let hopK = -1;
      hops.forEach((h, k) => { if (t > h) hopK = k; });
      const fruitsPicked = (k) => FRUITS.filter((f) => f.y > reach[k]).length;
      if (hopK >= 0) picked = Math.min(FRUITS.length, fruitsPicked(hopK) - (t - hops[hopK] < 0.45 ? Math.max(0, fruitsPicked(hopK) - (hopK > 0 ? fruitsPicked(hopK - 1) : 0)) : 0));
      FRUITS.forEach((f, i) => { if (i < picked) return; ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(f.x, f.y, f.s, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,0.35)'; ctx.beginPath(); ctx.arc(f.x - f.s * 0.35, f.y - f.s * 0.35, f.s * 0.3, 0, 7); ctx.fill(); });
      // the jumping Clawd
      const k = Math.max(0, hopK); const h0 = hops[k]; const jumpH = 760 - reach[k] - 120;
      const hp = hopK >= 0 ? X.hop(t, h0, 0.7, jumpH) : { dy: 0, sx: 1, sy: 1 };
      K.draw(ctx, 560, 760 + hp.dy, 6, { gen: [3, 4, 6, 8, 11][k], expr: hp.dy < -20 ? 'determined' : 'happy', armL: hp.dy < -20 ? 1 : 0, armR: hp.dy < -20 ? 1 : 0, sx: hp.sx, sy: hp.sy });
      // reach markers
      ctx.setLineDash([8, 10]); ctx.strokeStyle = 'rgba(240,238,230,0.25)'; ctx.lineWidth = 2;
      for (let j = 0; j <= Math.max(0, hopK); j++) { ctx.beginPath(); ctx.moveTo(860, reach[j]); ctx.lineTo(940, reach[j]); ctx.stroke(); T.line(ctx, RSI.lang === 'en' ? `gen ${j + 1}` : `第 ${j + 1} 代`, 950, reach[j], 20, C.ink3, 500, 'left'); }
      ctx.setLineDash([]);
      ctx.restore();
      // tug of war (right side)
      const a = M.seg(t, S.T('e3'), S.T('e3') + 0.8);
      if (a > 0) {
        ctx.save(); ctx.globalAlpha *= a;
        const cx = 1400, cy = 640; const sway = Math.sin((t - S.T('e3')) * 1.3) * 40 * M.seg(t, S.T('e3') + 0.6, S.T('e3') + 1.5);
        ctx.strokeStyle = '#C9A46A'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(1000, cy - 30); ctx.lineTo(1820, cy - 30); ctx.stroke();
        ctx.fillStyle = C.yellow; ctx.fillRect(cx + sway - 4, cy - 70, 8, 80);
        for (let j = 0; j < 3; j++) K.draw(ctx, 1060 + j * 95 + sway, cy + 10, 3.6, { gen: 8, expr: 'determined', armR: 0.4, look: [-0.5, 0], rot: -0.12 });
        for (let j = 0; j < 3; j++) { const x = 1590 + j * 85 + sway; ctx.fillStyle = '#6E6A62'; D.rr(ctx, x - 34, cy - 60, 68, 70, 12); ctx.fill(); ctx.fillStyle = '#58554F'; D.rr(ctx, x - 34, cy - 18, 68, 28, 10); ctx.fill(); }
        T.text(ctx, { zh: '变聪明带来的{o|加速}', en: '{o|speed-up} from smarter AI' }, 1180, 700, { size: 32, weight: 700, align: 'center' });
        T.text(ctx, { zh: '问题变难的{b|阻力}', en: '{b|drag} from harder problems' }, 1680, 700, { size: 32, weight: 700, align: 'center' });
        T.line(ctx, 'VS', 1410, 520, 40, C.ink3, 900, 'center');
        ctx.restore();
      }
    },
  });

  // ---------------- the ratio r: three timelines of generations ----------------
  RSI.defScene({
    id: 'ratio', music: 'tension', lead: 0.6,
    lines: [
      { id: 'v1', who: 'narr', zh: '研究者把这场拔河写成一个比值 {O|r}：加速有多猛，除以变难有多快。', en: 'Researchers write this tug-of-war as a ratio {O|r}: how strong the speed-up is, divided by how fast things get harder.', hold: 0.6 },
      { id: 'v2', who: 'narr', zh: '{o|r 大于 1}：每一代都比上一代来得更快，挤成一点——这就是“智能爆炸”。', en: '{o|r > 1}: each generation arrives faster than the last, crowding into a single point — the “intelligence explosion”.', hold: 1.2 },
      { id: 'v3', who: 'narr', zh: '{y|r 等于 1}：稳步前进。{b|r 小于 1}：越往后越慢，最终趋于平缓。', en: '{y|r = 1}: steady progress. {b|r < 1}: slower and slower, eventually leveling off.', hold: 0.8 },
      { id: 'v4', who: 'clawd', zh: '所以，r 到底是多少？', en: 'So what is r, really?' },
    ],
    cues: [['v2+0.3', 'shepard', { dur: 6.5 }], ['v2+6.4', 'boom']],
    draw(ctx, t, S) {
      D.dots(ctx, 0.03);
      T.text(ctx, { zh: '{O|r} = 加速 ÷ 变难', en: '{O|r} = speed-up ÷ difficulty' }, W / 2, 130, { size: 72, weight: 900, align: 'center' });
      T.text(ctx, { zh: '每个方块 = 造出一代新 AI 花的时间', en: 'each block = time to build the next generation' }, W / 2, 238, { size: 28, weight: 400, align: 'center', color: C.ink3 });
      const x0 = 330, rows = [
        { y: 400, lab: 'r > 1', col: C.orange, f: (k) => 260 * Math.pow(0.76, k), t0: S.T('v2') + 0.3, note: { zh: '越来越快 → 爆炸？', en: 'faster → explosion?' } },
        { y: 560, lab: 'r = 1', col: C.yellow, f: () => 150, t0: S.T('v3') + 0.2, note: { zh: '稳步前进', en: 'steady' } },
        { y: 720, lab: 'r < 1', col: C.blue, f: (k) => 120 * Math.pow(1.35, k), t0: S.T('v3') + 2.4, note: { zh: '越来越慢 → 趋平', en: 'slower → plateau' } },
      ];
      for (const r of rows) {
        const a = M.seg(t, r.t0 - 0.5, r.t0); if (a <= 0) continue;
        ctx.save(); ctx.globalAlpha *= a;
        T.line(ctx, r.lab, 270, r.y, 40, r.col, 900, 'right', 'mono');
        ctx.fillStyle = 'rgba(240,238,230,0.08)'; ctx.fillRect(x0, r.y - 30, 1300, 60);
        const speed = 230; const cursor = Math.max(0, (t - r.t0) * speed);
        let x = 0, k = 0, gens = 0;
        while (k < 400) { const L = r.f(k); if (x >= cursor || x > 1300) break; const w = Math.min(L, cursor - x, 1300 - x); ctx.fillStyle = k % 2 ? r.col : RSI.mix(r.col, '#000000', 0.25); ctx.fillRect(x0 + x, r.y - 26, Math.max(1, w - (L > 6 ? 3 : 0)), 52); if (w >= L) gens++; x += L; k++; if (L < 0.3) break; }
        T.line(ctx, RSI.lang === 'en' ? `${gens} gens` : `${gens} 代`, x0 + 1320, r.y - 14, 28, r.col, 700, 'left');
        T.line(ctx, r.note, x0 + 1320, r.y + 20, 22, C.ink2, 500, 'left');
        ctx.restore();
      }
      // the explosion flash at the limit of r>1 row
      const lim = x0 + 260 / (1 - 0.76); const tb = S.R('v2+6.4');
      if (t > tb - 0.6) { const f = M.seg(t, tb - 0.6, tb); const g = 1 - M.seg(t, tb, tb + 2.5); D.glow(ctx, lim, 400, 120 + 380 * f, C.orangeHi, Math.max(0.3, g)); D.sparkle(ctx, lim, 400, 30 + 30 * f, C.yellow, 0.9, t); }
      const hx = 1700, hy = 940; const hd = K.draw(ctx, hx, hy, 5, { gen: 8, expr: t > S.T('v4') ? 'surprised' : X.blink(t, 3) ? 'blink' : 'normal', look: [-0.6, -0.6], alpha: M.seg(t, S.T('v4') - 0.6, S.T('v4')) });
      S.anchors.clawd = [hx - 30, hd[1]];
    },
  });

  // ---------------- debate ----------------
  const gauge = (ctx, cx, cy, R, v, t) => {
    // v in [0.5, 2.0]
    const a0 = Math.PI * 1.1, a1 = Math.PI * 1.9; const ang = (x) => a0 + (a1 - a0) * M.inv(0.5, 2.0, x);
    ctx.save(); ctx.lineWidth = 26; ctx.lineCap = 'butt';
    ctx.strokeStyle = RSI.rgba(C.blue, 0.8); ctx.beginPath(); ctx.arc(cx, cy, R, ang(0.5), ang(0.97)); ctx.stroke();
    ctx.strokeStyle = RSI.rgba(C.yellow, 0.85); ctx.beginPath(); ctx.arc(cx, cy, R, ang(0.97), ang(1.03)); ctx.stroke();
    ctx.strokeStyle = RSI.rgba(C.orange, 0.85); ctx.beginPath(); ctx.arc(cx, cy, R, ang(1.03), ang(2.0)); ctx.stroke();
    for (const m of [0.5, 1, 1.5, 2]) { const an = ang(m); T.line(ctx, String(m), cx + Math.cos(an) * (R + 44), cy + Math.sin(an) * (R + 44), 24, C.ink2, 700, 'center', 'mono'); }
    const an = ang(v); ctx.strokeStyle = C.ink; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(an) * (R - 20), cy + Math.sin(an) * (R - 20)); ctx.stroke();
    ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(cx, cy, 16, 0, 7); ctx.fill();
    T.line(ctx, `r ≈ ${v.toFixed(1)}`, cx, cy + 56, 40, C.ink, 900, 'center', 'mono');
    ctx.restore();
  };
  RSI.defScene({
    id: 'debate', music: 'tension', lead: 0.6,
    lines: [
      { id: 'd1', who: 'narr', zh: '那么，r 到底是多少？两派的回答截然不同。', en: 'So what is r? The two camps answer very differently.' },
      { id: 'd2', who: 'left', label: { zh: '加速派', en: 'Accelerationist case' }, labelColor: C.orange, zh: '我们估计 r 约为 1.4：每一次“翻倍”，只需上一次 76% 的时间。', en: 'We estimate r ≈ 1.4: each “doubling” takes only 76% as long as the last.', maxW: 640 },
      { id: 'd3', who: 'card', zh: 'Chan、Hinton、Bengio 等 22 位作者（2026.9）：按这一模型，约 17 个月后 AI 研发将快 10 倍——一年的进展约 5 周完成。前提：没有其他瓶颈。', en: 'Chan, Hinton, Bengio and 19 co-authors (Sep 2026): under this model, AI R&D runs 10× faster in ~17 months — a year of progress in ~5 weeks. Assuming no other bottlenecks.', src: 'arXiv:2609.36054' },
      { id: 'd4', who: 'right', label: { zh: '怀疑派', en: 'Skeptic case' }, labelColor: C.blue, zh: '可是：人均 token 用量涨了 124 倍，做的实验只多了 1.6 倍。', en: 'But: tokens per researcher went up 124×, while experiments only rose 1.6×.', maxW: 640 },
      { id: 'd5', who: 'card', zh: 'Anthropic 自己估计：目前模型带来的研发提效约 4 倍；而要让整体研究进展快 2 倍，提效还得再大一个数量级。', en: 'Anthropic\'s own estimate: today\'s models give ~4× uplift; doubling overall research progress would take uplift roughly 10× larger.', src: { zh: 'Ramez Naam，Noahpinion，2026.9.27；Claude Mythos Preview 系统卡', en: 'Ramez Naam, Noahpinion, 2026-09-27; Claude Mythos Preview system card' } },
      { id: 'd6', who: 'narr', zh: '两派唯一的共识是：现有数据，还不足以下定论。', en: 'The one thing both agree on: the data so far can\'t settle it.', hold: 0.8 },
    ],
    cues: [['d3', 'card'], ['d5', 'card']],
    draw(ctx, t, S) {
      D.dots(ctx, 0.03);
      // podiums
      const lx = 330, rx = 1590, py = 820;
      const pod = (x, col, label) => { ctx.fillStyle = RSI.mix(col, '#000000', 0.55); D.rr(ctx, x - 150, py - 6, 300, 150, 12); ctx.fill(); ctx.fillStyle = col; ctx.fillRect(x - 150, py - 6, 300, 12); T.line(ctx, label, x, py + 70, 34, C.ink, 900, 'center'); };
      pod(lx, C.orange, { zh: '加速派', en: 'FAST' }); pod(rx, C.blue, { zh: '怀疑派', en: 'SLOW' });
      const g = S.gen().g;
      const speakL = S.on('d2') || S.on('d3'), speakR = S.on('d4') || S.on('d5');
      const hl = K.draw(ctx, lx, py - 6, 6.5, { gen: g, expr: speakL ? 'determined' : X.blink(t, 1) ? 'blink' : 'normal', look: [1, 0], armR: speakL ? 0.6 + Math.sin(t * 6) * 0.3 : 0, color: C.orange });
      const hr = K.draw(ctx, rx, py - 6, 6.5, { gen: g, expr: speakR ? 'determined' : X.blink(t, 4) ? 'blink' : 'normal', look: [-1, 0], armL: speakR ? 0.6 + Math.sin(t * 6) * 0.3 : 0, color: '#7FA8D8' });
      S.anchors.left = [lx + 40, hl[1]]; S.anchors.right = [rx - 40, hr[1]];
      // gauge
      let v = 1.0;
      const tL = S.T('d2'), tR = S.T('d4'), tE = S.T('d6');
      if (t > tL) v = M.lerp(1.0, 1.4, M.seg(t, tL, tL + 1.2, M.ease.outElastic));
      if (t > tR) v = M.lerp(1.4, 0.8, M.seg(t, tR, tR + 1.2, M.ease.outElastic));
      if (t > tE) v = M.lerp(0.8, 1.0, M.seg(t, tE, tE + 1.0)) + Math.sin(t * 5) * 0.12 * M.seg(t, tE, tE + 1.0);
      gauge(ctx, W / 2, 470, 210, v, t);
      if (t > tE + 0.6) T.line(ctx, '?', W / 2 + 190, 330, 90, C.yellow, 900, 'center');
      // cards centered under the gauge
      S.card(ctx, 'd3', 560, 590, 800); S.card(ctx, 'd5', 560, 590, 800);
    },
  });

  // ---------------- walls ----------------
  const WALLS = [
    { x: 1250, name: { zh: '算力墙', en: 'Compute wall' }, icon: 'gpu', line: 'w1' },
    { x: 2350, name: { zh: '品味墙', en: 'Taste wall' }, icon: 'bulb', line: 'w2' },
    { x: 3450, name: { zh: '并行墙', en: 'Parallelism wall' }, icon: 'people', line: 'w3' },
    { x: 4550, name: { zh: '现实墙', en: 'Reality wall' }, icon: 'globe', line: 'w4' },
  ];
  RSI.defScene({
    id: 'walls', music: 'tension', lead: 0.5,
    lines: [
      { id: 'w0', who: 'narr', zh: '怀疑派还指出了几堵墙。', en: 'The skeptics also point to several walls.', min: 2.2 },
      { id: 'w1', who: 'narr', zh: '{o|算力墙}：实验要算力。一次大规模训练要跑好几个月——想得再快，也得等它跑完。', en: '{o|Compute}: experiments need compute. A big training run takes months — however fast you think, you wait for it to finish.', gap: 1.6, hold: 0.4 },
      { id: 'w2', who: 'narr', zh: '{o|品味墙}：普林斯顿用未发表论文的题目做“影子评测”，发现 AI 擅长研究工程，却不擅长开放式研究——探索太少，下结论太快。', en: '{o|Taste}: a Princeton “shadow evaluation” on unpublished papers found AI strong at research engineering but weak at open-ended research — exploring too little, committing too fast.', gap: 1.6, hold: 0.4 },
      { id: 'w3', who: 'narr', zh: '{o|并行墙}：一万个 AI 同时干活，不等于快一万倍。它们常常想到一块儿去；有经验法则认为，速度大约只随数量的平方根增长。', en: '{o|Parallelism}: 10,000 AIs working at once isn\'t 10,000× faster. They often think alike; one rule of thumb says speed grows only with the square root of their number.', gap: 1.6, hold: 0.4 },
      { id: 'w4', who: 'narr', zh: '{o|现实墙}：还有些答案只能从真实世界拿到——芯片要造，电厂要建，实验要等。', en: '{o|Reality}: some answers only come from the physical world — chips must be made, power plants built, experiments waited on.', gap: 1.6, hold: 0.4 },
      { id: 'w5', who: 'clawd', zh: '所以……不是爆炸，而是一路撞墙？', en: 'So… not an explosion, but wall after wall?' },
      { id: 'w6', who: 'narr', zh: '也可能是：撞上一堵，绕过去，再撞下一堵。', en: 'Or maybe: hit one, find a way around, hit the next.', hold: 1.0 },
    ],
    cues: [['w1-0.25', 'thud'], ['w2-0.25', 'thud'], ['w3-0.25', 'thud'], ['w4-0.25', 'thud'], ['w6+0.6', 'hop']],
    draw(ctx, t, S) {
      // Clawd's world x: runs to each wall (arrives at line start), hops over after line ends
      const stops = WALLS.map((w) => ({ arrive: S.T(w.line) - 0.25, leave: S.E(w.line), x: w.x - 150 }));
      let cx = 400, running = false, hopDy = 0;
      const startRun = 1.0;
      let prevX = 400, prevT = startRun;
      for (let i = 0; i < stops.length; i++) {
        const st = stops[i];
        if (t < st.arrive) { const p = M.seg(t, prevT, st.arrive); cx = M.lerp(prevX, st.x, p); running = t > prevT; break; }
        if (t < st.leave) { cx = st.x; break; }
        // hop over wall i between leave and leave+1.2, landing past it
        const ox = st.x + 330; const p = M.seg(t, st.leave, st.leave + 1.1);
        if (i < 3 && t < st.leave + 1.1) { cx = M.lerp(st.x, ox, p); hopDy = -Math.sin(p * Math.PI) * 300; break; }
        prevX = i < 3 ? ox : st.x; prevT = st.leave + 1.1; cx = prevX;
        if (i === 3) { // last wall: hop at w6
          const t6 = S.R('w6+0.6'); const p6 = M.seg(t, t6, t6 + 1.1);
          cx = M.lerp(st.x, st.x + 330, p6) + Math.max(0, t - t6 - 1.1) * 120; hopDy = -Math.sin(p6 * Math.PI) * 300;
        }
      }
      const cam = cx - 620;
      D.dots(ctx, 0.03, 48, -cam * 0.5, 0);
      X.floor(ctx, 800);
      // walls
      for (const w of WALLS) {
        const sx = w.x - cam; if (sx < -300 || sx > W + 300) continue;
        const wh = 420, ww = 120, top = 800 - wh;
        for (let r = 0; r < 14; r++) for (let c = 0; c < 2; c++) { const off = r % 2 ? 30 : 0; ctx.fillStyle = (r + c) % 3 ? '#8E4F3C' : '#7A4433'; ctx.fillRect(sx - ww / 2 + c * 60 + off - (r % 2 ? 30 : 0), top + r * 30, 58, 28); }
        ctx.fillStyle = 'rgba(0,0,0,0.25)'; ctx.fillRect(sx + ww / 2 - 10, top, 10, wh);
        // sign
        const lit = t > S.T(w.line) - 0.25;
        ctx.save(); ctx.globalAlpha *= lit ? 1 : 0.5;
        D.panel(ctx, sx - 150, top - 150, 300, 120, { fill: lit ? C.raised : C.surface, r: 16 });
        D.icon(ctx, w.icon, sx - 90, top - 90, 56, lit ? C.orange : C.ink3, 8);
        T.line(ctx, w.name, sx + 30, top - 90, 40, lit ? C.ink : C.ink3, 900, 'center');
        ctx.restore();
      }
      // Clawd
      const g = S.gen().g; const bonk = stops.some((s) => t > s.arrive && t < s.arrive + 0.35);
      const run = running && hopDy === 0; const walk = run ? t * 14 : null;
      const bob = run ? -Math.abs(Math.sin(t * 14)) * 10 : 0;
      const ex = bonk ? 'x' : t > S.T('w5') && t < S.E('w5') ? 'worried' : hopDy < 0 ? 'happy' : 'determined';
      const sxq = bonk ? 0.85 : 1, syq = bonk ? 1.1 : 1;
      const head = K.draw(ctx, 620, 800 + hopDy + bob, 6.5, { gen: g, expr: ex, walk, look: [1, 0], sx: sxq, sy: syq, armL: hopDy < 0 ? 1 : 0, armR: hopDy < 0 ? 1 : 0 });
      S.anchors.clawd = [620, head[1]];
      for (const s of stops) { const age = t - s.arrive; if (age > 0 && age < 1.2) for (let k = 0; k < 3; k++) D.sparkle(ctx, 620 + Math.cos(t * 6 + k * 2.1) * 70, head[1] - 10 + Math.sin(t * 6 + k * 2.1) * 20, 16, C.yellow, 1 - age / 1.2, t * 4); }
      // small source notes
      const notes = { w1: { zh: 'OpenAI 2026.9：算力是另一道闸门', en: 'OpenAI, Sep 2026: compute is another gating factor' }, w2: { zh: 'MIT 科技评论 2026.8 · arXiv:2607.27191', en: 'MIT Tech Review, Aug 2026 · arXiv:2607.27191' }, w3: { zh: 'Toby Ord 经验法则，引自 Ramez Naam 2026.9 · Epoch AI 2026.7', en: 'Toby Ord rule of thumb, via Ramez Naam (Sep 2026) · Epoch AI (Jul 2026)' } };
      for (const id in notes) if (S.on(id)) X.src(ctx, notes[id]);
    },
  });
})();
