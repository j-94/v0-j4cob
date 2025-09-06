#!/usr/bin/env bash
set -euo pipefail

echo "[impl-4] Smoke test..."
claude --version
claude -p 'ping' --output-format json >/tmp/impl-4-smoke.json
cat /tmp/impl-4-smoke.json
rm /tmp/impl-4-smoke.json
echo "[impl-4] OK"
