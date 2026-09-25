# Clean Core Copilot

**Legacy ABAP → S/4HANA Cloud, with the reasoning shown.** Built with IBM Bob
for the IBM Bob 2.0 Hackathon (lablab.ai, Sep 2026).

> **Status:** preparation. No Bob execution, SAP connectivity, ATC run or
> measured result is claimed yet. Findings are advisory until checked on a
> target system — see [`docs/verification-notes.md`](docs/verification-notes.md).

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

**Pending:** the demo prototype includes IBM's Bob mascot artwork and an
animated greeting (`demo-prototype/assets/`). Permission to use them has been
requested from IBM through the organisers. If it isn't confirmed, they will be
removed before submission.

## How Bob is used

<!-- Fill in during the hackathon: modes used, rules, screenshots. -->

- Custom mode: …
- Plan → Code workflow: …
- Session reports: [`bob_sessions/`](bob_sessions/)

## Results

<!-- Measured, not claimed: findings reviewed by hand. -->

| Program | Findings | Correct | Wrong | Missed | Verdict hint |
|---------|----------|---------|-------|--------|--------------|
| ZSD_OPEN_ORDERS | | | | | |
| ZFI_VENDOR_AGING | 8 | 6 core + 1 bonus | 0 (1 undecided) | 4 bonus | Rebuild — see [`docs/scoring/zfi_vendor_aging.md`](docs/scoring/zfi_vendor_aging.md) |
| ZMM_MASS_PRICE_UPDATE | | | | | |
| ZCC_LEGACY_MATERIALS | | | | | |

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
