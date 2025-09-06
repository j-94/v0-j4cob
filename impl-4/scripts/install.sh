#!/usr/bin/env bash
set -euo pipefail

echo "[impl-4] Checking Claude Code installation..."
if ! command -v claude >/dev/null 2>&1; then
  echo "[impl-4] claude not found; installing (native, latest)..."
  case "$OSTYPE" in
    darwin*|linux-gnu*|linux-musl*)
      curl -fsSL https://claude.ai/install.sh | bash
      ;;
    *)
      echo "[impl-4] Unsupported OS."
      exit 1
      ;;
  esac
fi
claude --version
echo "[impl-4] Done."
