# Task 1 report import verification — 25 September 2026

- Input: `reports/zfi_vendor_aging.json` (raw report unchanged).
- Report SHA-256: `9d49cff8736128ba1c954c972c721bfbf71b61dff937867eb0d25207317c96f5`.
- Schema: `docs/findings.schema.json`, SHA-256 `67ec460aa644c198f99d71cc7a473319b89bbe59d47ed31631cea7feddd8ffb4`.
- Validator: Python jsonschema 4.26.0, Draft202012Validator; schema checked with check_schema, all report errors collected with iter_errors. Result: zero errors.
- Eight findings, eight unique IDs; two observed, six needs_verification, zero verified_on_target.
- Imported through the demo's file chooser. Browser showed ZFI_VENDOR_AGING, eight of eight findings, Needs target verification, and zero of eight review decisions.
- Observed filter returned two of eight findings; restored All statuses.
- Evidence view showed origin bob, human review No, system checks None, and Bob session Not supplied (the raw JSON has bob_session: null).

This is structural validation and a viewer import check, not SAP technical validation or endorsement of the findings. Claude's scoring was not entered as human review. The separate repository session PNG is not linked by the raw report; preserve the raw report and associate evidence separately. Import is in browser memory only and must be repeated after reload.
