# Trial stubs (test doubles) — not Bob output

Added 26 Sep 2026 evening so that `ZCL_VENDOR_AGING` can activate on the
BTP trial and its seven ABAP Unit tests can run. Decision: Sena, with
Codex's and Claude's recommendation; the two results are kept apart:

| Result | What it proves | What it does not prove |
|--------|----------------|------------------------|
| 7 unit tests run against the stub | the bucket / key-date logic Bob wrote | anything about SAP finance data |
| CDS view failed on the real sources | Bob's "candidate" markers were right | — |

| Object | Role | Source |
|--------|------|--------|
| `ZFI_AGING_LOG` | the customer log table Bob *assumed* ("candidate table name") | `ZFI_AGING_LOG.tabl.asddls` |
| `ZFI_VOI_STUB` | empty table that stands in for the two missing SAP views | `ZFI_VOI_STUB.tabl.asddls` |
| `ZI_VENDOROPENITEM_VAGEING` (stub version) | same element names and types as Bob's view, reads the stub table | `ZI_VENDOROPENITEM_VAGEING.stub.ddls.asddls` |

Bob's class source is **not** changed. Bob's original view source stays in
`../ZI_VENDOROPENITEM_VAGEING.ddls.asddls`; on the trial it is replaced by
the stub version above.
