"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

type GlowVariant = "emerald" | "cyan" | "violet" | "amber" | "neutral"

interface GlassPanelProps {
  children: React.ReactNode
  className?: string
  contentClassName?: string
  glow?: GlowVariant
  delay?: number
  animateBorder?: boolean
  hoverLift?: boolean
}

const glowColors: Record<GlowVariant, string> = {
  emerald: "from-emerald-500/60 via-cyan-500/40 to-emerald-500/60",
  cyan: "from-cyan-500/60 via-blue-500/40 to-cyan-500/60",
  violet: "from-violet-500/60 via-fuchsia-500/40 to-violet-500/60",
  amber: "from-amber-500/60 via-orange-500/40 to-amber-500/60",
  neutral: "from-white/20 via-zinc-400/10 to-white/20",
}

export function GlassPanel({
  children,
  className,
  contentClassName,
  glow = "neutral",
  delay = 0,
  animateBorder = true,
  hoverLift = true,
}: GlassPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={hoverLift ? { y: -2, transition: { duration: 0.25 } } : undefined}
      className={cn("group relative overflow-hidden rounded-2xl p-[1px]", className)}
    >
      {animateBorder ? (
        <motion.div
          className={cn(
            "absolute inset-0 rounded-2xl bg-gradient-to-r opacity-70 blur-[0.5px]",
            glowColors[glow],
          )}
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "center center" }}
        />
      ) : (
        <div className={cn("absolute inset-0 rounded-2xl bg-gradient-to-r opacity-40", glowColors[glow])} />
      )}

      <motion.div
        className={cn(
          "relative overflow-hidden rounded-[15px] border border-white/[0.08]",
          "bg-zinc-950/70 shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-2xl",
          contentClassName,
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.06] via-transparent to-transparent" />
        <div className="pointer-events-none absolute -right-20 -top-20 size-40 rounded-full bg-white/[0.03] blur-3xl" />
        <div className="relative">{children}</div>
      </motion.div>
    </motion.div>
  )
}
