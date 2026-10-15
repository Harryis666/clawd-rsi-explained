// Render the animation to MP4: headless Chromium draws each frame → JPEG → ffmpeg (libx264), in resumable segments.
// usage: node tools/render.mjs            env: LANG_RSI=zh|en  FPS=30  SEG=900 (frames/segment)  CRF=20  PRESET=medium
//        FROM_FRAME / TO_FRAME (optional, for tests)  NOMUX=1 (skip muxing audio)
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const lang = process.env.LANG_RSI || 'zh';
const FPS = +(process.env.FPS || 30), SEG = +(process.env.SEG || 900), CRF = process.env.CRF || '20', PRESET = process.env.PRESET || 'medium';
const dir = path.join(root, `out/video_${lang}`); fs.mkdirSync(dir, { recursive: true });
const log = (s) => { const line = `[${new Date().toISOString().slice(11, 19)}] ${s}`; console.log(line); fs.appendFileSync(path.join(root, `out/render_${lang}.log`), line + '\n'); };
const browser = await chromium.launch({ executablePath: (process.env.CHROME_PATH || (fs.existsSync('/usr/local/bin/chromium') ? '/usr/local/bin/chromium' : undefined)), args: ['--disable-gpu-vsync', '--disable-background-timer-throttling'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on('pageerror', (e) => log('[pageerror] ' + e.message));
await page.goto(pathToFileURL(path.join(root, 'index.html')).href + `?mode=render&lang=${lang}`);
await page.waitForFunction(() => window.RSI && RSI.ready, null, { timeout: 60000 });
const total = await page.evaluate(() => RSI.total);
const nFrames = Math.floor(total * FPS);
const f0 = +(process.env.FROM_FRAME || 0), f1 = Math.min(nFrames, +(process.env.TO_FRAME || nFrames));
log(`total ${total.toFixed(2)}s → ${nFrames} frames; rendering ${f0}..${f1} (seg ${SEG}, crf ${CRF}, ${PRESET})`);
const t0 = Date.now(); let done = 0;
const segs = [];
for (let s = Math.floor(f0 / SEG) * SEG; s < f1; s += SEG) {
  const a = Math.max(s, f0), b = Math.min(f1, s + SEG);
  const name = path.join(dir, `seg_${String(s / SEG).padStart(4, '0')}${a !== s || b !== s + SEG && b !== nFrames ? `_${a}-${b}` : ''}.mp4`);
  segs.push(name);
  if (fs.existsSync(name)) { log(`skip ${path.basename(name)}`); continue; }
  const tmp = name.replace(/\.mp4$/, '.tmp.mp4');
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', PRESET, '-crf', CRF, '-tune', 'animation', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', tmp], { stdio: ['pipe', 'inherit', 'inherit'] });
  const exited = new Promise((res) => ff.on('exit', res));
  for (let f = a; f < b; f++) {
    const url = await page.evaluate(([t, f]) => RSI.frameJPEG(t, f, 0.92), [f / FPS, f]);
    const buf = Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    done++;
    if (done % 300 === 0) { const el = (Date.now() - t0) / 1000, fps = done / el; log(`frame ${f + 1}/${f1}  ${fps.toFixed(2)} fps  ETA ${((f1 - f - 1) / fps / 60).toFixed(1)} min`); }
  }
  ff.stdin.end(); const code = await exited;
  if (code !== 0) { log(`ffmpeg failed (${code}) on ${path.basename(name)}`); process.exit(1); }
  fs.renameSync(tmp, name); log(`wrote ${path.basename(name)}`);
}
await browser.close();
if (f0 === 0 && f1 === nFrames) {
  const list = path.join(dir, 'list.txt'); fs.writeFileSync(list, segs.map((s) => `file '${s}'`).join('\n') + '\n');
  const video = path.join(root, `out/video_${lang}.mp4`);
  execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', list, '-c', 'copy', '-movflags', '+faststart', video]);
  log(`concat → ${video}`);
  const wav = path.join(root, `out/audio_${lang}.wav`);
  if (!process.env.NOMUX && fs.existsSync(wav)) {
    const outp = path.join(root, `out/rsi-clawd_${lang}.mp4`);
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', video, '-i', wav, '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', outp]);
    log(`muxed → ${outp}`);
  }
}
log(`done in ${((Date.now() - t0) / 60000).toFixed(1)} min`);
