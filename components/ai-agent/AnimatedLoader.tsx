"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedLoaderProps {
  className?: string
  size?: "sm" | "md" | "lg"
  label?: string
}

const sizeMap = {
  sm: "size-4",
  md: "size-6",
  lg: "size-8",
}

export function AnimatedLoader({ className, size = "md", label }: AnimatedLoaderProps) {
  return (
    <div className={cn("flex items-center gap-3", className)} role="status" aria-label={label ?? "Loading"}>
      <div className={cn("relative", sizeMap[size])}>
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-emerald-500/20"
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        />
        <motion.span
          className="absolute inset-0 rounded-full border-2 border-transparent border-t-emerald-400"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
        />
      </div>
      {label ? <span className="text-xs text-zinc-500">{label}</span> : null}
    </div>
  )
}
