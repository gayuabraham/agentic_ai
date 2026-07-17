"use client"

import { motion } from "framer-motion"
import { ExternalLink, Globe, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AnimatedStatus } from "./AnimatedStatus"
import { DEMO_DEPLOYMENT } from "./constants"
import { GlassPanel } from "./GlassPanel"
import type { DeploymentInfo } from "./types"

interface DeploymentStatusProps {
  className?: string
  deployment?: DeploymentInfo
}

const phaseLabel: Record<DeploymentInfo["phase"], string> = {
  queued: "Queued",
  building: "Building",
  deploying: "Deploying",
  verifying: "Verifying",
  live: "Production Live",
  failed: "Failed",
}

export function DeploymentStatus({
  className,
  deployment = DEMO_DEPLOYMENT,
}: DeploymentStatusProps) {
  const agentStatus =
    deployment.phase === "live"
      ? "success"
      : deployment.phase === "failed"
        ? "error"
        : deployment.phase === "verifying"
          ? "verifying"
          : "deploying"

  return (
    <GlassPanel glow="cyan" delay={0.15} className={className} contentClassName="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <motion.div
            className="flex size-10 items-center justify-center rounded-xl bg-cyan-500/10"
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <Rocket className="size-5 text-cyan-400" />
          </motion.div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-zinc-100">Deployment Status</h2>
            <p className="mt-0.5 font-mono text-[10px] text-zinc-500">
              {deployment.environment} · {deployment.id}
            </p>
          </div>
        </div>
        <AnimatedStatus status={agentStatus} />
      </div>

      <div className="mt-5 space-y-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-300"
        >
          {phaseLabel[deployment.phase]}
        </motion.div>

        <div>
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-zinc-500">Rollout progress</span>
            <span className="font-mono text-zinc-300">{deployment.progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400"
              initial={{ width: 0 }}
              animate={{ width: `${deployment.progress}%` }}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>

        {deployment.url ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-black/25 px-3 py-2.5"
          >
            <div className="flex min-w-0 items-center gap-2">
              <Globe className="size-4 shrink-0 text-zinc-500" />
              <span className="truncate font-mono text-xs text-zinc-300">{deployment.url}</span>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              className="shrink-0 text-zinc-400 hover:bg-white/[0.06] hover:text-zinc-100"
            >
              <ExternalLink className="size-4" />
            </Button>
          </motion.div>
        ) : null}

        <p className="font-mono text-[10px] text-zinc-600">Started {deployment.startedAt}</p>
      </div>
    </GlassPanel>
  )
}
