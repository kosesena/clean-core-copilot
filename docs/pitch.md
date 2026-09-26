# Pitch — Clean Core Copilot

## 60 seconds (video opening, lablab "problem / solution" fields)

Every company moving to S/4HANA Cloud carries hundreds of custom ABAP
programs written over fifteen years. Each one has to be checked against
Clean Core rules before it can move — and today that review is done by hand,
by the few people who still know both the old and the new world. It is slow,
expensive and inconsistent.

I asked a narrower question than "can IBM Bob do this review": **how well
does it do it, measured?**

So I built the exam before I built the demo. Four synthetic legacy programs
with forty-one planted issues. A twelve-rule Clean Core catalogue. An answer
key, frozen by hash the day before the kick-off so nothing could be adjusted
after seeing Bob's output. Then a Bob custom mode — *Clean Core Architect* —
that audits against the catalogue only, never invents a rule, and never
claims something is verified on a system it has not seen.

The result: Bob found **27 of 29** catalogue violations on the right lines.
It found **1 of 12** business-logic defects — the revaluation drift, the dead
BDC path, the wrong key date. It never claimed anything was verified. It
rewrote one program into a CDS view, a class and seven unit tests; on a real
BTP system the class activated and the view failed on exactly the two objects
Bob had marked *candidate*.

Bob is a strong first reviewer for catalogue rules and a weak one for
business logic. The human stays in the loop — and now I can say where, with
numbers. Total cost: about four Bobcoin of a forty-coin budget, three more
rewrites included.

## 15 seconds (if someone asks in the hallway)

I measured IBM Bob as a Clean Core reviewer against a frozen answer key:
93 % on catalogue rules, 8 % on business-logic defects, zero invented
verifications. The rewrite it produced activated on a real system except
where it had already said "verify this".

## One line (repo description, form title)

Legacy ABAP audited by IBM Bob, scored against a frozen answer key — every
claim labelled, nothing verified that wasn't.

## Judging criteria, mapped

| Criterion | Where the evidence is |
|-----------|------------------------|
| Application of technology | README §How Bob is used; `bob_sessions/` (6 badges, self-correction in task 5); custom mode with Read+Edit only; what was *not* used, stated |
| Business value | README §The problem; `docs/scoring/` totals (27/29, 1/12, 6/40 duplicates); cost 2.5/40 Bobcoin; `docs/activation/` (real system outcome) |
| Originality | The measurement itself: planted issues, frozen key, isolated workspace, precision/recall split into catalogue vs. business logic |
| Presentation | Demo page (Overview → Findings → Before/after → Evidence), video (docs/video-plan.md), this pitch |

## Do not say

- "Bob is 93 % accurate" without "against a frozen answer key for synthetic samples"
- "verified", "tested on SAP" for anything except the trial activation record
- "parallel tasks / sub-agents" unless they have actually been used by then
