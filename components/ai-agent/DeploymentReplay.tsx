"use client"

import { motion } from "framer-motion"
import { History, RotateCcw, ScrollText, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { GlassPanel } from "./GlassPanel"

interface DeploymentReplayProps {
  className?: string
  onDeployAgain: () => void
  onRestart: () => void
  onViewLogs: () => void
}

const replayActions = [
  {
    id: "again",
    label: "Deploy Again",
    hint: "Clear state · full auto replay",
    icon: Sparkles,
    tone: "emerald" as const,
  },
  {
    id: "restart",
    label: "Restart Deployment",
    hint: "Reset to Connect · manual flow",
    icon: RotateCcw,
    tone: "cyan" as const,
  },
  {
    id: "logs",
    label: "View Logs",
    hint: "Jump to deployment terminal",
    icon: ScrollText,
    tone: "neutral" as const,
  },
] as const

export function DeploymentReplay({
  className,
  onDeployAgain,
  onRestart,
  onViewLogs,
}: DeploymentReplayProps) {
  return (
    <GlassPanel
      glow="emerald"
      intensity="strong"
      delay={0}
      className={className}
      contentClassName="relative overflow-hidden p-4 sm:p-5"
    >
      <motion.div
        className="pointer-events-none absolute -left-10 top-0 size-36 rounded-full bg-emerald-500/15 blur-3xl"
        animate={{ opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 3.2, repeat: Infinity }}
      />

      <div className="relative mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-400/85">
            Deployment complete
          </p>
          <h2 className="mt-1 flex items-center gap-2 text-sm font-semibold tracking-tight text-zinc-100">
            <History className="size-3.5 text-emerald-400" />
            Replay controls
          </h2>
        </div>
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-emerald-300"
        >
          Production live
        </motion.span>
      </div>

      <div className="relative grid gap-3 sm:grid-cols-3">
        {replayActions.map((action, index) => {
          const Icon = action.icon
          const onClick =
            action.id === "again"
              ? onDeployAgain
              : action.id === "restart"
                ? onRestart
                : onViewLogs

          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 22,
                delay: 0.05 + index * 0.06,
              }}
            >
              <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="button"
                  onClick={onClick}
                  className={cn(
                    "h-auto w-full flex-col items-start gap-2 rounded-2xl border px-4 py-4 text-left",
                    action.tone === "emerald" &&
                      "border-emerald-500/45 bg-emerald-500/15 text-emerald-50 hover:bg-emerald-500/25 hover:text-white",
                    action.tone === "cyan" &&
                      "border-cyan-500/35 bg-cyan-500/10 text-cyan-50 hover:bg-cyan-500/20 hover:text-white",
                    action.tone === "neutral" &&
                      "border-white/10 bg-white/[0.04] text-zinc-100 hover:bg-white/[0.08] hover:text-white",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-9 items-center justify-center rounded-xl border",
                      action.tone === "emerald" && "border-emerald-400/40 bg-emerald-500/20",
                      action.tone === "cyan" && "border-cyan-400/40 bg-cyan-500/20",
                      action.tone === "neutral" && "border-white/10 bg-white/[0.05]",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold tracking-tight">{action.label}</p>
                    <p className="mt-0.5 text-[11px] opacity-60">{action.hint}</p>
                  </div>
                </Button>
              </motion.div>
            </motion.div>
          )
        })}
      </div>
    </GlassPanel>
  )
}
