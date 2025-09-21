#!/usr/bin/env node
// Auto-Auditor: watch → check vision → generate diffs → record ledger → emit PR intents.
// No deps. ESM.
import fs from "fs"; import path from "path"; import { execSync, spawnSync } from "child_process";
import { fileURLToPath } from "url";
import * as fixers from "../../tools/fixers.mjs";

const ROOT = process.cwd(); const r=(...p)=>path.join(ROOT,...p);
const now = ()=>new Date().toISOString();
function appendTrace(row){ fs.mkdirSync(r("ops"),{recursive:true}); fs.appendFileSync(r("ops/TRACE.jsonl"), JSON.stringify({ts:now(), ok:true, ...row})+"\n"); }
function readJSON(p, d){ try { return JSON.parse(fs.readFileSync(r(p),"utf8")); } catch { return d; } }

function runVision() {
  try {
    execSync("node tools/vision-check.mjs", { stdio:"inherit" });
  } catch (_) { /* non-zero on fail is expected */ }
  const report = readJSON("ops/VISION_REPORT.json", null);
  if (!report) throw new Error("VISION_REPORT missing. Did vision-check run?");
  return report;
}

function applyPatch(patch) {
  if (!patch) return { ok:false, note:"no patch" };
  const proc = spawnSync("git", ["apply", "--whitespace=fix", "-"], { input: patch, encoding: "utf8" });
  return { ok: proc.status === 0, stderr: proc.stderr };
}

function prIntent(title, diff, branch) {
  const row = { ts: now(), title, branch, diff };
  const f = r("state/intents/pr.jsonl");
  fs.mkdirSync(path.dirname(f), { recursive:true });
  fs.appendFileSync(f, JSON.stringify(row) + "\n");
  appendTrace({ phase:"intent", step:"request_pr", ok:true, note:title, extra:{branch} });
}

function pickFix(item) {
  const reg = readJSON("policy/fixes.json", {});
  const cfg = reg[item.id] || reg[item.id.split(" ")[0]]; // tolerate id variants
  if (!cfg) return null;
  return cfg;
}

function buildTitle(item) {
  const name = item.id.replace(/[:/]/g, " ");
  return `chore(vision): fix ${name}`;
}

async function oneShot({ auto=true } = {}) {
  appendTrace({ phase:"audit", step:"start", ok:true });
  const report = runVision();
  const fails = report.items.filter(i=>!i.ok);
  if (!fails.length) { appendTrace({ phase:"audit", step:"pass", ok:true, note:`score ${report.score}`}); console.log("PASS", report.score); return; }

  for (const it of fails) {
    const cfg = pickFix(it); if (!cfg) continue;
    const patch = (fixers[cfg.fixer] || (()=>null))(it.id);
    if (!patch) continue;

    if (cfg.autoApply && auto) {
      const res = applyPatch(patch);
      appendTrace({ phase:"patch", step:it.id, ok:res.ok, note: cfg.fixer });
      if (!res.ok) prIntent(buildTitle(it), patch, `vision/${Date.now().toString(36)}`);
    } else {
      prIntent(buildTitle(it), patch, `vision/${Date.now().toString(36)}`);
    }
  }
  appendTrace({ phase:"audit", step:"done", ok:true, note:`score ${report.score}` });
}

function main() {
  const arg = process.argv[2] || "";
  if (arg === "--once") return oneShot();
  // daemon: re-run on file changes and hourly
  console.log("Auto-Auditor running… (Ctrl+C to exit)");
  setInterval(()=>oneShot().catch(()=>{}), 60*60*1000); // hourly
  fs.watch(ROOT, { recursive:true }, (e,f)=> {
    if (!f) return;
    if (/^ops\/|^state\//.test(f)) return;
    clearTimeout(global.__t);
    global.__t = setTimeout(()=>oneShot({auto:false}).catch(()=>{}), 1200); // aggregate burst → PR intents (no auto-apply)
  });
}
main();
