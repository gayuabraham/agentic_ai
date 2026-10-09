"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { TERMINAL_DEPLOYMENT_SCRIPT } from "./constants"
import { createTerminalCadence } from "./terminalTiming"
import type { RenderedTerminalLine, TerminalScriptEntry } from "./types"

interface UseTerminalTypistOptions {
  script?: TerminalScriptEntry[]
  autoStart?: boolean
  loop?: boolean
  loopDelay?: number
  /** Total runtime budget for the script — typically a step `durationMs` from deployment.json */
  durationMs?: number
}

export function useTerminalTypist({
  script = TERMINAL_DEPLOYMENT_SCRIPT,
  autoStart = true,
  loop = true,
  loopDelay = 3200,
  durationMs,
}: UseTerminalTypistOptions = {}) {
  const [started, setStarted] = useState(autoStart)
  const [lineIndex, setLineIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [lineReady, setLineReady] = useState(false)
  const [completedLines, setCompletedLines] = useState<RenderedTerminalLine[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const budget = durationMs ?? Math.max(2400, script.length * 900)
  const cadence = useMemo(
    () => createTerminalCadence(script, budget),
    [script, budget],
  )

  const reset = useCallback(() => {
    setLineIndex(0)
    setCharIndex(0)
    setLineReady(false)
    setCompletedLines([])
    setIsComplete(false)
    setIsTyping(false)
    setStarted(autoStart)
  }, [autoStart])

  useEffect(() => {
    if (!started) return

    if (lineIndex >= script.length) {
      setIsTyping(false)
      setIsComplete(true)
      setLineReady(false)

      if (!loop) return

      const restartTimer = setTimeout(() => {
        reset()
      }, loopDelay)

      return () => clearTimeout(restartTimer)
    }

    const line = script[lineIndex]

    if (!lineReady) {
      setIsTyping(false)
      const readyTimer = setTimeout(() => {
        setLineReady(true)
        setIsTyping(true)
      }, cadence.pauseBefore(line.type))
      return () => clearTimeout(readyTimer)
    }

    setIsTyping(true)

    if (charIndex < line.text.length) {
      const char = line.text[charIndex]
      const prev = charIndex > 0 ? line.text[charIndex - 1] : ""
      const timer = setTimeout(() => {
        setCharIndex((prevIdx) => prevIdx + 1)
      }, cadence.charDelay(line.type, char, prev))

      return () => clearTimeout(timer)
    }

    const timer = setTimeout(() => {
      setCompletedLines((prev) => [
        ...prev,
        { id: `${line.id}-${prev.length}`, type: line.type, text: line.text },
      ])
      setLineIndex((prev) => prev + 1)
      setCharIndex(0)
      setLineReady(false)
    }, cadence.pauseAfter(line.type))

    return () => clearTimeout(timer)
  }, [
    started,
    lineIndex,
    charIndex,
    lineReady,
    script,
    loop,
    loopDelay,
    reset,
    cadence,
  ])

  const activeLine = lineIndex < script.length && lineReady ? script[lineIndex] : null
  const activeText = activeLine ? activeLine.text.slice(0, charIndex) : ""
  const awaitingNext = started && !isComplete && !lineReady && lineIndex < script.length

  return {
    completedLines,
    activeLine,
    activeText,
    isTyping,
    isComplete,
    awaitingNext,
    start: () => setStarted(true),
    reset,
  }
}

export function useTerminalAutoScroll(deps: unknown[]) {
  const bottomRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    const bottom = bottomRef.current
    if (!container || !bottom) return

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    })
  }, deps)

  return { bottomRef, containerRef }
}
