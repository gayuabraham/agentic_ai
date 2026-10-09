"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Cloud, GitBranch, GitCommitHorizontal, Github, MapPin, Server } from "lucide-react"
import { cn } from "@/lib/utils"
import { DEMO_ENVIRONMENT, DEMO_REPOSITORY } from "./constants"
import { GlassPanel } from "./GlassPanel"
import type { DeploymentEnvironment, RepositoryInfo } from "./types"

interface RepositoryCardProps {
  className?: string
  repository?: RepositoryInfo
  environment?: DeploymentEnvironment
  /** Highlight which context is currently being inspected by the agent */
  activeContext?: "repo" | "branch" | "commit" | "environment" | null
  connectionStatus?: "disconnected" | "connecting" | "connected"
}

function GlassRow({
  icon: Icon,
  label,
  value,
  mono = false,
  accent = "neutral",
  active = false,
  delay = 0,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  label: string
  value: string
  mono?: boolean
  accent?: "neutral" | "cyan" | "emerald" | "violet"
  active?: boolean
  delay?: number
}) {
  const accentMap = {
    neutral: "text-zinc-400 bg-white/[0.04] border-white/[0.06]",
    cyan: "text-cyan-300 bg-cyan-500/10 border-cyan-500/25",
    emerald: "text-emerald-300 bg-emerald-500/10 border-emerald-500/25",
    violet: "text-violet-300 bg-violet-500/10 border-violet-500/25",
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -14 }}
      animate={{
        opacity: 1,
        x: 0,
        borderColor: active ? "rgba(34,211,238,0.35)" : "rgba(255,255,255,0.06)",
        backgroundColor: active ? "rgba(34,211,238,0.06)" : "rgba(0,0,0,0.2)",
      }}
      transition={{ delay, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ x: 3, transition: { duration: 0.2 } }}
      className="relative overflow-hidden rounded-xl border px-3 py-3 backdrop-blur-md"
    >
      {active ? (
        <motion.div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-transparent to-transparent"
          animate={{ opacity: [0.35, 0.7, 0.35] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      ) : null}

      <div className="relative flex items-start gap-3">
        <motion.div
          className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg border", accentMap[accent])}
          animate={active ? { scale: [1, 1.08, 1] } : undefined}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          <Icon className="size-3.5" />
        </motion.div>
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-500">{label}</p>
          <p className={cn("mt-0.5 truncate text-sm text-zinc-100", mono && "font-mono text-xs text-zinc-200")}>
            {value}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export function RepositoryCard({
  className,
  repository = DEMO_REPOSITORY,
  environment = DEMO_ENVIRONMENT,
  activeContext = null,
  connectionStatus = "disconnected",
}: RepositoryCardProps) {
  const connected = connectionStatus === "connected"
  const connecting = connectionStatus === "connecting"

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <GlassPanel
        glow={connected ? "emerald" : connecting ? "cyan" : "neutral"}
        intensity={connecting || connected ? "normal" : "subtle"}
        delay={0}
        contentClassName="p-4"
      >
        <div className="flex items-center gap-3">
          <motion.div
            className="relative flex size-11 items-center justify-center rounded-xl border border-white/[0.1] bg-gradient-to-br from-white/[0.08] to-white/[0.02]"
            animate={
              connecting
                ? {
                    scale: [1, 1.06, 1],
                    boxShadow: [
                      "0 0 0 rgba(34,211,238,0)",
                      "0 0 28px rgba(34,211,238,0.35)",
                      "0 0 0 rgba(34,211,238,0)",
                    ],
                  }
                : connected
                  ? { boxShadow: "0 0 20px rgba(16,185,129,0.35)" }
                  : {
                      boxShadow: [
                        "0 0 0 rgba(255,255,255,0)",
                        "0 0 24px rgba(255,255,255,0.08)",
                        "0 0 0 rgba(255,255,255,0)",
                      ],
                    }
            }
            transition={{ duration: connecting ? 1.4 : 3.2, repeat: Infinity }}
          >
            <Github className="size-5 text-zinc-200" />
            <AnimatePresence mode="wait">
              <motion.span
                key={connectionStatus}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className={cn(
                  "absolute -right-0.5 -top-0.5 size-2 rounded-full",
                  connected && "bg-emerald-400",
                  connecting && "bg-cyan-400",
                  connectionStatus === "disconnected" && "bg-zinc-500",
                )}
              />
            </AnimatePresence>
          </motion.div>
          <div className="min-w-0 flex-1">
            <motion.p
              className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Repository Information
            </motion.p>
            <p className="truncate text-sm font-semibold tracking-tight text-zinc-50">
              {repository.owner}/{repository.name}
            </p>
            <AnimatePresence mode="wait">
              <motion.p
                key={connectionStatus}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                className={cn(
                  "mt-0.5 font-mono text-[10px]",
                  connected && "text-emerald-400/80",
                  connecting && "text-cyan-400/80",
                  connectionStatus === "disconnected" && "text-zinc-600",
                )}
              >
                {connected
                  ? "Connected · webhook active"
                  : connecting
                    ? "Connecting to GitHub…"
                    : "Not connected"}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </GlassPanel>

      <GlassPanel glow="cyan" intensity="subtle" delay={0.06} contentClassName="p-4">
        <p className="mb-3 text-[10px] font-medium uppercase tracking-[0.18em] text-cyan-400/80">
          Source Control
        </p>
        <div className="flex flex-col gap-3">
          <GlassRow
            icon={GitBranch}
            label="Git Branch"
            value={repository.branch}
            mono
            accent="cyan"
            active={activeContext === "branch" || activeContext === "repo"}
            delay={0.1}
          />
          <GlassRow
            icon={GitCommitHorizontal}
            label="Latest Commit"
            value={`${repository.commit} — ${repository.commitMessage}`}
            mono
            accent="violet"
            active={activeContext === "commit"}
            delay={0.16}
          />
        </div>
      </GlassPanel>

      <GlassPanel glow="emerald" intensity="subtle" delay={0.12} contentClassName="p-4">
        <div className="mb-3 flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 6, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Cloud className="size-4 text-emerald-400" />
          </motion.div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-400/80">
            Deployment Environment
          </p>
        </div>
        <div className="space-y-2">
          <GlassRow
            icon={Server}
            label="Environment"
            value={environment.name}
            accent="emerald"
            active={activeContext === "environment"}
            delay={0.2}
          />
          <GlassRow
            icon={MapPin}
            label="Provider · Region"
            value={`${environment.provider} · ${environment.region}`}
            delay={0.26}
          />
          <GlassRow
            icon={Cloud}
            label="Cluster"
            value={environment.cluster}
            mono
            delay={0.32}
          />
        </div>
      </GlassPanel>

      <AnimatePresence>
        {activeContext ? (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-1 font-mono text-[10px] text-cyan-500/70"
          >
            Agent inspecting · {activeContext}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
