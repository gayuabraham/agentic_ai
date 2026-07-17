"use client"

import { motion } from "framer-motion"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { DEMO_TERMINAL_LINES } from "./constants"
import { GlassPanel } from "./GlassPanel"
import type { TerminalLine } from "./types"

interface TerminalOutputProps {
  className?: string
  lines?: TerminalLine[]
  title?: string
}

const levelStyles: Record<TerminalLine["level"], string> = {
  info: "text-zinc-400",
  success: "text-emerald-400",
  warn: "text-amber-400",
  error: "text-red-400",
  command: "text-cyan-300",
}

export function TerminalOutput({
  className,
  lines = DEMO_TERMINAL_LINES,
  title = "Live Terminal Logs",
}: TerminalOutputProps) {
  return (
    <GlassPanel
      glow="neutral"
      delay={0.3}
      hoverLift={false}
      className={cn("h-full min-h-[220px]", className)}
      contentClassName="flex min-h-[220px] flex-col bg-[#030304]/90"
    >
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div className="flex gap-1.5">
            {["#ff5f57", "#febc2e", "#28c840"].map((color, i) => (
              <motion.span
                key={color}
                className="size-2.5 rounded-full"
                style={{ backgroundColor: color }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </motion.div>
          <span className="ml-2 font-mono text-[11px] text-zinc-500">{title}</span>
        </motion.div>
        <motion.span
          className="font-mono text-[10px] uppercase tracking-wider text-zinc-600"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          streaming
        </motion.span>
      </div>

      <ScrollArea className="flex-1 p-4">
        <motion.div
          className="space-y-1.5 font-mono text-[11px] leading-relaxed sm:text-xs"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.04 } },
          }}
        >
          {lines.map((line) => (
            <motion.div
              key={line.id}
              variants={{
                hidden: { opacity: 0, x: -6 },
                visible: { opacity: 1, x: 0 },
              }}
              className="flex gap-3"
            >
              <span className="shrink-0 text-zinc-600">{line.timestamp}</span>
              <span className={cn("min-w-0 break-all", levelStyles[line.level])}>
                {line.level === "command" ? "$ " : ""}
                {line.content}
              </span>
            </motion.div>
          ))}
          <motion.span
            className="inline-block h-4 w-2 bg-emerald-400/90"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </motion.div>
      </ScrollArea>
    </GlassPanel>
  )
}
