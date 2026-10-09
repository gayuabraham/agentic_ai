"use client"

import { AnimatePresence, motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { GlassPanel } from "./GlassPanel"
import { useTerminalAutoScroll, useTerminalTypist } from "./useTerminalTypist"
import type { RenderedTerminalLine, TerminalScriptEntry } from "./types"

interface TerminalOutputProps {
  className?: string
  title?: string
  script?: TerminalScriptEntry[]
  /** Controlled mode — driven by useDeploymentAgent */
  lines?: RenderedTerminalLine[]
  activeLine?: Pick<RenderedTerminalLine, "type" | "text"> | null
  activeText?: string
  isTyping?: boolean
  isComplete?: boolean
  awaitingNext?: boolean
}

function Prefix({ type }: { type: RenderedTerminalLine["type"] }) {
  if (type === "success") {
    return (
      <motion.span
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 20 }}
        className="shrink-0 select-none font-mono text-[13px] font-semibold text-emerald-400"
        style={{ textShadow: "0 0 10px rgba(52,211,153,0.55)" }}
      >
        ✓
      </motion.span>
    )
  }

  if (type === "warning") {
    return (
      <motion.span
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 20 }}
        className="shrink-0 select-none font-mono text-[13px] font-semibold text-amber-400"
        style={{ textShadow: "0 0 10px rgba(251,191,36,0.45)" }}
      >
        !
      </motion.span>
    )
  }

  if (type === "info") {
    return (
      <span className="shrink-0 select-none font-mono text-[13px] text-cyan-400/90">→</span>
    )
  }

  return (
    <span className="shrink-0 select-none font-mono text-[13px] text-emerald-500/80">$</span>
  )
}

function lineTextClass(type: RenderedTerminalLine["type"]) {
  switch (type) {
    case "command":
      return "text-sky-300"
    case "success":
      return "text-emerald-400"
    case "warning":
      return "text-amber-300"
    case "info":
      return "text-cyan-300/90"
    default:
      return "text-zinc-300"
  }
}

function TerminalLineRow({
  line,
  showCursor = false,
}: {
  line: Pick<RenderedTerminalLine, "type" | "text">
  showCursor?: boolean
}) {
  const isSuccess = line.type === "success"
  const isWarning = line.type === "warning"

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      className="flex items-start gap-2.5 leading-relaxed"
    >
      <Prefix type={line.type} />
      <span
        className={cn(
          "min-w-0 break-words font-mono text-[13px] tracking-tight",
          lineTextClass(line.type),
          line.type === "command" && "font-medium",
        )}
        style={
          isSuccess
            ? { textShadow: "0 0 12px rgba(52,211,153,0.25)" }
            : isWarning
              ? { textShadow: "0 0 12px rgba(251,191,36,0.2)" }
              : undefined
        }
      >
        {line.text}
        {showCursor ? <BlinkingCursor tone={line.type} /> : null}
      </span>
    </motion.div>
  )
}

function BlinkingCursor({
  tone = "command",
}: {
  tone?: RenderedTerminalLine["type"]
}) {
  const color =
    tone === "warning"
      ? "bg-amber-400"
      : tone === "success"
        ? "bg-emerald-400"
        : tone === "info"
          ? "bg-cyan-400"
          : "bg-emerald-400"

  const glow =
    tone === "warning"
      ? "0 0 10px rgba(251,191,36,0.85)"
      : "0 0 10px rgba(52,211,153,0.85)"

  return (
    <motion.span
      className={cn(
        "ml-[1px] inline-block h-[1.05em] w-[7px] translate-y-[2px] align-baseline",
        color,
      )}
      style={{ boxShadow: glow }}
      animate={{ opacity: [1, 1, 0, 0] }}
      transition={{ duration: 1.05, repeat: Infinity, times: [0, 0.48, 0.5, 1], ease: "linear" }}
      aria-hidden
    />
  )
}

export function TerminalOutput({
  className,
  title = "deployment · bash",
  script,
  lines: controlledLines,
  activeLine: controlledActiveLine,
  activeText: controlledActiveText,
  isTyping: controlledIsTyping,
  isComplete: controlledIsComplete,
  awaitingNext: controlledAwaiting,
}: TerminalOutputProps) {
  const isControlled = controlledLines !== undefined
  const internal = useTerminalTypist({
    script,
    autoStart: !isControlled,
  })

  const completedLines = isControlled ? controlledLines! : internal.completedLines
  const activeLine = isControlled
    ? controlledActiveLine ?? null
    : internal.activeLine
      ? { type: internal.activeLine.type, text: internal.activeText }
      : null
  const activeText = isControlled
    ? (controlledActiveText ?? "")
    : internal.activeText
  const isTyping = isControlled ? Boolean(controlledIsTyping) : internal.isTyping
  const isComplete = isControlled ? Boolean(controlledIsComplete) : internal.isComplete
  const awaitingNext = isControlled
    ? Boolean(controlledAwaiting)
    : Boolean(internal.awaitingNext)

  const { bottomRef, containerRef } = useTerminalAutoScroll([
    completedLines.length,
    activeText,
    awaitingNext,
    isTyping,
  ])

  const showActive = Boolean(activeLine)

  return (
    <GlassPanel
      glow="emerald"
      intensity="subtle"
      delay={0.28}
      hoverLift={false}
      className={cn(className)}
      contentClassName="flex flex-col overflow-hidden bg-[#050507]/95"
    >
      <div className="relative flex items-center justify-between border-b border-white/[0.06] px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5">
            {["#ff5f57", "#febc2e", "#28c840"].map((color) => (
              <span
                key={color}
                className="size-2.5 rounded-full"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span className="font-mono text-[11px] text-zinc-500">{title}</span>
        </div>

        <motion.span
          className={cn(
            "font-mono text-[10px] uppercase tracking-[0.14em]",
            isComplete ? "text-emerald-500/80" : "text-emerald-500/75",
          )}
          animate={{
            opacity: isTyping || awaitingNext ? [0.4, 1, 0.4] : isComplete ? 0.85 : 0.45,
          }}
          transition={{ duration: 1.35, repeat: isTyping || awaitingNext ? Infinity : 0 }}
        >
          {isComplete ? "live" : isTyping || awaitingNext ? "streaming" : "idle"}
        </motion.span>

        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-emerald-500/35 to-transparent"
          animate={{ opacity: [0.25, 0.75, 0.25] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </div>

      <div
        ref={containerRef}
        className="relative max-h-[360px] min-h-[260px] overflow-y-auto overflow-x-hidden p-4 font-mono [scrollbar-width:thin] [scrollbar-color:rgba(52,211,153,0.25)_transparent]"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-6 bg-gradient-to-b from-[#050507] to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-8 bg-gradient-to-t from-[#050507] to-transparent" />

        <div className="space-y-2 pb-2">
          <AnimatePresence initial={false}>
            {completedLines.map((line) => (
              <TerminalLineRow key={line.id} line={line} />
            ))}
          </AnimatePresence>

          {showActive && activeLine ? (
            <TerminalLineRow
              line={{ type: activeLine.type, text: activeText }}
              showCursor
            />
          ) : null}

          {(awaitingNext || (isComplete && !activeLine) || (!showActive && !isComplete && completedLines.length === 0)) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2.5 pt-0.5"
            >
              <span className="font-mono text-[13px] text-emerald-500/70">$</span>
              <BlinkingCursor />
            </motion.div>
          )}

          <div ref={bottomRef} className="h-px w-full" aria-hidden />
        </div>
      </div>
    </GlassPanel>
  )
}
