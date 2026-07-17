"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { AnimatedStatus } from "./AnimatedStatus"
import { DEMO_ACTIVITY } from "./constants"
import { GlassPanel } from "./GlassPanel"
import type { ActivityEvent } from "./types"

interface ActivityTimelineProps {
  className?: string
  events?: ActivityEvent[]
  title?: string
}

export function ActivityTimeline({
  className,
  events = DEMO_ACTIVITY,
  title = "Activity Timeline",
}: ActivityTimelineProps) {
  return (
    <GlassPanel
      glow="violet"
      delay={0.35}
      hoverLift={false}
      className={cn("h-full min-h-[220px]", className)}
      contentClassName="p-4 sm:p-5"
    >
      <motion.h2
        className="mb-4 text-sm font-semibold tracking-tight text-zinc-100"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {title}
      </motion.h2>

      <motion.div
        className="relative space-y-0"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      >
        {events.map((event, index) => (
          <motion.div
            key={event.id}
            variants={{
              hidden: { opacity: 0, x: 12 },
              visible: { opacity: 1, x: 0 },
            }}
            className="relative flex gap-3 pb-5 last:pb-0"
          >
            {index < events.length - 1 ? (
              <motion.div
                className="absolute left-[5px] top-5 w-px bg-gradient-to-b from-violet-500/40 to-transparent"
                initial={{ height: 0 }}
                animate={{ height: "calc(100% - 4px)" }}
                transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
              />
            ) : null}

            <motion.div
              className="relative z-10 mt-1.5 size-2.5 shrink-0 rounded-full border-2 border-violet-500/50 bg-violet-500/20"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: index * 0.15 }}
            />

            <motion.div
              className="min-w-0 flex-1 rounded-xl border border-white/[0.04] bg-black/20 px-3 py-2.5"
              whileHover={{ borderColor: "rgba(255,255,255,0.1)" }}
            >
              <motion.div
                className="flex flex-wrap items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.15 }}
              >
                <p className="text-sm font-medium text-zinc-200">{event.title}</p>
                <AnimatedStatus status={event.status} showLabel={false} />
              </motion.div>
              {event.description ? (
                <p className="mt-0.5 text-xs text-zinc-500">{event.description}</p>
              ) : null}
              <p className="mt-1 font-mono text-[10px] text-zinc-600">{event.timestamp}</p>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </GlassPanel>
  )
}
