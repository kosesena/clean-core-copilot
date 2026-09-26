# Modernised ZFI_VENDOR_AGING

> **Verification status: Needs target verification**
> Target product and release are both **unknown**. Every object name marked
> `candidate` must be confirmed in the Released Objects list (ADT or
> api.sap.com) before transport. Nothing here has been verified on a target
> system.

---

## Files in this folder

| File | Purpose |
|------|---------|
| [`I_VendorOpenItem_VAgeing.cds`](I_VendorOpenItem_VAgeing.cds) | CDS view entity – read side |
| [`zcl_vendor_aging.abap`](zcl_vendor_aging.abap) | Bucketing logic + log write + treasury stub |
| [`zcl_vendor_aging_test.abap`](zcl_vendor_aging_test.abap) | ABAP Unit tests (one per business rule) |
| `README.md` | This file |

---

## What changed — per finding ID

### F-01 · CC-02 · SELECT on BSEG (lines 30–36)

**Legacy:** `SELECT … FROM bseg INNER JOIN lfa1` with hard-coded
`koart = 'K'` and `augbl = space` predicates to isolate open vendor items.

**Modern:** CDS view entity
[`I_VendorOpenItem_VAgeing`](I_VendorOpenItem_VAgeing.cds) consumes
`I_OperationalAcctgDocItem` *(candidate)* and `I_Supplier` *(candidate)*.
The open-item and vendor-type predicates are pushed into the CDS `WHERE`
clause so all consumers automatically get the correct filter.
The class method
[`zcl_vendor_aging/select_open_items`](zcl_vendor_aging.abap)
reads from the CDS view with a single ABAP SQL `SELECT`.
`AccountingDocumentItem` *(candidate)* is added as a fourth key because one
document can carry several vendor lines; `ty_item` component names are
CamelCase, matching CDS element names exactly, so `INTO CORRESPONDING FIELDS`
resolves without `AS` aliases.

---

### F-02 · CC-01 · SELECT on LFA1 (line 32)

**Legacy:** `INNER JOIN lfa1` to retrieve `name1` (vendor name).

**Modern:** Handled within the same CDS view entity via
`INNER JOIN I_Supplier` *(candidate)*. No separate SELECT on `LFA1`.

---

### F-03 · CC-05 · EXEC SQL / native SQL (lines 39–41)

**Legacy:**
```abap
EXEC SQL.
  UPDATE ZFI_AGING_LOG SET LAST_RUN = :sy-datum WHERE BUKRS = :p_bukrs
ENDEXEC.
```

**Modern:** [`zcl_vendor_aging/write_log`](zcl_vendor_aging.abap) uses
plain ABAP SQL:
```abap
UPDATE zfi_aging_log SET last_run = @sy-datum WHERE bukrs = @iv_company_code.
```
`ZFI_AGING_LOG` is assumed to be a customer-owned Z-table; no RAP BO wraps
it. If a RAP BO exists or is later created, replace with an EML `MODIFY`
call.

---

### F-04 · CC-10 · `WITH HEADER LINE` / obsolete syntax (line 19)

**Legacy:**
```abap
DATA: gt_items TYPE STANDARD TABLE OF ty_item WITH HEADER LINE, …
```
Accessed via `LOOP AT gt_items.` / `MODIFY gt_items.` implicit header.

**Modern:**
- `ty_items` declared as `STANDARD TABLE … WITH EMPTY KEY` (no header line).
- Loop uses `ASSIGNING FIELD-SYMBOL(<ls_item>)` for in-place modification
  (see [`assign_buckets`](zcl_vendor_aging.abap)).
- All data declarations use modern inline `DATA(…)` or typed `VALUE #(…)`.

---

### F-05 · CC-06 · OPEN DATASET / TRANSFER / CLOSE DATASET (lines 55–64)

**Legacy:** Writes bucketed data to `/usr/sap/trans/out/aging.csv` on the
application server for nightly treasury pickup.

**Modern:** File-system access is not available in ABAP Cloud.
The method
[`zcl_vendor_aging/hand_off_to_treasury`](zcl_vendor_aging.abap)
is a **clearly marked integration-point stub**. The body contains the full
"human must decide" comment with four candidate architectural options (HTTP
outbound, Application Job, event mesh, OData feed). No flat-file output is
written. A human architect must implement this method once the integration
pattern is chosen.

---

### F-06 · CC-07 · SUBMIT zfi_treasury_upload (line 67)

**Legacy:** `SUBMIT zfi_treasury_upload WITH p_file = gv_file AND RETURN.`

**Modern:** The `SUBMIT` is replaced by the
[`hand_off_to_treasury`](zcl_vendor_aging.abap) stub (see F-05 above).
The dependency on a flat-file path is removed. If a background job is
required, the stub is the place to call `CL_APJ_RT_API` *(candidate)*.

---

### F-07 · Unclassified · Comment contradicts code (lines 38–41)

**Legacy:** Comment says "currency conversion done in the database, native"
but the actual statement is a log-table `UPDATE` — no conversion at all.

**Modern:** The misleading comment is removed.
The field `amount_cc_currency` in the CDS view carries the amount in
company-code currency (maps to `DMBTR`). Whether currency conversion is
needed is explicitly called out as an open question in the CDS view header
comment and in the "What a human must still decide" section below.

---

### F-08 · CC-09 · Classic REPORT program (line 8)

**Legacy:** `REPORT zfi_vendor_aging.` with `PARAMETERS` screen and
`START-OF-SELECTION` event block — a classic executable program that has no
place in ABAP Cloud.

**Modern:** The executable program is replaced by a plain ABAP class
[`ZCL_VENDOR_AGING`](zcl_vendor_aging.abap). The selection parameters
(`P_BUKRS`, `P_KEYDT`) become typed importing parameters of `run()`.
Scheduling is done externally (Application Job framework, an OData action,
or a Fiori app calling the class) — the class itself has no screen coupling.

---

## What a human must still decide

1. **Target product and release** — required before any candidate object name
   can be confirmed. Every `candidate` comment in the code is a blocker until
   this is known.

2. **`I_OperationalAcctgDocItem` release status** (F-01) — verify it is
   released for the target product/release and that it carries:
   - `NetDueDate` (maps to `ZFBDT`)
   - `AmountInCompanyCodeCurrency` (maps to `DMBTR`)
   - `AccountType` (maps to `KOART = 'K'`)
   - `IsCleared` or equivalent open-item flag (maps to `AUGBL = space`)

3. **`I_Supplier` release status and field mapping** (F-02) — confirm that
   `SupplierName` on `I_Supplier` is the correct field for `LFA1-NAME1`.

4. **Open-item predicate** (F-01) — the CDS view uses `IsCleared = ''`. If
   the released view uses a different field name or a boolean type, the WHERE
   clause must be adjusted. An alternative is a dedicated
   `I_VendorOpenItem*` entity if one is released.

5. **`ZFI_AGING_LOG` ownership** (F-03) — confirm this is a customer-owned
   Z-table. If it is SAP-delivered, or if a RAP BO already governs it,
   replace the ABAP SQL `UPDATE` with an EML `MODIFY` call.

6. **Currency conversion on `DMBTR`** (F-07, Unclassified) — the legacy
   comment referred to currency conversion but the code never performed it.
   Decide: (a) is `DMBTR` always already in reporting currency? (b) if not,
   should `CURRENCY_CONVERSION` be added to the CDS view? This is a business
   requirement question, not a technical one.

7. **Treasury integration architecture** (F-05, F-06) — the
   `hand_off_to_treasury` method is a stub. Choose one of:
   - HTTP outbound call via Communication Arrangement + released HTTP client
     class *(candidate: `CL_HTTP_CLIENT` or successor)*
   - Application Job scheduling via `CL_APJ_RT_API` *(candidate)*
   - Business Event / enterprise messaging
   - OData feed that the treasury system polls
   Implement the method body and remove the `ev_subrc = 4` placeholder.

8. **`ZFI_TREASURY_UPLOAD` scope** (F-06) — if that program is owned by a
   different team it also needs a separate clean-core audit. The stub
   approach in `hand_off_to_treasury` deliberately decouples it.

9. **Execution trigger** (F-08) — decide whether the job is:
   - An **Application Job** (background, `CL_APJ_RT_API` *(candidate)*
     schedules `ZCL_VENDOR_AGING->run()`)
   - A **Fiori Elements List Report** backed by the CDS view for interactive
     use
   - An **OData V4 action** calling `run()` from an external system

10. **ABAP object names** — `ZCL_VENDOR_AGING`, `ZCL_VENDOR_AGING_TEST`,
    `I_VendorOpenItem_VAgeing`, and `ZFI_AGING_LOG` are all proposed names.
    Align with the customer's naming convention and confirm no collisions exist
    in the target system before transport.

---

*Generated by the Clean Core Copilot (Bob). All candidate object names
require human verification against the Released Objects list on the target
system before this code is transported.*
