#!/bin/sh
# Hashes the audit inputs and the private baseline into docs/freeze.sha256.
# Run after Sena's baseline review, commit the result before the first Bob task.
# Refuses to replace an existing freeze unless --force is given.
set -eu
REPO=$(cd "$(dirname "$0")/.." && pwd)
PRIV=${PRIVATE_DIR:-"$HOME/Desktop/clean-core-copilot-private"}
OUT="$REPO/docs/freeze.sha256"
if [ -e "$OUT" ] && [ "${1:-}" != "--force" ]; then
  echo "$OUT already exists (a freeze is final). Use --force only to redo an uncommitted freeze." >&2
  exit 1
fi
TMP=$(mktemp "$REPO/docs/.freeze.XXXXXX")
trap 'rm -f "$TMP"' EXIT
{
  echo "# frozen $(date -u +%Y-%m-%dT%H:%MZ)"
  (cd "$REPO" && shasum -a 256 $(cat scripts/audit-files.txt))
  (cd "$PRIV" && shasum -a 256 baseline.md | sed 's#  #  private/#')
} > "$TMP"
mv "$TMP" "$OUT"
trap - EXIT
cat "$OUT"
