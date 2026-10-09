"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useRef, useState } from "react"
import { GitHubUserMenu, RepositorySelector } from "@/components/github"
import { useRepositoryAnalysis } from "@/hooks/useRepositoryAnalysis"
import { cn } from "@/lib/utils"
import {
  useDashboardRepository,
  useRepositoryAnalysisState,
  useRepositoryStore,
  useSelectedGitHubRepository,
} from "@/stores/repository-store"
import { ActivityTimeline } from "./ActivityTimeline"
import { AgentHeader } from "./AgentHeader"
import { AgentThinking } from "./AgentThinking"
import { AnalysisExplanationPanel } from "./AnalysisExplanationPanel"
import { AGENT_PANEL_CLASS } from "./constants"
import { CurrentStep } from "./CurrentStep"
import { DeploymentActions } from "./DeploymentActions"
import { DeploymentReplay } from "./DeploymentReplay"
import { DeploymentStatus } from "./DeploymentStatus"
import { DeploymentToastBridge } from "./DeploymentToastBridge"
import { HealthCheck } from "./HealthCheck"
import { PipelineProgress } from "./PipelineProgress"
import { RepositoryAnalysisCard } from "./RepositoryAnalysisCard"
import { RepositoryCard } from "./RepositoryCard"
import { DevOpsMetricsDashboard } from "./DevOpsMetricsDashboard"
import { TerminalOutput } from "./TerminalOutput"
import { useDeploymentAgent } from "./useDeploymentAgent"

const IDLE_CONTEXT = "Waiting for operator action…"
const AWAITING_ANALYZE_CONTEXT = "Repository linked · ready for deep analysis"
const AWAITING_DEPLOY_CONTEXT = "Build graph mapped · awaiting deploy command"

export type DeploymentAgent = ReturnType<typeof useDeploymentAgent>

interface AgentWindowProps {
  className?: string
  /** Shared agent instance from the page (avoids duplicate simulation state) */
  agent?: DeploymentAgent
}

function contextFromStage(stageId: string): "repo" | "branch" | "commit" | "environment" | null {
  switch (stageId) {
    case "connected":
    case "reading":
      return "repo"
    case "analyzing":
    case "dependencies":
      return "branch"
    case "docker":
    case "env":
      return "commit"
    case "deploying":
    case "health":
    case "live":
      return "environment"
    default:
      return null
  }
}

function thinkingMessage(
  agent: DeploymentAgent,
  isBooting: boolean,
  selectedGithub: ReturnType<typeof useSelectedGitHubRepository>,
) {
  if (isBooting) return "Loading deployment manifest from mock API…"
  switch (agent.interactivePhase) {
    case "awaiting_connect":
      return selectedGithub
        ? `Ready to connect ${selectedGithub.fullName}`
        : "Waiting for repository connection…"
    case "connecting":
      return selectedGithub
        ? `Establishing secure link to ${selectedGithub.fullName}…`
        : "Establishing secure link to GitHub…"
    case "awaiting_analyze":
      return selectedGithub
        ? `${selectedGithub.fullName} linked — ready to analyze.`
        : "Repository linked — ready to analyze the project."
    case "analyzing":
      return `${agent.currentStage.label} — ${agent.currentStage.description}`
    case "awaiting_deploy":
      return "Analysis complete — ready to deploy to production."
    case "deploying":
      return `${agent.currentStage.label} — ${agent.currentStage.description}`
    case "complete":
      return "Deployment verified — production is healthy."
    default:
      return agent.currentStage.description
  }
}

export function AgentWindow({ className, agent: controlledAgent }: AgentWindowProps) {
  const internalAgent = useDeploymentAgent({ enabled: !controlledAgent })
  const agent = controlledAgent ?? internalAgent
  const terminalRef = useRef<HTMLDivElement>(null)
  const [logsHighlight, setLogsHighlight] = useState(false)
  const [selectorOpen, setSelectorOpen] = useState(false)
  const selectedGithub = useSelectedGitHubRepository()
  const displayRepo = useDashboardRepository(agent.repository)
  const { analysis, status: analysisStatus, error: analysisError } =
    useRepositoryAnalysisState()
  // Trigger analysis when a GitHub repo is selected — syncs into Zustand
  const { isLoading: analysisLoading } = useRepositoryAnalysis(
    Boolean(selectedGithub),
  )

  const isBooting = agent.status === "loading"
  const hasError = agent.status === "error"
  // Don't treat background revalidation as a blocking "analyzing" state
  const analysisBusy =
    (analysisLoading || analysisStatus === "loading") && !analysis

  const headerSubtitle = selectedGithub
    ? `${selectedGithub.fullName} · ${selectedGithub.defaultBranch}${
        selectedGithub.language ? ` · ${selectedGithub.language}` : ""
      }`
    : "Autonomous AI Deployment Agent"

  const terminalTitle = selectedGithub
    ? `${selectedGithub.name} · ${selectedGithub.defaultBranch}`
    : "deployment · bash"

  const activityTitle = selectedGithub
    ? `Activity · ${selectedGithub.name}`
    : "Activity Timeline"

  useEffect(() => {
    if (!agent.viewLogsSignal) return
    const el = terminalRef.current
    if (!el) return
    el.scrollIntoView({ behavior: "smooth", block: "center" })
    setLogsHighlight(true)
    const t = setTimeout(() => setLogsHighlight(false), 1800)
    return () => clearTimeout(t)
  }, [agent.viewLogsSignal])

  // Keep commit metadata fresh even if analysis is slow
  useEffect(() => {
    if (!selectedGithub?.owner?.login || !selectedGithub.name) return
    if (selectedGithub.latestCommitSha) return
    let cancelled = false
    const run = async () => {
      try {
        const url = `/api/github/repos/${encodeURIComponent(selectedGithub.owner.login)}/${encodeURIComponent(selectedGithub.name)}/commit?branch=${encodeURIComponent(selectedGithub.defaultBranch || "main")}`
        const res = await fetch(url)
        if (!res.ok || cancelled) return
        const data = (await res.json()) as {
          commit?: { sha: string; message: string; date: string | null }
        }
        if (!data.commit || cancelled) return
        useRepositoryStore.getState().patchSelected({
          latestCommitSha: data.commit.sha,
          latestCommitMessage: data.commit.message,
          latestCommitDate: data.commit.date,
        })
      } catch {
        // non-blocking
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [
    selectedGithub?.id,
    selectedGithub?.owner?.login,
    selectedGithub?.name,
    selectedGithub?.defaultBranch,
    selectedGithub?.latestCommitSha,
  ])

  /** Connect opens the real GitHub selector when no repo is selected yet */
  const handleConnect = () => {
    if (!selectedGithub) {
      setSelectorOpen(true)
      return
    }
    agent.connectRepository()
  }

  const handleRepoSelected = () => {
    if (agent.canConnect) {
      agent.connectRepository()
    }
  }

  return (
    <div className={cn("flex flex-col", AGENT_PANEL_CLASS, className)}>
      <DeploymentToastBridge message={agent.toastMessage} onClear={agent.clearToast} />

      <RepositorySelector
        open={selectorOpen}
        onOpenChange={setSelectorOpen}
        onSelected={handleRepoSelected}
      />

      <div className="pointer-events-none absolute -left-24 top-0 size-80 rounded-full bg-[var(--r24-agent-gradient-1)] blur-[100px]" />
      <div className="pointer-events-none absolute -right-24 top-1/4 size-80 rounded-full bg-[var(--r24-agent-gradient-2)] blur-[100px]" />

      <AgentHeader
        status={isBooting ? "thinking" : hasError ? "error" : agent.agentStatus}
        subtitle={headerSubtitle}
        paused={agent.paused}
        onTogglePause={
          agent.advancing || agent.paused ? agent.togglePause : undefined
        }
        actions={
          <GitHubUserMenu onConnectClick={() => setSelectorOpen(true)} />
        }
      />

      {hasError ? (
        <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
          <p className="text-sm text-red-400">Failed to load deployment plan</p>
          <p className="font-mono text-xs text-zinc-500">{agent.error}</p>
          <button
            type="button"
            onClick={() => agent.reload()}
            className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/[0.08]"
          >
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="border-b border-[var(--r24-agent-header-border)] p-4 lg:px-7 lg:pt-6 lg:pb-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={
                  agent.isComplete
                    ? "replay"
                    : agent.isReplaying
                      ? "replaying"
                      : agent.interactivePhase
                }
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ type: "spring", stiffness: 280, damping: 26 }}
              >
                {agent.isComplete ? (
                  <DeploymentReplay
                    onDeployAgain={agent.deployAgain}
                    onRestart={agent.restartDeployment}
                    onViewLogs={agent.viewLogs}
                  />
                ) : agent.isReplaying ? (
                  <motion.div
                    className="rounded-2xl border border-cyan-500/25 bg-cyan-500/10 px-4 py-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-cyan-300/80">
                      Auto replay
                    </p>
                    <p className="mt-1 text-sm font-semibold text-zinc-100">
                      Redeploying — Connect → Analyze → Deploy
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-zinc-500">
                      {agent.interactivePhase.replace(/_/g, " ")} · no page reload
                    </p>
                  </motion.div>
                ) : (
                  <DeploymentActions
                    phase={agent.interactivePhase}
                    canConnect={agent.canConnect}
                    canAnalyze={agent.canAnalyze}
                    canDeploy={agent.canDeploy}
                    onConnect={handleConnect}
                    onAnalyze={agent.analyzeProject}
                    onDeploy={agent.deploy}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="border-b border-[var(--r24-agent-header-border)] px-4 py-5 lg:px-7 lg:py-6">
            <DevOpsMetricsDashboard
              key={`metrics-${agent.runId}`}
              interactivePhase={agent.interactivePhase}
              repoConnectionStatus={agent.repoConnectionStatus}
              deployment={agent.deployment}
              healthChecks={agent.healthChecks}
              progress={agent.progress}
              isComplete={agent.isComplete}
              advancing={agent.advancing}
              environmentName={agent.environment?.name}
              region={agent.environment?.region}
              releaseVersion="v2.4.1"
            />
          </div>

          <div className="relative flex flex-col gap-5 p-4 lg:flex-row lg:items-start lg:gap-5 lg:p-7">
            <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-[300px] xl:w-[320px]">
              <RepositoryCard
                key={`repo-${agent.runId}-${selectedGithub?.id ?? "demo"}`}
                repository={displayRepo}
                environment={agent.environment}
                connectionStatus={agent.repoConnectionStatus}
                activeContext={
                  agent.isComplete || isBooting || !agent.advancing
                    ? agent.repoConnectionStatus === "connected"
                      ? "repo"
                      : null
                    : contextFromStage(agent.currentStage.id)
                }
              />
              <RepositoryAnalysisCard
                key={`analysis-${selectedGithub?.id ?? "none"}`}
                analysis={analysis}
                loading={analysisBusy}
                error={analysisError}
              />
            </aside>

            <main className="flex min-w-0 flex-1 flex-col gap-4">
              <AgentThinking
                key={`think-${agent.runId}`}
                isComplete={agent.isComplete}
                active={
                  isBooting ||
                  analysisBusy ||
                  agent.interactivePhase === "connecting" ||
                  agent.interactivePhase === "analyzing" ||
                  agent.interactivePhase === "deploying"
                }
                status={
                  isBooting || analysisBusy
                    ? "thinking"
                    : agent.agentStatus
                }
                thoughts={
                  analysisBusy
                    ? [
                        "Scanning repository tree…",
                        "Detecting framework & package manager…",
                        "Checking Docker & CI/CD signals…",
                        "Scoring deployment readiness…",
                      ]
                    : agent.aiThoughts
                }
                message={
                  analysisBusy
                    ? `Analyzing ${selectedGithub?.fullName ?? "repository"}…`
                    : agent.isReplaying
                      ? "Auto-replay in progress…"
                      : agent.interactivePhase === "awaiting_analyze"
                        ? AWAITING_ANALYZE_CONTEXT
                        : agent.interactivePhase === "awaiting_deploy"
                          ? AWAITING_DEPLOY_CONTEXT
                          : agent.interactivePhase === "awaiting_connect"
                            ? IDLE_CONTEXT
                            : thinkingMessage(agent, isBooting, selectedGithub)
                }
              />
              {selectedGithub ? (
                <AnalysisExplanationPanel
                  analysis={analysis}
                  loading={analysisBusy}
                  error={analysisError}
                />
              ) : null}
              <PipelineProgress
                key={`pipe-${agent.runId}`}
                stages={agent.stages}
                progress={agent.progress}
                completedCount={agent.completedCount}
                total={agent.total || 1}
              />
              {!isBooting && agent.currentStage ? (
                <CurrentStep
                  key={`step-${agent.runId}-${agent.currentStage.id}`}
                  currentStage={agent.currentStage}
                  index={agent.activeIndex}
                  total={agent.total}
                  isComplete={agent.isComplete}
                />
              ) : null}
            </main>

            <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-[300px] xl:w-[320px]">
              <DeploymentStatus
                key={`dep-${agent.runId}`}
                deployment={agent.deployment}
              />
              <HealthCheck key={`health-${agent.runId}`} checks={agent.healthChecks} />
            </aside>
          </div>

          <div className="relative grid grid-cols-1 gap-5 border-t border-[var(--r24-agent-header-border)] p-4 lg:grid-cols-2 lg:gap-5 lg:p-7">
            <div
              ref={terminalRef}
              className={cn(
                "rounded-2xl transition-[box-shadow] duration-500",
                logsHighlight &&
                  "shadow-[0_0_0_1px_rgba(52,211,153,0.45),0_0_28px_rgba(16,185,129,0.25)]",
              )}
            >
              <TerminalOutput
                key={`term-${agent.runId}`}
                className="min-h-[220px]"
                title={terminalTitle}
                lines={agent.terminalLines}
                activeLine={agent.activeTerminalLine}
                activeText={agent.activeTerminalText}
                isTyping={agent.isTyping}
                isComplete={agent.isComplete}
                awaitingNext={agent.awaitingTerminal}
              />
            </div>
            <ActivityTimeline
              key={`act-${agent.runId}-${selectedGithub?.id ?? "demo"}`}
              title={activityTitle}
              events={agent.activityEvents}
            />
          </div>
        </>
      )}
    </div>
  )
}
