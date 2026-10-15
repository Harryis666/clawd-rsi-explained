/* RSI·Clawd v2 — player: episode picker, interactive playback (canvas + WebAudio clock), headless render & cover modes. */
(function () {
  'use strict';
  const RSI = window.RSI;
  const qs = new URLSearchParams(location.search);
  RSI.lang = qs.get('lang') === 'en' ? 'en' : 'zh';
  document.documentElement.lang = RSI.lang === 'en' ? 'en' : 'zh-CN';
  const mode = qs.get('mode') || 'play';
  const EN = RSI.lang === 'en';
  let ep = Math.min(4, Math.max(1, parseInt(qs.get('ep') || '1', 10) || 1));
  const cv = document.getElementById('c'); const ctx = cv.getContext('2d');
  // episode durations (for the picker) — building is cheap (no audio)
  const durs = RSI.EPS.map((E) => RSI.build(E.n));
  RSI.build(ep);
  const warm = () => { for (const w of [300, 400, 500, 600, 700, 800, 900]) { ctx.font = RSI.T.font(30, w); ctx.fillText('字Aa', -100, -100); ctx.font = RSI.T.font(30, w, 'mono'); ctx.fillText('Aa', -100, -100); ctx.font = RSI.T.font(30, w, 'serif'); ctx.fillText('字', -100, -100); } };
  warm();
  if (mode === 'render' || mode === 'cover') {
    document.body.classList.add('render');
    cv.width = RSI.W; cv.height = RSI.H;
    RSI.draw = (t, frame) => { ctx.setTransform(1, 0, 0, 1, 0, 0); RSI.renderFrame(ctx, t, frame); };
    RSI.frameJPEG = (t, frame, q = 0.93) => { RSI.draw(t, frame); return cv.toDataURL('image/jpeg', q); };
    RSI.framePNG = (t, frame) => { RSI.draw(t, frame); return cv.toDataURL('image/png'); };
    RSI.coverPNG = (n) => { ctx.setTransform(1, 0, 0, 1, 0, 0); RSI.Series.cover(ctx, n); return cv.toDataURL('image/png'); };
    document.fonts.ready.then(() => { warm(); RSI.ready = true; });
    return;
  }
  // ---------------- interactive ----------------
  const ui = document.getElementById('ui'), start = document.getElementById('start'), endBox = document.getElementById('end');
  const fill = document.getElementById('fill'), bar = document.getElementById('bar'), time = document.getElementById('time');
  const pp = document.getElementById('pp'), langBtn = document.getElementById('lang'), fs = document.getElementById('fs'), epBtn = document.getElementById('epn');
  langBtn.textContent = EN ? '中文' : 'EN';
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
  const epName = (n) => (EN ? `EP ${n} · ${RSI.L(RSI.EPS[n - 1].title)}` : `第 ${n} 集《${RSI.L(RSI.EPS[n - 1].title)}》`);
  function ticks() {
    bar.querySelectorAll('.tick').forEach((d) => d.remove());
    for (const c of RSI.chapters) {
      const d = document.createElement('div'); d.className = 'tick'; d.style.left = (c.t / RSI.total) * 100 + '%';
      const sp = document.createElement('span'); sp.textContent = RSI.L(c.label); d.appendChild(sp); bar.appendChild(d);
    }
    epBtn.textContent = EN ? `EP ${ep}/4` : `第 ${ep}/4 集`;
    document.title = `${epName(ep)} · ${RSI.L(RSI.SERIES.title)}`;
  }
  function setEp(n, t = 0) {
    pause(); ep = n; RSI.build(ep); if (A) { A.reset(); A.build(); }
    tPaused = t; ticks(); endBox.style.display = 'none';
    const u = new URL(location.href); u.searchParams.set('ep', ep); u.searchParams.delete('t'); history.replaceState(null, '', u.toString());
  }
  // picker
  const list = document.getElementById('eps');
  RSI.EPS.forEach((E, i) => {
    const b = document.createElement('button'); b.className = 'ep' + (E.n === ep ? ' on' : '');
    b.innerHTML = `<b>${EN ? 'EP ' + E.n : '第 ' + E.n + ' 集'}</b><i>${RSI.L(E.title)}</i><small>${RSI.L(E.hook)} · ${fmt(durs[i])}</small>`;
    b.onclick = (e) => { e.stopPropagation(); start.style.display = 'none'; if (A) A.init(); if (E.n !== ep) setEp(E.n); else tPaused = 0; play(); poke(); };
    list.appendChild(b);
  });
  document.getElementById('stitle').textContent = RSI.L(RSI.SERIES.title);
  document.getElementById('stag').textContent = RSI.L(RSI.SERIES.tag);
  ticks();
  function play() {
    if (playing) return; playing = true; pp.textContent = '❚❚'; endBox.style.display = 'none';
    if (tPaused >= RSI.total - 0.05) tPaused = 0;
    tStartAt = tPaused; tStartWall = performance.now();
    if (A) A.play(tPaused);
  }
  function pause() { if (!playing) return; tPaused = now(); playing = false; pp.textContent = '▶'; if (A) A.stop(); }
  function seek(t) { const was = playing; if (was) pause(); tPaused = Math.max(0, Math.min(RSI.total - 0.01, t)); if (was) play(); }
  function showEnd() {
    endBox.style.display = 'flex';
    const nb = document.getElementById('nextb');
    if (ep < 4) { nb.style.display = ''; nb.textContent = (EN ? 'Next ▶ ' : '下一集 ▶ ') + epName(ep + 1); } else nb.style.display = 'none';
  }
  document.getElementById('nextb').onclick = (e) => { e.stopPropagation(); if (ep < 4) { setEp(ep + 1); play(); } };
  document.getElementById('again').onclick = (e) => { e.stopPropagation(); tPaused = 0; play(); };
  document.getElementById('menu').onclick = (e) => { e.stopPropagation(); pause(); endBox.style.display = 'none'; start.style.display = 'flex'; };
  start.addEventListener('click', () => { start.style.display = 'none'; if (A) A.init(); play(); poke(); });
  pp.onclick = () => (playing ? pause() : play());
  epBtn.onclick = () => { pause(); start.style.display = 'flex'; };
  bar.addEventListener('click', (e) => { const r = bar.getBoundingClientRect(); seek(((e.clientX - r.left) / r.width) * RSI.total); });
  langBtn.onclick = () => { const u = new URL(location.href); u.searchParams.set('lang', EN ? 'zh' : 'en'); u.searchParams.set('ep', ep); u.searchParams.set('t', now().toFixed(1)); location.href = u.toString(); };
  fs.onclick = () => (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen());
  addEventListener('keydown', (e) => {
    if (start.style.display !== 'none') { if (e.code === 'Space' || e.code === 'Enter') start.click(); return; }
    if (e.code === 'Space') { e.preventDefault(); playing ? pause() : play(); }
    else if (e.code === 'ArrowRight') seek(now() + 5);
    else if (e.code === 'ArrowLeft') seek(now() - 5);
    else if (e.code === 'KeyF') fs.onclick();
    else if (e.code === 'KeyN' && ep < 4) { setEp(ep + 1); play(); }
    else if (e.code === 'KeyP' && ep > 1) { setEp(ep - 1); play(); }
    poke();
  });
  let hideT = 0; const poke = () => { ui.classList.remove('hide'); clearTimeout(hideT); hideT = setTimeout(() => playing && ui.classList.add('hide'), 2600); };
  addEventListener('mousemove', poke);
  function loop() {
    let t = now();
    if (playing && t >= RSI.total) { pause(); tPaused = RSI.total - 0.01; t = tPaused; showEnd(); }
    ctx.setTransform(cv._k, 0, 0, cv._k, 0, 0);
    RSI.renderFrame(ctx, t, frame++);
    fill.style.width = (t / RSI.total) * 100 + '%';
    time.textContent = `${fmt(t)} / ${fmt(RSI.total)}`;
    requestAnimationFrame(loop);
  }
  document.fonts.ready.then(() => { warm(); loop(); });
})();
