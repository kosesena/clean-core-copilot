#!/bin/sh
# Freezes inputs added after the main freeze (e.g. Bob's real config wrapper).
# Usage: scripts/freeze-addendum.sh <file>...  (paths relative to the repo)
# Appends to scripts/audit-files.addendum.txt and docs/freeze-addendum.sha256;
# docs/freeze.sha256 is never touched. Commit both before the first audit
# and log the reason in the private baseline-errata.md.
set -eu
REPO=$(cd "$(dirname "$0")/.." && pwd)
[ $# -gt 0 ] || { echo "usage: $0 <file>..." >&2; exit 1; }
cd "$REPO"
for f in "$@"; do
  [ -f "$f" ] || { echo "No such file: $f" >&2; exit 1; }
  grep -qxF "$f" scripts/audit-files.txt && { echo "$f is already in the main freeze" >&2; exit 1; }
  if [ -f scripts/audit-files.addendum.txt ] && grep -qxF "$f" scripts/audit-files.addendum.txt; then
    echo "$f is already in the addendum" >&2; exit 1
  fi
done
LINES=$(shasum -a 256 "$@") || { echo "Hashing failed" >&2; exit 1; }
[ -f docs/freeze-addendum.sha256 ] || echo "# addendum to docs/freeze.sha256" > docs/freeze-addendum.sha256
echo "# added $(date -u +%Y-%m-%dT%H:%MZ)" >> docs/freeze-addendum.sha256
printf '%s\n' "$LINES" >> docs/freeze-addendum.sha256
printf '%s\n' "$@" >> scripts/audit-files.addendum.txt
cat docs/freeze-addendum.sha256
