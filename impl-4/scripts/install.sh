#!/usr/bin/env bash
set -euo pipefail

echo "[impl-4] Installing Claude Code (used inside remote workspace)..."
if command -v claude >/dev/null 2>&1; then
  echo "[impl-4] claude already installed: $(claude --version)"
  exit 0
fi
curl -fsSL https://claude.ai/install.sh | bash
claude --version
echo "[impl-4] Done."
