#!/usr/bin/env bash
set -euo pipefail

VER="${CLAUDE_CODE_VERSION:-}"

echo "[impl-2] Installing Claude Code (native, pinned=${VER:-latest})..."
if command -v claude >/dev/null 2>&1; then
  echo "[impl-2] claude already installed: $(claude --version)"
  exit 0
fi
case "$OSTYPE" in
  darwin*|linux-gnu*|linux-musl*)
    if [ -n "$VER" ]; then
      curl -fsSL https://claude.ai/install.sh | bash -s "$VER"
    else
      curl -fsSL https://claude.ai/install.sh | bash
    fi
    ;;
  *)
    echo "[impl-2] Unsupported OS for native installer."
    exit 1
    ;;
esac
claude --version
echo "[impl-2] Done."
