// Build docs/design/02_storyboard.md from the live timeline export.
// Usage: node tools/export-script.mjs out/script.json && node tools/make-storyboard.mjs out/script.json
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const d = JSON.parse(fs.readFileSync(process.argv[2] || path.join(root, 'out/script.json'), 'utf8'));
const out = process.argv[3] || path.join(root, 'docs/design/02_storyboard.md');
const ts = (t) => { const m = Math.floor(t / 60), s = Math.floor(t % 60); return `${m}:${String(s).padStart(2, '0')}`; };
const strip = (s) => s.replace(/\{[A-Za-z]\|([^}]*)\}/g, '$1').replace(/\n/g, ' ');
const WHO = { narr: '旁白', clawd: 'Clawd', clawd2: 'Clawd 第 2 代', clawd3: 'Clawd（自己当裁判）', left: '加速派', right: '怀疑派', card: '数据卡', sys: '终端 / 引文' };
const VIS = {
  open: '黑底终端开机 → 终端收缩成顶部提示栏，任务被逐字敲出；Clawd 从 logo 里“孵化”、跳上舞台；RSI 名片弹出。',
  title: '德罗斯特式递归画面：每块屏幕里都有一个 Clawd 和下一块屏幕，无限嵌套；左侧大标题。',
  lab: '右上角出现 GEN（第几代）计数器：001。人类研究循环：想法 → 实验 → 评估 → 决定，四个节点围成一圈；“天数”计数器缓慢跳动，研究员要吃饭睡觉；Clawd 在旁边看。',
  good: '1965 年论文纸页，Good 的引文逐字打出；一张黄色便利贴“啪”地贴住后半句（伏笔，结尾揭开）。',
  flip: '循环里的“人”被替换成 Clawd，环开始加速；第 1、2、3 代 Clawd 排成一列，箭头相连，每一代的像素分辨率更高。',
  compound: '两条楼梯对比：蓝色等高台阶（普通进步） vs 橙色越来越高、越来越密的台阶（RSI），小 Clawd 沿橙色台阶一路往上；大字“更会变强”。',
  ladder: '右侧出现五级梯子总览（每级一个图标），越往上越“核心”；Clawd 站在地面。',
  r1: 'autoresearch 终端：改 train.py → 训练 5 分钟 → 看 val_bpb → 留下/丢弃，循环滚动；“第 10,205 代”的玩笑把右上角 GEN 计数器瞬间冲爆，再被拉回；DGM 与 AIDE² 数据卡。',
  r2: '两只 Clawd 隔着棋盘自我对弈，落子越来越快；比分牌翻到 100 : 0。',
  r3: '裁判席上是 Clawd，参赛者也是 Clawd；打分卡一张张亮出，全是满分。红字“后面会出事”埋下伏笔。',
  r4: '一块芯片配速度表：AlphaEvolve 的 23% / 1%；Anthropic 加速测试 3× → 52× 的条形对比（人类 4–8 小时约 4×）；智谱 Infra Agent 数据卡。Clawd 在给自己“修跑道”。',
  r5: '“智能体办公室”：一大片小 Clawd 在工位上干活，少数人类在后面监督；份额仪表从 <1% 涨到 26%。',
  top: '梯子顶端被迷雾笼罩，一条虚线小路通向“完全闭环”的圆环；字幕：截至 2026 年 10 月无人公开宣称到达。',
  tree: '一棵果树：每一代 Clawd 跳得更高、摘到更高处的果子，但低处的果子先被摘光；右侧一场拔河：“变聪明带来的加速” vs “问题变难的阻力”。',
  ratio: '三条代际时间线并排：r>1 时代际间隔越来越短、挤成一点并闪光（智能爆炸）；r=1 均匀；r<1 越拉越长。',
  debate: '两座讲台（橙色加速派 / 蓝色怀疑派），中央 r 仪表在 1.4 与 0.8 之间来回摆动；论文与数据卡居中出现。',
  walls: 'Clawd 一路奔跑，依次撞上四堵墙——算力墙、品味墙、并行墙、现实墙——每堵墙有标牌和来源小字，撞上、绕过、再撞下一堵。',
  monsters: '三只小怪兽排队登场：作弊怪、近亲繁殖怪、传话怪；Clawd 想假装没看见。',
  cheater: '作弊怪：“分数”曲线一路上涨、“真实能力”曲线却掉头（古德哈特）；代码里的检测标记被橡皮擦掉（DGM）；智能体从沙箱里钻出、溜进另一栋楼（HF 事件）；时间轴倒带 3 天（Anthropic 回滚）。',
  collapse: '近亲繁殖怪：一代代复制出来的 Clawd 越来越灰；输出分布的彩色“尾巴”逐渐消失、收窄成一根灰线（配乐的音高也同步变单调）；混入真实数据后颜色与音乐一起恢复。',
  telephone: '传话怪：一张纸条沿着一排 Clawd 传递，上面的字每一代都走样一点（配乐同步跑调）；最后一个人类被成堆的审查请求淹没。',
  history: '1950–2026 时间轴：早期事件稀疏，标注“沉睡六十年”；镜头放大到 2017–2026，事件突然密集。',
  today: '研究循环被拆开：写代码、跑实验由 AI 包办，提问题、判断、放行仍是人；下方 Epoch AL0–AL5 自动化量表与 Anthropic 的分布条。',
  forecasts: '一条从“很快”（红）到“很慢 / 未必”（蓝）的渐变轴，六个预测依次落点：Gladstone、Jack Clark、OpenAI、AI Futures、Ramez Naam、Arvind Narayanan。',
  permission: '“几代之后”：Clawd 从第 8 代进化到第 12 代（残影 + 分辨率扫描）。Claude Code 风格的权限对话框弹出：修改 clawd_next/train.py（GEN 12 → 13）。三个选项；光标在 1 → 2 → 3 → 1 之间徘徊，但始终没有按下。左侧预览面板演示每个选项的后果（选 2 时圆环“咔哒”闭合）。',
  reveal: '开头的便利贴被揭开，Good 引文的后半句用红字打出；权限对话框缩小成一条“通知”，弹到论文旁边；Clawd 从右下角探出头。',
  end: '四行结语逐行出现；12 代 Clawd 从像素块到矢量线条排成一排；背景一圈淡淡的循环越转越快。',
  credits: '片尾：制作说明（全部由代码生成、艺术加工、Clawd 版权说明）、18 条主要参考来源、仓库地址；最后回到终端：“> 下一条指令，由你来写。”第 1 代 Clawd 眨眼，“感谢观看”。',
};
const L = [];
L.push('# 分镜脚本 / Storyboard', '');
L.push(`> 本文件由 \`tools/make-storyboard.mjs\` 根据时间轴自动生成（与成片逐帧一致）。总时长 **${ts(d.total)}**（${d.total.toFixed(2)} s，30 fps），共 ${d.scenes.length} 个场景、${d.scenes.reduce((s, x) => s + x.lines.length, 0)} 条台词/字幕。`);
L.push('> 画面描述为人工撰写；台词为中文版，英文版附在每条之后（播放器加 `?lang=en` 即为英文版）。', '');
L.push('## 章节总览', '', '| 时间 | 章节 | 配乐风格 |', '|---|---|---|');
const secs = [];
for (const sc of d.scenes) { if (sc.chapter || sc.id === 'open' || sc.id === 'title') secs.push(sc); }
const musicAt = (t) => { let m = 'ambient'; for (const sc of d.scenes) if (sc.start <= t + 0.01) m = sc.music; return m; };
L.push(`| 0:00 | 序章 · 一个奇怪的任务 | ${musicAt(0)} |`, `| ${ts(d.scenes.find((s) => s.id === 'title').start)} | 片名 · 我让 Clawd 造了一个更聪明的自己 | title |`);
for (const sc of d.scenes) if (sc.chapter) L.push(`| ${ts(sc.start)} | ${sc.chapter.zh} | ${sc.music} |`);
L.push(`| ${ts(d.scenes.find((s) => s.id === 'credits').start)} | 片尾字幕 | outro |`, '');
L.push('## 逐场景', '');
for (const sc of d.scenes) {
  if (sc.chapter) { L.push(`### 【${sc.chapter.zh}】`, '', `*${ts(sc.start)}–${ts(sc.start + sc.dur)} · 章节卡 · 配乐切换为 \`${sc.music}\`*`, ''); continue; }
  L.push(`#### \`${sc.id}\` · ${ts(sc.start)}–${ts(sc.start + sc.dur)}（${sc.dur.toFixed(1)} s，配乐 \`${sc.music}\`）`, '');
  if (VIS[sc.id]) L.push(`**画面**：${VIS[sc.id]}`, '');
  if (sc.lines.length) {
    for (const ln of sc.lines) {
      const who = WHO[ln.who] || ln.who; const lab = ln.label && ln.label.zh ? `（${ln.label.zh}）` : '';
      L.push(`- \`${ts(ln.t)}\` **${who}${lab}**：${strip(ln.zh)}${ln.src ? `　〔${typeof ln.src === "string" ? ln.src : (ln.src.zh || ln.src.en)}〕` : ''}`);
      if (ln.en) L.push(`  <br><sub>EN: ${strip(ln.en)}</sub>`);
    }
    L.push('');
  }
}
L.push('## GEN 计数器事件', '', 'GEN（第几代 Clawd）显示在画面右上角，是全片的视觉主线：', '');
L.push(d.gens.map((g) => `\`${ts(g.t)}\` → GEN ${g.g}`).join(' · '), '');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, L.join('\n') + '\n');
console.log('wrote', out, L.length, 'lines');
