"use client"

import Link from "next/link"
import { useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"

const NAV_LINKS = [
  { label: "Platform", href: "#platform" },
  { label: "Capabilities", href: "#agents" },
  { label: "Workflow", href: "#workflow" },
  { label: "Integrations", href: "#integrations" },
]

const NAV_STYLE = {
  backdropFilter: "blur(20px) saturate(1.2)",
  WebkitBackdropFilter: "blur(20px) saturate(1.2)",
  background: "var(--r24-nav-bg)",
  boxShadow: "var(--r24-nav-shadow)",
} as const

export function MobileNav() {
  const [open, setOpen] = useState(false)

  const close = () => setOpen(false)

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <div className="pointer-events-auto w-full max-w-3xl">
        <nav
          className="flex items-center justify-between rounded-2xl border border-border px-5 py-3"
          style={NAV_STYLE}
          aria-label="Primary"
        >
          <span className="text-[13px] font-semibold tracking-tight text-foreground/80">
            Rapid24.ai
          </span>

          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-[12px] font-medium tracking-wide text-muted-foreground transition-colors duration-200 hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle variant="nav" className="hidden md:inline-flex" />

            <Link
              href="/agent"
              className="hidden rounded-xl border border-border bg-background/60 px-4 py-2 text-[11px] font-semibold tracking-[0.08em] text-foreground/70 transition-all duration-200 hover:border-border hover:bg-accent hover:text-foreground md:inline-flex focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              OPEN AGENT
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex h-8 w-8 flex-col items-center justify-center gap-[5px] rounded-lg transition-colors hover:bg-accent md:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              <span
                className="block h-px origin-center bg-foreground/60 transition-all duration-300"
                style={{
                  width: "18px",
                  transform: open ? "translateY(6px) rotate(45deg)" : "none",
                }}
              />
              <span
                className="block h-px bg-foreground/60 transition-all duration-300"
                style={{
                  width: "18px",
                  opacity: open ? 0 : 1,
                  transform: open ? "scaleX(0)" : "none",
                }}
              />
              <span
                className="block h-px origin-center bg-foreground/60 transition-all duration-300"
                style={{
                  width: "18px",
                  transform: open ? "translateY(-6px) rotate(-45deg)" : "none",
                }}
              />
            </button>
          </div>
        </nav>

        <div
          className="mt-2 overflow-hidden transition-all duration-300 ease-out md:hidden"
          style={{ maxHeight: open ? "360px" : "0px", opacity: open ? 1 : 0 }}
          aria-hidden={!open}
        >
          <div
            className="flex flex-col rounded-2xl border border-border px-2 py-2"
            style={NAV_STYLE}
          >
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={close}
                className="rounded-xl px-4 py-3 text-sm font-medium tracking-wide text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-1 flex items-center gap-2 px-2 pb-1">
              <ThemeToggle variant="nav" className="shrink-0" />
              <Link
                href="/agent"
                onClick={close}
                className="flex flex-1 items-center justify-center rounded-xl border border-border bg-background/60 px-4 py-2.5 text-[11px] font-semibold tracking-[0.08em] text-foreground/70 transition-all duration-200 hover:border-border hover:bg-accent hover:text-foreground"
              >
                OPEN AGENT
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
