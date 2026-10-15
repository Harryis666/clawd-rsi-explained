/* RSI·Clawd — player: interactive playback (canvas + WebAudio clock) and headless render mode. */
(function () {
  'use strict';
  const RSI = window.RSI;
  const qs = new URLSearchParams(location.search);
  RSI.lang = qs.get('lang') === 'en' ? 'en' : 'zh';
  document.documentElement.lang = RSI.lang === 'en' ? 'en' : 'zh-CN';
  const mode = qs.get('mode') || 'play';
  const cv = document.getElementById('c'); const ctx = cv.getContext('2d');
  RSI.build();
  const warm = () => { for (const w of [300, 400, 500, 700, 900]) { ctx.font = RSI.T.font(30, w); ctx.fillText('字Aa', -100, -100); ctx.font = RSI.T.font(30, w, 'mono'); ctx.fillText('Aa', -100, -100); ctx.font = RSI.T.font(30, w, 'serif'); ctx.fillText('字', -100, -100); } };
  warm();
  if (mode === 'render') {
    document.body.classList.add('render');
    cv.width = RSI.W; cv.height = RSI.H;
    RSI.draw = (t, frame) => { ctx.setTransform(1, 0, 0, 1, 0, 0); RSI.renderFrame(ctx, t, frame); };
    RSI.frameJPEG = (t, frame, q = 0.93) => { RSI.draw(t, frame); return cv.toDataURL('image/jpeg', q); };
    RSI.framePNG = (t, frame) => { RSI.draw(t, frame); return cv.toDataURL('image/png'); };
    document.fonts.ready.then(() => { warm(); RSI.ready = true; });
    return;
  }
  // ---------------- interactive ----------------
  const ui = document.getElementById('ui'), start = document.getElementById('start');
  const fill = document.getElementById('fill'), bar = document.getElementById('bar'), time = document.getElementById('time');
  const pp = document.getElementById('pp'), langBtn = document.getElementById('lang'), fs = document.getElementById('fs');
  langBtn.textContent = RSI.lang === 'en' ? '中文' : 'EN';
  let playing = false, tPaused = Number(qs.get('t') || 0), tStartWall = 0, tStartAt = 0, frame = 0;
  const A = RSI.Audio;
  const now = () => {
    if (!playing) return tPaused;
    if (A && A.ok()) return A.time();
    return tStartAt + (performance.now() - tStartWall) / 1000;
  };
  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const s = Math.min(innerWidth / RSI.W, innerHeight / RSI.H);
    cv.style.width = Math.round(RSI.W * s) + 'px'; cv.style.height = Math.round(RSI.H * s) + 'px';
    cv.width = Math.round(RSI.W * s * dpr); cv.height = Math.round(RSI.H * s * dpr);
    cv._k = s * dpr;
  }
  addEventListener('resize', resize); resize();
  const fmt = (x) => `${Math.floor(x / 60)}:${String(Math.floor(x % 60)).padStart(2, '0')}`;
  for (const c of RSI.chapters) {
    const d = document.createElement('div'); d.className = 'tick'; d.style.left = (c.t / RSI.total) * 100 + '%';
    const sp = document.createElement('span'); sp.textContent = RSI.L(c.label); d.appendChild(sp); bar.appendChild(d);
  }
  function play() {
    if (playing) return; playing = true; pp.textContent = '❚❚';
    if (tPaused >= RSI.total - 0.05) tPaused = 0;
    tStartAt = tPaused; tStartWall = performance.now();
    if (A) A.play(tPaused);
  }
  function pause() { if (!playing) return; tPaused = now(); playing = false; pp.textContent = '▶'; if (A) A.stop(); }
  function seek(t) { const was = playing; if (was) pause(); tPaused = Math.max(0, Math.min(RSI.total - 0.01, t)); if (was) play(); }
  start.addEventListener('click', () => { start.style.display = 'none'; if (A) A.init(); play(); poke(); });
  pp.onclick = () => (playing ? pause() : play());
  bar.addEventListener('click', (e) => { const r = bar.getBoundingClientRect(); seek(((e.clientX - r.left) / r.width) * RSI.total); });
  langBtn.onclick = () => { const u = new URL(location.href); u.searchParams.set('lang', RSI.lang === 'en' ? 'zh' : 'en'); u.searchParams.set('t', now().toFixed(1)); location.href = u.toString(); };
  fs.onclick = () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen());
  addEventListener('keydown', (e) => {
    if (start.style.display !== 'none') { if (e.code === 'Space' || e.code === 'Enter') start.click(); return; }
    if (e.code === 'Space') { e.preventDefault(); playing ? pause() : play(); }
    else if (e.code === 'ArrowRight') seek(now() + 5);
    else if (e.code === 'ArrowLeft') seek(now() - 5);
    else if (e.code === 'KeyF') fs.onclick();
    poke();
  });
  let hideT = 0; const poke = () => { ui.classList.remove('hide'); clearTimeout(hideT); hideT = setTimeout(() => playing && ui.classList.add('hide'), 2600); };
  addEventListener('mousemove', poke);
  function loop() {
    let t = now();
    if (playing && t >= RSI.total) { pause(); tPaused = RSI.total - 0.01; t = tPaused; }
    ctx.setTransform(cv._k, 0, 0, cv._k, 0, 0);
    RSI.renderFrame(ctx, t, frame++);
    fill.style.width = (t / RSI.total) * 100 + '%';
    time.textContent = `${fmt(t)} / ${fmt(RSI.total)}`;
    requestAnimationFrame(loop);
  }
  document.fonts.ready.then(() => { warm(); loop(); });
})();
