impl-3 — npm global + CI headless

Installs Claude Code via npm and adds a headless CI that runs a read-only JSON review on PRs.

Quickstart

```bash
bash scripts/install.sh
claude -p "ping" --output-format json
```

CI
- See .github/workflows/claude-headless.yml
- Emits a JSON artifact; does not fail builds by default.

Other workflow/DoD/rollback: same as impl-1.
