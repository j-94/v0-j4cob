#!/usr/bin/env node
// nstar-client: CLI client for streaming nstar server
import http from "http";
import { EventSource } from "eventsource";

const SERVER_URL = process.env.NSTAR_SERVER || "http://localhost:8080";

class NstarClient {
  constructor(serverUrl = SERVER_URL) {
    this.serverUrl = serverUrl;
    this.eventSource = null;
  }

  async post(endpoint, data) {
    return new Promise((resolve, reject) => {
      const url = new URL(endpoint, this.serverUrl);
      const postData = JSON.stringify(data);
      
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(postData)
        }
      };

      const req = http.request(url, options, (res) => {
        let body = "";
        res.on("data", chunk => body += chunk);
        res.on("end", () => {
          try {
            const result = JSON.parse(body);
            resolve(result);
          } catch (e) {
            resolve({ raw: body });
          }
        });
      });

      req.on("error", reject);
      req.write(postData);
      req.end();
    });
  }

  async get(endpoint) {
    return new Promise((resolve, reject) => {
      const url = new URL(endpoint, this.serverUrl);
      
      http.get(url, (res) => {
        let body = "";
        res.on("data", chunk => body += chunk);
        res.on("end", () => {
          try {
            const result = JSON.parse(body);
            resolve(result);
          } catch (e) {
            resolve({ raw: body });
          }
        });
      }).on("error", reject);
    });
  }

  startStreaming() {
    if (this.eventSource) {
      this.eventSource.close();
    }

    console.log(`📡 Connecting to ${this.serverUrl}/stream...`);
    
    this.eventSource = new EventSource(`${this.serverUrl}/stream`);
    
    this.eventSource.onopen = () => {
      console.log("✅ Connected to nstar stream");
    };

    this.eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleStreamMessage(data);
      } catch (e) {
        console.log("📨 Raw message:", event.data);
      }
    };

    this.eventSource.onerror = (error) => {
      console.error("❌ Stream error:", error);
    };

    return this.eventSource;
  }

  handleStreamMessage(message) {
    const { type, data } = message;
    
    switch (type) {
      case "connected":
        console.log(`🔗 Stream connected at ${data.timestamp}`);
        break;
        
      case "trace":
        console.log(`📊 TRACE: ${data.phase}/${data.step} ${data.ok ? '✅' : '❌'} ${data.note || ''}`);
        if (data.run_id) console.log(`   Run: ${data.run_id}`);
        break;
        
      case "job_start":
        console.log(`🚀 Job started: ${data.jobId}`);
        console.log(`   Goal: ${data.goal}`);
        console.log(`   Mode: ${data.mode}`);
        if (data.ctxRefs.length > 0) {
          console.log(`   Context: ${data.ctxRefs.join(", ")}`);
        }
        break;
        
      case "job_stdout":
        process.stdout.write(data.chunk);
        break;
        
      case "job_stderr":
        process.stderr.write(data.chunk);
        break;
        
      case "job_complete":
        console.log(`✅ Job completed: ${data.jobId} (exit code: ${data.exitCode})`);
        if (data.result) {
          console.log("📋 Result:", JSON.stringify(data.result, null, 2));
        }
        break;
        
      case "job_error":
        console.log(`❌ Job error: ${data.jobId} - ${data.error}`);
        break;
        
      default:
        console.log(`📨 ${type}:`, data);
    }
  }

  stopStreaming() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      console.log("🛑 Stream disconnected");
    }
  }

  async chat(message, context = []) {
    console.log(`💬 Sending: ${message}`);
    const result = await this.post("/chat", { message, context, stream: true });
    return result;
  }

  async direct(command) {
    console.log(`⚡ Direct: ${command}`);
    const result = await this.post("/direct", { command, stream: true });
    return result;
  }

  async paste(text) {
    console.log(`📋 Pasting ${text.length} characters...`);
    const result = await this.post("/paste", { text });
    console.log(`✅ Saved as: ${result.ref}`);
    return result;
  }

  async trace(limit = 10, mode = null) {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (mode) params.set("mode", mode);
    
    const result = await this.get(`/trace?${params}`);
    return result;
  }

  async status() {
    const result = await this.get("/status");
    return result;
  }
}

// CLI interface
async function main() {
  const [,, command, ...args] = process.argv;
  const client = new NstarClient();

  switch (command) {
    case "stream":
      client.startStreaming();
      console.log("Press Ctrl+C to stop streaming");
      process.stdin.resume(); // Keep process alive
      break;

    case "chat":
      const message = args.join(" ");
      if (!message) {
        console.error("Usage: nstar-client chat <message>");
        process.exit(1);
      }
      
      // Start streaming to see real-time updates
      client.startStreaming();
      
      // Send chat message
      setTimeout(async () => {
        await client.chat(message);
      }, 1000);
      
      // Keep alive for streaming
      setTimeout(() => {
        client.stopStreaming();
        process.exit(0);
      }, 10000);
      break;

    case "direct":
      const cmd = args.join(" ");
      if (!cmd) {
        console.error("Usage: nstar-client direct <command>");
        process.exit(1);
      }
      
      client.startStreaming();
      setTimeout(async () => {
        await client.direct(cmd);
      }, 1000);
      
      setTimeout(() => {
        client.stopStreaming();
        process.exit(0);
      }, 10000);
      break;

    case "paste":
      let text = "";
      if (process.stdin.isTTY) {
        console.error("Usage: echo 'text' | nstar-client paste");
        process.exit(1);
      }
      
      process.stdin.setEncoding("utf8");
      process.stdin.on("data", chunk => text += chunk);
      process.stdin.on("end", async () => {
        const result = await client.paste(text);
        console.log(JSON.stringify(result, null, 2));
      });
      break;

    case "trace":
      const limit = parseInt(args[0]) || 10;
      const mode = args[1] || null;
      const traces = await client.trace(limit, mode);
      console.log(JSON.stringify(traces, null, 2));
      break;

    case "status":
      const status = await client.status();
      console.log(JSON.stringify(status, null, 2));
      break;

    default:
      console.log(`nstar-client <command>

Commands:
  stream              # Connect to event stream (real-time updates)
  chat <message>      # Send conversational message with streaming
  direct <command>    # Send direct API command with streaming  
  paste               # Paste from stdin (echo 'text' | nstar-client paste)
  trace [limit] [mode] # Get recent TRACE entries
  status              # Get server status

Examples:
  nstar-client stream
  nstar-client chat "Add tests to the project"
  nstar-client direct "EXECUTE test --fast"
  echo "Large context..." | nstar-client paste
  nstar-client trace 20
  nstar-client status

Server: ${SERVER_URL}`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
