#!/usr/bin/env bash
set -euo pipefail

echo "[impl-3] Installing Claude Code via npm..."
if command -v claude >/dev/null 2>&1; then
  echo "[impl-3] claude already installed: $(claude --version)"
  exit 0
fi
if ! command -v npm >/dev/null 2>&1; then
  echo "[impl-3] npm not found. Install Node 18+ first."
  exit 1
fi
npm install -g @anthropic-ai/claude-code
claude --version
echo "[impl-3] Done."
