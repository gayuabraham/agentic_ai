"use client"

import { motion } from "framer-motion"
import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PipelineStepStatus } from "./types"

interface PipelineStepProps {
  className?: string
  label: string
  description?: string
  status: PipelineStepStatus
  duration?: string
  isLast?: boolean
  index?: number
}

const statusIcon: Record<PipelineStepStatus, React.ReactNode> = {
  pending: <Circle className="size-4 text-zinc-600" />,
  running: <Loader2 className="size-4 animate-spin text-cyan-400" />,
  completed: <CheckCircle2 className="size-4 text-emerald-400" />,
  failed: <XCircle className="size-4 text-red-400" />,
  skipped: <Circle className="size-4 text-zinc-600" />,
}

export function PipelineStep({
  className,
  label,
  description,
  status,
  duration,
  isLast = false,
  index = 0,
}: PipelineStepProps) {
  const isActive = status === "running"

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className={cn("relative flex gap-3", className)}
    >
      {!isLast ? (
        <motion.div
          className="absolute left-[7px] top-6 w-px bg-gradient-to-b from-white/10 to-transparent"
          initial={{ height: 0 }}
          animate={{ height: "calc(100% + 4px)" }}
          transition={{ delay: index * 0.08 + 0.2, duration: 0.4 }}
        />
      ) : null}

      <div className="relative z-10 mt-0.5 shrink-0">
        {isActive ? (
          <motion.div
            animate={{ boxShadow: ["0 0 0 0 rgba(34,211,238,0.5)", "0 0 0 10px rgba(34,211,238,0)", "0 0 0 0 rgba(34,211,238,0)"] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="rounded-full"
          >
            {statusIcon[status]}
          </motion.div>
        ) : (
          statusIcon[status]
        )}
      </div>

      <div className="min-w-0 flex-1 pb-5">
        <div className="flex items-center justify-between gap-2">
          <p
            className={cn(
              "text-sm font-medium transition-colors",
              status === "pending" ? "text-zinc-500" : "text-zinc-200",
              isActive && "text-cyan-300",
            )}
          >
            {label}
          </p>
          {duration ? (
            <span className="shrink-0 font-mono text-[10px] text-zinc-600">{duration}</span>
          ) : null}
        </div>
        {description ? (
          <p className="mt-0.5 text-xs text-zinc-500">{description}</p>
        ) : null}
      </div>
    </motion.div>
  )
}
