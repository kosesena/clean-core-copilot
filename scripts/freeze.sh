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
[ -r "$PRIV/baseline.md" ] || { echo "Cannot read $PRIV/baseline.md" >&2; exit 1; }
# Hash in separate, checked steps: in a pipeline sh would only see the last
# command's status and a failed shasum could produce a freeze without it.
INPUTS=$(cd "$REPO" && shasum -a 256 $(cat scripts/audit-files.txt)) || { echo "Hashing inputs failed" >&2; exit 1; }
BASE=$(cd "$PRIV" && shasum -a 256 baseline.md) || { echo "Hashing baseline failed" >&2; exit 1; }
BASE_HASH=${BASE%% *}
[ ${#BASE_HASH} -eq 64 ] || { echo "Unexpected baseline hash: $BASE" >&2; exit 1; }
TMP=$(mktemp "$REPO/docs/.freeze.XXXXXX")
trap 'rm -f "$TMP"' EXIT
{
  echo "# frozen $(date -u +%Y-%m-%dT%H:%MZ)"
  printf '%s\n' "$INPUTS"
  printf '%s  private/baseline.md\n' "$BASE_HASH"
} > "$TMP"
mv "$TMP" "$OUT"
trap - EXIT
cat "$OUT"
