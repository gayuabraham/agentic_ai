"use client"

import { AnimatePresence, motion } from "framer-motion"
import {
  Activity,
  Box,
  CheckCircle2,
  GitCommitHorizontal,
  HardDrive,
  Package,
  Shield,
  Sparkles,
  Workflow,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { AnalysisStatusLevel, RepositoryAnalysis } from "@/lib/github/types"
import { GlassPanel } from "./GlassPanel"

interface RepositoryAnalysisCardProps {
  className?: string
  analysis: RepositoryAnalysis | null
  loading?: boolean
  error?: string | null
}

function statusTone(level: AnalysisStatusLevel) {
  switch (level) {
    case "excellent":
      return "text-emerald-300 border-emerald-500/30 bg-emerald-500/10"
    case "good":
      return "text-cyan-300 border-cyan-500/30 bg-cyan-500/10"
    case "fair":
      return "text-amber-300 border-amber-500/30 bg-amber-500/10"
    case "missing":
      return "text-rose-300 border-rose-500/30 bg-rose-500/10"
    default:
      return "text-zinc-400 border-white/10 bg-white/[0.04]"
  }
}

function formatSize(kb: number | null) {
  if (kb == null) return "—"
  if (kb < 1024) return `${kb} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

function Skeleton() {
  return (
    <GlassPanel glow="violet" intensity="subtle" contentClassName="space-y-4 p-4">
      <div className="h-3 w-40 animate-pulse rounded bg-white/10" />
      <div className="h-16 animate-pulse rounded-xl bg-white/[0.06]" />
      <div className="grid grid-cols-2 gap-2">
        <div className="h-14 animate-pulse rounded-xl bg-white/[0.05]" />
        <div className="h-14 animate-pulse rounded-xl bg-white/[0.05]" />
        <div className="h-14 animate-pulse rounded-xl bg-white/[0.05]" />
        <div className="h-14 animate-pulse rounded-xl bg-white/[0.05]" />
      </div>
    </GlassPanel>
  )
}

function StatChip({
  icon: Icon,
  label,
  value,
  level,
  delay = 0,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  label: string
  value: string
  level?: AnalysisStatusLevel
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2 }}
      className={cn(
        "rounded-xl border px-3 py-2.5 backdrop-blur-md",
        level ? statusTone(level) : "border-white/[0.07] bg-white/[0.03] text-zinc-300",
      )}
    >
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] opacity-80">
        <Icon className="size-3" />
        {label}
      </div>
      <p className="mt-1 truncate text-xs font-semibold capitalize tracking-tight">
        {value}
      </p>
    </motion.div>
  )
}

export function RepositoryAnalysisCard({
  className,
  analysis,
  loading,
  error,
}: RepositoryAnalysisCardProps) {
  if (loading && !analysis) return <Skeleton />

  if (error && !analysis) {
    return (
      <GlassPanel
        glow="amber"
        intensity="subtle"
        className={className}
        contentClassName="p-4"
      >
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-amber-400/80">
          Repository Analysis
        </p>
        <p className="mt-2 text-sm text-zinc-300">Could not analyze repository</p>
        <p className="mt-1 font-mono text-[11px] text-zinc-500">{error}</p>
      </GlassPanel>
    )
  }

  if (!analysis) {
    return (
      <GlassPanel
        glow="neutral"
        intensity="subtle"
        className={className}
        contentClassName="p-4"
      >
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500">
          Repository Analysis
        </p>
        <p className="mt-3 text-sm text-zinc-400">
          Select a GitHub repository to generate a deployment readiness report.
        </p>
      </GlassPanel>
    )
  }

  const score = analysis.readiness.overall

  return (
    <GlassPanel
      glow="violet"
      intensity="normal"
      hoverLift
      className={className}
      contentClassName="space-y-4 p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-violet-300/80">
            <Sparkles className="size-3" />
            Repository Analysis
          </p>
          <p className="mt-1 text-sm font-semibold tracking-tight text-zinc-50">
            {analysis.framework?.name ?? analysis.language ?? "Unknown stack"}
            {analysis.framework?.version ? (
              <span className="ml-1.5 font-mono text-xs text-zinc-400">
                {analysis.framework.version}
              </span>
            ) : null}
          </p>
        </div>
        <motion.div
          className="relative flex size-[72px] shrink-0 items-center justify-center"
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <svg className="absolute inset-0 size-full -rotate-90" viewBox="0 0 72 72">
            <circle
              cx="36"
              cy="36"
              r="30"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="5"
            />
            <motion.circle
              cx="36"
              cy="36"
              r="30"
              fill="none"
              stroke="url(#r24-score)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 30}
              initial={{ strokeDashoffset: 2 * Math.PI * 30 }}
              animate={{
                strokeDashoffset: 2 * Math.PI * 30 * (1 - score / 100),
              }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            />
            <defs>
              <linearGradient id="r24-score" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
          </svg>
          <div className="text-center">
            <p className="text-lg font-semibold tabular-nums text-zinc-50">{score}%</p>
            <p className="text-[9px] uppercase tracking-wider text-zinc-500">Ready</p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <StatChip
          icon={Activity}
          label="Health"
          value={analysis.readiness.health}
          level={analysis.readiness.health}
          delay={0.05}
        />
        <StatChip
          icon={Workflow}
          label="CI/CD"
          value={analysis.readiness.cicd}
          level={analysis.readiness.cicd}
          delay={0.08}
        />
        <StatChip
          icon={Box}
          label="Docker"
          value={analysis.readiness.docker}
          level={analysis.readiness.docker}
          delay={0.11}
        />
        <StatChip
          icon={Shield}
          label="Security"
          value={analysis.readiness.security}
          level={analysis.readiness.security}
          delay={0.14}
        />
        <StatChip
          icon={CheckCircle2}
          label="Environment"
          value={analysis.readiness.environment}
          level={analysis.readiness.environment}
          delay={0.17}
        />
        <StatChip
          icon={Package}
          label="Package mgr"
          value={analysis.package.packageManager}
          delay={0.2}
        />
      </div>

      <div className="space-y-2 rounded-xl border border-white/[0.06] bg-black/20 px-3 py-3">
        <MetaRow
          icon={GitCommitHorizontal}
          label="Latest commit"
          value={
            analysis.latestCommitSha
              ? `${analysis.latestCommitSha.slice(0, 7)} — ${analysis.latestCommitMessage ?? ""}`
              : "—"
          }
        />
        <MetaRow
          icon={HardDrive}
          label="Repository size"
          value={formatSize(analysis.sizeKb)}
        />
        <MetaRow
          icon={Package}
          label="Node"
          value={analysis.package.nodeVersion ?? "not specified"}
        />
      </div>

      <AnimatePresence>
        {loading ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="font-mono text-[10px] text-violet-400/70"
          >
            Refreshing analysis…
          </motion.p>
        ) : null}
      </AnimatePresence>
    </GlassPanel>
  )
}

function MetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="mt-0.5 size-3 shrink-0 text-zinc-500" />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-500">{label}</p>
        <p className="truncate font-mono text-[11px] text-zinc-300">{value}</p>
      </div>
    </div>
  )
}
