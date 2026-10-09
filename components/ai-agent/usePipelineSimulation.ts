"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  DEMO_DEPLOYMENT,
  DEMO_ENVIRONMENT,
  DEMO_SERVER_METRICS,
  DEPLOYMENT_PIPELINE_STAGES,
  type PipelineStageDefinition,
} from "./constants"
import type {
  ActivityEvent,
  AgentStatus,
  DeploymentInfo,
  DeploymentPhase,
  HealthCheckItem,
  ServerMetric,
} from "./types"

export interface SimulatedStage extends PipelineStageDefinition {
  status: "pending" | "running" | "completed" | "failed" | "skipped"
}

interface UsePipelineSimulationOptions {
  stages?: PipelineStageDefinition[]
  autoStart?: boolean
  loop?: boolean
  loopDelay?: number
  /** When false, skip timers (useful when a parent owns the simulation). */
  enabled?: boolean
}

function formatClock(offsetSeconds = 0) {
  // Stable demo clock — avoids SSR/client hydration mismatches from Date.now()
  const total = 14 * 3600 + 32 * 60 + 10 + offsetSeconds
  const h = Math.floor(total / 3600) % 24
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

function stageToAgentStatus(stageId: string, isComplete: boolean): AgentStatus {
  if (isComplete) return "success"
  switch (stageId) {
    case "connected":
    case "reading":
    case "analyzing":
    case "dependencies":
    case "docker":
      return "analyzing"
    case "env":
    case "build":
    case "detect":
    case "fixes":
      return "fixing"
    case "tests":
    case "image":
    case "deploying":
      return "deploying"
    case "health":
      return "verifying"
    case "live":
      return "success"
    default:
      return "thinking"
  }
}

function stageToDeploymentPhase(index: number, total: number, isComplete: boolean): DeploymentPhase {
  if (isComplete || index >= total - 1) return "live"
  if (index < 0) return "queued"
  if (index <= 2) return "queued"
  if (index <= 9) return "building"
  if (index <= 11) return "deploying"
  if (index <= 12) return "verifying"
  return "live"
}

function deriveHealthChecks(activeIndex: number, isComplete: boolean): HealthCheckItem[] {
  const done = (minIndex: number) => isComplete || activeIndex > minIndex
  const running = (index: number) => !isComplete && activeIndex === index

  return [
    {
      id: "http",
      label: "HTTP Health",
      endpoint: "/api/health",
      status: done(12) ? "healthy" : "pending",
      latency: done(12) ? "42ms" : undefined,
      message: running(12) ? "Probing endpoint…" : done(12) ? undefined : "Awaiting verification",
    },
    {
      id: "db",
      label: "Database",
      endpoint: "postgres://prod-primary",
      status: done(5) ? "healthy" : "pending",
      latency: done(5) ? "18ms" : undefined,
      message: running(5) ? "Validating connection…" : done(5) ? undefined : "Waiting on env validation",
    },
    {
      id: "ssl",
      label: "SSL Certificate",
      status: done(4) ? "healthy" : "pending",
      message: done(4) ? "Valid until 2027-03-15" : "Scanning certificate chain",
    },
    {
      id: "smoke",
      label: "Smoke Tests",
      endpoint: "/api/status",
      status: done(12) || isComplete ? "healthy" : "pending",
      latency: done(12) || isComplete ? "31ms" : undefined,
      message: running(13)
        ? "Running smoke suite…"
        : done(12) || isComplete
          ? undefined
          : "Awaiting production rollout",
    },
  ]
}

function deriveServerMetrics(progress: number, isComplete: boolean, tick: number): ServerMetric[] {
  const load = isComplete ? 0.35 : 0.45 + (progress / 100) * 0.4
  const wave = (seed: number) => Math.sin((tick / 10 + seed) * Math.PI * 2) * (isComplete ? 1.5 : 4)

  return DEMO_SERVER_METRICS.map((metric, i) => {
    const base = metric.value * load + (isComplete ? metric.value * 0.25 : 0)
    const value = Math.round(Math.min(96, Math.max(8, base + wave(i * 0.37))))
    return { ...metric, value }
  })
}

/**
 * Drives an auto-advancing deployment pipeline and derives live UI state
 * for deployment, health, metrics, and activity — so every panel stays in sync.
 */
export function usePipelineSimulation({
  stages = DEPLOYMENT_PIPELINE_STAGES,
  autoStart = true,
  loop = true,
  loopDelay = 3200,
  enabled = true,
}: UsePipelineSimulationOptions = {}) {
  const [activeIndex, setActiveIndex] = useState(autoStart && enabled ? 0 : -1)
  const [paused, setPaused] = useState(false)
  const [tick, setTick] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const startedAtRef = useRef(formatClock())

  useEffect(() => {
    if (!enabled || activeIndex < 0 || paused) return

    if (activeIndex >= stages.length) {
      if (!loop) return
      timerRef.current = setTimeout(() => {
        startedAtRef.current = formatClock()
        setActiveIndex(0)
      }, loopDelay)
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current)
      }
    }

    const currentDuration = stages[activeIndex].duration
    timerRef.current = setTimeout(() => {
      setActiveIndex((prev) => prev + 1)
    }, currentDuration)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [activeIndex, stages, loop, loopDelay, paused, enabled])

  // Soft metric oscillation while the agent is working
  useEffect(() => {
    if (!enabled) return
    const id = setInterval(() => setTick((t) => t + 1), 900)
    return () => clearInterval(id)
  }, [enabled])

  const simulatedStages = useMemo<SimulatedStage[]>(
    () =>
      stages.map((stage, index) => {
        let status: SimulatedStage["status"] = "pending"
        if (index < activeIndex) status = "completed"
        else if (index === activeIndex) status = "running"
        return { ...stage, status }
      }),
    [stages, activeIndex],
  )

  const total = stages.length
  const completedCount = Math.min(Math.max(activeIndex, 0), total)
  const progress = Math.round((completedCount / total) * 100)
  const isComplete = activeIndex >= total
  const currentStage =
    activeIndex >= 0 && activeIndex < total ? simulatedStages[activeIndex] : simulatedStages[total - 1]

  const agentStatus = stageToAgentStatus(currentStage?.id ?? "connected", isComplete)
  const phase = stageToDeploymentPhase(activeIndex, total, isComplete)

  const deployment = useMemo<DeploymentInfo>(
    () => ({
      ...DEMO_DEPLOYMENT,
      phase,
      progress: isComplete ? 100 : Math.min(99, Math.round((Math.max(activeIndex, 0) / total) * 100)),
      startedAt: startedAtRef.current,
      url: phase === "live" || phase === "verifying" || isComplete ? DEMO_DEPLOYMENT.url : undefined,
    }),
    [phase, activeIndex, total, isComplete],
  )

  const healthChecks = useMemo(
    () => deriveHealthChecks(activeIndex, isComplete),
    [activeIndex, isComplete],
  )

  const serverMetrics = useMemo(
    () => deriveServerMetrics(progress, isComplete, tick),
    [progress, isComplete, tick],
  )

  const activityEvents = useMemo<ActivityEvent[]>(() => {
    const events: ActivityEvent[] = []
    const limit = isComplete ? total : Math.max(activeIndex, 0)

    for (let i = 0; i < limit; i++) {
      const stage = stages[i]
      const isCurrent = i === activeIndex && !isComplete
      events.push({
        id: `evt-${stage.id}-${i}`,
        timestamp: formatClock(i - limit),
        title: stage.label,
        description: stage.description,
        status: isCurrent
          ? stageToAgentStatus(stage.id, false)
          : i < activeIndex || isComplete
            ? "success"
            : "thinking",
      })
    }

    return events.reverse()
  }, [stages, activeIndex, isComplete, total])

  const pause = useCallback(() => setPaused(true), [])
  const resume = useCallback(() => setPaused(false), [])
  const togglePause = useCallback(() => setPaused((p) => !p), [])
  const start = useCallback(() => {
    setPaused(false)
    setActiveIndex(0)
  }, [])
  const reset = useCallback(() => {
    startedAtRef.current = formatClock()
    setPaused(false)
    setActiveIndex(autoStart ? 0 : -1)
  }, [autoStart])

  return {
    stages: simulatedStages,
    activeIndex,
    currentStage,
    completedCount,
    total,
    progress,
    isComplete,
    paused,
    agentStatus,
    deployment,
    healthChecks,
    serverMetrics,
    activityEvents,
    environment: DEMO_ENVIRONMENT,
    start,
    reset,
    pause,
    resume,
    togglePause,
  }
}
