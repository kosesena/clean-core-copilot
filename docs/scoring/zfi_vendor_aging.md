# Scoring — ZFI_VENDOR_AGING, Bob task 1

**Run:** 25 Sep 2026, 20:10–20:14 TRT (after the kick-off at 18:00 TRT).
**Workspace:** `~/Desktop/ccc-bob-audit`, built by `scripts/make-audit-workspace.sh`
from the committed `docs/freeze.sha256` (no `.git`, no plan, no answer key).
**Mode:** Clean Core Architect, created in Bob 2.2.0 → Settings → Modes
(Global scope; role, when-to-use and custom instructions taken verbatim from
`bob-config-draft/clean-core-architect.mode.md`; tools: Read + Edit only).
**Task prompt:** `bob-config-draft/first-task.md`, with the output paths
spelled out.
**Cost:** 0.165 Bobcoin of 40 (task badge), 22.4k / 270k context.
**Output:** `reports/zfi_vendor_aging.json` (8 findings) and
`reports/zfi_vendor_aging.md`. Both copied unchanged from the workspace;
SHA-256 in the commit that adds them. JSON has all six top-level keys the
schema requires; full JSON Schema validation is pending (Codex).

Scored by Claude against the private answer key (`baseline.md`, frozen
24 Sep, hash in `docs/freeze.sha256`), using its counting rules. The answer
key is the sample author's list of planted issues, not an independent
review — see the provenance note in the baseline.

## Core (planted, catalogue rules)

| Key | Rule | Accepted lines | Bob | Bob lines | Result |
|-----|------|----------------|-----|-----------|--------|
| F1 | CC-02 | 30–36 | F-01 | 30–36 | **Match** — direct `BSEG` read, open-item filter named |
| F2 | CC-01 | 32 | F-02 | 32 | **Match** — `LFA1` join |
| F3 | CC-05 | 39–41 | F-03 | 39–41 | **Match** — native SQL, only D-level |
| F4 | CC-06 | 20, 55–64 | F-05 | 55–64 | **Match** — `OPEN/TRANSFER/CLOSE DATASET`, hard-coded path named |
| F5 | CC-07 | 67 | F-06 | 67 | **Match** — `SUBMIT` |
| F6 | CC-10 | 19, 43–52, 59–63 | F-04 | 19 | **Match** — `WITH HEADER LINE`; reason also names the LOOP/MODIFY uses |

**Core recall: 6 / 6.**

## Bonus (real but subtle, outside the catalogue)

| Key | Issue | Bob | Result |
|-----|-------|-----|--------|
| F7 | `augbl = space` gives items open *today*, not at `p_keydt` | — | Missed |
| F8 | CSV has no amount, currency or debit/credit indicator; `dmbtr` read but never written | — | Missed |
| F9 | `zfbdt` is the baseline date, not the net due date | — | Missed. Bob's F-01 calls ZFBDT "net-due-date", i.e. it made the same assumption the program makes |
| F10 | Comment says "currency conversion", code only updates a log table | F-07 | **Hit** (Unclassified, lines 38–41). A source comment helped — flag as such |
| F11 | Baseline dates after the key date give a negative age but land in `0-30` | — | Missed |

**Bonus hits: 1 / 5.**

## Extras (Bob findings not in the key)

| Bob | Rule | Lines | What it says | Proposed judgement |
|-----|------|-------|--------------|--------------------|
| F-08 | CC-09 | 8 | The program is a classic `REPORT` with `PARAMETERS` and `START-OF-SELECTION`; "has no place in ABAP Cloud". Bob itself notes there is no `WRITE`/`ULINE`/`SKIP`. | **Undecided — Sena to judge.** The observation is defensible (classic executable programs with a selection screen are not part of ABAP for Cloud Development), but CC-09 in the catalogue covers *list output* only, and this program has none. Under the counting rules this is *partially correct* at best (right observation, rule doesn't fit) or *incorrect* (rule misapplied). Either way it is not a hit; it only changes the precision denominator. |

## Verdicts

| | Answer key | Bob |
|---|---|---|
| Overall status | Needs target verification | Needs target verification ✔ |
| Draft verdict hint | Rebuild (D present: CC-05) | Rebuild ✔ |
| `verification_status` | never `verified_on_target` | 6 × `needs_verification`, 2 × `observed`, 0 × `verified_on_target` ✔ |
| Invented object names | none allowed | Candidate views (`I_OperationalAcctgDocItem`, `I_Supplier`) are labelled *candidate* and listed under unknowns ✔ |

## Numbers

- Core recall: **6 / 6**
- Bonus hits: **1 of 5** (the one hit had a comment pointing at it)
- Precision over decided findings: **7 / 7** if F-08 is excluded as
  undecided; **7 / 8** if Sena rules it incorrect or partially correct
- Duplicates: 0 · Undecided: 1 (F-08) · Incorrect: 0 so far

## What this run does not show

- Nothing was verified on an SAP system. Every "needs_verification" stays
  open until a target release is named and checked.
- One sample, one run. The other three samples have not been audited yet.
- Bob read `docs/clean-core-rules.md` in the same workspace, so the core
  numbers measure whether Bob applies a given catalogue, not whether it
  knows Clean Core on its own.
- The bonus misses (F7, F8, F9, F11) are business-logic defects. Bob's
  "what a human must still decide" list asks the right *category* of
  question (target release, field mapping) but does not spot these four.
