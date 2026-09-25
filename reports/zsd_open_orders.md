# Audit Report — ZSD_OPEN_ORDERS

| Field | Value |
|---|---|
| Source | [`samples/legacy/zsd_open_orders.abap`](../samples/legacy/zsd_open_orders.abap) |
| Target product | unknown |
| Target release | unknown |
| Language version | ABAP for Cloud Development (assumed) |
| Produced by | Bob (draft — not reviewed by a human) |
| Catalogue | `docs/clean-core-rules.md` (draft) |

> ⚠️ **Status: Needs target verification.**  
> Draft verdict hint: **Rebuild** (D-level blockers present via CC-09 classic list, CC-11 subroutines, and CC-01 direct SAP-table reads).  
> No finding may be treated as final until the target product, release and language version are confirmed by a human on a real system.

---

## Business Behaviour

`ZSD_OPEN_ORDERS` is an SD order-manager / customer-service list report. The user enters:

- **`P_VKORG`** – sales organisation (mandatory)
- **`S_KUNNR`** – optional customer number range
- **`S_ERDAT`** – optional order creation date range

The program then:

1. Reads all matching sales order headers from `VBAK`.
2. For each header, reads all items from `VBAP`.
3. Per item, reads delivery status from `VBUP`; items with `LFSTA = 'C'` (fully delivered) are **excluded** — only open (undelivered) items remain.
4. Fetches the customer name from `KNA1`.
5. Prints a classic SAP list grouped by customer, showing order/item/material/quantity/net value.
6. Prints a grand-total open net value at the bottom.

---

## Findings Summary

| Count | Level / Type |
|---|---|
| 4 | CC-01 — direct reads on unreleased SAP tables (Level C) |
| 1 | CC-09 — classic list output (Level C) |
| 1 | CC-09 — AT NEW control-break construct (Level C) |
| 3 | CC-10 — obsolete syntax: TABLES, OCCURS/header line, LIKE DB fields, MOVE-CORRESPONDING, ADD…TO (Level B/syntax) |
| 2 | CC-11 — FORM/PERFORM subroutines (Level C) |
| 1 | CC-12 — nested SELECT loops (performance, not a cloud blocker) |
| 1 | Unclassified — misleading comment + hard-coded delivery-status literal |

**Total findings: 18** (some rule IDs cover more than one line range; see JSON for full detail).

---

## Findings Detail

### F-01 · CC-10 · Line 10 — `TABLES` statement
```abap
TABLES: vbak, vbap, kna1.
```
**Why it blocks:** `TABLES` declares implicit work areas linked to SAP GUI dynpro — obsolete in ABAP for Cloud Development.  
**Instead:** Remove; declare explicit work areas with `DATA` or inline `DATA( )`.  
**Effort:** S

---

### F-02 · CC-10 · Lines 12–21 — `OCCURS 0` / header-line table
```abap
DATA: BEGIN OF it_orders OCCURS 0, … END OF it_orders.
```
**Why it blocks:** `OCCURS` + implicit header line are not permitted in the cloud language version.  
**Instead:** `TYPES: BEGIN OF ty_orders … END OF ty_orders. DATA it_orders TYPE STANDARD TABLE OF ty_orders WITH EMPTY KEY.`  
**Effort:** S

---

### F-03 · CC-10 · Lines 12–21 — `LIKE <dbtable>-<field>` in structure
```abap
vbeln LIKE vbak-vbeln, erdat LIKE vbak-erdat, …
```
**Why it blocks:** `LIKE` references to DB table fields are an obsolete form; the underlying tables may also not be accessible.  
**Instead:** Use `TYPE` references to released CDS view elements.  
**Effort:** S

---

### F-04 · CC-10 · Line 23 — `LIKE vbap-netwr`
```abap
DATA: w_total LIKE vbap-netwr.
```
**Why it blocks:** Same as F-03.  
**Instead:** A released CDS type or appropriate built-in numeric type.  
**Effort:** S

---

### F-05 · CC-10 · Lines 25–27 — `SELECT-OPTIONS` / `PARAMETERS` / `LIKE` on DB field
```abap
SELECT-OPTIONS: s_kunnr FOR vbak-kunnr, …
PARAMETERS:     p_vkorg LIKE vbak-vkorg OBLIGATORY.
```
**Why it blocks:** Selection-screen constructs require SAP GUI; no GUI exists in ABAP Cloud.  
**Instead:** Method parameters or OData/RAP filter API.  
**Effort:** M

---

### F-06 · CC-01 · Lines 35–37 — `SELECT * FROM vbak`
```abap
SELECT * FROM vbak WHERE kunnr IN s_kunnr AND erdat IN s_erdat AND vkorg = p_vkorg.
```
**Why it blocks:** Direct read of SAP table `VBAK`; release status must be verified. Candidate replacement: `I_SalesDocument`.  
**Instead:** `I_SalesDocument` (verify release contract and field coverage).  
**Effort:** M  
**Verification status:** needs_verification

---

### F-07 · CC-12 · Lines 35–49 — Nested `SELECT…ENDSELECT` loops
```abap
SELECT * FROM vbak … ENDSELECT.
  SELECT * FROM vbap … ENDSELECT.
    SELECT SINGLE * FROM vbup …
```
**Why it matters:** N²-style round-trips; performance risk at scale. Not a cloud blocker by itself, but migration is the time to fix it.  
**Instead:** Single CDS-join-based SELECT with server-side filtering.  
**Effort:** M  
**Verification status:** needs_verification

---

### F-08 · CC-01 · Line 38 — `SELECT * FROM vbap`
```abap
SELECT * FROM vbap WHERE vbeln = vbak-vbeln.
```
**Why it blocks:** Direct read of SAP table `VBAP`. Candidate replacement: `I_SalesDocumentItem`.  
**Instead:** `I_SalesDocumentItem` (verify).  
**Effort:** M  
**Verification status:** needs_verification

---

### F-09 · CC-01 · Lines 40–41 — `SELECT SINGLE * FROM vbup`
```abap
SELECT SINGLE * FROM vbup INTO @DATA(ls_vbup)
  WHERE vbeln = @vbap-vbeln AND posnr = @vbap-posnr.
```
**Why it blocks:** Direct read of SAP table `VBUP` (item status). No candidate released CDS view name confirmed for LFSTA exposure.  
**Instead:** Identify the released CDS view that exposes item delivery status for the target release (unknown — must be verified).  
**Effort:** M  
**Verification status:** needs_verification

---

### F-10 · CC-01 · Lines 43–44 — `SELECT SINGLE name1 FROM kna1`
```abap
SELECT SINGLE name1 FROM kna1 INTO it_orders-name1
  WHERE kunnr = vbak-kunnr.
```
**Why it blocks:** Direct read of SAP table `KNA1`. Candidate replacement: `I_Customer`.  
**Instead:** `I_Customer` (verify release contract and NAME1 field equivalent).  
**Effort:** S  
**Verification status:** needs_verification

---

### F-11 · CC-10 · Lines 45–46 — `MOVE-CORRESPONDING`
```abap
MOVE-CORRESPONDING vbak TO it_orders.
MOVE-CORRESPONDING vbap TO it_orders.
```
**Why it blocks:** `MOVE-CORRESPONDING` is covered by CC-10 (`MOVE` family). Verify if this specific form is explicitly rejected.  
**Instead:** `CORRESPONDING #( )` operator.  
**Effort:** S

---

### F-12 · CC-11 · Lines 34–50 — `FORM get_data` subroutine
```abap
FORM get_data. … ENDFORM.
```
**Why it blocks:** Subroutines are not permitted in ABAP for Cloud Development.  
**Instead:** Private/static method of a class.  
**Effort:** M

---

### F-13 · CC-11 · Lines 53–67 — `FORM print_list` subroutine
```abap
FORM print_list. … ENDFORM.
```
**Why it blocks:** Same as F-12.  
**Instead:** Private/static method of a class.  
**Effort:** M

---

### F-14 · CC-11 · Lines 30–31 — `PERFORM` calls
```abap
PERFORM get_data.
PERFORM print_list.
```
**Why it blocks:** `PERFORM` calls obsolete subroutines.  
**Instead:** Method calls once FORM blocks are converted.  
**Effort:** S

---

### F-15 · CC-09 · Lines 53–67 — Classic list output (`WRITE`, `ULINE`)
```abap
WRITE: / it_orders-kunnr COLOR COL_HEADING … ULINE. WRITE: / … ADD … WRITE: / 'Total open value:', w_total.
```
**Why it blocks:** No list processing or SAP GUI in ABAP Cloud.  
**Instead:** RAP query + Fiori Elements List Report page; total value as CDS aggregation.  
**Effort:** L

---

### F-16 · CC-09 · Lines 56–60 — `AT NEW … ENDAT` control-break
```abap
AT NEW kunnr. SKIP. WRITE: … ULINE. ENDAT.
```
**Why it blocks:** Classic list control-break construct, not available in ABAP Cloud.  
**Instead:** Fiori Elements group-by on SoldToParty.  
**Effort:** M

---

### F-17 · CC-10 · Line 63 — `ADD … TO`
```abap
ADD it_orders-netwr TO w_total.
```
**Why it blocks:** `ADD … TO` is an obsolete arithmetic statement in ABAP for Cloud Development.  
**Instead:** `w_total += it_orders-netwr` or CDS SUM aggregation.  
**Effort:** S

---

### F-18 · Unclassified · Line 42 — Misleading comment + hard-coded status literal
```abap
*  "open" = no delivery yet - status read straight from VBUP
CHECK ls_vbup-lfsta <> 'C'.
```
**What looks wrong:** The comment says "no delivery yet" but `LFSTA = 'C'` means **fully delivered**, not "not started". The code logic is correct (exclude fully delivered items), but the comment contradicts it. Additionally, the literal `'C'` must be re-confirmed against whatever released CDS view replaces VBUP.  
**Suggested action:** Fix the comment. Confirm the field name and constant for "fully delivered" in the replacement view. Clarify whether partially delivered items (`LFSTA = 'B'`) should also be excluded.  
**Effort:** S

---

## What a Human Must Still Decide

1. **Target product and exact release** — all level classifications remain provisional until confirmed.
2. **ABAP language version** — assumed ABAP for Cloud Development; confirm with ADT project properties.
3. **Release status of `VBAK`, `VBAP`, `VBUP`, `KNA1`** — check ADT "Released Objects" tree or [api.sap.com](https://api.sap.com) for the target system.
4. **Released CDS view for `VBUP`/`LFSTA`** — no confirmed candidate name exists; must be identified from the Released Objects list.
5. **Release contract, field coverage and licensing** of `I_SalesDocument`, `I_SalesDocumentItem`, `I_Customer` in the target release.
6. **`MOVE-CORRESPONDING` vs. scalar `MOVE`** — confirm whether the CORRESPONDING form is explicitly rejected in the target language version.
7. **Output requirement** — interactive Fiori UI, scheduled background report, or both? Determines RAP query pattern vs. Application Job (`CL_APJ_RT_API`).
8. **Definition of "open" order item** — exclude only `LFSTA = 'C'` (fully delivered) or also `LFSTA = 'B'` (partially delivered)?
9. **Authorization concept** — the legacy program has no explicit authority checks; the replacement must define the correct authorization objects for the sales order and customer master reads.
