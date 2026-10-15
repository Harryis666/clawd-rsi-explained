# 第 3 集《爆炸，还是撞墙？》分镜脚本

> 《Clawd 造 Clawd》第 3 集（共 4 集）。本集问题：智能会“爆炸”吗？还是迟早撞墙？
> 本文件由 `tools/make-storyboard.mjs` 根据时间轴自动生成，时间码与成片一致。总时长 **3:17**（197.61 秒，30 fps），11 个场景、45 条台词 / 字幕。
> 画面描述为人工撰写；台词为中文版，英文版附在每条之后（播放器加 `&lang=en` 即为英文版）。

> v3 短剧层：本集 47 条花字（关键词大字），在每个场景末尾按时间列出；样式 pop = 描边大字、stamp = 盖章、tag = 标签。

## 章节总览

| 时间 | 章节 | 配乐 |
|---|---|---|
| 0:00 | 开场 | `hook` |
| 0:20 | 上回书说到 | `story` |
| 0:29 | 本集问题 | `story` |
| 0:32 | 一个数：r | `tension` |
| 1:06 | 两派之争 | `tension` |
| 1:35 | 四堵墙 | `tension` |
| 2:35 | 什么时候？ | `reflect` |
| 2:52 | 夜路 | `tension` |
| 3:09 | 下集预告 | `tease` |

## 逐场景

### `e3_cold` · 0:00–0:16（16.9 秒，配乐 `hook`）

**画面**：岔路口，Clawd 复制出另一个自己；分屏：左边 Clawd·A 的 GEN 越跳越快、拖出速度线，右边 Clawd·B 越跳越慢、最后贴到墙上；两边同时可见。

- `0:00` **Clawd**：两条路，我选不出来……那就复制一个我，两条都走！
  <br><sub>EN: Two roads, and I can’t pick one… So I’ll copy myself and take both!</sub>
- `0:04` **Clawd**：第 9 代、第 10 代、第 11 代……一代比一代来得快！
  <br><sub>EN: Gen 9, Gen 10, Gen 11… each one comes faster than the last!</sub>
- `0:07` **Clawd·B**：第 9 代……第 10 代……怎么一代比一代慢？
  <br><sub>EN: Gen 9… Gen 10… why is each one slower than the last?</sub>
- `0:10` **旁白**：同一个循环：一个越改越快，一个越改越慢。
  <br><sub>EN: Same loop: one gets faster and faster, the other slower and slower.</sub>
- `0:14` **Clawd**：所以我……到底会是哪一个？
  <br><sub>EN: So which one… will I turn out to be?</sub>
- 花字：`0:00` 「选哪条？」 · `0:03` 「复制！」（stamp） · `0:05` 「A：越来越快」（tag） · `0:08` 「B：越来越慢」（tag） · `0:15` 「A？B？」

### `e3_sting` · 0:16–0:20（3.1 秒，配乐 `none`）

**画面**：片头：隧道背景中《Clawd 造 Clawd》标识跳出，“造”字印章盖下，接“第 N 集”胶囊和本集标题。

### `e3_recap` · 0:20–0:29（9.1 秒，配乐 `story`）

**画面**：上回书说到：说书人 Clawd 站在舞台左侧，拍下醒木；竖排大字“上回书说到”；右侧挂轴展开，回放上一集的真实画面，每句回顾翻一页；“书接上回！”时再拍一次醒木。

- `0:20` **旁白**：上回书说到——
  <br><sub>EN: Previously…</sub>
- `0:22` **旁白**：AI 改进自己 8 天，胜过人类打磨 2 年。
  <br><sub>EN: An AI improving itself for 8 days beat two years of human polishing.</sub>
- `0:24` **旁白**：再往上：越转越快，还是越转越慢？
  <br><sub>EN: Further up: faster and faster — or slower and slower?</sub>
- `0:27` **旁白**：书接上回！
  <br><sub>EN: Back to the story!</sub>

### `e3_q` · 0:29–0:32（3.7 秒，配乐 `story`）

**画面**：本集问题卡：大字问题；第二句交代“第几集（共 4 集）、上一集讲了什么、这一集讲什么”，下方 4 集进度点亮起当前一集。

- `0:29` **旁白**：智能会“爆炸”吗？还是迟早撞墙？
  <br><sub>EN: Will intelligence “explode”? Or hit a wall sooner or later?</sub>
- 花字：`0:31` 「你站哪边？」

### `ratio` · 0:32–1:06（33.3 秒，配乐 `tension`）

**画面**：三条代际时间线并排：r > 1 时代际间隔越来越短、挤成一点并闪光；r = 1 均匀；r < 1 越拉越长。中间插入“考考你”倒计时，揭晓“约 400 天”。

- `0:33` **旁白**：每升一代，AI 更聪明、研究更快，这是加速；可容易的先做完了，后面越来越难，这是阻力。
  <br><sub>EN: Each generation, AI gets smarter and researches faster — that’s the speed-up. But the easy wins get used up and the rest gets harder — that’s the drag.</sub>
- `0:38` **旁白**：研究者把这两股力量写成一个数，叫 r：加速有多猛，除以变难有多快。
  <br><sub>EN: Researchers boil the two forces down to one number, r: how strong the speed-up is, divided by how fast things get harder.</sub>
- `0:42` **旁白**：r 大于 1：加速赢了，每一代都比上一代来得快——就像开头的 Clawd·A。
  <br><sub>EN: r > 1: the speed-up wins, and each generation arrives faster than the last — like Clawd A at the start.</sub>
- `0:47` **Clawd**：考考你：第一代 100 天，之后每代只要上一代的 3/4。无数代，一共要多久？
  <br><sub>EN: Quiz: the first generation takes 100 days, and each one after takes 3/4 as long as the one before. How long for infinitely many?</sub>
- `0:53` **旁白**：答案：约 400 天！无数代，挤进一年多一点——所以有人叫它“智能爆炸”。
  <br><sub>EN: The answer: about 400 days! Infinitely many generations in just over a year — that’s why some call it an “intelligence explosion”.</sub>
- `0:57` **旁白**：r 等于 1：打成平手，稳步前进。r 小于 1：阻力赢了，越往后越慢——就像开头的 Clawd·B。
  <br><sub>EN: r = 1: a draw — steady progress. r < 1: the drag wins, and it gets slower and slower — like Clawd B at the start.</sub>
- `1:03` **Clawd**：所以——现实里的 r，到底是多少？
  <br><sub>EN: So — what is r in the real world?</sub>
- 花字：`0:37` 「谁赢？」 · `0:45` 「= Clawd·A」（tag） · `0:50` 「无数代？」 · `0:53` 「≈ 400 天！」（stamp） · `0:55` 「智能爆炸」 · `0:58` 「r = 1 平手」（tag） · `1:01` 「= Clawd·B」（tag） · `1:04` 「r = ？」

### `debate` · 1:06–1:35（29.6 秒，配乐 `tension`）

**画面**：两座讲台（橙色加速派 / 蓝色怀疑派），Clawd 举着裁判牌站在中间；论文与数据卡居中出现；最后 Clawd 放下裁判牌：“这一局……我判不了。”

- `1:06` **旁白**：现实里的 r 是多少？科学家们分成了两派。
  <br><sub>EN: So what is r in reality? Scientists split into two camps.</sub>
- `1:09` **加速派**：有估计说：r 约等于 1.4，大于 1！每次“研发速度翻倍”，只需上一次约 3/4 的时间。
  <br><sub>EN: One estimate says r is about 1.4 — above 1! Each “doubling of research speed” takes only about 3/4 as long as the last.</sub>
- `1:14` **数据卡**：Chan、Hinton、Bengio 等（2026.9）：照此估计，约 17 个月后 AI 研发快 10 倍——一年的进展约 5 周完成（前提：没有别的瓶颈）。　〔Chan 等 22 位作者，arXiv:2609.36054〕
  <br><sub>EN: Chan, Hinton, Bengio et al. (Sep 2026): on this estimate, AI R&D is 10× faster in about 17 months — a year of progress in ~5 weeks (assuming no other bottlenecks).</sub>
- `1:21` **Clawd**：3/4？跟刚才那道题一样……真要爆炸？
  <br><sub>EN: 3/4? Just like that quiz… so it really explodes?</sub>
- `1:24` **怀疑派**：别急。OpenAI 的研究员，用 AI 的量涨了 124 倍，做的实验却只多了 1.6 倍。
  <br><sub>EN: Not so fast. OpenAI’s researchers use 124× more AI — but run only 1.6× more experiments.</sub>
- `1:28` **怀疑派**：忙，不等于进步快。
  <br><sub>EN: Busy isn’t the same as fast progress.</sub>
- `1:30` **旁白**：两派唯一的共识：现有的数据，还不足以下定论。
  <br><sub>EN: The one thing both camps agree on: the data so far can’t settle it.</sub>
- `1:33` **Clawd**：这局……判不了。
  <br><sub>EN: This round… no call.</sub>
- 花字：`1:08` 「两派！」（stamp） · `1:11` 「r ≈ 1.4」 · `1:17` 「17 个月 → 10 倍」 · `1:19` 「1 年 → 5 周」 · `1:25` 「124 倍」 · `1:27` 「只多 1.6 倍」 · `1:32` 「数据不够」（stamp） · `1:34` 「判不了」（tag）

### `walls` · 1:35–2:35（59.6 秒，配乐 `tension`）

**画面**：Clawd 一路奔跑，依次撞上四堵墙：算力墙、品味墙、并行墙、现实墙。并行墙前，它复制出一万个自己一起冲（“考考你”：快多少倍？）。每堵墙都有标牌和来源小字；撞上、绕过、再撞下一堵。

- `1:36` **旁白**：怀疑派还指出：路上有好几堵“墙”——也就是瓶颈。
  <br><sub>EN: The skeptics also point to “walls” on the road — bottlenecks.</sub>
- `1:39` **Clawd**：墙？加速派说 r 大于 1——那我就全速冲过去！
  <br><sub>EN: Walls? The fast camp says r is above 1 — so I’ll charge right through!</sub>
- `1:44` **旁白**：算力墙：点子要靠实验验证，一次大训练要跑好几个月——想得再快，也得等它跑完。
  <br><sub>EN: The compute wall: ideas must be tested by experiments, and a big training run takes months — however fast you think, you wait for it to finish.</sub>
- `1:51` **旁白**：品味墙：普林斯顿的研究者，用“还没发表的论文”里的题目考 AI——它不可能提前见过答案。
  <br><sub>EN: The taste wall: Princeton researchers tested AI on questions from papers not yet published — so it couldn’t have seen the answers.</sub>
- `1:56` **旁白**：结果：AI 很会动手做实验，却不太会判断“该研究什么”——探索得太少，结论下得太快。
  <br><sub>EN: The result: AI was good at running experiments, but weak at judging what to research — it explored too little and concluded too fast.</sub>
- `2:03` **Clawd**：一个我不够快？那就复制一万个我，一起冲！
  <br><sub>EN: One of me isn’t fast enough? Then copy me ten thousand times and charge together!</sub>
- `2:06` **旁白**：考考你：一万个 Clawd 一起干，能快多少倍？
  <br><sub>EN: Quiz: ten thousand Clawds working together — how many times faster?</sub>
- `2:11` **旁白**：答案：约 100 倍。这就是并行墙：按一条经验法则，速度只随数量的平方根增长——翻 4 倍，才快 2 倍。
  <br><sub>EN: The answer: about 100×. That’s the parallel wall: by a rule of thumb, speed grows only with the square root of the number — four times as many, only twice as fast.</sub>
- `2:17` **旁白**：因为它们常常想到一块儿去：一万个我，冒出的是同一个点子。
  <br><sub>EN: Because they often think alike: ten thousand of me, all having the same idea.</sub>
- `2:23` **旁白**：现实墙：有些事只能在真实世界里等——芯片要造，电厂要建。
  <br><sub>EN: The reality wall: some things can only wait on the physical world — chips must be made, power plants built.</sub>
- `2:27` **Clawd**：所以……不是爆炸，而是一路撞墙？
  <br><sub>EN: So… not an explosion, but wall after wall?</sub>
- `2:29` **旁白**：也可能：撞一堵，绕过去，再撞下一堵。两派真正吵的，是这些墙绕不绕得过去。
  <br><sub>EN: Or maybe: hit one, get past it, hit the next. What the camps really argue about is whether these walls can be got around.</sub>
- 花字：`1:38` 「瓶颈」（tag） · `1:41` 「全速！」 · `1:44` 「墙 1：算力」（stamp） · `1:47` 「等几个月…」 · `1:51` 「墙 2：品味」（stamp） · `1:54` 「没见过的题」（tag） · `1:57` 「做实验：强」（tag） · `1:59` 「选课题：弱」（tag） · `2:05` 「× 10000」 · `2:08` 「1 万倍？」 · `2:11` 「≈ 100 倍」（stamp） · `2:13` 「墙 3：并行」（stamp） · `2:15` 「人 ×4 → 快 ×2」 · `2:19` 「撞点子了」 · `2:23` 「墙 4：现实」（stamp） · `2:25` 「芯片 · 电厂」（tag） · `2:28` 「撞墙？」 · `2:31` 「绕过去！」 · `2:33` 「这才是争点」（tag）

### `forecasts` · 2:35–2:52（17.2 秒，配乐 `reflect`）

**画面**：一条从“很快”（红）到“很慢 / 未必”（蓝）的渐变轴，六个预测依次落点；提醒“裁判有时就是 AI”时，Clawd 想起第 2 集。

- `2:35` **旁白**：那么，AI 什么时候会真正“自己造自己”？预测五花八门。
  <br><sub>EN: So when will AI truly start “building itself”? The forecasts are all over the map.</sub>
- `2:43` **旁白**：注意：这些数字大多是实验室自己量、自己评的——有时打分的裁判就是 AI。
  <br><sub>EN: Note: most of these numbers are measured and graded by the labs themselves — sometimes the judge is an AI.</sub>
- `2:48` **Clawd**：AI 当裁判？……这不就是第 2 集那个“自己给自己打分”吗？
  <br><sub>EN: An AI as the judge?… Isn’t that the “grading yourself” from Episode 2?</sub>
- 花字：`2:39` 「五花八门」 · `2:46` 「自己评自己？」 · `2:50` 「伏笔回收」（tag）

### `e3_end` · 2:52–3:06（14.2 秒，配乐 `tension`）

**画面**：夜路：星空下，研究循环还在转；Clawd 往前走，远处的黑暗里依次亮起三双颜色不同的眼睛。

- `2:53` **旁白**：答案：还没有定论。但你知道该盯什么了——r 比 1 大还是小，那几堵墙绕不绕得过去。
  <br><sub>EN: The answer: nobody knows yet. But now you know what to watch — whether r is above or below 1, and whether those walls can be got around.</sub>
- `2:58` **旁白**：可不管是哪一种，这个循环，已经开始转了。
  <br><sub>EN: Either way, the loop has already started turning.</sub>
- `3:01` **旁白**：而就算它真能越转越快——路上，也未必太平。
  <br><sub>EN: And even if it really does keep speeding up — the road ahead may not be safe.</sub>
- `3:05` **Clawd**：……谁在那儿？
  <br><sub>EN: …Who’s there?</sub>
- 花字：`2:53` 「答案：未定」（stamp） · `2:59` 「已经在转」 · `3:03` 「危险？」

### `e3_cliff` · 3:06–3:09（3.0 秒，配乐 `none`）

**画面**：定格：上一场最后一帧冻结、变灰，上下出现黑边；两声醒木：“欲知后事如何——”“且听下回分解！”角标“第 N 集 · 完”，盖“续”字印章。无配乐。

### `e3_next` · 3:09–3:17（8.0 秒，配乐 `tease`）

**画面**：下集预告：红色“下集预告”条幅；4 个下一集的真实镜头快切，每个配一行黄字；最后是下一集的标题卡和 4 集进度点，Clawd 说出告别语。

- `3:14` **Clawd**：最后一集：三只小怪兽。下集见！
  <br><sub>EN: The final episode: three little monsters. See you then!</sub>

## GEN 计数器

右上角的 GEN（第几代 Clawd）是贯穿全系列的视觉主线。本集的变化：

`0:33` → GEN 9 · `0:34` → GEN 10 · `0:34` → GEN 11 · `0:35` → GEN 12

