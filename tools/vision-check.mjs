#!/usr/bin/env node
// Minimal vision check: reads meta/vision.json and writes ops/VISION_REPORT.json
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const ROOT = process.cwd();
const r = (...p) => path.join(ROOT, ...p);
const meta = JSON.parse(fs.readFileSync(r('meta/vision.json'), 'utf8'));
const report = { items: [] };

function add(id, ok) {
  report.items.push({ id, ok });
}

// required paths
for (const req of meta.required_paths || []) {
  if (typeof req === 'string') {
    add(`req:${req}`, fs.existsSync(r(req)));
  } else if (req.anyOf) {
    const ok = req.anyOf.some(p => fs.existsSync(r(p)));
    add(`req:anyOf:${req.anyOf.join('|')}`, ok);
  }
}

// must ignore
const giPath = r('.gitignore');
const gi = fs.existsSync(giPath) ? fs.readFileSync(giPath, 'utf8') : '';
for (const ig of meta.must_ignore || []) {
  add(`ignore:${ig}`, gi.includes(ig));
}

// rules
add('rule:gamma_policy', fs.existsSync(r('policy/gamma.json')));
add('rule:cost_policy', fs.existsSync(r('policy/cost.json')));
add('rule:ci_eval_gate', fs.existsSync(r('.github/workflows/vision.yml')));
add('rule:ledger_single_source', fs.existsSync(r('ops/TRACE.jsonl')));
const uiPath = r('apps/public/ui.js');
const uiCatch = fs.existsSync(uiPath) && /R\.auto\s*=|registry\.auto\s*=/.test(fs.readFileSync(uiPath, 'utf8'));
add('rule:ui_catchall', uiCatch);

try {
  const out = execSync("git ls-files | xargs wc -l | tail -n1 | awk '{print $1}'", { encoding: 'utf8' });
  const lines = parseInt(out.trim(), 10) || 0;
  const ok = lines <= (meta.rules?.repo_size_kloc_max || 0) * 1000;
  add('rule:repo_size_kloc', ok);
} catch {
  add('rule:repo_size_kloc', false);
}

const okCount = report.items.filter(i => i.ok).length;
report.score = report.items.length ? Math.round((okCount / report.items.length) * 100) : 100;

fs.mkdirSync(r('ops'), { recursive: true });
fs.writeFileSync(r('ops/VISION_REPORT.json'), JSON.stringify(report, null, 2));
console.log('score', report.score);
