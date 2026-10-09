"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AssistantAvatarProps {
  className?: string
  size?: "sm" | "md" | "lg"
  thinking?: boolean
}

const sizeMap = {
  sm: "size-8",
  md: "size-10",
  lg: "size-12",
}

export function AssistantAvatar({
  className,
  size = "md",
  thinking = false,
}: AssistantAvatarProps) {
  return (
    <div className={cn("relative shrink-0", sizeMap[size], className)}>
      <motion.div
        className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400/40 via-cyan-400/20 to-violet-500/30 blur-md"
        animate={
          thinking
            ? { opacity: [0.45, 0.95, 0.45], scale: [0.95, 1.12, 0.95] }
            : { opacity: [0.35, 0.65, 0.35], scale: [1, 1.05, 1] }
        }
        transition={{ duration: thinking ? 1.4 : 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {[0, 1].map((ring) => (
        <motion.span
          key={ring}
          className="absolute inset-0 rounded-2xl border border-emerald-400/30"
          animate={
            thinking
              ? { scale: [1, 1.25 + ring * 0.1], opacity: [0.5, 0] }
              : { scale: 1, opacity: 0.25 }
          }
          transition={{
            duration: 1.6,
            repeat: thinking ? Infinity : 0,
            delay: ring * 0.35,
            ease: "easeOut",
          }}
        />
      ))}

      <motion.div
        className="relative flex size-full items-center justify-center rounded-2xl border border-white/10 bg-zinc-950/80 shadow-[0_0_24px_rgba(16,185,129,0.25)] backdrop-blur-xl"
        animate={thinking ? { rotate: [0, 2, -2, 0] } : { rotate: 0 }}
        transition={{ duration: 2.2, repeat: thinking ? Infinity : 0 }}
      >
        <span className="text-[10px] font-bold tracking-tight text-emerald-300">R24</span>
        <motion.span
          className="absolute bottom-1 right-1 size-1.5 rounded-full bg-emerald-400"
          animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      </motion.div>
    </div>
  )
}
