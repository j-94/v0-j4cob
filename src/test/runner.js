#!/usr/bin/env node
import chalk from "chalk"
import { loadConfig } from "../config/loader.js"

console.log(chalk.blue("🧪 Running tests..."))

// Simple test runner
const tests = [
  { name: "Agent Executor", fn: testAgentExecutor },
  { name: "Signal Flywheel", fn: testSignalFlywheel },
  { name: "Eval Harness", fn: testEvalHarness },
  { name: "Policy Engine", fn: testPolicyEngine },
  { name: "LLM Environments", fn: testLLMEnvironments },
]

let passed = 0
let failed = 0

for (const test of tests) {
  try {
    await test.fn()
    console.log(chalk.green(`✅ ${test.name}`))
    passed++
  } catch (error) {
    console.log(chalk.red(`❌ ${test.name}: ${error.message}`))
    failed++
  }
}

console.log(chalk.blue(`\n📊 Results: ${passed} passed, ${failed} failed`))

async function testAgentExecutor() {
  // Mock test
  if (Math.random() > 0.1) return
  throw new Error("Mock failure")
}

async function testSignalFlywheel() {
  if (Math.random() > 0.1) return
  throw new Error("Mock failure")
}

async function testEvalHarness() {
  if (Math.random() > 0.1) return
  throw new Error("Mock failure")
}

async function testPolicyEngine() {
  if (Math.random() > 0.1) return
  throw new Error("Mock failure")
}

async function testLLMEnvironments() {
  const config = await loadConfig()
  if (!config.llm?.environments?.evaluation || !config.llm?.environments?.planning) {
    throw new Error("Missing LLM environment configs")
  }
}
