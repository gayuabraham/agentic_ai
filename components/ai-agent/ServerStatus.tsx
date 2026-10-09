"use client"

import { motion } from "framer-motion"
import { Cpu, HardDrive, MemoryStick, Server } from "lucide-react"
import { cn } from "@/lib/utils"
import { DEMO_SERVER_METRICS } from "./constants"
import { GlassPanel } from "./GlassPanel"
import type { ServerMetric } from "./types"

interface ServerStatusProps {
  className?: string
  metrics?: ServerMetric[]
  region?: string
  online?: boolean
}

const iconMap = {
  cpu: Cpu,
  memory: MemoryStick,
  disk: HardDrive,
  instances: Server,
}

export function ServerStatus({
  className,
  metrics = DEMO_SERVER_METRICS,
  region = "us-east-1",
  online = true,
}: ServerStatusProps) {
  return (
    <GlassPanel
      glow="emerald"
      intensity="subtle"
      delay={0.28}
      className={className}
      contentClassName="flex flex-col p-4 sm:p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-zinc-100">Server Status</h2>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500">{region}</p>
        </div>
        <motion.span
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider",
            online
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              : "border-zinc-500/30 bg-zinc-500/10 text-zinc-400",
          )}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.span
            className={cn("size-1.5 rounded-full", online ? "bg-emerald-400" : "bg-zinc-500")}
            animate={online ? { scale: [1, 1.35, 1] } : undefined}
            transition={{ duration: 1.4, repeat: Infinity }}
          />
          {online ? "Online" : "Idle"}
        </motion.span>
      </div>

      <div className="space-y-3">
        {metrics.map((metric, index) => {
          const Icon = iconMap[metric.type]
          const hot = metric.value > 80

          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.07 }}
              whileHover={{ x: 2 }}
              className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-black/25 p-3 backdrop-blur-md"
            >
              <motion.div
                className="pointer-events-none absolute inset-0 bg-gradient-to-r from-emerald-500/[0.04] to-transparent"
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 3 + index * 0.4, repeat: Infinity }}
              />

              <div className="relative mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={cn("size-3.5", hot ? "text-amber-400" : "text-zinc-500")} />
                  <span className="text-xs text-zinc-300">{metric.label}</span>
                </div>
                <motion.span
                  key={metric.value}
                  initial={{ opacity: 0.4, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("font-mono text-xs", hot ? "text-amber-300" : "text-zinc-400")}
                >
                  {metric.value}%
                </motion.span>
              </div>

              <div className="relative h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  className={cn(
                    "absolute inset-y-0 left-0 rounded-full",
                    hot
                      ? "bg-gradient-to-r from-amber-500 to-orange-400"
                      : "bg-gradient-to-r from-emerald-500 to-cyan-400",
                  )}
                  animate={{ width: `${metric.value}%` }}
                  transition={{ type: "spring", stiffness: 100, damping: 18 }}
                />
                <motion.div
                  className="absolute inset-y-0 w-8 bg-gradient-to-r from-transparent via-white/25 to-transparent"
                  animate={{ x: ["-2rem", "14rem"] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "linear", delay: index * 0.3 }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    </GlassPanel>
  )
}
