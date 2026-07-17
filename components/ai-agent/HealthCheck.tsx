"use client"

import { motion } from "framer-motion"
import { Activity, CheckCircle2, Clock, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { DEMO_HEALTH_CHECKS } from "./constants"
import { GlassPanel } from "./GlassPanel"
import type { HealthCheckItem } from "./types"

interface HealthCheckProps {
  className?: string
  checks?: HealthCheckItem[]
  title?: string
}

const statusConfig: Record<
  HealthCheckItem["status"],
  { icon: React.ReactNode; label: string; className: string }
> = {
  healthy: {
    icon: <CheckCircle2 className="size-4" />,
    label: "Healthy",
    className: "text-emerald-400",
  },
  degraded: {
    icon: <Activity className="size-4" />,
    label: "Degraded",
    className: "text-amber-400",
  },
  failing: {
    icon: <XCircle className="size-4" />,
    label: "Failing",
    className: "text-red-400",
  },
  pending: {
    icon: <Clock className="size-4" />,
    label: "Pending",
    className: "text-zinc-500",
  },
}

export function HealthCheck({
  className,
  checks = DEMO_HEALTH_CHECKS,
  title = "Health Checks",
}: HealthCheckProps) {
  const healthyCount = checks.filter((c) => c.status === "healthy").length

  return (
    <GlassPanel glow="emerald" delay={0.25} className={className} contentClassName="p-4 sm:p-5">
      <div className="mb-4">
        <h2 className="text-sm font-semibold tracking-tight text-zinc-100">{title}</h2>
        <motion.p
          className="mt-0.5 text-xs text-zinc-500"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          {healthyCount}/{checks.length} endpoints passing
        </motion.p>
      </div>

      <div className="space-y-2">
        {checks.map((check, index) => {
          const config = statusConfig[check.status]
          return (
            <motion.div
              key={check.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.07 }}
              whileHover={{ x: 2 }}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.05] bg-black/25 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="text-sm text-zinc-200">{check.label}</p>
                {check.endpoint ? (
                  <p className="mt-0.5 truncate font-mono text-[10px] text-zinc-600">{check.endpoint}</p>
                ) : check.message ? (
                  <p className="mt-0.5 text-[10px] text-zinc-600">{check.message}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {check.latency ? (
                  <span className="font-mono text-[10px] text-zinc-600">{check.latency}</span>
                ) : null}
                <div className={cn("flex items-center gap-1.5 text-xs", config.className)}>
                  {config.icon}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </GlassPanel>
  )
}
