# Verification review — 24 September 2026

## Confirmed from the event UI

- Registration displays Enrolled.
- Kickoff: Friday 25 September, 18:00 TRT.
- Published submission deadline: Sunday 27 September, 18:00 TRT.
- Bob task-session summary screenshots are requested.

The 40-coin limit, no-top-up policy, Markdown export requirement and UI path
for consumption are reported from the May guide, not independently verified
for Bob 2.0. Keep them as conservative working constraints and confirm at kickoff.

## First SAP check

SAP S/4HANA 2025 FPS01 documentation identifies `I_OperationalAcctgDocItem`
as an operational accounting item view with BSEG as its data source.
This confirms the name and documented purpose in that product version.
It does NOT establish the release contract or availability in the user's
target environment. It is not evidence that it exists in a standalone BTP
ABAP trial system.

Source: https://help.sap.com/docs/SAP_S4HANA_ON-PREMISE/ee6ff9b281d8448f96b4fe6c89f2bdc8/f585d657f8a28a3de10000000a441470.html

The previous claim that BSEG was replaced by ACDOCA was removed. Review the
remaining catalogue before treating any row as ground truth.

## Verification still required

- Record target product, exact release and language version.
- For every candidate object, record release contract, applicable use,
  target version, source and verification date. A documented object name
  does not by itself prove ABAP Cloud usability.
- Check CC-10 statement variants individually rather than declaring every
  old-looking construct forbidden.
- Separate syntax restrictions, API release classifications and performance
  advice; avoid assigning SAP A–D levels solely from keyword matches.
- A static hosted report is an evidence/demo page, not proof of a running
  analyzer or a successfully activated ABAP implementation.

SAP release metadata reference: https://github.com/SAP/abap-atc-cr-cv-s4hc
ABAP language reference: https://help.sap.com/docs/abap-cloud/abap-cloud/abap-language

## Immediate session capture protocol

After each real Bob task, capture the task Markdown, consumption screenshot,
before/after coin balance, task purpose and output file references. Review
the Markdown and screenshot for credentials and private system information
before placing sanitized copies in public-repo `bob_sessions/`. Keep raw
exports outside the public repository. Never fabricate session evidence.

## Evaluation

Freeze a manually reviewed expected-findings list before Bob's audit. Count
correct, incorrect and missed findings against that list; de-duplicate findings
by rule and source location. Record unresolved cases separately. A fixed rule
catalogue improves traceability but cannot guarantee absence of hallucinations.

## Other items

GlovesOn visibility, employer-name removal and BTP_TRIAL configuration were
not changed in this review. The pasted planning message is not independent
authorization to publish another repository or a verified diagnostic of the
current MCP connection.
