"use client"

import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCountUp } from "./useCountUp"

export type MetricTone = "emerald" | "cyan" | "violet" | "amber" | "neutral"

export interface DevOpsMetric {
  id: string
  label: string
  /** Numeric value for count-up; omit when using `display` only */
  value?: number
  /** Static / formatted display (e.g. version string, env name) */
  display?: string
  unit?: string
  detail?: string
  tone: MetricTone
  icon: LucideIcon
  /** When true, treat value as a percentage 0–100 for the mini bar */
  showBar?: boolean
}

const toneStyles: Record<
  MetricTone,
  { border: string; glow: string; icon: string; bar: string; text: string }
> = {
  emerald: {
    border: "from-emerald-500/50 via-emerald-400/20 to-cyan-500/40",
    glow: "bg-emerald-500/15",
    icon: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
    bar: "from-emerald-500 to-cyan-400",
    text: "text-emerald-300",
  },
  cyan: {
    border: "from-cyan-500/50 via-sky-400/20 to-blue-500/40",
    glow: "bg-cyan-500/15",
    icon: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
    bar: "from-cyan-500 to-blue-400",
    text: "text-cyan-300",
  },
  violet: {
    border: "from-violet-500/50 via-fuchsia-400/20 to-violet-500/40",
    glow: "bg-violet-500/15",
    icon: "text-violet-300 border-violet-500/30 bg-violet-500/10",
    bar: "from-violet-500 to-fuchsia-400",
    text: "text-violet-300",
  },
  amber: {
    border: "from-amber-500/50 via-orange-400/20 to-amber-500/40",
    glow: "bg-amber-500/15",
    icon: "text-amber-400 border-amber-500/30 bg-amber-500/10",
    bar: "from-amber-500 to-orange-400",
    text: "text-amber-300",
  },
  neutral: {
    border: "from-white/25 via-zinc-400/15 to-white/20",
    glow: "bg-white/5",
    icon: "text-zinc-300 border-white/10 bg-white/[0.04]",
    bar: "from-zinc-400 to-zinc-500",
    text: "text-zinc-200",
  },
}

interface MetricCardProps {
  metric: DevOpsMetric
  index?: number
}

export function MetricCard({ metric, index = 0 }: MetricCardProps) {
  const tone = toneStyles[metric.tone]
  const Icon = metric.icon
  const numeric = typeof metric.value === "number"
  const counted = useCountUp(numeric ? metric.value! : 0, {
    duration: 1000 + index * 80,
    decimals:
      numeric && metric.unit === "min"
        ? 1
        : numeric && !Number.isInteger(metric.value!)
          ? 1
          : 0,
    enabled: numeric,
  })

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{
        type: "spring",
        stiffness: 280,
        damping: 24,
        delay: 0.04 * index,
      }}
      whileHover={{ y: -3, transition: { type: "spring", stiffness: 420, damping: 24 } }}
      className="group relative"
    >
      {/* Gradient border shell */}
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl p-px transition-[filter] duration-300",
          "bg-gradient-to-br group-hover:brightness-110",
          tone.border,
        )}
      >
        <motion.div
          className={cn("pointer-events-none absolute -inset-[40%] rounded-full bg-gradient-to-r opacity-40 blur-sm", tone.border)}
          animate={{ rotate: 360 }}
          transition={{ duration: 14 + index, repeat: Infinity, ease: "linear" }}
        />

        <div className="relative overflow-hidden rounded-[calc(var(--r24-agent-radius)-1px)] border border-[var(--r24-agent-glass-border)] bg-[var(--r24-agent-glass-bg)] p-4 shadow-[var(--r24-agent-glass-shadow)] backdrop-blur-[var(--r24-agent-blur)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/15" />
          <motion.div
            className={cn("pointer-events-none absolute -right-8 -top-8 size-24 rounded-full blur-2xl", tone.glow)}
            animate={{ opacity: [0.35, 0.7, 0.35], scale: [1, 1.1, 1] }}
            transition={{ duration: 3.2 + index * 0.2, repeat: Infinity, ease: "easeInOut" }}
          />

          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--r24-agent-muted)]">
                {metric.label}
              </p>
              <div className="mt-2.5 flex items-baseline gap-1.5">
                <motion.span
                  key={numeric ? String(metric.value) : metric.display}
                  className="truncate text-[1.65rem] font-semibold leading-none tracking-tight text-[var(--r24-agent-fg)]"
                >
                  {numeric ? counted : metric.display}
                </motion.span>
                {metric.unit ? (
                  <span className={cn("text-xs font-medium", tone.text)}>{metric.unit}</span>
                ) : null}
              </div>
              {metric.detail ? (
                <p className="mt-1 truncate font-mono text-[10px] text-[var(--r24-agent-muted)]">{metric.detail}</p>
              ) : null}
            </div>

            <motion.div
              className={cn(
                "flex size-9 shrink-0 items-center justify-center rounded-xl border",
                tone.icon,
              )}
              whileHover={{ rotate: 6, scale: 1.06 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
            >
              <Icon className="size-4" />
            </motion.div>
          </div>

          {metric.showBar && numeric ? (
            <div className="relative mt-3 h-1 overflow-hidden rounded-full bg-white/[0.06]">
              <motion.div
                className={cn("absolute inset-y-0 left-0 rounded-full bg-gradient-to-r", tone.bar)}
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(100, Math.max(0, metric.value!))}%` }}
                transition={{ type: "spring", stiffness: 90, damping: 18, delay: 0.1 * index }}
                style={{ boxShadow: "0 0 10px rgba(16,185,129,0.35)" }}
              />
            </div>
          ) : (
            <div className="mt-3 h-px w-full bg-gradient-to-r from-white/10 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          )}
        </div>
      </div>
    </motion.div>
  )
}
