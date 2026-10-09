"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Activity, CheckCircle2, XCircle } from "lucide-react"
import { AnimatedLoader } from "./AnimatedLoader"
import { DEMO_HEALTH_CHECKS } from "./constants"
import { GlassPanel } from "./GlassPanel"
import type { HealthCheckItem } from "./types"

interface HealthCheckProps {
  className?: string
  checks?: HealthCheckItem[]
  title?: string
}

function StatusIcon({ status }: { status: HealthCheckItem["status"] }) {
  if (status === "healthy") return <CheckCircle2 className="size-4 text-emerald-400" />
  if (status === "degraded") return <Activity className="size-4 text-amber-400" />
  if (status === "failing") return <XCircle className="size-4 text-red-400" />
  return <AnimatedLoader size="sm" />
}

export function HealthCheck({
  className,
  checks = DEMO_HEALTH_CHECKS,
  title = "Health Checks",
}: HealthCheckProps) {
  const healthyCount = checks.filter((c) => c.status === "healthy").length

  return (
    <GlassPanel glow="emerald" intensity="subtle" delay={0.2} className={className} contentClassName="p-4 sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-zinc-100">{title}</h2>
          <motion.p
            className="mt-0.5 text-xs text-zinc-500"
            animate={{ opacity: [0.65, 1, 0.65] }}
            transition={{ duration: 2.4, repeat: Infinity }}
          >
            {healthyCount}/{checks.length} endpoints passing
          </motion.p>
        </div>
        <motion.div
          className="h-1.5 w-16 overflow-hidden rounded-full bg-white/[0.06]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400"
            animate={{ width: `${(healthyCount / checks.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
          />
        </motion.div>
      </div>

      <div className="space-y-2">
        {checks.map((check, index) => {
          const isHealthy = check.status === "healthy"
          const isPending = check.status === "pending"

          return (
            <motion.div
              key={check.id}
              layout
              initial={{ opacity: 0, x: 12 }}
              animate={{
                opacity: 1,
                x: 0,
                borderColor: isHealthy
                  ? "rgba(16,185,129,0.28)"
                  : isPending
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(248,113,113,0.28)",
                backgroundColor: isHealthy ? "rgba(16,185,129,0.06)" : "rgba(0,0,0,0.22)",
              }}
              transition={{ delay: 0.15 + index * 0.06, layout: { type: "spring", stiffness: 280, damping: 26 } }}
              whileHover={{ x: 3 }}
              className="relative overflow-hidden rounded-xl border px-3 py-2.5 backdrop-blur-md"
            >
              {isHealthy ? (
                <motion.div
                  className="pointer-events-none absolute inset-y-0 left-0 w-0.5 bg-emerald-400"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                />
              ) : null}

              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-zinc-200">{check.label}</p>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={check.message ?? check.endpoint ?? check.status}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-0.5 truncate font-mono text-[10px] text-zinc-600"
                    >
                      {check.endpoint ?? check.message}
                    </motion.p>
                  </AnimatePresence>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <AnimatePresence mode="wait">
                    {check.latency ? (
                      <motion.span
                        key={check.latency}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="font-mono text-[10px] text-emerald-500/80"
                      >
                        {check.latency}
                      </motion.span>
                    ) : null}
                  </AnimatePresence>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={check.status}
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 18 }}
                    >
                      <StatusIcon status={check.status} />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </GlassPanel>
  )
}
