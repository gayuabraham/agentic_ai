"use client"

import { motion } from "framer-motion"
import {
  Activity,
  BadgeCheck,
  Clock3,
  HeartPulse,
  MapPin,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Tag,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { MetricCard, type DevOpsMetric, type MetricTone } from "./MetricCard"
import type { DeploymentInfo, HealthCheckItem } from "./types"
import type { InteractivePhase, RepoConnectionStatus } from "./useDeploymentAgent"

interface DevOpsMetricsDashboardProps {
  className?: string
  interactivePhase: InteractivePhase
  repoConnectionStatus: RepoConnectionStatus
  deployment: DeploymentInfo
  healthChecks: HealthCheckItem[]
  progress: number
  isComplete: boolean
  advancing: boolean
  environmentName?: string
  region?: string
  releaseVersion?: string
}

function deriveTone(ok: boolean, warn = false): MetricTone {
  if (ok) return "emerald"
  if (warn) return "amber"
  return "neutral"
}

export function buildDevOpsMetrics({
  interactivePhase,
  repoConnectionStatus,
  deployment,
  healthChecks,
  progress,
  isComplete,
  advancing,
  environmentName = "production",
  region = "us-east-1",
  releaseVersion = "v2.4.1",
}: Omit<DevOpsMetricsDashboardProps, "className">): DevOpsMetric[] {
  const healthyCount = healthChecks.filter((h) => h.status === "healthy").length
  const healthPct =
    healthChecks.length === 0
      ? 0
      : Math.round((healthyCount / healthChecks.length) * 100)

  const connected = repoConnectionStatus === "connected"
  const deployMinutes =
    interactivePhase === "awaiting_connect"
      ? 0
      : isComplete
        ? 4.2
        : advancing
          ? Math.max(0.4, Number(((progress / 100) * 4.2).toFixed(1)))
          : Math.max(0.8, Number(((progress / 100) * 3.1).toFixed(1)))

  const aiConfidence =
    interactivePhase === "awaiting_connect"
      ? 12
      : isComplete
        ? 98
        : interactivePhase === "analyzing"
          ? 55 + Math.round(progress * 0.25)
          : interactivePhase === "deploying"
            ? 72 + Math.round(progress * 0.25)
            : interactivePhase === "awaiting_deploy"
              ? 86
              : connected
                ? 42
                : 12

  const rollbackReady =
    interactivePhase === "awaiting_connect"
      ? 0
      : isComplete
        ? 100
        : deployment.phase === "deploying" || deployment.phase === "verifying"
          ? 78
          : connected
            ? 35
            : 0

  const errorRecovery =
    interactivePhase === "awaiting_connect"
      ? 0
      : isComplete
        ? 100
        : Math.min(100, Math.round(progress * 0.9 + (connected ? 10 : 0)))

  const productionLabel = isComplete
    ? "Live"
    : deployment.phase === "failed"
      ? "Degraded"
      : advancing
        ? "Updating"
        : connected
          ? "Standby"
          : "Offline"

  return [
    {
      id: "health",
      label: "Deployment Health",
      value: healthPct,
      unit: "%",
      detail: `${healthyCount}/${healthChecks.length || 4} checks passing`,
      tone: deriveTone(healthPct >= 75, healthPct >= 40),
      icon: HeartPulse,
      showBar: true,
    },
    {
      id: "time",
      label: "Deployment Time",
      value: deployMinutes,
      unit: "min",
      detail: isComplete ? "Last successful rollout" : "Elapsed this session",
      tone: "cyan",
      icon: Clock3,
    },
    {
      id: "confidence",
      label: "AI Confidence",
      value: Math.min(99, aiConfidence),
      unit: "%",
      detail: advancing ? "Model scoring rollout risk" : "Idle confidence baseline",
      tone: "violet",
      icon: Sparkles,
      showBar: true,
    },
    {
      id: "rollback",
      label: "Rollback Ready",
      value: rollbackReady,
      unit: "%",
      detail: rollbackReady >= 80 ? "Previous revision pinned" : "Snapshotting revision",
      tone: deriveTone(rollbackReady >= 80, rollbackReady >= 40),
      icon: RotateCcw,
      showBar: true,
    },
    {
      id: "production",
      label: "Production Status",
      display: productionLabel,
      detail: deployment.phase.replace(/^\w/, (c) => c.toUpperCase()),
      tone: isComplete ? "emerald" : advancing ? "cyan" : "neutral",
      icon: Activity,
    },
    {
      id: "recovery",
      label: "Error Recovery",
      value: errorRecovery,
      unit: "%",
      detail: errorRecovery >= 90 ? "Auto-heal verified" : "Watching failure surface",
      tone: deriveTone(errorRecovery >= 80, errorRecovery >= 40),
      icon: ShieldCheck,
      showBar: true,
    },
    {
      id: "environment",
      label: "Current Environment",
      display: environmentName,
      detail: region,
      tone: "emerald",
      icon: MapPin,
    },
    {
      id: "version",
      label: "Release Version",
      display: releaseVersion,
      detail: isComplete ? "Promoted to production" : "Candidate build",
      tone: "cyan",
      icon: isComplete ? BadgeCheck : Tag,
    },
  ]
}

export function DevOpsMetricsDashboard(props: DevOpsMetricsDashboardProps) {
  const { className, ...rest } = props
  const metrics = buildDevOpsMetrics(rest)

  return (
    <section className={cn("relative", className)}>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--r24-agent-accent-soft)]">
            Operations
          </p>
          <h2 className="mt-1.5 text-[15px] font-semibold tracking-tight text-[var(--r24-agent-fg)]">
            DevOps Metrics
          </h2>
        </div>
        <motion.span
          className="font-mono text-[10px] uppercase tracking-wider text-[var(--r24-agent-muted)]"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2.4, repeat: Infinity }}
        >
          Live telemetry
        </motion.span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => (
          <MetricCard key={metric.id} metric={metric} index={index} />
        ))}
      </div>
    </section>
  )
}
