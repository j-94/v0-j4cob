#!/usr/bin/env node
// nstar-server: Background streaming server for nstar kernel loop
import fs from "fs";
import http from "http";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { spawn } from "child_process";
import { appendTrace } from "../lib/ledger.mjs";

const ROOT = process.cwd();
const PORT = process.env.PORT || 8080;
const r = (...p) => path.join(ROOT, ...p);
const exists = (p) => fs.existsSync(p);

class NstarServer {
  constructor() {
    this.clients = new Set();
    this.runningJobs = new Map();
    this.traceWatcher = null;
    this.setupTraceWatcher();
  }

  setupTraceWatcher() {
    const tracePath = r("ops/TRACE.jsonl");
    if (!exists(tracePath)) {
      fs.mkdirSync(path.dirname(tracePath), { recursive: true });
      fs.writeFileSync(tracePath, "");
    }

    // Watch TRACE file for new entries
    this.traceWatcher = fs.watch(tracePath, (eventType) => {
      if (eventType === 'change') {
        this.broadcastLatestTrace();
      }
    });
  }

  broadcastLatestTrace() {
    try {
      const tracePath = r("ops/TRACE.jsonl");
      const content = fs.readFileSync(tracePath, "utf8");
      const lines = content.trim().split("\n").filter(Boolean);
      if (lines.length > 0) {
        const latest = JSON.parse(lines[lines.length - 1]);
        this.broadcast({ type: "trace", data: latest });
      }
    } catch (e) {
      console.error("Error reading trace:", e.message);
    }
  }

  broadcast(message) {
    const data = `data: ${JSON.stringify(message)}\n\n`;
    for (const client of this.clients) {
      try {
        client.write(data);
      } catch (e) {
        this.clients.delete(client);
      }
    }
  }

  async runKernel({ goal, mode = "fast", ctxRefs = [], stream = true }) {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    
    if (stream) {
      this.broadcast({ 
        type: "job_start", 
        data: { jobId, goal, mode, ctxRefs, timestamp: new Date().toISOString() }
      });
    }

    try {
      // Build command args
      const args = ["run", `--goal=${goal}`, `--mode=${mode}`];
      if (ctxRefs.length > 0) {
        args.push(`--ctx=${ctxRefs.join(",")}`);
      }

      // Spawn nstar process
      const child = spawn("node", [r("bin/nstar.mjs"), ...args], {
        stdio: ["pipe", "pipe", "pipe"],
        cwd: ROOT
      });

      this.runningJobs.set(jobId, child);

      let stdout = "";
      let stderr = "";

      child.stdout.on("data", (data) => {
        stdout += data.toString();
        if (stream) {
          this.broadcast({ 
            type: "job_stdout", 
            data: { jobId, chunk: data.toString() }
          });
        }
      });

      child.stderr.on("data", (data) => {
        stderr += data.toString();
        if (stream) {
          this.broadcast({ 
            type: "job_stderr", 
            data: { jobId, chunk: data.toString() }
          });
        }
      });

      return new Promise((resolve) => {
        child.on("close", (code) => {
          this.runningJobs.delete(jobId);
          
          let result = null;
          try {
            result = JSON.parse(stdout.trim());
          } catch {
            result = { raw_stdout: stdout, raw_stderr: stderr };
          }

          const response = {
            jobId,
            exitCode: code,
            result,
            stdout,
            stderr,
            timestamp: new Date().toISOString()
          };

          if (stream) {
            this.broadcast({ type: "job_complete", data: response });
          }

          resolve(response);
        });
      });

    } catch (error) {
      const response = {
        jobId,
        error: error.message,
        timestamp: new Date().toISOString()
      };

      if (stream) {
        this.broadcast({ type: "job_error", data: response });
      }

      return response;
    }
  }

  async handleRequest(req, res) {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    
    // CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      res.writeHead(200);
      res.end();
      return;
    }

    // SSE endpoint for streaming
    if (url.pathname === "/stream") {
      res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      });

      // Send initial connection message
      res.write(`data: ${JSON.stringify({ type: "connected", timestamp: new Date().toISOString() })}\n\n`);

      this.clients.add(res);

      req.on("close", () => {
        this.clients.delete(res);
      });

      return;
    }

    // Chat endpoint - conversational interface
    if (url.pathname === "/chat" && req.method === "POST") {
      let body = "";
      req.on("data", chunk => body += chunk);
      req.on("end", async () => {
        try {
          const { message, context = [], stream = true } = JSON.parse(body);
          
          // Simple message parsing to extract goal and context
          let goal = message;
          let mode = "fast";
          let ctxRefs = context;

          // Parse mode from message
          if (message.includes("--mode=")) {
            const modeMatch = message.match(/--mode=(\w+)/);
            if (modeMatch) mode = modeMatch[1];
          }

          // Parse context references
          const ctxMatches = message.match(/ctx:\/\/\w+\/\w+/g);
          if (ctxMatches) {
            ctxRefs = [...ctxRefs, ...ctxMatches];
          }

          const result = await this.runKernel({ goal, mode, ctxRefs, stream });
          
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(result));

        } catch (error) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: error.message }));
        }
      });
      return;
    }

    // Direct API endpoint
    if (url.pathname === "/direct" && req.method === "POST") {
      let body = "";
      req.on("data", chunk => body += chunk);
      req.on("end", async () => {
        try {
          const { command, stream = true } = JSON.parse(body);
          
          // Parse direct command (EXECUTE, QUERY, etc.)
          const parts = command.trim().split(/\s+/);
          const verb = parts[0]?.toLowerCase();
          
          let goal, mode = "fast", ctxRefs = [];
          
          if (verb === "execute") {
            goal = `Execute: ${parts.slice(1).join(" ")}`;
          } else if (verb === "query") {
            goal = `Query: ${parts.slice(1).join(" ")}`;
          } else {
            goal = command;
          }

          const result = await this.runKernel({ goal, mode, ctxRefs, stream });
          
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(result));

        } catch (error) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: error.message }));
        }
      });
      return;
    }

    // Paste endpoint
    if (url.pathname === "/paste" && req.method === "POST") {
      let body = "";
      req.on("data", chunk => body += chunk);
      req.on("end", () => {
        try {
          const { text } = JSON.parse(body);
          
          // Use same paste logic as CLI
          const id = crypto.createHash("sha1").update(text).digest("hex").slice(0, 12);
          const pastePath = r("assets/paste", `${id}.md`);
          
          fs.mkdirSync(path.dirname(pastePath), { recursive: true });
          fs.writeFileSync(pastePath, text);
          
          const result = {
            id,
            ref: `ctx://paste/${id}`,
            path: pastePath
          };

          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify(result));

        } catch (error) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: error.message }));
        }
      });
      return;
    }

    // TRACE endpoint
    if (url.pathname === "/trace") {
      try {
        const limit = parseInt(url.searchParams.get("limit")) || 50;
        const mode = url.searchParams.get("mode");
        
        const tracePath = r("ops/TRACE.jsonl");
        if (!exists(tracePath)) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify([]));
          return;
        }

        const content = fs.readFileSync(tracePath, "utf8");
        let lines = content.trim().split("\n").filter(Boolean);
        
        // Filter by mode if specified
        if (mode) {
          lines = lines.filter(line => {
            try {
              const entry = JSON.parse(line);
              return entry.mode === mode;
            } catch {
              return false;
            }
          });
        }

        // Take last N entries
        const entries = lines.slice(-limit).map(line => JSON.parse(line));
        
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(entries));

      } catch (error) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: error.message }));
      }
      return;
    }

    // Status endpoint
    if (url.pathname === "/status") {
      const status = {
        server: "nstar-server",
        version: "1.0.0",
        uptime: process.uptime(),
        clients: this.clients.size,
        runningJobs: this.runningJobs.size,
        timestamp: new Date().toISOString()
      };

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(status));
      return;
    }

    // 404
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  }

  start() {
    const server = http.createServer((req, res) => {
      this.handleRequest(req, res).catch(error => {
        console.error("Request error:", error);
        if (!res.headersSent) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Internal server error" }));
        }
      });
    });

    server.listen(PORT, () => {
      console.log(`🚀 nstar server running on http://localhost:${PORT}`);
      console.log(`📡 Stream endpoint: http://localhost:${PORT}/stream`);
      console.log(`💬 Chat endpoint: POST http://localhost:${PORT}/chat`);
      console.log(`⚡ Direct API: POST http://localhost:${PORT}/direct`);
      console.log(`📋 Paste endpoint: POST http://localhost:${PORT}/paste`);
      console.log(`📊 TRACE endpoint: GET http://localhost:${PORT}/trace`);
      
      appendTrace({ 
        phase: "server", 
        step: "start", 
        ok: true, 
        note: `listening on port ${PORT}` 
      });
    });

    // Graceful shutdown
    process.on("SIGINT", () => {
      console.log("\n🛑 Shutting down nstar server...");
      
      if (this.traceWatcher) {
        this.traceWatcher.close();
      }

      // Close all SSE connections
      for (const client of this.clients) {
        client.end();
      }

      // Kill running jobs
      for (const [jobId, child] of this.runningJobs) {
        console.log(`⏹️  Killing job ${jobId}`);
        child.kill();
      }

      appendTrace({ 
        phase: "server", 
        step: "shutdown", 
        ok: true, 
        note: "graceful shutdown" 
      });

      server.close(() => {
        process.exit(0);
      });
    });

    return server;
  }
}

// CLI interface
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = new NstarServer();
  server.start();
}
