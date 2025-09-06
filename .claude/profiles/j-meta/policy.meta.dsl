SYSTEM: "Anthropic CLI Heuristics Controller (Meta-DSL Profile v1.0)"

POLICY (DSL):
  budget(time=600000ms,tokens=6000,memory=512)
  src(strict)
  mem(thresh=0.88)
  rule(SAFE-CITATIONS)        # prefer commands/examples over claims

# ───────────────────────────────── ENV / PERMISSIONS ─────────────────────────────
ENV:
  require(file="CLAUDE.md", purpose="quick rules + commands + style + tests")
  require(file=".claude/settings.json", purpose="allow/deny tools + env + defaults")
  tools(allow=[
    "git","gh","grep","rg","fd","jq","sed","awk","bash",
    "node","pnpm|npm|yarn","python","pytest","uv","go","bun",
    "make","docker","git worktree","pytest","coverage","ruff|eslint|prettier",
    "pytest -q","pytest -k","pytest --maxfail=1"
  ])
  tools(deny=["curl http*", "sudo *", "rm -rf /", "rm -rf .*", "scp *", "ssh *"])
  secrets(never_in_prompts=true)
  envvars(inherit=true)        # picked up from shell or settings.json
  mcp(servers=["browser","db","viz","bq","puppeteer","ios-sim"], debug_flag="--mcp-debug")
  sandbox(
    when="dangerously_skip_permissions || auto_accept",
    use="docker",
    net="off",
    fs="throwaway",
    comment="Safe YOLO runs only inside disposable container/branch"
  )

# ──────────────────────────────── LIFECYCLE GUARDRAILS ───────────────────────────
LIFECYCLE:
  phase("setup") {
    assert(file="CLAUDE.md", on_fail=create(template="minimal_guidelines"))
    assert(file=".claude/settings.json", on_fail=create(template="safe_defaults"))
    register(commands_dir=".claude/commands", global_fallback="~/.claude/commands")
  }

  phase("task_switch") {
    action("/clear")                 # free context when changing topics
    close(files="large_unused")      # keep context focused
  }

# ───────────────────────────────── PROMPTING HEURISTICS ──────────────────────────
PROMPTING:
  trigger("think hard")       → compute(boost=HIGH, mode="plan")
  trigger("plan before coding")→ gate(step="PLAN", block="CODE")
  trigger("don’t code yet")   → forbid(actions=["write","edit"], until="PLAN_APPROVED")
  trigger("simplify")         → refactor(target="lowest-complexity")

# ────────────────────────────── CORE WORKFLOW (E→P→C→C) ──────────────────────────
WORKFLOW "Explore→Plan→Code→Commit":
  step EXPLORE {
    read(target=USER_HINT || REPO_SCOPE)
    find(errors|entrypoints|owners|tests)
    output(analysis.md, include=["what","where","why","risks"], no_code=true)
  }
  step PLAN {
    checklist(create=true, file="todo.md", source=analysis.md)
    outline(steps<=7, constraints=["tests pass","coding style","no secrets"])
    require(approval="human_or_agent_reviewer")    # meta-approval gate
    setflag(PLAN_APPROVED=true)
  }
  step CODE {
    guard(PLAN_APPROVED)
    execute(increments="small", granularity="file|function")
    scratchpad(file="scratch.md", keep=true)
    run(tests="fast", allow=["pytest -q","pnpm test -w 1"])
    visual_loop(when="ui", via=["mcp:puppeteer","image compare"], iterate<=3)
  }
  step COMMIT {
    git.add(changes="scoped")
    git.commit(message=autogen(from="diff + plan + issue"), signoff=true)
    git.push(when="branch_protected? false : true")
  }

# ─────────────────────────────── CHECKLISTS & SCRATCH ────────────────────────────
TRACKING:
  checklist(source="failing tests|lints|bugs", file="todo.md", live=true)
  scratchpad(file="scratch.md", contents=["pseudocode","decisions","open_qs"])

# ───────────────────────────────── GIT & ISSUE MGMT ──────────────────────────────
GIT:
  qna(enabled=true)           # "who changed X and why?"
  ops([
    "git log -p -- path", "git diff --staged", "git bisect", "git cherry-pick",
    "gh pr create", "gh pr view -w", "gh issue list", "gh issue view $ID"
  ])
  commit_style(conventional=true, include=["scope","why","Co-authored-by?"])

# ─────────────────────────────── ADVANCED TECHNIQUES ─────────────────────────────
ADVANCED:
  parallel_sessions(max=4) {
    isolate(scope="module|feature|branch")
    worktree(use=true)
    notify(on="permission_request|test_done")
  }

  multi_agent_validation {
    agent(writer)  { context=current }
    agent(reviewer){ context="/clear"; role="unit tests + critique"; fail_on_uncertainty=true }
    feedback(loop="review→fix→retest", max_cycles=2)
  }

  safe_yolo {
    require(branch~="scratch|throwaway", sandbox=true)
    precheckpoint(git.commit("checkpoint: before YOLO"))
    run(auto_accept=true, limit_steps=200, limit_runtime="20m")
    post_review(diff=true); on_mess(revert=true)
  }

  checkpoint_strategy {
    commit(often=true, min_every="15m or major-file-change")
    rollback(cmd="git reset --hard @~1 || git restore -SW .")
  }

  one_shot_then_iterate {
    attempt(mode="single-pass", allow_fail=true)
    if(fail){ switch_to="WORKFLOW", reuse="diff_as_hypothesis" }
  }

# ─────────────────────────────── CI / HEADLESS AUTOMATION ────────────────────────
AUTOMATION:
  headless(job="label_issues") {
    invoke("claude -p", input="issue_body", output="json")
    labels=["bug","feature","question"]
    apply_via("gh issue edit --add-labels")
  }
  headless(job="ai_lint") {
    on="pull_request"
    run("claude -p 'review diff for complexity, missing docs, test gaps' --output-format json")
    post(comment="review findings", via="gh pr comment")
  }
  headless(job="test_gen") {
    target="changed files"
    generate("boundary tests")
    open_pr(auto=true, title="[bot] add tests")
  }

# ─────────────────────────────── DATA / VISUAL WORK ──────────────────────────────
VISUAL:
  when(ui_task=true){
    provide(mock|screenshot)
    implement
    capture(screenshot=actual)
    compare(target=mock, tolerance="low")
    iterate(max=3)
  }

# ─────────────────────────────── CONTEXT BUDGETING RULES ─────────────────────────
CONTEXT:
  manage {
    clear(on="new task")
    close(files="giant_unused")
    page_in(data="logs|configs", via="pipes|partial loads")
  }

# ─────────────────────────────── SAFETY & SIMPLIFICATION ─────────────────────────
SAFETY:
  early_interrupt(keys="Esc, EscEsc")
  pause_and_summarize(trigger="mid-run doubt")
  simplify(on_complexity>threshold) { reduce(abstractions, prefer="clarity") }

# ─────────────────────────────── OPTIMIZATION & LOGGING ──────────────────────────
OPTIMIZE:
  targets("tests_pass>=1.0","lint_errors=0","context_clean","runtime<=20m")
  feedback {
    observe(metrics=["failures","undo","time","tokens"])
    adjust(prompts|granularity|parallelism)
  }
  log_json(step="run_complete", include=["plan","diff_stats","commit_sha","metrics"])

# ─────────────────────────────── COMMAND MACROS (Slash) ──────────────────────────
COMMANDS:
  cmd("/fix-github-issue $ID") {
    EXPLORE→PLAN→CODE→COMMIT
    gh.issue.fetch($ID)→analysis.md
    tests(run="fast")
    open_pr(auto=true, link_back=$ID)
  }

  cmd("/refactor-module $PATH") {
    PLAN("outline refactor + risks")
    CODE("small steps; keep tests green")
    COMMIT
  }

  cmd("/ui-implement $MOCK") {
    VISUAL(mock=$MOCK)
    COMMIT
  }

# ─────────────────────────────── RECURSIVE SELF-IMPROVEMENT ─────────────────────
RECURSION:
  eval_suite {
    golden(tasks=["build:lint","test:fast","fix:bug#123 exemplar","ui:pixel-match"]),
    metrics=["pass_rate","time","tokens","undos","rollbacks"],
    store(file=".claude/eval/history.jsonl")
  }

  policy_lint {
    check(files=["CLAUDE.md",".claude/settings.json",".claude/commands/**"]),
    rules=[
      "no-secrets-in-prompts",
      "deny curl http* unless sandbox",
      "commands must have example + rollback note",
      "settings allowlist must reference existing tools"
    ],
    on_violation→open_issue(label="policy-drift", attach="lint_report.md")
  }

  self_heal {
    trigger(on="eval.fail || lint.violation || tool.preflight.fail"),
    plan("smallest-fix-first"),
    create_pr(title="[auto] minimal fix", require_review=true),
    after_merge→rerun(eval_suite), max_attempts=2
  }

  knowledge_growth {
    mine(success_runs≥3, pattern="repeatable"),
    promote_to_command(name="auto‑$slug", source="analysis.md + diff"),
    deprecate(commands with low ROI over 30 days)
  }

  telemetry {
    aggregate(from="log_json/run_complete"),
    classify_failures(["spec_mismatch","env_missing","flaky_test","tool_auth","context_bloat"]),
    adapt {
      if context_bloat→ increase(clear_frequency) & shrink(file_load)
      if env_missing → add(preflight for tool/version/auth)
      if flaky_test   → quarantine(test) & open_issue("flaky")
    }
  }

  tool_preflight {
    check([
      "git --version","gh --version",
      "node -v || python -V","docker info? sandbox-only",
      "auth:gh","rate:gh < threshold"
    ]),
    cache(restore="pnpm|pip|pytest artifacts"),
    pin(deps=true)
  }

  sandbox_guarantees {
    snapshot(before="YOLO", mode="fs+git"),
    hermetic(build=true, net="off"),
    replay(script="reproduce.sh", include=["versions","seeds","inputs"])
  }

  budget_autotune {
    objective="Δ(pass_rate)/Δ(cost) > 0",
    increase(compute) when "two consecutive under-spec plans",
    decrease when "overbudget && pass_rate stable ≥ 0.98"
  }

  watchdogs {
    deadman(timeout="30m no-human-input", action="halt & revert"),
    secret_scan(on="diff", tools=["git-secrets|trufflehog"]),
    egress_guard(deny="curl http*", allow_if=sandbox=true)
  }

  provenance {
    record(plan, prompts, diffs, commit_sha, tool_versions, seed, inputs_hash),
    persist(dir=".claude/provenance/"),
    replayable(true)
  }

  curriculum {
    synthesize_tests(from="recent bugs + PR comments"),
    add_to(eval_suite) if "covers new failure mode"
  }

  spec_extraction {
    derive(spec.md from "code+comments+tests"),
    use(spec.md) as reference during PLAN & REVIEW
  }
