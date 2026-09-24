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
| ZFI_VENDOR_AGING | | | | | |
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
