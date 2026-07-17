"use client"

import { motion } from "framer-motion"
import { ArrowRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { GlassPanel } from "./GlassPanel"
import { DEMO_PIPELINE_STEPS } from "./constants"
import type { PipelineStepData } from "./types"

interface CurrentStepProps {
  className?: string
  steps?: PipelineStepData[]
}

export function CurrentStep({ className, steps = DEMO_PIPELINE_STEPS }: CurrentStepProps) {
  const current =
    steps.find((s) => s.status === "running") ??
    steps.find((s) => s.status === "pending") ??
    steps[steps.length - 1]

  const stepIndex = steps.findIndex((s) => s.id === current.id) + 1

  return (
    <GlassPanel glow="cyan" delay={0.25} className={className} contentClassName="p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-cyan-400/80">
            Current Step · {stepIndex}/{steps.length}
          </p>
          <motion.h3
            key={current.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            className="mt-2 text-xl font-semibold tracking-tight text-zinc-100"
          >
            {current.label}
          </motion.h3>
          {current.description ? (
            <motion.p
              key={`${current.id}-desc`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="mt-1 text-sm text-zinc-500"
            >
              {current.description}
            </motion.p>
          ) : null}
        </div>

        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className={cn(
            "flex size-12 shrink-0 items-center justify-center rounded-xl",
            "border border-cyan-500/30 bg-cyan-500/10 shadow-[0_0_24px_rgba(34,211,238,0.2)]",
          )}
        >
          {current.status === "running" ? (
            <Loader2 className="size-5 text-cyan-400" />
          ) : (
            <ArrowRight className="size-5 text-cyan-400" />
          )}
        </motion.div>
      </div>

      <motion.div
        className="mt-4 h-1 overflow-hidden rounded-full bg-white/[0.06]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400"
          initial={{ width: "0%" }}
          animate={{ width: current.status === "completed" ? "100%" : "62%" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </motion.div>
    </GlassPanel>
  )
}
