/* RSI·Clawd v2 — series layer 《Clawd 造 Clawd》: episode metadata + the reusable "series grammar":
   sting (片头) · 上回书说到 recap · 本集问题 · cliffhanger freeze + 醒木 · 下集预告 teaser + end card · covers. */
(function () {
  'use strict';
  const RSI = window.RSI, C = RSI.C, M = RSI.M, D = RSI.D, T = RSI.T, K = RSI.Clawd;
  const W = RSI.W, H = RSI.H;
  const EN = () => RSI.lang === 'en';
  const X = () => RSI.X;
  RSI.SERIES = {
    title: { zh: 'Clawd 造 Clawd', en: 'Clawd Builds Clawd' },
    tag: { zh: '递归自我改进（RSI）· 四集科普', en: 'Recursive self-improvement (RSI), in four episodes' },
    repo: 'github.com/Harryis666/clawd-rsi-explained',
  };
  // Episode metadata. Each src/episodes/epN.js adds .scenes (ordered ids), .chapters (id → label) and .cover.
  RSI.EPS = [
    { n: 1, title: { zh: '离谱任务', en: 'The Ridiculous Task' }, hook: { zh: 'AI 改进 AI，停得下来吗？', en: 'When AI improves AI — can it stop?' }, genStart: 1 },
    { n: 2, title: { zh: '爬到第几级了？', en: 'How High Has It Climbed?' }, hook: { zh: 'AI 已经在改进自己了吗？', en: 'Is AI already improving itself?' }, genStart: 3 },
    { n: 3, title: { zh: '爆炸，还是撞墙？', en: 'Explosion, or a Wall?' }, hook: { zh: '智能会“爆炸”吗？', en: 'Will intelligence “explode”?' }, genStart: 8 },
    { n: 4, title: { zh: '以后都不用再问我', en: 'Don’t Ask Me Again' }, hook: { zh: '最后那个选项，谁来按？', en: 'Who presses the last option?' }, genStart: 8 },
  ];
  const Sx = (RSI.Series = {});
  Sx.epLabel = (n) => (EN() ? `EP ${n}` : `第 ${n} 集`);
  Sx.epTitle = (n) => (EN() ? `“${RSI.L(RSI.EPS[n - 1].title)}”` : `《${RSI.L(RSI.EPS[n - 1].title)}》`);

  // ---------------------------------------------------------------- identity
  /** red square seal with a glyph (印章) */
  Sx.seal = (ctx, x, y, sz, glyph = '造', k = 1, rot = -0.06) => {
    if (k <= 0) return;
    const sc = k < 1 ? 1.7 - 0.7 * M.ease.outBack(k) : 1;
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.rotate(rot); ctx.globalAlpha *= M.clamp(k * 3);
    ctx.shadowColor = 'rgba(0,0,0,0.35)'; ctx.shadowBlur = sz * 0.12; ctx.shadowOffsetY = sz * 0.04;
    ctx.fillStyle = '#C8372D'; D.rr(ctx, -sz / 2, -sz / 2, sz, sz, sz * 0.12); ctx.fill(); ctx.shadowColor = 'transparent';
    ctx.strokeStyle = 'rgba(255,236,222,0.8)'; ctx.lineWidth = sz * 0.035; D.rr(ctx, -sz * 0.42, -sz * 0.42, sz * 0.84, sz * 0.84, sz * 0.08); ctx.stroke();
    T.line(ctx, glyph, 0, sz * 0.04, sz * 0.6, '#FFF3EA', 900, 'center', 'serif');
    ctx.restore();
  };
  /** series logo: pixel Clawd · 「造」 seal · vector Clawd. (x,y) = feet line center; s = px per Clawd unit */
  Sx.logo = (ctx, x, y, s, o = {}) => {
    const t = o.t || 0, gap = s * 25;
    const hA = o.hopA || { dy: 0, sx: 1, sy: 1 }, hB = o.hopB || { dy: 0, sx: 1, sy: 1 };
    ctx.save(); if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    K.draw(ctx, x - gap, y + hA.dy, s, { res: 1, expr: o.exprA || (X().blink(t, 1) ? 'blink' : 'normal'), look: [0.8, -0.2], sx: hA.sx, sy: hA.sy, armR: o.armA || 0 });
    K.draw(ctx, x + gap, y + hB.dy, s, { res: 'v', expr: o.exprB || (X().blink(t, 2) ? 'blink' : 'happy'), look: [-0.8, -0.2], sx: hB.sx, sy: hB.sy, armL: o.armB || 0, glow: 8 });
    Sx.seal(ctx, x, y - s * 6, s * 11, '造', o.seal == null ? 1 : o.seal);
    ctx.restore();
  };
  /** 4 episode dots */
  Sx.dots = (ctx, x, y, cur, o = {}) => {
    const g = o.gap || 150;
    for (let i = 1; i <= 4; i++) {
      const cx = x + (i - 2.5) * g, on = i === cur, done = i < cur;
      if (i < 4) { ctx.fillStyle = done ? RSI.rgba(C.orange, 0.7) : 'rgba(240,238,230,0.18)'; ctx.fillRect(cx + 16, y - 2, g - 32, 4); }
      ctx.fillStyle = on ? C.orange : done ? C.orangeD : C.raised; ctx.beginPath(); ctx.arc(cx, y, on ? 18 : 14, 0, 7); ctx.fill();
      T.line(ctx, String(i), cx, y + 1, on ? 20 : 17, on || done ? '#1b1a18' : C.ink3, 900, 'center');
      if (o.labels) T.line(ctx, RSI.EPS[i - 1].title, cx, y + 44, 21, on ? C.ink : C.ink3, on ? 700 : 500, 'center');
    }
  };
  /** nested frames zooming outward — the recursion motif behind the sting / end card */
  Sx.tunnel = (ctx, t, a = 1, speed = 0.5) => {
    ctx.save(); ctx.globalAlpha *= a; ctx.lineWidth = 3;
    for (let i = 0; i < 9; i++) {
      const u = (i + ((t * speed) % 1)) / 9, sc = Math.pow(u, 2.2) * 1.25;
      const w = W * sc, h = H * sc; if (w < 8) continue;
      ctx.strokeStyle = RSI.rgba(C.orange, 0.32 * Math.sin(Math.PI * M.clamp(u * 1.1)));
      D.rr(ctx, W / 2 - w / 2, H / 2 - h / 2 - 40 * sc, w, h, 30 * sc); ctx.stroke();
    }
    ctx.restore();
  };
  /** fan-out storyteller desk with Clawd behind it. slams: times (local) when the 醒木 hits the table */
  Sx.teller = (ctx, x, y, s, t, o = {}) => {
    let arm = 0.12, hit = 1e9;
    for (const ts of o.slams || []) {
      const u = t - ts;
      if (u > -0.4 && u < 0) arm = Math.max(arm, 0.2 + 1.0 * Math.sin(M.clamp((u + 0.4) / 0.32) * Math.PI * 0.5) * (u < -0.08 ? 1 : (-u / 0.08)));
      if (u >= 0) hit = Math.min(hit, u);
    }
    const g = o.gen || 1; const bob = X().bob(t, 2.5, 2.2);
    const expr = hit < 0.5 ? 'determined' : o.expr || (X().blink(t, 4) ? 'blink' : 'normal');
    const cy = y - 3.2 * s;
    const head = K.draw(ctx, x, cy + bob, s, { gen: g, expr, look: o.look || [0.5, -0.1], armR: arm, armL: o.armL || 0.25, shadow: false });
    // the wooden block (醒木): in the hand while raised, on the table otherwise
    const tw = 26 * s, th = 9 * s, ty = y - th;
    const bx = x + 8.6 * s, byUp = cy + (4 - arm * 3.2 - 10) * s - 0.6 * s;
    const by = Math.min(ty - 1.1 * s, byUp + bob);
    ctx.fillStyle = '#6B3B24'; D.rr(ctx, bx - 1.6 * s, by - 0.9 * s, 3.2 * s, 1.8 * s, 0.3 * s); ctx.fill();
    ctx.fillStyle = '#8A5233'; ctx.fillRect(bx - 1.6 * s, by - 0.9 * s, 3.2 * s, 0.45 * s);
    // table + cloth (桌围)
    ctx.fillStyle = '#4A3428'; ctx.fillRect(x - tw / 2 - 0.6 * s, ty - 0.8 * s, tw + 1.2 * s, 1.0 * s);
    ctx.fillStyle = '#A3302A'; ctx.fillRect(x - tw / 2, ty + 0.2 * s, tw, th);
    ctx.fillStyle = '#D8A84A'; ctx.fillRect(x - tw / 2, ty + 0.2 * s, tw, 0.5 * s); ctx.fillRect(x - tw / 2, ty + th - 0.3 * s, tw, 0.5 * s);
    ctx.strokeStyle = '#D8A84A'; ctx.lineWidth = 0.25 * s; ctx.beginPath(); ctx.arc(x, ty + th / 2 + 0.4 * s, 2.6 * s, 0, 7); ctx.stroke();
    T.line(ctx, EN() ? 'RSI' : '书', x, ty + th / 2 + 0.5 * s, (EN() ? 1.6 : 2.6) * s, '#F2D28A', 900, 'center', 'serif');
    if (hit < 0.35) { // impact burst
      const k = hit / 0.35; ctx.save(); ctx.globalAlpha *= 1 - k; ctx.strokeStyle = C.yellow; ctx.lineWidth = 0.35 * s;
      for (let i = 0; i < 7; i++) { const an = Math.PI * (1.08 + i * 0.14); const r0 = (2 + k * 3) * s, r1 = (4 + k * 5) * s; ctx.beginPath(); ctx.moveTo(bx + Math.cos(an) * r0, ty + Math.sin(an) * r0); ctx.lineTo(bx + Math.cos(an) * r1, ty + Math.sin(an) * r1); ctx.stroke(); }
      T.line(ctx, EN() ? 'CLACK!' : '啪！', bx + 6 * s, ty - 7 * s - k * 2 * s, 3.2 * s, C.yellow, 900, 'center');
      ctx.restore();
    }
    return head;
  };
  /** screen shake offset after hits */
  Sx.shake = (t, hits, amp = 10) => { let dx = 0, dy = 0; for (const h of hits) { const u = t - h; if (u >= 0 && u < 0.3) { const k = (1 - u / 0.3) * amp; dx += Math.sin(u * 90) * k; dy += Math.cos(u * 70) * k * 0.6; } } return [dx, dy]; };

  // ---------------------------------------------------------------- offscreen flashback renderer
  const offs = new Map();
  /** render scene `id` at local time `lt` into a cached offscreen canvas (scale k) and return it */
  Sx.snap = (id, lt, o = {}) => {
    const k = o.k || 0.6; const key = o.slot || 'a';
    let c = offs.get(key); if (!c || c.width !== Math.round(W * k)) { c = D.mk(Math.round(W * k), Math.round(H * k)); offs.set(key, c); }
    const sc = RSI.allScenes[id]; if (!sc) throw new Error('snap: unknown scene ' + id);
    RSI.prepScene(sc);
    const g = c.getContext('2d'); g.setTransform(k, 0, 0, k, 0, 0); g.clearRect(0, 0, W, H);
    RSI.drawSceneAt(g, sc, typeof lt === 'number' ? lt : sc.R(lt), { lines: o.lines == null ? 'bubbles' : o.lines, gen: o.gen });
    return c;
  };
  const resolveAt = (id, at) => { const sc = RSI.prepScene(RSI.allScenes[id]); return typeof at === 'number' ? at : sc.R(at); };

  // ---------------------------------------------------------------- sting (片头)
  Sx.sting = (n) => RSI.defScene({
    id: `e${n}_sting`, music: 'none', hud: false, label: false, isCard: true, dur: 4.9, fade: [0, 0.45], lead: 0, lines: [],
    cues: [[0.45, 'logo'], [1.84, 'stamp'], [2.6, 'swish']],
    draw(ctx, t) {
      D.bg(ctx, { c1: '#2A1D17', c2: '#100F0E' });
      Sx.tunnel(ctx, t, M.seg(t, 0, 0.6), 0.55);
      const z = 0.82 + 0.18 * M.ease.outBack(M.seg(t, 0, 0.55));
      ctx.save(); ctx.translate(W / 2, 470); ctx.scale(z, z); ctx.translate(-W / 2, -470);
      Sx.logo(ctx, W / 2, 470, 12.5, { t, alpha: M.seg(t, 0, 0.25), hopA: X().hop(t, 0.92, 0.42, 80), hopB: X().hop(t, 1.32, 0.42, 110), seal: M.seg(t, 1.82, 2.12), armA: t > 0.9 && t < 1.4 ? 0.8 : 0, armB: t > 1.3 && t < 1.8 ? 0.8 : 0 });
      ctx.restore();
      if (t > 1.84 && t < 2.5) D.glow(ctx, W / 2, 400, 360, C.red, 0.6 * (1 - M.seg(t, 1.84, 2.5)));
      const b = M.seg(t, 2.1, 2.6, M.ease.outCubic);
      ctx.save(); ctx.globalAlpha *= b; T.line(ctx, RSI.SERIES.title, W / 2, 610 + (1 - b) * 16, 70, C.ink, 900, 'center'); ctx.restore();
      const c = M.seg(t, 2.6, 3.1, M.ease.outCubic);
      ctx.save(); ctx.globalAlpha *= c; ctx.translate(0, (1 - c) * 18);
      const lab = Sx.epLabel(n), ttl = RSI.L(RSI.EPS[n - 1].title);
      ctx.font = T.font(30, 800); const lw = ctx.measureText(lab).width + 36; ctx.font = T.font(46, 900); const tw2 = ctx.measureText(ttl).width;
      const x0 = W / 2 - (lw + 24 + tw2) / 2;
      D.pill(ctx, lab, x0, 712, { size: 30, fill: C.orange });
      T.line(ctx, ttl, x0 + lw + 24, 712, 46, C.orangeHi, 900, 'left');
      ctx.globalAlpha *= 0.8; T.line(ctx, RSI.SERIES.tag, W / 2, 790, 26, C.ink3, 500, 'center');
      ctx.restore();
    },
  });

  // ---------------------------------------------------------------- 上回书说到 (recap)
  /** beats: [{from, at, zh, en, gen, speed}] — real frames of the previous episode, shown on a hanging scroll */
  Sx.recap = (n, beats, o = {}) => {
    const lines = [{ id: 'q0', who: 'narr', zh: '上回书说到——', en: 'Previously, on Clawd Builds Clawd…', at: 0.75, min: 1.7 }];
    beats.forEach((b, i) => lines.push({ id: 'b' + i, who: 'narr', zh: b.zh, en: b.en, gap: 0.12, min: b.min || 2.0, hold: b.hold }));
    lines.push({ id: 'qn', who: 'narr', zh: o.end ? o.end.zh : '书接上回！', en: o.end ? o.end.en : 'And now, back to the story!', gap: 0.25, min: 1.6, hold: 0.3 });
    const gen = o.gen || RSI.EPS[n - 1].genStart;
    return RSI.defScene({
      id: `e${n}_recap`, music: 'story', lead: 0.6, lines, pad: 0.6, chapter: { zh: '上回书说到', en: 'Previously' },
      cues: [[0.6, 'gavel'], ...beats.map((b, i) => ['b' + i, 'page']), ['qn+0.05', 'gavel']],
      draw(ctx, t, S) {
        const hits = [0.6, S.R('qn+0.05')]; const sh = Sx.shake(t, hits, 9);
        ctx.save(); ctx.translate(sh[0], sh[1]);
        D.dots(ctx, 0.025);
        // warm stage light
        D.glow(ctx, 380, 640, 520, C.orange, 0.22);
        Sx.teller(ctx, 380, 900, 10, t, { slams: hits, gen, look: t < 2 ? [0, 0] : [0.7, -0.2] });
        S.anchors.clawd = [380, 520];
        // vertical title
        const ta = M.seg(t, 0.6, 1.0, M.ease.outCubic);
        ctx.save(); ctx.globalAlpha *= ta;
        if (EN()) { T.line(ctx, 'PREVIOUSLY…', 1270, 92, 40, C.orangeHi, 900, 'center', 'serif'); }
        else { Array.from('上回书说到').forEach((ch, i) => T.line(ctx, ch, 700, 210 + i * 92 + (1 - ta) * 20, 74, i < 2 ? C.orangeHi : C.paper, 900, 'center', 'serif')); Sx.seal(ctx, 700, 210 + 5 * 92 + 10, 64, '评', ta); }
        ctx.restore();
        // the hanging scroll
        const fx = 790, fy = 150, fw = 1000, fh = 562;
        const sa = M.seg(t, 0.3, 0.9, M.ease.outCubic);
        const open = M.seg(t, 0.3, 1.1, M.ease.inOutCubic);
        ctx.save(); ctx.globalAlpha *= sa;
        const ph = (fh + 60) * open;
        ctx.fillStyle = C.paper; ctx.shadowColor = 'rgba(0,0,0,0.5)'; ctx.shadowBlur = 30; ctx.fillRect(fx - 30, fy - 30, fw + 60, ph); ctx.shadowColor = 'transparent';
        ctx.fillStyle = '#5A3A26'; D.rr(ctx, fx - 56, fy - 52, fw + 112, 26, 13); ctx.fill(); D.rr(ctx, fx - 56, fy - 30 + ph, fw + 112, 26, 13); ctx.fill();
        ctx.fillStyle = '#C9A15A'; ctx.beginPath(); ctx.arc(fx - 56, fy - 39, 15, 0, 7); ctx.arc(fx + fw + 56, fy - 39, 15, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(fx - 56, fy - 17 + ph, 15, 0, 7); ctx.arc(fx + fw + 56, fy - 17 + ph, 15, 0, 7); ctx.fill();
        // picture
        if (open > 0.98) {
          let bi = 0; for (let i = 0; i < beats.length; i++) if (t >= S.T('b' + i) - 0.15) bi = i;
          const draw1 = (i, alpha, slot) => {
            const b = beats[i]; const t0 = i === 0 ? 0.9 : S.T('b' + i) - 0.15;
            const lt = resolveAt(b.from, b.at) + Math.max(0, t - t0) * (b.speed == null ? 0.3 : b.speed);
            const c = Sx.snap(b.from, lt, { slot, gen: b.gen, lines: b.lines });
            const z = 1 + 0.05 * M.seg(t, t0, t0 + 3.5);
            ctx.save(); ctx.beginPath(); ctx.rect(fx, fy, fw, fh); ctx.clip(); ctx.globalAlpha *= alpha;
            ctx.translate(fx + fw / 2, fy + fh / 2); ctx.scale(z, z);
            ctx.filter = 'sepia(0.55) saturate(0.85) contrast(1.06) brightness(0.96)';
            ctx.drawImage(c, -fw / 2, -fh / 2, fw, fh); ctx.filter = 'none'; ctx.restore();
          };
          const tb = S.T('b' + bi) - 0.15; const xf = bi > 0 ? M.seg(t, tb, tb + 0.35) : 1;
          if (xf < 1 && bi > 0) draw1(bi - 1, 1, 'a');
          draw1(bi, xf, 'b');
          ctx.strokeStyle = 'rgba(60,40,24,0.55)'; ctx.lineWidth = 6; ctx.strokeRect(fx, fy, fw, fh);
        }
        ctx.restore();
        ctx.restore();
      },
    });
  };

  // ---------------------------------------------------------------- 本集问题 (the episode's promise)
  Sx.question = (n, q, o = {}) => RSI.defScene({
    id: `e${n}_q`, music: o.music || 'story', lead: 0.5, pad: 0.5, chapter: { zh: '本集问题', en: 'This episode' },
    lines: [{ id: 'q', who: 'narr', zh: q.zh, en: q.en, at: 0.6, min: 3.2, hold: 0.8, manual: true }].concat(o.lines || []),
    cues: [[0.45, 'quizIn']].concat(o.cues || []),
    draw(ctx, t, S) {
      D.dots(ctx, 0.03, 48, 0, -t * 8);
      // giant rotating question mark
      ctx.save(); ctx.translate(1500, 470); ctx.rotate(Math.sin(t * 0.9) * 0.08); ctx.globalAlpha *= 0.12 * M.seg(t, 0.2, 0.8);
      T.line(ctx, '?', 0, 0, 640, C.orange, 900, 'center'); ctx.restore();
      const a = M.seg(t, 0.4, 0.8, M.ease.outCubic);
      ctx.save(); ctx.globalAlpha *= a;
      D.pill(ctx, EN() ? 'THIS EPISODE' : '本集问题', 200, 300, { size: 30, fill: C.orange });
      T.line(ctx, Sx.epLabel(n) + ' · ' + RSI.L(RSI.EPS[n - 1].title), 200 + (EN() ? 250 : 190), 300, 28, C.ink3, 600, 'left');
      const L = T.layout(ctx, RSI.L(q), { size: EN() ? 74 : 88, weight: 900, maxW: 1150, lh: 1.32 });
      const rev = Math.max(0, (t - 0.6) * 22);
      T.drawLayout(ctx, L, 200, 370 + (1 - a) * 20, { reveal: rev });
      ctx.restore();
      // Clawd thinking
      const g = o.gen || RSI.EPS[n - 1].genStart; const think = t > 1.2;
      const hd = K.draw(ctx, 1560, 860 + X().bob(t, 3), 11, { gen: g, expr: think ? (X().blink(t, 3) ? 'blink' : 'worried') : 'normal', look: [-0.6, -0.6], armR: think ? 1.0 + Math.sin(t * 7) * 0.08 : 0 });
      S.anchors.clawd = [1560, hd[1]];
      X().mark(ctx, '?', 1700, hd[1] - 10, t - 1.3, C.yellow, 90);
      X().mark(ctx, '?', 1440, hd[1] + 10, t - 1.7, C.orangeL, 64);
      if (o.draw) o.draw(ctx, t, S);
    },
  });

  // ---------------------------------------------------------------- cliffhanger: freeze + 醒木 + 且听下回分解
  const freezeCache = new Map();
  Sx.cliff = (n, o) => RSI.defScene({
    id: `e${n}_cliff`, music: 'none', hud: false, label: false, dur: o.dur || 5.8, fade: [0, 0.35], lead: 0, lines: [],
    cues: [[0, 'freeze'], [1.05, 'gavel'], [2.55, 'gavel', { big: 1 }]],
    draw(ctx, t, S) {
      const key = o.from + '|' + RSI.lang + '|' + o.at;
      let c = freezeCache.get(key);
      if (!c) { const src = Sx.snap(o.from, resolveAt(o.from, o.at), { k: 1, slot: 'freeze', lines: true, gen: o.gen }); c = D.mk(W, H); c.getContext('2d').drawImage(src, 0, 0); freezeCache.set(key, c); }
      const gray = M.seg(t, 0.08, 0.7);
      const z = 1 + 0.07 * M.ease.outCubic(M.seg(t, 0, 5.5));
      const sh = Sx.shake(t, [1.05, 2.55], 12);
      ctx.save(); ctx.translate(W / 2 + sh[0], H / 2 + sh[1]); ctx.scale(z, z); ctx.translate(-(o.fx || W / 2), -(o.fy || H / 2));
      ctx.filter = `grayscale(${0.8 * gray}) contrast(${1 + 0.2 * gray}) brightness(${1 - 0.35 * gray})`;
      ctx.drawImage(c, (o.fx || W / 2) - W / 2, (o.fy || H / 2) - H / 2); ctx.filter = 'none';
      ctx.restore();
      if (t < 0.22) { ctx.fillStyle = `rgba(255,250,240,${0.85 * (1 - t / 0.22)})`; ctx.fillRect(0, 0, W, H); }
      // red-brown vignette + letterbox bars
      const bar = 110 * M.ease.outCubic(M.seg(t, 0.1, 0.6));
      ctx.fillStyle = '#0B0A09'; ctx.fillRect(0, 0, W, bar); ctx.fillRect(0, H - bar, W, bar);
      const vg = ctx.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, W * 0.7); vg.addColorStop(0, 'rgba(60,12,8,0)'); vg.addColorStop(1, `rgba(60,12,8,${0.6 * gray})`);
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
      // corner stamp: 第 N 集 完
      const k0 = M.seg(t, 0.4, 0.7);
      ctx.save(); ctx.globalAlpha *= k0; T.line(ctx, Sx.epLabel(n) + (EN() ? ' · END' : ' · 完'), 70, 56, 28, C.ink2, 700, 'left'); ctx.restore();
      // the storyteller's line
      const txt = (s, y, t0, size) => {
        const a = M.seg(t, t0, t0 + 0.12); if (a <= 0) return;
        const pop = 1 + 0.25 * (1 - M.ease.outBack(M.seg(t, t0, t0 + 0.35)));
        ctx.save(); ctx.globalAlpha *= a; ctx.translate(o.tx || W / 2, y); ctx.scale(pop, pop);
        ctx.font = T.font(size, 900, 'serif'); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.lineWidth = size * 0.14; ctx.strokeStyle = 'rgba(12,10,9,0.9)'; ctx.lineJoin = 'round'; ctx.strokeText(RSI.L(s), 0, 0);
        ctx.fillStyle = C.paper; ctx.fillText(RSI.L(s), 0, 0); ctx.restore();
      };
      const ty = o.ty || 0;
      txt({ zh: '欲知后事如何——', en: 'What happens next?' }, H / 2 - 70 + ty, 1.05, EN() ? 96 : 110);
      txt({ zh: '且听下回分解！', en: 'Find out next time!' }, H / 2 + 80 + ty, 2.55, EN() ? 86 : 100);
      if (t > 2.55) Sx.seal(ctx, (o.tx || W / 2) + (EN() ? 480 : 430) * (o.tx ? 0.86 : 1), H / 2 + 150 + ty, 92, EN() ? '…' : '续', M.seg(t, 2.75, 3.05), 0.1);
    },
  });

  // ---------------------------------------------------------------- 下集预告 + end card
  /** beats: [{from, at, zh, en, speed, gen}] taken from the next episode */
  Sx.next = (n, beats, o = {}) => {
    const fl = o.fl || 1.5, t0 = 1.1, tEnd = t0 + beats.length * fl, nx = n + 1, E2 = RSI.EPS[nx - 1];
    const bye = o.bye || { zh: '下集见！', en: 'See you next time!' }, bd = Math.max(3.0, 1.0 + T.count(bye.zh) / 7.6);
    // a beat may name a fallback ({fb:{from,at}}) for scenes that are not written yet
    const pick = (b) => (RSI.allScenes[b.from] || !b.fb ? b : Object.assign({}, b, b.fb));
    return RSI.defScene({
      id: `e${n}_next`, music: 'tease', hud: false, label: false, isCard: true, dur: tEnd + 3.0 + bd + 1.5, fade: [0.15, 0.9], lead: 0,
      lines: [{ id: 'bye', who: 'clawd', zh: bye.zh, en: bye.en, at: tEnd + 3.0, dur: bd }],
      cues: [[0.15, 'stamp'], [0.2, 'riser', { dur: tEnd - 0.2 }], ...beats.map((b, i) => [t0 + i * fl, 'swish']), [tEnd, 'logoEnd'], [tEnd + 0.9, 'pop']],
      draw(ctx, t, S) {
        if (t < tEnd) {
          if (t >= t0) {
            const i = Math.min(beats.length - 1, Math.floor((t - t0) / fl)), b = pick(beats[i]), u = t - (t0 + i * fl);
            const c = Sx.snap(b.from, resolveAt(b.from, b.at) + u * (b.speed == null ? 0.8 : b.speed), { k: 0.75, slot: 'next', lines: b.lines == null ? false : b.lines, gen: b.gen });
            const z = 1.04 + 0.05 * u / fl;
            ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.drawImage(c, -W / 2, -H / 2, W, H); ctx.restore();
            if (u < 0.12) { ctx.fillStyle = `rgba(255,255,255,${0.7 * (1 - u / 0.12)})`; ctx.fillRect(0, 0, W, H); }
            // caption
            const ca = M.seg(u, 0.1, 0.3);
            ctx.save(); ctx.globalAlpha *= ca; ctx.translate(W / 2, H - 150); const pop = 1 + 0.12 * (1 - M.ease.outBack(M.seg(u, 0.1, 0.4))); ctx.scale(pop, pop);
            ctx.font = T.font(EN() ? 62 : 72, 900); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
            ctx.lineWidth = 16; ctx.strokeStyle = 'rgba(12,10,9,0.92)'; ctx.strokeText(RSI.L(b), 0, 0); ctx.fillStyle = C.yellow; ctx.fillText(RSI.L(b), 0, 0); ctx.restore();
          } else { D.bg(ctx, { c1: '#2A1512', c2: '#0E0D0C' }); }
          // ribbon
          ctx.save(); const ra = M.ease.outBack(M.seg(t, 0.1, 0.45)); ctx.translate(t < t0 ? W / 2 : 190, t < t0 ? H / 2 : 110); ctx.scale(t < t0 ? 1.6 * ra : 1, t < t0 ? 1.6 * ra : 1);
          ctx.rotate(-0.04); ctx.fillStyle = '#C8372D'; D.rr(ctx, -150, -40, 300, 80, 10); ctx.fill();
          T.line(ctx, EN() ? 'NEXT TIME' : '下集预告', 0, 2, EN() ? 40 : 46, '#FFF3EA', 900, 'center', 'serif'); ctx.restore();
          return;
        }
        // ---- end card
        const u = t - tEnd;
        D.bg(ctx, { c1: '#241A15', c2: '#0F0E0D' });
        Sx.tunnel(ctx, t, 0.8 * M.seg(u, 0, 0.8), 0.35);
        Sx.logo(ctx, W / 2, 300, 6.2, { t, seal: 1, alpha: M.seg(u, 0, 0.4), hopA: X().hop(t, tEnd + 0.4, 0.4, 30), hopB: X().hop(t, tEnd + 0.7, 0.4, 40) });
        const a = M.seg(u, 0.5, 1.0, M.ease.outCubic);
        ctx.save(); ctx.globalAlpha *= a; ctx.translate(0, (1 - a) * 18);
        T.line(ctx, EN() ? 'NEXT EPISODE' : '下一集', W / 2, 420, 30, C.ink3, 700, 'center');
        T.line(ctx, `${Sx.epLabel(nx)}  ${Sx.epTitle(nx)}`, W / 2, 500, EN() ? 72 : 84, C.ink, 900, 'center');
        T.line(ctx, E2.hook, W / 2, 590, 38, C.orangeL, 600, 'center');
        ctx.restore();
        ctx.save(); ctx.globalAlpha *= M.seg(u, 1.0, 1.5); Sx.dots(ctx, W / 2, 730, nx, { labels: true, gap: 230 });
        T.line(ctx, EN() ? `${RSI.L(RSI.SERIES.title)} · a 4-episode series` : `《${RSI.L(RSI.SERIES.title)}》系列 · 共 4 集`, W / 2, 1000, 24, C.ink3, 500, 'center'); ctx.restore();
        const g = o.gen || 1; const wave = u > 2.8 && u < 6;
        const hd = K.draw(ctx, 1640, 950 + X().bob(t, 3), 7.5, { gen: g, expr: wave ? 'happy' : X().blink(t, 5) ? 'blink' : 'normal', armR: wave ? 0.9 + Math.sin(t * 12) * 0.25 : 0, look: [-0.6, -0.3], alpha: M.seg(u, 1.4, 1.8) });
        S.anchors.clawd = [1640, hd[1]];
      },
    });
  };
})();
