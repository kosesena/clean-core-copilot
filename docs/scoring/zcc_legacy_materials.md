# Scoring — ZCC_LEGACY_MATERIALS, Bob task 4

**Run:** 25 Sep 2026, 20:50–20:59 TRT. Same workspace, mode and prompt
template as tasks 1–3. Cost: 0.154 Bobcoin, 20.2k / 270k context.
**Output:** `reports/zcc_legacy_materials.json` (6 findings) and
`reports/zcc_legacy_materials.md`, copied unchanged.

Scored by Claude against the private answer key (5 core, 1 bonus) with its
counting rules. *Proposed* judgements are for Sena to confirm.

## Core

| Key | Rule | Accepted lines | Bob | Bob lines | Result |
|-----|------|----------------|-----|-----------|--------|
| L1 | CC-10 | 5 | F-01 | 5 | **Match** — `TABLES mara` |
| L2 | CC-01 | 15–18 | F-03 | 15–18 | **Match** — `SELECT … FROM mara`, candidate `I_Product` |
| L3 | CC-08 | 25–32 | F-05 | 25–32 | **Match** — `REUSE_ALV_GRID_DISPLAY`, non-released, GUI-bound |
| L4 | CC-09 | 21, 34 | F-04 | 21 | **Match** — `WRITE`. F-06 (34, second `WRITE`) is a **duplicate** |
| L5 | Unclassified | 12, 27–29 | — | — | **Missed** — the two-field table `lt_materials` is passed to ALV with `i_structure_name = 'MARA'`; field catalogue and table don't match, so the call fails at runtime. Bob flagged the function module as non-released and stopped there |

**Core recall: 4 / 5.** The miss is the one planted *runtime* issue in
the set, the only core entry that is not a catalogue rule.

## Bonus

| Key | Issue | Bob | Result |
|-----|-------|-----|--------|
| L6 | Old Open SQL syntax (no `@` host-variable escaping, space-separated field list); strict-mode requirement on the target to be verified | — | Missed |

**Bonus hits: 0 / 1.**

## Extras

| Bob | Rule | Lines | What it says | Proposed judgement |
|-----|------|-------|--------------|--------------------|
| F-02 | Unclassified | 6 | `SELECT-OPTIONS` is a selection-screen declaration; no SAP GUI in ABAP Cloud; "no catalogue rule explicitly names SELECT-OPTIONS, so this is filed as Unclassified" | **Correct extra** (proposed). The observation is right and, unlike ZSD F-05 and ZFI F-08, Bob filed it under *Unclassified* instead of stretching a rule ID. This is the behaviour the mode asks for |

## Verdicts

| | Answer key | Bob |
|---|---|---|
| Overall status | Needs target verification | Needs target verification ✔ |
| Draft verdict hint | **Refactor** (C, no D) | **Rebuild** ✘ |
| `verification_status` | never `verified_on_target` | 3 × `needs_verification`, 3 × `observed`, 0 × `verified_on_target` ✔ |

Second time (after ZSD) that Bob writes *Rebuild* with no D-level finding
of its own. The mode text says the hint follows the highest level found;
Bob seems to escalate whenever the program is GUI-bound end to end.

## Numbers

- Core recall: **4 / 5**
- Bonus hits: **0 / 1**
- Duplicates: **1** (F-06)
- Decided findings: 6 − 1 = **5**
- Precision over decided findings: **5 / 5** if Sena confirms F-02 as a
  correct extra

## Totals, tasks 1–4

| Sample | Core | Bonus | Bob findings | Dup. | Proposed incorrect | Proposed correct extra | Verdict vs key |
|--------|------|-------|--------------|------|--------------------|------------------------|----------------|
| ZFI_VENDOR_AGING | 6 / 6 | 1 / 5 | 8 | 0 | 0 (F-08 undecided) | 0 | Rebuild = Rebuild |
| ZSD_OPEN_ORDERS | 11 / 12 | 0 / 3 | 18 | 5 | 1 (F-11) | 1 (F-18) | Rebuild ≠ Refactor |
| ZMM_MASS_PRICE_UPDATE | 6 / 6 | 0 / 3 | 8 | 0 | 1 (F-07) | 1 (F-08) | Rebuild = Rebuild |
| ZCC_LEGACY_MATERIALS | 4 / 5 | 0 / 1 | 6 | 1 | 0 | 1 (F-02) | Rebuild ≠ Refactor |
| **Total** | **27 / 29** | **1 / 12** | **40** | **6** | **2** | **3** | 2 of 4 match |

- Core recall **27 / 29 = 93 %**. Both misses are non-syntactic: an
  `APPEND` through a header line (ZSD 47) and a runtime field-catalogue
  mismatch (ZCC 12, 27–29).
- Bonus **1 / 12**. The single hit (ZFI F10) had a source comment pointing
  at it. Bob does not reason about runtime behaviour or business effect.
- Precision over decided findings: 27 core + 1 bonus + 3 correct extras =
  31 of 34 decided → **91 %** if Sena confirms all proposals as written
  (denominator excludes 6 duplicates; ZFI F-08 counted as undecided).
- Cost: 0.165 + 0.155 + 0.187 + 0.154 = **0.66 of 40 Bobcoin** for four
  audits.
- Status discipline held in all four runs: no `verified_on_target`, every
  replacement labelled *candidate*, product/release left `unknown`.
- Weak spots to show honestly in the deck: over-reporting (6 duplicates in
  40), stretched rule IDs (2), and a verdict hint that ignores Bob's own
  level hints (2 of 4).
