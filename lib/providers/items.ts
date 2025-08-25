import { promises as fs } from "fs";
import path from "path";

export type Item = {
  id: string;
  title: string;
  url: string;
  ts: string;
  kind:
    | "link"
    | "repo"
    | "tool"
    | "paper"
    | "note"
    | "prompt"
    | "dataset"
    | "task"
    | "decision"
    | "experiment"
    | "pattern"
    | "checklist";
  maturity: "idea" | "draft" | "tried" | "tested" | "productionized";
  tags?: string[];
  previewUrl?: string;
};

export type KernelSnapshot = {
  tick: number;
  goal: string;
  state: { alpha: number; beta: number; gamma: number };
  budget: { seconds_total: number; seconds_left: number };
};

const dataDir = path.join(process.cwd(), "data");

async function readJSON<T>(file: string): Promise<T> {
  const data = await fs.readFile(path.join(dataDir, file), "utf-8");
  return JSON.parse(data) as T;
}

export async function listItems(): Promise<Item[]> {
  return readJSON<Item[]>("items.json");
}

export async function getItem(id: string): Promise<Item | undefined> {
  const items = await listItems();
  return items.find((i) => i.id === id);
}

export async function searchItems(q: string): Promise<Item[]> {
  const items = await listItems();
  const query = q.toLowerCase();
  return items.filter(
    (i) =>
      i.title.toLowerCase().includes(query) ||
      i.tags?.some((t) => t.toLowerCase().includes(query)) ||
      i.kind.toLowerCase().includes(query) ||
      i.maturity.toLowerCase().includes(query)
  );
}

export async function getKernelSnapshot(): Promise<KernelSnapshot> {
  return readJSON<KernelSnapshot>("kernel.json");
}

// TODO: Neon provider stub
export async function listItemsFromNeon() {
  // Implementation placeholder
  return listItems();
}
