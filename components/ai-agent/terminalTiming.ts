import type { TerminalScriptEntry } from "./types"

export type TerminalLineKind = TerminalScriptEntry["type"]

/**
 * Pace terminal typing from a step's `durationMs` (deployment.json).
 * Lines finish within the step window so the UI stays synced with the pipeline.
 */
export function createTerminalCadence(
  script: Pick<TerminalScriptEntry, "type" | "text">[],
  durationMs: number,
) {
  const charCount = script.reduce((n, line) => n + Math.max(1, line.text.length), 0)
  const lineCount = Math.max(1, script.length)

  const typingBudget = Math.max(320, durationMs * 0.7)
  const pauseBudget = Math.max(160, durationMs * 0.22)
  const introBudget = Math.max(40, durationMs * 0.06)

  const baseCharMs = typingBudget / charCount
  const basePauseMs = pauseBudget / lineCount
  const baseIntroMs = introBudget / lineCount

  const typeWeight = (type: TerminalLineKind) => {
    if (type === "command") return 1.15
    if (type === "warning") return 0.95
    if (type === "success") return 0.7
    return 0.8
  }

  return {
    charDelay(type: TerminalLineKind, char: string, prev = "") {
      let delay = baseCharMs * typeWeight(type)
      if (char === " " || char === "." || char === "," || char === "/") {
        delay *= 1.35
      }
      if (char === "." && prev === ".") delay *= 1.5
      // Tiny human jitter — still proportional to step duration
      delay *= 0.85 + Math.random() * 0.3
      return Math.max(4, delay)
    },
    pauseBefore(type: TerminalLineKind) {
      const weight = type === "command" ? 1.2 : 0.7
      return Math.max(20, baseIntroMs * weight * (0.85 + Math.random() * 0.3))
    },
    pauseAfter(type: TerminalLineKind) {
      const weight =
        type === "command" ? 1.15 : type === "warning" ? 1.05 : type === "success" ? 0.85 : 0.9
      return Math.max(40, basePauseMs * weight * (0.85 + Math.random() * 0.3))
    },
  }
}
