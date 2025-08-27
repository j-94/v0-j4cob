import fs from "fs";
import path from "path";

const ROOT = process.cwd();
const LEDGER = path.join(ROOT, "ops/TRACE.jsonl");

export function appendTrace(row) {
  const ev = { ts: new Date().toISOString(), ok: true, ...row };
  fs.mkdirSync(path.dirname(LEDGER), { recursive: true });
  fs.appendFileSync(LEDGER, JSON.stringify(ev) + "\n");
}
export default { appendTrace };
