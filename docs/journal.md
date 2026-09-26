# Hackathon journal — what was done, when, by whom

A dated record of every step that changed the project during the IBM Bob
2.0 Hackathon (25–27 Sep 2026). Bob configuration changes are listed
explicitly: which tools were switched on, when, and why. Times are TRT.

Actors: **Sena** (decides, approves, records video), **Bob** (IBM Bob 2.2.0,
custom mode), **Claude** (Claude Code: scoring, docs, drives Bob IDE and the
ADT MCP), **Codex** (demo page, pastes code into VS Code / BTP).

## 24 Sep — before the kick-off (disclosed in README)

- Samples, rule catalogue, verification rules, findings schema, mode draft,
  answer key (kept out of the repo), freeze scripts, first demo prototype.
- `docs/freeze.sha256` committed 16:37 UTC.

## 25 Sep — kick-off day

| Time | Actor | What | Evidence |
|------|-------|------|----------|
| 18:00 | — | Kick-off stream. Judging criteria, deliverables, 40 Bobcoin, credential warning noted | `docs/` notes, memory |
| 19:31 | Sena | Asked organisers on Discord about pre-event materials and mascot | README §Prepared |
| 19:37 | Hamza (lablab) | Confirmed pre-event samples/UI OK if disclosed and Bob work done during the event; mascot pending IBM | README §Prepared |
| 19:59 | Claude | README "Prepared before the hackathon" section | `07ea363` |
| 20:00 | Claude | Audit workspace built from frozen inputs: `~/Desktop/ccc-bob-audit` | `scripts/make-audit-workspace.sh` |
| 20:05 | Claude | **Bob mode created**: Clean Core Architect, Global scope, tools **Read + Edit only** (Execute, Browser, MCP, Skill, Todo, Subtask, Subagent, Mode all off). Reason: audits should be reproducible from reading; nothing should reach a system | README §How Bob is used |
| 20:10–20:14 | Bob | Task 1 audit ZFI_VENDOR_AGING, 8 findings, 0.165 coin | `reports/`, `bob_sessions/…task1…png` |
| 20:14 | Claude | Task 1 scored: core 6/6, bonus 1/5 | `docs/scoring/zfi_vendor_aging.md`, `db77902` |
| 20:24–20:38 | Bob | Task 2 audit ZSD_OPEN_ORDERS, 18 findings, 0.155 coin | `bob_sessions/…task2…` |
| 20:38 | Claude | Task 2 scored: core 11/12, bonus 0/3, 5 duplicates | `b72c162` |
| 20:44–20:55 | Bob | Task 3 audit ZMM_MASS_PRICE_UPDATE, 8 findings, 0.187 coin | `bob_sessions/…task3…` |
| 20:55 | Claude | Task 3 scored: core 6/6, bonus 0/3 | `1541237` |
| 20:50–20:59 | Bob | Task 4 audit ZCC_LEGACY_MATERIALS, 6 findings, 0.154 coin | `bob_sessions/…task4…` |
| 20:59 | Claude | Task 4 scored: core 4/5, bonus 0/1; totals 27/29, 1/12 | `2ab83dc`, first push |
| 21:07–21:50 | Bob | Task 5 modernize ZFI: CDS + class + 7 tests + README, 0.807 coin; **self-corrected** a missing method (FRIENDS + wrapper, two diffs) | `modernized/`, `bob_sessions/…task5…` |
| 21:55 | Claude | Read-only review of the rewrite: R1–R10 (R3 = CDS/class field-name mismatch) | `docs/scoring/zfi_vendor_aging_modernization.md`, `bb59235` |
| 22:00–22:30 | Codex | Demo: schema validation of 4 reports, report selector, `SHOW_MASCOT=false` flag | `2eab774`, `5ac94d5` |
| 22:xx | Claude | Six UI directions drawn; four-board design canvas; Codex drew three more | design canvas link in memory |
| 23:xx | Sena | Chose: cream page + dark code, home = "numbers first", one site four pages, keep Codex's Evidence Atlas + Dossier ideas | `docs/demo-ui-brief.md` |

## 26 Sep

| Time | Actor | What | Evidence |
|------|-------|------|----------|
| 10:49–10:51 | Codex | Four-page UI built to the brief, 7 tests | `6c5de3b`…`e6f0406` |
| 13:34 | Sena | Reminder to Hamza on the mascot; no answer | Discord |
| 14:00 | Sena | Decision: enable the static mascot now, disclose in README | `e43a48e` |
| 14:12–14:40 | Bob | Task 6: fix R3 + R1 in one follow-up, four diffs, 1.03 coin | `c2cf41d`, `bob_sessions/…task6…` |
| 14:45 | Claude | README "How Bob is used"; video shot list | `781841a` |
| 15:00 | Claude | BTP_TRIAL2 logon (VS Code → Chrome SSO); two empty objects created via ADT MCP (`abap_creation-create_object`) | `docs/activation/README.md` |
| 15:14 | Claude | Activation copies prepared (Z-prefix, local test class) | `docs/activation/*.abap`, `*.asddls` |
| 15:5x | Codex | Pasted CDS and class into BTP_TRIAL2; test include turned out empty | Codex session |
| 15:58 | Claude | `abap_activate_objects`: **CDS failed** (I_OperationalAcctgDocItem, I_Supplier missing), **class OK**; ATC 0 findings; unit tests "none found" | `00e73aa` |
| 16:00 | Claude | README status + modernization section updated with the outcome; pitch written | `920ce6a`, `ef506de` |
| 16:06 | Sena | "I don't understand the page myself" → four clarity fixes sent to Codex (plain-sentence finding titles, human-readable answer-key labels, drop the duplicate ZCC card, one-line page intros) | Codex session |
| 16:08 | Claude | **Bob mode changed**: Subagent and Todo tools switched **on** (Read, Edit unchanged; Execute, Browser, MCP, Skill, Subtask, Mode still off). Reason: run the remaining three modernizations as parallel sub-agents — the feature IBM highlighted at the kick-off — while keeping Bob off any system | this file; README §How Bob is used to be updated after the run |

| 16:12 | Bob | **Task 7 started**: one prompt asking for the three remaining modernizations as parallel sub-agents. Bob's first action: a Todo list — read rules → spawn sub-agent ×3 (zsd, zmm, zcc) → write `modernized/PARALLEL_RUN.md`. First use of Todo and Subagent in this project | screenshot to follow in `bob_sessions/` |

## Open at the time of writing

- Unit tests on BTP_TRIAL2 (test include to be pasted, then `abap_run_unit_tests`).
- Task 7: parallel modernization of ZSD, ZMM, ZCC via sub-agents.
- Sena's confirmation of the five proposed scoring judgements.
- Video recording; Sunday: credential scan, repo public, lablab form.
