#!/usr/bin/env bash
set -euo pipefail

echo "[impl-2] Smoke test..."
claude --version
claude -p 'ping' --output-format json >/tmp/impl-2-smoke.json
cat /tmp/impl-2-smoke.json
rm /tmp/impl-2-smoke.json
echo "[impl-2] OK"
