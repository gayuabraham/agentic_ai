"use client"

import { GitBranch, MoreHorizontal, Play, Settings, Square } from "lucide-react"
import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AnimatedStatus } from "./AnimatedStatus"
import { ThemeToggle } from "@/components/theme-toggle"
import type { AgentStatus } from "./types"

interface AgentHeaderProps {
  className?: string
  title?: string
  subtitle?: string
  status?: AgentStatus
  paused?: boolean
  onTogglePause?: () => void
  actions?: ReactNode
}

export function AgentHeader({
  className,
  title = "Rapid24.ai",
  subtitle = "Autonomous AI Deployment Agent",
  status = "fixing",
  paused = false,
  onTogglePause,
  actions,
}: AgentHeaderProps) {
  return (
    <header
      className={cn(
        "relative flex shrink-0 flex-col gap-4 border-b border-[var(--r24-agent-header-border)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7 sm:py-5",
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3.5">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-[var(--r24-agent-glass-border)] bg-gradient-to-br from-violet-200/70 via-white/50 to-purple-100/40 shadow-[0_8px_24px_var(--r24-agent-accent-glow)] backdrop-blur-xl dark:from-violet-500/25 dark:via-white/10 dark:to-purple-500/10">
          <span className="text-[13px] font-semibold tracking-tight text-[var(--r24-agent-fg)]">
            R24
          </span>
        </div>
        <div className="min-w-0 pt-0.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="truncate text-[15px] font-semibold tracking-tight text-[var(--r24-agent-fg)] sm:text-lg">
              {title}
            </h1>
            <AnimatedStatus status={paused ? "idle" : status} />
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-[12px] leading-none text-[var(--r24-agent-muted)]">
            <GitBranch className="size-3 opacity-70" aria-hidden />
            <span className="truncate">{subtitle}</span>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {actions}
        <ThemeToggle variant="agent" />
        {onTogglePause ? (
          <Button
            variant="outline"
            size="sm"
            onClick={onTogglePause}
            className="r24-agent-btn-outline h-8"
          >
            {paused ? (
              <>
                <Play className="size-3.5 fill-current" />
                Resume
              </>
            ) : (
              <>
                <Square className="size-3.5 fill-current" />
                Stop
              </>
            )}
          </Button>
        ) : null}
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="Settings"
          className="r24-agent-btn-outline"
        >
          <Settings className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          aria-label="More actions"
          className="r24-agent-btn-outline"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </div>
    </header>
  )
}
