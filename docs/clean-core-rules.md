# Clean Core rule catalogue

The versioned review catalogue that Bob's custom mode reads.

**Draft, not a validated compliance oracle.** See `verification-notes.md`.
A rule ID alone does not establish correctness or target compatibility.
All suggested object names remain candidates until target-specific release
contract and business semantics are verified. Every finding Bob
reports must cite one rule ID from this file — if no rule fits, Bob says so
instead of inventing one.

Levels follow SAP's A–D clean core extensibility model:
**A** = ABAP Cloud / released APIs · **B** = classic but stable APIs (e.g. BAPIs) ·
**C** = SAP-internal objects · **D** = not recommended (modifications, direct
writes to SAP tables).

> ⚠️ Replacement object names are starting points. Before the demo, confirm each
> one in the Released Objects list (ADT "Released Objects" tree or
> api.sap.com) — a wrong CDS name in front of the jury costs more than a
> missing one.

| ID | Pattern (what to detect) | Level | Why it blocks the cloud | Released direction |
|----|--------------------------|-------|-------------------------|--------------------|
| CC-01 | `SELECT` on SAP tables (`VBAK`, `VBAP`, `VBUP`, `KNA1`, `LFA1`, `MBEW`…) | C | Check target-specific object release status and simplification guidance; do not assume every table has the same status | Released CDS views: `I_SalesDocument`, `I_SalesDocumentItem`, `I_Customer`, `I_Supplier`, `I_Product` |
| CC-02 | `SELECT` on `BSEG` / `BSIK` / `BSAK` | C | BSEG still exists alongside ACDOCA; verify source semantics, compatibility objects and target release status separately | `I_OperationalAcctgDocItem` (open items: clearing fields) |
| CC-03 | `UPDATE` / `MODIFY` / `INSERT` / `DELETE` on SAP tables | D | Bypasses business logic, locks, change documents | Released RAP BO via EML, or a released API |
| CC-04 | `CALL TRANSACTION` / BDC (`BDCDATA`) | D | No SAP GUI in ABAP Cloud; screen replay is not an API | Released RAP BO / OData API for the same object |
| CC-05 | `EXEC SQL … ENDEXEC` (native SQL) | D | Not allowed in ABAP Cloud; DB-specific | ABAP SQL; AMDP only if truly needed |
| CC-06 | `OPEN DATASET` / `TRANSFER` / `CLOSE DATASET` | C | No application-server file system access | Communication arrangement + outbound API, or event |
| CC-07 | `SUBMIT` / background job scheduling via `JOB_OPEN` | C | Reports can't be called; jobs need a catalog entry | Application Jobs (`CL_APJ_RT_API`) |
| CC-08 | Non-released function modules (`POPUP_TO_CONFIRM`, …) | C | Not in the released API list | UI → Fiori elements action with confirmation; logic → released class |
| CC-09 | Classic list output (`WRITE`, `ULINE`, `SKIP`, `AT NEW` for layout) | C | No list processing / SAP GUI in ABAP Cloud | RAP query + Fiori elements List Report |
| CC-10 | Obsolete syntax: `OCCURS`, `WITH HEADER LINE`, `TABLES`, `LIKE` on DB fields, `MOVE`, `ADD … TO` | B/C | Not allowed in ABAP for Cloud Development language version | Modern declarations, inline `DATA( )`, `VALUE #( )` |
| CC-11 | `FORM` / `PERFORM` | C | Subroutines are obsolete in the cloud language version | Private methods of a class |
| CC-12 | Nested `SELECT … ENDSELECT` / `SELECT` inside loops | — (performance) | Not a cloud blocker, but migration is the time to fix it | One joined CDS-based select |

## Output contract

For each finding Bob returns:

```
[CC-xx] <file>:<line>  Level <A–D>
What:     <the exact statement>
Why:      <one sentence, business-readable>
Instead:  <released object / pattern>
Effort:   S | M | L
```

Then a short summary: count per level, and a migration verdict —
**Ready** (only A/B) · **Refactor** (C present, no D) · **Rebuild** (any D).

## Verification gate

Do not issue the draft Ready/Refactor/Rebuild verdict above as a compliance
conclusion. Report `Needs target verification` until product, release, language
version and relevant checks are known. Level B does not automatically mean
usable in ABAP for Cloud Development; a Level D finding does not by itself
prove that the whole application must be rebuilt. Syntax/performance findings
must be distinguished from API-based clean-core levels.

Each finding also needs `target_product`, `target_release`, `language_version`,
`source_url`, `verification_status`, and `unknowns`. No fitting rule means
`Unclassified`; no verified replacement means `Needs verification`.
