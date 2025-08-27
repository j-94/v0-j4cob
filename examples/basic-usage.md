# Basic Usage Examples

## CLI Mode

### Simple Task Execution
```bash
# Initialize project
bin/nstar.mjs run --goal="Initialize project README" --mode=fast

# Add tests with safe mode
bin/nstar.mjs run --goal="Add comprehensive tests" --mode=safe

# Quick maintenance
bin/nstar.mjs run --goal="Update dependencies" --mode=cheap
```

### Context Management
```bash
# Paste from clipboard
bin/nstar.mjs paste
# Returns: ctx://paste/abc123def456

# Use context in task
bin/nstar.mjs run --goal="Implement feature" --ctx=ctx://paste/abc123def456

# Pipe large context
cat design-doc.md | bin/nstar.mjs run --goal="Implement design"
```

### Auto-update and Monitoring
```bash
# Watch for changes and auto-update
bin/nstar.mjs watch --interval=600

# Manual update
bin/nstar.mjs update
```

## Streaming Mode

### Start Server
```bash
# Default port 8080
bin/nstar-server.mjs

# Custom port
PORT=8081 bin/nstar-server.mjs
```

### CLI Client
```bash
# Stream real-time updates
bin/nstar-client.mjs stream

# Chat with streaming
bin/nstar-client.mjs chat "Add documentation --mode=safe"

# Direct API commands
bin/nstar-client.mjs direct "EXECUTE test --fast"

# Paste context
echo "Large context..." | bin/nstar-client.mjs paste

# Get TRACE history
bin/nstar-client.mjs trace 20
```

### HTTP API Examples
```bash
# Server status
curl http://localhost:8080/status

# Chat endpoint
curl -X POST http://localhost:8080/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Add tests to project","stream":true}'

# Direct API
curl -X POST http://localhost:8080/direct \
  -H "Content-Type: application/json" \
  -d '{"command":"EXECUTE test --fast","stream":true}'

# Paste large context
curl -X POST http://localhost:8080/paste \
  -H "Content-Type: application/json" \
  -d '{"text":"Large context content here..."}'

# Get recent TRACE entries
curl http://localhost:8080/trace?limit=20
```

## Web Interface

1. Start the server: `bin/nstar-server.mjs`
2. Open `public/index.html` in your browser
3. Use the web interface for:
   - Real-time streaming updates
   - Chat interface
   - Direct API commands
   - Context pasting
   - TRACE monitoring

## Policy Configuration

### Gamma Scoring (policy/gamma.json)
```json
{
  "weights": {
    "tests_pass": 0.4,
    "retrieval_cited": 0.25,
    "cost_ok": 0.2,
    "diff_tiny": 0.15
  },
  "thresholds": {
    "safe": 0.6,    // High confidence required
    "fast": 0.5,    // Balanced approach
    "cheap": 0.4    // Lower threshold for cost efficiency
  }
}
```

### Cost Controls (policy/cost.json)
```json
{
  "per_run_gbp": 3.0,   // Maximum cost per run
  "per_day_gbp": 25.0   // Daily budget limit
}
```

## TRACE Monitoring

### View Recent Activity
```bash
# Last 10 entries
bin/nstar-client.mjs trace 10

# Filter by mode
curl http://localhost:8080/trace?limit=20&mode=direct
```

### TRACE Entry Format
```json
{
  "ts": "2025-08-27T22:18:51.536Z",
  "run_id": "meuj5b24:user",
  "phase": "plan",
  "step": "start",
  "ok": true,
  "note": "Add tests to project"
}
```

## Integration Examples

### CI/CD Pipeline
```bash
# In your CI script
bin/nstar.mjs run --goal="Run full test suite" --mode=safe
if [ $? -eq 0 ]; then
  echo "Tests passed, proceeding with deployment"
fi
```

### Automated Workflows
```bash
# Cron job for maintenance
0 2 * * * cd /path/to/project && bin/nstar.mjs run --goal="Daily maintenance" --mode=cheap
```

### Development Workflow
```bash
# Start streaming server for development
bin/nstar-server.mjs &

# In another terminal, work with streaming updates
bin/nstar-client.mjs stream &

# Make changes and test
bin/nstar-client.mjs chat "Test my changes --mode=fast"
```
