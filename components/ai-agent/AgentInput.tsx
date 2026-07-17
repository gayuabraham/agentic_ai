"use client"

import { ArrowUp, Paperclip, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

interface AgentInputProps {
  className?: string
  placeholder?: string
  disabled?: boolean
}

export function AgentInput({
  className,
  placeholder = "Ask Rapid24 to analyze, fix, or deploy your application...",
  disabled = true,
}: AgentInputProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-white/[0.08] bg-white/[0.03] p-3 backdrop-blur-xl",
        className,
      )}
    >
      <div className="mb-2 flex items-center gap-2 px-1">
        <Sparkles className="size-3.5 text-violet-400" />
        <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
          Agent Command
        </span>
      </div>

      <Textarea
        disabled={disabled}
        placeholder={placeholder}
        className="min-h-[88px] resize-none border-0 bg-transparent px-1 text-sm text-zinc-200 shadow-none placeholder:text-zinc-600 focus-visible:ring-0"
      />

      <div className="mt-2 flex items-center justify-between gap-2 border-t border-white/[0.06] pt-2">
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className="text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-300"
        >
          <Paperclip className="size-4" />
          Attach logs
        </Button>

        <Button
          size="sm"
          disabled={disabled}
          className="bg-emerald-600 text-white hover:bg-emerald-500"
        >
          Run Agent
          <ArrowUp className="size-4" />
        </Button>
      </div>
    </div>
  )
}
