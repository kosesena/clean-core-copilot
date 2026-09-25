# Audit Report — ZMM_MASS_PRICE_UPDATE

**Source file:** `samples/legacy/zmm_mass_price_update.abap`  
**Target:** ABAP for Cloud Development · Product: unknown · Release: unknown  
**Overall status:** Needs target verification  
**Draft verdict hint:** Rebuild *(two Level-D findings present)*

---

## What the program does for its user

`ZMM_MASS_PRICE_UPDATE` is a classic ABAP report used once a year by the **costing team**.  
It raises the **standard price (STPRS)** of every material in a chosen plant (`P_WERKS`) by a
given percentage (`P_PCT`).

Execution flow:

1. **Confirmation popup** — asks the user "Really update all prices?" before doing anything.
2. **Read valuation data** — fetches all rows from `MBEW` for the given plant.
3. **Update path A (direct write)** — when `P_BDC` checkbox is *off*, multiplies each STPRS in
   memory, then calls `UPDATE mbew` row-by-row inside a loop, and issues `COMMIT WORK`.
4. **Update path B (BDC)** — when `P_BDC` is *on*, replays transaction `MM02` via a BDCDATA
   table to update the material master through the screen interface.
5. **Result output** — writes the count of updated materials to the classic ABAP list.

---

## Findings

| # | Rule | Lines | Level | Effort | Summary |
|---|------|-------|-------|--------|---------|
| F-01 | CC-08 | 22–27 | C | M | `CALL FUNCTION 'POPUP_TO_CONFIRM'` — non-released FM, SAP GUI only |
| F-02 | CC-01 | 29 | C | M | `SELECT * FROM mbew` — direct read of SAP table, release status unverified |
| F-03 | CC-03 | 35 | **D** | L | `UPDATE mbew FROM ls_mbew` — direct write to SAP table, bypasses all business logic |
| F-04 | CC-04 | 45 | **D** | L | `CALL TRANSACTION 'MM02' USING lt_bdc` — BDC screen replay, no SAP GUI in Cloud |
| F-05 | CC-09 | 49 | C | M | `WRITE:` — classic list output, not available in ABAP Cloud |
| F-06 | CC-11 | 51–64 | C | S | `FORM bdc_dynpro` / `FORM bdc_field` — obsolete subroutines |
| F-07 | CC-10 | 10–14 | syntax | S | Data declarations typed against physical SAP table `mbew` / `bdcdata` |
| F-08 | Unclassified | 33–36 | — | M | Business logic gap: no check on price-control indicator `VPRSV`; updating STPRS for moving-average materials creates stock-value inconsistency |

---

### F-01 · CC-08 · Lines 22–27 · Level C · Effort M

```abap
CALL FUNCTION 'POPUP_TO_CONFIRM'
  EXPORTING text_question = 'Really update all prices?'
  IMPORTING answer        = lv_answer.
```

`POPUP_TO_CONFIRM` is not in the released API list. Replace with a Fiori elements confirmation
action (RAP action with `confirmationMessage`) or remove the guard for a background-only
redesign.

---

### F-02 · CC-01 · Line 29 · Level C · Effort M

```abap
SELECT * FROM mbew INTO TABLE lt_mbew WHERE bwkey = p_werks.
```

Direct `SELECT` on `MBEW`. The release status of this table for ABAP Cloud on the target system
must be verified. Candidate replacement: a released CDS view exposing material valuation data
(exact name TBD — verify on target or api.sap.com).

---

### F-03 · CC-03 · Line 35 · Level D · Effort L  ⚠️ Rebuild blocker

```abap
UPDATE mbew FROM ls_mbew.
```

Direct DML on an SAP table. Bypasses locking, change documents, CO/Costing postings and price
history. Replace with a released RAP Business Object or BAPI for standard-price change
(candidate: `BAPI_MATERIAL_SAVEDATA` with costing view — **verify release status on target**).
The `COMMIT WORK` at line 37 must also be removed in favour of the API's own commit mechanism.

---

### F-04 · CC-04 · Line 45 · Level D · Effort L  ⚠️ Rebuild blocker

```abap
CALL TRANSACTION 'MM02' USING lt_bdc MODE 'N' UPDATE 'S'.
```

BDC screen replay requires SAP GUI dynpro runtime — absent in ABAP Cloud. Replace with the same
released API as F-03; the entire `BDCDATA` infrastructure (lines 12–14, 40–46, 51–64) becomes
redundant.

---

### F-05 · CC-09 · Line 49 · Level C · Effort M

```abap
WRITE: / 'Updated', lines( lt_mbew ), 'materials.'.
```

Classic list output not available in ABAP Cloud. Surface results via Application Job log
(`CL_APJ_RT_API`) for batch runs, or return a structured message in a Fiori action result.

---

### F-06 · CC-11 · Lines 51–64 · Level C · Effort S

```abap
FORM bdc_dynpro USING program dynpro. ... ENDFORM.
FORM bdc_field  USING fnam fval.      ... ENDFORM.
```

`FORM`/`PERFORM` subroutines are obsolete in the ABAP Cloud language version. Convert to private
methods — or drop entirely when the BDC path is removed.

---

### F-07 · CC-10 · Lines 10–14 · Syntax · Effort S

```abap
DATA: lt_mbew TYPE TABLE OF mbew,
      ls_mbew TYPE mbew,
      lt_bdc  TYPE TABLE OF bdcdata,
      ls_bdc  TYPE bdcdata, ...
```

Declarations directly typed to physical SAP tables. Redeclare against released CDS view–based
types; use inline `DATA( )` where possible. ATC may additionally flag `TYPE TABLE OF mbew` as
an access to an unreleased repository object.

---

### F-08 · Unclassified · Lines 33–36 · Effort M

```abap
LOOP AT lt_mbew INTO ls_mbew.
  ls_mbew-stprs = ls_mbew-stprs * ( 1 + p_pct / 100 ).
  UPDATE mbew FROM ls_mbew.
ENDLOOP.
```

**Business logic gap:** `STPRS` is only meaningful for materials with price control `VPRSV = 'S'`
(standard price). The program does not filter on this field, so it would silently overwrite
`STPRS` for moving-average (`'V'`) materials, creating an inconsistency between the price field
and the stock value. No CC rule covers this; flagged per verification-rules.md requirement to
report wrong-looking logic.

---

## Counts

| Level | Count |
|-------|-------|
| D (Rebuild blocker) | 2 (F-03, F-04) |
| C (Refactor) | 4 (F-01, F-02, F-05, F-06) |
| Syntax / CC-10 | 1 (F-07) |
| Unclassified (logic) | 1 (F-08) |

---

## What a human must still decide

1. **Target product and release** — must be confirmed before any finding can be marked `verified_on_target`.
2. **Released CDS view for material valuation** — exact name covering `STPRS`, `BWKEY`, `MATNR`, `VPRSV` on the target release (verify in ADT Released Objects tree or api.sap.com).
3. **Released write API for standard-price update** — `BAPI_MATERIAL_SAVEDATA` (costing view) is a candidate; its release status for ABAP Cloud must be confirmed on the target. Alternatively, look for a RAP BO for Material Master.
4. **Interactive vs. background design** — determines whether the confirmation popup (F-01) becomes a Fiori action dialog or is simply dropped.
5. **BDC path necessity** — whether `P_BDC` / `MM02` path must be preserved or can be dropped in favour of a single released-API path.
6. **Price-control-indicator guard (F-08)** — confirm all in-scope materials are price-control `S`, or ensure the replacement API enforces this constraint itself.
7. **Authorization concept** — the current program has no `AUTHORITY-CHECK`; the replacement must define which authorization objects govern mass price changes.

---

*Report produced by Bob (AI) · not reviewed by a human · verification_status = observed / needs_verification throughout.*
