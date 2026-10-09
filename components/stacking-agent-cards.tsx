"use client"

import { useEffect, useRef, useState } from "react"

const AGENTS = [
  {
    label: "BUILD ANALYSIS",
    title: "Intelligent Build Analysis",
    desc: "Inspect every commit, pipeline, and dependency graph. Surface failing tests, Docker misconfigs, and env gaps before they block release.",
    stats: [{ v: "2.4M", l: "builds analyzed" }, { v: "98.2%", l: "root-cause accuracy" }],
    img: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/researcher-CvhqOuV6irGwBOnJoTGFlXdbyYBRjb.png",
  },
  {
    label: "ERROR RESOLUTION",
    title: "Smart Error Resolution",
    desc: "Detect CI/CD failures, container issues, and config errors—then apply targeted fixes automatically so engineers stay focused on product code.",
    stats: [{ v: "1.1M", l: "failures fixed" }, { v: "3.2s", l: "avg diagnose" }],
    img: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/coder-9bItvCegU6TXUqbX3tUXGBAtvkBkXp.png",
  },
  {
    label: "AUTONOMOUS DEPLOY",
    title: "Autonomous Deployment",
    desc: "Ship from commit to production with zero manual friction. Rapid24.ai orchestrates pipelines, rollouts, and rollbacks across your stack.",
    stats: [{ v: "880K", l: "deploys" }, { v: "12x", l: "faster releases" }],
    img: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/analyst-Ysxnqg7Fpy2cfA56PiIttv1KximMhT.png",
  },
  {
    label: "PROD VERIFICATION",
    title: "Production Verification",
    desc: "Confirm health checks, smoke tests, and environment validation after every deploy—so production stays reliable without on-call fire drills.",
    stats: [{ v: "5.6M", l: "health checks" }, { v: "99.9%", l: "verify uptime" }],
    img: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/executor-o1q6509qMLXMtpBIGo49vcgOu34sI1.png",
  },
]

const STICKY_TOP = 88
const STICKY_STEP = 18
const STACK_RAMP = 420
const PEEK_HEIGHT = 64
const MAX_SCALE_SHRINK = 0.1
const SCROLL_SLOT_HEIGHT = "92vh"

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 font-sans text-[11px] tracking-widest text-muted-foreground">
      {children}
    </span>
  )
}

export function StackingAgentCards() {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([])
  const [stickProgress, setStickProgress] = useState<number[]>(AGENTS.map(() => 0))

  useEffect(() => {
    let frame = 0
    let ticking = false

    function onScroll() {
      if (ticking) return
      ticking = true
      frame = window.requestAnimationFrame(() => {
        ticking = false

        const nextProgress = AGENTS.map((_, i) => {
          if (i === 0) return 0
          const el = cardRefs.current[i]
          if (!el) return 0

          const stickyTop = STICKY_TOP + i * STICKY_STEP
          const rect = el.getBoundingClientRect()
          const distance = rect.top - stickyTop

          if (distance >= STACK_RAMP) return 0
          if (distance <= 0) return 1
          return 1 - distance / STACK_RAMP
        })

        setStickProgress((prev) =>
          prev.every((value, index) => Math.abs(value - nextProgress[index]) < 0.002)
            ? prev
            : nextProgress,
        )
      })
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll, { passive: true })
    onScroll()

    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div
      className="flex flex-col pb-8 md:pb-12"
      style={{ perspective: "1400px", perspectiveOrigin: "50% 0%" }}
    >
      {AGENTS.map((agent, i) => {
        const stackedBelow = stickProgress
          .slice(i + 1)
          .reduce((sum, value) => sum + value, 0)
        const stackSlots = AGENTS.length - 1 - i
        const stackRatio = stackSlots > 0 ? clamp(stackedBelow / stackSlots, 0, 1) : 0

        const scale = 1 - stackRatio * MAX_SCALE_SHRINK
        const translateY = stackRatio * (STICKY_STEP * 0.85)
        const contentOpacity = 1 - clamp(stackRatio * 1.35, 0, 1)
        const isPeeking = stackRatio > 0.08
        const peekOpacity = clamp(stackRatio * 1.6, 0, 1)
        const isLast = i === AGENTS.length - 1

        return (
          <div
            key={agent.label}
            ref={(el) => {
              cardRefs.current[i] = el
            }}
            className="sticky"
            style={{
              top: `${STICKY_TOP + i * STICKY_STEP}px`,
              zIndex: 10 + i,
              minHeight: isLast ? undefined : SCROLL_SLOT_HEIGHT,
            }}
          >
            <div
              style={{
                transform: `scale(${scale}) translateY(${translateY}px)`,
                transformOrigin: "top center",
                willChange: "transform",
              }}
            >
              <div className="group relative min-h-[480px] cursor-pointer overflow-hidden rounded-2xl border border-border bg-card md:min-h-[520px]">
                {agent.img ? (
                  <div className="pointer-events-none relative h-52 w-full md:hidden">
                    <img
                      src={agent.img}
                      alt={agent.label}
                      className="absolute inset-0 h-full w-full object-cover object-center"
                      style={{
                        maskImage: "linear-gradient(to bottom, black 0%, black 35%, transparent 85%)",
                        WebkitMaskImage: "linear-gradient(to bottom, black 0%, black 35%, transparent 85%)",
                      }}
                    />
                  </div>
                ) : null}

                {agent.img ? (
                  <div className="pointer-events-none absolute inset-y-0 right-0 hidden overflow-hidden md:block md:w-1/2">
                    <img
                      src={agent.img}
                      alt={agent.label}
                      className="h-full w-full object-cover object-center"
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to right, var(--card) 0%, transparent 55%), linear-gradient(to top, var(--card) 0%, transparent 28%)",
                      }}
                    />
                  </div>
                ) : null}

                <div
                  className="relative z-10 overflow-hidden"
                  style={{
                    maxHeight: isPeeking
                      ? `${PEEK_HEIGHT + (1 - stackRatio) * 280}px`
                      : undefined,
                  }}
                >
                  <div
                    className="relative z-10 p-8 md:min-h-[520px] md:p-12"
                    style={{ opacity: contentOpacity }}
                  >
                    <div className="md:max-w-[58%]">
                      <div className="mb-6 flex items-start justify-between">
                        <Tag>{agent.label}</Tag>
                      </div>
                      <h3 className="mb-3 text-xl font-light">{agent.title}</h3>
                      <p className="mb-10 text-sm leading-relaxed text-muted-foreground md:mb-14">{agent.desc}</p>
                      <div className="flex gap-8 border-t border-border pt-8 md:pt-10">
                        {agent.stats.map((s) => (
                          <div key={s.l}>
                            <div className="text-2xl font-light">{s.v}</div>
                            <div className="mt-0.5 text-[11px] tracking-widest text-muted-foreground">{s.l}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div
                    className="pointer-events-none absolute inset-x-0 top-0 z-20 px-8 py-5"
                    style={{ opacity: peekOpacity }}
                  >
                    <Tag>{agent.label}</Tag>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
