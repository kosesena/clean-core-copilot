#!/bin/sh
# Hashes the audit inputs and the private baseline into docs/freeze.sha256.
# Run after Sena's baseline review, commit the result before the first Bob task.
set -eu
REPO=$(cd "$(dirname "$0")/.." && pwd)
PRIV=${PRIVATE_DIR:-"$HOME/Desktop/clean-core-copilot-private"}
{
  echo "# frozen $(date -u +%Y-%m-%dT%H:%MZ)"
  (cd "$REPO" && shasum -a 256 $(cat scripts/audit-files.txt))
  (cd "$PRIV" && shasum -a 256 baseline.md | sed 's#  #  private/#')
} > "$REPO/docs/freeze.sha256"
cat "$REPO/docs/freeze.sha256"
