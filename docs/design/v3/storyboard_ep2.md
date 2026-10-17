# 第 2 集《爬到第几级了？》分镜脚本

> 《Clawd 造 Clawd》第 2 集（共 4 集）。本集问题：AI 已经在改进自己了吗？改到了哪一步？
> 本文件由 `tools/make-storyboard.mjs` 根据时间轴自动生成，时间码与成片一致。总时长 **3:12**（192.16 秒，30 fps），15 个场景、45 条台词 / 字幕。
> 画面描述为人工撰写；台词为中文版，英文版附在每条之后（播放器加 `&lang=en` 即为英文版）。

> v3 短剧层：本集 31 条花字（关键词大字），在每个场景末尾按时间列出；样式 pop = 描边大字、stamp = 盖章、tag = 标签。

## 章节总览

| 时间 | 章节 | 配乐 |
|---|---|---|
| 0:00 | 开场 | `hook` |
| 0:29 | 上回书说到 | `story` |
| 0:39 | 本集问题 | `story` |
| 0:43 | 五个层级 | `build` |
| 0:52 | 第 1 级 | `build` |
| 1:04 | 第 2 级 | `build` |
| 1:22 | 第 3 级 | `build` |
| 1:38 | 第 4 级 | `build` |
| 2:03 | 第 5 级 | `build` |
| 2:23 | 本集答案 | `reflect` |
| 2:37 | 最高一级 | `build` |
| 2:51 | 两种预测 | `tension` |
| 3:04 | 下集预告 | `tease` |

## 逐场景

### `e2_cold` · 0:00–0:26（26.9 秒，配乐 `hook`）

**画面**：“改进 AI”大赛：两条赛道并排，1 号赛道是人类工程师团队，2 号赛道是 AI 自己；顶部一块共用的“第几天”计时牌，双方同时开跑——AI 一天一跳，第 8 天冲过终点时，人类才跑了约 1%；Clawd 喊“快进！”，计时牌飞速跳到第 730 天（2 年），人类终于到达，AI 已在终点睡着；旁白揭示这是真实实验，并把 8 天与 730 天放在同一把尺子上。

- `0:00` **Clawd**：欢迎来到——“改进 AI”大赛！
  <br><sub>EN: Welcome to — the “Improve the AI” Championship!</sub>
- `0:03` **Clawd**：1 号赛道：人类工程师团队！
  <br><sub>EN: Lane one: a team of human engineers!</sub>
- `0:05` **Clawd**：2 号赛道：AI——它要改进的，正是它自己！
  <br><sub>EN: Lane two: the AI — and what it’s improving is itself!</sub>
- `0:12` **Clawd**：第 8 天——AI 冲线了！
  <br><sub>EN: Day eight — the AI crosses the line!</sub>
- `0:14` **Clawd**：人类选手呢？……快进！
  <br><sub>EN: And the humans? …Fast-forward!</sub>
- `0:18` **旁白**：这不是科幻：2026 年，一家 AI 公司公布了这项实验——AI 改进自己 8 天，胜过人类 2 年的打磨。
  <br><sub>EN: This isn’t science fiction: in 2026, an AI company published this experiment — an AI improving itself for 8 days beat two years of human polishing.</sub>
- `0:23` **Clawd**：……等等。AI，已经在改进自己了？
  <br><sub>EN: …Wait. AI is already improving itself?</sub>
- 花字：`0:07` 「改它自己？！」 · `0:09` 「差距拉开了！」 · `0:21` 「8 天 > 2 年」

### `e2_sting` · 0:26–0:29（3.1 秒，配乐 `none`）

**画面**：片头：隧道背景中《Clawd 造 Clawd》标识跳出，“造”字印章盖下，接“第 N 集”胶囊和本集标题。

### `e2_recap` · 0:29–0:39（9.7 秒，配乐 `story`）

**画面**：上回书说到：说书人 Clawd 站在舞台左侧，拍下醒木；竖排大字“上回书说到”；右侧挂轴展开，回放上一集的真实画面，每句回顾翻一页；“书接上回！”时再拍一次醒木。

- `0:30` **旁白**：上回书说到——
  <br><sub>EN: Previously…</sub>
- `0:32` **旁白**：AI 改进“变聪明的方法”，一代造一代——而且越造越快。
  <br><sub>EN: AI improves “the way to get smarter”: each generation builds the next — faster and faster.</sub>
- `0:35` **旁白**：可这个循环……停得下来吗？
  <br><sub>EN: But can this loop… ever stop?</sub>
- `0:37` **旁白**：书接上回！
  <br><sub>EN: Back to the story!</sub>

### `e2_q` · 0:39–0:43（3.9 秒，配乐 `story`）

**画面**：本集问题卡：大字问题；第二句交代“第几集（共 4 集）、上一集讲了什么、这一集讲什么”，下方 4 集进度点亮起当前一集。

- `0:40` **旁白**：AI 已经在改进自己了吗？改到了哪一步？
  <br><sub>EN: Is AI already improving itself? How far has it got?</sub>
- 花字：`0:41` 「第几步？」

### `ladder` · 0:43–0:52（8.6 秒，配乐 `build`）

**画面**：右侧出现五级梯子总览（每级一个图标），越往上越“核心”；Clawd 站在地面，指向右上角的 GEN 计数器。

- `0:43` **旁白**：“改进自己”分层次：越往上，AI 改动的东西越核心。本片把它简化成五级。
  <br><sub>EN: “Improving itself” comes in levels: the higher up, the more core the things AI changes. We simplify it to five rungs.</sub>
- `0:48` **Clawd**：每爬上一级，我就升一代——看右上角！
  <br><sub>EN: Each rung I climb, I become a new generation — watch the top-right!</sub>
- 花字：`0:46` 「5 级」 · `0:50` 「↑ 升一代」（tag）

### `r1` · 0:52–1:04（12.8 秒，配乐 `build`）

**画面**：Clawd 爬上第 1 级，GEN +1。autoresearch 终端：改代码 → 训练 → 看分数 → 留下 / 丢弃，整夜循环滚动；AIDE² 数据卡回收开场那场比赛（8 天 vs 2 年）。

- `0:53` **旁白**：比如 Karpathy 的 autoresearch（2026.3）：AI 改代码、训练 5 分钟、看分数，好就留下，差就扔掉，整夜循环。
  <br><sub>EN: Take Karpathy’s autoresearch (Mar 2026): an AI edits code, trains for 5 minutes, checks the score, keeps it or throws it away — all night long.</sub>
- `0:58` **数据卡**：开头那场比赛：Weco 的 AIDE²（2026）。会自己做实验的 AI 改进自己 8 天，胜过人类打磨 2 年的版本。　〔Weco AI，arXiv:2609.26457（公司自报）〕
  <br><sub>EN: The race from the opening: Weco’s AIDE² (2026). An AI that runs its own experiments improved itself for 8 days and beat the version humans polished for 2 years.</sub>
- 花字：`0:57` 「整夜循环」 · `1:00` 「就是开头那场！」（tag）

### `r2` · 1:04–1:22（18.0 秒，配乐 `build`）

**画面**：两只 Clawd 隔着棋盘自我对弈，落子越来越快；“考考你”倒计时后，比分牌翻到 100 : 0。

- `1:06` **旁白**：2017 年的 AlphaGo Zero，不看人类棋谱，只跟自己下棋。
  <br><sub>EN: In 2017, AlphaGo Zero studied no human games. It only played against itself.</sub>
- `1:09` **Clawd**：只跟自己下……要练多久，才能赢过当年打败李世石的 AlphaGo？
  <br><sub>EN: Only itself… so how long until it beats the AlphaGo that defeated Lee Sedol?</sub>
- `1:14` **旁白**：答案：3 天。100 比 0，完胜那个版本。
  <br><sub>EN: The answer: three days. It won 100 to 0.</sub>
- `1:17` **旁白**：今天的大模型也用类似的办法：自己出题、自己解答，挑出做对的，再拿来训练自己。
  <br><sub>EN: Today's models do something similar: write problems, solve them, keep the correct ones, and train on them.</sub>
- 花字：`1:07` 「只跟自己下」（tag） · `1:14` 「3 天！」（stamp）

### `r3` · 1:22–1:38（15.5 秒，配乐 `build`）

**画面**：裁判席上是 Clawd，参赛者也是 Clawd；打分卡一张张亮出，全是满分；红字提示：到了第 4 集，它会闯大祸。

- `1:24` **旁白**：人类没法给海量回答一个个打分，于是让 AI 按一套原则，去给 AI 的回答打分。
  <br><sub>EN: Humans can't grade millions of answers one by one, so an AI follows a set of principles to grade AI answers.</sub>
- `1:28` **旁白**：甚至让模型给自己打分，再用这些分数训练自己。
  <br><sub>EN: Some setups even let a model score itself — and train on those scores.</sub>
- `1:31` **Clawd（自己当裁判）**：嗯……我觉得我答得很好。满分！
  <br><sub>EN: Hmm… I think I answered brilliantly. Full marks!</sub>
- `1:34` **旁白**：记住这一级：自己给自己打分。到了第 4 集，它会闯大祸。
  <br><sub>EN: Remember this rung: grading yourself. In Episode 4, it causes real trouble.</sub>
- 花字：`1:26` 「AI 给 AI 打分」 · `1:29` 「给自己打分？」 · `1:33` 「满分？！」（stamp） · `1:36` 「伏笔」（tag）

### `r4` · 1:38–2:03（25.5 秒，配乐 `build`）

**画面**：AlphaEvolve 数据卡；加速测试条形图：人类约 4 倍、2025 年的 AI 约 3 倍；Clawd 发问、倒计时后，2026 年 AI 的条一路冲到约 52 倍。Clawd 在给自己“修路”。

- `1:39` **数据卡**：AlphaEvolve（2025）：AI 找到更快的矩阵算法，让一段核心计算提速 23%、Gemini 训练时间缩短 1%——而它自己就跑在 Gemini 上。　〔Google DeepMind，arXiv:2506.13131〕
  <br><sub>EN: AlphaEvolve (2025): AI found faster matrix maths, speeding up a core computation by 23% and cutting Gemini’s training time by 1% — and it runs on Gemini itself.</sub>
- `1:46` **旁白**：Anthropic 有个“加速测试”：给 AI 一段训练小模型的代码，看它能把代码改快多少倍。
  <br><sub>EN: Anthropic runs a “speed-up test”: give an AI some code that trains a small model, and see how many times faster it can make it.</sub>
- `1:50` **旁白**：熟练工程师花 4 到 8 小时，大约能快 4 倍；2025 年 5 月的 AI，约 3 倍——还不如人。
  <br><sub>EN: A skilled engineer, given 4 to 8 hours, gets about 4×. The AI of May 2025: about 3× — worse than a human.</sub>
- `1:55` **Clawd**：那 2026 年 4 月的 AI 呢？
  <br><sub>EN: And the AI of April 2026?</sub>
- `1:58` **旁白**：答案：约 52 倍——是人类成绩的 13 倍。从不如人到远超人类，不到一年。
  <br><sub>EN: The answer: about 52× — thirteen times the human result. From worse than a human to far beyond, in under a year.</sub>
- 花字：`1:44` 「提速的是它自己！」 · `1:49` 「能快几倍？」 · `1:54` 「不如人」（stamp） · `1:59` 「≈ 52 倍！」（stamp） · `2:02` 「不到一年」

### `r5` · 2:03–2:23（19.8 秒，配乐 `build`）

**画面**：“智能体办公室”：一大片小 Clawd 在工位上干活，少数人类在后面监督；OpenAI 与 Anthropic 的数据卡；Clawd 对“实习生”头衔又惊又喜。

- `2:05` **数据卡**：OpenAI（2026.9）：宣布做出“自动化研究实习生”，在人指导下完成研究员要花几天的任务。团队里人类每干 1 天，AI 智能体干 3.1 天。　〔OpenAI，Research acceleration，2026.9.6〕
  <br><sub>EN: OpenAI (Sep 2026): announced an “automated research intern” that, under human direction, completes tasks taking a researcher days. In its teams, for every human day, AI agents put in 3.1.</sub>
- `2:12` **数据卡**：Anthropic（2026.9）：在能衡量的 AI 研发工作里，Claude“主导”的部分从 2 月的不到 1% 涨到 8 月的 26%。　〔Anthropic Institute，2026.9.17〕
  <br><sub>EN: Anthropic (Sep 2026): of measurable AI R&D work, the share Claude “leads” rose from under 1% in February to 26% in August.</sub>
- `2:18` **Clawd**：实习生……我这是升职了？
  <br><sub>EN: An intern… did I just get promoted?</sub>
- `2:20` **旁白**：注意：“主导”也仍在人的监督之下。
  <br><sub>EN: Note: even “leading” still happens under human supervision.</sub>
- 花字：`2:06` 「研究实习生」（tag） · `2:10` 「1 天 : 3.1 天」 · `2:15` 「<1% → 26%」 · `2:19` 「升职？」 · `2:21` 「人在监督」（tag）

### `today` · 2:23–2:37（14.1 秒，配乐 `reflect`）

**画面**：第 1 集的研究循环重新出现、拆成四段：“实验”“评估”由 Clawd 接手，“想法”“决定”仍在人手里；大字给出本集答案。

- `2:24` **旁白**：回到第 1 集的研究循环：今天，“实验”大部分已经交给 AI，“评估”也做了不少；
  <br><sub>EN: Back to Episode 1’s research loop: today AI does most of the experimenting, and a fair share of the evaluating;</sub>
- `2:28` **旁白**：而“想法”和“决定”——想出好问题、拍板放行——仍然主要靠人。
  <br><sub>EN: while “idea” and “decision” — asking good questions, giving the final go-ahead — still mostly rest with humans.</sub>
- `2:33` **旁白**：所以答案是：AI 已经在改进自己——但拍板的，还是人。
  <br><sub>EN: So the answer: AI is already improving itself — but humans still make the call.</sub>
- 花字：`2:26` 「实验：AI 包了」（tag） · `2:31` 「拍板：人」（tag） · `2:34` 「答案」（stamp）

### `top` · 2:37–2:51（13.5 秒，配乐 `build`）

**画面**：梯子顶端被迷雾笼罩，一条虚线通向“完全闭环”的圆环；字幕：截至 2026 年 10 月，无人公开宣称到达。

- `2:38` **旁白**：五级，每一级都已经有真实的例子。
  <br><sub>EN: Five rungs — every one already has real examples.</sub>
- `2:40` **旁白**：最顶上是完全的闭环：从提出问题到训练出下一代，全程不需要人。
  <br><sub>EN: At the very top is a fully closed loop: from posing the question to training the next generation, no human needed.</sub>
- `2:44` **旁白**：截至 2026 年 10 月，还没有任何实验室公开宣称走到了这一步。
  <br><sub>EN: As of October 2026, no lab has publicly claimed to have reached it.</sub>
- `2:48` **Clawd**：那我们……离顶端还有多远？
  <br><sub>EN: So… how far are we from the top?</sub>
- 花字：`2:41` 「完全闭环」（stamp） · `2:46` 「还没有」（stamp）

### `e2_end` · 2:51–3:01（10.3 秒，配乐 `tension`）

**画面**：浓雾里，路在 Clawd 面前分成两条：一条越来越陡、冲进雾里（“智能爆炸”），一条越来越平、通向一堵墙；路牌立在岔口，Clawd 站在中间发愣。

- `2:52` **旁白**：再往上会怎样？有两种预测。
  <br><sub>EN: What happens further up? There are two forecasts.</sub>
- `2:54` **旁白**：一种说：循环越转越快，冲向“智能爆炸”；
  <br><sub>EN: One: the loop spins faster and faster, toward an “intelligence explosion”;</sub>
- `2:57` **旁白**：另一种说：越转越慢，迟早撞墙。
  <br><sub>EN: the other: it spins slower and slower, and sooner or later hits a wall.</sub>
- `3:00` **Clawd**：我……会走哪一条？
  <br><sub>EN: Which one… will I take?</sub>
- 花字：`2:55` 「爆炸？」 · `2:58` 「撞墙？」

### `e2_cliff` · 3:01–3:04（3.0 秒，配乐 `none`）

**画面**：定格：上一场最后一帧冻结、变灰，上下出现黑边；两声醒木：“欲知后事如何——”“且听下回分解！”角标“第 N 集 · 完”，盖“续”字印章。无配乐。

### `e2_next` · 3:04–3:12（7.6 秒，配乐 `tease`）

**画面**：下集预告：红色“下集预告”条幅；4 个下一集的真实镜头快切，每个配一行黄字；最后是下一集的标题卡和 4 集进度点，Clawd 说出告别语。

- `3:09` **Clawd**：爆炸，还是撞墙？下集见！
  <br><sub>EN: Explosion, or a wall? See you next time!</sub>

## GEN 计数器

右上角的 GEN（第几代 Clawd）是贯穿全系列的视觉主线。本集的变化：

`0:53` → GEN 4 · `1:06` → GEN 5 · `1:24` → GEN 6 · `1:39` → GEN 7 · `2:05` → GEN 8

