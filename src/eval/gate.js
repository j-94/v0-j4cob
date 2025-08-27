export class EvalGate {
  constructor(config) {
    this.config = config
  }

  async check(result) {
    const confidence = this.calculateConfidence(result)
    const shouldStop = this.shouldStop(result, confidence)
    const metrics = this.extractMetrics(result)

    return { confidence, shouldStop, metrics }
  }

  calculateConfidence(result) {
    // Simplified confidence calculation
    const factors = [
      result.success ? 0.3 : 0,
      result.elapsed < 10000 ? 0.2 : 0.1,
      result.errors?.length === 0 ? 0.3 : 0.1,
      result.output?.length > 0 ? 0.2 : 0,
    ]

    return factors.reduce((sum, factor) => sum + factor, 0)
  }

  shouldStop(result, confidence) {
    return confidence > this.config.evals.gamma_gate || result.action === "stop" || result.errors?.length > 3
  }

  extractMetrics(result) {
    return {
      elapsed: result.elapsed || 0,
      success: result.success || false,
      errors: result.errors?.length || 0,
      output_size: result.output?.length || 0,
    }
  }
}
