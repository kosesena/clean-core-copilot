# Verification rules for the audit

Generic rules Bob follows in every audit. Sample-independent.

- Record target product, exact release and language version; unknown stays
  `unknown`.
- For every candidate replacement object, record release contract, applicable
  use, target version, source and verification date. A documented object name
  does not by itself prove ABAP Cloud usability.
- Check CC-10 statement variants individually rather than declaring every
  old-looking construct forbidden.
- Separate syntax restrictions, API release classifications and performance
  advice; don't assign SAP A–D levels from keyword matches alone.
- Business behaviour matters as much as rule violations: state what the
  program does for its user and flag logic that looks wrong, as
  `Unclassified`, with the reason.
- Never set `verification_status` to `verified_on_target`.

References: https://github.com/SAP/abap-atc-cr-cv-s4hc ·
https://help.sap.com/docs/abap-cloud/abap-cloud/abap-language
