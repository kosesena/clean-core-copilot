# Demo interface prototype

Pre-event UI exploration, created with Codex on 24 September 2026. This is
not an IBM Bob artifact and is not part of the frozen audit input set.
On 25 September at 19:37 TRT, Hamza (lablab.ai) confirmed in the participant
chat that pre-prepared synthetic sample code and demo UI templates may be used
if disclosed in the repository and the core Bob analysis and project logic are
built during the hackathon. This confirmation does not separately name the
rule catalogue or baseline. IBM mascot/animation permission remains pending.

Open `index.html` in a browser, or serve this directory with
`python3 -m http.server 4173 --bind 127.0.0.1`.

The included three findings are fictional design examples for a fictional
program. They are not the project's baseline, measured results or Bob output.
No external scripts, fonts, analytics, network uploads or dependencies.

Working interactions: finding selection, search, verification filter,
source/recommendation/review tabs, report/evidence/preparation navigation,
local JSON report import and JSON export. Import performs basic structural
checks, not full JSON Schema validation or technical verification. Imported
verification claims are explicitly attributed to the input file. Source
snippets display the report's evidence, not an independently loaded source.
Review controls affect this browser session only. Raw imported JSON text stays
unchanged. Export produces a `clean-core-review-bundle-v1` envelope containing
`raw_report_text` and a separate `review_overlay` (decisions keyed by finding ID
and reviewer-reported `missed_by_bob` notes). Bundles can be imported again.
The bundle is a viewer artifact, not a report matching the frozen findings schema.
Imported review notes and new session omissions have distinct labels. Neither
review decisions nor omissions independently establish human authorship or SAP
verification. The viewer explicitly labels itself as recorded output, not a live
analyzer.
No precision, recall, ATC result or coin-use result is invented.

Frozen inputs and private baseline are not loaded, changed or copied here.

Bob mascot artwork: IBM, from https://bob.ibm.com/tr
Original asset: https://bob.ibm.com/assets/bob-standing-BECrMjXJ.webp
Stored unchanged in assets/ibm-bob.webp for the requested private prototype.
Artwork belongs to IBM; this project does not claim authorship or IBM endorsement.
The original-reference HeyGen greeting is stored in assets/bob-greeting.mp4.
HeyGen video ID: 468e1649e81ec323f61393e47997fb53 (3.239 seconds).
Generated mascot greeting, not an audit recording. English captions included.
Click Bob to play once with sound; native video controls allow pausing, seeking
and muting. End or Back to Bob restores the original still. No autoplay or loop.
The clip and captions are local assets; playing sends no data to HeyGen.

## End-to-end case viewer

Open `walkthrough.html` using the local HTTP server. This separate case viewer
was added on 25 September before kickoff; it remains disclosed pre-event
preparation under the conditions above. It is outside the audit allowlist.

Load original and proposed ABAP text, a Bob task record, and activation, ATC
and ABAP Unit execution logs. Set the target system/release/language version.
Check outcomes are explicit user declarations, never parsed or inferred from
logs. They bind to the implementation and execution-record SHA-256 hashes
and target string; changing any of these makes the declaration stale. This
detects local content changes, not forged evidence or deployed object identity.
Blank implementation, execution record, or target cannot support an accepted
outcome declaration, including when a case bundle is imported.
Each case currently covers ONE implementation file, not a multi-object deployment.
Required Bob PNG consumption summaries must still be stored in bob_sessions/.

Export/import uses `clean-core-case-v1`, separate from the frozen findings
schema and existing review bundle. Data stays in memory until exported. Nothing
runs against Bob or SAP, and no success, completeness or measured savings is
asserted from attaching files. All imported contents render as text.

Validation: `node --test demo-prototype/tests/walkthrough.test.mjs`.

The “Load recorded ZFI case” button loads `cases/zfi-modernization.json`, a
snapshot of the original synthetic ZFI source, Bob's proposed class and Bob's
generated modernization README (task output, not a transcript). These texts
are copied verbatim from their repository files. The bundle has an empty
target and no check declarations or execution logs. Seven authored test
methods do not imply seven passing tests. CDS and test-class files remain in
`modernized/zfi_vendor_aging/`; this single-file comparison does not cover
their deployment. The task 5 consumption PNG remains in `bob_sessions/`.
Loading this case replaces the current in-memory case; export edits first.

## Optional mascot display

`demo-config.js` defaults to `SHOW_MASCOT: false` while permission is pending.
The welcome block and greeting player are hidden, and the image, video and
caption sources are not assigned when disabled. After permission is confirmed,
change this single flag to `true` and reload to enable the existing greeting.
Missing configuration also keeps it disabled. This display switch does not
remove media files from the repository, deployment directory or Git history.
Exclude those assets separately from any distribution that must omit them.

## Multiple reports

Import each program JSON using Import report. The Report selector retains all
imports in memory, including separate imports for the same program (numbered
by import order). Switching reports preserves each report's raw JSON, review
decisions and omission notes separately. Selecting the design example does
not discard imports. Search and status filters reset on a report switch.
Export JSON exports only the selected report and its review overlay; export
each report before closing or reloading. No report is automatically fetched,
persisted or scored, and this does not turn the viewer's basic import checks
into full schema validation.
