"use client"

import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { AnimatedStatus } from "./AnimatedStatus"
import { GlassPanel } from "./GlassPanel"
import type { ActivityEvent } from "./types"

interface ActivityTimelineProps {
  className?: string
  events?: ActivityEvent[]
  title?: string
}

export function ActivityTimeline({
  className,
  events = [],
  title = "Activity Timeline",
}: ActivityTimelineProps) {
  return (
    <GlassPanel
      glow="violet"
      intensity="subtle"
      delay={0.3}
      hoverLift={false}
      className={cn(className)}
      contentClassName="flex flex-col p-4 sm:p-5"
    >
      <div className="mb-4 flex items-center justify-between">
        <motion.h2
          className="text-sm font-semibold tracking-tight text-zinc-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {title}
        </motion.h2>
        <motion.span
          className="font-mono text-[10px] uppercase tracking-wider text-violet-400/70"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {events.length} events
        </motion.span>
      </div>

      <div className="relative">
        {events.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="py-8 text-center text-xs text-zinc-600"
          >
            Waiting for agent activity…
          </motion.p>
        ) : (
          <div className="space-y-0">
            <AnimatePresence initial={false}>
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  layout
                  initial={{ opacity: 0, x: 18, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: "auto" }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ type: "spring", stiffness: 280, damping: 26 }}
                  className="relative flex gap-3 pb-4 last:pb-0"
                >
                  {index < events.length - 1 ? (
                    <motion.div
                      className="absolute left-[5px] top-5 w-px bg-gradient-to-b from-violet-500/50 via-violet-500/20 to-transparent"
                      initial={{ height: 0 }}
                      animate={{ height: "calc(100% - 8px)" }}
                      transition={{ duration: 0.45 }}
                    />
                  ) : null}

                  <motion.div
                    className={cn(
                      "relative z-10 mt-1.5 size-2.5 shrink-0 rounded-full border-2",
                      index === 0
                        ? "border-violet-400 bg-violet-400/40 shadow-[0_0_12px_rgba(167,139,250,0.55)]"
                        : "border-violet-500/40 bg-violet-500/15",
                    )}
                    animate={index === 0 ? { scale: [1, 1.35, 1] } : { scale: 1 }}
                    transition={{ duration: 1.6, repeat: Infinity }}
                  />

                  <motion.div
                    className={cn(
                      "min-w-0 flex-1 rounded-xl border px-3 py-2.5 backdrop-blur-md",
                      index === 0
                        ? "border-violet-500/25 bg-violet-500/[0.08]"
                        : "border-white/[0.05] bg-black/25",
                    )}
                    whileHover={{ borderColor: "rgba(167,139,250,0.35)", x: 2 }}
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-zinc-200">{event.title}</p>
                      <AnimatedStatus status={event.status} showLabel={false} />
                    </div>
                    {event.description ? (
                      <p className="mt-0.5 text-xs text-zinc-500">{event.description}</p>
                    ) : null}
                    <p className="mt-1 font-mono text-[10px] text-zinc-600">{event.timestamp}</p>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </GlassPanel>
  )
}
