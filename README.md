# 《Clawd 造 Clawd》

**一部 4 集的纯代码动画，讲“递归自我改进”（RSI，Recursive Self-Improvement）**
*Clawd Builds Clawd — a four-episode, pure-code animated series about recursive self-improvement*

> 4 集 · 共约 13 分钟 · 1920×1080 · 30 fps · 中文版（另有英文版）
> **v3 短剧版**：每集 3 分钟左右；画面上每 ≤ 3 秒就有一个变化（新台词、字幕翻页、关键词花字、推镜头），每集都是“冲突开场 → 小反转 → 高潮 → 结尾钩子”。
> **所有画面和声音都由代码实时生成**：没有图片素材、没有音频采样、没有配音或 TTS，只有 Canvas 2D 和 Web Audio API。所有台词都是屏幕文字。

---

## 这是什么

第 1 代 Clawd（Claude Code 的吉祥物）接到一条离谱的任务：**“造一个比你更聪明的 Clawd。”**

右上角的 GEN（第几代）计数器一路往上跳，Clawd 从粗糙的像素小螃蟹变成细腻的矢量线条。4 集里，它先搞懂这件事叫什么，再看现实走到了哪一步、未来会加速还是撞墙，最后站在一个按钮前：**“以后都不用再问我。”**

| 集 | 标题 | 本集问题 | 时长 |
|---|---|---|---|
| 第 1 集 | 离谱任务 | 为什么“AI 改进 AI”，和平常的进步不一样？ | 2:49 |
| 第 2 集 | 爬到第几级了？ | AI 已经在改进自己了吗？改到了哪一步？ | 3:10 |
| 第 3 集 | 爆炸，还是撞墙？ | 智能会“爆炸”吗？还是迟早撞墙？ | 3:18 |
| 第 4 集 | 以后都不用再问我 | “以后都不用再问我”——这个选项，该按吗？ | 3:33 |

每集都是同一个结构：**冷开场 → 片头 →（上回书说到）→ 本集问题 → 正文 → 本集答案 → 结尾扣子 → 定格“且听下回分解” → 下集预告**。第 1 集埋下的两句“没说完的话”，在第 4 集揭晓。

## 怎么看

**实时版（推荐）**：克隆仓库后，直接用浏览器打开 `index.html`，无需服务器和构建。在开始界面选集，点击“播放”。建议戴耳机。

- `空格` 暂停 / 继续，`←` / `→` 快退 / 快进，`N` / `P` 下一集 / 上一集，`F` 全屏；进度条上有章节刻度
- `index.html?ep=2`：直达第 2 集
- `index.html?lang=en`：英文版
- `index.html?ep=3&t=120`：从第 3 集第 120 秒开始

**成片 MP4**：视频文件太大，不放进 Git 仓库。可以按下面的步骤在本地渲染，结果和实时版逐帧一致。

## 渲染成视频

需要 Node 18+、ffmpeg、Python 3，以及一个 Chromium（Playwright 自带，或者用 `CHROME_PATH` 指定）。

```bash
npm install                      # 安装 playwright
npx playwright install chromium  # 如果没有设置 CHROME_PATH

npm run ep1                      # 渲染第 1 集 → out/clawd-rsi-v3-ep1_zh.mp4
npm run render                   # 依次渲染全部 4 集
npm run ep2:en                   # 第 2 集英文版
npm run covers                   # 4 张封面 → out/covers/ep<N>_zh.png
npm run storyboard               # 从时间轴重新生成 docs/design/v3/storyboard_ep<N>.md
```

每集分三步（`npm run epN` 会依次执行）：

```bash
EP=1 node tools/render-audio.mjs   # ① 离线合成音轨 → out/audio_raw_ep1_zh.wav（附 5 秒窗口响度报告）
EP=1 node tools/render.mjs         # ② 逐帧渲染画面 → out/video_ep1_zh.mp4（分段渲染，可断点续渲）
bash tools/master.sh 1 zh          # ③ 响度标准化到 −16 LUFS 并合成 → out/clawd-rsi-v3-ep1_zh.mp4
```

英文版：前两步加上环境变量 `LANG_RSI=en`，第三步用 `bash tools/master.sh 1 en`。

静帧：`EP=3 node tools/stills.mjs walls@20 debate@5` 导出第 3 集指定场景的静帧（加 `SHEET=名字` 拼成一张总览图）。

节奏自检：`EP=1 node tools/_beats.mjs`（节拍间隔统计）、`EP=1 node tools/_smoke.mjs`（逐帧检查台词越界和重叠）。

## 目录结构

```
index.html              播放器入口（选集、章节、语言切换）
src/
  core.js               数学、缓动、随机数、颜色
  text.js               中英文排版（自动换行、平衡换行、行内高亮标记）
  draw.js               通用图形（面板、循环、梯子、终端、数据卡……）
  clawd.js              Clawd（分辨率 = 代数）、人类、像素小怪兽
  timeline.js           场景 / 台词 / 音效提示的时间轴编排，以及 GEN 计数器
  series.js             系列共用的段落：片头、上回书说到、本集问题、定格、下集预告、封面
  audio.js              全部声音：合成乐器、配乐风格、音效、角色“声音”，实时与离线两种播放
  player.js             播放控制、选集、语言切换、渲染模式
  scenes/               各集正文用到的场景（研究循环、梯子、拔河与四堵墙、小怪兽、权限对话框……）
  episodes/ep1.js … ep4.js   每集的冷开场、专属场景和场景清单
  episodes/pops.js      v3 花字：四集的关键词大字（时间、位置、样式、音效）
tools/                  渲染、音轨、母带、封面、静帧、脚本导出、分镜生成
docs/
  research/             调研：原始笔记、综合报告、观点地图、参考文献、叙事研究
  design/v3/            v3 修改说明与分镜（短剧版）
  design/v2/            v2 设计：系列设定、分镜、事实核查、声音设计
  design/               v1（单片版）的设计文档，供参考
```

## 文档

- [v3 修改说明](docs/design/v3/00_revision_v3_zh.md)：两轮反馈、删改清单、短剧引擎、时长对比
- [短剧节奏调研](docs/research/05_short_drama_pacing_zh.md)：黄金 3 秒、小反转与高潮的间隔、镜头时长研究，以及落成的节拍规则和改前改后数据
- [系列设定](docs/design/v2/00_series_bible_zh.md)：分集大纲、固定结构、角色、扣子地图、13 条叙事准则如何落地
- [叙事研究](docs/research/04_storytelling_research_zh.md)：评书与相声、短剧的“黄金 3 秒”、中外科普创作者、好奇心与悬念的心理学，以及在本系列中的落点
- 分镜脚本（v3）：[第 1 集](docs/design/v3/storyboard_ep1.md) · [第 2 集](docs/design/v3/storyboard_ep2.md) · [第 3 集](docs/design/v3/storyboard_ep3.md) · [第 4 集](docs/design/v3/storyboard_ep4.md)（由时间轴自动生成，中英对照；v2 分镜仍在 `docs/design/v2/`）
- [事实核查与艺术加工说明](docs/design/v2/03_fact_check_v2.md)：每个数字的出处，以及哪些是虚构的
- [声音设计](docs/design/v2/04_audio_design_v2.md)：配乐风格、音效、分段响度校准与母带
- [综合调研报告](docs/research/01_dossier_zh.md) · [观点地图](docs/research/02_viewpoints_map.md) · [参考文献](docs/research/03_bibliography.md) · [调研原始笔记](docs/research/00_research_log.md)
- [更新记录](CHANGELOG.md)

## 关于真实与虚构

- **虚构**：Clawd 的“任务”和所有对话、第 47 代 Clawd、第 2 集的“大赛”、第 3 集的分身、第 4 集的工程师和第 47 次请求、GEN 计数器和分辨率进化（隐喻）、权限对话框、三只小怪兽。
- **真实**：片中的数字、引语和事件都有可查的来源，数据卡上标有简短出处。逐条核查见 [事实核查](docs/design/v2/03_fact_check_v2.md)。资料截至 **2026 年 10 月 15 日**。
- 很多关键数据来自 AI 实验室对自身的测量，片中也提醒了这一点。

## 关于 Clawd

Clawd 是 Anthropic 旗下 Claude Code 的吉祥物。**本项目是非官方的爱好者作品，与 Anthropic 无关联，也未获其背书。**片中的 Clawd 形象由代码重新绘制；与该形象相关的权利归其所有者。

## 许可

代码以 [MIT](LICENSE) 许可发布。文档可以自由引用，请注明出处。

---

## English

**Clawd Builds Clawd** is a four-episode explainer series (about 13 minutes in total, cut as a fast-paced "short drama") on recursive self-improvement (RSI), made entirely in code: every frame is drawn with Canvas 2D and every sound is synthesized with the Web Audio API. There are no image assets, audio samples, voice-over, or TTS; all dialogue is on-screen text.

Clawd, the Claude Code mascot, is given one task: *build a Clawd that's smarter than you.*

1. **The Ridiculous Task**: what RSI is, and why "AI improving AI" differs from ordinary progress.
2. **How High Has It Climbed?**: a five-rung ladder, with 2025–26 evidence for each rung.
3. **Explosion, or a Wall?**: the ratio *r*, the two camps, and four bottlenecks (compute, taste, parallelism, reality).
4. **Don't Ask Me Again**: reward hacking, model collapse, and goal drift, then a final permission prompt.

Each episode opens cold, recaps the previous one, poses one question, answers it, and ends on a cliffhanger with a "next time" teaser. Open `index.html?ep=1&lang=en` in a browser to watch the English version. Use `npm run ep1:en` to render an MP4. Design docs are in `docs/`, mostly in Chinese.

*Unofficial fan work. Not affiliated with or endorsed by Anthropic.* Code: MIT.
