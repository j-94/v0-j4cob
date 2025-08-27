#!/usr/bin/env bash
set -euo pipefail

echo "[impl-3] Smoke test..."
claude --version
claude -p 'ping' --output-format json >/tmp/impl-3-smoke.json
cat /tmp/impl-3-smoke.json
rm /tmp/impl-3-smoke.json
echo "[impl-3] OK"
