# Parallel Modernisation Run

> **Overall status: Needs target verification**
> All three programs were modernised in a single parallel run (one sub-agent
> per program). Every object and field name marked `candidate` requires
> human verification against the Released Objects list (ADT "Released Objects"
> tree or api.sap.com) before any transport is raised.
> `verification_status` is `observed` or `needs_verification` throughout —
> nothing is `verified_on_target`.

---

## Run summary

| Program | Sub-agent identity | Files produced | Draft verdict hint |
|---|---|---|---|
| `ZSD_OPEN_ORDERS` | `zsd_open_orders_agent` | 4 | Rebuild |
| `ZMM_MASS_PRICE_UPDATE` | `zmm_mass_price_update_agent` | 4 | Rebuild |
| `ZCC_LEGACY_MATERIALS` | `zcc_legacy_materials_agent` | 4 | Rebuild |

---

## ZSD_OPEN_ORDERS — `modernized/zsd_open_orders/`

### Files produced

| File | Purpose |
|---|---|
| [`I_OpenSalesOrder.cds`](zsd_open_orders/I_OpenSalesOrder.cds) | CDS view entity — read side |
| [`zcl_open_orders.abap`](zsd_open_orders/zcl_open_orders.abap) | Business-logic class |
| [`zcl_open_orders_test.abap`](zsd_open_orders/zcl_open_orders_test.abap) | ABAP Unit tests |
| [`README.md`](zsd_open_orders/README.md) | Per-finding change log + human checklist |

### Key design decisions

- **CDS join**: three-way join over `I_SalesDocument` *(candidate)* →
  `I_SalesDocumentItem` *(candidate)* → `I_Customer` *(candidate)* (left
  outer for customer name). Sales-organisation filter is pushed to the ABAP
  consumer, keeping the view reusable.
- **Delivery-status stub**: no confirmed released CDS view for `VBUP-LFSTA`
  exists. The `WHERE SalesDocItem.DeliveryStatus <> 'C'` clause is present
  but the field name is marked `/* candidate */`. A commented-out
  `_DeliveryStatus` association skeleton documents the intent.
- **CamelCase alignment**: `ty_order` component names are identical to the
  CDS element names — `SELECT … INTO CORRESPONDING FIELDS` resolves without
  `AS` aliases.
- **`apply_sort_and_aggregate()`**: private method exposed as a FRIENDS
  friend. Unit tests call it with synthetic data; no DB access in tests.
- **`TotalNetAmount`**: computed via `REDUCE` over returned rows and stamped
  on every row (legacy `w_total` equivalent); not in the CDS view.
- **`display_stub()`**: replaces all `WRITE`/`ULINE`/`AT NEW` list output
  (findings F-15, F-16) with a clearly marked stub.
- **Tests**: 4 tests — fully-delivered item exclusion, total-value
  aggregation, sort order correctness, and `'C'` constant as a specification
  assertion.

### Unresolved items this sub-agent could not resolve

1. **VBUP delivery-status released CDS view** — no confirmed released entity
   covering `LFSTA` was found. The field path in the CDS WHERE clause is a
   `candidate`. This is the **largest open item** for ZSD.
2. **`SalesOrganization` field name** on `I_SalesDocument` — candidate; must
   be confirmed before the ABAP SQL WHERE clause works.
3. **`OrderQuantity` / `NetAmount` / `SoldToParty` / `SalesDocumentItem`
   element names** on the candidate views — all marked `candidate`.
4. **Delivery-status business rule**: exclude only fully delivered (`'C'`) or
   also partially delivered (`'B'`)? — human must decide.
5. **Output channel** (Fiori List Report vs. Application Job) — affects which
   pattern replaces `display_stub()`.

---

## ZMM_MASS_PRICE_UPDATE — `modernized/zmm_mass_price_update/`

### Files produced

| File | Purpose |
|---|---|
| [`I_MaterialValuation.cds`](zmm_mass_price_update/I_MaterialValuation.cds) | CDS view entity — read side |
| [`zcl_mass_price_update.abap`](zmm_mass_price_update/zcl_mass_price_update.abap) | Business-logic class |
| [`zcl_mass_price_update_test.abap`](zmm_mass_price_update/zcl_mass_price_update_test.abap) | ABAP Unit tests |
| [`README.md`](zmm_mass_price_update/README.md) | Per-finding change log + human checklist |

### Key design decisions

- **CDS source is a placeholder**: `I_MaterialStock` *(candidate)* is used as
  the `as select from` source because no confirmed released view for `MBEW`
  fields (`STPRS`, `VPRSV`, `BWKEY`, `MATNR`) was identifiable. The CDS header
  carries a prominent `Do NOT activate until confirmed` warning. Candidate
  alternative names noted: `I_MaterialValuation`, `I_ProductValuationData`.
- **`UPDATE mbew` and `CALL TRANSACTION MM02` completely removed**: replaced
  by `update_price_stub()` with skeleton comments for both EML and
  `BAPI_MATERIAL_SAVEDATA` *(candidate)* patterns.
- **`POPUP_TO_CONFIRM` removed**: replaced by `confirm_stub()` that returns
  `abap_true` unconditionally and documents the Fiori/batch alternatives.
- **F-08 price-control guard added** (was missing in legacy): the
  `test_friend_needs_price_control_guard()` method skips materials where
  `PriceControl <> 'S'`, preventing accidental `STPRS` updates on
  moving-average-price materials.
- **BDC path dropped entirely**: the two `FORM` subroutines and all
  `BDCDATA` infrastructure are gone; F-06 resolved.
- **Tests**: 6 tests — three price-formula boundary tests (10 %, 0 %, 50 %)
  and three price-control guard tests (`'V'` skipped, `'S'` allowed, `''`
  skipped).

### Unresolved items this sub-agent could not resolve

1. **Correct released CDS view for MBEW** — the **largest open item** for
   ZMM. `I_MaterialStock` may not expose `STPRS` or `VPRSV`. A human must
   identify the correct released entity on the target.
2. **Released API for standard-price update** — `BAPI_MATERIAL_SAVEDATA`
   and an unnamed RAP BO are both candidates; release status unverified.
3. **CO/Costing document requirement** — only the standard API (MR21
   equivalent) creates the costing document; human must confirm whether it
   is mandatory.
4. **VPRSV guard scope** — confirm whether all in-scope materials are
   standard-price-controlled, or mandate API-level enforcement.
5. **Authorization concept** — no authority-check exists in the legacy
   program; the modernized class defers to `@AccessControl: #CHECK` on the
   CDS view but write-side authorizations must be explicitly defined.

---

## ZCC_LEGACY_MATERIALS — `modernized/zcc_legacy_materials/`

### Files produced

| File | Purpose |
|---|---|
| [`I_MaterialByType.cds`](zcc_legacy_materials/I_MaterialByType.cds) | CDS view entity — read side |
| [`zcl_legacy_materials.abap`](zcc_legacy_materials/zcl_legacy_materials.abap) | Business-logic class |
| [`zcl_legacy_materials_test.abap`](zcc_legacy_materials/zcl_legacy_materials_test.abap) | ABAP Unit tests |
| [`README.md`](zcc_legacy_materials/README.md) | Per-finding change log + human checklist |

### Key design decisions

- **`TABLES mara` removed** (F-01): `ty_material` struct declared with
  `Material` and `MaterialType` component names matching the CDS elements
  exactly.
- **`SELECT-OPTIONS` removed** (F-02, Unclassified): caller passes
  `TYPE RANGE OF matnr` — the range table is built by the consumer (OData
  filter, method parameter, or Application Job variant).
- **`SELECT on MARA` replaced** (F-03): `select_materials()` queries
  `I_MaterialByType` which wraps `I_Product` *(candidate)*.
- **Both `WRITE` statements removed** (F-04, F-06): `run()` returns the
  empty table to the caller; `display_stub()` replaces
  `REUSE_ALV_GRID_DISPLAY` and sets `ev_subrc = 4`.
- **`REUSE_ALV_GRID_DISPLAY` removed** (F-05): replaced by `display_stub()`
  with a `TODO` comment directing the implementer to a Fiori Elements List
  Report OData V4 service.
- **Test-friend pattern**: `test_friend_apply_empty_guard()` returns input
  unchanged; tests use it and `display_stub()` — no DB access in tests.
- **Tests**: 4 tests — empty-result guard, two-row pass-through,
  `MaterialType` field preservation, and `display_stub` returning `ev_subrc = 4`.

### Unresolved items this sub-agent could not resolve

1. **`I_Product` release status and element names** — `Material` and
   `MaterialType` are candidate element names; neither has been confirmed
   against the Released Objects list. This is the **largest open item** for
   ZCC.
2. **MARA compatibility object** — if `I_Product` does not cover the
   required fields, an alternative compatibility view may exist; must be
   verified in the target simplification list.
3. **`REUSE_ALV_GRID_DISPLAY` deprecation level** — the audit flags it as
   non-released; whether it is hard-blocked or merely discouraged on the
   target must be confirmed.
4. **Intended call channel** — Fiori UI list report vs. background
   Application Job determines which replacement for `display_stub()` is
   correct.
5. **Authorization concept** — the legacy program has no explicit
   authority-check; the released API layer must define the correct
   authorization objects for material master reads.

---

## Cross-cutting observations

| Topic | Applies to | Note |
|---|---|---|
| Target product / release | All three | Still **unknown**. Every `candidate` comment is a blocker until this is provided. |
| `@AccessControl.authorizationCheck: #CHECK` | All CDS views | Set on all views; DCL rules must still be defined for each view. |
| Authorization concept | All three | None of the legacy programs had explicit authority-checks; the replacement classes defer to the CDS access control. Authorisation objects must be designed separately. |
| Execution trigger | ZSD, ZMM | Both need an execution trigger decision (Application Job via `CL_APJ_RT_API` *(candidate)*, Fiori Elements action, or OData action). |
| Integration stubs | ZSD (`display_stub`), ZMM (`confirm_stub`, `update_price_stub`, `display_result_stub`), ZCC (`display_stub`) | All stubs must be implemented before the modernised code is production-ready. `ev_subrc = 4` signals "not yet implemented" everywhere. |
| ABAP object naming | All three | Names (`ZCL_OPEN_ORDERS`, `ZCL_MASS_PRICE_UPDATE`, `ZCL_LEGACY_MATERIALS`, `I_OPEN_SALES_ORDER`, etc.) are proposals. Align with the customer naming convention and check for collisions before transport. |

---

*Generated by the Clean Core Copilot (Bob) — parallel run.
Three sub-agents: `zsd_open_orders_agent`, `zmm_mass_price_update_agent`,
`zcc_legacy_materials_agent`. All candidate object names require human
verification against the Released Objects list on the target system before
any code is transported.*
