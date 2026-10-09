"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  className?: string
  variant?: "default" | "agent" | "nav"
}

export function ThemeToggle({ className, variant = "default" }: ThemeToggleProps) {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === "dark"

  const variantClass =
    variant === "agent"
      ? "border-[var(--r24-agent-surface-border)] bg-[var(--r24-agent-surface)] text-[var(--r24-agent-muted)] hover:bg-[var(--r24-agent-surface)] hover:text-[var(--r24-agent-fg)]"
      : variant === "nav"
        ? "border-border/60 bg-background/50 text-muted-foreground hover:bg-accent hover:text-foreground"
        : "text-muted-foreground hover:text-foreground"

  return (
    <Button
      variant="outline"
      size="icon-sm"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(variantClass, className)}
      disabled={!mounted}
    >
      <Sun className={cn("size-4", isDark ? "block" : "hidden")} />
      <Moon className={cn("size-4", isDark ? "hidden" : "block")} />
    </Button>
  )
}
