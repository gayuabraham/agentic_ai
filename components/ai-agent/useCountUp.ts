"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Smoothly animates a number toward `target` (enterprise count-up feel).
 */
export function useCountUp(
  target: number,
  {
    duration = 900,
    decimals = 0,
    enabled = true,
  }: { duration?: number; decimals?: number; enabled?: boolean } = {},
) {
  const [value, setValue] = useState(0)
  const frameRef = useRef<number | null>(null)
  const startRef = useRef(0)
  const fromRef = useRef(0)

  useEffect(() => {
    if (!enabled) {
      setValue(target)
      return
    }

    fromRef.current = value
    startRef.current = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startRef.current
      const t = Math.min(1, elapsed / duration)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3)
      const next = fromRef.current + (target - fromRef.current) * eased
      setValue(next)
      if (t < 1) {
        frameRef.current = requestAnimationFrame(tick)
      }
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
    // intentionally re-run when target changes; value read via ref for from
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, duration, enabled])

  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}
