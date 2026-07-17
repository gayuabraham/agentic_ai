"use client"

import { motion } from "framer-motion"
import { Cloud, GitBranch, GitCommit, Github, Layers } from "lucide-react"
import { cn } from "@/lib/utils"
import { DEMO_ENVIRONMENT, DEMO_REPOSITORY } from "./constants"
import { GlassPanel } from "./GlassPanel"
import type { DeploymentEnvironment, RepositoryInfo } from "./types"

interface RepositoryCardProps {
  className?: string
  repository?: RepositoryInfo
  environment?: DeploymentEnvironment
}

function InfoRow({
  icon: Icon,
  label,
  value,
  mono = false,
  delay = 0,
}: {
  icon: React.ElementType
  label: string
  value: string
  mono?: boolean
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="flex items-start gap-3 rounded-xl border border-white/[0.05] bg-black/20 px-3 py-3"
    >
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.04]">
        <Icon className="size-3.5 text-zinc-400" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-500">{label}</p>
        <p className={cn("mt-0.5 truncate text-sm text-zinc-200", mono && "font-mono text-xs")}>{value}</p>
      </div>
    </motion.div>
  )
}

export function RepositoryCard({
  className,
  repository = DEMO_REPOSITORY,
  environment = DEMO_ENVIRONMENT,
}: RepositoryCardProps) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <GlassPanel glow="neutral" delay={0} contentClassName="p-4">
        <div className="flex items-center gap-3">
          <motion.div
            className="flex size-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]"
            animate={{ boxShadow: ["0 0 0 rgba(255,255,255,0)", "0 0 20px rgba(255,255,255,0.06)", "0 0 0 rgba(255,255,255,0)"] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Github className="size-5 text-zinc-300" />
          </motion.div>
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-500">
              Repository
            </p>
            <p className="truncate text-sm font-semibold text-zinc-100">
              {repository.owner}/{repository.name}
            </p>
          </div>
        </div>
      </GlassPanel>

      <GlassPanel glow="cyan" delay={0.05} contentClassName="p-4 space-y-2">
        <InfoRow icon={GitBranch} label="Git Branch" value={repository.branch} mono delay={0.1} />
        <InfoRow
          icon={GitCommit}
          label="Latest Commit"
          value={`${repository.commit} — ${repository.commitMessage}`}
          mono
          delay={0.15}
        />
      </GlassPanel>

      <GlassPanel glow="emerald" delay={0.1} contentClassName="p-4">
        <div className="mb-3 flex items-center gap-2">
          <Cloud className="size-4 text-emerald-400" />
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-emerald-400/80">
            Deployment Environment
          </p>
        </div>
        <div className="space-y-2">
          <InfoRow icon={Layers} label="Environment" value={environment.name} delay={0.2} />
          <InfoRow icon={Cloud} label="Provider" value={`${environment.provider} · ${environment.region}`} delay={0.25} />
          <InfoRow icon={GitCommit} label="Cluster" value={environment.cluster} mono delay={0.3} />
        </div>
      </GlassPanel>
    </div>
  )
}
