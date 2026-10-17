/* RSI·Clawd — characters: Clawd (resolution = generation), human researcher, pixel monsters. */
(function () {
  'use strict';
  const RSI = window.RSI, C = RSI.C, M = RSI.M, D = RSI.D;
  const EYE = '#1E1D1B';
  const K = (RSI.Clawd = {});
  /** generation → raster cell size in Clawd units (1 = chunky 18×10 sprite), or 'v' for smooth vector */
  K.resFor = (g) => (g <= 1 ? 1 : g === 2 ? 0.5 : g === 3 ? 0.34 : g <= 5 ? 0.25 : g <= 9 ? 0.125 : 'v');
  const sdBox = (px, py, x0, y0, x1, y1, r) => {
    const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, hx = (x1 - x0) / 2 - r, hy = (y1 - y0) / 2 - r;
    const qx = Math.abs(px - cx) - hx, qy = Math.abs(py - cy) - hy;
    return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
  };
  const sdSeg = (px, py, ax, ay, bx, by) => {
    const pax = px - ax, pay = py - ay, bax = bx - ax, bay = by - ay;
    const h = M.clamp((pax * bax + pay * bay) / (bax * bax + bay * bay));
    return Math.hypot(pax - bax * h, pay - bay * h);
  };
  /** body parts as rounded boxes in unit space (18×10, origin top-left). */
  function parts(o, sm) {
    const rB = sm * 1.5, rA = sm * 0.7, rL = sm * 0.45;
    const aL = o.armL || 0, aR = o.armR || 0;
    const w = o.walk; const lA = w == null ? 0 : Math.max(0, Math.sin(w)) * 0.9, lB = w == null ? 0 : Math.max(0, -Math.sin(w)) * 0.9;
    return [
      [2, 0, 16, 8, rB],
      [0 - aL * 0.3, 3 - aL * 3.2, 2.2, 5 - aL * 3.2, rA],
      [15.8, 3 - aR * 3.2, 18 + aR * 0.3, 5 - aR * 3.2, rA],
      [3, 7.6, 4, 10 - lA, rL], [5, 7.6, 6, 10 - lB, rL], [12, 7.6, 13, 10 - lA, rL], [14, 7.6, 15, 10 - lB, rL],
    ];
  }
  function eyeHit(x, y, o, c) {
    const ex0 = (o.look ? o.look[0] : 0) * 0.7, ey0 = (o.look ? o.look[1] : 0) * 0.6;
    const ex = (o.expr || 'normal');
    for (const side of [-1, 1]) {
      const cx = (side < 0 ? 5.5 : 12.5) + ex0, cy = 3 + ey0;
      const dx = x - cx, dy = y - cy; const th = c >= 1 ? 0.45 : Math.max(0.24, c * 0.55);
      switch (ex) {
        case 'blink': case 'sleep': if (Math.abs(dx) <= 0.62 && Math.abs(dy - 0.6) <= Math.max(0.2, c / 2)) return 1; break;
        case 'happy': if (Math.min(sdSeg(x, y, cx - 0.8, cy + 0.7, cx, cy - 0.35), sdSeg(x, y, cx, cy - 0.35, cx + 0.8, cy + 0.7)) <= th) return 1; break;
        case 'surprised': if (Math.abs(dx) <= 0.62 && Math.abs(dy + 0.1) <= 1.3) return 1; break;
        case 'x': if (Math.abs(dx) <= 0.8 && Math.abs(dy) <= 0.8 && Math.min(Math.abs(dx - dy), Math.abs(dx + dy)) <= th * 1.2) return 1; break;
        case 'worried': {
          if (Math.abs(dx) <= 0.5 && Math.abs(dy - 0.3) <= 0.75) return 1;
          const inner = -side; // toward center
          if (c < 1 && sdSeg(x, y, cx - inner * 0.9, cy - 1.15, cx + inner * 0.9, cy - 1.85) <= th * 0.9) return 1; break;
        }
        case 'determined': {
          if (Math.abs(dx) <= 0.5 && Math.abs(dy - 0.3) <= 0.75) return 1;
          const inner = -side;
          if (c < 1 && sdSeg(x, y, cx - inner * 0.9, cy - 1.9, cx + inner * 0.9, cy - 1.15) <= th * 0.9) return 1; break;
        }
        default: if (Math.abs(dx) <= 0.5 && Math.abs(dy) <= 1.0) return 1;
      }
    }
    return 0;
  }
  const smFor = (c) => (c === 'v' ? 1 : c >= 1 ? 0 : c >= 0.5 ? 0.35 : c >= 0.3 ? 0.55 : c >= 0.2 ? 0.7 : 0.85);
  function raster(ctx, X, Y, s, o, c, clipY) {
    const sm = smFor(c); const P = parts(o, sm);
    const base = o.color || C.orange; const lite = RSI.mix(base, '#FFFFFF', 0.22), dark = RSI.mix(base, '#000000', 0.22);
    const yTop = Math.min(0, 3 - Math.max(o.armL || 0, o.armR || 0) * 3.2) - c;
    const ox = X - 9 * s, oy = Y - 10 * s;
    for (let gy = Math.floor(yTop / c) * c; gy < 10.0001; gy += c) {
      if (clipY != null && (clipY[0] > gy || gy >= clipY[1])) continue;
      let runCol = null, runX = 0;
      const py = gy + c / 2;
      const flush = (endX) => {
        if (runCol) { ctx.fillStyle = runCol; const x0 = Math.round(ox + runX * s), x1 = Math.round(ox + endX * s); const y0 = Math.round(oy + gy * s), y1 = Math.round(oy + (gy + c) * s); ctx.fillRect(x0, y0, x1 - x0, y1 - y0); }
      };
      for (let gx = -1; gx < 19.0001; gx += c) {
        const px = gx + c / 2; let col = null;
        let d = 1e9; let bi = -1;
        for (let i = 0; i < P.length; i++) { const p = P[i]; const di = sdBox(px, py, p[0], p[1], p[2], p[3], p[4]); if (di < d) { d = di; bi = i; } }
        if (d <= 0) {
          if (bi === 0 && eyeHit(px, py, o, c)) col = o.eyeColor || EYE;
          else if (c >= 1) col = base;
          else if (c >= 0.5) col = py > 7 ? dark : base;
          else { const k = bi === 0 ? py / 8 : 0.5; col = k < 0.16 || (bi === 0 && px < 3.2 && py < 6) ? lite : k > 0.84 || bi > 2 ? dark : base; }
        }
        if (col !== runCol) { flush(gx); runCol = col; runX = gx; }
      }
      flush(19 + c);
    }
  }
  function vector(ctx, X, Y, s, o) {
    const P = parts(o, 1); const base = o.color || C.orange;
    ctx.save();
    const g = ctx.createLinearGradient(0, Y - 10 * s, 0, Y);
    g.addColorStop(0, RSI.mix(base, '#FFFFFF', 0.3)); g.addColorStop(0.55, base); g.addColorStop(1, RSI.mix(base, '#000000', 0.25));
    if (o.glow) { ctx.shadowColor = RSI.rgba(C.orangeL, 0.9); ctx.shadowBlur = o.glow * s; }
    ctx.fillStyle = g; ctx.beginPath();
    for (const p of P) ctx.roundRect(X + (p[0] - 9) * s, Y + (p[1] - 10) * s, (p[2] - p[0]) * s, (p[3] - p[1]) * s, p[4] * s);
    ctx.fill(); ctx.shadowColor = 'transparent';
    // soft top highlight
    ctx.globalAlpha *= 0.35; ctx.fillStyle = '#FFFFFF'; ctx.beginPath(); ctx.roundRect(X + (2.8 - 9) * s, Y + (0.6 - 10) * s, 5 * s, 0.9 * s, 0.45 * s); ctx.fill();
    ctx.restore();
    // eyes via fine raster of eye function (cheap: small area)
    const c = 0.1; ctx.fillStyle = o.eyeColor || EYE;
    for (let gy = -0.5; gy < 6; gy += c) for (let gx = 3.5; gx < 14.6; gx += c) {
      if (eyeHit(gx + c / 2, gy + c / 2, o, 0.1)) ctx.fillRect(X + (gx - 9) * s, Y + (gy - 10) * s, c * s + 0.6, c * s + 0.6);
    }
    if (!o.expr || o.expr === 'normal' || o.expr === 'surprised') {
      const lx = (o.look ? o.look[0] : 0) * 0.7, ly = (o.look ? o.look[1] : 0) * 0.6;
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      for (const ex of [5.5, 12.5]) { ctx.beginPath(); ctx.arc(X + (ex - 9 - 0.18 + lx) * s, Y + (2.45 - 10 + ly) * s, 0.2 * s, 0, 7); ctx.fill(); }
    }
  }
  /**
   * Draw Clawd with feet-center anchor at (x, y). s = px per unit (sprite is 18×10 units).
   * o: {res|gen, expr, look:[dx,dy], armL, armR, walk, sx, sy, rot, alpha, color, glow, tag, res2, mix}
   * Returns head-top anchor [x, y] for bubbles.
   */
  K.draw = (ctx, x, y, s, o = {}) => {
    const res = o.res != null ? o.res : K.resFor(o.gen || 1);
    const sx = o.sx || 1, sy = o.sy || 1;
    ctx.save();
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot); ctx.scale(sx, sy);
    if (o.shadow !== false) { ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.beginPath(); ctx.ellipse(0, 0, 8.5 * s, 0.9 * s, 0, 0, 7); ctx.fill(); }
    if (o.aura) D.glow(ctx, 0, -5 * s, 16 * s, C.orange, o.aura);
    const one = (r, clip) => { if (r === 'v') { if (clip) { ctx.save(); ctx.beginPath(); ctx.rect(-12 * s, (clip[0] - 10) * s, 24 * s, (clip[1] - clip[0]) * s); ctx.clip(); vector(ctx, 0, 0, s, o); ctx.restore(); } else vector(ctx, 0, 0, s, o); } else raster(ctx, 0, 0, s, o, r, clip); };
    if (o.res2 != null && o.mix > 0 && o.mix < 1) {
      const sw = -4 + o.mix * 15; // sweep line (units), top→bottom
      one(o.res2, [-6, sw]); one(res, [sw, 11]);
      ctx.fillStyle = RSI.rgba(C.orangeHi, 0.9); ctx.fillRect(-10 * s, (sw - 10) * s - 2, 20 * s, 4);
      D.glow(ctx, 0, (sw - 10) * s, 10 * s, C.orangeHi, 0.6);
    } else one(o.res2 != null && o.mix >= 1 ? o.res2 : res);
    ctx.restore();
    if (o.tag) D.pill(ctx, o.tag, x, y + 1.9 * s + 14, { size: Math.max(16, Math.min(26, s * 1.1)), fill: o.tagFill || C.raised, color: o.tagColor || C.ink, align: 'center' });
    return [x, y - 10 * s * sy - 8];
  };
  // sprite cache for crowds (pixel gens only)
  const cache = new Map();
  K.sprite = (s, o = {}) => {
    const key = [s, o.res, o.expr, o.armL || 0, o.armR || 0, o.walk == null ? 'n' : Math.round(o.walk * 2), o.color || ''].join('|');
    let c = cache.get(key);
    if (!c) { c = D.mk(Math.ceil(20 * s), Math.ceil(16 * s)); const g = c.getContext('2d'); K.draw(g, 10 * s, 13 * s, s, Object.assign({}, o, { shadow: false, tag: null })); cache.set(key, c); }
    return c;
  };
  K.drawCached = (ctx, x, y, s, o = {}) => { const c = K.sprite(s, o); ctx.drawImage(c, Math.round(x - 10 * s), Math.round(y - 13 * s)); };

  // ---------------- Human researcher (flat vector) ----------------
  const Hm = (RSI.Human = {});
  /** seated at a desk; (x,y) = floor point under the chair. s = scale (1 ≈ 300px tall scene). o: {state:'type'|'sleep'|'think'|'look', t, mug, laptop} */
  Hm.desk = (ctx, x, y, s, o = {}) => {
    const t = o.t || 0; const st = o.state || 'type';
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // chair
    ctx.fillStyle = '#3B3935'; D.rr(ctx, -70, -150, 26, 120, 10); ctx.fill(); D.rr(ctx, -70, -40, 90, 16, 6); ctx.fill();
    ctx.fillRect(-30, -26, 8, 26);
    // desk
    ctx.fillStyle = '#4A4640'; ctx.fillRect(40, -120, 230, 14); ctx.fillStyle = '#3A3732'; ctx.fillRect(250, -106, 12, 106); ctx.fillRect(56, -106, 12, 106);
    // laptop
    if (o.laptop !== false) {
      ctx.fillStyle = '#2B2A27'; ctx.beginPath(); ctx.moveTo(110, -122); ctx.lineTo(200, -122); ctx.lineTo(214, -128); ctx.lineTo(118, -128); ctx.fill();
      ctx.save(); ctx.translate(196, -126); ctx.rotate(-1.35); ctx.fillStyle = '#34322E'; D.rr(ctx, 0, -4, 90, 8, 3); ctx.fill(); ctx.restore();
      const glowA = st === 'sleep' ? 0.25 : 0.5 + 0.2 * Math.sin(t * 3);
      D.glow(ctx, 170, -170, 90, C.blue, glowA * 0.6);
    }
    // mug
    if (o.mug !== false) {
      ctx.fillStyle = C.paper; D.rr(ctx, 226, -150, 22, 28, 4); ctx.fill(); ctx.strokeStyle = C.paper; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(250, -136, 7, -1.2, 1.2); ctx.stroke();
      ctx.strokeStyle = 'rgba(240,238,230,0.35)'; ctx.lineWidth = 3;
      for (let k = 0; k < 2; k++) { ctx.beginPath(); const sx = 232 + k * 9; for (let i = 0; i <= 10; i++) { const yy = -156 - i * 4; const xx = sx + Math.sin(t * 2 + i * 0.6 + k) * 3; i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); } ctx.stroke(); }
    }
    // body
    const lean = st === 'sleep' ? 0.5 : st === 'think' ? -0.05 : 0.12;
    ctx.save(); ctx.translate(-20, -40); ctx.rotate(lean);
    ctx.fillStyle = C.blueD; D.rr(ctx, -30, -120, 66, 124, 26); ctx.fill(); // torso
    ctx.fillStyle = C.blue; D.rr(ctx, -26, -116, 58, 60, 24); ctx.fill();
    // head
    const hb = st === 'type' ? Math.sin(t * 5) * 1.5 : 0;
    ctx.save(); ctx.translate(4, -146 + hb); if (st === 'sleep') ctx.rotate(0.5);
    ctx.fillStyle = C.skin; ctx.beginPath(); ctx.arc(0, 0, 30, 0, 7); ctx.fill();
    ctx.fillStyle = '#2A2622'; ctx.beginPath(); ctx.arc(-2, -6, 31, Math.PI * 1.02, Math.PI * 1.95); ctx.quadraticCurveTo(24, -20, 30, -4); ctx.lineTo(-30, -4); ctx.fill();
    if (st !== 'sleep') { ctx.strokeStyle = '#1E1D1B'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(10, 2, 8, 0, 7); ctx.moveTo(32, 2); ctx.arc(24, 2, 8, 0, 7); ctx.stroke(); ctx.fillStyle = '#1E1D1B'; ctx.beginPath(); ctx.arc(12, 3, 2.4, 0, 7); ctx.arc(26, 3, 2.4, 0, 7); ctx.fill(); }
    else { ctx.strokeStyle = '#1E1D1B'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(6, 6); ctx.lineTo(14, 6); ctx.moveTo(20, 6); ctx.lineTo(28, 6); ctx.stroke(); }
    ctx.restore();
    // arm
    ctx.strokeStyle = C.blue; ctx.lineWidth = 20;
    const hand = st === 'type' ? [120 + Math.sin(t * 14) * 4, -84 + Math.abs(Math.sin(t * 14)) * -4] : st === 'think' ? [30, -150] : [110, -70];
    ctx.beginPath(); ctx.moveTo(10, -100); ctx.quadraticCurveTo(60, -40, hand[0] - 20, hand[1] + 10); ctx.stroke();
    ctx.fillStyle = C.skin; ctx.beginPath(); ctx.arc(hand[0] - 14, hand[1] + 6, 11, 0, 7); ctx.fill();
    ctx.restore();
    // legs
    ctx.strokeStyle = '#2F3A4F'; ctx.lineWidth = 22; ctx.beginPath(); ctx.moveTo(-10, -44); ctx.lineTo(60, -40); ctx.lineTo(66, -2); ctx.stroke();
    ctx.restore();
    if (st === 'sleep') {
      for (let k = 0; k < 3; k++) { const ph = (t * 0.6 + k / 3) % 1; ctx.save(); ctx.globalAlpha *= Math.sin(ph * Math.PI); RSI.T.line(ctx, 'z', x + (30 + ph * 60 + k * 6) * s, y + (-230 - ph * 90) * s, (26 + k * 8) * s, C.ink2, 700, 'center'); ctx.restore(); }
    }
    return [x + 0 * s, y - 230 * s];
  };
  /** standing human (simple). (x,y) feet. o: {t, state:'stand'|'wave'|'stack', color} */
  Hm.stand = (ctx, x, y, s, o = {}) => {
    const t = o.t || 0; ctx.save(); ctx.translate(x, y); ctx.scale(s, s); if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#2F3A4F'; ctx.lineWidth = 20; ctx.beginPath(); ctx.moveTo(-14, -90); ctx.lineTo(-18, -4); ctx.moveTo(14, -90); ctx.lineTo(18, -4); ctx.stroke();
    ctx.fillStyle = o.color || C.blueD; D.rr(ctx, -38, -210, 76, 130, 30); ctx.fill();
    ctx.fillStyle = o.color2 || C.blue; D.rr(ctx, -34, -206, 68, 64, 28); ctx.fill();
    ctx.strokeStyle = o.color2 || C.blue; ctx.lineWidth = 18;
    const wave = o.state === 'wave' ? Math.sin(t * 6) * 0.4 : 0;
    ctx.beginPath(); ctx.moveTo(-34, -190); ctx.lineTo(-52, -120); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(34, -190); if (o.state === 'wave') ctx.lineTo(60 + wave * 20, -260); else ctx.lineTo(52, -120); ctx.stroke();
    ctx.fillStyle = C.skin; ctx.beginPath(); ctx.arc(0, -246, 32, 0, 7); ctx.fill();
    ctx.fillStyle = '#2A2622'; ctx.beginPath(); ctx.arc(0, -252, 33, Math.PI * 1.02, Math.PI * 1.98); ctx.lineTo(33, -246); ctx.lineTo(-33, -246); ctx.fill();
    ctx.strokeStyle = '#1E1D1B'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(-12, -242, 9, 0, 7); ctx.moveTo(21, -242); ctx.arc(12, -242, 9, 0, 7); ctx.stroke();
    ctx.fillStyle = '#1E1D1B'; ctx.beginPath(); ctx.arc(-12 + (o.look || 0) * 3, -241, 2.6, 0, 7); ctx.arc(12 + (o.look || 0) * 3, -241, 2.6, 0, 7); ctx.fill();
    ctx.restore();
    return [x, y - 290 * s];
  };

  /** v3.2 running human (EP2 race). (x,y) feet. o: {ph: stride phase (rad), t, color, color2, alpha, lean} */
  Hm.run = (ctx, x, y, s, o = {}) => {
    const ph = o.ph || 0, a = Math.sin(ph) * 0.62, bob = Math.abs(Math.cos(ph)) * 7;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.translate(0, -bob); ctx.rotate(o.lean == null ? 0.14 : o.lean);
    const leg = (ang, back) => { // hip (0,-92) → knee → foot, knee bends on the back-swing
      const kx = Math.sin(ang) * 46, ky = -92 + Math.cos(ang) * 46, bend = back ? 0.9 : 0.25;
      const fx = kx + Math.sin(ang - bend) * 44, fy = ky + Math.cos(ang - bend) * 44;
      ctx.beginPath(); ctx.moveTo(0, -92); ctx.lineTo(kx, ky); ctx.lineTo(fx, fy); ctx.stroke();
    };
    ctx.strokeStyle = '#26303F'; ctx.lineWidth = 19; leg(-a, a > 0);
    ctx.strokeStyle = o.color2 || C.blue; ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(0, -186); ctx.lineTo(Math.sin(a) * 40, -150); ctx.lineTo(Math.sin(a) * 40 + 26, -128 - Math.cos(a) * 10); ctx.stroke(); // far arm
    ctx.fillStyle = o.color || C.blueD; D.rr(ctx, -34, -210, 68, 126, 28); ctx.fill();
    ctx.fillStyle = o.color2 || C.blue; D.rr(ctx, -30, -206, 60, 62, 26); ctx.fill();
    ctx.strokeStyle = '#2F3A4F'; ctx.lineWidth = 20; leg(a, a < 0);
    ctx.strokeStyle = o.color2 || C.blue; ctx.lineWidth = 17; ctx.beginPath(); ctx.moveTo(0, -186); ctx.lineTo(-Math.sin(a) * 42, -150); ctx.lineTo(-Math.sin(a) * 42 + 28, -126 - Math.cos(a) * 10); ctx.stroke(); // near arm
    ctx.fillStyle = C.skin; ctx.beginPath(); ctx.arc(6, -246, 31, 0, 7); ctx.fill();
    ctx.fillStyle = '#2A2622'; ctx.beginPath(); ctx.arc(4, -252, 32, Math.PI * 1.02, Math.PI * 1.98); ctx.lineTo(36, -246); ctx.lineTo(-28, -246); ctx.fill();
    ctx.strokeStyle = '#1E1D1B'; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(14, -242, 8, 0, 7); ctx.moveTo(42, -242); ctx.arc(34, -242, 8, 0, 7); ctx.stroke();
    ctx.fillStyle = '#1E1D1B'; ctx.beginPath(); ctx.arc(17, -241, 2.6, 0, 7); ctx.arc(37, -241, 2.6, 0, 7); ctx.fill();
    if (o.sweat) { ctx.fillStyle = 'rgba(156,199,245,0.85)'; ctx.beginPath(); ctx.arc(-34, -262 - (o.t * 60) % 30, 6, 0, 7); ctx.fill(); }
    ctx.restore();
    return [x, y - 290 * s];
  };

  // ---------------- Pixel monsters ----------------
  const MON = {
    cheater: {
      pal: { G: '#7CC96E', g: '#4E9A4A', K: '#1E1D1B', W: '#F4F1E6', D: '#3B2A2A', P: '#F29BB0', p: '#C76D86' },
      rows: ['..G..........G..', '..GG........GG..', '..GGGGGGGGGGGG..', '.GGGGGGGGGGGGGG.', '.GGKKKGGGGKKKGG.', '.GGWWKGGGGWWKGG.', '.GGGGGGGGGGGGGG.', '.GGDDDDDDDDDDGG.', '.GGDWDWDWDWDDGG.', '..GGDDDDDDDDGG..', '..gGGGGGGGGGGgPP', '.gg.GGGGGGGG.gPp', '.g..gg....gg..pp', '...gg......gg...'],
      blink: [4, 5],
    },
    collapse: {
      pal: { S: '#A7A39A', s: '#77746D', K: '#1E1D1B', W: '#F4F1E6', C: '#D9D5CB' },
      rows: ['................', '......SSSS......', '....SSSSSSSS....', '...SSSSSSSSSS...', '..SSSSSSSSSSSS..', '..SSWWSSSSWWSS..', '..SSWKSSSSWKSS..', '.SSSSSSSSSSSSSS.', '.SSSSSKKKKSSSSS.', '.SSSCCSSSSCCSSS.', 'SSSSssSSSSssSSSS', 'SsSSs.sSSs.sSSsS', 's..s...ss...s..s'],
      blink: [5, 6],
    },
    whisper: {
      pal: { P: '#B98AD6', p: '#8E62AE', K: '#1E1D1B', W: '#F4F1E6', H: '#E0C8EE' },
      rows: ['................', '.....PPPPPP.....', '...PPPPPPPPPP...', '..PPHPPPPPPPPP..', '..PPWWPPPPWWPP..', '..PPWKPPPPWKPP..', '.PPPPPPPPPPPPPP.', '.PPPPPPKKPPPPPP.', '.PPPPPPKKPPPPPP.', '.PPPPPPPPPPPPPP.', '.pPPPPPPPPPPPPp.', '.pp.pPPp.pPPp.pp', '.p...pp...pp...p'],
      blink: [4, 5],
    },
  };
  RSI.Monster = {
    /** (x,y) = bottom center; px = pixel size. o: {t, alpha, blink, flip, tint} */
    draw(ctx, name, x, y, px, o = {}) {
      const m = MON[name]; const rows = m.rows; const w = rows[0].length, h = rows.length;
      const t = o.t || 0; const bob = Math.round(Math.sin(t * 3 + (o.seed || 0)) * 1.5) * px * 0.5;
      const blink = o.blink != null ? o.blink : ((t * 0.7 + (o.seed || 0) * 0.37) % 3.2) < 0.12;
      ctx.save(); if (o.alpha != null) ctx.globalAlpha *= o.alpha;
      ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.beginPath(); ctx.ellipse(x, y, w * px * 0.45, px * 1.2, 0, 0, 7); ctx.fill();
      const ox = x - (w * px) / 2, oy = y - h * px + bob;
      for (let r = 0; r < h; r++) {
        const row = rows[r];
        for (let c = 0; c < w; c++) {
          let ch = row[o.flip ? w - 1 - c : c]; if (ch === '.') continue;
          if (blink && m.blink.includes(r) && (ch === 'W' || ch === 'K')) ch = r === m.blink[0] ? 'K' : Object.keys(m.pal)[0];
          let col = m.pal[ch]; if (o.tint) col = RSI.mix(col, o.tint[0], o.tint[1]);
          ctx.fillStyle = col; ctx.fillRect(Math.round(ox + c * px), Math.round(oy + r * px), Math.ceil(px), Math.ceil(px));
        }
      }
      ctx.restore();
      return [x, oy - 10];
    },
    size: (name) => [MON[name].rows[0].length, MON[name].rows.length],
  };
})();
