# nstar Streaming System

Complete background streaming implementation for the nstar kernel loop with real-time updates and multiple interfaces.

## 🚀 Components

### 1. Background Server (`bin/nstar-server.mjs`)
- **HTTP API**: REST endpoints for chat, direct commands, paste, trace
- **SSE Streaming**: Real-time updates via Server-Sent Events
- **Job Management**: Background execution with streaming output
- **TRACE Watching**: Live monitoring of the TRACE ledger

### 2. CLI Client (`bin/nstar-client.mjs`)
- **Streaming Mode**: Real-time connection to server events
- **API Calls**: Direct HTTP calls to all endpoints
- **Command Interface**: Same commands as main CLI but via server

### 3. Web Interface (`public/index.html`)
- **Browser UI**: Full web interface with streaming
- **Real-time Updates**: Live TRACE and job status
- **Multiple Modes**: Chat, direct API, paste, monitoring

## 📡 API Endpoints

```bash
# Server Status
GET /status

# Real-time Streaming
GET /stream  # SSE endpoint

# Conversational Interface
POST /chat
{
  "message": "Add tests to the project --mode=safe",
  "context": ["ctx://paste/abc123"],
  "stream": true
}

# Direct API Commands
POST /direct
{
  "command": "EXECUTE test --fast --parallel",
  "stream": true
}

# Context Storage
POST /paste
{
  "text": "Large context content..."
}

# TRACE Retrieval
GET /trace?limit=20&mode=direct
```

## 🔄 Streaming Flow

1. **Client connects** to `/stream` endpoint
2. **Server broadcasts** all events to connected clients:
   - `job_start`: New job initiated
   - `job_stdout/stderr`: Real-time command output
   - `trace`: TRACE ledger updates
   - `job_complete`: Job finished with results
   - `job_error`: Job failed

3. **Multiple clients** can connect simultaneously
4. **Background jobs** run independently with streaming updates

## 🎯 Usage Examples

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

# Send chat message with streaming
bin/nstar-client.mjs chat "Add documentation --mode=safe"

# Direct API command
bin/nstar-client.mjs direct "EXECUTE test --fast"

# Paste context
echo "Large context..." | bin/nstar-client.mjs paste

# Get TRACE history
bin/nstar-client.mjs trace 20
```

### HTTP API
```bash
# Server status
curl http://localhost:8080/status

# Chat endpoint
curl -X POST http://localhost:8080/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"test goal","stream":true}'

# Paste context
curl -X POST http://localhost:8080/paste \
  -H "Content-Type: application/json" \
  -d '{"text":"context content"}'

# Get TRACE
curl http://localhost:8080/trace?limit=10
```

### Web Interface
1. Open `public/index.html` in browser
2. Connect to streaming endpoint automatically
3. Use chat, direct API, and paste interfaces
4. See real-time updates in the log

## 🔧 Integration Points

### With Existing nstar CLI
- **Same TRACE ledger**: `ops/TRACE.jsonl` shared between CLI and server
- **Same policy files**: `policy/gamma.json`, `policy/cost.json`
- **Same paste storage**: `assets/paste/<hash>.md`
- **Same PR intents**: `state/intents/pr.jsonl`

### With External Systems
- **Webhooks**: Server can trigger external webhooks on job completion
- **Monitoring**: TRACE endpoint for external monitoring systems
- **CI/CD**: Direct API for automated workflows
- **Dashboards**: SSE stream for real-time dashboards

## 🎉 Key Benefits

1. **Background Execution**: Jobs run independently, don't block
2. **Real-time Updates**: See progress as it happens
3. **Multiple Interfaces**: CLI, HTTP API, web UI
4. **Context Solved**: Large context stored as references
5. **Unified Logging**: Single TRACE ledger for all operations
6. **Policy Enforcement**: Same γ/cost gates as CLI
7. **Scalable**: Multiple clients, concurrent jobs

## 🚀 Production Ready

- **Error Handling**: Graceful failures and recovery
- **Resource Management**: Job cleanup and limits
- **CORS Support**: Cross-origin requests enabled
- **Graceful Shutdown**: Clean process termination
- **Health Checks**: Status endpoint for monitoring

The streaming system provides the foundation for building sophisticated AI-powered development workflows with real-time feedback and multiple interaction modes.
