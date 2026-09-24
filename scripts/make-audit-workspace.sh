#!/bin/sh
# Builds the folder Bob works in: only the files in audit-files.txt, no .git,
# no plan/notes/baseline. Bob's outputs (reports/, modernized/, bob_sessions/)
# are copied back into the repo by hand after review.
# Refuses to build unless the inputs match the committed docs/freeze.sha256.
set -eu
REPO=$(cd "$(dirname "$0")/.." && pwd)
DEST=${1:-"$HOME/Desktop/ccc-bob-audit"}
FREEZE="$REPO/docs/freeze.sha256"
[ -e "$FREEZE" ] || { echo "No docs/freeze.sha256 yet: run scripts/freeze.sh and commit first" >&2; exit 1; }
git -C "$REPO" diff --quiet HEAD -- docs/freeze.sha256 && git -C "$REPO" ls-files --error-unmatch docs/freeze.sha256 >/dev/null 2>&1 \
  || { echo "docs/freeze.sha256 is not committed" >&2; exit 1; }
ADD_LIST="$REPO/scripts/audit-files.addendum.txt"
ADD_FREEZE="$REPO/docs/freeze-addendum.sha256"
if [ -e "$ADD_LIST" ] || [ -e "$ADD_FREEZE" ]; then
  [ -e "$ADD_LIST" ] && [ -e "$ADD_FREEZE" ] || { echo "Addendum list and addendum freeze must both exist" >&2; exit 1; }
  for f in scripts/audit-files.addendum.txt docs/freeze-addendum.sha256; do
    git -C "$REPO" ls-files --error-unmatch "$f" >/dev/null 2>&1 && git -C "$REPO" diff --quiet HEAD -- "$f" \
      || { echo "$f is not committed" >&2; exit 1; }
  done
fi
FILES=$(cat "$REPO/scripts/audit-files.txt"; [ -e "$ADD_LIST" ] && cat "$ADD_LIST" || true)

[ -e "$DEST" ] && { echo "$DEST already exists; remove it or pass another path" >&2; exit 1; }
mkdir -p "$DEST/reports" "$DEST/modernized"
# From here on, any failure removes the half-built folder.
trap 'rm -rf "$DEST"' EXIT
while IFS= read -r f; do
  [ -n "$f" ] || continue
  mkdir -p "$DEST/$(dirname "$f")"
  cp "$REPO/$f" "$DEST/$f"
done <<LIST
$FILES
LIST
(cd "$DEST" && shasum -a 256 $FILES) > "$DEST/MANIFEST.sha256"
# Every copied file must appear, with the same hash, in the committed freeze.
{ grep -v '^#' "$FREEZE" | grep -v '  private/'; [ -e "$ADD_FREEZE" ] && grep -v '^#' "$ADD_FREEZE" || true; } | sort > "$DEST/.expected"
sort "$DEST/MANIFEST.sha256" | diff "$DEST/.expected" - \
  || { echo "Audit inputs differ from the committed freeze; aborting" >&2; exit 1; }
rm "$DEST/.expected"
trap - EXIT
echo "Audit workspace: $DEST (matches docs/freeze.sha256$([ -e "$ADD_FREEZE" ] && echo " + freeze-addendum.sha256"))"
