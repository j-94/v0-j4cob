# nstar: Streaming Kernel Loop System

A production-ready AI development kernel with streaming capabilities, context management, and policy enforcement.

## 🚀 Features

- **Dual Interface**: Conversational exploration + Direct API efficiency
- **Background Streaming**: Real-time updates via Server-Sent Events
- **Context Solved**: Reference-based storage (`ctx://paste/<hash>`) eliminates token bloat
- **Policy Enforcement**: γ-score gates with cost controls
- **Unified Observability**: Single TRACE ledger for all operations
- **Multiple Clients**: CLI, HTTP API, Web interface

## 📦 Quick Start

```bash
# Install dependencies
npm install

# Make scripts executable
chmod +x bin/*.mjs

# Run a simple task
bin/nstar.mjs run --goal="Initialize project" --mode=fast

# Start streaming server
bin/nstar-server.mjs

# Connect streaming client
bin/nstar-client.mjs stream

# Open web interface
open public/index.html
```

## 🔧 Core Commands

### CLI Mode
```bash
# Paste context from clipboard/stdin
bin/nstar.mjs paste

# Run kernel loop
bin/nstar.mjs run --goal="Add tests" --mode=safe

# Auto-update and watch
bin/nstar.mjs watch --interval=600

# Manual update
bin/nstar.mjs update
```

### Streaming Mode
```bash
# Start server (default port 8080)
bin/nstar-server.mjs

# Stream real-time updates
bin/nstar-client.mjs stream

# Chat with streaming
bin/nstar-client.mjs chat "Add documentation --mode=safe"

# Direct API commands
bin/nstar-client.mjs direct "EXECUTE test --fast"
```

## 📡 HTTP API

```bash
# Server status
curl http://localhost:8080/status

# Chat endpoint
curl -X POST http://localhost:8080/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test goal","stream":true}'

# Direct API
curl -X POST http://localhost:8080/direct \
  -H "Content-Type: application/json" \
  -d '{"command":"EXECUTE test --fast","stream":true}'

# Paste context
curl -X POST http://localhost:8080/paste \
  -H "Content-Type: application/json" \
  -d '{"text":"Large context content..."}'

# Get TRACE history
curl http://localhost:8080/trace?limit=20
```

## 🎯 Architecture

### Contract-First Design
- **γ-score Policy Gates**: Quality thresholds before execution
- **Cost Controls**: Budget enforcement per run/day
- **TRACE Ledger**: Append-only audit trail
- **Reference Context**: Eliminate token bloat with `ctx://` refs

### Streaming Flow
1. Client connects to `/stream` endpoint
2. Server broadcasts real-time events:
   - `job_start`: New job initiated
   - `trace`: TRACE ledger updates
   - `job_stdout/stderr`: Live command output
   - `job_complete`: Job finished with results

### Policy System
```json
// policy/gamma.json
{
  "weights": {
    "tests_pass": 0.4,
    "retrieval_cited": 0.25,
    "cost_ok": 0.2,
    "diff_tiny": 0.15
  },
  "thresholds": {
    "safe": 0.6,
    "fast": 0.5,
    "cheap": 0.4
  }
}
```

## 📊 Observability

### TRACE Ledger (`ops/TRACE.jsonl`)
Every operation appends structured events:
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

### Real-time Monitoring
- **Web Interface**: Live updates in browser
- **CLI Streaming**: Real-time command line updates
- **HTTP Endpoints**: Programmatic access to TRACE data

## 🔄 Context Management

### Problem Solved
Instead of stuffing large context into every prompt:
```bash
# Before: 50KB context in every request
chat "Here's my entire codebase: [50KB of code]... now add tests"

# After: Reference-based context
echo "Large codebase content" | bin/nstar.mjs paste
# Returns: ctx://paste/abc123def456
bin/nstar.mjs run --goal="Add tests" --ctx=ctx://paste/abc123def456
```

### Benefits
- **Token Efficiency**: 10-50 tokens vs 500-2000
- **Cost Reduction**: Massive savings on API calls
- **Deterministic**: Same context reference every time
- **Cacheable**: Context stored once, referenced many times

## 🚀 Production Ready

- **Error Handling**: Graceful failures and recovery
- **Resource Management**: Job cleanup and limits
- **CORS Support**: Cross-origin requests enabled
- **Graceful Shutdown**: Clean process termination
- **Health Checks**: Status endpoint for monitoring
- **Multi-client**: Concurrent connections supported

## 📖 Documentation

- [STREAMING.md](STREAMING.md) - Complete streaming system guide
- [API Documentation](#-http-api) - HTTP endpoint reference
- [Policy System](#policy-system) - γ-score and cost controls

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with `node test-streaming.mjs`
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

**nstar**: Beyond bootstrap paradoxes, into streaming kernel loops with policy enforcement and context efficiency.
