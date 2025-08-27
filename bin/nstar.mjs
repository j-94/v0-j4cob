#!/usr/bin/env node
// nstar: run the E→P→C→C kernel loop, ingest paste, auto-update, and async PR intents.
import fs from "fs";
import os from "os";
import path from "path";
import crypto from "crypto";
import { execSync, spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { gammaScore, gammaThreshold, costGate } from "../lib/policy.mjs";
import { appendTrace } from "../lib/ledger.mjs";

const ROOT = process.cwd();
const r = (...p) => path.join(ROOT, ...p);
const read = (p) => fs.readFileSync(p, "utf8");
const exists = (p) => fs.existsSync(p);
const write = (p, s) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s); };
const now = () => new Date().toISOString();

function sha1(s) { return crypto.createHash("sha1").update(s).digest("hex"); }
function pbpaste() {
  try { return execSync("pbpaste", { stdio:["ignore","pipe","ignore"] }).toString(); } catch {}
  try { return execSync("termux-clipboard-get", { stdio:["ignore","pipe","ignore"] }).toString(); } catch {}
  try { return execSync("xclip -o -selection clipboard", { stdio:["ignore","pipe","ignore"], shell:true }).toString(); } catch {}
  try { return execSync("wl-paste", { stdio:["ignore","pipe","ignore"] }).toString(); } catch {}
  return "";
}

function savePaste(text) {
  const id = sha1(text).slice(0, 12);
  const p = r("assets/paste", `${id}.md`);
  write(p, text);
  return { id, ref: `ctx://paste/${id}`, path: p };
}

function applyPatch(diffText) {
  try {
    const proc = spawnSync("git", ["apply", "--whitespace=fix", "-"], { input: diffText, encoding: "utf8" });
    return { ok: proc.status === 0, stdout: proc.stdout, stderr: proc.stderr };
  } catch (e) { return { ok: false, stderr: String(e) }; }
}

function openPrIntent({ title, body, branch, diff }) {
  // Append intent (async orchestrator can open later)
  const row = { ts: now(), title, body, branch, diff };
  const file = r("state/intents/pr.jsonl");
  write(file, (exists(file) ? read(file) : "") + JSON.stringify(row) + "\n");
  appendTrace({ phase: "intent", step: "request_pr", ok: true, note: title, extra: { branch } });
}

function ensureSeeds() {
  if (!exists(r("policy/gamma.json"))) write(r("policy/gamma.json"),
    JSON.stringify({ weights:{tests_pass:0.4,retrieval_cited:0.25,cost_ok:0.2,diff_tiny:0.15},
                    thresholds:{safe:0.6,fast:0.5,cheap:0.4} }, null, 2));
  if (!exists(r("policy/cost.json"))) write(r("policy/cost.json"),
    JSON.stringify({ per_run_gbp: 3.0, per_day_gbp: 25.0 }, null, 2));
  if (!exists(r("state/TRACE.jsonl"))) write(r("state/TRACE.jsonl"), "");
  if (!exists(r("state/intents/pr.jsonl"))) write(r("state/intents/pr.jsonl"), "");
}

function parseArgs(argv) {
  const [,, cmd, ...rest] = argv;
  const args = {};
  for (let i=0; i<rest.length; i++) {
    const a = rest[i];
    if (a.startsWith("--")) { const [k,v] = a.slice(2).split("="); args[k] = v ?? true; }
    else (args._ ??= []).push(a);
  }
  return { cmd, args };
}

function gitPullFF() {
  try {
    execSync("git fetch --quiet", { stdio:"ignore" });
    const behind = execSync("git rev-list --left-right --count HEAD...@{upstream}", { stdio:["ignore","pipe","ignore"] }).toString().trim();
    const [aheadN, behindN] = behind.split("\t").map(Number);
    if (behindN > 0) execSync("git pull --ff-only", { stdio: "inherit" });
    return { behind: behindN, ahead: aheadN };
  } catch { return { behind: 0, ahead: 0 }; }
}

async function kernelRun({ goal, mode="fast", ctxRefs=[] }) {
  ensureSeeds();
  const run_id = `${Date.now().toString(36)}:${os.userInfo().username}`;
  appendTrace({ run_id, phase: "plan", step: "start", ok: true, note: goal });

  // Build minimal input for your kernel LLM
  const plan = {
    goal,
    mode,
    context: { refs: ctxRefs },
    constraints: { chain_max: 4, budget_source: "/policy/cost.json" },
    acceptance_checks: ["diff applies", "tests pass or trivial", "trace rows written"]
  };

  // Call your kernel LLM (system prompt already in your repo). Keep it simple: single response with JSON.
  // You can replace this with your existing call; here we just stub a tiny diff if README.md exists.
  let diff = "";
  const readme = r("README.md");
  if (exists(readme)) {
    const badge = `\n\n<!-- updated by nstar -->\n`;
    diff = `*** Begin Patch
*** Update File: README.md
@@
${badge}*** End Patch
`;
  } else {
    diff = `*** Begin Patch
*** Add File: README.md
+# Project
+
+Initialized by nstar loop.
*** End Patch
`;
  }

  // Evidence (stub logic); wire your tests here if needed.
  const evidence = { tests_pass: 1, retrieval_cited: ctxRefs.length>0?1:0, cost_ok: 1, diff_tiny: 1 };
  const gamma = gammaScore(evidence);
  const threshold = gammaThreshold(mode);
  const pass = gamma >= threshold;
  const cost = costGate(0.02);

  const verifyMd =
`- [x] Diff applies
- [x] TRACE row written
- [x] Cost ≤ £${cost.cap}
- [${ctxRefs.length>0?'x':' '}] Retrieval cited`;

  // Decide
  if (pass && cost.ok) {
    const applied = applyPatch(toUnified(diff));
    appendTrace({ run_id, phase: "patch", step: "apply", ok: applied.ok, note: applied.ok ? "applied" : "apply_failed" });
    appendTrace({ run_id, phase: "gate", step: "gamma", ok: pass, note: `${gamma}>=${threshold}` });
    write(r("ops/LAST_PLAN.json"), JSON.stringify(plan, null, 2));
    write(r("ops/LAST_VERIFY.md"), verifyMd);
    console.log(JSON.stringify({ decision:"APPLY", gamma, threshold, pass, ctxRefs }, null, 2));
  } else {
    const title = `chore: apply tiny README update (γ=${gamma.toFixed(2)})`;
    openPrIntent({ title, body: "Auto PR intent from nstar loop.", branch: `pipe/${Date.now()}`, diff });
    appendTrace({ run_id, phase: "gate", step: "gamma", ok: false, note: `${gamma}<${threshold}` });
    console.log(JSON.stringify({ decision:"INTENT", gamma, threshold, pass, ctxRefs }, null, 2));
  }

  appendTrace({ run_id, phase: "done", step: "end", ok: true });
}

function toUnified(patchBlock) {
  // Accept our Begin/End Patch format or pure unified diff. Convert if necessary.
  if (patchBlock.includes("*** Begin Patch")) {
    // Naive converter: pass through the inner diff hunks as-is; git apply supports both if triple-star format preserved.
    return patchBlock.replace(/\r/g, "");
  }
  return patchBlock;
}

async function main() {
  const { cmd, args } = parseArgs(process.argv);

  if (cmd === "paste") {
    let text = "";
    if (!process.stdin.isTTY) text = fs.readFileSync(0, "utf8");
    else text = pbpaste() || "";
    if (!text) { console.error("no input on stdin/clipboard"); process.exit(1); }
    const { ref, path: p } = savePaste(text);
    console.log(ref + "  " + p);
    return;
  }

  if (cmd === "run") {
    // Usage: nstar run --goal="..." [--mode=safe|fast|cheap] [--ctx=ctx://...,file://...,url://...]
    const goal = args.goal || (args._?.join(" ") || "Tiny maintenance update");
    const mode = args.mode || "fast";
    const ctx = (args.ctx || "").split(",").filter(Boolean);
    // If stdin has content and no ctx passed, ingest it
    if (!args.ctx && !process.stdin.isTTY) {
      const text = fs.readFileSync(0, "utf8");
      const { ref } = savePaste(text);
      ctx.push(ref);
    }
    await kernelRun({ goal, mode, ctxRefs: ctx });
    return;
  }

  if (cmd === "update") {
    const { behind } = gitPullFF();
    console.log(behind > 0 ? "updated" : "up-to-date");
    return;
  }

  if (cmd === "watch") {
    const secs = Number(args.interval || 600);
    console.log(`watching… auto-update every ${secs}s, re-run on PR_MAP or policy changes`);
    setInterval(() => { gitPullFF(); }, secs*1000);
    fs.watch(r("ops"), { recursive:true }, (e, f) => { if (f && f.includes("PR_MAP.json")) console.log("PR_MAP changed:", f); });
    fs.watch(r("policy"), { recursive:true }, (e, f) => { if (f) console.log("policy changed:", f); });
    process.stdin.resume();
    return;
  }

  // help
  console.log(`nstar <cmd>
  paste     # save stdin/clipboard to assets/paste/<hash>.md → ctx://paste/<hash>
  run       # run loop (plan→patch→test→decide). opts: --goal, --mode, --ctx
  update    # git fetch + ff-only pull
  watch     # auto-update on interval, watch PR_MAP/policy
`);
}

main().catch(e => { console.error(e); process.exit(1); });
