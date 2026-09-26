# Activation attempt — ZFI_VENDOR_AGING rewrite on SAP BTP ABAP Environment (trial)

**When:** 26 Sep 2026, 15:10–16:00 TRT.
**System:** SAP BTP ABAP Environment, trial, us10 (shared trial system,
destination `BTP_TRIAL2`), package `ZSKOSE_LAB` under `ZLOCAL`, language
version ABAP for Cloud Development, no transport recording. This is a
customer-side trial, not an S/4HANA Cloud tenant — the released-API
catalogue differs.
**Who did what:** the empty objects were created through the SAP ADT MCP
server (`abap_creation-create_object`, called by Claude Code); the source
was pasted into them in VS Code by Codex; activation, ATC and ABAP Unit were
run through the same MCP server (`abap_activate_objects`, `abap_atc_run`,
`abap_run_unit_tests`). Bob was not involved in this step.

## Files pasted

Copies of `modernized/zfi_vendor_aging/` with three trial-specific changes
(diffs in the commit that added this folder):

| System object | Source file here | Change vs. Bob's file |
|---------------|------------------|------------------------|
| `ZI_VENDOROPENITEM_VAGEING` (DDLS) | `ZI_VENDOROPENITEM_VAGEING.ddls.asddls` | entity renamed `I_…` → `ZI_…` (customer namespace) |
| `ZCL_VENDOR_AGING` (CLAS) | `ZCL_VENDOR_AGING.clas.abap` | `FROM ZI_…`; `FRIENDS ltc_vendor_aging` |
| `ZCL_VENDOR_AGING` test include | `ZCL_VENDOR_AGING.clas.testclasses.abap` | global test class → local test class `ltc_vendor_aging` |

Bob's logic, comments and `candidate` markers are unchanged.

## Results

### CDS view entity — NOT activated

```
zi_vendoropenitem_vageing.ddls.acds
  - The data source "I_OperationalAcctgDocItem" does not exist or is not active [Ln 32, Col 18]
  - The data source "I_Supplier" does not exist or is not active [Ln 35, Col 16]
  (SDDL_PARSER_MSG(004), both)
```

Exactly the two objects Bob marked *candidate* in the CDS header. On this
trial system they do not exist at all; on an S/4HANA Cloud tenant they may
exist and may or may not be released — which is what "verify on target"
meant. The other candidates (`NetDueDate`, `IsCleared`, `AccountType`,
`AmountInCompanyCodeCurrency`, `SupplierName`) could not be checked because
the parser stops at the missing sources.

### Class — first result withdrawn

`abap_activate_objects` on `zcl_vendor_aging.clas.abap` at 15:58 →
*Activation successful.* **Withdrawn at 16:19:** Codex found that the
system object still held the empty skeleton at that time; the paste had not
reached the system. An empty class activates trivially, so this result said
nothing about Bob's code. (It also explains why "activation succeeded
without the CDS source" looked odd.) The class (224 lines) and test include
(217 lines) were then pasted for real.

Second attempt, 16:22, with the real source:

```
zcl_vendor_aging.clas.abap
  - Type "LTC_VENDOR_AGING" is unknown. [Ln 5, Col 11]
```

Cause: my activation copy, not Bob's code. Naming a local test class in
`FRIENDS` needs `CLASS ltc_vendor_aging DEFINITION DEFERRED.` before the
global class. Added to `ZCL_VENDOR_AGING.clas.abap` here; to be applied in
the system and re-run.

Third attempt, 16:58 (Codex had put the `DEFERRED` line into the
definitions include):

```
zcl_vendor_aging.clas.abap
  - Only the addition "GLOBAL FRIENDS" exists for PUBLIC classes, not the addition "FRIENDS" addition. [Ln 1, Col 1]
```

This one is **not** a copy artefact: Bob's original class also declares
`FRIENDS zcl_vendor_aging_test` on a `PUBLIC` class, which ABAP rejects.
Bob's file would not have activated either. Recorded as a Bob defect in
the modernization output (syntax, not logic). Fix in the copy: the
friendship moved to the test include as
`CLASS zcl_vendor_aging DEFINITION LOCAL FRIENDS ltc_vendor_aging.`;
the definitions include is empty again (commit `bfd8a2d`; Codex applied
it in the system at 17:1x).

Fourth attempt, 21:2x, after re-logon (the BTP session had expired):

```
zcl_vendor_aging.clas.abap
  - "ZI_VENDOROPENITEM_VAGEING" is not declared as a table, projection view, or database view ... or does not exist in an active version. [Ln 146]
  - "ZFI_AGING_LOG" is not declared ... or does not exist in an active version. [Ln 182]
  warnings:
  - ABAP Doc comment is in the wrong position. [Ln 6]
  - The old variant of "SY-DATUM" should not be used in the current ABAP language version. [Ln 43, 71, 95, 110, 112]
```

The class source itself now passes; what blocks it are the two objects
it depends on: Bob's CDS view (inactive, see above) and the `ZFI_AGING_LOG`
table Bob assumed as "customer-owned". The `SY-DATUM` warnings are a
further ABAP-Cloud finding against Bob's rewrite (`sy-datum` → 
`cl_abap_context_info=>get_system_date( )` in the cloud language version).

### Decision: trial stubs (21:1x, Sena)

To run the seven tests the class has to compile, so two test doubles were
added on the trial — see `stubs/README.md`. They prove the class logic,
not the SAP integration; the CDS failure above stays the integration
result. Tables created empty through the ADT MCP server
(`abap_creation-create_object`); sources pasted by Codex.

### ATC — 0 findings, on the empty skeleton

Default check variant, run `36C73C3C01F51FD1AEB5388BE54DD072`, 15:58:
`ZCL_VENDOR_AGING` 0 findings, `ZI_VENDOROPENITEM_VAGEING` 0 findings.
Neither result is meaningful: the CDS is inactive with parser errors, and
the class was still the empty skeleton (see above). To be re-run after the
real source activates.

### ABAP Unit — not executed

`abap_run_unit_tests` twice: *No executable tests found.* The test include
was activated (`Activation successful` on `…clas.testclasses.abap`), but the
system reports no `FOR TESTING` methods. At the time of writing it is not
confirmed that the local test class source was actually saved into the
system's test include (the VS Code tab that was open showed the local copy
under `docs/activation/`, not the system object). Open item — see below.

## What this changes in the project's claims

| Claim | Before | After |
|-------|--------|-------|
| CDS view activates | unverified | **fails on trial**: 2 missing data sources, both pre-marked candidate |
| Class activates | unverified | **not yet** — first result was on an empty skeleton; real source blocked by a missing `DEFINITION DEFERRED` line in the activation copy |
| 7 unit tests pass | unverified | **not executed** (test include not confirmed in system) |
| ATC clean | unverified | not meaningful yet (ran on the empty skeleton) |
| R3 (field-name mismatch) fixed | fixed by reading | still by reading; the SELECT was not exercised against a real view |

Overall status stays **Needs target verification**: the trial is not the
customer's target release, and the read side did not activate.

## Open

- Paste `ZCL_VENDOR_AGING.clas.testclasses.abap` into the system's test
  include (Classes → ZCL_VENDOR_AGING → Test Classes), save, activate, and
  re-run `abap_run_unit_tests`. The seven tests need no database, so they
  can pass without the CDS.
- Optionally stub the read side (a local CDS over a Z table, or a test
  double) to exercise `select_open_items` — out of hackathon scope.
