"use client"

import { motion } from "framer-motion"

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-1 py-1" aria-label="Assistant is thinking">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="size-1.5 rounded-full bg-emerald-400/90"
          animate={{ y: [0, -5, 0], opacity: [0.35, 1, 0.35] }}
          transition={{
            duration: 0.9,
            repeat: Infinity,
            delay: i * 0.14,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}
