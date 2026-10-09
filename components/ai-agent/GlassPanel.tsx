"use client"

import { motion, useReducedMotion } from "framer-motion"
import { cn } from "@/lib/utils"

type GlowVariant = "emerald" | "cyan" | "violet" | "amber" | "neutral" | "lavender"
type BorderIntensity = "subtle" | "normal" | "strong"

interface GlassPanelProps {
  children: React.ReactNode
  className?: string
  contentClassName?: string
  glow?: GlowVariant
  delay?: number
  animateBorder?: boolean
  hoverLift?: boolean
  intensity?: BorderIntensity
}

const glowColors: Record<GlowVariant, string> = {
  lavender: "from-violet-300/40 via-fuchsia-200/25 to-purple-300/35",
  violet: "from-violet-400/45 via-purple-300/28 to-violet-400/40",
  emerald: "from-emerald-400/35 via-teal-300/20 to-emerald-400/30",
  cyan: "from-sky-300/35 via-cyan-200/22 to-sky-300/30",
  amber: "from-amber-300/35 via-orange-200/20 to-amber-300/30",
  neutral: "from-white/50 via-white/20 to-white/35",
}

const intensityConfig: Record<BorderIntensity, { duration: number; opacity: string }> = {
  subtle: { duration: 18, opacity: "opacity-25" },
  normal: { duration: 12, opacity: "opacity-35" },
  strong: { duration: 8, opacity: "opacity-50" },
}

export function GlassPanel({
  children,
  className,
  contentClassName,
  glow = "lavender",
  delay = 0,
  animateBorder = false,
  hoverLift = true,
  intensity = "normal",
}: GlassPanelProps) {
  const reduceMotion = useReducedMotion()
  const border = intensityConfig[intensity]

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={
        hoverLift && !reduceMotion
          ? { y: -1, transition: { type: "spring", stiffness: 400, damping: 28 } }
          : undefined
      }
      className={cn(
        "group relative flex min-h-0 flex-col overflow-hidden rounded-[var(--r24-agent-radius)] p-px",
        className,
      )}
    >
      <div
        className={cn(
          "absolute inset-0 rounded-[var(--r24-agent-radius)] bg-gradient-to-br opacity-60",
          glowColors[glow],
        )}
        aria-hidden
      />

      {animateBorder && !reduceMotion ? (
        <motion.div
          className={cn(
            "absolute -inset-[45%] rounded-full bg-gradient-to-r blur-[2px]",
            border.opacity,
            glowColors[glow],
          )}
          animate={{ rotate: 360 }}
          transition={{ duration: border.duration, repeat: Infinity, ease: "linear" }}
          aria-hidden
        />
      ) : null}

      <div
        className={cn(
          "relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[calc(var(--r24-agent-radius)-1px)]",
          "border border-[var(--r24-agent-glass-border)]",
          "bg-[var(--r24-agent-glass-bg)] shadow-[var(--r24-agent-glass-shadow)]",
          "backdrop-blur-[var(--r24-agent-blur)]",
          "transition-shadow duration-300 group-hover:shadow-[var(--r24-agent-shadow)]",
          contentClassName,
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/55 via-white/10 to-transparent dark:from-white/[0.12] dark:via-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent dark:via-white/25"
          aria-hidden
        />
        <div className="relative z-10 flex min-h-0 flex-1 flex-col">{children}</div>
      </div>
    </motion.div>
  )
}
