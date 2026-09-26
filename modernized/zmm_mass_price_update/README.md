# ZMM_MASS_PRICE_UPDATE — Modernized Artefacts

> **Verification status: Needs target verification**
> No object or field name in this folder has been confirmed as released on the target system.
> All candidates are marked `/* candidate */` in the source files.
> Do **not** activate or transport any artefact until the open items below are resolved.

---

## Files in this folder

| File | Type | Purpose |
|---|---|---|
| `I_MaterialValuation.cds` | CDS view entity | Candidate replacement for direct `SELECT * FROM mbew`; wraps the (unconfirmed) released source view |
| `zcl_mass_price_update.abap` | ABAP OO class | Main business logic; replaces the `REPORT zmm_mass_price_update` monolith |
| `zcl_mass_price_update_test.abap` | ABAP Unit test class | Isolated unit tests for pure business-logic methods (no DB, no stub calls) |
| `README.md` | Documentation | This file |

---

## What changed

### F-01 · CC-08 — `CALL FUNCTION 'POPUP_TO_CONFIRM'` removed

**Legacy lines 22–27.** `POPUP_TO_CONFIRM` is not released for ABAP Cloud use, and GUI interactions are not permitted in Clean Core.

**Replacement:** `confirm_stub()` in `zcl_mass_price_update`.  
The stub returns `abap_true` unconditionally.  A human must replace it with either a Fiori Elements action-confirmation step (if the mass run is triggered from a UI) or remove it entirely for background-job scenarios.

---

### F-02 · CC-01 — `SELECT * FROM mbew` replaced

**Legacy line 29.** Direct access to the unreleased SAP table `MBEW` is not permitted.

**Replacement:** `select_materials()` in `zcl_mass_price_update` reads from the CDS view entity `I_MaterialValuation` (this folder).  
The candidate source for that view is `I_MaterialStock`; the correct released view must be verified on the target — see open item 2 below.

---

### F-03 · CC-03 (Level D) — `UPDATE mbew` removed

**Legacy lines 34–36.** Direct SAP table updates are prohibited at the strictest Clean Core enforcement level.

**Replacement:** `update_price_stub()`.  
The stub signals `ev_subrc = 4` (not-yet-implemented) so callers can log or skip.  
Replace the stub body with either EML (`MODIFY ENTITY`) targeting the released RAP BO, or `BAPI_MATERIAL_SAVEDATA` — both are candidates pending verification.

---

### F-04 · CC-04 (Level D) — `CALL TRANSACTION 'MM02'` with BDC removed

**Legacy lines 40–47 (BDC path under `p_bdc` checkbox).** BDC / `CALL TRANSACTION` are not ABAP Cloud patterns.

**Replacement:** Same `update_price_stub()` as F-03. The `p_bdc` checkbox parameter and all `PERFORM bdc_dynpro` / `PERFORM bdc_field` logic have been removed.  The BDC path cannot be reintroduced in ABAP Cloud code.

---

### F-05 · CC-09 — `WRITE` list output removed

**Legacy line 49.** `WRITE` / `ULINE` / `SKIP` list processing is not permitted in ABAP Cloud.

**Replacement:** `display_result_stub()`.  
The stub does nothing and returns `ev_subrc = 0`.  Replace with ALV Grid (`CL_SALV_TABLE`) for interactive use, an Application Log (`CL_BALI_LOG`) for batch, or a Fiori Elements table display.

---

### F-06 · CC-11 — `FORM bdc_dynpro` / `FORM bdc_field` subroutines removed

**Legacy lines 51–64.** Subroutines (`FORM` / `ENDFORM`) are obsolete in ABAP Cloud.

**Replacement:** All BDC-building logic has been removed entirely (the BDC path itself is gone — see F-04).  No `FORM` statements appear in the modernized code.

---

### F-07 · CC-10 — `TYPE TABLE OF mbew`, `TYPE mbew`, `TYPE c` replaced

**Legacy lines 10–14.** These types couple the program to the unreleased `MBEW` dictionary structure.

**Replacement:** Local types `ty_valuation`, `ty_valuations`, `ty_result`, `ty_results` in `zcl_mass_price_update`.  CamelCase component names (`Plant`, `Material`, `StandardPrice`, `PriceControl`) match the CDS element names exactly so that `SELECT … INTO CORRESPONDING FIELDS` resolves without `AS` aliases.  All field types are marked `/* candidate */` until the released view is confirmed.

---

### F-08 · Unclassified — Missing price-control guard added

**Legacy had no guard.** Materials with `VPRSV = 'V'` (moving-average price control) must not have `STPRS` updated directly; only materials with `VPRSV = 'S'` (standard price) are eligible.

**Replacement:** `test_friend_needs_price_control_guard()` in `zcl_mass_price_update` returns `abap_true` (skip) for any `PriceControl` value that is not `'S'`.  This guard is called inside `run()` before `update_price_stub()`.  Six unit tests in `zcl_mass_price_update_test` verify the formula and guard logic.

---

## What a human must still decide

1. **Target product and release** — which SAP S/4HANA Cloud (public or private) release is the deployment target?  ABAP Cloud enforcement levels and available released APIs vary by release.

2. **Exact released CDS view covering MBEW fields (STPRS, VPRSV, BWKEY, MATNR)** — this is the **biggest open item**.  `I_MaterialStock` is used as the candidate source in `I_MaterialValuation.cds` but may not expose `STPRS` or `VPRSV`.  Verified candidates to check in the target system include `I_MaterialValuation`, `I_ProductValuationData`, or a similar entity in the Material Management released APIs.  The CDS view in this folder **must not be activated** until the correct source is confirmed and all field names are validated.

3. **Released API for standard-price update** — the `update_price_stub()` must be replaced with one of:
   - A RAP Business Object EML statement (`MODIFY ENTITY …`) targeting the released BO for material valuation — BO name is a candidate, verify in the target system.
   - `BAPI_MATERIAL_SAVEDATA` — candidate; verify release status and whether it is available in the target ABAP Cloud tier.
   Both options must be tested end-to-end in a sandbox before go-live.

4. **Whether a CO/Costing document (MR21 equivalent) is required** — a direct `UPDATE mbew` bypasses all FI/CO posting logic.  Only a released standard API (RAP BO or BAPI) creates the necessary Material Ledger / Costing document.  Confirm with the finance and controlling teams whether document creation is mandatory for audit / reconciliation.

5. **Confirmation mechanism** — the legacy `POPUP_TO_CONFIRM` has been replaced by a stub that always returns confirmed.  Decide whether the mass run needs:
   - A Fiori Elements action-step confirmation (for interactive UI use), or
   - No confirmation gate at all (for scheduled background job use, where confirmation is implied by the job schedule).

6. **`p_bdc` checkbox / BDC path** — the BDC code path (CALL TRANSACTION MM02) has been removed entirely.  Confirm with the business that this path can be dropped.  If any users relied on BDC audit trails produced by the old path, an alternative audit mechanism (Application Log) must be designed.

7. **VPRSV guard scope** — confirm with the business and materials-management team that all materials in scope are under standard-price control (`VPRSV = 'S'`).  If moving-average-price materials (`VPRSV = 'V'`) must also be updated, a different API call and a different field (`VERPR` instead of `STPRS`) are required.

8. **Authorization concept for mass price changes** — the legacy report used standard selection-screen authority checks.  The modernized class needs an explicit authorization check (e.g., `AUTHORITY-CHECK OBJECT 'M_MSEG_BWA'` or equivalent released check via `CL_AUTH_OBJECTS_CHECK` /* candidate */) before invoking `update_price_stub`.  The authorization object and the correct ABAP Cloud API for the check must be confirmed.

9. **ABAP object naming alignment** — names in this folder (`I_MaterialValuation`, `zcl_mass_price_update`, `zcl_mass_price_update_test`) follow a working naming convention but must be reviewed against the target namespace, customer namespace prefix rules, and any naming conventions mandated by the target system's transport landscape before activation.
