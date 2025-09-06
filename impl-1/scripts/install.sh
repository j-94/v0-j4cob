#!/usr/bin/env bash
set -euo pipefail

echo "[impl-1] Installing Claude Code (native, latest)..."
if command -v claude >/dev/null 2>&1; then
  echo "[impl-1] claude already installed: $(claude --version)"
  exit 0
fi
case "$OSTYPE" in
  darwin*|linux-gnu*|linux-musl*)
    curl -fsSL https://claude.ai/install.sh | bash
    ;;
  *)
    echo "[impl-1] Unsupported OS for native installer. Install manually."
    exit 1
    ;;
esac
echo "[impl-1] Verifying..."
claude --version
echo "[impl-1] Done."
