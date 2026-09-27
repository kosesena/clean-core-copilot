# Demo: plain-language pass 2 (27 Sep) — for a reader who does not know SAP

Owner of the files: Codex (`demo-prototype/`). Author of the text: Claude, on
Sena's requirement "someone who does not know SAP must understand the site".
Apply exactly; keep the 8 tests green.

## 1. Overview: "What this is about" box, above the three steps

**What this is about**

Large companies run their money, orders and stock on **SAP**. Over the years
they wrote thousands of their own add-on programs for it, in SAP's language,
**ABAP**. SAP's new cloud version bans many of the old techniques those
programs use, so every program has to be checked and rewritten before a
company can move. Today that check is slow, manual work done by a few experts.

**IBM Bob** is an AI coding assistant. We asked one question: can Bob do that
check, and how well? To find out, we tested it like an exam.

Collapsible **"Words you will see on this site"** (a `<details>`):

| Term | Meaning |
|---|---|
| Clean Core rules | SAP's list of what old code may no longer do in the cloud version. We wrote our 12-rule list from it. |
| SAP table / data view | Where SAP keeps its data. Cloud code must read it through approved views, not straight from the tables. |
| Old-style / classic | Techniques from the desktop era of SAP that the cloud version rejects. |
| Answer list, sealed | Our list of the 41 hidden problems, locked with a digital fingerprint on 24 Sep, before Bob saw any code. |
| Unit test | A small automatic check that a piece of code gives the right answer. |
| Bobcoin | The credit each hackathon team gets to pay for Bob's work: 40 per team. |

## 2. Rule names (`ruleName` in workspace.js)

| Rule | New text |
|---|---|
| CC-01 | reads SAP data tables directly instead of through an approved view |
| CC-02 | reads finance tables directly |
| CC-03 | writes straight into SAP tables, skipping SAP's checks |
| CC-04 | fakes keystrokes on old SAP screens |
| CC-05 | talks to the database in a raw, non-portable way |
| CC-06 | writes files on the server |
| CC-07 | launches other old-style programs |
| CC-08 | calls SAP functions not open to cloud code |
| CC-09 | prints old-style text screens |
| CC-10 | uses outdated ABAP syntax |
| CC-11 | organises code with outdated subroutines |
| CC-12 | asks the database the same question inside a loop |

## 3. Finding headlines (`findingHeadlines`) — replace where the old text still appears

| Old | New |
|---|---|
| Reads accounting tables whose cloud availability needs checking. | Reads the finance data tables directly; the cloud version may not allow that. |
| Uses native SQL, which ABAP Cloud does not allow. | Talks to the database in a raw way the cloud version does not allow. |
| Uses an old-style table with an implicit header row. | Declares a data table in an outdated way the cloud version rejects. |
| Starts another classic report with SUBMIT. | Launches another old-style program directly. |
| Bob flags the report structure correctly, but uses the wrong rule. | Bob is right that the whole program is old-style, but cites the wrong rule. |
| Declares a work area tied to classic SAP GUI screens. | Uses a data structure tied to the old SAP desktop screens. |
| Bob questions a type reference to a database field. | Bob questions how a variable borrows its type from a database field. |
| Bob questions another type reference to a database field. | Bob questions another variable that borrows its type from a database field. |
| Uses a classic selection screen and a database-field type. | Uses an old-style input screen and a database-field type. |
| Runs database queries inside nested loops. | Asks the database the same question over and over inside a loop. |
| Bob questions MOVE-CORRESPONDING; the assessment disagrees. | Bob questions a normal copy statement; our answer list disagrees. |
| Uses a classic subroutine instead of a method. | Organises code with an outdated construct (a subroutine) instead of a method. |
| Uses another classic subroutine instead of a method. | Another outdated subroutine instead of a method. |
| Calls the classic subroutines flagged above. | Calls the outdated subroutines flagged above. |
| Prints a classic list that needs a cloud UI replacement. | Prints an old-style text screen that the cloud version cannot show. |
| Uses a control break in the classic list output. | Uses an old list-printing feature in that text screen. |
| Uses an older arithmetic statement. | Uses an outdated way of writing a sum. |
| Calls a GUI popup that is unavailable in ABAP Cloud. | Opens a desktop pop-up window that does not exist in the cloud version. |
| Replays SAP GUI screens to change a material. | Fakes keystrokes on old SAP screens to change a material record. |
| Uses classic subroutines instead of methods. | Organises code with outdated subroutines instead of methods. |
| Bob questions declarations; the assessment disagrees. | Bob questions some variable declarations; our answer list disagrees. |
| Uses a selection screen that depends on SAP GUI. | Uses an input screen that only works on the old SAP desktop. |
| Displays a grid through a classic SAP GUI function. | Shows a table on screen through an old desktop-only function. |
| Prints another classic list line; this repeats an earlier issue. | Prints another old-style screen line; repeats an earlier issue. |

Leave Bob's own "reason" text and the Before / after code untouched: they are
labelled as Bob's words / for the technical reader.
