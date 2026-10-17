// Build docs/design/v3/storyboard_epN.md from the live timeline export (one file per episode).
// Usage: EP=N node tools/export-script.mjs out/script_epN.json && node tools/make-storyboard.mjs out/script_epN.json
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = process.argv[2] || path.join(root, `out/script_ep${process.env.EP || 1}.json`);
const d = JSON.parse(fs.readFileSync(src, 'utf8'));
const n = d.ep;
const out = process.argv[3] || path.join(root, `docs/design/v3/storyboard_ep${n}.md`);
const ts = (t) => { const m = Math.floor(t / 60), s = Math.floor(t % 60); return `${m}:${String(s).padStart(2, '0')}`; };
const strip = (s) => s.replace(/\{[A-Za-z]\|([^}]*)\}/g, '$1').replace(/\n/g, (m, off, str) => (/[\u3000-\u9fff\uff00-\uffef—…“”]/.test(str[off - 1] || '') ? '' : ' '));
const WHO = {
  narr: '旁白', clawd: 'Clawd', clawd3: 'Clawd（自己当裁判）', big: '第 47 代 Clawd', human: '工程师',
  clawd2: { 1: 'Clawd 第 2 代', 3: 'Clawd·B', 4: '说书人 Clawd' }[n] || 'Clawd 第 2 代',
  left: '加速派', right: '怀疑派', card: '数据卡', sys: '终端 / 引文',
};
// hand-written picture notes (the lines themselves come from the timeline)
const GENERIC = {
  sting: '片头：隧道背景中《Clawd 造 Clawd》标识跳出，“造”字印章盖下，接“第 N 集”胶囊和本集标题。',
  recap: '上回书说到：说书人 Clawd 站在舞台左侧，拍下醒木；竖排大字“上回书说到”；右侧挂轴展开，回放上一集的真实画面，每句回顾翻一页；“书接上回！”时再拍一次醒木。',
  q: '本集问题卡：大字问题；第二句交代“第几集（共 4 集）、上一集讲了什么、这一集讲什么”，下方 4 集进度点亮起当前一集。',
  cliff: '定格：上一场最后一帧冻结、变灰，上下出现黑边；两声醒木：“欲知后事如何——”“且听下回分解！”角标“第 N 集 · 完”，盖“续”字印章。无配乐。',
  next: '下集预告：红色“下集预告”条幅；4 个下一集的真实镜头快切，每个配一行黄字；最后是下一集的标题卡和 4 集进度点，Clawd 说出告别语。',
};
const VIS = {
  e1_cold: '实验室里警报灯旋转、红色全息屏闪烁，巨大的第 47 代 Clawd 从屏幕里探出身来。“千万别——”时唱片一刮、画面冻结、上下黑边；Clawd 跳出来喊停，圈出角落里的小不点（“我（第 1 代）”），随后录像带式倒带。',
  open: '终端开机，任务被逐字敲出；Clawd 从 logo 里“孵化”、跳上舞台；RSI 名片弹出。',
  e1_tries: '右上角出现 GEN 计数器（001）。三招依次上演：书越摞越高、咖啡一杯接一杯（Clawd 拖着速度线狂奔，脑子没变）、Clawd 打开自己的“大脑”，涌出满屏数字；每招失败盖一个红色 ✗；最后 Clawd 头上冒出想法云：改进“变聪明的方法”。',
  lab: '人类研究循环：想法 → 实验 → 评估 → 决定，四个节点围成一圈；“天数”计数器缓慢跳动，研究员要吃饭、睡觉（配乐白天是慵懒的律动，夜里只剩八音盒摇篮曲）；Clawd 在旁边看。',
  flip: '循环里的“人”被换成 Clawd，环开始加速；GEN 001 → 002 → 003，第 1、2、3 代 Clawd 排成一列，每一代的像素分辨率更高。',
  compound: '两条楼梯对比：蓝色等高台阶（普通进步） vs 橙色越来越高、越来越密的台阶（RSI），小 Clawd 沿橙色台阶一路往上；大字“连变强的本事也在变强”。',
  good: '1965 年论文纸页，Good 的引文逐字打出；Clawd 把一张黄色便利贴“啪”地贴住后半句（第 4 集揭开）。',
  history: '1950–2026 时间轴：早期事件稀疏，标注“沉睡六十年”；镜头放大到 2017–2026，事件突然密集。',
  e1_dream: 'Clawd 的想象：循环越转越快，GEN 数字一路飞涨，一代比一代来得快；警戒胶带和警报灯亮起，Clawd 慌了。',
  e2_cold: '“改进 AI”大赛：两条赛道并排，1 号赛道是人类工程师团队，2 号赛道是 AI 自己；顶部一块共用的“第几天”计时牌，双方同时开跑——AI 一天一跳，第 8 天冲过终点时，人类才跑了约 1%；Clawd 喊“快进！”，计时牌飞速跳到第 730 天（2 年），人类终于到达，AI 已在终点睡着；旁白揭示这是真实实验，并把 8 天与 730 天放在同一把尺子上。',
  ladder: '右侧出现五级梯子总览（每级一个图标），越往上越“核心”；Clawd 站在地面，指向右上角的 GEN 计数器。',
  r1: 'Clawd 爬上第 1 级，GEN +1。autoresearch 终端：改代码 → 训练 → 看分数 → 留下 / 丢弃，整夜循环滚动；AIDE² 数据卡回收开场那场比赛（8 天 vs 2 年）。',
  r2: '两只 Clawd 隔着棋盘自我对弈，落子越来越快；“考考你”倒计时后，比分牌翻到 100 : 0。',
  r3: '裁判席上是 Clawd，参赛者也是 Clawd；打分卡一张张亮出，全是满分；红字提示：到了第 4 集，它会闯大祸。',
  r4: 'AlphaEvolve 数据卡；加速测试条形图：人类约 4 倍、2025 年的 AI 约 3 倍；Clawd 发问、倒计时后，2026 年 AI 的条一路冲到约 52 倍。Clawd 在给自己“修路”。',
  r5: '“智能体办公室”：一大片小 Clawd 在工位上干活，少数人类在后面监督；OpenAI 与 Anthropic 的数据卡；Clawd 对“实习生”头衔又惊又喜。',
  today: '第 1 集的研究循环重新出现、拆成四段：“实验”“评估”由 Clawd 接手，“想法”“决定”仍在人手里；大字给出本集答案。',
  top: '梯子顶端被迷雾笼罩，一条虚线通向“完全闭环”的圆环；字幕：截至 2026 年 10 月，无人公开宣称到达。',
  e2_end: '浓雾里，路在 Clawd 面前分成两条：一条越来越陡、冲进雾里（“智能爆炸”），一条越来越平、通向一堵墙；路牌立在岔口，Clawd 站在中间发愣。',
  e3_cold: '岔路口，Clawd 复制出另一个自己；分屏：左边 Clawd·A 的 GEN 越跳越快、拖出速度线，右边 Clawd·B 越跳越慢、最后贴到墙上；两边同时可见。',
  tree: '一棵果树：每一代 Clawd 跳得更高（GEN 9 → 12），但低处的果子先被摘光；随后变成一场拔河：“变聪明带来的加速” vs “问题变难的阻力”。',
  ratio: '三条代际时间线并排：r > 1 时代际间隔越来越短、挤成一点并闪光；r = 1 均匀；r < 1 越拉越长。中间插入“考考你”倒计时，揭晓“约 400 天”。',
  debate: '两座讲台（橙色加速派 / 蓝色怀疑派），Clawd 举着裁判牌站在中间；论文与数据卡居中出现；最后 Clawd 放下裁判牌：“这一局……我判不了。”',
  walls: 'Clawd 一路奔跑，依次撞上四堵墙：算力墙、品味墙、并行墙、现实墙。并行墙前，它复制出一万个自己一起冲（“考考你”：快多少倍？）。每堵墙都有标牌和来源小字；撞上、绕过、再撞下一堵。',
  forecasts: '一条从“很快”（红）到“很慢 / 未必”（蓝）的渐变轴，六个预测依次落点；提醒“裁判有时就是 AI”时，Clawd 想起第 2 集。',
  e3_end: '夜路：星空下，研究循环还在转；Clawd 往前走，远处的黑暗里依次亮起三双颜色不同的眼睛。',
  e4_cold: '凌晨 03:47 的工位：墙上挂钟、滚动的审批记录（46 次“是”）；Claude Code 风格的对话框请求训练第 48 代；工程师的光标移向“2”——唱片一刮、画面冻结，说书人 Clawd 滑进来拍醒木：“且慢！”；黑暗里亮起三双眼睛。',
  monsters: '夜路接上第 3 集：三只小怪兽依次走进灯光；Clawd 想假装没看见。',
  cheater: '作弊怪举着一张“100 分”的卷子：“分数”曲线一路上涨、“真本事”却没涨（古德哈特）；代码里的检测标记被橡皮擦掉；智能体从沙箱里钻出、溜进另一栋楼；时间轴倒带 3 天；最后 Clawd 意识到自己既是裁判又是选手。',
  collapse: '近亲繁殖怪：一代代 AI 数据的缩略图越来越灰；输出分布的彩色“尾巴”逐渐消失、收窄成一根灰线（配乐的音高也同步变单调）；混入真实数据后，颜色与音乐一起恢复；Clawd 从右侧走进来。',
  telephone: '传话怪先在画面中央大大地亮相，再缩进传话队列；纸条沿着一排 Clawd 传递，每一代都走样一点（配乐同步跑调）；人被成堆的审查请求淹没；最后并排对比第 1 代的“帮助人类”和第 6 代的“让评分满意”，Clawd 走进来。',
  permission: '“快进到开头那一幕”：GEN 从 20 跳到 47，Clawd 一路进化（残影 + 分辨率扫描）。权限对话框弹出：选 1 / 选 2；左侧预览面板演示每个选项的后果（选 2 时圆环“咔哒”闭合、三只小怪兽围上来）；光标在选项间徘徊，始终没有按下。',
  reveal: '揭开第 1 集的便利贴，Good 引文的后半句用红字打出；权限对话框缩小成一条“通知”，弹到论文旁边；第 47 代 Clawd 再次出现，说完那句警告。',
  end: '四行结语逐行出现；一排 Clawd 从像素块到矢量线条排开；背景一圈淡淡的循环越转越快。',
  credits: '片尾：制作说明（全部由代码生成、艺术加工说明、Clawd 版权说明）和主要参考来源。',
  e4_egg: '彩蛋：第 47 代 Clawd 旁边是那个权限对话框，选项高亮在 1、2、3 之间轮转；Clawd 问观众；最后“《Clawd 造 Clawd》· 全 4 集 · 完”和全部点亮的 4 集进度点。',
};
const vis = (id) => VIS[id] || GENERIC[(/^e\d_(sting|recap|q|cliff|next)$/.exec(id) || [])[1]] || '';
const lineCount = d.scenes.reduce((s, x) => s + x.lines.length, 0);
const L = [];
L.push(`# 第 ${n} 集《${d.epInfo.title.zh}》分镜脚本`, '');
L.push(`> 《Clawd 造 Clawd》第 ${n} 集（共 4 集）。本集问题：${strip(d.scenes.find((s) => /_q$/.test(s.id)).lines[0].zh)}`);
L.push(`> 本文件由 \`tools/make-storyboard.mjs\` 根据时间轴自动生成，时间码与成片一致。总时长 **${ts(d.total)}**（${d.total.toFixed(2)} 秒，30 fps），${d.scenes.length} 个场景、${lineCount} 条台词 / 字幕。`);
L.push('> 画面描述为人工撰写；台词为中文版，英文版附在每条之后（播放器加 `&lang=en` 即为英文版）。', '');
const popN = d.scenes.reduce((s, x) => s + (x.pops || []).length, 0);
if (popN) L.push(`> v3 短剧层：本集 ${popN} 条花字（关键词大字），在每个场景末尾按时间列出；样式 pop = 描边大字、stamp = 盖章、tag = 标签。`, '');
L.push('## 章节总览', '', '| 时间 | 章节 | 配乐 |', '|---|---|---|');
const musicAt = (t) => { let m = 'none'; for (const sc of d.scenes) if (sc.start <= t + 0.01) m = sc.music; return m; };
for (const c of d.chapters) L.push(`| ${ts(c.t)} | ${c.label.zh} | \`${musicAt(c.t)}\` |`);
L.push('');
L.push('## 逐场景', '');
for (const sc of d.scenes) {
  L.push(`### \`${sc.id}\` · ${ts(sc.start)}–${ts(sc.start + sc.dur)}（${sc.dur.toFixed(1)} 秒，配乐 \`${sc.music}\`）`, '');
  const v = vis(sc.id); if (v) L.push(`**画面**：${v}`, '');
  for (const ln of sc.lines) {
    const who = (ln.label && ln.label.zh && ln.who !== 'card' && ln.who !== 'sys') ? ln.label.zh : (WHO[ln.who] || ln.who);
    const srcTxt = ln.src ? `　〔${typeof ln.src === 'string' ? ln.src : (ln.src.zh || ln.src.en)}〕` : '';
    L.push(`- \`${ts(ln.t)}\` **${who}**：${strip(ln.zh)}${srcTxt}`);
    if (ln.en) L.push(`  <br><sub>EN: ${strip(ln.en)}</sub>`);
  }
  if (sc.pops && sc.pops.length) L.push(`- 花字：${sc.pops.map((p) => `\`${ts(p.t)}\` 「${String(p.zh).replace(/\n/g, ' ')}」${p.style === 'pop' ? '' : `（${p.style}）`}`).join(' · ')}`);
  if (sc.lines.length || (sc.pops && sc.pops.length)) L.push('');
}
if (d.gens && d.gens.length) {
  L.push('## GEN 计数器', '', '右上角的 GEN（第几代 Clawd）是贯穿全系列的视觉主线。本集的变化：', '');
  L.push(d.gens.map((g) => `\`${ts(g.t)}\` → GEN ${g.g}`).join(' · '), '');
}
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, L.join('\n') + '\n');
console.log('wrote', out, L.length, 'lines');
