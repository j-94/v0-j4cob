// ESM fixers: each returns a unified diff string (tiny patch) or null.
import fs from "fs"; import path from "path";
const r = (...p)=>path.join(process.cwd(),...p);

export function ensureGitignore(id) {
  const gi = r(".gitignore");
  const add = id.startsWith("ignore:") ? id.slice(7) : "ops/INVENTORY.json";
  const exists = fs.existsSync(gi) ? fs.readFileSync(gi,"utf8").includes(add) : false;
  if (exists) return null;
  const before = fs.existsSync(gi) ? fs.readFileSync(gi,"utf8") : "";
  const after = (before.trimEnd() + "\n" + add + "\n").replace(/\r/g,"");
  return `*** Begin Patch
*** Update File: .gitignore
@@
-${before.split("\n").join("\n")}
+${after.split("\n").join("\n")}
*** End Patch
`;
}

export function seedPolicy() {
  const gamma = `{
  "weights":{"tests_pass":0.40,"retrieval_cited":0.25,"cost_ok":0.20,"diff_tiny":0.15},
  "thresholds":{"safe":0.60,"fast":0.50,"cheap":0.40}
}
`;
  const cost = `{"per_run_gbp":3.0,"per_day_gbp":25.0}
`;
  const files = [];
  if (!fs.existsSync(r("policy/gamma.json"))) files.push(["policy/gamma.json", gamma]);
  if (!fs.existsSync(r("policy/cost.json")))  files.push(["policy/cost.json", cost]);
  if (!files.length) return null;

  let patch = "*** Begin Patch\n";
  for (const [p,content] of files) {
    patch += `*** Add File: ${p}\n+${content.split("\n").map(x=>x?x:``).join("\n")}\n`;
  }
  patch += "*** End Patch\n";
  return patch;
}

export function addCiEvalGate() {
  const p = ".github/workflows/vision.yml";
  if (fs.existsSync(r(p))) return null;
  const y = `name: vision-check
on: [pull_request, workflow_dispatch]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: node tools/vision-check.mjs
`;
  return `*** Begin Patch
*** Add File: ${p}
+${y.split("\n").join("\n")}
*** End Patch
`;
}

export function addUICatchall() {
  const p = r("apps/public/ui.js"); if (!fs.existsSync(p)) return null;
  const js = fs.readFileSync(p,"utf8");
  if (/R\.auto\s*=|registry\.auto\s*=/.test(js)) return null;
  const after = js.replace(/const R\s*=\s*{/, `const R = {
  auto: (b) => {
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    code.textContent = typeof b === 'string' ? b : JSON.stringify(b, null, 2);
    pre.append(code); return pre;
  },`);
  if (after === js) return null;
  return `*** Begin Patch
*** Update File: apps/public/ui.js
@@
-${js.split("\n").join("\n")}
+${after.split("\n").join("\n")}
*** End Patch
`;
}
