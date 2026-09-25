# Task 2 and multiple-report verification — 25 September 2026

- Report: reports/zsd_open_orders.json
- SHA-256: dd1167baf111c1e3a24258fb1b92c7ecb91b5d05c15c32af320441b14b497e19
- Schema: docs/findings.schema.json (frozen schema unchanged).
- Python jsonschema 4.26.0: Draft202012Validator.check_schema + iter_errors: zero errors, 18 findings.
- Browser imported ZFI then ZSD through the file picker: eight of eight and eighteen of eighteen findings, respectively.
- Selector holds both reports plus the distinct design example; further imports add entries without replacing previous runs.
- Set a review decision on the fictional design example, switched to ZFI and ZSD: review counts remained zero/eight and zero/eighteen. Switching back retained the fictional decision. Reset that test decision afterward and left ZSD selected.
- Raw reports and AI scoring were not edited or promoted to human review. Schema validity is not a SAP semantic check. Claude's duplicate, wrong and undecided assessments are not silently removed from the raw findings list.
