import { RAPID24_SYSTEM_PROMPT } from "./types"
import type { DeploymentChatContext } from "./types"

/** Serialize dashboard state into a compact block the model can reason over. */
export function formatDeploymentContext(context?: DeploymentChatContext): string {
  if (!context) return "No live deployment context attached."

  const lines: string[] = [
    "=== LIVE DEPLOYMENT CONTEXT (Rapid24 dashboard) ===",
    `Repository: ${context.repository ?? "n/a"}`,
    `Owner: ${context.owner ?? "n/a"}`,
    `Branch: ${context.branch ?? "n/a"}`,
    `Commit: ${context.commit ?? "n/a"}`,
    `Commit message: ${context.commitMessage ?? "n/a"}`,
    `Language: ${context.language ?? "n/a"}`,
    `Visibility: ${context.visibility ?? "n/a"}`,
    `Repository URL: ${context.repositoryUrl ?? "n/a"}`,
    `Environment: ${context.environment ?? "n/a"}${context.region ? ` · ${context.region}` : ""}`,
    `Interactive phase: ${context.interactivePhase ?? "n/a"}`,
    `Pipeline stage: ${context.pipelineStage ?? "n/a"}`,
    `Stage detail: ${context.pipelineStageDescription ?? "n/a"}`,
    `Deployment status: ${context.deploymentStatus ?? "n/a"}`,
    `Deployment phase: ${context.deploymentPhase ?? "n/a"}`,
    `Build progress: ${context.buildProgress ?? 0}%`,
    `Complete: ${context.isComplete ? "yes" : "no"}`,
    `URL: ${context.deploymentUrl ?? "n/a"}`,
  ]

  if (context.analysisScore != null) {
    lines.push(
      "",
      "=== REPOSITORY ANALYSIS ===",
      `Deployment readiness score: ${context.analysisScore}%`,
      `Framework: ${context.analysisFramework ?? "n/a"}`,
      `Package manager: ${context.analysisPackageManager ?? "n/a"}`,
      `Node: ${context.analysisNodeVersion ?? "n/a"}`,
      `Docker: ${context.analysisDocker ?? "n/a"}`,
      `CI/CD: ${context.analysisCicd ?? "n/a"}`,
      `Health: ${context.analysisHealth ?? "n/a"}`,
      `Environment: ${context.analysisEnvironment ?? "n/a"}`,
      `Security: ${context.analysisSecurity ?? "n/a"}`,
    )
    if (context.analysisFindings?.length) {
      lines.push("Findings:")
      for (const f of context.analysisFindings.slice(0, 12)) {
        lines.push(`  - ${f}`)
      }
    }
    if (context.analysisRecommendations?.length) {
      lines.push("Recommendations:")
      for (const r of context.analysisRecommendations.slice(0, 8)) {
        lines.push(`  - ${r}`)
      }
    }
    lines.push("=== END ANALYSIS ===")
  }

  if (context.healthChecks?.length) {
    lines.push("Health checks:")
    for (const check of context.healthChecks) {
      lines.push(
        `  - ${check.label}: ${check.status}${check.latency ? ` (${check.latency})` : ""}${check.message ? ` — ${check.message}` : ""}`,
      )
    }
  }

  if (context.recentErrors?.length) {
    lines.push("Recent errors / warnings:")
    for (const err of context.recentErrors) {
      lines.push(`  - ${err}`)
    }
  }

  if (context.terminalLogs?.length) {
    lines.push("Recent terminal logs:")
    for (const log of context.terminalLogs.slice(-24)) {
      lines.push(`  ${log}`)
    }
  }

  lines.push("=== END CONTEXT ===")
  return lines.join("\n")
}

export function buildSystemMessages(context?: DeploymentChatContext) {
  return [
    { role: "system" as const, content: RAPID24_SYSTEM_PROMPT },
    {
      role: "system" as const,
      content: formatDeploymentContext(context),
    },
  ]
}
