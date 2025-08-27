#!/usr/bin/env bash
set -euo pipefail

echo "[impl-1] Smoke test..."
claude --version
claude -p 'ping' --output-format json >/tmp/impl-1-smoke.json
cat /tmp/impl-1-smoke.json
rm /tmp/impl-1-smoke.json
echo "[impl-1] OK"
