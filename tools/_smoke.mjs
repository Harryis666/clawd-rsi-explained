// dev helper: draw every STEP seconds of each episode/lang, catch exceptions, check line timing sanity.
// env: EP=1,2,3,4  LANG_RSI=zh,en  STEP=0.2
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const exe = fs.existsSync('/usr/local/bin/chromium') ? '/usr/local/bin/chromium' : undefined;
const EPS = (process.env.EP || '1,2,3,4').split(',').map(Number);
const LANGS = (process.env.LANG_RSI || 'zh,en').split(',');
const STEP = +(process.env.STEP || 0.2);
const browser = await chromium.launch({ executablePath: exe });
let bad = 0;
for (const ep of EPS) for (const lang of LANGS) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = [];
  page.on('pageerror', (e) => errs.push('pageerror ' + e.message));
  await page.goto(pathToFileURL(path.join(root, 'index.html')).href + `?mode=render&lang=${lang}&ep=${ep}`);
  await page.waitForFunction(() => window.RSI && RSI.ready, null, { timeout: 30000 });
  const r = await page.evaluate((STEP) => {
    const issues = [];
    for (const sc of RSI.scenes) for (const ln of sc.lines || []) {
      if (!isFinite(ln.t) || !isFinite(ln.dur)) issues.push(`${sc.id}/${ln.id} non-finite t/dur`);
      else if (ln.t + ln.dur > sc.dur + 0.05) issues.push(`${sc.id}/${ln.id} ends ${(ln.t + ln.dur - sc.dur).toFixed(2)}s after scene end`);
      else if (ln.t < 0) issues.push(`${sc.id}/${ln.id} starts before scene`);
    }
    let n = 0;
    for (let t = 0; t < RSI.total; t += STEP) {
      try { RSI.draw(t, Math.round(t * 30)); n++; } catch (e) { issues.push(`t=${t.toFixed(2)} ${RSI.sceneAt(t).id}: ${e.message}`); if (issues.length > 40) break; }
    }
    return { total: RSI.total, n, issues };
  }, STEP);
  const all = [...errs, ...r.issues];
  const m = Math.floor(r.total / 60), s = (r.total % 60).toFixed(1).padStart(4, '0');
  console.log(`EP${ep} ${lang} total ${m}:${s} frames ${r.n} issues ${all.length}`);
  for (const i of all.slice(0, 20)) console.log('   ', i);
  bad += all.filter((i) => !/e\d_(end|dream)\/\w+ ends/.test(i) && !/e1_dream\/d4|e2_end\/n4|e3_end\/x3/.test(i)).length;
  await page.close();
}
await browser.close();
process.exit(bad ? 1 : 0);
