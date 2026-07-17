"use client"

import { motion } from "framer-motion"
import { Cpu, HardDrive, MemoryStick, Server } from "lucide-react"
import { cn } from "@/lib/utils"
import { GlassPanel } from "./GlassPanel"
import { DEMO_SERVER_METRICS } from "./constants"
import type { ServerMetric } from "./types"

interface ServerStatusProps {
  className?: string
  metrics?: ServerMetric[]
  region?: string
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
}: ServerStatusProps) {
  return (
    <GlassPanel glow="emerald" delay={0.35} className={className} contentClassName="p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-zinc-100">Server Status</h2>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-zinc-500">{region}</p>
        </div>
        <motion.span
          className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-emerald-400"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="size-1.5 rounded-full bg-emerald-400" />
          Online
        </motion.span>
      </div>

      <div className="space-y-3">
        {metrics.map((metric, index) => {
          const Icon = iconMap[metric.type]
          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.08 }}
              className="rounded-xl border border-white/[0.05] bg-black/25 p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="size-3.5 text-zinc-500" />
                  <span className="text-xs text-zinc-300">{metric.label}</span>
                </div>
                <span className="font-mono text-xs text-zinc-400">{metric.value}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <motion.div
                  className={cn(
                    "h-full rounded-full",
                    metric.value > 80
                      ? "bg-gradient-to-r from-amber-500 to-orange-400"
                      : "bg-gradient-to-r from-emerald-500 to-cyan-400",
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${metric.value}%` }}
                  transition={{ duration: 1, delay: 0.5 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    </GlassPanel>
  )
}
