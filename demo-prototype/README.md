# Demo interface prototype

Pre-event UI exploration, created with Codex on 24 September 2026. This is
not an IBM Bob artifact and is not part of the frozen audit input set.
Confirm preparation-material eligibility at kickoff before using this in
the submission.

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
