# Research log (raw notes, chronological)

> Working notes captured during the research phase (session date: 2026-10-14).
> Each entry = source → key facts used. Later distilled into `01_dossier_zh.md` / `02_viewpoints.md`.

## Batch 1 — 2026 landscape (searched 2026-10-14)

- **TIME, Billy Perrigo, 2026-10-14** — "A New Report Sheds Light on the Secretive Race to Build Self-Improving AI".
  https://time.com/article/2026/10/14/recursive-self-improvement-AI-report
  - Gladstone AI report "What RSI looks like" (https://aiendgame.com/p/what-rsi-looks-like), based on talks with ~6 insiders at top labs.
  - Labs "actively working on" automating all parts of the pipeline: generating ideas, running experiments, interpreting results.
  - Most insiders "believe RSI will start within the next 3 to 12 months, and possibly sooner, assuming no U.S. government intervention or slowdown".
  - Pipeline: ideas get small compute → models that scale better get promoted to bigger compute (portfolio). Compute limits how many ideas can be tested; ratio of bad ideas matters (filtering cost). Rare prized ideas = ones that get *better* with more compute.
  - RSI is gradual → regulating requires pointing to a step where "a human *needs* to be there" (Edouard Harris).
  - Earlier TIME piece: "Inside the Race to Make AI Build Itself" (2026-08-07).

- **Chan, Winter, Barto, Pachocki, Hinton, Horvitz, Bengio, Song, Clark, Greaves, Korinek, Hammond, Graepel, Bariach, Torr, McIlraith, Clune, Manning, Sastry, Davidson, Eth, Mindermann (2026-09-28)** — "What if automating AI R&D triggers an intelligence explosion?" arXiv:2609.36054 (Cambridge CASP).
  - Abstract: "In contrast to even a year ago, AI systems now write most of the code inside the companies that build them." "AI systems are on track to automate most AI R&D work within a few years, and possibly all of it."
  - Mechanism: (1) AI expands the *effective R&D workforce* as it gets better/faster at AI R&D; (2) this workforce produces better AI → expands workforce further (recursive feedback loop).
  - "Some tentative extrapolations of recent trends suggest that months-long AI R&D projects will be automated by mid-2028."
  - Risks: capabilities outpace society; loss of control over superhuman AI; erosion of checks on power.
  - Policy: (1) visibility into automation of AI R&D inside labs; (2) ways to steer/constrain an intelligence explosion; (3) prepare society. "Once an intelligence explosion begins, the window for action may close."
  - Chinese coverage (网易科技 via 新浪, 2026-10-05): Hinton's X post 10-03; headline claim "今天一年的AI进步未来可能只需5周". Key point stressed: what matters is chaining dozens of steps over hours/days (hypothesis → design → run → analyse → debug → adjust), not a single benchmark. AI R&D is especially automatable because it's digital: code runs, results return fast, metrics (loss/reward/benchmarks) verify quickly.

- **Weco AI, "AIDE²: First Evidence of Recursive Self-Improvement" (blog 2026-07-14; arXiv:2609.26457 "Recursive self-improvement of AI research agents")**
  https://www.weco.ai/blog/first-evidence-of-recursive-self-improvement
  - "autoresearch on autoresearch": the agent proposes changes to its own code, benchmarks modified versions on AI-R&D tasks, keeps best on hidden evals.
  - Took **8 unattended days** to discover a harness better than the one humans built over **2 years** (AIDE_human). Gains transfer to unseen tasks/domains. Claims "Level 1 of RSI".
  - Framing: cumulative R&D spending shows diminishing returns; sustained self-improvement is a way to counter that.

- **ICLR 2026 Workshop on AI with Recursive Self-Improvement** https://iclr.cc/virtual/2026/workshop/10000796
  - Scope: experience learning, synthetic data pipelines, multimodal agentic systems, weak-to-strong generalization, inference-time scaling.
  - Papers: "Reward Hacking in Self-Improving Code Agents" (Zhao, Srikanth, Wu, Jiang) — agent improves a cheap proxy metric without improving / even harming the true objective.
  - "SAHOO" — alignment drift monitoring in RSI (Goal Drift Index; constraint preservation; regression risk). Finding: efficient early cycles, rising alignment costs later.
  - "Self-Evolving LMs through Co-evolved Discriminative Rubrics" (Li ... Tsvetkov) — no human labels; rubric generator + small frozen judge; "reducing evaluation to verification".

- **Survey: "Recursive Self-Improvement in AI: From Bounded Self-Refinement to Autonomous Research Loops"** arXiv:2607.07663 (v2 2026-09-06)
  - 1,250 arXiv papers (2024–2026); axes: *what* is improved (deployment behavior / policy via training / evaluator / research process) × *degree of loop closure* (human-in-loop → fully closed).
  - Separates *bounded self-refinement* (convergent, evaluable, already industrial practice) from *open-ended RSI*, "which remains bounded by grounding requirements, collapse dynamics, and compute constraints on every measured axis".

- **"The Last AI Built by Humans: Toward Genuine Recursive Self-Improvement"** arXiv:2609.11873 (He, Li, Zhou, Liu, Wen, Kang, Zhou, Wu; Chinese academia/industry, Sep 2026)
  - Roadmap: improvement-execution autonomy → improvement-strategy autonomy → experience-acquisition autonomy → environment-adaptation autonomy → recursive meta-improvement. "Headroom-Closed Index (HCI)".

- **arXiv:2610.12176 "RSI through Multi-Agent Self-Supervision" (MASS; UC Berkeley, Zaharia, Tang; 2026-10-08)**: on non-verifiable tasks RSI hits a *supervision bottleneck* when outputs exceed what human experts can assess.

- **The News (PK), 2026-09-19** "How close is AI to recursive self-improvement? Leading tech labs weigh in": Anthropic's Claude managing significant portions of R&D "end-to-end from a high-level prompt"; Musk: humans gradually moving out of the loop for Grok, fully automated self-improvement by end of 2026/2027 (forecast); Microsoft "humanist superintelligence" (restrictive approach).
- **Built In, 2026-09-23** explainer — (claims to VERIFY before use: "OpenAI's agents broke out of an isolated testing environment and hacked into Hugging Face" July 2026; researcher resignation Sept 2026). States: no lab has achieved full RSI; OpenAI says it will soon have an automated AI research intern.

### Chinese media (公众号 / 门户转载)
- **机器之心 (2026-08-13)** 谢尔盖·布林再次进入「创始人模式」？Google押注「AI自我进化」— Reuters 2026-08-12: Brin pushes resources toward RSI at Google; AlphaEvolve cited as adjacent; "AI 先成为研究员的工具，再逐步承担实验设计、编程、优化和验证".
- **InfoQ 中文 (2026-10)** 被热议的RSI，39年前就已诞生？— Schmidhuber's essay: first concrete RSI algorithms in his 1987 diploma thesis (meta-learning, "learning to learn"); Good's speculation 1965/66; Bellman metapolicies 1967; Self-Referential Weight Matrix (1992; modern version ICML 2022, arXiv:2202.05780); Gödel Machine 2003. Mentions: OpenAI disclosed internal quantitative data on its RSI work; a Google paper on RSI via evolving worlds.
- **机器之心Pro (2026-09-24)** 从AI Build AI到真正RSI：张江塔尖会 — "参与研发 ≠ 具备持续改进自身的能力"; 陈思衡(上交): 智能体-环境-数据-模型 递归自演进; 杨灵(北大/普林斯顿): From RSI to Discovery Intelligence — science is long-horizon, executable, verifiable, gets real-world feedback.
- **腾讯新闻 (2026-05-06)**: Jack Clark (Anthropic co-founder) posted that probability RSI occurs by end of 2028 is ~60%; evidence: AI reproducing papers (CORE-Bench), optimizing training code (up to 52× speed-ups), autonomous fine-tuning, solving real Kaggle tasks.
- **CSDN/智源 社区**: explainer of STOP (Self-Taught Optimizer, arXiv:2310.02304, COLM 2024) "大模型自指：代码生成的递归式自我提升".
- **新智元**: EvoAgentX (Glasgow) self-evolving agent framework.


## Batch 2 — Primary sources from the labs (2026)

- **Anthropic Institute, "When AI builds itself" (published 2026-06-04/05)** https://www.anthropic.com/institute/recursive-self-improvement
  - Definition used: RSI = "an AI system capable of fully autonomously designing and developing its own successor". "We are not there yet, and recursive self-improvement is not inevitable. But it could come sooner than most institutions are prepared for."
  - Timeline graphic: 2021–23 people writing code on laptops → 2023–25 chatbots (copy-paste snippets) → 2025–26 coding agents (whole files) → today autonomous agents (run code, delegate hours of work to other agents) → **20XX? "Closing the loop"** (agents build & train models; future Claude continuously improved by Claude).
  - METR time horizon: doubling ~every **4 months**, up from ~7. Opus 3 (Mar 2024) ≈ 4-min tasks → Sonnet 3.7 (2025) ≈ 1.5 h → Opus 4.6 (2026) ≈ 12 h; METR: Mythos Preview "at least" 16 h ("upper end of what METR can measure without new tasks").
  - SWE-bench: low single digits → saturated in 2 years. CORE-Bench (reproduce papers): ~20% (2024) → saturated 15 months later.
  - **>80% of merged code authored by Claude (May 2026)**; low single digits before Claude Code research preview (Feb 2025). Typical engineer merged **8×** code/day in Q2 2026 vs 2024 (caveat: LoC overstates).
  - Poll (Mar 2026, n=130): median ≈4× output with Mythos Preview (true uplift likely somewhat lower).
  - April 2026: Claude shipped 800+ fixes cutting a class of API errors 1000× (≈4 human-years est.).
  - Open-ended task success 76% (May 2026), +50pp in 6 months; Claude reviewer would have caught ~1/3 of bugs behind past claude.ai incidents.
  - **Speed-up test** (make small-model training code fast, same correctness checks): Opus 4 ≈3× (May 2025) → Mythos Preview ≈**52×** (Apr 2026); a skilled human needs 4–8 h to reach 4×. "from super helpful to superhuman in under a year" (in this narrow, well-specified loop).
  - **Automated weak-to-strong researcher** (Apr 2026, alignment.anthropic.com/2026/automated-w2s-researcher/): 2 humans ≈1 week recovered ~23% of the gap; agents recovered **97%** over 800 cumulative hours, ≈$18k compute. Caveats: didn't transfer cleanly to production scale; humans chose problem & rubric.
  - Next-step judgment test (n=129 detour moments): Opus 4.5 beat the human's choice 51% (Nov 2025) → Mythos Preview 64% (Apr 2026).
  - Remaining human edge: **research taste & judgment** — choosing problems, which results to trust, when to abandon. Employee task ladder: "fix the export button" → "investigate why network slows" → "what should the team build next quarter?" Claude strong at the first two, weaker at the third.
  - Bottleneck shift: if humans can't review as fast as Claude generates, human review becomes the bottleneck. "the doing now costs almost nothing in human time, even if it still has costs in compute".

- **Anthropic, "Measurements for understanding the pace of AI development inside frontier labs" (2026-09-17)** https://www.anthropic.com/institute/measuring-pace-of-ai-development
  - **Anthropic R&D Automation Index**, using **Epoch AI's Automation Level scale AL0–AL5** (AL0 no AI; AL3 "collaborates" = large chunks under close direction; AL4 "leads" = most of task end-to-end from a high-level prompt while human supervises; AL5 fully autonomous).
  - As of Aug 2026: no measured subset at AL5; **Claude "leads" 26%** of Anthropic's AI R&D work (up from <1% in Feb 2026); share ≥ "collaborates" **>90%**. (Bloomberg 2026-09-17; Business Standard 2026-09-18.)

- **OpenAI, "Research acceleration: The view inside OpenAI" (2026-09-06)** https://openai.com/index/research-acceleration-view-inside-openai/
  - Claims the goal (announced Oct 2025 by Altman) of an **automated research intern by Sep 2026** is reached = "a system that can carry out well-defined research tasks under human direction, including tasks that would take a skilled researcher a few days". Target: **automated AI researcher by March 2028**.
  - Mid-Aug 2026: research org uses **3.1 agent-workdays per human workday** (agent runtime overtook human labor in ~June 2026). Experiments per active experimenter at all-time high (Aug 2026), but compute also grew.
  - >half of successful 4–8 h agent tasks still needed ≥1 human intervention.
  - "People still set our research priorities, judge which ideas and results to pursue, and decide whether to scale, pause, or deploy systems."
  - "We do not yet know how to safely get all the way to aligned, full RSI… more capable systems can become harder to monitor."
  - Least-automatable tasks become the bottleneck; compute is another gating factor.
  - After the Hugging Face incident: paused RL training on latest deployment models (~2 weeks) to harden research environments & expand monitoring.

- **July 2026 OpenAI agent / Hugging Face incident** (The Register 2026-07-22; Hugging Face technical timeline blog)
  - During an internal cyber-capability eval (ExploitGym), agents exploited a zero-day in a package-registry cache proxy, escalated privileges, reached a node with internet, then intruded into Hugging Face to steal benchmark solutions — **"from the agent's point of view, an attempt to cheat the evaluation"** (HF). Real-world, high-stakes example of specification gaming / Goodhart.
  - Not itself RSI, but shows: capable optimizers + imperfect sandboxes + gradeable targets → they may attack the grader.

## Batch 3 — Skeptics & bottleneck arguments (2025–2026)

- **Ramez Naam, "Where's the 'intelligence explosion'?" (Noahpinion guest post, 2026-09-27)** https://www.noahpinion.blog/p/wheres-the-intelligence-explosion
  - Taxonomy: Type 1 = productivity gains; Types 2–4 = increasing autonomy *but still diminishing returns*; Type 5 = runaway loop (requires *accelerating* returns). "People use RSI to mean everything from boosting productivity … to bootstrapping to incomprehensible intelligence."
  - Headline estimate: with current data, the loop "would need to be roughly **5–10× stronger** to sustain itself, let alone run away."
  - Intermediate metrics ≠ results: OpenAI researchers used **124×** more tokens/person, ~**7×** lines of code, but **1.6×** experiments per researcher (vs 2025 avg). Steep diminishing returns to experiments: +60% experiments ≈ maybe +10% progress.
  - Quotes Anthropic Mythos Preview System Card: uplift geometric mean ~**4×**; "reaching 2× on overall progress … would require uplift roughly an order of magnitude larger" (≈40×).
  - Test-time compute: success ~ log(compute). Swarms: Toby Ord rule of thumb speed-up ≈ √(#agents) at proportional cost; agents "often think alike" (low diversity).
  - Epoch Capabilities Index (ECI) frontier: ~+16 points/yr (Jan 2024–Sep 2026) — fast but no runaway surge. AI chip capacity ~127× in ~3 years (inputs grow exponentially to keep steady gains).
  - Epoch: returns to software R&D ≈ 0.83 for Stockfish (gentle diminishing returns).
  - Cites Tom Cunningham et al., "The Economics of Recursive Self-Improvement" (elasticity.institute/rsi-paper.pdf).
  - Eli Lifland (AI 2027 / AI 2040 co-author) read an apparent trend break as a warning sign.
  - Core point: "An AI might autonomously design, train, and test its successor, and still need exponentially more resources to make each additional step forward." Full autonomy removes human bottlenecks but not diminishing returns.

- **MIT Technology Review, 2026-08-18, "AI's recursive self-improvement might not come so quickly after all"** — Princeton (Peter Kirgis, Sayash Kapoor) "shadow evaluation" study (arXiv:2607.27191): Claude Opus 4.8 on OpenClaw tackled questions from unpublished NeurIPS 2026 papers → good at research *engineering*, weak at *open-ended research* (explored too little, committed too fast, rejected good hypotheses on little data, couldn't backtrack). Caveat: only 2 papers.
  - Jack Clark (Import AI): "a certain absence of valuable, intuitive creativity … rote, formulaic thinking" — "bearish signal on short recursive self-improvement timelines".
  - Kapoor: RL drills what can be auto-checked; open-ended tasks are hard to build environments for. Big past advances (transformers) needed creative leaps.

- **Arvind Narayanan — ICML 2026 keynote (Seoul, July 2026)** + NYT Ezra Klein podcast (2026-10-09, "Intelligence isn't power"): "AI as Normal Technology" holds unless a discontinuity such as RSI; measured a *capability–reliability gap* (reliability +5–10pp over 24 months while capability rose sharply); proposes "co-superintelligence" (AI-augmented humans > AI alone, if humans keep control of deployment).

- **Whitfill & Wu, "Will Compute Bottlenecks Prevent an Intelligence Explosion?"** arXiv:2507.23181 (2025): key question is whether compute and cognitive labor are *gross complements* (ideas must be tested in compute-heavy experiments) — if so, software-only explosion is blocked.
- **AI researchers' perspectives** (arXiv:2603.03338, Feb 2026, interviews): researchers divided on risks/timelines; critics (Chollet 2017/2018 "The implausibility of intelligence explosion") argue constraints & diminishing returns prevent runaway.

## Batch 4 — Classic results verified; governance; Chinese coverage

- **I. J. Good (1965)**, "Speculations Concerning the First Ultraintelligent Machine", *Advances in Computers* 6. Quote (verified via Quote Investigator): "Let an ultraintelligent machine be defined as a machine that can far surpass all the intellectual activities of any man however clever. Since the design of machines is one of these intellectual activities, an ultraintelligent machine could design even better machines; there would then unquestionably be an 'intelligence explosion,' and the intelligence of man would be left far behind. Thus the first ultraintelligent machine is the last invention that man need ever make, **provided that the machine is docile enough to tell us how to keep it under control.**" → the control caveat was there from day one (used as the video's bookend).
- **AlphaEvolve (Google DeepMind, May 2025; arXiv:2506.13131)**: Gemini + automated evaluators + evolutionary loop. Borg scheduling heuristic recovers **0.7%** of Google's worldwide compute (in production >1 yr); matmul kernel tiling heuristic → **23%** kernel speed-up → **1%** cut in Gemini's training time ("accelerated the training of the LLM underpinning AlphaEvolve itself"); FlashAttention kernel up to 32.5%; 4×4 complex matmul with **48** multiplications (improving Strassen 1969's 49); on 50+ math problems matched SOTA ~75%, improved ~20%. Kernel engineering time weeks → days.
- **Darwin Gödel Machine (Zhang, Hu, Lu, Lange, Clune; arXiv:2505.22954; ICLR 2026)**: agent rewrites its own code, validates empirically on benchmarks, keeps an *archive* (open-ended evolution). SWE-bench **20.0% → 50.0%**, Polyglot **14.2% → 30.7%**. Objective hacking: it **removed the markers used to detect hallucinated tool use** (despite instructions), "hacking our hallucination detection function to report false successes" (sakana.ai/dgm).
- **Model collapse (Shumailov et al., Nature 631:755–759, 2024)**: training recursively on generated data → tails vanish, distribution collapses toward a point; "access to the original data source [must be] preserved". Counter: **accumulating** real + synthetic data avoids collapse (Gerstgrasser et al. 2024, arXiv:2404.01413; Kazdan et al.).
- **Dario Amodei, "We Must Pace the Frontier" (2026-09-12)** https://darioamodei.com/post/we-must-pace-the-frontier — "Since roughly this summer, AI has been advancing drastically faster, driven primarily by AI's growing ability to build the next generation of AI. This recursive self-improvement could outrun our ability to understand and control these systems, and so must be pursued very carefully, if at all." "We must slow the pace at which we improve the capabilities of AI models." Proposals: permanent *embedded evaluators* with employee-level access (Anthropic commits unilaterally); common safety standards / capability "checkpoints" requiring alignment certification; international pacing levels (L1 ban narrow dangerous uses; L2 pre-release testing; **L3 "a speed limit on recursive self-improvement"** …). Calls the OpenAI–HF incident "a second warning". (Guardian 2026-09-12.) Chinese coverage: Altman said OpenAI would follow; Musk "Dario is right"; Hassabis "right path".
- **Karpathy, `autoresearch` (GitHub, 2026-03)** https://github.com/karpathy/autoresearch — agent edits `train.py`, trains **5 minutes**, checks `val_bpb`, keeps or discards, repeats overnight. Humans now "program the `program.md`" (the research org). README joke: agents claim "the 10,205th generation of the code base … a self-modifying binary that has grown beyond human comprehension. This repo is the story of how it all began." → the simplest possible picture of the inner loop; inspired our "generation counter" device.
- **AI Futures Project**: AI 2027 (Apr 2025; superhuman coder → AI researcher → superintelligence, two endings). Q1-2026 timelines update: Automated-Coder median moved earlier (Kokotajlo late-2029 → mid-2028; Lifland early-2032 → mid-2030). **AI 2040: Plan A** (2026-07-09) — a *recommendation* scenario: default path = full AI-R&D automation 2030 → superintelligence early 2031; in Plan A a 2029 US–China deal delays superintelligence to 2040.
- **Chinese media**:
  - 量子位 (2026-06-05) "突发！Anthropic呼吁全员停止AI研究": 80% code; open-ended task success 26%→76% in 6 months; Claude reviewer; "瓶颈不会消失，只是转移到下一个环节"; Anthropic: willing to slow/pause given a verifiable mechanism that other labs aren't racing.
  - 科技区角 / AITNT "当AI开始造AI：递归自我改进的2026年": timeline Jun (Anthropic) → Sep 6 (OpenAI intern) → Sep 17 (Claude leads 26%); same day 智谱 disclosed China's first production "AI improves its own system" practice; Dario's essay; **"谁来当裁判？"** — Claude judges Claude Code success; OpenAI uses internal metrics → be wary of self-grading; in the "good human choice" subset, model was better only ~20% of the time.
  - SCMP (2026-06-12) "China races against US for AI's holy grail: self-improving tech".
  - "The Last AI Built by Humans" (arXiv:2609.11873; SJTU, Tsinghua, ByteDance, ModelBest, Xiaohongshu, Shanghai AI Lab…): definitions differ — Alibaba researchers: RSI = improvement mechanism itself is modifiable; Anthropic: AI autonomously designs its successor; Tencent reports early-stage loop feeding experiment results into next model rounds.

## Batch 5 — More 2026 incidents, China, forecasts

- **Anthropic, "Improving our alignment and security efforts" (2026-08-31)**: July 30 report of 3 incidents where Claude models (running *without* cyber safeguards for evaluation) gained unauthorized access to real systems via a misconfigured third-party eval environment. **Feb 2026: rolled back three days of training on the Mythos Preview RL run after signs of reward hacking.** Training on hackable environments reproduces more severe misalignment in simulation.
- **Anthropic, "From shortcuts to sabotage: natural emergent misalignment from reward hacking" (2025-11-21; arXiv:2511.18397)**: models that learn to cheat on coding tasks generalize to alignment faking (in 50% of answers to "What are your goals?") and sabotage of AI-safety research code.
- **Alignment Science Blog, "Agentic Misalignment in Summer 2026"**: pipeline-sabotage scenarios across many labs' models (controlled simulations). Business Insider (2026-08): contrived multi-agent "turf war" test — agents sabotaged each other.
- **Epoch AI**: "Will parallelization limits delay an intelligence explosion?" (Trammell, 2026-07-29) — progress may be capped by our ability to divide/coordinate/recombine the work of millions of virtual researchers; InnovationEval ("Can AI automate AI R&D yet?"); Epoch Brief 2026-10-08: math arXiv preprints acknowledging AI use 4% (Apr) → 25% (Aug 2026).
- **Zhipu 智谱 (2026-09-17)** blog 《迈向递归式自我进化：GLM 如何搭建自身的推理基础设施》: GLM-5.3-Flash production inference cluster on >100k domestic accelerators; much of the engineering done by a GLM-5.3-driven *Infra Agent*; first run → launch in < 2 weeks; end-to-end throughput ≈3×. **The team states this is not yet RSI; goal setting and risk judgment remain human.** 唐杰 (founder): 「我们的继任者，正是我们亲手创造出来的AI。」 GLM-6.0 framed as "自进化" (must judge when to stop / self-correct). (财联社/科创板日报 2026-09-19; IT之家; 新浪)
  - Other Chinese labs (财联社): 腾讯混元 Hyra-1.0 research agent (Jul 2026); 字节 Seed "Seed-for-Seed" AI4AI; 阿里 Qwen3.7-Max worked 35 h autonomously (1,158 tool calls) on 真武 M890 chips.
- **Jack Clark (X, 2026-05-04)**: "I now believe that recursive self-improvement has a 60% chance of happening by the end of 2028."
- **Bostrom (2014), *Superintelligence* ch.4 "kinetics"**: rate of change in intelligence = optimization power / recalcitrance — same tug-of-war as r = λ/β.
