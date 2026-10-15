# 第 2 集《爬到第几级了？》分镜脚本

> 《Clawd 造 Clawd》第 2 集（共 4 集）。本集问题：AI 已经在改进自己了吗？改到了哪一步？
> 本文件由 `tools/make-storyboard.mjs` 根据时间轴自动生成，时间码与成片一致。总时长 **5:48**（348.28 秒，30 fps），15 个场景、58 条台词 / 字幕。
> 画面描述为人工撰写；台词为中文版，英文版附在每条之后（播放器加 `&lang=en` 即为英文版）。

## 章节总览

| 时间 | 章节 | 配乐 |
|---|---|---|
| 0:00 | 开场 | `hook` |
| 0:36 | 上回书说到 | `story` |
| 0:58 | 本集问题 | `story` |
| 1:08 | 五级梯子 | `build` |
| 1:26 | 第 1 级 | `build` |
| 2:08 | 第 2 级 | `build` |
| 2:40 | 第 3 级 | `build` |
| 3:03 | 第 4 级 | `build` |
| 3:48 | 第 5 级 | `build` |
| 4:25 | 本集答案 | `reflect` |
| 4:47 | 梯子顶端 | `build` |
| 5:07 | 浓雾里的岔路 | `tension` |
| 5:32 | 下集预告 | `tease` |

## 逐场景

### `e2_cold` · 0:00–0:31（31.5 秒，配乐 `hook`）

**画面**：“AI 改进 AI”大赛：两条赛道并排，1 号赛道是人类工程师（打磨 2 年），2 号赛道是 AI 自己；Clawd 当解说员，AI 在第 8 天冲线、打破纪录；旁白揭示这是真实实验。

- `0:00` **Clawd**：各位观众！欢迎来到——“AI 改进 AI”大赛！
  <br><sub>EN: Ladies and gentlemen! Welcome to — the “AI Improves AI” Championship!</sub>
- `0:04` **Clawd**：1 号赛道：人类工程师！这个 AI 程序，他们打磨了整整 2 年！
  <br><sub>EN: Lane one: human engineers! They spent two whole years polishing this AI program!</sub>
- `0:09` **Clawd**：2 号赛道：AI 自己！它要改进的……正是它自己！
  <br><sub>EN: Lane two: the AI itself! And what it’s improving is… itself!</sub>
- `0:17` **Clawd**：第 8 天——冲线了！破纪录！
  <br><sub>EN: Day eight — over the line! A new record!</sub>
- `0:20` **旁白**：这不是科幻：2026 年，一家 AI 公司公布了这项实验——AI 改进自己 8 天，胜过人类 2 年的打磨。
  <br><sub>EN: This isn’t science fiction: in 2026, an AI company published this experiment — an AI improving itself for 8 days beat two years of human polishing.</sub>
- `0:27` **Clawd**：……等等。AI，已经在改进自己了？
  <br><sub>EN: …Wait. AI is already improving itself?</sub>

### `e2_sting` · 0:31–0:36（4.9 秒，配乐 `none`）

**画面**：片头：隧道背景中《Clawd 造 Clawd》标识跳出，“造”字印章盖下，接“第 N 集”胶囊和本集标题。

### `e2_recap` · 0:36–0:58（22.1 秒，配乐 `story`）

**画面**：上回书说到：说书人 Clawd 站在舞台左侧，拍下醒木；竖排大字“上回书说到”；右侧挂轴展开，回放上一集的真实画面，每句回顾翻一页；“书接上回！”时再拍一次醒木。

- `0:37` **旁白**：上回书说到——
  <br><sub>EN: Previously, on Clawd Builds Clawd…</sub>
- `0:39` **旁白**：人类给第 1 代 Clawd 下了一条离谱的任务：造一个比自己更聪明的 Clawd。
  <br><sub>EN: Humans gave Clawd Gen 1 a ridiculous task: build a Clawd smarter than itself.</sub>
- `0:44` **旁白**：Clawd 想到：让 AI 去改进“变聪明的方法”，就能一代造一代。
  <br><sub>EN: Clawd’s idea: let AI improve “the way to get smarter” — and each generation builds the next.</sub>
- `0:48` **旁白**：而且每一代，都更会造下一代——利滚利。
  <br><sub>EN: And each generation is better at building the next — interest on interest.</sub>
- `0:51` **旁白**：可要是这个循环一直转下去……它停得下来吗？
  <br><sub>EN: But if the loop keeps spinning… can it stop?</sub>
- `0:55` **旁白**：书接上回！
  <br><sub>EN: And now, back to the story!</sub>

### `e2_q` · 0:58–1:08（9.8 秒，配乐 `story`）

**画面**：本集问题卡：大字问题；第二句交代“第几集（共 4 集）、上一集讲了什么、这一集讲什么”，下方 4 集进度点亮起当前一集。

- `0:59` **旁白**：AI 已经在改进自己了吗？改到了哪一步？
  <br><sub>EN: Is AI already improving itself? How far has it got?</sub>
- `1:00` **旁白**：这是《Clawd 造 Clawd》第 2 集（共 4 集）。上一集，我们搞懂了 RSI 是什么；这一集，看看现实中它走到了哪一步。
  <br><sub>EN: This is Episode 2 of 4. Last time we worked out what RSI is; this time, we see how far it has really come.</sub>

### `ladder` · 1:08–1:26（17.8 秒，配乐 `build`）

**画面**：右侧出现五级梯子总览（每级一个图标），越往上越“核心”；Clawd 站在地面，指向右上角的 GEN 计数器。

- `1:09` **旁白**：“改进自己”不是一个开关，而是一架梯子——越往上，AI 能改动的东西越核心。
  <br><sub>EN: “Improving itself” isn’t a switch, it’s a ladder — the higher you go, the more core the things AI can change.</sub>
- `1:15` **旁白**：为了好懂，我们把它简化成五级。
  <br><sub>EN: To keep it simple, we'll use five rungs.</sub>
- `1:19` **Clawd**：我先站在地面上。每学会一级本事，我就升一代——看右上角的数字！
  <br><sub>EN: I’ll start on the ground. Each rung I master makes me a new generation — watch the number in the top-right!</sub>

### `r1` · 1:26–2:08（42.0 秒，配乐 `build`）

**画面**：Clawd 爬上第 1 级，GEN +1。autoresearch 终端：改代码 → 训练 5 分钟 → 看分数 → 留下 / 丢弃，循环滚动；“第 10,205 代”的玩笑把 GEN 计数器瞬间冲爆，再被拉回；达尔文-哥德尔机、AIDE² 数据卡（回收开场那场比赛）。

- `1:27` **旁白**：第 1 级：改进自己的做事方法。
  <br><sub>EN: Rung 1: improving how it does its work.</sub>
- `1:31` **旁白**：2026 年 3 月，曾任特斯拉 AI 负责人的 Karpathy 开源了 autoresearch：AI 改代码、训练 5 分钟、看分数，好就留下，差就扔掉，整夜循环。
  <br><sub>EN: In March 2026, Andrej Karpathy — formerly Tesla’s head of AI — open-sourced autoresearch: an AI edits code, trains for 5 minutes, checks the score, keeps it or throws it away, all night long.</sub>
- `1:39` **旁白**：他还开玩笑：将来的 AI 会说，代码已经进化到第 10,205 代——反正也没人看得懂了。
  <br><sub>EN: He even joked that future agents will claim the code is on its 10,205th generation — not that anyone can still read it.</sub>
- `1:45` **数据卡**：达尔文-哥德尔机（2025）：AI 反复改写自己的代码，在 SWE-bench（一套修真实代码 bug 的考试）上，成绩从 20% 提到 50%。　〔Zhang 等，arXiv:2505.22954〕
  <br><sub>EN: Darwin Gödel Machine (2025): an agent that keeps rewriting its own code raised its score on SWE-bench (a test of fixing real-world code bugs) from 20% to 50%.</sub>
- `1:54` **数据卡**：开头那场比赛，就是 Weco 公司的 AIDE²（2026）：研究智能体（会自己做实验的 AI）改进自己 8 天，胜过人类打磨 2 年的版本。　〔Weco AI，arXiv:2609.26457（公司自报）〕
  <br><sub>EN: The race from the opening is Weco’s AIDE² (2026): a research agent (an AI that runs its own experiments) improved itself for 8 days and beat the version humans polished for 2 years.</sub>
- `2:03` **Clawd**：改进自己的做事方法？这个，我也会。
  <br><sub>EN: Improving how I work? That, I can do.</sub>

### `r2` · 2:08–2:40（32.0 秒，配乐 `build`）

**画面**：两只 Clawd 隔着棋盘自我对弈，落子越来越快；“考考你”倒计时后，比分牌翻到 100 : 0。

- `2:09` **旁白**：第 2 级：自己出题、自己当陪练。
  <br><sub>EN: Rung 2: making its own practice problems — and being its own sparring partner.</sub>
- `2:13` **旁白**：2017 年的 AlphaGo Zero，不看人类棋谱，只跟自己下棋。
  <br><sub>EN: In 2017, AlphaGo Zero studied no human games. It only played against itself.</sub>
- `2:17` **Clawd**：只跟自己下……要练多久，才能赢过当年打败李世石的 AlphaGo？
  <br><sub>EN: Only itself… so how long until it beats the AlphaGo that defeated Lee Sedol?</sub>
- `2:24` **旁白**：答案是：3 天。3 天后，它以 100 比 0，完胜那个版本。
  <br><sub>EN: The answer: three days. After 3 days, it beat that version 100 to 0.</sub>
- `2:29` **旁白**：今天的大模型也用类似的办法：自己出题、自己解答，挑出做对的，再拿来训练自己。
  <br><sub>EN: Today's models do something similar: write problems, solve them, keep the correct ones, and train on them.</sub>
- `2:36` **Clawd**：自己出题自己做……这个我擅长。
  <br><sub>EN: Set my own homework and do it… I'm good at that.</sub>

### `r3` · 2:40–3:03（23.4 秒，配乐 `build`）

**画面**：裁判席上是 Clawd，参赛者也是 Clawd；打分卡一张张亮出，全是满分；红字提示：到了第 4 集，它会闯大祸。

- `2:41` **旁白**：第 3 级：自己当裁判。
  <br><sub>EN: Rung 3: being its own judge.</sub>
- `2:44` **旁白**：人类没法给海量回答一个个打分，于是让 AI 按一套原则，去给 AI 的回答打分。
  <br><sub>EN: Humans can't grade millions of answers one by one, so an AI follows a set of principles to grade AI answers.</sub>
- `2:50` **旁白**：甚至让模型给自己打分，再用这些分数训练自己。
  <br><sub>EN: Some setups even let a model score itself — and train on those scores.</sub>
- `2:54` **Clawd（自己当裁判）**：嗯……我觉得我答得很好。满分！
  <br><sub>EN: Hmm… I think I answered brilliantly. Full marks!</sub>
- `2:57` **旁白**：记住这一级：自己给自己打分。到了第 4 集，它会闯大祸。
  <br><sub>EN: Remember this rung: grading yourself. In Episode 4, it causes real trouble.</sub>

### `r4` · 3:03–3:48（45.4 秒，配乐 `build`）

**画面**：AlphaEvolve 数据卡；加速测试条形图：人类约 4 倍、2025 年的 AI 约 3 倍；Clawd 发问、倒计时后，2026 年 AI 的条一路冲到约 52 倍。Clawd 在给自己“修路”。

- `3:05` **旁白**：第 4 级：改进让自己变强的工具——AI 训练和运行时用的那些代码和机器。
  <br><sub>EN: Rung 4: improving the tools that make it stronger — the code and machines AI is trained and run on.</sub>
- `3:10` **数据卡**：AlphaEvolve（2025）：AI 找到更快的矩阵算法，让一段核心计算提速 23%，Gemini 的训练时间缩短了 1%——而 AlphaEvolve 自己，就跑在 Gemini 上。　〔Google DeepMind，arXiv:2506.13131〕
  <br><sub>EN: AlphaEvolve (2025): AI found a faster way to do matrix math, speeding up a core piece of computation by 23% and cutting Gemini’s training time by 1% — and AlphaEvolve itself runs on Gemini.</sub>
- `3:20` **旁白**：Anthropic 有个“加速测试”：给 AI 一段训练小模型的代码，看它能把代码改快多少倍。
  <br><sub>EN: Anthropic runs a “speed-up test”: give an AI some code that trains a small model, and see how many times faster it can make it.</sub>
- `3:26` **旁白**：熟练工程师花 4 到 8 小时，大约能快 4 倍；2025 年 5 月的 AI，约 3 倍——还不如人。
  <br><sub>EN: A skilled engineer, given 4 to 8 hours, gets about 4×. The AI of May 2025: about 3× — worse than a human.</sub>
- `3:32` **Clawd**：那 2026 年 4 月的 AI 呢？
  <br><sub>EN: And the AI of April 2026?</sub>
- `3:37` **旁白**：答案：约 52 倍——是人类成绩的 13 倍。从不如人到远超人类，不到一年。
  <br><sub>EN: The answer: about 52× — thirteen times the human result. From worse than a human to far beyond, in under a year.</sub>
- `3:43` **Clawd**：我在给自己修路——路越好，我跑得越快。
  <br><sub>EN: I’m paving my own road — the better the road, the faster I run.</sub>

### `r5` · 3:48–4:25（36.7 秒，配乐 `build`）

**画面**：“智能体办公室”：一大片小 Clawd 在工位上干活，少数人类在后面监督；OpenAI 与 Anthropic 的数据卡；Clawd 对“实习生”头衔又惊又喜。

- `3:50` **旁白**：第 5 级：自己做 AI 研究。
  <br><sub>EN: Rung 5: doing AI research itself.</sub>
- `3:53` **数据卡**：OpenAI（2026.9）：宣布做出了“自动化研究实习生”——在人的指导下，能完成研究员要花几天的明确任务。在它的研究团队里，人类每干 1 天，AI 智能体就要干 3.1 天的活。　〔OpenAI，Research acceleration，2026.9.6〕
  <br><sub>EN: OpenAI (Sep 2026): announced an “automated research intern” — under human direction, it completes well-defined tasks that take a researcher days. In its research teams, for every day a human works, AI agents put in 3.1 days.</sub>
- `4:05` **数据卡**：Anthropic（2026.9）：在能衡量的 AI 研发工作里，由 Claude“主导”的部分，从 2 月的不到 1% 涨到 8 月的 26%；至少达到“协作”的，超过 90%。　〔Anthropic Institute，2026.9.17〕
  <br><sub>EN: Anthropic (Sep 2026): of measurable AI R&D work, the share Claude “leads” rose from under 1% in February to 26% in August; over 90% is at least “collaborative”.</sub>
- `4:15` **Clawd**：实习生……我这是升职了？
  <br><sub>EN: An intern… did I just get promoted?</sub>
- `4:18` **旁白**：不过，“主导”仍在人的监督之下：选题、判断、最后放行，还掌握在人手里。
  <br><sub>EN: Still, “leading” happens under human supervision: choosing problems, judging, and final sign-off remain in human hands.</sub>

### `today` · 4:25–4:47（22.4 秒，配乐 `reflect`）

**画面**：第 1 集的研究循环重新出现、拆成四段：“实验”“评估”由 Clawd 接手，“想法”“决定”仍在人手里；大字给出本集答案。

- `4:26` **旁白**：把第 1 集那个研究循环拆开看：想法、实验、评估、决定。今天，“实验”这一步，AI 已经包办了大部分，“评估”也做了不少；
  <br><sub>EN: Take apart the research loop from Episode 1: idea, experiment, evaluation, decision. Today AI already does most of the experimenting, and a fair share of the evaluating;</sub>
- `4:34` **旁白**：而“想法”和“决定”——想出好问题、拍板放行——仍然主要靠人。
  <br><sub>EN: while “idea” and “decision” — asking good questions, giving the final go-ahead — still mostly rest with humans.</sub>
- `4:40` **旁白**：所以，本集问题的答案是：是的，AI 已经在改进自己——但拍板的，还是人。
  <br><sub>EN: So the answer to this episode’s question: yes, AI is already improving itself — but humans still make the call.</sub>

### `top` · 4:47–5:07（19.3 秒，配乐 `build`）

**画面**：梯子顶端被迷雾笼罩，一条虚线通向“完全闭环”的圆环；字幕：截至 2026 年 10 月，无人公开宣称到达。

- `4:48` **旁白**：五级梯子，每一级都已经有了真实的例子。
  <br><sub>EN: Five rungs — and every one of them already has real examples.</sub>
- `4:53` **旁白**：梯子顶端，是完全的闭环：从提出问题到训练出下一代，全程不需要人。
  <br><sub>EN: At the top is a fully closed loop: from posing the question to training the next generation, no human needed.</sub>
- `4:58` **旁白**：截至 2026 年 10 月，还没有任何实验室公开宣称走到了这一步。
  <br><sub>EN: As of October 2026, no lab has publicly claimed to have reached it.</sub>
- `5:02` **Clawd**：那我们……离顶端还有多远？
  <br><sub>EN: So… how far are we from the top?</sub>

### `e2_end` · 5:07–5:26（19.4 秒，配乐 `tension`）

**画面**：浓雾里，路在 Clawd 面前分成两条：一条越来越陡、冲进雾里（“智能爆炸”），一条越来越平、通向一堵墙；路牌立在岔口，Clawd 站在中间发愣。

- `5:08` **旁白**：再往上，是一片浓雾。路，在这里分成了两条。
  <br><sub>EN: Above this point there’s only fog — and here, the road splits in two.</sub>
- `5:12` **旁白**：有人说：这个循环会越转越快，像火箭一样，冲向“智能爆炸”；
  <br><sub>EN: Some say the loop will spin faster and faster, shooting up like a rocket toward an “intelligence explosion”;</sub>
- `5:17` **旁白**：也有人说：它会越转越慢，迟早撞上一堵墙。
  <br><sub>EN: others say it will spin slower and slower — and sooner or later hit a wall.</sub>
- `5:22` **Clawd**：我……会走哪一条？
  <br><sub>EN: Which one… will I take?</sub>

### `e2_cliff` · 5:26–5:32（5.8 秒，配乐 `none`）

**画面**：定格：上一场最后一帧冻结、变灰，上下出现黑边；两声醒木：“欲知后事如何——”“且听下回分解！”角标“第 N 集 · 完”，盖“续”字印章。无配乐。

### `e2_next` · 5:32–5:48（15.9 秒，配乐 `tease`）

**画面**：下集预告：红色“下集预告”条幅；4 个下一集的真实镜头快切，每个配一行黄字；最后是下一集的标题卡和 4 集进度点，Clawd 说出告别语。

- `5:42` **Clawd**：爆炸，还是撞墙？下集，听听科学家们怎么吵。下集见！
  <br><sub>EN: Explosion, or a wall? Next time, we hear the scientists fight it out. See you then!</sub>

## GEN 计数器

右上角的 GEN（第几代 Clawd）是贯穿全系列的视觉主线。本集的变化：

`1:27` → GEN 4 · `2:09` → GEN 5 · `2:41` → GEN 6 · `3:04` → GEN 7 · `3:50` → GEN 8

