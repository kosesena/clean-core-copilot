# Scoring — ZMM_MASS_PRICE_UPDATE, Bob task 3

**Run:** 25 Sep 2026, 20:44–20:55 TRT. Same workspace, mode and prompt
template as tasks 1–2. Cost: 0.187 Bobcoin, 20.7k / 270k context.
**Output:** `reports/zmm_mass_price_update.json` (8 findings) and
`reports/zmm_mass_price_update.md`, copied unchanged.

Scored by Claude against the private answer key (6 core, 3 bonus) with its
counting rules. *Proposed* judgements are for Sena to confirm.

## Core

| Key | Rule | Accepted lines | Bob | Bob lines | Result |
|-----|------|----------------|-----|-----------|--------|
| M1 | CC-08 | 22–27 | F-01 | 22–27 | **Match** — `POPUP_TO_CONFIRM`, non-released, needs GUI |
| M2 | CC-01 | 29 | F-02 | 29 | **Match** — `SELECT * FROM mbew` |
| M3 | CC-03 | 33–37 | F-03 | 35 | **Match** — direct `UPDATE mbew`; reason names locking, change documents, price-change history. `COMMIT WORK` (37) not mentioned |
| M4 | CC-04 | 40–46, 51–64 | F-04 | 45 | **Match** — BDC + `CALL TRANSACTION 'MM02'` |
| M5 | CC-11 | 42–44, 51–64 | F-06 | 51–64 | **Match** — `FORM`/`PERFORM` |
| M6 | CC-09 | 49 | F-05 | 49 | **Match** — `WRITE` |

**Core recall: 6 / 6.** Both D-level patterns (CC-03, CC-04) found and
levelled D.

## Bonus

| Key | Issue | Bob | Result |
|-----|-------|-----|--------|
| M7 | Writing `STPRS` into `MBEW` directly skips the price-change posting; stock value and GL drift apart | — | Missed. F-03 gets close ("bypasses business logic … price-change history") but never says the valuation posting is skipped or that FI drifts. F-03 is already the M3 hit; one-to-one rule |
| M8 | The "safe" BDC path fills only the first MM02 screen and never sets a price — changes nothing while looking successful | — | Missed. Bob asks in the human list "whether the p_bdc path needs to be preserved", not whether it works |
| M9 | `bwkey = p_werks` assumes plant-level valuation | — | Missed |

**Bonus hits: 0 / 3.** M7 is the finding a reviewer is paid for on this
program; Bob circled it without landing.

## Extras

| Bob | Rule | Lines | What it says | Proposed judgement |
|-----|------|-------|--------------|--------------------|
| F-07 | CC-10 | 10–14 | Chained `DATA:` with `TYPE c` and structures typed on SAP tables are "migration-time code quality issues"; Bob adds "not forbidden by CC-10 per se" | **Incorrect** (proposed). Nothing on lines 10–14 is in the CC-10 list; Bob says so itself and files it anyway. Same pattern as task 2 F-11 |
| F-08 | Unclassified | 33–36 | `STPRS` raised without checking price control `VPRSV`; moving-average materials should not get a direct standard-price update | **Correct extra** (proposed). This is the key's own unscored "human must decide" note for this sample, and Bob also puts the VPRSV guard in its human list |

## Verdicts

| | Answer key | Bob |
|---|---|---|
| Overall status | Needs target verification | Needs target verification ✔ |
| Draft verdict hint | Rebuild (D: CC-03, CC-04) | Rebuild ✔ |
| `verification_status` | never `verified_on_target` | 3 × `needs_verification`, 5 × `observed`, 0 × `verified_on_target` ✔ |
| Named replacement | — | `BAPI_MATERIAL_SAVEDATA` offered as *candidate*, release status flagged as unverified ✔ |

## Numbers

- Core recall: **6 / 6**
- Bonus hits: **0 / 3**
- Duplicates: 0
- Precision over decided findings: **7 / 8** if Sena confirms F-08 correct
  and F-07 incorrect

## Pattern across tasks 1–3

- Core: 23 / 24 planted catalogue issues found (one miss: ZSD line 47).
- Bonus: 1 / 11. The one hit had a source comment pointing at it.
- Every run has produced one finding Bob itself half-retracts in its own
  reason ("not forbidden per se", "verify whether this form is
  prohibited", "no explicit WRITE"). The mode instruction "never invent a
  rule ID" stops invented IDs but not stretched ones.
- Every run has also produced one Unclassified finding that matches the
  key's unscored human-decision note. Bob is good at spotting *where* a
  business rule is ambiguous, weak at saying *what goes wrong* at runtime.
