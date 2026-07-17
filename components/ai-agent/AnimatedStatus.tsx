"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { AgentStatus } from "./types"

interface AnimatedStatusProps {
  status: AgentStatus
  className?: string
  showLabel?: boolean
}

const statusConfig: Record<AgentStatus, { color: string; label: string; pulse: boolean }> = {
  idle: { color: "bg-zinc-500", label: "Idle", pulse: false },
  thinking: { color: "bg-violet-400", label: "Thinking", pulse: true },
  analyzing: { color: "bg-blue-400", label: "Analyzing", pulse: true },
  fixing: { color: "bg-amber-400", label: "Fixing", pulse: true },
  deploying: { color: "bg-cyan-400", label: "Deploying", pulse: true },
  verifying: { color: "bg-indigo-400", label: "Verifying", pulse: true },
  success: { color: "bg-emerald-400", label: "Live", pulse: false },
  error: { color: "bg-red-400", label: "Failed", pulse: false },
}

export function AnimatedStatus({ status, className, showLabel = true }: AnimatedStatusProps) {
  const config = statusConfig[status]

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <span className="relative flex size-2">
        {config.pulse ? (
          <motion.span
            className={cn("absolute inline-flex size-full rounded-full opacity-60", config.color)}
            animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        ) : null}
        <span className={cn("relative inline-flex size-2 rounded-full", config.color)} />
      </span>
      {showLabel ? (
        <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400">
          {config.label}
        </span>
      ) : null}
    </div>
  )
}
