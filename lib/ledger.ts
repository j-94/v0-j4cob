import fs from "fs";
import path from "path";

const traceFile = path.join(process.cwd(), "state", "TRACE.jsonl");

export function writeTrace(row: unknown) {
  const line = JSON.stringify(row);
  fs.appendFileSync(traceFile, line + "\n", { encoding: "utf8" });
}
