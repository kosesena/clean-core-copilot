#!/bin/sh
# Builds the folder Bob works in: only the files in audit-files.txt, no .git,
# no plan/notes/baseline. Bob's outputs (reports/, modernized/, bob_sessions/)
# are copied back into the repo by hand after review.
set -eu
REPO=$(cd "$(dirname "$0")/.." && pwd)
DEST=${1:-"$HOME/Desktop/ccc-bob-audit"}
[ -e "$DEST" ] && { echo "$DEST already exists; remove it or pass another path" >&2; exit 1; }
mkdir -p "$DEST/reports" "$DEST/modernized"
while IFS= read -r f; do
  [ -n "$f" ] || continue
  mkdir -p "$DEST/$(dirname "$f")"
  cp "$REPO/$f" "$DEST/$f"
done < "$REPO/scripts/audit-files.txt"
(cd "$DEST" && shasum -a 256 $(cat "$REPO/scripts/audit-files.txt")) > "$DEST/MANIFEST.sha256"
echo "Audit workspace: $DEST"
