"use client"

import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { GlassPanel } from "./GlassPanel"
import type { SimulatedStage } from "./useDeploymentAgent"

interface CurrentStepProps {
  className?: string
  currentStage: SimulatedStage
  index: number
  total: number
  isComplete?: boolean
}

export function CurrentStep({
  className,
  currentStage,
  index,
  total,
  isComplete = false,
}: CurrentStepProps) {
  const stepIndex = Math.min(Math.max(index + 1, 1), total)
  const pct = isComplete ? 100 : Math.round((stepIndex / total) * 100)

  return (
    <GlassPanel
      glow={isComplete ? "emerald" : "cyan"}
      intensity="normal"
      delay={0.2}
      className={className}
      contentClassName="p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p
            className={cn(
              "text-[10px] font-medium uppercase tracking-[0.2em]",
              isComplete ? "text-emerald-400/80" : "text-cyan-400/80",
            )}
          >
            {isComplete ? "Pipeline Complete" : `Current Step · ${stepIndex}/${total}`}
          </p>

          <AnimatePresence mode="wait">
            <motion.h3
              key={currentStage.id}
              initial={{ opacity: 0, y: 12, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -12, filter: "blur(8px)" }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="mt-2 truncate text-xl font-semibold tracking-tight text-zinc-50"
            >
              {currentStage.label}
            </motion.h3>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.p
              key={`${currentStage.id}-desc`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-1 truncate text-sm text-zinc-500"
            >
              {currentStage.description}
            </motion.p>
          </AnimatePresence>
        </div>

        <motion.div
          animate={isComplete ? { scale: [1, 1.08, 1] } : { rotate: 360 }}
          transition={
            isComplete
              ? { duration: 2.2, repeat: Infinity }
              : { duration: 2, repeat: Infinity, ease: "linear" }
          }
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-xl border",
            isComplete
              ? "border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_28px_rgba(16,185,129,0.35)]"
              : "border-cyan-500/30 bg-cyan-500/10 shadow-[0_0_24px_rgba(34,211,238,0.25)]",
          )}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={isComplete ? "done" : currentStage.status}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
            >
              {isComplete ? (
                <CheckCircle2 className="size-5 text-emerald-400" />
              ) : currentStage.status === "running" ? (
                <Loader2 className="size-5 text-cyan-400" />
              ) : (
                <ArrowRight className="size-5 text-cyan-400" />
              )}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full",
            isComplete
              ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
              : "bg-gradient-to-r from-cyan-500 to-emerald-400",
          )}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
        {!isComplete ? (
          <motion.div
            className="absolute inset-y-0 w-12 bg-gradient-to-r from-transparent via-white/35 to-transparent"
            animate={{ x: ["-3rem", "24rem"] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
          />
        ) : null}
      </div>
    </GlassPanel>
  )
}
