"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { fetchDeploymentManifest } from "@/lib/deployment"
import type {
  AgentStatus,
  DeploymentManifest,
  DeploymentPhase,
  DeploymentStep,
} from "@/lib/deployment/types"
import type {
  ActivityEvent,
  DeploymentEnvironment,
  DeploymentInfo,
  HealthCheckItem,
  HealthCheckStatus,
  PipelineStepStatus,
  RenderedTerminalLine,
  RepositoryInfo,
  ServerMetric,
  TerminalScriptEntry,
} from "./types"
import { createTerminalCadence } from "./terminalTiming"

export interface SimulatedStage {
  id: string
  label: string
  description: string
  duration: number
  status: PipelineStepStatus
  agentStatus: AgentStatus
  phase: DeploymentPhase
}

export type DeploymentAgentStatus = "loading" | "ready" | "error"

/**
 * Interactive deployment flow (single source of truth).
 * awaiting_connect → connecting → awaiting_analyze → analyzing → awaiting_deploy → deploying → complete
 */
export type InteractivePhase =
  | "awaiting_connect"
  | "connecting"
  | "awaiting_analyze"
  | "analyzing"
  | "awaiting_deploy"
  | "deploying"
  | "complete"

export type RepoConnectionStatus = "disconnected" | "connecting" | "connected"

interface UseDeploymentAgentOptions {
  /** @deprecated Interactive mode never auto-starts the pipeline */
  autoStart?: boolean
  loop?: boolean
  enabled?: boolean
}

/** Steps [1..ANALYZE_END] run during Analyze; 0 = Connect; rest = Deploy */
const ANALYZE_END_INDEX = 5
const EMPTY_STEPS: DeploymentStep[] = []
const EMPTY_TERMINAL: TerminalScriptEntry[] = []

function formatClock(offsetSeconds = 0) {
  const total = 14 * 3600 + 32 * 60 + 10 + offsetSeconds
  const h = Math.floor(total / 3600) % 24
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

function isRunningPhase(phase: InteractivePhase) {
  return phase === "connecting" || phase === "analyzing" || phase === "deploying"
}

/**
 * Fake-backend-driven deployment agent with interactive Connect → Analyze → Deploy.
 * Loads `data/deployment.json` via GET /api/deployment. One shared state drives every panel.
 */
export function useDeploymentAgent({
  enabled = true,
}: UseDeploymentAgentOptions = {}) {
  const [status, setStatus] = useState<DeploymentAgentStatus>("loading")
  const [error, setError] = useState<string | null>(null)
  const [manifest, setManifest] = useState<DeploymentManifest | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const [interactivePhase, setInteractivePhase] =
    useState<InteractivePhase>("awaiting_connect")
  /** Index of the current/next step. When not advancing, equals completed count. */
  const [frontier, setFrontier] = useState(0)
  const [paused, setPaused] = useState(false)
  const [tick, setTick] = useState(0)
  const [toastMessage, setToastMessage] = useState<{
    id: number
    title: string
    description?: string
  } | null>(null)

  const [completedTerminal, setCompletedTerminal] = useState<RenderedTerminalLine[]>([])
  const [termLineIndex, setTermLineIndex] = useState(0)
  const [termCharIndex, setTermCharIndex] = useState(0)
  const [termReady, setTermReady] = useState(false)
  const [isTyping, setIsTyping] = useState(false)

  /** Bumps on every clean reset so UI panels remount with fresh animations */
  const [runId, setRunId] = useState(0)
  /** When true, awaiting_analyze / awaiting_deploy auto-continue without clicks */
  const [autoReplay, setAutoReplay] = useState(false)
  /** Incremented to ask the UI to scroll/highlight the terminal */
  const [viewLogsSignal, setViewLogsSignal] = useState(0)
  /** Snapshot of the last completed run's terminal (for View Logs after a reset) */
  const [archivedLogs, setArchivedLogs] = useState<RenderedTerminalLine[]>([])
  const [showingArchivedLogs, setShowingArchivedLogs] = useState(false)

  const stageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const termTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startedAtRef = useRef(formatClock())
  const toastIdRef = useRef(0)

  const steps = manifest?.steps ?? EMPTY_STEPS
  const metricTickMs = manifest?.simulation.metricTickMs ?? 900
  const advancing = isRunningPhase(interactivePhase) && !paused

  const clearTimers = useCallback(() => {
    if (stageTimerRef.current) {
      clearTimeout(stageTimerRef.current)
      stageTimerRef.current = null
    }
    if (termTimerRef.current) {
      clearTimeout(termTimerRef.current)
      termTimerRef.current = null
    }
  }, [])

  /** Shared clean slate — no page reload */
  const clearRuntimeState = useCallback(() => {
    clearTimers()
    startedAtRef.current = formatClock()
    setPaused(false)
    setTick(0)
    setCompletedTerminal([])
    setTermLineIndex(0)
    setTermCharIndex(0)
    setTermReady(false)
    setIsTyping(false)
    setShowingArchivedLogs(false)
    setToastMessage(null)
    setRunId((id) => id + 1)
  }, [clearTimers])

  // ── Load mock backend (no auto-start) ──────────────────────────────
  useEffect(() => {
    if (!enabled) return
    let cancelled = false

    async function load() {
      setStatus("loading")
      setError(null)
      try {
        const data = await fetchDeploymentManifest()
        if (cancelled) return
        setManifest(data)
        setStatus("ready")
        setInteractivePhase("awaiting_connect")
        setFrontier(0)
        setPaused(false)
        startedAtRef.current = data.deployment.startedAt || formatClock()
        setCompletedTerminal([])
        setTermLineIndex(0)
        setTermCharIndex(0)
        setTermReady(false)
      } catch (err) {
        if (cancelled) return
        setStatus("error")
        setError(err instanceof Error ? err.message : "Failed to load deployment data")
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [enabled, reloadKey])

  const pushToast = useCallback((title: string, description?: string) => {
    toastIdRef.current += 1
    setToastMessage({ id: toastIdRef.current, title, description })
  }, [])

  // ── Advance pipeline only while connecting / analyzing / deploying ─
  useEffect(() => {
    if (!enabled || status !== "ready" || !manifest || !advancing) return
    if (frontier < 0 || frontier >= steps.length) return

    const duration = steps[frontier].durationMs
    stageTimerRef.current = setTimeout(() => {
      const next = frontier + 1

      if (interactivePhase === "connecting") {
        // Finished step 0 — unlock Analyze
        setFrontier(1)
        setInteractivePhase("awaiting_analyze")
        if (!autoReplay) {
          pushToast(
            "Repository connected",
            `${manifest.repository.owner}/${manifest.repository.name} is linked`,
          )
        }
        return
      }

      if (interactivePhase === "analyzing") {
        if (frontier >= ANALYZE_END_INDEX) {
          setFrontier(ANALYZE_END_INDEX + 1)
          setInteractivePhase("awaiting_deploy")
          if (!autoReplay) {
            pushToast("Analysis complete", "Project ready — you can deploy to production")
          }
          return
        }
        setFrontier(next)
        return
      }

      if (interactivePhase === "deploying") {
        if (next >= steps.length) {
          setFrontier(steps.length)
          setInteractivePhase("complete")
          setAutoReplay(false)
          pushToast("Production live", manifest.deployment.url)
          return
        }
        setFrontier(next)
      }
    }, duration)

    return () => {
      if (stageTimerRef.current) clearTimeout(stageTimerRef.current)
    }
  }, [
    enabled,
    status,
    manifest,
    advancing,
    frontier,
    steps,
    interactivePhase,
    pushToast,
    autoReplay,
  ])

  // ── Auto-continue through gates during Deploy Again replay ─────────
  useEffect(() => {
    if (!autoReplay || status !== "ready") return

    if (interactivePhase === "awaiting_analyze") {
      const t = setTimeout(() => {
        setTermLineIndex(0)
        setTermCharIndex(0)
        setTermReady(false)
        setPaused(false)
        setFrontier(1)
        setInteractivePhase("analyzing")
      }, 520)
      return () => clearTimeout(t)
    }

    if (interactivePhase === "awaiting_deploy") {
      const t = setTimeout(() => {
        setTermLineIndex(0)
        setTermCharIndex(0)
        setTermReady(false)
        setPaused(false)
        setFrontier(ANALYZE_END_INDEX + 1)
        setInteractivePhase("deploying")
      }, 520)
      return () => clearTimeout(t)
    }

    if (interactivePhase === "complete") {
      setAutoReplay(false)
    }
  }, [autoReplay, interactivePhase, status])

  // ── Metric tick (active while working or live) ─────────────────────
  useEffect(() => {
    if (!enabled || status !== "ready") return
    if (interactivePhase === "awaiting_connect") return
    const id = setInterval(() => setTick((t) => t + 1), metricTickMs)
    return () => clearInterval(id)
  }, [enabled, status, metricTickMs, interactivePhase])

  const currentStageTerminal = useMemo<TerminalScriptEntry[]>(() => {
    if (!advancing || frontier < 0 || frontier >= steps.length) return EMPTY_TERMINAL
    return steps[frontier].terminal.map((line, i) => ({
      id: `${steps[frontier].id}-${i}`,
      type: line.type,
      text: line.text,
    }))
  }, [steps, frontier, advancing])

  useEffect(() => {
    if (!enabled || !advancing) return
    setTermLineIndex(0)
    setTermCharIndex(0)
    setTermReady(false)
    setIsTyping(false)
  }, [enabled, frontier, advancing])

  // If a step advances before typing finishes, commit remaining lines from that step
  const prevFrontierRef = useRef(frontier)
  useEffect(() => {
    if (!enabled) return

    const prev = prevFrontierRef.current
    if (frontier <= prev) {
      prevFrontierRef.current = frontier
      return
    }
    prevFrontierRef.current = frontier
    if (prev < 0 || prev >= steps.length) return
    const leftover = steps[prev].terminal
    if (leftover.length === 0) return
    setCompletedTerminal((existing) => {
      const have = new Set(existing.map((l) => `${l.type}:${l.text}`))
      const extras: RenderedTerminalLine[] = []
      leftover.forEach((line, i) => {
        const key = `${line.type}:${line.text}`
        if (!have.has(key)) {
          extras.push({
            id: `${steps[prev].id}-flush-${i}-${existing.length + extras.length}`,
            type: line.type,
            text: line.text,
          })
        }
      })
      return extras.length ? [...existing, ...extras] : existing
    })
  }, [enabled, frontier, steps])

  // ── Type terminal lines for the active frontier step ───────────────
  useEffect(() => {
    if (!enabled) return

    if (status !== "ready" || !advancing) {
      setIsTyping((typing) => (typing ? false : typing))
      setTermReady((ready) => (ready ? false : ready))
      return
    }
    if (frontier < 0 || frontier >= steps.length) return

    const script = currentStageTerminal
    if (script.length === 0) return

    if (termLineIndex >= script.length) {
      setIsTyping((typing) => (typing ? false : typing))
      setTermReady((ready) => (ready ? false : ready))
      return
    }

    const line = script[termLineIndex]
    const durationMs = steps[frontier]?.durationMs ?? 2000
    const cadence = createTerminalCadence(script, durationMs)

    if (!termReady) {
      termTimerRef.current = setTimeout(() => {
        setTermReady(true)
        setIsTyping(true)
      }, cadence.pauseBefore(line.type))
      return () => {
        if (termTimerRef.current) clearTimeout(termTimerRef.current)
      }
    }

    if (termCharIndex < line.text.length) {
      const char = line.text[termCharIndex]
      const prev = termCharIndex > 0 ? line.text[termCharIndex - 1] : ""
      termTimerRef.current = setTimeout(() => {
        setTermCharIndex((c) => c + 1)
      }, cadence.charDelay(line.type, char, prev))
      return () => {
        if (termTimerRef.current) clearTimeout(termTimerRef.current)
      }
    }

    termTimerRef.current = setTimeout(() => {
      setCompletedTerminal((prev) => [
        ...prev,
        { id: `${line.id}-${prev.length}`, type: line.type, text: line.text },
      ])
      setTermLineIndex((i) => i + 1)
      setTermCharIndex(0)
      setTermReady(false)
    }, cadence.pauseAfter(line.type))

    return () => {
      if (termTimerRef.current) clearTimeout(termTimerRef.current)
    }
  }, [
    enabled,
    status,
    advancing,
    frontier,
    steps.length,
    currentStageTerminal,
    termLineIndex,
    termCharIndex,
    termReady,
  ])

  const simulatedStages = useMemo<SimulatedStage[]>(
    () =>
      steps.map((step, index) => {
        let stepStatus: PipelineStepStatus = "pending"
        if (index < frontier) stepStatus = "completed"
        else if (index === frontier && advancing) stepStatus = "running"
        return {
          id: step.id,
          label: step.label,
          description: step.description,
          duration: step.durationMs,
          status: stepStatus,
          agentStatus: step.agentStatus,
          phase: step.phase,
        }
      }),
    [steps, frontier, advancing],
  )

  const total = steps.length
  const completedCount = Math.min(frontier, total)
  const progress = total === 0 ? 0 : Math.round((completedCount / total) * 100)
  const isComplete = interactivePhase === "complete" || (total > 0 && frontier >= total)

  const currentStage: SimulatedStage =
    advancing && frontier >= 0 && frontier < total
      ? simulatedStages[frontier]
      : frontier > 0
        ? simulatedStages[Math.min(frontier - 1, total - 1)]
        : simulatedStages[0] ?? {
            id: "idle",
            label: "Waiting",
            description: "Connect a repository to begin",
            duration: 0,
            status: "pending" as PipelineStepStatus,
            agentStatus: "idle" as AgentStatus,
            phase: "queued" as DeploymentPhase,
          }

  const agentStatus: AgentStatus = (() => {
    if (status === "loading") return "thinking"
    if (isComplete) return "success"
    if (interactivePhase === "awaiting_connect") return "idle"
    if (interactivePhase === "connecting") return "analyzing"
    if (interactivePhase === "awaiting_analyze") return "idle"
    if (interactivePhase === "analyzing") return currentStage.agentStatus ?? "analyzing"
    if (interactivePhase === "awaiting_deploy") return "idle"
    if (interactivePhase === "deploying") return currentStage.agentStatus ?? "deploying"
    return "thinking"
  })()

  const phase: DeploymentPhase = isComplete
    ? "live"
    : advancing
      ? currentStage.phase
      : interactivePhase === "awaiting_deploy"
        ? "building"
        : interactivePhase === "awaiting_analyze" || interactivePhase === "awaiting_connect"
          ? "queued"
          : currentStage.phase ?? "queued"

  const deployment = useMemo<DeploymentInfo>(() => {
    const meta = manifest?.deployment
    return {
      id: meta?.id ?? "dep_pending",
      environment: meta?.environment ?? "production",
      phase,
      progress: isComplete ? 100 : Math.min(99, progress),
      startedAt: startedAtRef.current,
      url:
        phase === "live" || phase === "verifying" || isComplete
          ? meta?.url
          : undefined,
    }
  }, [manifest, phase, isComplete, progress])

  const healthChecks = useMemo<HealthCheckItem[]>(() => {
    if (!manifest) return []
    const stepIds = steps.map((s) => s.id)
    const activeId =
      advancing && frontier >= 0 && frontier < total ? steps[frontier].id : null

    return manifest.healthChecks.map((template) => {
      const unlockIndex = stepIds.indexOf(template.unlockAfterStepId)
      const unlocked = isComplete || (unlockIndex >= 0 && frontier > unlockIndex)
      const probing = Boolean(activeId && activeId === template.unlockAfterStepId)

      return {
        id: template.id,
        label: template.label,
        endpoint: template.endpoint,
        status: (unlocked ? "healthy" : "pending") as HealthCheckStatus,
        latency: unlocked ? template.healthyLatency : undefined,
        message: unlocked
          ? template.healthyMessage
          : probing
            ? "Probing…"
            : "Awaiting unlock",
      }
    })
  }, [manifest, steps, frontier, total, isComplete, advancing])

  const serverMetrics = useMemo<ServerMetric[]>(() => {
    const baseline = manifest?.metricsBaseline ?? []
    if (interactivePhase === "awaiting_connect") {
      return baseline.map((m) => ({ ...m, value: Math.max(4, Math.round(m.value * 0.15)) }))
    }
    const load = isComplete ? 0.35 : 0.45 + (progress / 100) * 0.4
    const wave = (seed: number) =>
      Math.sin((tick / 10 + seed) * Math.PI * 2) * (isComplete ? 1.5 : 4)

    return baseline.map((metric, i) => {
      const base = metric.value * load + (isComplete ? metric.value * 0.25 : 0)
      const value = Math.round(Math.min(96, Math.max(8, base + wave(i * 0.37))))
      return { ...metric, value }
    })
  }, [manifest, progress, isComplete, tick, interactivePhase])

  const activityEvents = useMemo<ActivityEvent[]>(() => {
    const events: ActivityEvent[] = []
    const limit = advancing ? frontier : frontier
    for (let i = 0; i < limit; i++) {
      const step = steps[i]
      if (!step) continue
      events.push({
        id: `evt-${step.id}-${i}`,
        timestamp: formatClock(i - limit),
        title: step.label,
        description: step.description,
        status: "success",
      })
    }
    if (advancing && frontier < total && steps[frontier]) {
      const step = steps[frontier]
      events.unshift({
        id: `evt-${step.id}-live`,
        timestamp: formatClock(0),
        title: step.label,
        description: step.description,
        status: step.agentStatus,
      })
    }
    return events
  }, [steps, frontier, advancing, total])

  const activeTerminalLine =
    advancing && termReady && termLineIndex < currentStageTerminal.length
      ? currentStageTerminal[termLineIndex]
      : null
  const activeTerminalText = activeTerminalLine
    ? activeTerminalLine.text.slice(0, termCharIndex)
    : ""
  const awaitingTerminal =
    advancing &&
    frontier >= 0 &&
    frontier < total &&
    !termReady &&
    termLineIndex < currentStageTerminal.length

  const repository: RepositoryInfo | undefined = manifest?.repository
  const environment: DeploymentEnvironment | undefined = manifest?.environment
  const aiThoughts = manifest?.aiThoughts

  const repoConnectionStatus: RepoConnectionStatus =
    interactivePhase === "awaiting_connect"
      ? "disconnected"
      : interactivePhase === "connecting"
        ? "connecting"
        : "connected"

  const canConnect = status === "ready" && interactivePhase === "awaiting_connect"
  const canAnalyze = interactivePhase === "awaiting_analyze"
  const canDeploy = interactivePhase === "awaiting_deploy"

  const connectRepository = useCallback(() => {
    if (!canConnect) return
    startedAtRef.current = formatClock()
    setShowingArchivedLogs(false)
    setCompletedTerminal([])
    setTermLineIndex(0)
    setTermCharIndex(0)
    setTermReady(false)
    setPaused(false)
    setAutoReplay(false)
    setFrontier(0)
    setInteractivePhase("connecting")
  }, [canConnect])

  const analyzeProject = useCallback(() => {
    if (!canAnalyze) return
    setShowingArchivedLogs(false)
    setPaused(false)
    setTermLineIndex(0)
    setTermCharIndex(0)
    setTermReady(false)
    setFrontier(1)
    setInteractivePhase("analyzing")
  }, [canAnalyze])

  const deploy = useCallback(() => {
    if (!canDeploy) return
    setShowingArchivedLogs(false)
    setPaused(false)
    setTermLineIndex(0)
    setTermCharIndex(0)
    setTermReady(false)
    setFrontier(ANALYZE_END_INDEX + 1)
    setInteractivePhase("deploying")
  }, [canDeploy])

  const pause = useCallback(() => setPaused(true), [])
  const resume = useCallback(() => setPaused(false), [])
  const togglePause = useCallback(() => setPaused((p) => !p), [])

  const reset = useCallback(() => {
    setAutoReplay(false)
    clearRuntimeState()
    setFrontier(0)
    setInteractivePhase("awaiting_connect")
  }, [clearRuntimeState])

  /** Reset to idle — user runs Connect → Analyze → Deploy again */
  const restartDeployment = useCallback(() => {
    if (completedTerminal.length > 0) {
      setArchivedLogs(completedTerminal)
    }
    reset()
    pushToast("Deployment restarted", "All systems reset — connect a repository to begin")
  }, [completedTerminal, reset, pushToast])

  /** Full clean reset + seamless auto-replay of the entire deployment */
  const deployAgain = useCallback(() => {
    if (completedTerminal.length > 0) {
      setArchivedLogs(completedTerminal)
    }
    clearRuntimeState()
    setFrontier(0)
    setAutoReplay(true)
    setInteractivePhase("connecting")
    pushToast("Deploy again", "Replaying Connect → Analyze → Deploy")
  }, [completedTerminal, clearRuntimeState, pushToast])

  const viewLogs = useCallback(() => {
    if (completedTerminal.length === 0 && archivedLogs.length > 0) {
      setShowingArchivedLogs(true)
      setCompletedTerminal(archivedLogs)
    }
    setViewLogsSignal((n) => n + 1)
  }, [completedTerminal.length, archivedLogs])

  const reload = useCallback(() => {
    setAutoReplay(false)
    setReloadKey((k) => k + 1)
  }, [])

  const clearToast = useCallback(() => setToastMessage(null), [])

  // activeIndex alias for CurrentStep: running index, or last completed when idle
  const activeIndex = advancing ? frontier : Math.max(frontier - 1, 0)

  return {
    status,
    error,
    manifest,
    interactivePhase,
    repoConnectionStatus,
    stages: simulatedStages,
    activeIndex,
    frontier,
    currentStage,
    completedCount,
    total,
    progress,
    isComplete,
    paused,
    advancing,
    agentStatus,
    deployment,
    healthChecks,
    serverMetrics,
    activityEvents,
    repository,
    environment,
    aiThoughts,
    terminalLines: showingArchivedLogs ? archivedLogs : completedTerminal,
    activeTerminalLine: showingArchivedLogs ? null : activeTerminalLine,
    activeTerminalText: showingArchivedLogs ? "" : activeTerminalText,
    isTyping: showingArchivedLogs ? false : isTyping,
    awaitingTerminal: showingArchivedLogs ? false : awaitingTerminal,
    canConnect,
    canAnalyze,
    canDeploy,
    isReplaying: autoReplay,
    runId,
    viewLogsSignal,
    toastMessage,
    clearToast,
    connectRepository,
    analyzeProject,
    deploy,
    deployAgain,
    restartDeployment,
    viewLogs,
    start: connectRepository,
    reset,
    reload,
    pause,
    resume,
    togglePause,
  }
}

export function stepsToLegacyStages(steps: DeploymentStep[]) {
  return steps.map((s) => ({
    id: s.id,
    label: s.label,
    description: s.description,
    duration: s.durationMs,
  }))
}
