import { promises as fs } from 'fs';
import { join } from 'path';

const TRACE_PATH = join(process.cwd(), 'state', 'TRACE.jsonl');

export async function writeTrace(row: unknown): Promise<void> {
  await fs.mkdir(join(process.cwd(), 'state'), { recursive: true });
  const line = JSON.stringify(row) + '\n';
  await fs.appendFile(TRACE_PATH, line);
}
