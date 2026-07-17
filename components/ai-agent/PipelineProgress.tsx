"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { DEMO_PIPELINE_STEPS } from "./constants"
import { GlassPanel } from "./GlassPanel"
import { PipelineStep } from "./PipelineStep"
import type { PipelineStepData } from "./types"

interface PipelineProgressProps {
  className?: string
  steps?: PipelineStepData[]
  progress?: number
  title?: string
}

export function PipelineProgress({
  className,
  steps = DEMO_PIPELINE_STEPS,
  progress = 52,
  title = "Pipeline Progress",
}: PipelineProgressProps) {
  const completed = steps.filter((s) => s.status === "completed").length

  return (
    <GlassPanel glow="cyan" delay={0.2} className={className} contentClassName="p-4 sm:p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-zinc-100">{title}</h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            {completed} of {steps.length} steps complete
          </p>
        </div>
        <div className="flex items-center gap-3 sm:min-w-[160px]">
          <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
          <motion.span
            key={progress}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="shrink-0 font-mono text-xs text-zinc-400"
          >
            {progress}%
          </motion.span>
        </div>
      </div>

      <div className="space-y-0">
        {steps.map((step, index) => (
          <PipelineStep
            key={step.id}
            label={step.label}
            description={step.description}
            status={step.status}
            duration={step.duration}
            isLast={index === steps.length - 1}
            index={index}
          />
        ))}
      </div>
    </GlassPanel>
  )
}
