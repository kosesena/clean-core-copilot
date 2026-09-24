# Hackathon plan — IBM Bob 2.0 (25–27 Sep 2026, solo)

Times in TRT. Kick-off: **Fri 25 Sep 18:00**. Published submission deadline: **Sun 27 Sep 18:00**.
Reconfirm the schedule at kick-off.

## Working constraints from the May 2026 IBM guide

These constraints were reported from the earlier guide; their applicability
to Bob 2.0 has not yet been independently confirmed. Until kickoff, plan
conservatively for a 40-coin cap, no top-ups, and immediate session records.
The coin allocations below are planning limits, not measured task costs.

- Bob IDE must be a **core component**, with the **hackathon-provisioned
  account** (not a personal one).
- Every Bob task used for the project → export the task history (markdown) +
  the consumption-summary screenshot into **`bob_sessions/`** in the repo.
  Do this *right after each task*, not at the end.
- **40 Bobcoins, no top-ups.** Budget below.
- Strip credentials before exporting sessions — the repo goes public.
- lablab submission: slide deck, cover image, demo video, demo URL, public repo.
- Optional: $80 IBM Cloud credits for watsonx (Orchestrate / Granite).

## Bobcoin budget (40)

| Task | Coins | Why Bob, not me |
|------|-------|-----------------|
| Set up custom mode + rules, test on one small file | ~5 | Showcases custom modes/rules |
| Audit the 3 legacy samples (Plan mode) | ~9 | The core demo: findings with rule IDs |
| Modernize ZFI_VENDOR_AGING → CDS + class + ABAP Unit (Code mode) | ~12 | The "wow" moment: before/after |
| Fix-ups after review | ~6 | |
| Reserve | ~8 | Never go under 8 before the video is recorded |

Check usage in Settings → General after every task. If a task blows past its
line, stop and do the rest by hand.

## Timeline

**Before kick-off (Wed–Thu)**
- [x] Register on lablab (Sena) — Enrolled verified on 24 Sep 2026
- [ ] Make GlovesOn public on 26 Sep (Sena times it; takes ~10 min, Sat morning)
- [x] Project skeleton, legacy samples, rule catalogue, mode draft
- [ ] Verify released object names in the rules file
- [x] Baseline drafted — `~/Desktop/clean-core-copilot-private/baseline.md`, outside Bob's workspace; inputs + baseline hashed by `scripts/freeze.sh` into `docs/freeze.sha256` (author's answer key: 29 core +
      11 bonus findings; see its provenance note)
- [x] Baseline frozen 24 Sep (46a1d20): Sena delegated review; author + Codex checked. 29 core + 12 bonus

**Fri 18:00 → Sat**
- [ ] Watch kick-off; note tracks and the exact deadline
- [ ] Ask: may prep material (samples, catalogue, baseline) be used, or must
      everything be created during the event? If the latter, declare the prep
      files as pre-existing research in the README and submission text.
- [ ] Confirm Bob 2.0 coin cap, export format and consumption UI path
- [ ] Open only `~/Desktop/ccc-bob-audit` in Bob; confirm it can't read outside that folder
- [ ] Get Bob access, move mode draft into Bob's real config format. The file Bob
      actually reads is a new input: freeze it with `scripts/freeze-addendum.sh <path>`
      (the main freeze stays untouched) and commit before the first audit. Log path,
      hash and reason in the private `baseline-errata.md`. If the instructions'
      *meaning* changes (not just the format), record it as a new experiment
      version rather than a conversion
- [ ] Audit run on the 4 samples → `reports/*.json` + `.md`, export sessions
- [ ] Review Bob's findings by hand: count correct / wrong / missed

**Sat → Sun before 16:00**
- [ ] Modernize one program end-to-end → `modernized/`
- [ ] If BTP_TRIAL MCP works: activate + run ATC on the generated code (proof
      it compiles). If not: say so honestly in the README.
- [ ] Demo URL: static page rendering `reports/*.json` (GitHub Pages). It is
      labelled as *recorded Bob output + human review*, not a live analyzer
- [ ] Deck + cover + 3-min video
- [ ] Submit with ≥ 2 h margin

## The pitch in one line

Bob doesn't just rewrite old ABAP — it explains *why* each line blocks the
cloud, cites a rule, and leaves what it couldn't verify to a human.

The review count ("Bob found 23 issues, 21 correct, 2 wrong, missed 1")
is the strongest slide: juries trust measured results over claims.

## Review before implementation

See `docs/verification-notes.md`. Fix catalogue assumptions before using it
as the reference for evaluating Bob. A rule ID is traceability, not proof.

## First Bob task

Prompt text: `bob-config-draft/first-task.md` (hashed with the other inputs).
Bob works in a separate copy built by `scripts/make-audit-workspace.sh`: only
the samples, catalogue, verification rules, schema and mode, no `.git`, no plan,
no notes, no baseline.

Start with one sample to calibrate the mode; run the other three only after
the output format is right — a wrong format on four files wastes coins.

## Acceptance checks

- Every finding has a rule ID (or `Unclassified`) and a correct line range.
- A `CALL FUNCTION` inside a comment or string is not reported as a call.
- No object is called "released" without a source; unknown target → no
  `verified_on_target` anywhere.
- The demo page shows the same findings as the JSON — no extra claims.
- The modernized code keeps the legacy business rules (aging buckets,
  empty-result behaviour, material filter) and has a unit test for each.
- Every number in the deck links to the baseline (moved into the repo after the audit) or a report file.

## Measurement

Manual baseline first (frozen, dated), then Bob. Count per sample: correct,
incorrect, partially correct, missed, unclassified. De-duplicate by rule +
line. Note the bias honestly: the samples were written with issues planted, so the
baseline is favourable to catching the planted issues. One synthetic set is
not a general performance claim.
