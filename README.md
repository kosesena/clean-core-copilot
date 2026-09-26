# Clean Core Copilot

**Legacy ABAP → S/4HANA Cloud, with the reasoning shown.** Built with IBM Bob
for the IBM Bob 2.0 Hackathon (lablab.ai, Sep 2026).

> **Status:** four Bob audit runs recorded (25 Sep 2026), scored against an
> author's answer key for synthetic samples — see [`docs/scoring/`](docs/scoring/).
> One rewrite was pushed to a BTP ABAP trial system on 26 Sep: the class
> activated (ATC 0 findings), the CDS view did not — its two consumed views
> are missing there, exactly the ones Bob had marked *candidate*
> ([`docs/activation/`](docs/activation/)). Findings stay advisory until
> checked on the customer's target — see
> [`docs/verification-notes.md`](docs/verification-notes.md).

## The problem

Companies moving to S/4HANA Cloud carry thousands of custom Z programs written
over 15+ years. Each one has to be checked against Clean Core rules: which
tables it reads directly, which screens it replays, which files it writes.
Today that review is manual, slow, and done by the few people who know both
the old and the new world.

## What it does

A Bob custom mode, **Clean Core Architect**, that:

1. **Audits** a legacy ABAP program line by line against a fixed rule
   catalogue ([`docs/clean-core-rules.md`](docs/clean-core-rules.md)). Every
   finding cites a rule ID, the line, and the released alternative.
2. **Marks what is verified and what isn't** — every finding carries a
   `verification_status`; without a known target release the overall status
   is *Needs target verification*, with Ready / Refactor / Rebuild only as a
   planning hint.
3. **Modernizes** on approval: CDS view entities over released views, RAP/EML
   for writes, and ABAP Unit tests that pin the legacy business rules.
4. **Lists what a human must still decide** — it does not pretend to know
   what it can't verify.

## Prepared before the hackathon

The kick-off was 25 September 2026, 18:00 TRT (15:00 UTC). The organisers
confirmed that pre-prepared synthetic sample code and demo UI templates may be
used *"as long as they are clearly disclosed in your repository and all the
core Bob analysis and project logic are built during the hackathon"* (Hamza,
lablab.ai — `#participants-chat-ibm-bob-2-0-hackathon`, 25 Sep 2026, 19:37 TRT).

Everything below existed before the kick-off. Commit dates are in the git
history.

| What | Where | Prepared | Notes |
|------|-------|----------|-------|
| Four synthetic legacy Z programs | `samples/legacy/` | 24 Sep | Written for this demo, no customer code. Audit input, never edited. |
| Clean Core rule catalogue | `docs/clean-core-rules.md` | 24 Sep | CC-01 … CC-12, the fixed rules Bob audits against. |
| Verification rules and findings schema | `docs/verification-rules.md`, `docs/findings.schema.json` | 24 Sep | Output format Bob has to follow. |
| Draft of the custom mode and first task | `bob-config-draft/` | 24 Sep | Written without Bob 2.0 access. To be moved into Bob's real mode format during the hackathon; any change to the wording is visible in the git history. |
| Answer key (baseline) | kept outside the repo | 24 Sep | The issues planted in the samples, written by the sample author, not an independent review. Only its SHA-256 is published, in `docs/freeze.sha256`, so it can't be changed after Bob's results are seen. |
| Freeze and audit-workspace scripts | `scripts/` | 24 Sep | Bob runs on an isolated copy with no plan, notes or answer key. |
| Demo UI (findings viewer, case viewer) | `demo-prototype/` | 24–25 Sep | Built with Codex. Shows recorded output only; contains no Bob results. |
| Plan, presentation outline, verification notes | `docs/` | 24 Sep | Working notes. |

The frozen inputs (`docs/freeze.sha256`, 24 Sep 16:37 UTC) cover the samples,
rules, schema, mode draft and baseline.

**Built during the hackathon:** the Bob custom mode in its final form, every
Bob audit and modernization run, `reports/`, `modernized/`, `bob_sessions/`,
the measured results table, and the demo content that shows them.

**Mascot:** the demo shows IBM's Bob artwork (`demo-prototype/assets/ibm-bob.webp`,
from bob.ibm.com, unchanged, IBM's property). Permission to use it was asked
of IBM through the organisers on 25 Sep 2026 (Discord, Hamza / lablab.ai,
reminder 26 Sep); no answer had arrived when the static image was enabled on
26 Sep. The animated greeting stays disabled. If IBM objects, the image is
removed with one flag (`SHOW_MASCOT` in `demo-prototype/demo-config.js`).

## How Bob is used

Everything Bob did happened in IBM Bob 2.2.0 (enterprise plan, hackathon
account) between 25 Sep 20:10 and 26 Sep 16:28 TRT. One screenshot per task
with the consumption badge is in [`bob_sessions/`](bob_sessions/).

**Custom mode.** Bob's Settings → Modes → *Create new mode* form was used to
define **Clean Core Architect** (slug `clean-core-architect`, global scope).
Role, "when to use" and the nine custom instructions were typed from the
pre-event draft in [`bob-config-draft/`](bob-config-draft/); the wording is
the same, the wrapper is Bob's. Tools enabled: **Read** and **Edit** only —
no Execute, Browser, MCP, Subagent or Todo. That was deliberate: the audit
should be reproducible from reading, and nothing should reach a system.

**Workspace isolation.** Bob never opened this repository. It worked in
`~/Desktop/ccc-bob-audit`, built by
[`scripts/make-audit-workspace.sh`](scripts/make-audit-workspace.sh) from the
frozen inputs only (samples, rule catalogue, verification rules, schema,
mode draft). No `.git`, no plan, no answer key. The script refuses to build
if the inputs don't match the committed `docs/freeze.sha256`.

**Tasks.** Seven tasks, all in the custom mode, one prompt each. Tasks 1–6:
every file write approved by hand. Task 7: sub-agent spawns and file writes
approved for the task as a whole, files reviewed afterwards:

| # | Task | Prompt | Output | Bobcoin |
|---|------|--------|--------|---------|
| 1 | Audit ZFI_VENDOR_AGING | [`bob-config-draft/first-task.md`](bob-config-draft/first-task.md) with output paths spelled out | `reports/zfi_vendor_aging.{json,md}` | 0.165 |
| 2 | Audit ZSD_OPEN_ORDERS | same template | `reports/zsd_open_orders.*` | 0.155 |
| 3 | Audit ZMM_MASS_PRICE_UPDATE | same template | `reports/zmm_mass_price_update.*` | 0.187 |
| 4 | Audit ZCC_LEGACY_MATERIALS | same template | `reports/zcc_legacy_materials.*` | 0.154 |
| 5 | Modernize ZFI_VENDOR_AGING | audit JSON named as approved input; CDS + class + ABAP Unit + README requested | `modernized/zfi_vendor_aging/` | 0.807 |
| 6 | Fix review findings R3, R1 | the review's wording, one consistent naming approach requested | four diffs in `modernized/zfi_vendor_aging/` | 1.03 |
| 7 | Modernize ZSD, ZMM, ZCC **in parallel** | one prompt: one sub-agent per program, same recipe as ZFI, R3 lesson stated | 13 files in `modernized/`, `PARALLEL_RUN.md` | 1.76 |

Total **≈4.3 of 40 Bobcoin**. Audits cost 0.15–0.19 each; producing code
cost five times an audit; a follow-up cost as much as the original because
Bob re-reads every file it touches; three programs in parallel cost 0.59
each, about a quarter less than one alone, in a third of the time.

**What Bob's features did and didn't do here.**
- *Document understanding:* each task started with Bob reading the catalogue,
  the verification rules and the JSON schema, then the sample. The reports
  cite rule IDs from the catalogue only — the mode's "never invent a rule ID"
  instruction held in all 40 findings, though two stretched a rule
  (`docs/scoring/`).
- *Agent mode with approvals:* Bob proposed each write; 18 approvals were
  given (two per audit, six in task 5, four in task 6), none rejected. In task 5 Bob noticed that its test class called a
  method that did not exist, added `FRIENDS` and a wrapper, and applied the
  fix as two diffs before finishing — a self-correction the screenshot in
  `bob_sessions/2026-09-25_task5_*.png` records.
- *Sub-agents (parallel):* used in task 7. The mode's tool list was
  changed on 26 Sep 16:08 to add **Subagent** and **Todo** (still no
  Execute, Browser or MCP); Bob then modernized three programs at once, one
  sub-agent each, 16 minutes, 1.76 Bobcoin. The four audits had run one
  after another on purpose, so that each consumption figure and screenshot
  belongs to one program. Review: `docs/scoring/parallel_modernization.md`.
- *Execute / MCP:* **not used.** Bob never compiled, activated or ran
  anything. Every "verified" field in its output is `observed` or
  `needs_verification`; `verified_on_target` never appears.

**What was not Bob.** The rule catalogue, samples, answer key and demo page
were prepared before the kick-off (disclosed above). The scoring in
`docs/scoring/` was done by Claude Code, reading Bob's JSON against the
answer key; the demo page was built by Codex. Sena directed both, made the
disclosure and mascot decisions, and approved each Bob write.

## Results

<!-- Measured, not claimed: findings reviewed by hand. -->

| Program | Findings | Correct | Wrong | Missed | Verdict hint |
|---------|----------|---------|-------|--------|--------------|
| ZSD_OPEN_ORDERS | 18 (5 duplicates) | 11 core + 1 extra | 1 (proposed) | 1 core + 3 bonus | Rebuild (key says Refactor) — see [`docs/scoring/zsd_open_orders.md`](docs/scoring/zsd_open_orders.md) |
| ZFI_VENDOR_AGING | 8 | 6 core + 1 bonus | 0 (1 undecided) | 4 bonus | Rebuild — see [`docs/scoring/zfi_vendor_aging.md`](docs/scoring/zfi_vendor_aging.md) |
| ZMM_MASS_PRICE_UPDATE | 8 | 6 core + 1 extra | 1 (proposed) | 3 bonus | Rebuild — see [`docs/scoring/zmm_mass_price_update.md`](docs/scoring/zmm_mass_price_update.md) |
| ZCC_LEGACY_MATERIALS | 6 (1 duplicate) | 4 core + 1 extra | 0 | 1 core (runtime) + 1 bonus | Rebuild (key says Refactor) — see [`docs/scoring/zcc_legacy_materials.md`](docs/scoring/zcc_legacy_materials.md) |

Totals across the four audits: core recall 27 / 29, bonus 1 / 12, 40 raw
findings of which 6 are duplicates, 0.66 Bobcoin.

**Modernization (ZFI_VENDOR_AGING, task 5):** CDS view entity, class, ABAP
Unit tests and per-finding README in
[`modernized/zfi_vendor_aging/`](modernized/zfi_vendor_aging/), 0.807
Bobcoin. Reviewed by reading only — see
[`docs/scoring/zfi_vendor_aging_modernization.md`](docs/scoring/zfi_vendor_aging_modernization.md):
verification discipline intact, one probable activation error (CDS element
names vs. class field names), one data-model gap (no item number in the
key), one legacy bug carried over. A follow-up task (26 Sep, 1.03 Bobcoin)
fixed the first two by reading; the legacy bug is left as is.

**Activation attempt (26 Sep, BTP ABAP Environment trial):** the CDS view
did not activate — its two consumed views, `I_OperationalAcctgDocItem` and
`I_Supplier`, do not exist on the trial system (exactly the two Bob had
marked *candidate*). The class activated; ATC reported 0 findings; the ABAP
Unit run is pending. Messages and method in
[`docs/activation/README.md`](docs/activation/README.md). The trial is not
the customer's target release, so the status stays *Needs target
verification*.

## Repo layout

```
samples/legacy/   synthetic legacy Z programs (the input, never edited)
docs/             rule catalogue, verification notes, findings schema, plan
reports/          Bob's audit output (JSON per docs/findings.schema.json + MD)
modernized/       Bob's cloud-ready rewrite
bob_sessions/     exported Bob task reports (required for judging)
```

The legacy samples are synthetic, written for this demo. No customer code.

## Demo page

The demo URL renders the recorded `reports/*.json` files: Bob's output plus
the human review columns. It is an evidence page, not a live analyzer —
re-running the audit happens in Bob.

## Author

Sena Köse — SAP ABAP intern @ NTT DATA, Fırat University Software Engineering.
