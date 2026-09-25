# Audit Report — ZCC_LEGACY_MATERIALS

| Field | Value |
|---|---|
| Source | [`samples/legacy/zcc_legacy_materials.abap`](../samples/legacy/zcc_legacy_materials.abap) |
| Target product | unknown |
| Target release | unknown |
| Language version | ABAP for Cloud Development |
| Produced by | Bob (not reviewed by a human) |
| Catalogue | `docs/clean-core-rules.md` (draft) |

---

## Business behaviour

`ZCC_LEGACY_MATERIALS` is a classic SAP GUI selection report for **Material Master data**.

1. **Input** — The user enters one or more material numbers (or ranges) on a standard selection screen rendered in SAP GUI.
2. **Read** — The program fetches the matching rows (material number + material type) directly from the `MARA` database table.
3. **Empty-result guard** — If no materials are found, a plain-text message is written to the list and the program exits.
4. **Output** — The result set is displayed using the classic ALV Grid viewer (`REUSE_ALV_GRID_DISPLAY`), formatted against the `MARA` DDIC structure.
5. **Error guard** — If the ALV call fails, a plain-text error message is written to the list.

The program has **no write path** — it is purely a read/display utility for material master records.

---

## Findings

### F-01 · CC-10 · Line 5 · Level C · Effort S

```abap
TABLES mara.
```

**Why it blocks:** `TABLES` is an obsolete statement not permitted under the ABAP for Cloud Development language version. It declares an implicit work-area header line tied to classical dynpro processing.

**Instead:** Remove `TABLES`. Declare an explicit structure (`DATA ls_mara TYPE mara`) or use inline declarations. Access material data through the released CDS view **`I_Product`** (candidate — verify release status on target).

---

### F-02 · Unclassified · Line 6 · Effort — (needs verification)

```abap
SELECT-OPTIONS s_matnr FOR mara-matnr.
```

**Why it blocks:** `SELECT-OPTIONS` is a classic selection-screen declaration that depends on SAP GUI screen rendering, which does not exist in ABAP Cloud. No catalogue rule names it explicitly; filed as Unclassified.

**Instead:** Replace with a method parameter of type `RANGE OF matnr`, or an OData filter on the RAP query, depending on the target call channel.

---

### F-03 · CC-01 · Lines 15–18 · Level C · Effort M

```abap
SELECT matnr mtart
  FROM mara
  INTO TABLE lt_materials
  WHERE matnr IN s_matnr.
```

**Why it blocks:** Direct `SELECT` on the SAP table `MARA`. The table is not in the released API catalogue; its release status and any simplification guidance must be confirmed on the specific target system.

**Instead:** Select from the released CDS view **`I_Product`** (candidate). Verify field mapping (`matnr` → candidate element name, `mtart` → candidate element name) and confirm the view is released and licensed on the target.

---

### F-04 · CC-09 · Line 21 · Level C · Effort S

```abap
WRITE: / 'No materials found'.
```

**Why it blocks:** `WRITE` is classic list output — not available in ABAP for Cloud Development (no list processor, no SAP GUI).

**Instead:** Surface the empty-result condition via a RAP action result, a Fiori message, or by returning an empty result set to the caller.

---

### F-05 · CC-08 · Lines 25–32 · Level C · Effort L

```abap
CALL FUNCTION 'REUSE_ALV_GRID_DISPLAY'
  EXPORTING
    i_structure_name = 'MARA'
  TABLES
    t_outtab          = lt_materials
  EXCEPTIONS
    program_error    = 1
    OTHERS           = 2.
```

**Why it blocks:** `REUSE_ALV_GRID_DISPLAY` is a non-released function module from the classic ALV Grid framework. It is bound to SAP GUI screen rendering and is not listed in the released API catalogue for ABAP Cloud.

**Instead:** Expose the material read result as a RAP query, and surface it through a **Fiori Elements List Report** OData V4 service. The entire display channel must change — there is no 1:1 code replacement.

---

### F-06 · CC-09 · Line 34 · Level C · Effort S

```abap
WRITE: / 'Display failed'.
```

**Why it blocks:** Same restriction as F-04. Classic list output is not available in ABAP for Cloud Development.

**Instead:** Raise a proper exception class or return a RAP message to the caller.

---

## Summary

| Rule | Count | Level hint | Max effort |
|---|---|---|---|
| CC-01 | 1 | C | M |
| CC-08 | 1 | C | L |
| CC-09 | 2 | C | S |
| CC-10 | 1 | C | S |
| Unclassified | 1 | — | — |
| **Total** | **6** | | |

**Overall status: `Needs target verification`**
Draft verdict hint (unverified): **Rebuild** — the entire output channel (SAP GUI ALV + WRITE) must be replaced; no D-level write path is present, but two distinct C-level API families (ALV, list processing) that have no direct cloud equivalent make this a rebuild rather than a refactor.

---

## What a human must still decide

1. **Target product and exact release** are unknown — no compliance verdict can be issued until these are confirmed.
2. **MARA simplification status** — does the target release provide a compatibility object for MARA, or must all access go through a released CDS view?
3. **I_Product release contract** — confirm that `I_Product` (or the correct successor view) is released, licensed, and exposes the required fields (`MATNR`, `MTART` equivalents) on the target system. Do not use this name in production until verified in ADT "Released Objects" or api.sap.com.
4. **REUSE_ALV_GRID_DISPLAY release status** — confirm it is absent from the target's released object list (expected, but must be checked).
5. **Intended call channel** — Fiori UI, OData API, or background Application Job. This determines which input pattern (method parameter vs. OData filter vs. job variant) and output pattern (List Report vs. API response vs. spool) are correct replacements.
6. **Authorization concept** — the legacy report relies on implicit GUI authorizations. The migrated artefact must define explicit authorization checks using released authorization objects; the relevant objects must be identified and confirmed.
7. **SELECT-OPTIONS replacement pattern** — whether the filter should become an OData query option, a method parameter of type `RANGE OF matnr`, or a job selection variant depends on decision 5 above.
