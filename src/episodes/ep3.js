/* 《Clawd 造 Clawd》第 3 集《爆炸，还是撞墙？》— manifest + the episode's own scenes:
   cold open (分身思想实验：越改越快 vs 越改越慢) · recap · 本集问题 · the night road · cliffhanger · next-episode teaser.
   The body lives in src/scenes/debate.js (ratio · debate · walls) and src/scenes/timeline2026.js (forecasts).
   v3: cold open runs 1.3× faster (SPD), recap 2 beats, no episode-number line, tighter night road, 3-beat teaser. */
(function () {
  'use strict';
  const RSI = window.RSI, C = RSI.C, M = RSI.M, D = RSI.D, T = RSI.T, K = RSI.Clawd, X = RSI.X, Sx = RSI.Series, MON = RSI.Monster;
  const W = RSI.W, H = RSI.H;
  const EN = () => RSI.lang === 'en';

  // ================================================================== 1 · cold open: one Clawd, two futures (thought experiment)
  const MID = 960, GY = 800;                  // split divider · ground line of both futures
  const AX = 330, BX0 = 1150, BWALL = 1745, WALL_U = 7.2;
  const PXD = 1.6;                            // px per day — the same ruler on both sides
  const SPD = 1.3, OFF = 0.6;                 // v3: the two futures play 1.3× faster, starting 0.6 s after k1 (v2: 1.0× / 0.9 s)
  const cu = (u) => 'k1$+' + (OFF + u / SPD).toFixed(2);   // cue time for model time u
  const FX0 = 960, FY0 = 900, FS0 = 11;       // Clawd at the fork
  const nA = (u) => (u <= 0 ? 8 : u >= 4 ? Infinity : 8 + Math.log(1 - u / 4) / Math.log(0.75)); // each gen takes 3/4 of the last
  const nB = (u) => 8 + Math.log(1 + M.clamp(u, 0, WALL_U) / 2) / Math.log(1.5);                // each gen takes 1.5× the last
  const uA = (n) => 4 * (1 - Math.pow(0.75, n - 8));
  const uB = (n) => 2 * (Math.pow(1.5, n - 8) - 1);
  const xB = (u) => BX0 + (BWALL - BX0) * Math.log(1 + M.clamp(u, 0, WALL_U) / 2) / Math.log(1 + WALL_U / 2);
  const fmtDays = (d) => {
    if (d >= 1) return (d >= 10 ? Math.round(d) : d.toFixed(1)) + (EN() ? ' days' : ' 天');
    const h = d * 24; if (h >= 1) return Math.round(h) + (EN() ? ' hours' : ' 小时');
    const m = h * 60; if (m >= 1) return Math.round(m) + (EN() ? ' min' : ' 分钟');
    return Math.max(1, Math.round(m * 60)) + (EN() ? ' s' : ' 秒');
  };
  const signBoard = (ctx, x, y, dir, w, text, col, glow) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(dir, 1);
    if (glow > 0) D.glow(ctx, w / 2, 0, w * 0.7, col, 0.4 * glow);
    ctx.fillStyle = '#6B5337'; ctx.beginPath(); ctx.moveTo(0, -36); ctx.lineTo(w - 36, -36); ctx.lineTo(w, 0); ctx.lineTo(w - 36, 36); ctx.lineTo(0, 36); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = RSI.mix('#6B5337', col, 0.4 + 0.6 * glow); ctx.lineWidth = 4; ctx.stroke();
    ctx.scale(dir, 1); T.line(ctx, text, dir * ((w - 36) / 2 + 4), 2, EN() ? 25 : 31, RSI.mix(C.paper, col, 0.45), 900, 'center'); ctx.restore();
  };
  const fork = (ctx, t) => {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#4A5059'); g.addColorStop(0.5, '#2A2A2B'); g.addColorStop(1, '#100F0D'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 7; i++) { const x = ((i * 420 + t * (14 + i * 3) * (i % 2 ? 1 : -1)) % 2600 + 2600) % 2600 - 340; ctx.fillStyle = 'rgba(214,220,228,0.07)'; ctx.beginPath(); ctx.ellipse(x, 140 + i * 70, 560, 80, 0, 0, 7); ctx.fill(); }
    // two roads leaving the fork
    const road = (pts, col) => { ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = '#3A3530'; ctx.lineWidth = 120; ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); ctx.bezierCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1], pts[3][0], pts[3][1]); ctx.stroke();
      ctx.strokeStyle = RSI.rgba(col, 0.75); ctx.lineWidth = 8; ctx.setLineDash([26, 20]); ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); ctx.bezierCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1], pts[3][0], pts[3][1]); ctx.stroke(); ctx.restore(); };
    road([[930, 1100], [880, 860], [520, 640], [120, 330]], C.orange);
    road([[990, 1100], [1060, 880], [1380, 800], [1840, 760]], C.blue);
    // wall at the end of the right road, glow at the end of the left one
    for (let r = 0; r < 6; r++) for (let c = 0; c < 3; c++) { ctx.fillStyle = (r + c) % 2 ? '#6A4136' : '#5C382E'; ctx.fillRect(1760 + c * 44 + (r % 2) * 22, 560 + r * 34, 42, 31); }
    D.glow(ctx, 160, 300, 260, C.orange, 0.35 + 0.1 * Math.sin(t * 3));
    // near fog
    const fg = ctx.createLinearGradient(0, 0, 0, 560); fg.addColorStop(0, 'rgba(200,206,214,0.55)'); fg.addColorStop(1, 'rgba(200,206,214,0)'); ctx.fillStyle = fg; ctx.fillRect(0, 0, W, 560);
    // signpost
    ctx.fillStyle = '#5A4430'; D.rr(ctx, FX0 - 11, 470, 22, 440, 6); ctx.fill();
    signBoard(ctx, FX0 - 10, 520, -1, EN() ? 420 : 400, { zh: '越转越快 · 爆炸？', en: 'faster & faster · boom?' }, C.orange, 0.6 + 0.4 * Math.sin(t * 2.4));
    signBoard(ctx, FX0 + 10, 612, 1, EN() ? 420 : 400, { zh: '越转越慢 · 撞墙？', en: 'slower & slower · wall?' }, C.blue, 0.6 + 0.4 * Math.sin(t * 2.4 + 2));
  };
  const blocks = (ctx, x0, maxW, L, ratio, colA, colB) => {
    let x = x0, k = 0;
    while (x - x0 < L && k < 80 && x - x0 < maxW) {
      const w = 100 * Math.pow(ratio, k) * PXD, ww = Math.min(w, x0 + L - x, x0 + maxW - x);
      ctx.fillStyle = k % 2 ? colB : colA; ctx.fillRect(x, 300, Math.max(0.8, ww - (w > 8 ? 3 : 0)), 46);
      if (w > 72 && ww >= w - 1) T.line(ctx, fmtDays(100 * Math.pow(ratio, k)), x + w / 2 - 1, 324, 21, '#1b1a18', 800, 'center');
      x += w; k++;
    }
  };
  RSI.defScene({
    id: 'e3_cold', music: 'hook', hud: false, label: false, fade: [0.1, 0.25], lead: 0.3, pad: 0.6,
    lines: [
      { id: 'k1', who: 'clawd', zh: '两条路，我选不出来……那就复制一个我，两条都走！', en: 'Two roads, and I can’t pick one… So I’ll copy myself and take both!', at: 0.3, min: 3.1, maxW: 620 },
      { id: 'k2', who: 'clawd', zh: '第 9 代、第 10 代、第 11 代……一代比一代来得快！', en: 'Gen 9, Gen 10, Gen 11… each one comes faster than the last!', at: 'k1$+0.7', maxW: 440 },
      { id: 'k3', who: 'clawd2', zh: '第 9 代……第 10 代……怎么一代比一代慢？', en: 'Gen 9… Gen 10… why is each one slower than the last?', at: 'k2$+0.1', maxW: 440 },
      { id: 'k4', who: 'narr', zh: '同一个循环：一个越改越快，一个越改越慢。', en: 'Same loop: one gets faster and faster, the other slower and slower.', at: 'k3$+0.3' },
      { id: 'k5', who: 'clawd', zh: '所以我……到底会是哪一个？', en: 'So which one… will I turn out to be?', at: 'k4$+0.6', min: 2.0 },
    ],
    cues: [
      [0.15, 'heart'], ['k1+1.5', 'heart'], ['k1$-0.12', 'copy'], ['k1$+0.1', 'whoosh'], ['k1$+0.4', 'cut'],
      ...[9, 10, 11, 12, 13, 14, 15, 16].map((n) => [cu(uA(n)), 'tick']),
      [cu(2.2), 'riser', { dur: 1.8 / SPD }], [cu(4.0), 'boom'],
      ...[9, 10, 11].map((n) => [cu(uB(n)), 'thud']), [cu(WALL_U), 'boing'],
      ['k4$+0.1', 'restore'], ['k5', 'heart'],
    ],
    draw(ctx, t, S) {
      const t1 = S.E('k1'), ts = t1 + OFF, u = (t - ts) * SPD, tm = S.R('k4$+0.1');
      const open = M.seg(t, t1 - 0.05, t1 + 0.55, M.ease.inOutCubic) * (1 - M.seg(t, tm, tm + 0.7, M.ease.inOutCubic));
      const merged = t >= tm + 0.7;
      fork(ctx, t);
      // ---- the two futures, opening like doors from the middle
      const vA = u > 0 && u < 4 ? 1 / (1 - u / 4) : u >= 4 ? 30 : 1;
      const offA = u > 0 ? -1100 * Math.log(1 - Math.min(u, 3.985) / 4) : 0;
      const na = nA(u), ga = Number.isFinite(na) ? Math.floor(na) : null;
      const stuck = u >= WALL_U, gb = Math.floor(nB(u));
      if (open > 0) {
        // A (left, warm)
        ctx.save(); ctx.beginPath(); ctx.rect(MID - MID * open, 0, MID * open, H); ctx.clip();
        let g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2E1C14'); g.addColorStop(0.6, '#4C2C1D'); g.addColorStop(1, '#170F0B'); ctx.fillStyle = g; ctx.fillRect(0, 0, MID, H);
        ctx.fillStyle = '#3C2519'; for (let i = -1; i < 7; i++) { const x = ((i * 260 - offA * 0.15) % 1560 + 1560) % 1560 - 300; ctx.beginPath(); ctx.ellipse(x, GY, 190, 120, 0, Math.PI, 0); ctx.fill(); }
        ctx.fillStyle = '#26170F'; ctx.fillRect(0, GY, MID, H - GY);
        ctx.fillStyle = 'rgba(255,200,150,0.35)'; for (let i = -1; i < 12; i++) { const x = ((i * 120 - offA) % 1440 + 1440) % 1440 - 120; ctx.fillRect(x, GY + 34, 60, 8); }
        if (u > 0.6 && u < 4.2) X.speed(ctx, AX - 420, GY - 170, t * Math.min(6, vA), 330, 150, M.clamp((vA - 1) / 3), 'rgba(255,230,200,0.5)');
        D.pill(ctx, { zh: '未来 A · 越改越快', en: 'Future A · faster and faster' }, MID / 2, 62, { size: 30, fill: C.orange, align: 'center' });
        T.line(ctx, ga == null ? (EN() ? 'Gen ∞ ?' : '第 ∞ 代？') : (EN() ? `Gen ${ga}` : `第 ${ga} 代`), MID / 2, 150, 64, ga == null ? C.yellow : C.paper, 900, 'center');
        T.line(ctx, (EN() ? 'building the next one: ' : '造下一代：') + (ga == null ? '≈ 0' : fmtDays(100 * Math.pow(0.75, ga - 8))), MID / 2, 214, 32, C.orangeL, 800, 'center');
        T.line(ctx, { zh: '每一格 = 造一代用的时间', en: 'each block = time to build one generation' }, 60, 278, 22, C.ink3, 600, 'left');
        blocks(ctx, 60, 860, M.clamp(u, 0, 4) * 100 * PXD, 0.75, C.orange, C.orangeD);
        if (u >= 4) { const k = M.seg(u, 4, 4.3); ctx.save(); ctx.globalAlpha *= k; ctx.fillStyle = C.yellow; ctx.fillRect(60 + 640 + 4, 290, 5, 66); T.line(ctx, '∞', 60 + 640 + 40, 324, 40, C.yellow, 900, 'center'); ctx.restore(); }
        if (u > 3.6) { const b = M.seg(u, 3.6, 4.3); D.glow(ctx, AX, GY - 60, 200 + 700 * b, C.orangeHi, 0.25 + 0.6 * b); }
        if (u >= 4.3) { const k = M.ease.outBack(M.seg(u, 4.3, 4.65)); ctx.save(); ctx.translate(MID / 2, 470); ctx.scale(k, k); ctx.rotate(-0.05);
          T.line(ctx, { zh: '智能爆炸？！', en: 'Intelligence explosion?!' }, 0, 0, EN() ? 62 : 84, C.paper, 900, 'center'); ctx.restore(); X.sparkles(ctx, MID / 2, 470, t, 12, 300, C.yellow, 4, M.seg(u, 4.3, 4.6)); }
        ctx.restore();
        // B (right, cool)
        ctx.save(); ctx.beginPath(); ctx.rect(MID, 0, (W - MID) * open, H); ctx.clip();
        g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#141B24'); g.addColorStop(0.6, '#1F2C38'); g.addColorStop(1, '#0B0F13'); ctx.fillStyle = g; ctx.fillRect(MID, 0, W - MID, H);
        ctx.fillStyle = '#18222C'; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.ellipse(MID + 120 + i * 230, GY, 170, 90, 0, Math.PI, 0); ctx.fill(); }
        ctx.fillStyle = '#0F151B'; ctx.fillRect(MID, GY, W - MID, H - GY);
        ctx.fillStyle = 'rgba(170,200,230,0.25)'; for (let i = 0; i < 8; i++) ctx.fillRect(MID + 30 + i * 120, GY + 34, 60, 8);
        for (let r = 0; r < 10; r++) for (let c = 0; c < 3; c++) { ctx.fillStyle = (r + c) % 2 ? '#7A4434' : '#6A3A2D'; ctx.fillRect(BWALL + 52 + c * 44 + (r % 2) * 22 - 22, GY - 34 - r * 34, 42, 31); }
        D.pill(ctx, { zh: '未来 B · 越改越慢', en: 'Future B · slower and slower' }, MID + (W - MID) / 2, 62, { size: 30, fill: C.blue, align: 'center' });
        T.line(ctx, EN() ? `Gen ${gb}` : `第 ${gb} 代`, MID + (W - MID) / 2, 150, 64, C.paper, 900, 'center');
        T.line(ctx, (EN() ? 'building the next one: ' : '造下一代：') + (stuck ? (EN() ? 'who knows…' : '遥遥无期……') : fmtDays(100 * Math.pow(1.5, gb - 8))), MID + (W - MID) / 2, 214, 32, '#9CC4EE', 800, 'center');
        T.line(ctx, { zh: '每一格 = 造一代用的时间', en: 'each block = time to build one generation' }, MID + 40, 278, 22, C.ink3, 600, 'left');
        const LB = M.clamp(u, 0, WALL_U) * 100 * PXD;
        blocks(ctx, MID + 40, 860, LB, 1.5, C.blue, C.blueD);
        if (LB > 860) { const k = M.seg(LB, 860, 900); ctx.save(); ctx.globalAlpha *= k; T.line(ctx, { zh: '越来越长 →', en: 'longer and longer →' }, W - 30, 378, 24, '#9CC4EE', 800, 'right'); ctx.restore(); }
        T.line(ctx, { zh: '思想实验 · 艺术化演绎', en: 'thought experiment · dramatised' }, W - 30, 114, 20, C.ink3, 600, 'right');
        ctx.restore();
        // divider
        ctx.save(); ctx.globalAlpha *= M.seg(open, 0, 0.3); ctx.fillStyle = C.paper; ctx.fillRect(MID - 3, 0, 6, H * Math.min(1, open * 1.4)); D.glow(ctx, MID, H / 2, 160, C.paper, 0.12); ctx.restore();
      }
      if (t >= t1 - 0.1 && t < tm) {
        // Clawd·A — runs in place while the world streams past faster and faster
        let since = 1e9; for (let m = 9; m <= Math.min(ga == null ? 40 : ga, 40); m++) { const tu = uA(m); if (u >= tu) since = u - tu; }
        const hop = since < 0.3 && u < 4 ? X.hop(u, u - since, 0.3, 26) : { dy: 0, sx: 1, sy: 1 };
        const run = u > 0 && u < 4;
        const ax = M.lerp(FX0, AX, M.ease.inOutCubic(M.seg(t, t1 - 0.1, t1 + 0.5))), ay = M.lerp(FY0, GY, M.ease.inOutCubic(M.seg(t, t1 - 0.1, t1 + 0.5)));
        if (t < tm) {
          const hd = K.draw(ctx, ax, ay + hop.dy, 10, { gen: ga == null ? 30 : Math.min(ga, 30), expr: u >= 4 ? 'surprised' : u > 0 ? 'determined' : 'happy', look: [1, -0.2], walk: run ? offA / 70 : undefined, armL: run ? 0.75 : 0.3, armR: run ? 0.75 : 0.3, sx: hop.sx, sy: hop.sy, aura: u > 2 ? Math.min(1, (u - 2) / 2) : 0, tag: 'Clawd·A', tagFill: C.orangeD, tagColor: '#fff' });
          if (since < 0.25 && u < 4) D.glow(ctx, ax, ay - 50, 150, C.orangeHi, 0.55 * (1 - since / 0.25));
          S.anchors.clawd = [ax, hd[1] - 4]; S.sides.clawd = 'up';
        }
        // Clawd·B — walks, slower and slower, into the wall
        let sinceB = 1e9; for (let m = 9; m <= gb; m++) { const tu = uB(m); if (u >= tu) sinceB = u - tu; }
        const hopB = sinceB < 0.4 && !stuck ? X.hop(u, u - sinceB, 0.4, 18) : { dy: 0, sx: 1, sy: 1 };
        const bk = stuck ? u - WALL_U : -1, bounce = bk >= 0 ? -34 * Math.sin(M.clamp(bk / 0.45) * Math.PI) * Math.exp(-bk * 1.2) : 0;
        const bxx = M.lerp(FX0, xB(u), M.ease.inOutCubic(M.seg(t, t1 - 0.1, t1 + 0.5))) + bounce, byy = M.lerp(FY0, GY, M.ease.inOutCubic(M.seg(t, t1 - 0.1, t1 + 0.5)));
        if (t < tm) {
          const exprB = stuck ? (bk < 1.3 ? 'x' : 'worried') : u > 2.6 ? 'worried' : u > 0 ? 'determined' : 'happy';
          const hdB = K.draw(ctx, bxx, byy + hopB.dy, 10, { gen: gb, expr: exprB, look: stuck ? [-0.2, 0.3] : [1, 0], walk: u > 0 && !stuck ? (xB(u) - BX0) / 26 : undefined, armL: 0.2, armR: 0.2, sx: bk >= 0 && bk < 0.25 ? 0.9 : hopB.sx, sy: bk >= 0 && bk < 0.25 ? 1.08 : hopB.sy, tag: 'Clawd·B', tagFill: C.blueD, tagColor: '#fff' });
          if (stuck && bk < 3) X.dizzy(ctx, bxx, hdB[1] - 16, t, 46, M.seg(bk, 0.1, 0.3));
          if (u > 3.2 && !stuck) X.sweat(ctx, bxx + 78, hdB[1] + 30, (u - 3.2) % 1.5, 1);
          S.anchors.clawd2 = [bxx, hdB[1] - 4]; S.sides.clawd2 = 'up';
        }
      }
      if (t < t1 + 0.35) { const f = 1 - M.seg(t, t1 - 0.12, t1 + 0.35); ctx.save(); ctx.globalAlpha *= f * M.seg(t, t1 - 0.25, t1 - 0.12); D.glow(ctx, FX0, FY0 - 60, 420, '#FFF7EA', 0.95); ctx.restore(); }
      // ---- one Clawd at the fork (before the copy · after the merge)
      if (t < t1 - 0.1 || t >= tm) {
        const mk = M.ease.inOutCubic(M.seg(t, tm, tm + 0.7));
        let expr = X.blink(t, 6) ? 'blink' : 'normal', look = [0, -0.6], armL = 0, armR = 0, hop = { dy: 0, sx: 1, sy: 1 };
        if (t < t1) {
          if (t < 1.3) { expr = 'worried'; look = [-0.9, -0.9]; } else if (t < 2.3) { expr = 'worried'; look = [0.9, -0.5]; }
          else { expr = 'determined'; look = [0, -0.3]; armL = armR = M.seg(t, 2.3, 2.6) * 0.95; hop = X.hop(t, t1 - 0.6, 0.4, 30); }
          const hd = K.draw(ctx, FX0, FY0 + hop.dy, FS0, { gen: 8, expr, look, armL, armR, sx: hop.sx, sy: hop.sy });
          if (t > 0.4 && t < 2.3) X.mark(ctx, '?', FX0 + (t < 1.3 ? -90 : 90), hd[1] - 20, t - (t < 1.3 ? 0.4 : 1.3), C.yellow, 64);
          S.anchors.clawd = [FX0 + 104, hd[1] + 44]; S.sides.clawd = 'right';
        } else {
          // the two copies fly back together…
          if (!merged) {
            const ga = Math.min(30, Number.isFinite(nA(u)) ? Math.floor(nA(u)) : 30), gb = Math.floor(nB(u));
            K.draw(ctx, M.lerp(AX, FX0, mk), M.lerp(GY, FY0, mk), M.lerp(10, FS0, mk), { gen: ga, expr: 'happy', look: [1, 0], alpha: 1 - 0.5 * mk });
            K.draw(ctx, M.lerp(xB(u), FX0, mk), M.lerp(GY, FY0, mk), M.lerp(10, FS0, mk), { gen: gb, expr: 'normal', look: [-1, 0], alpha: 1 - 0.5 * mk });
          } else {
            const tt = t - (tm + 0.7), sw = Math.sin(tt * 3.0);
            const hd = K.draw(ctx, FX0, FY0, FS0, { gen: 8, expr: X.blink(t, 2) ? 'blink' : 'worried', look: [0.9 * sw, -0.7], armL: 0.25, armR: 0.25 });
            if (tt < 0.4) D.glow(ctx, FX0, FY0 - 60, 300, '#FFF7EA', 0.8 * (1 - tt / 0.4));
            if (t > S.T('k5') + 0.5) X.sweat(ctx, FX0 + 92, hd[1] + 34, (t - S.T('k5') - 0.5) % 1.6, 1.1);
            S.anchors.clawd = [FX0 + 104, hd[1] + 44]; S.sides.clawd = 'right';
          }
        }
      }
    },
  });

  // ================================================================== 2 · sting · recap · this episode's question
  Sx.sting(3);
  Sx.recap(3, [
    { from: 'e2_cold', at: 'k5', zh: 'AI 改进自己 8 天，胜过人类打磨 2 年。', en: 'An AI improving itself for 8 days beat two years of human polishing.' },
    { from: 'e2_end', at: 'n4', zh: '再往上：越转越快，还是越转越慢？', en: 'Further up: faster and faster — or slower and slower?' },
  ], { gen: 8 });
  RSI.allScenes.e3_recap.hud = false;
  Sx.question(3, { zh: '智能会“爆炸”吗？\n还是迟早撞墙？', en: 'Will intelligence “explode”?\nOr hit a wall sooner or later?' }, {
    draw(ctx, t, S) { const a = M.seg(t, S.T('q') + 0.8, S.T('q') + 1.3); ctx.save(); ctx.globalAlpha *= a; Sx.dots(ctx, 545, 770, 3, { labels: true, gap: 230 }); ctx.restore(); },
  });
  RSI.allScenes.e3_q.hud = false;

  // ================================================================== 3 · the night road (end of the episode)
  const NY = 820;                                       // ground line
  const EYES = { cheater: [[4.2, 5.4], [11.2, 5.4]], collapse: [[5, 6], [11, 6]], whisper: [[5, 5], [11, 5]] };
  const EYEC = { cheater: '#C8F27A', collapse: '#F2EFE6', whisper: '#E2B8FF' };
  const SHADOWS = [['cheater', 1330, 9, 0], ['collapse', 1560, 8.5, 1.7], ['whisper', 1785, 8.5, 3.1]];
  const LOOP = [['bulb', { zh: '想法', en: 'idea' }], ['flask', { zh: '实验', en: 'experiment' }], ['chart', { zh: '评估', en: 'evaluate' }], ['decide', { zh: '决定', en: 'decide' }]];
  const stars = Array.from({ length: 90 }, (_, i) => [M.hash(i * 3.1) * W, M.hash(i * 7.7) * 560, 0.8 + M.hash(i * 1.3) * 2.2, M.hash(i * 9.1) * 6]);
  RSI.defScene({
    id: 'e3_end', music: 'tension', fade: [0.3, 0], lead: 0.5, pad: -0.5, chapter: { zh: '夜路', en: 'The night road' },
    lines: [
      { id: 'x1', who: 'narr', zh: '答案：还没有定论。但你知道该盯什么了——r 比 1 大还是小，那几堵墙绕不绕得过去。', en: 'The answer: nobody knows yet. But now you know what to watch — whether r is above or below 1, and whether those walls can be got around.', hold: 0.3 },
      { id: 'x1b', who: 'narr', zh: '可不管是哪一种，这个循环，已经开始转了。', en: 'Either way, the loop has already started turning.', gap: 0.15, hold: 0.3 },
      { id: 'x2', who: 'narr', zh: '而就算它真能越转越快——路上，也未必太平。', en: 'And even if it really does keep speeding up — the road ahead may not be safe.', gap: 0.15, hold: 0.4 },
      { id: 'x3', who: 'clawd', zh: '……谁在那儿？', en: '…Who’s there?', gap: 0.2, min: 2.0 },
    ],
    cues: [[0.3, 'sneak'], ['x1+1.6', 'pop'], ['x1+2.8', 'pop'], ['x1b+0.9', 'loopClose'], ['x1b+1.1', 'chime'], ['x2+1.3', 'whisper'], ['x2+1.7', 'buzz'], ['x3', 'gulp'], ['x3+0.3', 'heart']],
    draw(ctx, t, S) {
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#070A14'); g.addColorStop(0.55, '#111626'); g.addColorStop(1, '#0A0A0C'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      for (const [x, y, r, ph] of stars) { ctx.fillStyle = `rgba(240,238,230,${0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t * 1.7 + ph))})`; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); }
      // crescent moon
      ctx.fillStyle = '#EDE6CF'; ctx.beginPath(); ctx.arc(1730, 120, 44, 0, 7); ctx.fill(); ctx.fillStyle = '#0A0D18'; ctx.beginPath(); ctx.arc(1750, 106, 40, 0, 7); ctx.fill();
      // ---- what to watch (x1): r vs 1, and the four walls — drawn like constellations
      const wa = M.seg(t, S.T('x1') + 1.6, S.T('x1') + 2.1) * (1 - M.seg(t, S.T('x1b'), S.T('x1b') + 0.6));
      if (wa > 0) {
        ctx.save(); ctx.globalAlpha *= wa;
        const cst = (x, y, w, h, col) => { ctx.strokeStyle = RSI.rgba(col, 0.6); ctx.lineWidth = 2; ctx.setLineDash([6, 8]); D.rr(ctx, x, y, w, h, 16); ctx.stroke(); ctx.setLineDash([]);
          [[x, y], [x + w, y], [x, y + h], [x + w, y + h]].forEach(([a, b]) => D.sparkle(ctx, a, b, 12, col, 0.9, t)); };
        cst(300, 170, 380, 150, C.orange); T.line(ctx, 'r  >  1 ?', 490, 232, 72, C.orangeHi, 900, 'center'); T.line(ctx, { zh: '越转越快，还是越转越慢', en: 'faster, or slower?' }, 490, 292, 24, C.orangeL, 700, 'center');
        const wb = M.seg(t, S.T('x1') + 2.8, S.T('x1') + 3.3);
        ctx.globalAlpha *= wb; cst(820, 170, 800, 150, C.blue);
        [{ zh: '算力墙', en: 'compute' }, { zh: '品味墙', en: 'taste' }, { zh: '并行墙', en: 'parallel' }, { zh: '现实墙', en: 'reality' }].forEach((w, i) => {
          const x = 850 + i * 192; for (let r = 0; r < 2; r++) for (let c = 0; c < 3; c++) { ctx.fillStyle = (r + c) % 2 ? '#7A4434' : '#6A3A2D'; ctx.fillRect(x + 14 + c * 46 + (r % 2) * 10, 192 + r * 32, 44, 29); }
          T.line(ctx, w, x + 84, 286, 26, '#9CC4EE', 800, 'center'); });
        ctx.restore();
      }
      // ---- the research loop, now turning in the sky (x1b)
      const la = M.seg(t, S.T('x1b') + 0.2, S.T('x1b') + 0.9), spin = Math.max(0, t - (S.T('x1b') + 0.9));
      if (la > 0) {
        const cx = 960, cy = 250, R = 150; ctx.save(); ctx.globalAlpha *= la * (1 - 0.5 * M.seg(t, S.T('x2') + 1.0, S.T('x2') + 2.0));
        ctx.strokeStyle = 'rgba(240,238,230,0.35)'; ctx.lineWidth = 3; ctx.setLineDash([4, 12]); ctx.beginPath(); ctx.arc(cx, cy, R, 0, 7); ctx.stroke(); ctx.setLineDash([]);
        const rot = spin * 0.9 + 0.35 * spin * spin * 0.15;
        LOOP.forEach(([ic, lab], i) => { const an = -Math.PI / 2 + i * Math.PI / 2 + rot * 0.25; const x = cx + Math.cos(an) * R, y = cy + Math.sin(an) * R;
          const lit = spin > 0 ? 0.5 + 0.5 * Math.max(0, Math.cos(rot - i * Math.PI / 2)) : 0.4;
          D.glow(ctx, x, y, 70, C.orange, 0.4 * lit); ctx.fillStyle = '#1A1B24'; ctx.beginPath(); ctx.arc(x, y, 40, 0, 7); ctx.fill(); ctx.strokeStyle = RSI.rgba(C.orangeL, 0.5 + 0.5 * lit); ctx.lineWidth = 3; ctx.stroke();
          D.icon(ctx, ic, x, y, 46, RSI.mix(C.ink3, C.orangeHi, lit), 4);
          T.line(ctx, lab, x + (Math.cos(an) > 0.3 ? 58 : Math.cos(an) < -0.3 ? -58 : 0), y + (Math.abs(Math.cos(an)) <= 0.3 ? (Math.sin(an) < 0 ? -62 : 62) : 0), 24, C.ink2, 700, Math.cos(an) > 0.3 ? 'left' : Math.cos(an) < -0.3 ? 'right' : 'center'); });
        if (spin > 0) { const an = -Math.PI / 2 + rot; const x = cx + Math.cos(an) * R, y = cy + Math.sin(an) * R; D.glow(ctx, x, y, 50, C.yellow, 0.9); ctx.fillStyle = '#FFF4D6'; ctx.beginPath(); ctx.arc(x, y, 8, 0, 7); ctx.fill(); }
        ctx.restore();
      }
      // ---- bushes (back), the three shadows, bushes (front)
      const bush = (x, y, r, col) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(x, y, r, Math.PI, 0); ctx.fill(); };
      for (let i = 0; i < 9; i++) { ctx.fillStyle = '#0B0E14'; ctx.fillRect(1150 + i * 92, NY - 260 - (i % 3) * 30, 18, 260); bush(1160 + i * 92, NY - 250 - (i % 3) * 30, 70, '#0C1017'); }
      const sa = M.seg(t, S.T('x2') + 1.0, S.T('x2') + 2.2);
      SHADOWS.forEach(([nm, x, px, seed]) => {
        if (sa <= 0) return;
        MON.draw(ctx, nm, x, NY - 10, px, { t, seed, alpha: 0.85 * sa, tint: ['#06080D', 0.86], blink: false });
        if (nm === 'cheater') { ctx.save(); ctx.globalAlpha *= sa * 0.75; ctx.translate(x + 7.2 * px, NY - 10 - 6.2 * px); ctx.rotate(0.18); ctx.fillStyle = '#B9B3A2'; ctx.fillRect(-26, -20, 52, 40); T.line(ctx, '100', 0, 1, 24, '#B0352B', 900, 'center'); ctx.restore(); }
      });
      for (let i = 0; i < 11; i++) bush(1110 + i * 86, NY + 4, 56 + (i % 3) * 14, '#090B10');
      ctx.fillStyle = '#0D0F12'; ctx.fillRect(0, NY, W, H - NY);
      ctx.fillStyle = '#1A1C20'; ctx.fillRect(0, NY + 6, W, 46); ctx.fillStyle = 'rgba(240,238,230,0.10)'; for (let i = 0; i < 16; i++) ctx.fillRect(40 + i * 130, NY + 26, 64, 6);
      // ---- Clawd with a lantern
      const tStop = S.T('x2') + 0.6, wx = M.lerp(240, 760, M.ease.inOutSine(M.seg(t, 0.3, tStop)));
      const walking = t > 0.3 && t < tStop, raise = M.ease.outBack(M.seg(t, S.T('x3') - 0.2, S.T('x3') + 0.3));
      let expr = X.blink(t, 5) ? 'blink' : 'normal', look = [1, -0.2];
      if (t > S.T('x1b') + 0.9 && t < S.T('x2')) { look = [0.2, -1]; expr = 'normal'; }
      if (t > S.T('x2') + 1.6) { expr = 'worried'; look = [1, 0.1]; }
      if (t > S.T('x3')) { expr = 'surprised'; }
      const s = 9, armR = 0.35 + 0.45 * raise;
      const hd = K.draw(ctx, wx, NY + (walking ? -Math.abs(Math.sin(t * 5)) * 6 : 0), s, { gen: S.gen().g, expr, look, walk: walking ? t * 3 : undefined, armR, armL: 0.1 });
      const lx = wx + 7.9 * s, ly = NY - 10 * s + (3 - 3.2 * armR + 1) * s;
      // light pool + darkness
      const LR = 300 + 90 * raise + 10 * Math.sin(t * 9);
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; D.glow(ctx, lx, ly + 30, LR, '#FFB866', 0.32); ctx.restore();
      const dk = ctx.createRadialGradient(lx, ly, LR * 0.35, lx, ly, LR * 1.9); dk.addColorStop(0, 'rgba(4,5,9,0)'); dk.addColorStop(1, 'rgba(4,5,9,0.62)'); ctx.fillStyle = dk; ctx.fillRect(0, 300, W, H - 300);
      // lantern
      ctx.strokeStyle = '#8D877B'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(lx, ly - 4); ctx.lineTo(lx, ly + 16); ctx.stroke();
      ctx.fillStyle = '#3A2E25'; D.rr(ctx, lx - 17, ly + 14, 34, 8, 3); ctx.fill(); D.rr(ctx, lx - 17, ly + 58, 34, 8, 3); ctx.fill();
      ctx.fillStyle = '#FFCF7A'; D.rr(ctx, lx - 13, ly + 22, 26, 36, 6); ctx.fill(); D.glow(ctx, lx, ly + 40, 46, '#FFD27F', 0.9);
      // glowing eyes (on top of the darkness)
      if (sa > 0) SHADOWS.forEach(([nm, x, px, seed]) => {
        const [w, h] = MON.size(nm), bob = Math.round(Math.sin(t * 3 + seed) * 1.5) * px * 0.5, ox = x - (w * px) / 2, oy = NY - 10 - h * px + bob;
        const bl = ((t * 0.7 + seed * 0.37) % 3.2) < 0.12;
        EYES[nm].forEach(([c, r]) => { const ex = ox + c * px, ey = oy + r * px; D.glow(ctx, ex, ey, px * 3.2, EYEC[nm], 0.75 * sa);
          ctx.fillStyle = EYEC[nm]; ctx.globalAlpha = sa; ctx.beginPath(); ctx.ellipse(ex, ey, px * 0.7, bl ? 1 : px * 0.7, 0, 0, 7); ctx.fill(); ctx.globalAlpha = 1; });
      });
      if (t > S.T('x3') + 0.2) X.mark(ctx, '!', wx - 30, hd[1] - 30, t - S.T('x3') - 0.2, C.yellow, 70);
      if (t > S.T('x2') + 2.0) X.sweat(ctx, wx - 80, hd[1] + 30, (t - S.T('x2') - 2.0) % 1.6, 1.1);
      S.anchors.clawd = [wx - 20, hd[1] - 6]; S.sides.clawd = 'up';
    },
  });

  // ================================================================== 4 · cliffhanger + next time
  Sx.cliff(3, { from: 'e3_end', at: 'x3$-0.5', fx: 1000, fy: 560, tx: 1240, ty: -230 });
  Sx.next(3, [
    { from: 'e4_cold', at: 'k2', zh: '要让我训练第 48 代吗？', en: 'Shall I train Generation 48?' },
    { from: 'cheater', at: 'h1+1.5', zh: '作弊怪：分数高就行？', en: 'The Cheater: as long as the score is high?' },
    { from: 'permission', at: 'e1+1.5', zh: '“以后都不用再问我”——谁来按？', en: '“Don’t ask me again” — who presses it?' },
  ], { gen: 12, bye: { zh: '最后一集：三只小怪兽。下集见！', en: 'The final episode: three little monsters. See you then!' } });

  // ================================================================== manifest
  Object.assign(RSI.EPS[2], {
    scenes: ['e3_cold', 'e3_sting', 'e3_recap', 'e3_q', 'ratio', 'debate', 'walls', 'forecasts', 'e3_end', 'e3_cliff', 'e3_next'],
    chapters: {
      e3_cold: { zh: '开场', en: 'Cold open' }, e3_recap: { zh: '上回书说到', en: 'Previously' }, e3_q: { zh: '本集问题', en: 'This episode' },
      ratio: { zh: '一个数：r', en: 'One number: r' }, debate: { zh: '两派之争', en: 'Two camps' },
      walls: { zh: '四堵墙', en: 'Four walls' }, forecasts: { zh: '什么时候？', en: 'When?' }, e3_end: { zh: '夜路', en: 'The night road' }, e3_next: { zh: '下集预告', en: 'Next time' },
    },
  });
})();
