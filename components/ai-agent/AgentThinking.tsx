"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { GlassPanel } from "./GlassPanel"

interface AgentThinkingProps {
  className?: string
  message?: string
}

export function AgentThinking({
  className,
  message = "Resolving environment drift and validating production secrets...",
}: AgentThinkingProps) {
  return (
    <GlassPanel glow="violet" delay={0.15} className={className} contentClassName="px-4 py-3.5">
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-500/15"
        >
          <Sparkles className="size-4 text-violet-400" />
        </motion.div>

        <div className="min-w-0 flex-1">
          <motion.p
            className="text-[10px] font-medium uppercase tracking-[0.18em] text-violet-400"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Agent Thinking
          </motion.p>
          <motion.p
            key={message}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="truncate text-sm text-zinc-400"
          >
            {message}
          </motion.p>
        </div>

        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="size-1.5 rounded-full bg-violet-400"
              animate={{ opacity: [0.2, 1, 0.2], y: [0, -4, 0] }}
              transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.14 }}
            />
          ))}
        </div>
      </div>
    </GlassPanel>
  )
}
