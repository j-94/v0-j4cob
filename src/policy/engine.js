import chalk from "chalk"

export class PolicyEngine {
  constructor(config) {
    this.config = config
    this.violations = []
  }

  async enforce(plan, result) {
    const checks = [
      this.checkTimeout(plan, result),
      this.checkCommands(plan),
      this.checkCostCap(result),
      this.checkFileAccess(plan),
    ]

    const violations = checks.filter((check) => !check.allowed)

    if (violations.length > 0) {
      console.log(chalk.red("🚫 Policy violations:"))
      violations.forEach((v) => console.log(chalk.red(`  - ${v.reason}`)))
      this.violations.push(...violations)
    }

    return {
      allowed: violations.length === 0,
      violations,
      reason: violations.map((v) => v.reason).join("; "),
    }
  }

  checkTimeout(plan, result) {
    const modeConfig = this.config.agent.modes[plan.mode || "safe"]
    const elapsed = result.elapsed || 0

    return {
      allowed: elapsed <= modeConfig.timeout_ms,
      reason: `Timeout exceeded: ${elapsed}ms > ${modeConfig.timeout_ms}ms`,
    }
  }

  checkCommands(plan) {
    const modeConfig = this.config.agent.modes[plan.mode || "safe"]
    const command = plan.args?.command || plan.args?.cmd

    if (!command) return { allowed: true }

    const allowed = modeConfig.allow_cmds.some((cmd) => command.startsWith(cmd))

    return {
      allowed,
      reason: `Command not allowed: ${command}`,
    }
  }

  checkCostCap(result) {
    const cost = result.cost_usd || 0
    const cap = this.config.evals.cost_cap_usd

    return {
      allowed: cost <= cap,
      reason: `Cost cap exceeded: $${cost} > $${cap}`,
    }
  }

  checkFileAccess(plan) {
    const path = plan.args?.path || plan.args?.file

    if (!path) return { allowed: true }

    // Prevent access to sensitive files
    const forbidden = [".env", "package-lock.json", "node_modules"]
    const isForbidden = forbidden.some((f) => path.includes(f))

    return {
      allowed: !isForbidden,
      reason: `File access forbidden: ${path}`,
    }
  }

  getViolationSummary() {
    return {
      total: this.violations.length,
      types: [...new Set(this.violations.map((v) => v.type))],
      recent: this.violations.slice(-5),
    }
  }
}
