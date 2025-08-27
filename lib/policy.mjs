import fs from "fs";
import path from "path";

const ROOT = process.cwd();

function readJson(p, fallback) {
  try { return JSON.parse(fs.readFileSync(path.join(ROOT, p), "utf8")); }
  catch { return fallback; }
}

const gammaCfg = readJson("policy/gamma.json", {
  weights:{tests_pass:0.4,retrieval_cited:0.25,cost_ok:0.2,diff_tiny:0.15},
  thresholds:{safe:0.6,fast:0.5,cheap:0.4}
});
const costCfg  = readJson("policy/cost.json", { per_run_gbp: 3.0, per_day_gbp: 25.0 });

export function gammaScore(e) {
  const w = gammaCfg.weights;
  const v = {
    tests_pass: e.tests_pass?1:0,
    retrieval_cited: e.retrieval_cited?1:0,
    cost_ok: e.cost_ok?1:0,
    diff_tiny: e.diff_tiny?1:0
  };
  return +(w.tests_pass*v.tests_pass + w.retrieval_cited*v.retrieval_cited + w.cost_ok*v.cost_ok + w.diff_tiny*v.diff_tiny).toFixed(3);
}
export function gammaThreshold(mode="fast") { return gammaCfg.thresholds[mode] ?? gammaCfg.thresholds.fast; }
export function costGate(estimated) { return { ok: estimated <= costCfg.per_run_gbp, cap: costCfg.per_run_gbp }; }
export { gammaCfg, costCfg };
