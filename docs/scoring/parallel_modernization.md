# Review — parallel modernization of ZSD, ZMM, ZCC (Bob task 7)

**Run:** 26 Sep 2026, 16:12–16:28 TRT. One prompt. Bob (Clean Core
Architect mode, now with **Subagent** and **Todo** tools enabled — see
`docs/journal.md`) made a five-step todo list, read the rules once, then
spawned **three sub-agents that ran at the same time**, one per program
(`zsd_open_orders_agent`, `zmm_mass_price_update_agent`,
`zcc_legacy_materials_agent`). Cost: **1.76 Bobcoin** for three programs
(task 5 alone cost 0.807 for one). Approvals: the sub-agent spawns and the
file writes were approved for the task as a whole, not one by one; every
file landed under `modernized/`, nothing else was touched.
**Output:** 13 files — per program a CDS view entity, a class, an ABAP Unit
test class and a README; plus `modernized/PARALLEL_RUN.md`, Bob's own
summary with per-program "unresolved items".

This is a read-only review by Claude, like `zfi_vendor_aging_modernization.md`.
Nothing was compiled or activated. What was checked: forbidden constructs,
naming consistency (the R3 lesson), candidate labelling, test count, and
whether Bob's unresolved-items list is honest.

## What holds up, all three

- **No forbidden construct survives.** `grep` for `EXEC SQL`, `OPEN DATASET`,
  `SUBMIT`, `CALL TRANSACTION`, `POPUP_TO_CONFIRM`, direct `UPDATE` on SAP
  tables: only in comments describing what was removed. GUI and write
  integrations are stubs returning `ev_subrc = 4`, as in ZFI.
- **R3 lesson applied without being re-taught in each sub-agent.** All three
  structures use the CDS element names as component names (`SalesDocument`,
  `Plant`, `Material`, `MaterialType` …) and every `SELECT … INTO
  CORRESPONDING FIELDS` lists elements explicitly. The lesson was in the
  parent prompt; the sub-agents carried it.
- **Candidate discipline intact.** Every consumed view (`I_SalesDocument`,
  `I_SalesDocumentItem`, `I_Customer`, `I_MaterialStock`, `I_Product`) and
  every field whose name was guessed carries `/* candidate */`. No
  `verified_on_target` anywhere; `PARALLEL_RUN.md` opens with *Needs target
  verification*.
- **Honest about gaps.** Each sub-agent lists what it could not resolve.
  The ZMM one goes further: it could not find a released view for `MBEW`
  fields, used `I_MaterialStock` as a placeholder and wrote **"Do NOT
  activate until confirmed"** in the CDS header. That is the behaviour the
  mode asks for and the most useful line in the run.
- **Tests:** ZSD 4, ZMM 6, ZCC 4 (ZFI had 7). ZMM's include the price-control
  guard the answer key had listed as a human decision (M10 / F-08) — Bob
  added the guard the legacy program lacked, and tested it.

## What a reviewer would send back

| # | Program | Issue | Severity |
|---|---------|-------|----------|
| P1 | ZMM | CDS source `I_MaterialStock` is a placeholder the sub-agent itself says is probably wrong. Correct behaviour, but the file will not be usable until a human names the right view | High, by design |
| P2 | ZSD | Delivery-status filter (`DeliveryStatus <> 'C'`) sits on a candidate field of a candidate view; the legacy `VBUP` read has no confirmed released equivalent. Sub-agent says so | High, by design |
| P3 | ZSD | Legacy bonus issues S14–S16 (header line never cleared, `AT NEW` printing `*`, control level firing per order) are all gone because the constructs are gone — but the README does not say the behaviour changed, only that the constructs were replaced. A behaviour-preserving migration would have to decide whether the old (wrong) output was relied on | Medium |
| P4 | ZMM | `confirm_stub()` returns `abap_true` unconditionally; a caller that forgets to replace it gets an unconfirmed mass price change. The stub is marked, but it is a fail-open default | Medium |
| P5 | all | `ev_subrc = 4` as "not implemented" is consistent across four programs, but nothing distinguishes "not implemented" from a real failure code | Low |
| P6 | all | Not activated, not compiled. The ZFI attempt showed even the compile-clean-looking code needed one line (`DEFINITION DEFERRED`) before it would activate with a local test class; the same applies here | — |

## Numbers for the deck

| | Task 5 (ZFI, single) | Task 7 (3 programs, parallel) |
|---|---|---|
| Programs | 1 | 3 |
| Files | 4 | 13 |
| Unit tests written | 7 | 14 |
| Bobcoin | 0.807 | 1.76 (0.59 per program) |
| Wall-clock | ~45 min incl. approvals | ~16 min |
| Self-declared blockers | 10 human decisions | 5 per program + cross-cutting table |

Parallel sub-agents cut cost per program by about a quarter and wall-clock
by about two thirds — with the same discipline. That is the sentence for
the "application of technology" criterion.

## Not done

- Activation of the three new rewrites on the trial (the ZFI attempt is the
  reference: expect the CDS sources to be missing there, the classes to
  need the `DEFERRED` line).
- Scoring against an answer key: there is none for modernized code; this
  review is the only check.
