Goal: Minimal, auditable Claude Code env with small diffs & TDD.

DoD: See README.

Commands
- Tests (example): `echo '{}' | jq .` (placeholder until real tests exist)
- Doctor: `claude doctor`

Heuristics
- Explore → Plan → Code → Commit
- TDD first; smallest diff
- Ask on push; deny secrets
