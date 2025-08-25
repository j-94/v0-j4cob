-- SQLite schema for knowledge base catalog
CREATE TABLE items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  artifact_type TEXT NOT NULL,
  capability TEXT,          -- JSON array
  task TEXT,                -- JSON array
  stack_lang TEXT,
  stack_runtime TEXT,
  stack_cloud TEXT,
  stack_db TEXT,
  stack_vec TEXT,
  stack_llm TEXT,
  maturity TEXT,
  last_verified_at TEXT,
  p_conf REAL,
  benchmarks TEXT,          -- JSON array
  passes INTEGER,
  perf_notes TEXT,
  cost_est TEXT,
  failure_modes TEXT,       -- JSON array
  how_to_run TEXT,          -- JSON array
  deps TEXT,                -- JSON array
  license TEXT,
  summary TEXT,
  tags TEXT                 -- JSON array
);

CREATE TABLE edges (
  item_id TEXT NOT NULL,
  relation TEXT NOT NULL CHECK (
    relation IN ('depends_on','supersedes','supports','refutes','similar_to')
  ),
  target_id TEXT NOT NULL,
  FOREIGN KEY(item_id) REFERENCES items(id)
);

CREATE TABLE sources (
  item_id TEXT PRIMARY KEY,
  url TEXT,
  author TEXT,
  added_at TEXT,
  FOREIGN KEY(item_id) REFERENCES items(id)
);
