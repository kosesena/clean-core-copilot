# Review — ZFI_VENDOR_AGING modernization, Bob task 5

**Run:** 25 Sep 2026, 21:07–21:50 TRT. Same workspace and mode as the
audits. One task, one prompt (the audit JSON was named as approved input).
Cost: **0.807 Bobcoin**, 38.5k / 270k context. Bob asked for approval six
times: four new files, then two diffs to fix its own compile error (see
below). Every write went to `modernized/zfi_vendor_aging/`; nothing else
was touched.
**Output:** `modernized/zfi_vendor_aging/` — CDS view entity, ABAP class,
ABAP Unit test class, README. Copied unchanged.

This is a **code review by Claude**, not a measurement. There is no answer
key for modernized code. Nothing below was compiled, activated or run on
an SAP system; every statement about behaviour is from reading the source.
Codex's point stands: *approval to write a file is not technical
verification.*

## What Bob produced

| File | What it is | Replaces |
|------|-----------|----------|
| `I_VendorOpenItem_VAgeing.cds` | CDS view entity over `I_OperationalAcctgDocItem` ⋈ `I_Supplier`, filtered to vendor open items | F-01 `SELECT … FROM bseg JOIN lfa1`, F-02 |
| `zcl_vendor_aging.abap` | Class: `run()` → select via CDS → `assign_buckets` → `write_log` (ABAP SQL); `hand_off_to_treasury` stub | F-03 `EXEC SQL`, F-04 header line, F-05 `DATASET`, F-06 `SUBMIT`, F-08 `REPORT` |
| `zcl_vendor_aging_test.abap` | 7 ABAP Unit tests: bucket edges 0/30/31/60/61, key-date default, open item bucketed | — |
| `README.md` | Per-finding legacy→modern table (F-01…F-08) + 10-item "What a human must still decide" | — |

## What holds up

- **Every unverified name is labelled.** Both consumed views, four field
  names, the predicate fields, the Z-table and the class names carry a
  `candidate` comment. The CDS header has a six-step "before activating"
  checklist. The README opens with *Needs target verification*. The mode's
  verification discipline survived into the code, not just the report.
- **Business rules carried over and pinned.** Thresholds 30/60 became
  named constants; the tests hit both sides of each boundary (30→`0-30`,
  31→`31-60`, 60→`31-60`, 61→`60+`). This is exactly what the mode asked for.
- **Integration point made explicit instead of faked.** No fake HTTP call;
  `hand_off_to_treasury` is a stub that returns `ev_subrc = 4` and lists
  four architecture options for a human. Better than inventing an API.
- **Self-correction.** The test class called `assign_buckets_for_test`, a
  method that did not exist; `assign_buckets` was private. Bob noticed
  before finishing, added `FRIENDS zcl_vendor_aging_test` (the idiomatic
  ABAP Unit way) and a public wrapper, and applied both as diffs. Two
  approvals, one real fix. Worth showing in the demo as a Bob capability.
- **Prompt boundaries respected.** `samples/legacy/` and `reports/` untouched.

## What a reviewer would send back

| # | Where | Issue | Severity |
|---|-------|-------|----------|
| R1 | CDS `key` | Key is `CompanyCode, Supplier, AccountingDocument`; no `AccountingDocumentItem`. A document with two vendor lines yields two rows with the same key. Not necessarily an activation error, but a wrong data model for a line-item view. **Review finding, to be checked on target** (Codex's framing) | High |
| R2 | class `assign_buckets` | Age = `key_date − net_due_date`, unchanged from legacy. The answer key's bonus F11 (due dates after the key date give a negative age that lands in `0-30`) is carried over unfixed, and the test `bucket_due_today` (age 0) pins the behaviour without probing negatives. Behaviour-preserving migration is defensible; not flagging it is not | Medium |
| R3 | class `select_open_items` | Fields `net_due_date`, `amount_cc_currency` are read with `INTO CORRESPONDING FIELDS`, but the CDS exposes `NetDueDate`, `AmountInCompanyCodeCurrency`, `SupplierName`, `AccountingDocument`. CamelCase CDS element names do not correspond to the snake_case ABAP structure components; the SELECT list also names snake_case columns that do not exist on the view. **Would not activate as written.** Bob wrote the CDS and the class in the same task and did not reconcile the names | High |
| R4 | class | Both `FRIENDS` and a public `assign_buckets_for_test` wrapper: one of the two is redundant. With `FRIENDS`, the test could call the private method directly | Low |
| R5 | class `hand_off_to_treasury` | `ASSERT it_items IS NOT INITIAL OR it_items IS INITIAL` — a tautology to silence an unused-parameter warning. Cosmetic, but it is the kind of line a reviewer notices | Low |
| R6 | class | `"#EC CI_NOWHERE` pseudo-comments on statements that *have* a `WHERE`. Misapplied suppression | Low |
| R7 | test `key_date_defaults_to_today` | Claims to test the default, but passes `sy-datum` explicitly to the wrapper; `run()`'s `COND` defaulting is never exercised. Test name promises more than it checks | Medium |
| R8 | test `open_item_is_bucketed` | Asserts only that the bucket is non-empty; the open-item filter lives in the CDS and is untested, which the test comment admits | Low |
| R9 | CDS | `-- candidate:` comments between annotations and `define view`; CDS DDL accepts `--` and `/* */`, so fine, but the `@AbapCatalog.viewEnhancementCategory` annotation belongs to classic CDS views and is not valid on a view *entity* | Medium, to verify |
| R10 | README F-08 | Still frames the classic `REPORT` under CC-09 (the stretched rule from the audit); the modernization is right, the citation is not | Low |

R3 is the finding that matters: the read side and the class do not agree
on element names. A human would catch it in the first activation attempt.
Without a target system it stays a review finding, not a measured result.

## Reading for the deck

- Modernization is where Bob's output stops being *verifiable by reading*
  and starts needing a system. The audit numbers (27/29) were checkable
  against an answer key; this code is not checkable until it is activated.
- The honest claim: *Bob produced a structurally correct migration skeleton
  with the verification discipline intact, one probable activation error
  (R3), one data-model gap (R1), and a legacy bug carried over (R2). A
  reviewer's pass is still required.*
- Cost of the whole pipeline for one program: 0.165 (audit) + 0.807
  (modernization) ≈ **1 Bobcoin**, ~45 minutes of Bob time.

## Not done, by choice

- Not activated on BTP_TRIAL. Doing so would turn R1/R3/R9 from review
  findings into facts and produce the ATC / ABAP Unit records Codex's case
  viewer is built for. That is Sena's call: it costs setup time, not
  Bobcoin.
- Other three programs not modernized. ZFI was chosen because it exercises
  the most finding types (read, write, file, submit, native SQL).
