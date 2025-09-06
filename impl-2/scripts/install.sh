#!/usr/bin/env bash
set -euo pipefail

VER="${CLAUDE_CODE_VERSION:-}"
echo "[impl-2] Installing Claude Code (native, pinned=${VER:-latest})..."
if command -v claude >/dev/null 2>&1; then
  if [[ -n "$VER" && $(claude --version) == *"$VER"* ]]; then
    echo "[impl-2] claude version $VER already installed."
    exit 0
  elif [[ -z "$VER" ]]; then
    echo "[impl-2] claude already installed: $(claude --version)"
    exit 0
  fi
fi
if [[ "$OSTYPE" == "darwin"* || "$OSTYPE" == "linux-gnu"* || "$OSTYPE" == "linux-musl"* ]]; then
  if [[ -n "$VER" ]]; then
    curl -fsSL https://claude.ai/install.sh | bash -s "$VER"
  else
    curl -fsSL https://claude.ai/install.sh | bash
  fi
else
  echo "[impl-2] Unsupported OS for native installer."
  exit 1
fi

claude --version
echo "[impl-2] Done."
