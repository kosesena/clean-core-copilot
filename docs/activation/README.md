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

### Class — activated

`abap_activate_objects` on `zcl_vendor_aging.clas.abap` → *Activation
successful.* The class was activated without its CDS source existing;
the ABAP SQL `SELECT … FROM ZI_VendorOpenItem_VAgeing` did not block
activation on this system (to be checked: whether the compiler resolves the
data source lazily or the trial's activation is lenient — not investigated).

### ATC — 0 findings

Default check variant, run `36C73C3C01F51FD1AEB5388BE54DD072`:
`ZCL_VENDOR_AGING` 0 findings, `ZI_VENDOROPENITEM_VAGEING` 0 findings. The
CDS result is not meaningful: an inactive object with parser errors has
nothing for ATC to check. The class result is meaningful for the checks in
the default variant only.

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
| Class activates | unverified | **activates on trial** |
| 7 unit tests pass | unverified | **not executed** (test include not confirmed in system) |
| ATC clean | unverified | class: 0 findings, default variant |
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
