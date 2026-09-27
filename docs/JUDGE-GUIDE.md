# Judge guide

Every claim in this project, the file that backs it, and a command to check it
yourself. The last section says what the project does **not** do.

| Claim | Evidence | Check it |
|---|---|---|
| Bob ran in a **custom mode** we wrote, with Read and Edit only | [`bob-config-draft/clean-core-architect.mode.md`](../bob-config-draft/clean-core-architect.mode.md), task screenshots in [`bob_sessions/`](../bob_sessions/) | Open any `*_summary.png`: mode name and Bobcoin are on the badge |
| The answer key was **sealed before Bob saw any code** | [`docs/freeze.sha256`](freeze.sha256), committed 24 Sep 19:37 TRT; first Bob report committed 25 Sep 20:18 TRT | `git log --format='%h %ci %s' -- docs/freeze.sha256 reports/ \| tail -3` |
| Bob found **27 of 29** rule problems and **1 of 12** logic bugs; **29 of 32** judged findings were right | One scoring file per program in [`docs/scoring/`](scoring/) | Each file lists every planted problem and Bob's matching finding |
| **0 of 40** findings invented a rule | [`reports/*.json`](../reports/) | `grep -ho '"rule": *"[^"]*"' reports/*.json \| sort \| uniq -c` shows only CC-01…CC-12 and Unclassified |
| **0 of 40** findings claim a check on a real system | [`reports/*.json`](../reports/) | `grep -ho '"verification_status": *"[^"]*"' reports/*.json \| sort \| uniq -c` shows only `observed` and `needs_verification` |
| Bob's rewrite **runs on a real SAP system**: 8 of 8 ABAP Unit tests | [`docs/activation/README.md`](activation/README.md), [`bob_sessions/2026-09-27_equivalence_8_tests.png`](../bob_sessions/2026-09-27_equivalence_8_tests.png) | The activation record lists every attempt, including the failed ones |
| The tests **catch a real mistake** | Same record, "Sixth step"; [`bob_sessions/2026-09-27_planted_bug_caught.png`](../bob_sessions/2026-09-27_planted_bug_caught.png) | One limit changed from 30 to 31 days: 2 tests failed, then passed again after the revert |
| Three programs rewritten **in parallel by three sub-agents**, 13 files in 16 minutes | [`bob_sessions/2026-09-26_task7_*.png`](../bob_sessions/), [`modernized/`](../modernized/) | Task 7 screenshots show the three sub-agents running |
| The whole project cost **4.258 of 40 Bobcoin** | The badge on every task summary in [`bob_sessions/`](../bob_sessions/) | Sum of the seven task badges |
| The site shows Bob's reports **unchanged** | [`demo-prototype/data/recorded-audits.json`](../demo-prototype/data/recorded-audits.json) holds each report with its SHA-256 | `for t in demo-prototype/tests/*.mjs; do node --test $t; done` (10 tests) |

## Fastest path (about 90 seconds)

1. Open <https://clean-core-copilot.vercel.app>, tab **2 · Findings**: each problem Bob flagged, on the exact lines, with "Bob was right / wrong".
2. Tab **3 · Rewrite**: old code next to Bob's rewrite, and the 8 of 8 test run.
3. Tab **4 · Proof**: every program through four steps; grey means "not done, no claim".

## What this project does not do

- **It is not a live analyzer.** The site replays recorded Bob runs. Running the audit on new code happens in Bob, with the mode above.
- **The four programs are synthetic.** We wrote them and planted the problems; the numbers describe this test, not Bob on any SAP system.
- **Only one of four rewrites was run on SAP**, on a free trial with two stand-in tables. The logic is tested; access to real SAP data is not. The other three rewrites are unreviewed.
- **Scoring was done by hand**: a first pass drafted with Claude, every call confirmed by Sena. There is no script or CI that recomputes the scores.
- **Nothing was checked on a customer system.**
