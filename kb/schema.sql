-- Schema for knowledge catalog
CREATE TABLE items (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  artifact_type TEXT NOT NULL CHECK (artifact_type IN
    ('link','code-snippet','repo','prompt','note','dataset','paper','tool','decision','experiment','pattern','checklist','task')),
  maturity TEXT CHECK (maturity IN ('idea','draft','tried','tested','productionized'))
);

CREATE TABLE edges (
  id INTEGER PRIMARY KEY,
  from_item INTEGER NOT NULL REFERENCES items(id),
  to_item INTEGER NOT NULL REFERENCES items(id)
);

CREATE TABLE sources (
  id INTEGER PRIMARY KEY,
  item_id INTEGER NOT NULL REFERENCES items(id)
);
