# Demo video — shot list (target 3:00, hard max 3:30)

One take per scene is fine; cut in the editor. Screen recording at 1440×900
or larger, cursor visible, no music under speech. Sena narrates in English;
the wording below is a script to paraphrase, not to read.

| # | Time | Screen | Say (paraphrase) |
|---|------|--------|------------------|
| 1 | 0:00–0:20 | Demo **Overview**, no scrolling | "Companies moving to S/4HANA Cloud carry hundreds of custom ABAP programs. Each one has to be checked against Clean Core rules by hand, by the few people who still know both worlds. I asked whether IBM Bob can do that review, and, more importantly, *how well*." |
| 2 | 0:20–0:45 | Repo README, section *Prepared before the hackathon*, then `docs/freeze.sha256` | "Before the kick-off I wrote four synthetic legacy programs with planted issues, a twelve-rule catalogue, and an answer key. The key is not in the repo; only its hash is, frozen on 24 September, so nothing could be adjusted after seeing Bob's output. The organisers confirmed this preparation on Discord." |
| 3 | 0:45–1:05 | **Bob IDE**: Settings → Modes → Clean Core Architect (open the mode, scroll the instructions once) | "In Bob I built a custom mode: a senior SAP architect that audits against the catalogue only, never invents a rule, and never claims something is verified on a system it hasn't seen. Read and Edit tools only." |
| 4 | 1:05–1:35 | **Bob IDE**: `bob_sessions/2026-09-25_task1_*.png` or the live task 1 history: the prompt, the "Explored 4 files", the write approval, the 0.165 badge | "One prompt per program. Bob reads the catalogue, the schema and the sample, then writes a JSON report. Every write is approved by hand. Four audits cost 0.66 Bobcoin in total." |
| 5 | 1:35–2:05 | Demo **Findings**, ZFI: click F-03 (red, native SQL), then F-07 (comment ≠ code) | "This is Bob's output on the vendor-ageing report. F-03: native SQL, level D, the one finding that forces a rebuild. F-07: Bob noticed the comment promises a currency conversion the code never does. The right column lists what Bob could not verify — target release, field names — instead of guessing." |
| 6 | 2:05–2:30 | Demo **Overview** cards, then `docs/scoring/zcc_legacy_materials.md` totals table | "Against the answer key: 27 of 29 catalogue rules found on the right lines. But only 1 of 12 business-logic defects — the FI revaluation drift, the dead BDC path — Bob does not reason about runtime. Six of forty findings are duplicates. These are my assessments; they are labelled as such." |
| 7 | 2:30–2:50 | Demo **Before / after**, then `bob_sessions/2026-09-26_abap_unit_7_tests.png` | "Then Bob rewrote the program: a CDS view, a class, seven unit tests. My review found the CDS and class disagreed on field names; one follow-up prompt fixed that. On a real BTP trial the view failed on exactly the two SAP objects Bob had marked *candidate*. With two labelled stand-in tables the class compiled and all seven tests passed. Getting there took two syntax fixes that only a compiler finds; Bob's code did not compile first time." |
| 8 | 2:50–3:05 | Demo **Evidence** grid | "This is the honest picture: four audited and scored, four rewritten — three of them by parallel sub-agents in sixteen minutes — one tested, none verified on a customer's system. Every dashed cell is a claim we chose not to make. Bob is a strong first reviewer for catalogue rules and a weak one for business logic — and now I can say that with numbers, for about four of forty Bobcoin." |

## Cuts to prepare

- Bob screenshots: task 1 badge (0.165), task 5 FRIENDS moment, task 6 badge (1.84 session total), task 7 parallel sub-agents, ABAP Unit 7/7 panel. All in `bob_sessions/`.
- Demo page served locally (`python3 -m http.server 4173 --bind 127.0.0.1` in `demo-prototype/`), mascot on, four reports imported (they load from `cases/` / the recorded set).
- Terminal or editor tab with `docs/freeze.sha256` open.

## Don't say

- "Bob verified" or "tested on SAP" without the caveat: the class activated and 7 tests passed **against stand-in tables on a free trial**; the SAP data link is unproven and Bob's own view did not activate.
- "Accuracy 93 %" without "against an answer key for synthetic samples".
- "Parallel sub-agents saved time or money" — they were used (task 7, 3 programs, 1.76 Bobcoin, 16 min) but nobody has reviewed those 13 files; no like-for-like comparison exists.

## Deliverables checklist (lablab form)

- [ ] Video (this plan), unlisted YouTube or file
- [ ] Written problem + solution (README §The problem / What it does)
- [ ] Written "how Bob was used" (README §How Bob is used)
- [ ] Public repo link — flip visibility on Sunday, after a last credential scan
- [ ] Bob task session screenshots in repo (`bob_sessions/`, 10+ files)
- [ ] Slides: optional; the Overview page can stand in
- [ ] lablab team created (solo team), Submit button visible
