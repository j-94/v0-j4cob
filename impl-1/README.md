impl-1 — Claude Code via Native Installer (latest)

Quickstart

```bash
bash scripts/install.sh
claude --version
claude -p 'say hello' --output-format json
```

Workflow (Explore → Plan → Code → Commit)
1. Explore: "Read tests/ and summarize constraints. Do not edit files."
2. Plan: "Propose smallest diff to pass a test; include risks + rollback."
3. Code: "Write/adjust tests first, run them, then minimal code to pass."
4. Commit: "Show git diff --stat, write scoped commit, then commit."

DoD
• Install succeeds; claude doctor OK.
• Permissions: tests/read auto-allow; pushes ask; secrets denied.
• Headless sample works: claude -p 'ping' --output-format json.

Rollback

If an autonomous run misfires: git reset --hard <last_good> and retry with a simpler plan. Safe-YOLO is discouraged outside sandboxes.
