import { PolicyEngine } from "../policy/engine.js"
import { SignalRouter } from "../signal/router.js"
import { EvalGate } from "../eval/gate.js"
import { PipeRunner } from "../pipe/runner.js"
import { LLMClient } from "../llm/client.js"
import { renderTemplate } from "../config/template.js"
import chalk from "chalk"

export class AgentExecutor {
  constructor(config) {
    this.config = config
    this.policy = new PolicyEngine(config)
    this.router = new SignalRouter(config)
    this.evalGate = new EvalGate(config)
    this.runner = new PipeRunner(config)
    this.llm = new LLMClient(config)
    this.context = { vars: {}, history: [], signals: [] }
  }

  async run(goal, mode = "safe") {
    console.log(chalk.green(`🎯 Goal: ${goal}`))
    console.log(chalk.blue(`⚙️  Mode: ${mode}\n`))

    const modeConfig = this.config.agent.modes[mode]
    let budget = modeConfig.budget_ms
    let iteration = 0
    const maxIterations = 20

    this.context.vars = { goal, mode, budget, iteration }

    while (budget > 0 && iteration < maxIterations) {
      const startTime = Date.now()

      try {
        // E→P→C→C loop (Evaluate→Plan→Code→Check)
        const evaluation = await this.evaluate()
        const plan = await this.plan(evaluation)
        const code = await this.code(plan)
        const check = await this.check(code)

        // γ-gate: only proceed if confidence > threshold
        if (check.confidence < this.config.evals.gamma_gate) {
          console.log(chalk.yellow(`⚠️  γ-gate failed: ${check.confidence} < ${this.config.evals.gamma_gate}`))
          break
        }

        // Update context with signals
        this.context.signals.push({
          iteration,
          evaluation,
          plan,
          code,
          check,
          timestamp: Date.now(),
        })

        // Route signals for compound learning
        await this.router.route(this.context.signals)

        iteration++
        const elapsed = Date.now() - startTime
        budget -= elapsed

        console.log(chalk.gray(`⏱️  Iteration ${iteration}: ${elapsed}ms, budget: ${budget}ms\n`))

        if (check.shouldStop) {
          console.log(chalk.green("✅ Agent completed successfully"))
          break
        }
      } catch (error) {
        console.error(chalk.red(`❌ Error in iteration ${iteration}:`), error.message)
        break
      }
    }

    // Final evaluation and provenance
    await this.finalizeRun(iteration, budget)
  }

  async evaluate() {
    console.log(chalk.cyan("📊 Evaluating current state..."))

    const env = this.config.llm?.environments?.evaluation || {}
    const systemPrompt = renderTemplate(env.system_prompt || "", this.context.vars)

    const evaluation = await this.llm.complete(
      systemPrompt,
      JSON.stringify(this.context.vars),
      env
    )

    try {
      return JSON.parse(evaluation)
    } catch {
      return { current_state: "unknown", progress: 0, blockers: [], next_action: "search" }
    }
  }

  async plan(evaluation) {
    console.log(chalk.cyan("🧠 Planning next action..."))

    const env = this.config.llm?.environments?.planning || {}
    const systemPrompt = renderTemplate(env.system_prompt || "", this.context.vars)

    const plan = await this.llm.complete(systemPrompt, JSON.stringify(evaluation), env)

    try {
      return JSON.parse(plan)
    } catch {
      return { action: "stop", reasoning: "parse error", args: {}, confidence: 0 }
    }
  }

  async code(plan) {
    console.log(chalk.cyan(`⚡ Executing: ${plan.action}`))

    const result = await this.executeAction(plan)

    // Policy enforcement
    const policyCheck = await this.policy.enforce(plan, result)
    if (!policyCheck.allowed) {
      throw new Error(`Policy violation: ${policyCheck.reason}`)
    }

    return result
  }

  async check(codeResult) {
    console.log(chalk.cyan("🔍 Checking result..."))

    // Eval gate check
    const evalResult = await this.evalGate.check(codeResult)

    return {
      confidence: evalResult.confidence,
      shouldStop: evalResult.shouldStop,
      metrics: evalResult.metrics,
    }
  }

  async executeAction(plan) {
    const { action, args } = plan

    switch (action) {
      case "search":
        return await this.runner.search(args.query || "TODO")
      case "patch":
        return await this.runner.patch(args.diff || "")
      case "test":
        return await this.runner.test(args.command || "npm test")
      case "commit":
        return await this.runner.commit(args.message || "Agent update")
      case "stop":
        return { action: "stop", success: true }
      default:
        throw new Error(`Unknown action: ${action}`)
    }
  }

  async finalizeRun(iterations, remainingBudget) {
    console.log(chalk.green("\n📋 Run Summary:"))
    console.log(chalk.gray(`Iterations: ${iterations}`))
    console.log(chalk.gray(`Budget used: ${this.context.vars.budget - remainingBudget}ms`))
    console.log(chalk.gray(`Signals generated: ${this.context.signals.length}`))

    // Provenance tracking
    const provenance = {
      goal: this.context.vars.goal,
      mode: this.context.vars.mode,
      iterations,
      signals: this.context.signals.length,
      timestamp: new Date().toISOString(),
    }

    console.log(chalk.blue("🔗 Provenance:"), JSON.stringify(provenance, null, 2))
  }
}
