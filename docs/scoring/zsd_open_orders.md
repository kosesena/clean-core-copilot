# Scoring — ZSD_OPEN_ORDERS, Bob task 2

**Run:** 25 Sep 2026, 20:24–20:38 TRT. Cost: 0.155 Bobcoin, 24.7k / 270k context.
**Output:** `reports/zsd_open_orders.json` (18 findings) and
`reports/zsd_open_orders.md`, copied unchanged.

Scored by Claude against the private answer key (12 core, 3 bonus for this
sample) with its counting rules. All judgements confirmed by Sena on 26 Sep.

## Core

| Key | Rule | Accepted lines | Bob | Bob lines | Result |
|-----|------|----------------|-----|-----------|--------|
| S1 | CC-01 | 35–37 | F-06 | 35–37 | **Match** — `VBAK`, candidate `I_SalesDocument` |
| S2 | CC-01 | 38 | F-08 | 38 | **Match** — `VBAP` |
| S3 | CC-01 | 40–41 | F-09 | 40–41 | **Match** — `VBUP`; Bob says a released status view "must be identified", does not name one |
| S4 | CC-01 | 43–44 | F-10 | 43–44 | **Match** — `KNA1`, candidate `I_Customer` |
| S5 | CC-12 | 35–49 | F-07 | 35–49 | **Match** — three-level nested SELECT, N² round trips, marked *perf* |
| S6 | CC-10 | 10 | F-01 | 10 | **Match** — `TABLES` |
| S7 | CC-10 | 12–21 | F-02 | 12–21 | **Match** — `OCCURS 0`. F-03 (same rule, same lines, the `LIKE` part) is a **duplicate** of this entry under the one-finding-per-issue rule |
| S8 | CC-10 | 23, 27 | F-04 | 23 | **Match** — `LIKE vbap-netwr`. F-05 (25–27) repeats the `LIKE vbak-vkorg` point → **duplicate**; its other claim (SELECT-OPTIONS/PARAMETERS under CC-10) is not in the catalogue — see extras |
| S9 | CC-10 | 47 | — | — | **Missed** — `APPEND it_orders` through the header line. Bob mentions the header line in F-02's reason but never reports line 47 |
| S10 | CC-10 | 63 | F-17 | 63 | **Match** — `ADD … TO` |
| S11 | CC-11 | 30–31, 34–50, 53–67 | F-12 | 34–50 | **Match** — `FORM get_data`. F-13 (53–67) and F-14 (30–31) are **duplicates**: the key counts FORM/PERFORM once per program |
| S12 | CC-09 | 8, 56–66 | F-15 | 53–67 | **Match** — `WRITE`/`ULINE`/`AT NEW`. F-16 (56–60, `AT NEW` alone) is a **duplicate** |

**Core recall: 11 / 12.**

## Bonus

| Key | Issue | Bob | Result |
|-----|-------|-----|--------|
| S14 | Header line never cleared: when the `KNA1` read finds nothing, `name1` keeps the previous customer's name | — | Missed |
| S15 | Inside `AT NEW kunnr`, fields right of the group key print as `*`, so the customer name never appears | — | Missed |
| S16 | `AT NEW kunnr` compares every component up to `kunnr` in the structure (`vbeln`, `erdat`, `kunnr`), so the header fires per order, not per customer | — | Missed |

**Bonus hits: 0 / 3.** All three are runtime behaviours of the header
line and control-level processing. Bob flagged the constructs as obsolete
but did not reason about what they do at runtime.

## Extras (Bob findings not in the key)

| Bob | Rule | Lines | What it says | Proposed judgement |
|-----|------|-------|--------------|--------------------|
| F-11 | CC-10 | 45–46 | `MOVE-CORRESPONDING` is obsolete because CC-10 lists `MOVE` | **Incorrect — decided by Sena, 26 Sep.** `MOVE-CORRESPONDING` is a valid statement in ABAP for Cloud Development; the catalogue entry is the scalar `MOVE`. Bob half-knew this — it adds "verify whether this specific form is prohibited" and puts the question in the human list — but still filed it as a finding |
| F-05 | CC-10 | 25–27 | `SELECT-OPTIONS`/`PARAMETERS` belong to the selection-screen framework, not available in ABAP Cloud | **Duplicate of S8** for the `LIKE` part; the selection-screen claim is a defensible observation with no catalogue rule (same pattern as F-08 in task 1). Counted as duplicate, not as a separate extra |
| F-18 | Unclassified | 42 | Comment says "no delivery yet" but `LFSTA <> 'C'` only excludes *fully* delivered items; partially delivered items pass. Asks the business rule for "open" | **Correct observation, unscored — decided by Sena, 26 Sep.** The key lists this as a *human must decide* note and deliberately does not score it; counting it as a correct extra would score through the back door what the key's author chose not to score. Recorded, excluded from both numerator and denominator. Bob's reason is precise: "the filter is logically correct (exclude fully delivered), but the comment is misleading" |

## Verdicts

| | Answer key | Bob |
|---|---|---|
| Overall status | Needs target verification | Needs target verification ✔ |
| Draft verdict hint | **Refactor** (C findings, no D) | **Rebuild** ✘ |
| `verification_status` | never `verified_on_target` | 8 × `needs_verification`, 10 × `observed`, 0 × `verified_on_target` ✔ |

The verdict mismatch matters. Bob's own level hints are C, syntax and
perf — no D — yet it wrote *Rebuild*. The mode instructions say the hint
follows the highest level found; Bob did not apply its own rule. This is
the first place task 2 deviates from the answer key on a judgement rather
than on a miss.

## Numbers

- Core recall: **11 / 12**
- Bonus hits: **0 / 3**
- Duplicates: **5** (F-03, F-05, F-13, F-14, F-16) — excluded from ratios
- Decided findings: 18 − 5 = **13**
- Precision over decided findings: **11 / 12** (F-11 incorrect; F-18
  recorded but unscored, so 18 − 5 duplicates − 1 unscored = 12)
- Undecided: 0

## What this run adds to task 1

- Same strength: catalogue rules are applied to the right lines, and
  nothing is claimed as verified on a target.
- New weakness: Bob over-reports. Five of 18 findings restate an issue
  already filed (one per FORM, one per LIKE, one per list construct). A
  reviewer would merge them; the schema does not stop Bob from splitting.
- New weakness: the verdict hint contradicts Bob's own level hints.
- Same blind spot as task 1: runtime and business-logic defects (S14–S16)
  are missed even when the construct that causes them is flagged.
