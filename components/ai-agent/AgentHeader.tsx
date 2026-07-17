"use client"

import { motion } from "framer-motion"
import { GitBranch, MoreHorizontal, Settings, Square } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AnimatedStatus } from "./AnimatedStatus"
import type { AgentStatus } from "./types"

interface AgentHeaderProps {
  className?: string
  title?: string
  subtitle?: string
  status?: AgentStatus
}

export function AgentHeader({
  className,
  title = "Rapid24.ai",
  subtitle = "Autonomous AI Deployment Agent",
  status = "fixing",
}: AgentHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative flex flex-col gap-4 border-b border-white/[0.06] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent" />

      <div className="flex min-w-0 items-start gap-3">
        <motion.div
          className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-gradient-to-br from-emerald-500/20 to-cyan-500/10"
          animate={{ rotate: [0, 2, -2, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="text-sm font-bold tracking-tight text-emerald-300">R24</span>
        </motion.div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-base font-semibold tracking-tight text-zinc-100 sm:text-lg">
              {title}
            </h1>
            <AnimatedStatus status={status} />
          </div>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-zinc-500">
            <GitBranch className="size-3" />
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06] hover:text-zinc-100"
        >
          <Square className="size-3.5 fill-current" />
          Stop Agent
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          className="border-white/10 bg-white/[0.03] text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100"
        >
          <Settings className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          className="border-white/10 bg-white/[0.03] text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </div>
    </motion.header>
  )
}
