"use client"

import { motion } from "framer-motion"
import { Bot } from "lucide-react"
import { cn } from "@/lib/utils"
import { AnimatedStatus } from "./AnimatedStatus"
import { GlassPanel } from "./GlassPanel"
import type { AgentStatus } from "./types"

interface AgentCoreProps {
  className?: string
  status?: AgentStatus
  label?: string
}

const ORBIT_DOTS = Array.from({ length: 6 }, (_, i) => {
  const angle = (i / 6) * Math.PI * 2
  return {
    x: Math.round(Math.cos(angle) * 56),
    y: Math.round(Math.sin(angle) * 56),
  }
})

const statusGlow: Record<AgentStatus, { ring: string; core: string; orb: string; glow: "violet" | "cyan" | "emerald" | "amber" }> = {
  idle: {
    ring: "border-zinc-500/20",
    core: "border-zinc-400/20 bg-zinc-500/10",
    orb: "bg-zinc-400/70",
    glow: "violet",
  },
  thinking: {
    ring: "border-violet-400/25",
    core: "border-violet-400/30 bg-violet-500/10",
    orb: "bg-violet-400/80",
    glow: "violet",
  },
  analyzing: {
    ring: "border-blue-400/25",
    core: "border-blue-400/30 bg-blue-500/10",
    orb: "bg-blue-400/80",
    glow: "cyan",
  },
  fixing: {
    ring: "border-amber-400/25",
    core: "border-amber-400/30 bg-amber-500/10",
    orb: "bg-amber-400/80",
    glow: "amber",
  },
  deploying: {
    ring: "border-cyan-400/25",
    core: "border-cyan-400/30 bg-cyan-500/10",
    orb: "bg-cyan-400/80",
    glow: "cyan",
  },
  verifying: {
    ring: "border-indigo-400/25",
    core: "border-indigo-400/30 bg-indigo-500/10",
    orb: "bg-indigo-400/80",
    glow: "violet",
  },
  success: {
    ring: "border-emerald-400/30",
    core: "border-emerald-400/35 bg-emerald-500/10",
    orb: "bg-emerald-400/90",
    glow: "emerald",
  },
  error: {
    ring: "border-red-400/30",
    core: "border-red-400/30 bg-red-500/10",
    orb: "bg-red-400/80",
    glow: "amber",
  },
}

export function AgentCore({
  className,
  status = "fixing",
  label = "Autonomous DevOps Engineer",
}: AgentCoreProps) {
  const theme = statusGlow[status]
  const settled = status === "success" || status === "idle"

  return (
    <GlassPanel glow={theme.glow} intensity="strong" delay={0.08} className={className} contentClassName="p-6 sm:p-8">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-6 flex size-32 items-center justify-center sm:size-36">
          {[0, 1, 2].map((ring) => (
            <motion.div
              key={`${status}-ring-${ring}`}
              className={cn("absolute inset-0 rounded-full border", theme.ring)}
              style={{ margin: ring * 14 }}
              animate={
                settled
                  ? { scale: 1, opacity: 0.45 }
                  : { scale: [1, 1.07, 1], opacity: [0.3, 0.75, 0.3] }
              }
              transition={{
                duration: settled ? 0.6 : 2.4 + ring * 0.35,
                repeat: settled ? 0 : Infinity,
                ease: "easeInOut",
              }}
            />
          ))}

          <motion.div
            className="absolute inset-4 rounded-full bg-gradient-to-br from-white/10 via-transparent to-transparent blur-xl"
            animate={settled ? { scale: 1.05, opacity: 0.55 } : { scale: [1, 1.18, 1], opacity: [0.45, 0.9, 0.45] }}
            transition={{ duration: 3, repeat: settled ? 0 : Infinity, ease: "easeInOut" }}
          />

          <motion.div
            className={cn(
              "relative flex size-20 items-center justify-center rounded-2xl border shadow-[0_0_40px_rgba(139,92,246,0.3)]",
              theme.core,
            )}
            animate={
              settled
                ? { boxShadow: "0 0 36px rgba(16,185,129,0.35)" }
                : {
                    boxShadow: [
                      "0 0 24px rgba(139,92,246,0.2)",
                      "0 0 48px rgba(139,92,246,0.45)",
                      "0 0 24px rgba(139,92,246,0.2)",
                    ],
                  }
            }
            transition={{ duration: 2.4, repeat: settled ? 0 : Infinity }}
          >
            <Bot className={cn("size-9", settled ? "text-emerald-300" : "text-violet-200")} />
          </motion.div>

          {ORBIT_DOTS.map((dot, i) => (
            <motion.span
              key={i}
              className={cn("absolute left-1/2 top-1/2 size-1.5 rounded-full", theme.orb)}
              style={{ x: dot.x - 3, y: dot.y - 3 }}
              animate={
                settled
                  ? { opacity: 0.7, scale: 1 }
                  : { opacity: [0.2, 1, 0.2], scale: [0.55, 1.05, 0.55] }
              }
              transition={{ duration: 2, repeat: settled ? 0 : Infinity, delay: i * 0.16 }}
            />
          ))}
        </div>

        <motion.h2
          className="text-lg font-semibold tracking-tight text-zinc-50 sm:text-xl"
          animate={settled ? { opacity: 1 } : { opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 2.8, repeat: settled ? 0 : Infinity }}
        >
          Rapid24 AI Agent
        </motion.h2>
        <p className="mt-1 text-sm text-zinc-500">{label}</p>
        <div className="mt-4">
          <AnimatedStatus status={status} />
        </div>
      </div>
    </GlassPanel>
  )
}
