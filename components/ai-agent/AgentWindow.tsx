"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { ActivityTimeline } from "./ActivityTimeline"
import { AgentCore } from "./AgentCore"
import { AgentHeader } from "./AgentHeader"
import { AgentThinking } from "./AgentThinking"
import { AGENT_PANEL_CLASS } from "./constants"
import { CurrentStep } from "./CurrentStep"
import { DeploymentStatus } from "./DeploymentStatus"
import { HealthCheck } from "./HealthCheck"
import { PipelineProgress } from "./PipelineProgress"
import { RepositoryCard } from "./RepositoryCard"
import { ServerStatus } from "./ServerStatus"
import { TerminalOutput } from "./TerminalOutput"

interface AgentWindowProps {
  className?: string
}

export function AgentWindow({ className }: AgentWindowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={cn("flex h-full min-h-[900px] flex-col", AGENT_PANEL_CLASS, className)}
    >
      {/* Ambient gradient lighting */}
      <div className="pointer-events-none absolute -left-32 top-0 size-96 rounded-full bg-emerald-500/10 blur-[120px]" />
      <motion.div
        className="pointer-events-none absolute -right-32 top-1/4 size-96 rounded-full bg-violet-500/10 blur-[120px]"
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <div className="pointer-events-none absolute bottom-0 left-1/2 size-96 -translate-x-1/2 rounded-full bg-cyan-500/8 blur-[100px]" />

      <AgentHeader />

      {/* Main 3-column layout */}
      <motion.div
        className="relative flex flex-1 flex-col gap-4 overflow-hidden p-4 lg:flex-row lg:p-6"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      >
        {/* Left — Repository context */}
        <motion.aside
          variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0 } }}
          className="flex w-full shrink-0 flex-col lg:w-[300px] xl:w-[320px]"
        >
          <RepositoryCard />
        </motion.aside>

        {/* Center — AI Agent + Pipeline */}
        <motion.main
          variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
          className="flex min-h-0 min-w-0 flex-1 flex-col gap-4"
        >
          <AgentCore />
          <AgentThinking />
          <PipelineProgress className="flex-1" />
          <CurrentStep />
        </motion.main>

        {/* Right — Status & Health */}
        <motion.aside
          variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }}
          className="flex w-full shrink-0 flex-col gap-4 lg:w-[300px] xl:w-[320px]"
        >
          <DeploymentStatus />
          <HealthCheck />
          <ServerStatus className="flex-1" />
        </motion.aside>
      </motion.div>

      {/* Bottom — Terminal + Timeline */}
      <motion.div
        className="relative grid grid-cols-1 gap-4 border-t border-white/[0.06] p-4 lg:grid-cols-2 lg:p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <TerminalOutput className="min-h-[240px]" />
        <ActivityTimeline className="min-h-[240px]" />
      </motion.div>
    </motion.div>
  )
}
