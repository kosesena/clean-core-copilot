# Demo UI brief — v1, 26 Sep 2026

Owner of the implementation: Codex (`demo-prototype/`). Author of this
brief: Claude, from Sena's choices on the evening of 25 Sep. Sena decides;
this file records what was decided so both agents build the same thing.

## Decisions taken

| Question | Decision |
|----------|----------|
| Theme | **Cream page, dark code.** Page background cream (`#F6F1E7`), cards white, one accent (bordo `#6B1F2A`). Every code box is dark (`#0B1F1B`) with the existing severity colours inside. No dark pages. |
| Type | Serif for headlines and big numbers (Fraunces or the serif already in `atelier.css`), IBM Plex Sans for body, IBM Plex Mono for code and object names. Two weights only. |
| Home layout | **Option A, "numbers first"**: 4 metric cards → program selector → findings table. Bob mascot slot top-right with a one-line speech bubble. |
| Site structure | One site, four pages, one shared top nav: **Overview · Findings · Before / after · Evidence**. |
| Codex's concepts | Sena likes **5 · Evidence Atlas** and **6 · Dossier**. Take the Atlas grid (numbered stage columns, dashed "Not performed" cells, "Next evidence needed" panel) into the Evidence page; take the Dossier's left program cards and right-hand "Open questions + Review decision" column into the Findings page. |
| Mascot | `SHOW_MASCOT` stays `false` until IBM answers (asked via Hamza, 25 Sep 19:31). Every mascot position is a fixed-size slot that renders empty/neutral when the flag is off. No new mascot media. |
| Scores | Every number that comes from `docs/scoring/` carries the label **"Claude assessment · awaiting Sena"** until Sena confirms. Answer-key matches are shown in their own column/row, never merged into Bob's raw finding. |
| Wording | "Not performed", never "on purpose". "Recorded output · not a live analyzer" stays visible on every page. "Needs target verification" is the only overall status until a target exists. |

## Pages

### 1 · Overview (`index.html`, top of page)

Reference: Claude canvas board 1 (option A).

1. Top nav: logo mark "C", "Clean Core Copilot", "built with IBM Bob", nav links.
2. Headline (serif): *Legacy ABAP, audited. Every claim, labelled.* Three pills under it: Recorded output · Nothing verified on a target · Answer key frozen 24 Sep.
3. Mascot slot + speech bubble, right of the headline (bubble text is copy, not data).
4. Four metric cards: Catalogue rules found `27 / 29` · Business-logic defects `1 / 12` · Duplicates `6 / 40` · Bobcoin used `1.5 / 40`. Each card has a one-line footnote; the first reads "Claude assessment · awaiting Sena". Source: `docs/scoring/zcc_legacy_materials.md` totals table (hard-coded for now; a `scoring.json` later).
5. Program selector: four mono pills, count of findings on each, active one filled. Right side: overall status + draft verdict hint of the selected program.
6. Findings table for the selected program: ID · Rule · Evidence (statement + line range, mono) · Status pill · Answer key column (✓ match / ✓ bonus / ? undecided / ✗ proposed incorrect). Rows link to the Findings page with that finding selected.
7. Footer line: "Scored against a frozen answer key for synthetic samples · docs/scoring" + "Open all findings →".

### 2 · Findings (`index.html`, finding view)

Reference: Claude canvas board 2 + Codex 4 (Review Desk) + Codex 6 (Dossier right column).

Three columns, 236 / flex / 380:
- Left: program cards (Dossier style: name, one-line status, chevron), totals block at the bottom with the "Claude assessment" label.
- Middle: file name in serif, **dark code box** with line numbers, finding rows highlighted by severity (D red, C green, syntax/unclassified grey) and a pill at the end of the first line of each finding (`F-03 · CC-05 · D`). Legend under the box. Clicking a pill selects the finding.
- Right: finding card — ID, rule, level pill, status pill; Bob's reason; "Suggested action" as a small dark code box; "Unknowns Bob left open" list; separator; answer-key line ("✓ matches F3 · CC-05 · 39–41 · Claude assessment"); three review buttons **Correct / Wrong / Undecided** (existing review overlay; add "Partially correct" only if the overlay supports it); footnote "Review decisions export separately from Bob's raw JSON."

### 3 · Before / after (`walkthrough.html`)

Reference: Claude canvas board 4 + existing case viewer.

- Header: "ONE PROGRAM · ZFI_VENDOR_AGING", serif title *A change you can inspect*, pills "Recorded · unverified" and "Bob task 5 · 0.807 Bobcoin".
- Two columns with an arrow between: legacy excerpt (light code box, finding lines tinted) ↔ Bob's proposal (light green-tinted code box). Under each, pills: finding IDs on the left; on the right ✓ no native SQL · ✓ no file system · candidate table name · **review R3 · field names** (from `docs/scoring/zfi_vendor_aging_modernization.md`).
- Footer: mascot slot small + "7 ABAP Unit tests written · 0 executed · activation, ATC and test records: none yet"; buttons Attach ATC log · Attach ABAP Unit log · Export case (existing case bundle).

### 4 · Evidence (`index.html`, evidence tab, or its own page)

Reference: Codex 5 (Evidence Atlas) + Claude canvas board 3.

- Serif title *What was done, and what was not*; mascot slot small with the line "Every empty cell is a claim we chose not to make."
- Grid 4 programs × 4 numbered stages: **1 Audit · 2 Scored against key · 3 Modernized · 4 Verified on target.** Filled cells green (recorded), blue (code produced · review open), amber (partial: ZCC 4/5), dashed grey "Not performed" / "Not started". Cell text: what + cost/time, two lines max.
- Under the grid (Atlas idea): two panels, "Selected program" and "Next evidence needed: Activation · ATC · ABAP Unit — No execution records attached."
- Legend + footer label.

## Data sources (no new data, no invented numbers)

| On screen | From |
|-----------|------|
| Findings, reasons, unknowns, status | `reports/<program>.json` (unchanged, schema-validated) |
| Answer-key column, totals, proposed judgements | `docs/scoring/*.md` (hand-copied for now) |
| Modernization pills, R-findings | `docs/scoring/zfi_vendor_aging_modernization.md` |
| Before/after code | `samples/legacy/zfi_vendor_aging.abap`, `modernized/zfi_vendor_aging/` |
| Bobcoin per task | `bob_sessions/*.png` badges (0.165 / 0.155 / 0.187 / 0.154 / 0.807) |

## Keep from the current prototype

- Four-report import and selector, review overlay export/import (`clean-core-review-bundle-v1`), case bundle (`clean-core-case-v1`), the "recorded, not live" notices, `SHOW_MASCOT` flag in `demo-config.js`, no external scripts/fonts other than Google Fonts for Fraunces/Plex (or bundle them under `assets/`).

## Out of scope for the hackathon

- Live analysis, SAP connectivity, any claim of activation. Charts beyond the four cards. Dark page theme. New mascot media.

## Video use

The four pages are the four beats of the demo video: Overview (the numbers) → Findings (Bob marks the line, we compare with the key) → Before / after (the rewrite, what a human still decides) → Evidence (what was and wasn't done). Real Bob screenshots from `bob_sessions/` cut in between.

## Open

- Hamza / IBM answer on the mascot.
- Sena's confirmation of the proposed judgements (ZFI F-08, ZSD F-11/F-18, ZMM F-07/F-08, ZCC F-02).
- Whether BTP_TRIAL activation happens (would fill stage 4 for ZFI).
