-- Find patterns about retry and idempotency verified in last 90 days
SELECT *
FROM items
WHERE artifact_type = 'pattern'
  AND EXISTS (SELECT 1 FROM json_each(tags) WHERE value = 'retry')
  AND EXISTS (SELECT 1 FROM json_each(tags) WHERE value = 'idempotency')
  AND stack_cloud = 'vercel'
  AND maturity IN ('tested','productionized')
  AND julianday('now') - julianday(last_verified_at) < 90;

-- Retrieve commands to run a specific pattern
SELECT json_extract(how_to_run, '$') AS commands
FROM items
WHERE id = 'pat-serverside-webhooks-v0';

-- Compare evidence between two repos
SELECT i.id, i.summary, s.url, i.p_conf, i.benchmarks, i.cost_est
FROM items i
JOIN sources s ON s.item_id = i.id
WHERE i.id IN ('repo-a', 'repo-b');

-- Upgrade prompts with draft maturity
SELECT id, title
FROM items
WHERE EXISTS (SELECT 1 FROM json_each(capability) WHERE value = 'evals')
  AND maturity = 'draft';
