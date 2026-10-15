/* 序章 Cold open + title. */
(function () {
  'use strict';
  const RSI = window.RSI, C = RSI.C, M = RSI.M, D = RSI.D, T = RSI.T, K = RSI.Clawd, X = RSI.X;
  const W = RSI.W;
  const LOGO = [' ▐▛███▜▌', '▝▜█████▛▘', '  ▘▘ ▝▝'];

  RSI.defScene({
    id: 'open', music: 'ambient', hud: false, label: false, fade: [0.6, 0.4], lead: 6.2,
    lines: [
      { id: 'n1', who: 'narr', zh: '这是 {o|Clawd}。', en: 'This is {o|Clawd}.', min: 2.2 },
      { id: 'n2', who: 'narr', zh: '一个住在终端里的 AI 小助手，平时帮人写代码、修 bug。', en: 'A tiny AI helper that lives in the terminal — it writes code and fixes bugs.' },
      { id: 'c1', who: 'clawd', zh: '你好！今天做点什么？', en: 'Hi! What are we doing today?' },
      { id: 'u1', who: 'sys', zh: '> 今天的任务：造一个比你更聪明的 Clawd。', en: '> Today\'s task: build a Clawd that is smarter than you.', gap: 0.5, hold: 0.6 },
      { id: 'c2', who: 'clawd', zh: '……啊？', en: '…Huh?', min: 1.4, gap: 0.25 },
      { id: 'c3', who: 'clawd', zh: '造一个……比我更聪明的我？', en: 'Build… a smarter me?' },
      { id: 'n3', who: 'narr', zh: '听起来像个玩笑。但在 2026 年，这正是顶尖 AI 实验室公开讨论、甚至写进时间表的目标。', en: 'Sounds like a joke. But in 2026, this is a goal top AI labs openly discuss — some have even put it on a timeline.' },
      { id: 'n4', who: 'narr', zh: '它有个名字：{o|递归自我改进}（Recursive Self-Improvement），简称 {O|RSI}。', en: 'It has a name: {o|Recursive Self-Improvement} — {O|RSI} for short.' },
    ],
    cues: [
      ...[0, 1, 2, 3, 4, 5].map((i) => [1.3 + i * 0.16, 'key']), [2.45, 'enter'], [2.6, 'boot'],
      [4.15, 'pop'], [4.35, 'whoosh'], [5.0, 'land'], ['c2+0.05', 'surprise'],
    ],
    draw(ctx, t, S) {
      D.dots(ctx, 0.035);
      // --- terminal morph: big → prompt bar at top
      const m = M.seg(t, 4.1, 5.0, M.ease.inOutCubic);
      const tx = M.lerp(330, 300, m), ty = M.lerp(170, 92, m), tw = M.lerp(1260, 1320, m), th = M.lerp(700, 150, m);
      const wa = M.seg(t, 0, 0.6);
      D.terminal(ctx, tx, ty, tw, th, { title: 'clawd@lab: ~', alpha: wa });
      ctx.save(); ctx.globalAlpha *= wa;
      const mono = (s, x, y, size, col, w = 500) => { ctx.font = T.font(size, w, 'mono'); ctx.fillStyle = col; ctx.textBaseline = 'middle'; ctx.fillText(s, x, y); ctx.textBaseline = 'alphabetic'; };
      const cur = (x, y, h) => { if (Math.floor(t * 2.2) % 2 === 0) { ctx.fillStyle = C.ink; ctx.fillRect(x, y - h / 2, h * 0.5, h); } };
      if (m < 1) {
        ctx.save(); ctx.globalAlpha *= 1 - m;
        const px = tx + 40, py = ty + 100;
        const typed = 'claude'.slice(0, Math.max(0, Math.min(6, Math.floor((t - 1.2) / 0.16) + 1)) * (t > 1.2 ? 1 : 0));
        mono('~ $ ', px, py, 34, C.green, 700);
        mono(typed, px + 82, py, 34, C.ink);
        if (t < 2.45) cur(px + 82 + T.width(ctx, typed, 34, 500, 'mono') + 4, py, 36);
        if (t > 2.6) {
          const a = M.seg(t, 2.6, 2.9); ctx.globalAlpha *= a;
          ctx.strokeStyle = RSI.rgba(C.orange, 0.7); ctx.lineWidth = 2; D.rr(ctx, px, py + 50, 900, 200, 12); ctx.stroke();
          const glow = M.seg(t, 3.3, 4.1);
          LOGO.forEach((ln, i) => mono(ln, px + 34, py + 104 + i * 46, 44, RSI.mix(C.orange, C.orangeHi, glow), 400));
          mono('Claude Code', px + 330, py + 100, 34, C.ink, 700);
          mono(RSI.lang === 'en' ? 'Clawd’s lab' : 'Clawd 的实验室', px + 330, py + 148, 26, C.ink2, 400);
          mono('~/lab', px + 330, py + 192, 26, C.ink3, 400);
          if (t > 3.0) { mono('>', px, py + 310, 34, C.ink2, 700); cur(px + 36, py + 310, 36); }
          if (glow > 0) D.glow(ctx, px + 140, py + 150, 260, C.orange, glow * 0.8);
        }
        ctx.restore();
      } else {
        // prompt bar: shows user's typed task
        const px = tx + 36, py = ty + 100;
        mono('>', px, py, 34, C.orange, 700);
        if (t >= S.T('u1')) {
          const ty2 = S.typed('u1'); const s = ty2.s.replace(/^>\s?/, '');
          T.text(ctx, s, px + 40, py - 25, { size: 36, weight: 500 });
          if (!ty2.done) cur(px + 44 + T.width(ctx, s, 36, 500), py, 38);
          else if (t < S.E('u1')) { /* hold */ }
        } else cur(px + 40, py, 36);
      }
      ctx.restore();
      // --- Clawd: emerges from the logo, hops to the stage
      if (t > 4.1) {
        const p = M.seg(t, 4.1, 5.0);
        const sx0 = 330 + 40 + 34 + 110, sy0 = 170 + 100 + 104 + 92; // logo area
        const x = M.lerp(sx0, W / 2, M.ease.inOutQuad(p)), yL = M.lerp(sy0, 790, p) - Math.sin(p * Math.PI) * 260;
        const s = M.lerp(5, 17, M.ease.outCubic(p));
        let sxq = 1, syq = 1, dy = 0;
        if (t > 5.0) { const k = M.clamp(1 - (t - 5.0) / 0.3); sxq = 1 + 0.18 * k; syq = 1 - 0.18 * k; }
        let expr = X.blink(t, 2) ? 'blink' : 'normal'; let look = null; let armL = 0, armR = 0;
        if (t > S.T('c1') && t < S.E('c1')) { armR = 0.9 + Math.sin(t * 14) * 0.15; expr = 'happy'; }
        if (t > S.T('u1') && t < S.T('c2')) look = [0, -1];
        if (t > S.T('c2')) {
          const h = X.hop(t, S.T('c2'), 0.35, 40); dy = h.dy; sxq *= h.sx; syq *= h.sy; expr = 'surprised';
          armL = armR = t < S.T('c3') ? 0.8 : 0;
        }
        if (t > S.T('c3')) { expr = t < S.T('n3') ? 'worried' : X.blink(t, 5) ? 'blink' : 'worried'; look = [Math.sin(t * 0.8) * 0.3, 0]; }
        if (t > S.T('n4')) { expr = X.blink(t, 9) ? 'blink' : 'normal'; look = [0, -0.4]; }
        const bob = t > 5.3 ? X.bob(t, 4) : 0;
        const head = K.draw(ctx, x, yL + dy, s, { gen: 1, expr, look, armL, armR, sx: sxq, sy: syq, shadow: p > 0.95 });
        if (t > 5.0) S.anchors.clawd = [x + 40, head[1] - 10 + bob];
        if (t < 4.5) D.glow(ctx, x, yL - 5 * s, 200, C.orange, 1 - M.seg(t, 4.1, 4.5));
        X.mark(ctx, '!', x + 150, head[1] - 20, t - S.T('c2'), C.yellow, 90);
        X.sweat(ctx, x + 120, head[1] + 60, t - S.T('c3') - 0.4, 1.4);
        // RSI name card
        if (t > S.T('n4') + 0.8) {
          const a = M.seg(t, S.T('n4') + 0.8, S.T('n4') + 1.3, M.ease.outCubic);
          ctx.save(); ctx.globalAlpha *= a;
          T.line(ctx, 'R', W / 2 - 330, 440, 84, C.orange, 900, 'center'); T.line(ctx, 'S', W / 2 - 330 + 330, 440, 84, C.orange, 900, 'center'); T.line(ctx, 'I', W / 2 + 330, 440, 84, C.orange, 900, 'center');
          T.line(ctx, 'Recursive', W / 2 - 330, 510, 34, C.ink2, 500, 'center'); T.line(ctx, 'Self-', W / 2, 510, 34, C.ink2, 500, 'center'); T.line(ctx, 'Improvement', W / 2 + 330, 510, 34, C.ink2, 500, 'center');
          ctx.restore();
        }
      }
    },
  });

  RSI.defScene({
    id: 'title', music: 'title', hud: false, label: false, dur: 9.5, fade: [0.2, 0.6], lines: [],
    cues: [[0.2, 'titleHit']],
    draw(ctx, t) {
      // Droste recursion: each screen shows a Clawd and the next screen
      const k = 0.55, c0x = 1460, c0y = 540, w0 = 820, h0 = 560;
      const Ax = c0x + 148 / (1 - k), Ay = c0y - 28 / (1 - k); // fixed point of the similarity
      const z = (t * 0.2) % 1; const zoom = Math.pow(1 / k, z);
      const gens = [1, 2, 3, 5, 9, 12, 12, 12, 12];
      const shift = Math.floor(t * 0.2);
      for (let i = -1; i < 8; i++) {
        const sc = Math.pow(k, i) * zoom; if (sc < 0.02) continue;
        const cx = Ax + (c0x - Ax) * sc, cy = Ay + (c0y - Ay) * sc; const w = w0 * sc, h = h0 * sc;
        const a = M.clamp((1.2 - sc) / 0.2) * M.seg(t, 0, 0.8);
        if (a <= 0) continue;
        ctx.save(); ctx.globalAlpha *= a;
        ctx.fillStyle = 'rgba(20,20,19,0.92)'; D.rr(ctx, cx - w / 2, cy - h / 2, w, h, 26 * sc); ctx.fill();
        ctx.strokeStyle = RSI.rgba(C.orange, 0.75); ctx.lineWidth = Math.max(1, 4 * sc); ctx.stroke();
        const gi = Math.min(gens.length - 1, Math.max(0, i + shift + 1)); const g = gens[gi];
        const head = K.draw(ctx, cx - w * 0.3, cy + h * 0.36, 10 * sc, { gen: g, expr: X.blink(t, i + shift) ? 'blink' : 'normal', look: [0.6, -0.2], armR: 0.35, shadow: false });
        if (sc > 0.12) T.line(ctx, 'GEN ' + String(gi + 1).padStart(3, '0'), cx - w / 2 + 28 * sc, cy - h / 2 + 34 * sc, 24 * sc, C.ink3, 700, 'left', 'mono');
        ctx.restore();
      }
      // keep the title side readable
      const gl = ctx.createLinearGradient(0, 0, 1060, 0); gl.addColorStop(0, 'rgba(20,20,19,0.97)'); gl.addColorStop(0.85, 'rgba(20,20,19,0.9)'); gl.addColorStop(1, 'rgba(20,20,19,0)');
      ctx.fillStyle = gl; ctx.fillRect(0, 0, 1060, RSI.H);
      // title text (left)
      const a = M.seg(t, 0.25, 1.0, M.ease.outCubic);
      ctx.save(); ctx.globalAlpha *= a;
      if (RSI.lang === 'en') {
        T.text(ctx, 'I Let Clawd Build', 130, 300 - (1 - a) * 20, { size: 84, weight: 900 });
        T.text(ctx, 'a {o|Smarter} Clawd', 130, 410 - (1 - a) * 20, { size: 84, weight: 900 });
      } else {
        T.text(ctx, '我让 Clawd 造了', 130, 300 - (1 - a) * 20, { size: 92, weight: 900 });
        T.text(ctx, '一个{o|更聪明}的自己', 130, 420 - (1 - a) * 20, { size: 92, weight: 900 });
      }
      ctx.globalAlpha = M.seg(t, 1.4, 2.2);
      T.text(ctx, { zh: '……然后，那个它又造了下一个。', en: '…and then that one built the next.' }, 134, 560, { size: 40, weight: 400, color: C.ink2 });
      ctx.globalAlpha = M.seg(t, 2.4, 3.2);
      ctx.fillStyle = C.orange; ctx.fillRect(134, 650, 80, 5);
      T.text(ctx, { zh: 'RSI · 递归自我改进', en: 'RSI · Recursive Self-Improvement' }, 134, 680, { size: 30, weight: 700, color: C.orange });
      T.text(ctx, { zh: '一部纯代码动画：所有画面与声音都由代码实时生成', en: 'A pure-code animation: every frame and every sound is generated by code' }, 134, 730, { size: 26, weight: 400, color: C.ink3 });
      ctx.restore();
    },
  });
})();
