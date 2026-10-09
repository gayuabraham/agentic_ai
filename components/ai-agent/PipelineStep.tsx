"use client"

import { motion } from "framer-motion"
import { Check, Circle, Loader2, X } from "lucide-react"
import { memo } from "react"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { cn } from "@/lib/utils"
import { statusLabel, type InteractivePipelineNode } from "./pipelineNodes"

interface PipelineStepProps {
  className?: string
  node: InteractivePipelineNode
  isLast?: boolean
  index?: number
  variant?: "card" | "vertical"
}

function NodeDetailPopover({ node }: { node: InteractivePipelineNode }) {
  const isCompleted = node.status === "completed"
  const isActive = node.status === "running"
  const isPending = node.status === "pending" || node.status === "skipped"

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--r24-agent-muted)]">
            Pipeline stage
          </p>
          <h3 className="mt-1 text-sm font-semibold tracking-tight text-[var(--r24-agent-fg)]">
            {node.label}
          </h3>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider",
            isCompleted && "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
            isActive && "border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300",
            isPending && "border-[var(--r24-agent-surface-border)] bg-[var(--r24-agent-surface)] text-[var(--r24-agent-muted)]",
            node.status === "failed" && "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-300",
          )}
        >
          {statusLabel(node.status)}
        </span>
      </div>

      <div className="space-y-3 border-t border-[var(--r24-agent-surface-border)] pt-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-[var(--r24-agent-muted)]">Description</p>
          <p className="mt-1 text-xs leading-relaxed text-[var(--r24-agent-fg)]">{node.description}</p>
        </div>

        <div className="rounded-xl border border-[var(--r24-agent-surface-border)] bg-[var(--r24-agent-surface)] p-3">
          <p className="text-[10px] uppercase tracking-wider text-[var(--r24-agent-accent-soft)]">AI insight</p>
          <p className="mt-1.5 text-xs leading-relaxed text-[var(--r24-agent-muted)]">{node.aiExplanation}</p>
        </div>
      </div>
    </div>
  )
}

function StatusIcon({ status }: { status: InteractivePipelineNode["status"] }) {
  if (status === "completed") {
    return <Check className="size-3.5 text-emerald-600 dark:text-emerald-300" strokeWidth={2.5} />
  }
  if (status === "running") {
    return <Loader2 className="size-3.5 animate-spin text-violet-600 dark:text-violet-300" />
  }
  if (status === "failed") {
    return <X className="size-3.5 text-red-600 dark:text-red-300" strokeWidth={2.5} />
  }
  return <Circle className="size-2.5 text-[var(--r24-agent-subtle)]" />
}

export const PipelineStep = memo(function PipelineStep({
  className,
  node,
  index = 0,
  variant = "card",
}: PipelineStepProps) {
  const { status, label } = node
  const isCompleted = status === "completed"
  const isActive = status === "running"
  const isPending = status === "pending" || status === "skipped"
  const isFailed = status === "failed"

  if (variant === "vertical") {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}
    >
      <HoverCard openDelay={120} closeDelay={80}>
        <HoverCardTrigger asChild>
          <button
            type="button"
            className={cn(
              "group flex w-full flex-col rounded-[var(--r24-agent-radius)] border p-3.5 text-left transition-all duration-200",
              "outline-none focus-visible:ring-2 focus-visible:ring-[var(--r24-agent-accent-soft)]/40",
              isCompleted &&
                "border-emerald-500/25 bg-emerald-500/8 hover:border-emerald-500/35 dark:bg-emerald-500/10",
              isActive &&
                "border-violet-500/30 bg-violet-500/10 shadow-[0_8px_24px_var(--r24-agent-accent-glow)] hover:border-violet-500/40 dark:bg-violet-500/12",
              isFailed && "border-red-500/25 bg-red-500/8",
              isPending &&
                "border-[var(--r24-agent-surface-border)] bg-[var(--r24-agent-surface)] hover:border-[var(--r24-agent-accent-soft)]/25 hover:bg-[var(--r24-agent-glass-bg)]",
              className,
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-xl border",
                  isCompleted && "border-emerald-500/25 bg-emerald-500/12",
                  isActive && "border-violet-500/30 bg-violet-500/15",
                  isFailed && "border-red-500/25 bg-red-500/10",
                  isPending && "border-[var(--r24-agent-surface-border)] bg-[var(--r24-agent-glass-bg)]",
                )}
              >
                <StatusIcon status={status} />
              </div>
              {node.executionTime ? (
                <span className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400">
                  {node.executionTime}
                </span>
              ) : isActive ? (
                <span className="rounded-full bg-violet-500/15 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-violet-700 dark:text-violet-300">
                  live
                </span>
              ) : (
                <span className="rounded-full border border-[var(--r24-agent-surface-border)] bg-[var(--r24-agent-glass-bg)] px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[var(--r24-agent-muted)]">
                  {statusLabel(status)}
                </span>
              )}
            </div>

            <p className="mt-3 text-sm font-semibold tracking-tight text-[var(--r24-agent-fg)]">{label}</p>
            <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-[var(--r24-agent-muted)]">
              {isPending ? node.description : node.description}
            </p>

            <div className="mt-3 h-1 overflow-hidden rounded-full bg-[var(--r24-agent-surface)]">
              <motion.div
                className={cn(
                  "h-full rounded-full",
                  isCompleted && "bg-gradient-to-r from-emerald-500 to-emerald-400",
                  isActive && "bg-gradient-to-r from-violet-500 to-purple-400",
                  isFailed && "bg-red-500",
                )}
                initial={false}
                animate={{ width: isCompleted ? "100%" : isActive ? "72%" : "0%" }}
                transition={
                  isActive
                    ? { duration: Math.max(0.8, node.durationMs / 1000), ease: "linear" }
                    : { type: "spring", stiffness: 190, damping: 24 }
                }
              />
            </div>
          </button>
        </HoverCardTrigger>

        <HoverCardContent
          side="top"
          align="center"
          sideOffset={10}
          collisionPadding={16}
          className={cn(
            "z-[120] w-[300px] border-[var(--r24-agent-glass-border)] bg-[var(--r24-agent-glass-bg)] p-4",
            "shadow-[var(--r24-agent-shadow)] backdrop-blur-2xl",
          )}
        >
          <NodeDetailPopover node={node} />
        </HoverCardContent>
      </HoverCard>
    </motion.div>
  )
})
