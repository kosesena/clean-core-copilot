# Audit Report — ZFI_VENDOR_AGING

**Source:** [`samples/legacy/zfi_vendor_aging.abap`](../samples/legacy/zfi_vendor_aging.abap)
**Target language version:** ABAP for Cloud Development
**Target product / release:** unknown — *verification required*
**Catalogue:** `docs/clean-core-rules.md` (draft)
**Produced by:** Bob (not reviewed by human)

---

## What the program does for its user

`ZFI_VENDOR_AGING` is a **nightly batch program** used by the Finance team to produce a **vendor open-item aging report** for a given company code. In plain language:

1. **Reads all unpaid vendor invoices** (open items, `koart = 'K'`, `augbl = space`) from the FI line-item table, joined to the vendor master for the vendor name.
2. **Calculates how many days overdue** each item is relative to a key date (default = today) and assigns each item to an aging bucket: 0–30 days, 31–60 days, or 60+ days.
3. **Logs the run date** for the company code into a custom log table (`ZFI_AGING_LOG`).
4. **Writes the bucketed data as a semicolon-delimited CSV file** to a fixed application-server path (`/usr/sap/trans/out/aging.csv`).
5. **Triggers a second report** (`ZFI_TREASURY_UPLOAD`) — presumably to pick up the file and push it to the treasury system.

The end-to-end business purpose is to give the treasury team a daily snapshot of how old the company's outstanding payables are, grouped by aging band.

---

## Findings summary

| # | Rule | Lines | Level hint | Effort | Status |
|---|------|-------|------------|--------|--------|
| F-01 | CC-02 | 30–36 | C | M | needs\_verification |
| F-02 | CC-01 | 32 | C | S | needs\_verification |
| F-03 | CC-05 | 39–41 | **D** | S | needs\_verification |
| F-04 | CC-10 | 19 | syntax | S | observed |
| F-05 | CC-06 | 55–64 | C | **L** | needs\_verification |
| F-06 | CC-07 | 67 | C | M | needs\_verification |
| F-07 | Unclassified | 38–41 | — | S | observed |
| F-08 | CC-09 | 8 | C | **L** | needs\_verification |

**Level breakdown (hints only, unverified):** C × 6 · D × 1 · syntax × 1
**Draft verdict hint:** Rebuild *(one D-level finding present — but see verification gate below)*

> ⚠️ **Overall status: Needs target verification.** Product, release and language version are unknown. No finding should be treated as a confirmed compliance block until verified on the target system. Do not use the draft verdict as a compliance conclusion.

---

## Detailed findings

### F-01 · CC-02 · Lines 30–36 · Level C · Effort M

```abap
SELECT b~lifnr, l~name1, b~belnr, b~zfbdt, b~dmbtr
  FROM bseg AS b
  INNER JOIN lfa1 AS l ON l~lifnr = b~lifnr
  WHERE b~bukrs = @p_bukrs
    AND b~koart = 'K'
    AND b~augbl = @space
  INTO CORRESPONDING FIELDS OF TABLE @gt_items.
```

**Why it blocks:** Direct read of `BSEG` — the central FI line-item table. In S/4HANA, `BSEG` coexists with `ACDOCA`; its release status in ABAP Cloud must be confirmed per target release. The filter `koart = 'K' AND augbl = space` encodes the open-vendor-items semantic and must be preserved in the replacement.

**Direction:** Candidate view: `I_OperationalAcctgDocItem` (open items, clearing fields). Field mapping and release contract must be verified.

---

### F-02 · CC-01 · Line 32 · Level C · Effort S

```abap
INNER JOIN lfa1 AS l ON l~lifnr = b~lifnr
```

**Why it blocks:** Direct read of `LFA1` (vendor master). Classic SAP table; cloud release status must be checked.

**Direction:** Candidate view: `I_Supplier`. Verify field availability (`NAME1` equivalent).

---

### F-03 · CC-05 · Lines 39–41 · Level **D** · Effort S

```abap
EXEC SQL.
  UPDATE ZFI_AGING_LOG SET LAST_RUN = :sy-datum WHERE BUKRS = :p_bukrs
ENDEXEC.
```

**Why it blocks:** Native SQL (`EXEC SQL … ENDEXEC`) is unconditionally forbidden in ABAP for Cloud Development. This is the only D-level finding and the primary reason the draft verdict is "Rebuild."

**Direction:** Replace with plain ABAP SQL: `UPDATE zfi_aging_log SET last_run = @sy-datum WHERE bukrs = @p_bukrs`. Verify table ownership first (see F-07).

---

### F-04 · CC-10 · Line 19 · Syntax · Effort S

```abap
DATA: gt_items TYPE STANDARD TABLE OF ty_item WITH HEADER LINE,
```

**Why it blocks:** `WITH HEADER LINE` is an obsolete construct not allowed in ABAP for Cloud Development. The implicit header line is used throughout the LOOP / MODIFY blocks.

**Direction:** Declare a separate work area; use `LOOP AT … INTO` or `ASSIGNING FIELD-SYMBOL`.

---

### F-05 · CC-06 · Lines 55–64 · Level C · Effort **L**

```abap
OPEN DATASET gv_file FOR OUTPUT IN TEXT MODE ENCODING DEFAULT.
...
TRANSFER gv_line TO gv_file.
CLOSE DATASET gv_file.
```

**Why it blocks:** Application-server file system access (`OPEN DATASET / TRANSFER / CLOSE DATASET`) is not available in ABAP Cloud. The file path is hard-coded.

**Direction:** Replace with an outbound API / Communication Arrangement. The treasury system must be given a pull endpoint or receive a push event. Effort is Large because the integration architecture must be redesigned end-to-end (see "What a human must still decide").

---

### F-06 · CC-07 · Line 67 · Level C · Effort M

```abap
SUBMIT zfi_treasury_upload WITH p_file = gv_file AND RETURN.
```

**Why it blocks:** `SUBMIT` (calling another executable report) is not available in ABAP for Cloud Development.

**Direction:** Extract `ZFI_TREASURY_UPLOAD`'s logic into a class/method, or schedule it as an Application Job (`CL_APJ_RT_API`). This finding is tightly coupled to F-05 (the file path dependency must be resolved together).

---

### F-07 · Unclassified · Lines 38–41 · Effort S

```abap
* Currency conversion done in the database, native, because "it was faster"
EXEC SQL.
  UPDATE ZFI_AGING_LOG SET LAST_RUN = :sy-datum WHERE BUKRS = :p_bukrs
ENDEXEC.
```

**Observation:** The comment claims this block performs currency conversion, but the actual SQL is a log-table update — no conversion takes place. The comment contradicts the code. This may indicate removed logic, a misplaced comment, or a silent assumption that `DMBTR` is always in company-code currency. No clean-core rule governs comment accuracy, but the discrepancy is a logic risk that a human reviewer must resolve before migration.

---

### F-08 · CC-09 · Line 8 · Level C · Effort **L**

```abap
REPORT zfi_vendor_aging.
```

**Why it blocks:** The program is a classic executable ABAP Report with `START-OF-SELECTION` and a `PARAMETERS` screen — a paradigm that has no equivalent in ABAP Cloud. CC-09 covers the absence of list processing; the broader issue is the program type.

**Direction:** Repackage as an Application Job (background) or a Fiori elements List Report (interactive). The bucketing logic becomes a service method.

---

## What a human must still decide

1. **Target product and exact release** — required to verify release contracts for `I_OperationalAcctgDocItem`, `I_Supplier`, and all other candidate objects.
2. **BSEG availability** — is it a compatibility object on the target release, or fully superseded by `ACDOCA`?
3. **ZFI_AGING_LOG ownership** — customer-owned Z-table (ABAP SQL `UPDATE` acceptable) or SAP-delivered object?
4. **ZFI_TREASURY_UPLOAD scope** — is it in scope for this migration, and who owns it? Does it have its own clean-core issues?
5. **Treasury integration architecture** — flat file → API/event/push? Does the treasury system support an OData feed or webhook?
6. **Currency conversion gap** — is conversion of `DMBTR` a live business requirement, and if so, where should it be implemented?
7. **Interactive vs background execution** — determines Application Job vs Fiori app as the target architecture.
8. **Field mapping** — confirm exact field names on `I_OperationalAcctgDocItem` and `I_Supplier` that correspond to `ZFBDT`, `DMBTR`, `KOART`, `AUGBL`, and `NAME1`.
