# 我让 Clawd 造了一个更聪明的自己

**一部关于“递归自我改进”（RSI，Recursive Self-Improvement）的纯代码动画**
*I Let Clawd Build a Smarter Clawd — a pure-code animation about recursive self-improvement*

> 13 分 17 秒 · 1920×1080 · 30 fps · 中文版（另有英文版）
> **所有画面和声音都由代码实时生成**：没有图片素材、没有音频采样、没有 TTS，只有 Canvas 2D 和 Web Audio API。

---

## 这是什么

给 Claude Code 的吉祥物 Clawd 布置一个任务：**“造一个比你更聪明的 Clawd。”**

然后看着它一代代升级：右上角的 GEN（第几代）计数器往上跳，Clawd 从粗糙的像素小螃蟹变成细腻的矢量线条。跟着它，用 13 分钟讲清楚 RSI：

| 段落 | 内容 |
|---|---|
| 序章 · 一个奇怪的任务 | 实验设定；什么是 RSI |
| 第一章 · 变得“更会变强” | 人类的研究循环 → I. J. Good 1965 年的“智能爆炸”（后半句先贴上便利贴）→ 把人换成 AI → 复利楼梯 |
| 第二章 · 一架五级的梯子 | 改进做事方法 → 自己出题 → 自己当裁判 → 改进基础设施 → 自己做研究；每一级都配 2025–2026 年的真实证据 |
| 第三章 · 爆炸，还是撞墙？ | 低垂的果实与拔河；比值 r；加速派 vs 怀疑派；算力墙、品味墙、并行墙、现实墙 |
| 第四章 · 三只小怪兽 | 作弊怪（奖励作弊）、近亲繁殖怪（模型崩溃）、传话怪（目标漂移与监督瓶颈） |
| 第五章 · 2026，我们走到哪了？ | 沉睡六十年的历史；今天的人机分工与 AL0–AL5；五花八门的预测 |
| 尾声 · 最后一个选项 | 一个 Claude Code 风格的权限对话框：“是，并且以后都不用再问我”？揭开便利贴 |

## 怎么看

**实时版（推荐）**：克隆仓库后，直接用浏览器打开 `index.html`，无需服务器和构建，点击“播放”即可。建议戴耳机。

- `空格` 暂停 / 继续，`←` / `→` 快退 / 快进，`F` 全屏；进度条上有章节刻度
- `index.html?lang=en`：英文版
- `index.html?t=600`：从第 600 秒开始播放

**成片 MP4**：视频文件约 99 MB，不适合放进 Git 仓库。可以按下面的步骤在本地渲染，结果和实时版逐帧一致。

## 渲染成视频

需要 Node 18+、ffmpeg、Python 3，以及一个 Chromium（Playwright 自带，或者用 `CHROME_PATH` 指定）。

```bash
npm install                      # 安装 playwright
npx playwright install chromium  # 如果没有设置 CHROME_PATH

node tools/render-audio.mjs out/audio_raw_zh.wav   # ① 离线合成音轨（约 7 分钟）
NOMUX=1 node tools/render.mjs                      # ② 逐帧渲染画面 → out/video_zh.mp4（约 15–30 分钟，可断点续渲）
bash tools/master.sh zh                            # ③ 响度标准化到 −16 LUFS 并合成 → out/rsi-clawd_zh.mp4
```

英文版：给前两步加上环境变量 `LANG_RSI=en`，第三步运行 `bash tools/master.sh en`（输出文件名对应改为 `_en`）。

其他工具：`node tools/stills.mjs debate@5 walls@20` 导出指定场景的静帧；`node tools/export-script.mjs && node tools/make-storyboard.mjs` 从时间轴重新生成分镜文档。

## 目录结构

```
index.html              播放器入口
src/
  core.js               数学、缓动、随机数、颜色
  text.js               中英文排版（自动换行、平衡换行、行内高亮标记）
  draw.js               通用图形（面板、循环、梯子、终端、数据卡……）
  clawd.js              Clawd（分辨率 = 代数）、人类研究员、像素小怪兽
  timeline.js           场景 / 台词 / 音效提示的时间轴编排，以及 GEN 计数器
  audio.js              全部声音：合成乐器、配乐风格、音效、角色“声音”，实时与离线两种播放
  player.js             播放控制、语言切换、渲染模式
  scenes/00_open.js … 06_epilogue.js   七个段落的场景
tools/                  渲染、母带、静帧、脚本导出
docs/
  research/             调研：原始笔记、综合报告、观点地图、参考文献
  design/               设计：角度与结构、分镜脚本、事实核查、声音设计
```

## 文档

- [调研原始笔记](docs/research/00_research_log.md)：调研过程中逐条记录的来源和要点（英文）
- [综合调研报告](docs/research/01_dossier_zh.md)：定义光谱、思想史、2026 年证据、爆炸还是撞墙、风险、预测、治理、中文舆论观察
- [观点地图](docs/research/02_viewpoints_map.md)：四个阵营，共识与分歧
- [参考文献](docs/research/03_bibliography.md)：近 60 条来源、70 多个链接
- [选题角度与结构](docs/design/01_angle_analysis_zh.md)：为什么选“实验叙事”，核心隐喻，首尾呼应
- [分镜脚本](docs/design/02_storyboard.md)：由时间轴自动生成的逐场景画面与台词（中英对照）
- [事实核查与艺术加工说明](docs/design/03_fact_check.md)：每个数字的出处，以及哪些是虚构的
- [声音设计](docs/design/04_audio_design.md)：乐器、配乐风格、音效、混音与母带

## 关于真实与虚构

- **虚构**：Clawd 的“实验”、所有对话、GEN 计数器和分辨率进化（隐喻）、“今天”一节的分工比例条（示意）、结尾的权限对话框。
- **真实**：片中的数字、引语和事件都有可查的来源，数据卡角落标有出处。逐条核查见 [事实核查](docs/design/03_fact_check.md)。资料截至 **2026 年 10 月 14 日**。
- 很多关键数据来自 AI 实验室对自身的测量，片中也提醒了这一点。

## 关于 Clawd

Clawd 是 Anthropic 旗下 Claude Code 的吉祥物。**本项目是非官方的爱好者作品，与 Anthropic 无关联，也未获其背书。**片中的 Clawd 形象由代码重新绘制；与该形象相关的权利归其所有者。

## 许可

代码以 [MIT](LICENSE) 许可发布。文档可以自由引用，请注明出处。

---

## English

**I Let Clawd Build a Smarter Clawd** is a 13-minute explainer about recursive self-improvement (RSI), made entirely in code: every frame is drawn with Canvas 2D and every sound is synthesized with the Web Audio API. There are no image assets, no audio samples, and no TTS.

Clawd, the Claude Code mascot, is given one task: *build a Clawd that's smarter than you.* A generation counter ticks upward, and Clawd's resolution improves from chunky pixels to smooth vectors. Along the way the video covers:

- what RSI is, shown as a five-rung ladder with 2025–26 evidence for each rung
- the "explosion vs. wall" debate (the ratio *r*, plus compute, taste, parallelism, and reality bottlenecks)
- three risks: reward hacking, model collapse, and goal drift with its oversight bottleneck
- where things stood in October 2026
- a final permission prompt: *"Yes, and don't ask me again"?*

Open `index.html?lang=en` in a browser to watch the English version. See the render commands above to produce an MP4. Research notes and design docs are in `docs/`, mostly in Chinese. The raw research log is in English.

*Unofficial fan work. Not affiliated with or endorsed by Anthropic.* Code: MIT.