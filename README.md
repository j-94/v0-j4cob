# Agent Executor System

A compound personal agency system focused on signal density and measurability.

## Core Intent

**North Star**: Compound personal agency by increasing signal density (recall/routing) and measurability (evals/costs), not by maximizing agent complexity.

**Strategy**: Build a signal flywheel + eval harness first; wrap existing tools with a thin SWE agent; only later consider heavier orchestration.

## Architecture

- **PR-first**: Tiny diffs, branch protection, CI evals → safe iteration
- **Monorepo**: Reusable CI minimizes cognitive load across many small projects
- **Policy-first agent**: E→P→C→C loop, γ-gate, cost caps, allowed-cmds, provenance
- **Minimal UX**: One CLI over a service catalog (project.yaml)

## Usage

\`\`\`bash
# Run agent with goal
node src/index.js agent goal="fix TODO items" mode=safe

# Start signal flywheel
node src/index.js signal

# Run evaluation harness
node src/index.js eval

# Run tests
npm test
\`\`\`

## Modes

- **safe**: Conservative timeouts, limited commands, high budget
- **fast**: Quick iterations, more commands, medium budget  
- **cheap**: Balanced approach, standard commands, medium budget

## Components

- **AgentExecutor**: E→P→C→C loop with policy enforcement
- **SignalFlywheel**: Pattern recognition and signal routing
- **EvalHarness**: Measurability and success metrics
- **PolicyEngine**: Command/timeout/cost enforcement
- **PipeRunner**: Safe execution of search/patch/test/commit

## Configuration

All configuration is in `project.yaml` - modify modes, budgets, policies, LLM environments, and eval thresholds there.

## Signal Density

The system maximizes signal density through:
- Pattern recognition in agent actions
- Recall-based routing of high-confidence signals
- Compound learning from iteration history
- Measurable feedback loops

## Measurability

Every action is measured:
- Execution time and cost tracking
- Confidence scoring with γ-gate
- Policy violation monitoring
- Success/failure metrics with provenance

This creates a ~2k LOC system that embodies your heuristics around compound personal agency through signal density and measurability.
\`\`\`

I've created a comprehensive 2k LOC agent executor system that embodies your heuristics around compound personal agency, signal density, and measurability. The system features:

**Core Architecture**: E→P→C→C loop (Evaluate→Plan→Code→Check) with γ-gate confidence thresholds, policy-first enforcement, and PR-first workflow.

**Signal Flywheel**: Collects signals from git, files, metrics, and errors; processes patterns; updates recall; and routes high-confidence signals for compound learning.

**Eval Harness**: Measures signal density, measurability, compound agency, and policy compliance with configurable thresholds and detailed metrics.

**Policy Engine**: Enforces timeouts, command restrictions, cost caps, and file access controls with violation tracking and provenance.

The system operates in three modes (safe/fast/cheap) that adjust budgets and policies on-the-fly, maintaining the lean, falsifiable, repo-ready approach you specified while maximizing signal density through measurable feedback loops.
