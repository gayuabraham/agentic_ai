"use client"

import { AnimatePresence, motion } from "framer-motion"
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

const phaseAccent: Record<DeploymentInfo["phase"], string> = {
  queued: "border-zinc-500/30 bg-zinc-500/10 text-zinc-300",
  building: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  deploying: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  verifying: "border-indigo-500/30 bg-indigo-500/10 text-indigo-300",
  live: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  failed: "border-red-500/30 bg-red-500/10 text-red-300",
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
          : deployment.phase === "building"
            ? "analyzing"
            : "deploying"

  const isLive = deployment.phase === "live"

  return (
    <GlassPanel
      glow={isLive ? "emerald" : "cyan"}
      intensity="normal"
      delay={0.12}
      className={className}
      contentClassName="p-4 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <motion.div
            className={cn(
              "flex size-10 items-center justify-center rounded-xl",
              isLive ? "bg-emerald-500/15" : "bg-cyan-500/10",
            )}
            animate={isLive ? { scale: [1, 1.06, 1] } : { y: [0, -3, 0], rotate: [0, -4, 4, 0] }}
            transition={{ duration: isLive ? 2.4 : 2.8, repeat: Infinity }}
          >
            <Rocket className={cn("size-5", isLive ? "text-emerald-400" : "text-cyan-400")} />
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
        <AnimatePresence mode="wait">
          <motion.div
            key={deployment.phase}
            initial={{ opacity: 0, scale: 0.92, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: -4 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className={cn(
              "inline-flex rounded-full border px-3 py-1 text-xs font-medium",
              phaseAccent[deployment.phase],
            )}
          >
            <motion.span
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.6, repeat: Infinity }}
            >
              {phaseLabel[deployment.phase]}
            </motion.span>
          </motion.div>
        </AnimatePresence>

        <div>
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-zinc-500">Rollout progress</span>
            <motion.span
              key={deployment.progress}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-mono text-zinc-300"
            >
              {deployment.progress}%
            </motion.span>
          </div>
          <div className="relative h-2 overflow-hidden rounded-full bg-white/[0.06]">
            <motion.div
              className={cn(
                "absolute inset-y-0 left-0 rounded-full",
                isLive
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                  : "bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400",
              )}
              animate={{ width: `${deployment.progress}%` }}
              transition={{ type: "spring", stiffness: 90, damping: 20 }}
            />
            {!isLive ? (
              <motion.div
                className="absolute inset-y-0 w-16 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                animate={{ x: ["-4rem", "20rem"] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
              />
            ) : null}
          </div>
        </div>

        <AnimatePresence>
          {deployment.url ? (
            <motion.div
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: 6 }}
              className="overflow-hidden"
            >
              <motion.div
                className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-2.5 backdrop-blur-md"
                animate={
                  isLive
                    ? {
                        boxShadow: [
                          "0 0 0 rgba(16,185,129,0)",
                          "0 0 20px rgba(16,185,129,0.25)",
                          "0 0 0 rgba(16,185,129,0)",
                        ],
                      }
                    : undefined
                }
                transition={{ duration: 2.4, repeat: Infinity }}
              >
                <div className="flex min-w-0 items-center gap-2">
                  <Globe className="size-4 shrink-0 text-emerald-400" />
                  <span className="truncate font-mono text-xs text-emerald-200/90">{deployment.url}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 text-emerald-400/80 hover:bg-emerald-500/10 hover:text-emerald-300"
                  asChild
                >
                  <a href={deployment.url} target="_blank" rel="noreferrer">
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <p className="font-mono text-[10px] text-zinc-600">Started {deployment.startedAt}</p>
      </div>
    </GlassPanel>
  )
}
