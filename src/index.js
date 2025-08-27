#!/usr/bin/env node
import { AgentExecutor } from "./agent/executor.js"
import { SignalFlywheel } from "./signal/flywheel.js"
import { EvalHarness } from "./eval/harness.js"
import { loadConfig } from "./config/loader.js"
import chalk from "chalk"

const config = await loadConfig()

console.log(chalk.blue("🚀 Agent Executor System"))
console.log(chalk.gray(`North Star: ${config.intent.north_star}`))
console.log(chalk.gray(`Strategy: ${config.intent.strategy}\n`))

const args = process.argv.slice(2)
const command = args[0] || "help"

switch (command) {
  case "agent":
    await runAgent(args.slice(1))
    break
  case "signal":
    await runSignalFlywheel(args.slice(1))
    break
  case "eval":
    await runEvalHarness(args.slice(1))
    break
  case "help":
  default:
    showHelp()
    break
}

async function runAgent(args) {
  const goal = args.find((a) => a.startsWith("goal="))?.split("=")[1] || "improve codebase"
  const mode = args.find((a) => a.startsWith("mode="))?.split("=")[1] || "safe"

  const executor = new AgentExecutor(config)
  await executor.run(goal, mode)
}

async function runSignalFlywheel(args) {
  const flywheel = new SignalFlywheel(config)
  await flywheel.spin()
}

async function runEvalHarness(args) {
  const harness = new EvalHarness(config)
  await harness.evaluate()
}

function showHelp() {
  console.log(chalk.yellow("Usage:"))
  console.log('  node src/index.js agent goal="fix TODO" mode=safe')
  console.log("  node src/index.js signal")
  console.log("  node src/index.js eval")
}
