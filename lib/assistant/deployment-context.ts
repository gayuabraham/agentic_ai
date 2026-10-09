/**
 * Build a chat context snapshot from the live useDeploymentAgent state,
 * the globally selected GitHub repository, and Repository Analysis results.
 */

import type { DeploymentChatContext } from "@/lib/assistant/types"
import type { GitHubRepository, RepositoryAnalysis } from "@/lib/github/types"
import type { useDeploymentAgent } from "@/components/ai-agent/useDeploymentAgent"

type AgentSnapshot = ReturnType<typeof useDeploymentAgent>

export function buildDeploymentChatContext(
  agent: AgentSnapshot,
  githubRepo?: GitHubRepository | null,
  analysis?: RepositoryAnalysis | null,
): DeploymentChatContext {
  const repo = agent.repository
  const warnings = agent.terminalLines
    .filter((l) => l.type === "warning" || l.type === "info")
    .map((l) => l.text)

  const failedHealth = agent.healthChecks
    .filter(
      (h) =>
        h.status === "failing" || h.status === "degraded" || h.status === "pending",
    )
    .map(
      (h) =>
        `${h.label}: ${h.status}${h.message ? ` (${h.message})` : ""}`,
    )

  const recentErrors = [
    ...failedHealth,
    ...warnings.filter((t) => /missing|fail|error|warn/i.test(t)),
  ].slice(-8)

  const base: DeploymentChatContext = {
    repository: repo ? `${repo.owner}/${repo.name}` : undefined,
    owner: repo?.owner,
    branch: repo?.branch,
    commit: repo?.commit,
    commitMessage: repo?.commitMessage,
    environment: agent.environment?.name ?? agent.deployment.environment,
    region: agent.environment?.region,
    interactivePhase: agent.interactivePhase,
    pipelineStage: agent.currentStage?.label,
    pipelineStageDescription: agent.currentStage?.description,
    deploymentStatus: agent.agentStatus,
    deploymentPhase: agent.deployment.phase,
    buildProgress: agent.deployment.progress,
    isComplete: agent.isComplete,
    healthChecks: agent.healthChecks.map((h) => ({
      label: h.label,
      status: h.status,
      latency: h.latency,
      message: h.message,
    })),
    terminalLogs: agent.terminalLines
      .slice(-30)
      .map((l) => `[${l.type}] ${l.text}`),
    recentErrors,
    deploymentUrl: agent.deployment.url,
  }

  let merged: DeploymentChatContext = base

  if (githubRepo) {
    merged = {
      ...merged,
      repository: githubRepo.fullName,
      owner: githubRepo.owner.login,
      branch: githubRepo.defaultBranch,
      commit: githubRepo.latestCommitSha?.slice(0, 7) ?? merged.commit,
      commitMessage: githubRepo.latestCommitMessage ?? merged.commitMessage,
      language: githubRepo.language ?? undefined,
      repositoryUrl: githubRepo.htmlUrl,
      visibility: githubRepo.private ? "private" : "public",
    }
  }

  if (analysis) {
    merged = {
      ...merged,
      analysisScore: analysis.readiness.overall,
      analysisFramework:
        analysis.framework?.name ??
        analysis.primaryFramework ??
        undefined,
      analysisPackageManager: analysis.package.packageManager,
      analysisFindings: analysis.findings.map(
        (f) => `[${f.severity}] ${f.title}`,
      ),
      analysisRecommendations: analysis.recommendations.map(
        (r) => `[${r.priority}] ${r.title}: ${r.detail}`,
      ),
      analysisDocker: analysis.readiness.docker,
      analysisCicd: analysis.readiness.cicd,
      analysisHealth: analysis.readiness.health,
      analysisEnvironment: analysis.readiness.environment,
      analysisSecurity: analysis.readiness.security,
      analysisNodeVersion: analysis.package.nodeVersion ?? undefined,
      language: analysis.language ?? merged.language,
      commit: analysis.latestCommitSha?.slice(0, 7) ?? merged.commit,
      commitMessage: analysis.latestCommitMessage ?? merged.commitMessage,
    }
  }

  return merged
}
