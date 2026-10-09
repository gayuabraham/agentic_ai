"use client"

import { motion } from "framer-motion"
import { useMemo } from "react"
import { GlassPanel } from "./GlassPanel"
import { PipelineStep } from "./PipelineStep"
import { derivePipelineNodes } from "./pipelineNodes"
import type { SimulatedStage } from "./useDeploymentAgent"

interface PipelineProgressProps {
  className?: string
  title?: string
  stages?: SimulatedStage[]
  progress?: number
  completedCount?: number
  total?: number
}

export function PipelineProgress({
  className,
  title = "Deployment Pipeline",
  stages: externalStages,
  progress: externalProgress,
  completedCount: externalCompleted,
  total: externalTotal,
}: PipelineProgressProps) {
  const isControlled = externalStages !== undefined

  const stages = externalStages!
  const progress = externalProgress ?? 0
  const completedCount = externalCompleted ?? 0
  const total = externalTotal ?? stages.length
  const isDone = progress >= 100

  const nodes = useMemo(() => derivePipelineNodes(stages), [stages])
  const nodesDone = nodes.filter((n) => n.status === "completed").length
  const activeNode = nodes.find((n) => n.status === "running")

  return (
    <GlassPanel
      glow={isDone ? "emerald" : "lavender"}
      intensity="subtle"
      delay={0.16}
      className={className}
      contentClassName="relative flex flex-col p-4 sm:p-5"
    >
      <div className="relative mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--r24-agent-accent-soft)]">
            Pipeline
          </p>
          <h2 className="mt-1 text-[15px] font-semibold tracking-tight text-[var(--r24-agent-fg)]">
            {title}
          </h2>
          <p className="mt-1 text-[12px] text-[var(--r24-agent-muted)]">
            {isDone
              ? "All stages complete · production live"
              : `${nodesDone} of ${nodes.length} stages complete`}
          </p>
        </div>

        <div className="flex w-full items-center gap-3 sm:max-w-[220px]">
          <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-[var(--r24-agent-surface)] border border-[var(--r24-agent-surface-border)]">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-500 via-purple-400 to-emerald-400"
              animate={{ width: `${progress}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20, mass: 0.7 }}
            />
          </div>
          <span className="shrink-0 font-mono text-xs font-semibold text-[var(--r24-agent-fg)]">
            {progress}%
          </span>
        </div>
      </div>

      {/* Horizontal stage track */}
      <div className="mb-5 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-max items-center gap-1">
          {nodes.map((node, index) => {
            const isLast = index === nodes.length - 1
            const isCompleted = node.status === "completed"
            const isActive = node.status === "running"
            return (
              <div key={node.id} className="flex items-center">
                <div
                  className={
                    isCompleted
                      ? "flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1"
                      : isActive
                        ? "flex items-center gap-1.5 rounded-full border border-violet-500/35 bg-violet-500/12 px-2.5 py-1 shadow-[0_0_20px_var(--r24-agent-accent-glow)]"
                        : "flex items-center gap-1.5 rounded-full border border-[var(--r24-agent-surface-border)] bg-[var(--r24-agent-surface)] px-2.5 py-1"
                  }
                >
                  <span
                    className={
                      isCompleted
                        ? "size-1.5 rounded-full bg-emerald-500"
                        : isActive
                          ? "size-1.5 animate-pulse rounded-full bg-violet-500"
                          : "size-1.5 rounded-full bg-[var(--r24-agent-subtle)]"
                    }
                  />
                  <span
                    className={
                      isCompleted
                        ? "text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300"
                        : isActive
                          ? "text-[10px] font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-200"
                          : "text-[10px] font-medium uppercase tracking-wide text-[var(--r24-agent-muted)]"
                    }
                  >
                    {node.label}
                  </span>
                </div>
                {!isLast ? (
                  <div
                    className={
                      isCompleted
                        ? "mx-0.5 h-px w-4 bg-emerald-400/60"
                        : "mx-0.5 h-px w-4 bg-[var(--r24-agent-surface-border)]"
                    }
                  />
                ) : null}
              </div>
            )
          })}
        </div>
      </div>

      {/* Active stage highlight */}
      {activeNode ? (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-[var(--r24-agent-radius)] border border-violet-500/25 bg-violet-500/8 px-4 py-3 dark:bg-violet-500/10"
        >
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-violet-700 dark:text-violet-300">
            In progress
          </p>
          <p className="mt-1 text-sm font-semibold text-[var(--r24-agent-fg)]">{activeNode.label}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-[var(--r24-agent-muted)]">
            {activeNode.description}
          </p>
        </motion.div>
      ) : null}

      {/* Stage cards grid */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
        {nodes.map((node, index) => (
          <PipelineStep key={node.id} node={node} index={index} variant="card" />
        ))}
      </div>

      <span className="sr-only">
        Underlying steps {completedCount}/{total}
      </span>
    </GlassPanel>
  )
}
