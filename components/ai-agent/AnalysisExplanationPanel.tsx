"use client"

import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, Lightbulb, ListChecks } from "lucide-react"
import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { cn } from "@/lib/utils"
import type { RepositoryAnalysis } from "@/lib/github/types"
import { GlassPanel } from "./GlassPanel"

interface AnalysisExplanationPanelProps {
  className?: string
  analysis: RepositoryAnalysis | null
  loading?: boolean
  error?: string | null
}

export function AnalysisExplanationPanel({
  className,
  analysis,
  loading,
  error,
}: AnalysisExplanationPanelProps) {
  const [open, setOpen] = useState(true)

  if (!analysis && !loading && !error) return null

  return (
    <GlassPanel
      glow="cyan"
      intensity="subtle"
      delay={0.08}
      className={className}
      contentClassName="overflow-hidden"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-white/[0.03]"
      >
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-cyan-400/80">
            AI Explanation
          </p>
          <p className="mt-0.5 truncate text-sm font-semibold tracking-tight text-zinc-100">
            {analysis
              ? `Why is Deployment Score ${analysis.readiness.overall}%?`
              : error
                ? "Analysis unavailable"
                : "Analyzing repository…"}
          </p>
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-zinc-400"
        >
          <ChevronDown className="size-4" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="border-t border-white/[0.06]"
          >
            {loading && !analysis ? (
              <div className="space-y-2 px-4 py-5">
                <div className="h-3 w-3/4 animate-pulse rounded bg-white/10" />
                <div className="h-3 w-full animate-pulse rounded bg-white/[0.06]" />
                <div className="h-3 w-5/6 animate-pulse rounded bg-white/[0.06]" />
              </div>
            ) : error && !analysis ? (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-amber-200/90">{error}</p>
                <p className="mt-2 text-xs text-zinc-500">
                  Re-select the repository or refresh to retry analysis.
                </p>
              </div>
            ) : analysis ? (
              <div className="grid gap-4 px-4 py-4 lg:grid-cols-[1fr_1.2fr]">
                <div className="space-y-3">
                  <SectionTitle icon={ListChecks} label="Findings" />
                  <ul className="space-y-1.5">
                    {analysis.findings.map((f) => (
                      <li
                        key={f.id}
                        className={cn(
                          "rounded-lg border px-2.5 py-2 text-xs",
                          f.severity === "success" &&
                            "border-emerald-500/20 bg-emerald-500/5 text-emerald-100/90",
                          f.severity === "warning" &&
                            "border-amber-500/20 bg-amber-500/5 text-amber-100/90",
                          f.severity === "critical" &&
                            "border-rose-500/20 bg-rose-500/5 text-rose-100/90",
                          f.severity === "info" &&
                            "border-white/10 bg-white/[0.03] text-zinc-300",
                        )}
                      >
                        <span className="mr-1.5 opacity-70">
                          {f.severity === "success"
                            ? "✓"
                            : f.severity === "warning" || f.severity === "critical"
                              ? "⚠"
                              : "•"}
                        </span>
                        {f.title}
                      </li>
                    ))}
                  </ul>

                  <SectionTitle icon={Lightbulb} label="Recommendations" />
                  <ul className="space-y-1.5">
                    {analysis.recommendations.slice(0, 6).map((r) => (
                      <li
                        key={r.id}
                        className="rounded-lg border border-white/[0.07] bg-white/[0.02] px-2.5 py-2 text-xs text-zinc-300"
                      >
                        <span className="font-medium text-zinc-100">{r.title}</span>
                        <span className="mt-0.5 block text-[11px] text-zinc-500">
                          {r.detail}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-white/[0.06] bg-black/25 px-3.5 py-3">
                  <div
                    className={cn(
                      "prose prose-invert prose-sm max-w-none",
                      "prose-headings:mb-2 prose-headings:mt-4 prose-headings:text-zinc-100",
                      "prose-p:my-2 prose-p:leading-relaxed prose-p:text-zinc-400",
                      "prose-li:text-zinc-400 prose-strong:text-zinc-200",
                      "prose-table:text-xs",
                    )}
                  >
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {analysis.explanationMarkdown}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ) : null}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </GlassPanel>
  )
}

function SectionTitle({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  label: string
}) {
  return (
    <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-500">
      <Icon className="size-3" />
      {label}
    </p>
  )
}
