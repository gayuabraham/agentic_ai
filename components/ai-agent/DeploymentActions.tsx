"use client"

import { AnimatePresence, motion } from "framer-motion"
import { GitBranchPlus, Rocket, ScanSearch } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { GlassPanel } from "./GlassPanel"
import type { InteractivePhase } from "./useDeploymentAgent"

interface DeploymentActionsProps {
  className?: string
  phase: InteractivePhase
  canConnect: boolean
  canAnalyze: boolean
  canDeploy: boolean
  onConnect: () => void
  onAnalyze: () => void
  onDeploy: () => void
}

const actions = [
  {
    id: "connect" as const,
    label: "Connect Repository",
    hint: "Link GitHub source",
    icon: GitBranchPlus,
    unlocksAt: "awaiting_connect",
  },
  {
    id: "analyze" as const,
    label: "Analyze Project",
    hint: "AI scans build & infra",
    icon: ScanSearch,
    unlocksAt: "awaiting_analyze",
  },
  {
    id: "deploy" as const,
    label: "Deploy",
    hint: "Ship to production",
    icon: Rocket,
    unlocksAt: "awaiting_deploy",
  },
] as const

function actionState(
  id: "connect" | "analyze" | "deploy",
  phase: InteractivePhase,
  canConnect: boolean,
  canAnalyze: boolean,
  canDeploy: boolean,
): "locked" | "ready" | "active" | "done" {
  if (id === "connect") {
    if (canConnect) return "ready"
    if (phase === "connecting") return "active"
    if (phase !== "awaiting_connect") return "done"
    return "locked"
  }
  if (id === "analyze") {
    if (canAnalyze) return "ready"
    if (phase === "analyzing") return "active"
    if (
      phase === "awaiting_deploy" ||
      phase === "deploying" ||
      phase === "complete"
    )
      return "done"
    return "locked"
  }
  // deploy
  if (canDeploy) return "ready"
  if (phase === "deploying") return "active"
  if (phase === "complete") return "done"
  return "locked"
}

export function DeploymentActions({
  className,
  phase,
  canConnect,
  canAnalyze,
  canDeploy,
  onConnect,
  onAnalyze,
  onDeploy,
}: DeploymentActionsProps) {
  return (
    <GlassPanel
      glow="lavender"
      intensity="subtle"
      delay={0.05}
      className={className}
      contentClassName="p-4 sm:p-5"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--r24-agent-accent-soft)]">
            Deployment Flow
          </p>
          <h2 className="mt-1 text-sm font-semibold tracking-tight text-[var(--r24-agent-fg)]">
            Interactive actions
          </h2>
        </div>
        <span className="rounded-full border border-[var(--r24-agent-surface-border)] bg-[var(--r24-agent-surface)] px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-[var(--r24-agent-muted)] backdrop-blur-md">
          {phase.replace(/_/g, " ")}
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {actions.map((action, index) => {
          const state = actionState(
            action.id,
            phase,
            canConnect,
            canAnalyze,
            canDeploy,
          )
          const Icon = action.icon
          const enabled = state === "ready"
          const onClick =
            action.id === "connect"
              ? onConnect
              : action.id === "analyze"
                ? onAnalyze
                : onDeploy

          return (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 22,
                delay: index * 0.06,
              }}
              layout
            >
              <motion.div
                animate={
                  state === "ready"
                    ? {
                        boxShadow: [
                          "0 0 0 rgba(139,92,246,0)",
                          "0 0 28px var(--r24-agent-accent-glow)",
                          "0 0 0 rgba(139,92,246,0)",
                        ],
                      }
                    : state === "active"
                      ? {
                          boxShadow: [
                            "0 0 12px rgba(139,92,246,0.15)",
                            "0 0 28px var(--r24-agent-accent-glow)",
                            "0 0 12px rgba(139,92,246,0.15)",
                          ],
                        }
                      : { boxShadow: "0 0 0 rgba(0,0,0,0)" }
                }
                transition={{ duration: 2.2, repeat: Infinity }}
                className="rounded-[var(--r24-agent-radius)]"
              >
                <Button
                  type="button"
                  disabled={!enabled}
                  onClick={onClick}
                  className={cn(
                    "relative h-auto w-full items-center justify-start gap-3 rounded-[var(--r24-agent-radius)] border px-4 py-3.5 text-left transition-none",
                    state === "ready" && "r24-agent-btn-primary border-transparent",
                    state === "active" &&
                      "border-[var(--r24-agent-accent-soft)]/40 bg-[var(--r24-agent-accent-soft)]/12 text-[var(--r24-agent-fg)]",
                    state === "done" &&
                      "border-[var(--r24-agent-accent-soft)]/25 bg-[var(--r24-agent-surface)] text-[var(--r24-agent-fg)]",
                    state === "locked" &&
                      "border-[var(--r24-agent-surface-border)] bg-[var(--r24-agent-surface)] text-[var(--r24-agent-fg)]",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-xl border backdrop-blur-md",
                      state === "ready" && "border-white/20 bg-white/15 text-[var(--r24-agent-btn-fg)]",
                      state === "active" && "border-[var(--r24-agent-accent-soft)]/35 bg-[var(--r24-agent-accent-soft)]/15",
                      state === "done" && "border-[var(--r24-agent-accent-soft)]/25 bg-[var(--r24-agent-surface)]",
                      state === "locked" && "border-[var(--r24-agent-surface-border)] bg-[var(--r24-agent-surface)]",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>

                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <p className="text-sm font-semibold leading-tight tracking-tight">{action.label}</p>
                    <p
                      className={cn(
                        "mt-0.5 text-[11px] leading-snug",
                        state === "ready" ? "text-white/65" : "text-[var(--r24-agent-muted)]",
                      )}
                    >
                      {action.hint}
                    </p>
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.span
                      key={state}
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 22 }}
                      className="shrink-0 self-center font-mono text-[9px] uppercase tracking-wider opacity-70"
                    >
                      {state}
                    </motion.span>
                  </AnimatePresence>
                </Button>
              </motion.div>
            </motion.div>
          )
        })}
      </div>
    </GlassPanel>
  )
}
