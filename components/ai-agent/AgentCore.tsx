"use client"

import { motion } from "framer-motion"
import { Bot } from "lucide-react"
import { cn } from "@/lib/utils"
import { GlassPanel } from "./GlassPanel"
import { AnimatedStatus } from "./AnimatedStatus"
import type { AgentStatus } from "./types"

interface AgentCoreProps {
  className?: string
  status?: AgentStatus
  label?: string
}

export function AgentCore({
  className,
  status = "fixing",
  label = "Autonomous DevOps Engineer",
}: AgentCoreProps) {
  return (
    <GlassPanel glow="violet" delay={0.1} className={className} contentClassName="p-6 sm:p-8">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-6 flex size-32 items-center justify-center sm:size-36">
          {[0, 1, 2].map((ring) => (
            <motion.div
              key={ring}
              className="absolute inset-0 rounded-full border border-violet-400/20"
              style={{ margin: ring * 14 }}
              animate={{ scale: [1, 1.06, 1], opacity: [0.35, 0.7, 0.35] }}
              transition={{ duration: 2.8 + ring * 0.4, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}

          <motion.div
            className="absolute inset-4 rounded-full bg-gradient-to-br from-violet-500/30 via-fuchsia-500/20 to-cyan-500/20 blur-xl"
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />

          <motion.div
            className="relative flex size-20 items-center justify-center rounded-2xl border border-violet-400/30 bg-violet-500/10 shadow-[0_0_40px_rgba(139,92,246,0.35)]"
            animate={{ boxShadow: ["0 0 30px rgba(139,92,246,0.25)", "0 0 50px rgba(139,92,246,0.45)", "0 0 30px rgba(139,92,246,0.25)"] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          >
            <Bot className="size-9 text-violet-300" />
          </motion.div>

          {[...Array(6)].map((_, i) => {
            const angle = (i / 6) * Math.PI * 2
            const radius = 56
            return (
              <motion.span
                key={i}
                className="absolute size-1.5 rounded-full bg-cyan-400/80"
                style={{
                  top: `calc(50% + ${Math.sin(angle) * radius}px)`,
                  left: `calc(50% + ${Math.cos(angle) * radius}px)`,
                  marginTop: -3,
                  marginLeft: -3,
                }}
                animate={{ opacity: [0.2, 1, 0.2], scale: [0.6, 1, 0.6] }}
                transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.18 }}
              />
            )
          })}
        </div>

        <motion.h2
          className="text-lg font-semibold tracking-tight text-zinc-100 sm:text-xl"
          animate={{ opacity: [0.85, 1, 0.85] }}
          transition={{ duration: 3, repeat: Infinity }}
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
