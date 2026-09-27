# lablab submission form — drafts (27 Sep)

Paste into the form fields. Word counts are given; both statements must stay
under 500 words.

## Project title

Clean Core Copilot — an IBM Bob mode that reviews legacy SAP code, with its reliability measured

## Short description

Clean Core Copilot is an IBM Bob custom mode plus a 12-rule catalogue that audits legacy SAP ABAP programs for S/4HANA Cloud readiness and rewrites them. Before trusting it we measured it: on four programs with 41 planted problems and an answer key sealed by hash, Bob found 27 of 29 rule violations and 1 of 12 business-logic bugs; its rewrite passed 7 of 7 tests on a real SAP trial. The only SAP entry. 4.3 of 40 Bobcoin.

## Long description — problem & solution

**Problem.** Every company moving to S/4HANA Cloud carries hundreds of custom ABAP programs written over fifteen years. Each one must be checked against SAP's Clean Core rules and often rewritten before it can move. Today that review is manual, done by the few consultants who know both the old and the new world. It is slow, expensive and inconsistent, and nobody knows how far an AI assistant can be trusted with it. That is the question a project manager actually asks: not "can Bob do this?" but "how well, measured, and where does it fail?"

**Solution.** Clean Core Copilot is an IBM Bob custom mode plus an evaluation harness. Before the hackathon we wrote four synthetic legacy programs (finance, sales, materials) with 41 planted problems, a twelve-rule Clean Core catalogue, and an answer key. The key stays outside the repository; its SHA-256 was committed on 24 September, before Bob saw any code, and the organisers confirmed the preparation. During the hackathon Bob, in the "Clean Core Architect" mode, audited all four programs and wrote JSON findings with a rule ID, line range and reason for each. We scored them against the sealed key and confirmed every judgement by hand.

**Results.** Bob found 27 of 29 catalogue violations on the right lines and 1 of 12 business-logic defects. Of the 32 findings we could judge, 29 were correct (91 %); six were duplicates and three were wrong. Bob then rewrote one program into a CDS view, a class and seven ABAP Unit tests, and rewrote the other three in parallel with three sub-agents in sixteen minutes. On a real SAP BTP trial system the view failed on exactly the two SAP objects Bob had marked *candidate*; with two labelled stand-in tables the class compiled, all seven tests passed and ATC reported zero errors. Getting there exposed two syntax defects in Bob's code that only a compiler finds.

**What it means.** Bob is a strong first reviewer for catalogue rules and a weak one for business logic. The human stays in the loop, and we can now say where, with numbers. A recorded-evidence site shows every finding next to the code, whether Bob was right, and what was and was not verified. Total cost: 4.26 of 40 Bobcoin.

**Limits.** The samples are synthetic (customer ABAP cannot be published); the numbers describe this test, not Bob in general. One of four rewrites was tested, against stubs; three are unreviewed. Nothing was verified on a customer's system.

## IBM Bob usage statement

All analysis and all generated code came from IBM Bob 2.0 in the Bob IDE, in a custom mode built for this project.

**Custom mode "Clean Core Architect".** A senior-SAP-architect role definition with custom instructions: read the rule catalogue and the verification rules first; cite exactly one rule ID and one line range per finding; file anything outside the catalogue as *Unclassified* instead of inventing a rule; keep target product and release *unknown* rather than guessing; never set a finding to *verified on target*; ask before writing code. Tool grant for tasks 1–6: Read and Edit only, no Execute, Browser or MCP, so Bob could never touch a system. The mode file, rules and task prompts are in `bob-config-draft/` and were frozen by hash with the inputs.

**Document understanding.** Every task started with Bob reading the catalogue, the verification rules, the findings JSON schema and the sample program; the reports cite them.

**Agent mode with approvals.** Bob proposed every file write; 18 writes were approved by hand. Task summaries with Bobcoin badges are in `bob_sessions/` (ten screenshots).

**Seven tasks, one prompt each.** Tasks 1–4: audit one program each (0.15–0.19 Bobcoin). Task 5: modernize the finance program into a CDS view, a class and seven unit tests (0.81). Task 6: fix two review findings (1.03). Task 7: modernize the remaining three programs at once.

**Parallel sub-agents.** For task 7 the mode's tool list was extended with Subagent and Todo (still no Execute). Bob planned a todo list and spawned one sub-agent per program; 13 files in 16 minutes for 1.76 Bobcoin, against 45 minutes for the single serial rewrite. We do not claim a like-for-like speed-up: the programs differ and those 13 files are unreviewed.

**What was not Bob.** The rule catalogue, samples, answer key, scoring, activation on the SAP trial and the demo site were done by Sena with Claude and Codex, and are labelled as such. Bob's raw JSON is kept unchanged; our judgements are stored separately.

**Cost.** 4.258 of 40 Bobcoin in total, itemised per task in the README.

## Tags

IBM Bob, SAP, ABAP, Clean Core, S/4HANA, legacy modernization, code review, evaluation, developer tools

## Other fields

- Public repository: github.com/kosesena/clean-core-copilot (flip to public before submitting; run the credential scan first)
- Task session screenshots: `bob_sessions/` (10 PNGs, solo team)
- Demo platform: Vercel (static) · Application URL: https://clean-core-copilot.vercel.app
- Cover image: `video/cover.png`
- Video: `video/clean-core-copilot-demo-v1.mp4` (2:19)
- Slides: optional; the Overview page and `docs/presentation-outline.md` stand in
