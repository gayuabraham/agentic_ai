"use client"

import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { memo, useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"
import { AnimatedStatus } from "./AnimatedStatus"
import { GlassPanel } from "./GlassPanel"
import type { AgentStatus } from "./types"

interface AgentThinkingProps {
  className?: string
  /** Optional live stage message — shown as secondary context under the cycling thought */
  message?: string
  isComplete?: boolean
  /** When false, visualization softens but thoughts still rotate */
  active?: boolean
  status?: AgentStatus
  thoughts?: string[]
  thoughtIntervalMs?: number
}

export const DEFAULT_AI_THOUGHTS = [
  "Analyzing dependency graph...",
  "Checking Docker layers...",
  "Evaluating infrastructure...",
  "Scanning deployment history...",
  "Predicting rollout risk...",
  "Preparing production rollout...",
]

const COMPLETE_THOUGHT = "Deployment verified — production is healthy and serving."

/** Integer SVG coords — stable across SSR/CSR */
const NODES = [
  { x: 18, y: 22 },
  { x: 52, y: 12 },
  { x: 86, y: 24 },
  { x: 28, y: 52 },
  { x: 62, y: 48 },
  { x: 90, y: 58 },
  { x: 20, y: 82 },
  { x: 55, y: 78 },
  { x: 88, y: 86 },
] as const

const EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [0, 3],
  [1, 4],
  [2, 5],
  [3, 4],
  [4, 5],
  [3, 6],
  [4, 7],
  [5, 8],
  [6, 7],
  [7, 8],
  [1, 3],
  [2, 4],
]

const PARTICLES = [
  { x: 10, y: 28, d: 0, s: 2, dur: 3.2 },
  { x: 38, y: 18, d: 0.5, s: 1.5, dur: 2.8 },
  { x: 78, y: 30, d: 1.1, s: 2, dur: 3.6 },
  { x: 22, y: 62, d: 0.3, s: 1.5, dur: 2.6 },
  { x: 68, y: 66, d: 0.9, s: 2, dur: 3.1 },
  { x: 92, y: 48, d: 1.4, s: 1.5, dur: 2.9 },
  { x: 48, y: 88, d: 0.7, s: 1.5, dur: 3.4 },
  { x: 8, y: 78, d: 1.2, s: 2, dur: 3.0 },
] as const

const NeuralNetwork = memo(function NeuralNetwork({
  settled,
  active,
  reduceMotion,
}: {
  settled: boolean
  active: boolean
  reduceMotion: boolean
}) {
  const animate = !settled && !reduceMotion

  return (
    <div
      className="relative size-[132px] shrink-0 sm:size-[152px]"
      style={{ contain: "layout paint" }}
    >
      {/* Soft atmospheric glow */}
      <div
        className={cn(
          "absolute inset-0 rounded-full blur-2xl",
          settled ? "bg-emerald-500/25" : "bg-cyan-500/25",
          animate && "ai-think-glow",
        )}
      />
      <div
        className={cn(
          "absolute inset-7 rounded-full blur-xl",
          settled ? "bg-emerald-400/15" : "bg-violet-500/25",
          animate && "ai-think-glow-alt",
        )}
      />

      {/* Gradient orb */}
      <div
        className={cn(
          "absolute left-1/2 top-1/2 size-[64px] -translate-x-1/2 -translate-y-1/2 rounded-full",
          animate && "ai-think-orb",
        )}
        style={{
          background: settled
            ? "radial-gradient(circle at 32% 28%, rgba(110,231,183,0.6), rgba(16,185,129,0.2) 48%, transparent 72%)"
            : "radial-gradient(circle at 32% 28%, rgba(165,243,252,0.65), rgba(139,92,246,0.28) 46%, transparent 72%)",
          opacity: active || settled ? 1 : 0.7,
        }}
      />

      {/* Rotating rings */}
      {[0, 1, 2].map((ring) => (
        <div
          key={ring}
          className={cn(
            "absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border",
            settled ? "border-emerald-400/35" : "border-cyan-400/30",
            animate && (ring % 2 === 0 ? "ai-think-ring-cw" : "ai-think-ring-ccw"),
          )}
          style={{
            width: 44 + ring * 26,
            height: 44 + ring * 26,
            opacity: 0.4 + ring * 0.1,
            animationDuration: `${10 + ring * 5}s`,
          }}
        />
      ))}

      {/* Neural graph */}
      <svg className="absolute inset-0 size-full" viewBox="0 0 110 110" aria-hidden>
        <defs>
          <linearGradient id="ai-think-edge" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop
              offset="0%"
              stopColor={settled ? "rgba(52,211,153,0.15)" : "rgba(34,211,238,0.15)"}
            />
            <stop
              offset="50%"
              stopColor={settled ? "rgba(52,211,153,0.5)" : "rgba(167,139,250,0.45)"}
            />
            <stop
              offset="100%"
              stopColor={settled ? "rgba(52,211,153,0.15)" : "rgba(34,211,238,0.15)"}
            />
          </linearGradient>
        </defs>

        {EDGES.map(([a, b], i) => {
          const from = NODES[a]
          const to = NODES[b]
          return (
            <g key={`${a}-${b}`}>
              <line
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="url(#ai-think-edge)"
                strokeWidth="1.1"
              />
              {animate ? (
                <circle
                  r="1.6"
                  fill="rgba(34,211,238,0.95)"
                  style={{ filter: "drop-shadow(0 0 2px rgba(34,211,238,0.85))" }}
                >
                  <animateMotion
                    dur={`${1.7 + (i % 4) * 0.35}s`}
                    repeatCount="indefinite"
                    begin={`${(i % 6) * 0.2}s`}
                    path={`M${from.x},${from.y} L${to.x},${to.y}`}
                  />
                </circle>
              ) : null}
            </g>
          )
        })}

        {NODES.map((node, i) => (
          <circle
            key={i}
            cx={node.x}
            cy={node.y}
            r={i === 4 ? 3.6 : 2.3}
            className={cn(animate && "ai-think-node")}
            style={{
              fill: settled
                ? "rgba(52,211,153,0.95)"
                : i === 4
                  ? "rgba(196,181,253,1)"
                  : "rgba(103,232,249,0.9)",
              filter: settled
                ? "drop-shadow(0 0 5px rgba(52,211,153,0.7))"
                : "drop-shadow(0 0 5px rgba(34,211,238,0.6))",
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </svg>

      {/* Glowing pulse core — no spinner */}
      <div
        className={cn(
          "absolute left-1/2 top-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border",
          settled
            ? "border-emerald-400/50 bg-emerald-500/25"
            : "border-cyan-300/40 bg-violet-500/25",
          animate && "ai-think-core",
        )}
      >
        <span
          className={cn(
            "size-2.5 rounded-full",
            settled ? "bg-emerald-300" : "bg-cyan-200",
            animate && "ai-think-core-dot",
          )}
        />
      </div>

      {/* Flowing ambient particles */}
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className={cn(
            "absolute rounded-full",
            settled ? "bg-emerald-400/50" : "bg-cyan-300/75",
            animate && "ai-think-particle",
          )}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.s,
            height: p.s,
            marginLeft: -p.s / 2,
            marginTop: -p.s / 2,
            animationDelay: `${p.d}s`,
            animationDuration: `${p.dur}s`,
          }}
        />
      ))}
    </div>
  )
})

export function AgentThinking({
  className,
  message,
  isComplete = false,
  active = true,
  status = "thinking",
  thoughts = DEFAULT_AI_THOUGHTS,
  thoughtIntervalMs = 2600,
}: AgentThinkingProps) {
  const reduceMotion = useReducedMotion() ?? false
  const [thoughtIndex, setThoughtIndex] = useState(0)

  const list = useMemo(() => {
    const source = thoughts.length > 0 ? thoughts : DEFAULT_AI_THOUGHTS
    // Always keep a rotating set — never collapse to a single static line
    return source.length > 1 ? source : DEFAULT_AI_THOUGHTS
  }, [thoughts])

  const thoughtKey = useMemo(() => list.join("\0"), [list])

  useEffect(() => {
    if (isComplete || reduceMotion || list.length <= 1) return
    const id = setInterval(() => {
      setThoughtIndex((i) => (i + 1) % list.length)
    }, thoughtIntervalMs)
    return () => clearInterval(id)
  }, [isComplete, thoughtKey, list.length, thoughtIntervalMs, reduceMotion])

  useEffect(() => {
    setThoughtIndex(0)
  }, [thoughtKey])

  const currentThought = isComplete ? COMPLETE_THOUGHT : list[thoughtIndex % list.length]

  return (
    <GlassPanel
      glow={isComplete ? "emerald" : "cyan"}
      intensity="strong"
      delay={0.08}
      className={className}
      contentClassName="relative overflow-hidden p-5 sm:p-6"
    >
      <div
        className={cn(
          "pointer-events-none absolute -left-16 top-0 size-48 rounded-full blur-3xl",
          isComplete ? "bg-emerald-500/10" : "bg-cyan-500/15",
          !isComplete && !reduceMotion && "ai-think-glow",
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute -right-12 bottom-0 size-40 rounded-full blur-3xl",
          isComplete ? "bg-emerald-400/10" : "bg-violet-500/12",
          !isComplete && !reduceMotion && "ai-think-glow-alt",
        )}
      />

      <div className="relative mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
            Rapid24 AI Agent
          </p>
          <h2 className="mt-1 text-sm font-semibold tracking-tight text-zinc-100">
            {isComplete ? "Deployment Intelligence" : "AI Reasoning Engine"}
          </h2>
        </div>
        <AnimatedStatus status={isComplete ? "success" : status} />
      </div>

      <div className="relative flex items-center gap-5 sm:gap-6">
        <NeuralNetwork
          settled={isComplete}
          active={active}
          reduceMotion={reduceMotion}
        />

        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2.5">
            <span
              className={cn(
                "text-[10px] font-medium uppercase tracking-[0.2em]",
                isComplete ? "text-emerald-400" : "text-cyan-300/90",
              )}
            >
              {isComplete ? "AI Complete" : "Current AI Thought"}
            </span>

            {!isComplete ? (
              <span className="relative flex size-1.5">
                <span
                  className={cn(
                    "absolute inline-flex size-full rounded-full bg-cyan-400 opacity-60",
                    !reduceMotion && "ai-think-core-dot",
                  )}
                />
                <span className="relative inline-flex size-1.5 rounded-full bg-cyan-300" />
              </span>
            ) : (
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-emerald-400">
                Live
              </span>
            )}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={currentThought}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
              className="text-lg font-medium tracking-tight text-zinc-50 sm:text-xl"
            >
              {currentThought}
            </motion.p>
          </AnimatePresence>

          <AnimatePresence mode="wait" initial={false}>
            {!isComplete && message ? (
              <motion.p
                key={message}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="mt-2 truncate font-mono text-[11px] text-zinc-500"
              >
                {message}
              </motion.p>
            ) : null}
          </AnimatePresence>

          {!isComplete ? (
            <div className="mt-4 flex gap-1.5">
              {list.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    "h-0.5 flex-1 rounded-full transition-[background-color,transform] duration-500",
                    i === thoughtIndex
                      ? "scale-y-150 bg-cyan-400/90"
                      : i < thoughtIndex
                        ? "bg-cyan-400/35"
                        : "bg-white/[0.08]",
                  )}
                />
              ))}
            </div>
          ) : (
            <div className="mt-4 h-0.5 overflow-hidden rounded-full bg-emerald-500/20">
              <motion.div
                className="h-full rounded-full bg-emerald-400"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
                style={{ boxShadow: "0 0 10px rgba(52,211,153,0.55)" }}
              />
            </div>
          )}
        </div>
      </div>
    </GlassPanel>
  )
}
