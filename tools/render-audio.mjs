// Render the full soundtrack offline (chunked OfflineAudioContext + overlap-add) → WAV (PCM16, 48 kHz stereo).
// usage: EP=1 node tools/render-audio.mjs [out.wav]   env: EP=1..4, LANG_RSI=zh|en, FROM, TO (seconds), STEM=music|sfx, CHUNK=30, TAIL=14
// default output: out/audio_raw_ep<N>_<lang>.wav
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const lang = process.env.LANG_RSI || 'zh';
const EP = +(process.env.EP || 1);
const outFile = process.argv[2] || path.join(root, `out/audio_raw_ep${EP}_${lang}.wav`);
const SR = 48000, CHUNK = +(process.env.CHUNK || 30), TAIL = +(process.env.TAIL || 14);
const stem = process.env.STEM || undefined;
fs.mkdirSync(path.dirname(outFile), { recursive: true });
const browser = await chromium.launch({ executablePath: (process.env.CHROME_PATH || (fs.existsSync('/usr/local/bin/chromium') ? '/usr/local/bin/chromium' : undefined)), args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
page.on('console', (m) => { if (m.type() === 'error' && !/ERR_FILE_NOT_FOUND/.test(m.text())) console.log('[page]', m.text()); });
await page.goto(pathToFileURL(path.join(root, 'index.html')).href + `?mode=render&lang=${lang}&ep=${EP}`);
await page.waitForFunction(() => window.RSI && RSI.ready && RSI.Audio);
const info = await page.evaluate(() => { const n = RSI.Audio.build(); return { total: RSI.total, n, stats: RSI.Audio.stats() }; });
console.log('events', info.n, JSON.stringify(info.stats.c));
const from = +(process.env.FROM || 0), to = Math.min(info.total, +(process.env.TO || info.total));
const N = Math.ceil((to - from) * SR);
const L = new Float32Array(N), R = new Float32Array(N);
const t0 = Date.now();
for (let a = from; a < to; a += CHUNK) {
  const b = Math.min(to, a + CHUNK);
  const r = await page.evaluate(([a, b, tail, sr, stem]) => RSI.Audio.renderChunkB64(a, b, tail, sr, stem), [a, b, TAIL, SR, stem]);
  const buf = Buffer.from(r.b64, 'base64'); const ab = new ArrayBuffer(buf.length); new Uint8Array(ab).set(buf); const f = new Float32Array(ab);
  const off = Math.round((a - from) * SR);
  for (let i = 0, m = f.length / 2; i < m; i++) { const j = off + i; if (j >= N) break; L[j] += f[2 * i]; R[j] += f[2 * i + 1]; }
  process.stdout.write(`chunk ${a.toFixed(0)}–${b.toFixed(0)}s  events=${r.k}  ${((Date.now() - t0) / 1000).toFixed(1)}s\n`);
}
await browser.close();
// ---- analysis
let peak = 0, sum = 0; for (let i = 0; i < N; i++) { const x = Math.max(Math.abs(L[i]), Math.abs(R[i])); if (x > peak) peak = x; sum += L[i] * L[i] + R[i] * R[i]; }
const rms = Math.sqrt(sum / (2 * N)); const db = (x) => (20 * Math.log10(x + 1e-12)).toFixed(1);
console.log(`raw peak ${db(peak)} dBFS, rms ${db(rms)} dBFS`);
// per-window loudness report (5 s windows), for QA
const W5 = SR * 5; const rep = [];
for (let s = 0; s < N; s += W5) { let q = 0, p = 0; const e = Math.min(N, s + W5); for (let i = s; i < e; i++) { q += L[i] * L[i] + R[i] * R[i]; p = Math.max(p, Math.abs(L[i]), Math.abs(R[i])); } rep.push(`${(from + s / SR).toFixed(0)}s:${db(Math.sqrt(q / (2 * (e - s))))}/${db(p)}`); }
fs.writeFileSync(outFile.replace(/\.wav$/, '.loudness.txt'), rep.join('\n') + '\n');
// ---- normalize: target RMS −17 dBFS but keep peaks ≤ −0.8 dBFS after a soft knee
const target = Math.pow(10, -17 / 20);
let g = rms > 0 ? target / rms : 1; g = Math.min(g, (0.92 / peak) * 1.6);
if (process.env.GAIN) g = +process.env.GAIN;
console.log('gain', g.toFixed(3));
const knee = 0.72, ceil = 0.91;
const soft = (x) => { const a = Math.abs(x); if (a <= knee) return x; const y = knee + (ceil - knee) * Math.tanh((a - knee) / (ceil - knee)); return Math.sign(x) * y; };
const fadeN = Math.round(1.2 * SR);
const pcm = Buffer.alloc(N * 4); let clipped = 0;
for (let i = 0; i < N; i++) {
  const fo = to >= info.total - 0.01 && i > N - fadeN ? (N - i) / fadeN : 1;
  const fi = from === 0 && i < 0.02 * SR ? i / (0.02 * SR) : 1;
  let l = soft(L[i] * g) * fo * fi, r = soft(R[i] * g) * fo * fi;
  if (Math.abs(L[i] * g) > knee || Math.abs(R[i] * g) > knee) clipped++;
  pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, l)) * 32767), i * 4); pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, r)) * 32767), i * 4 + 2);
}
console.log(`samples above knee: ${(100 * clipped / N).toFixed(3)}%`);
const hdr = Buffer.alloc(44);
hdr.write('RIFF', 0); hdr.writeUInt32LE(36 + pcm.length, 4); hdr.write('WAVE', 8); hdr.write('fmt ', 12); hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20); hdr.writeUInt16LE(2, 22);
hdr.writeUInt32LE(SR, 24); hdr.writeUInt32LE(SR * 4, 28); hdr.writeUInt16LE(4, 32); hdr.writeUInt16LE(16, 34); hdr.write('data', 36); hdr.writeUInt32LE(pcm.length, 40);
fs.writeFileSync(outFile, Buffer.concat([hdr, pcm]));
console.log('wrote', outFile, ((44 + pcm.length) / 1e6).toFixed(1) + ' MB', `${((Date.now() - t0) / 1000).toFixed(1)}s`);
