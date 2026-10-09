"use client"

import { AnimatePresence, motion } from "framer-motion"
import { ArrowUp, Bot, Eraser, RefreshCw, X } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { useChat } from "@/hooks/useChat"
import type { DeploymentChatContext } from "@/lib/assistant/types"
import { cn } from "@/lib/utils"
import { AssistantAvatar } from "./AssistantAvatar"
import { ChatMessage } from "./ChatMessage"

interface AssistantPanelProps {
  className?: string
  defaultOpen?: boolean
  /** Live deployment snapshot from the dashboard (refreshed each send) */
  getDeploymentContext?: () => DeploymentChatContext | undefined
  deploymentContext?: DeploymentChatContext
}

export function AssistantPanel({
  className,
  defaultOpen = false,
  getDeploymentContext,
  deploymentContext,
}: AssistantPanelProps) {
  const [open, setOpen] = useState(defaultOpen)
  const chat = useChat({
    getContext: getDeploymentContext,
    context: deploymentContext,
  })

  const {
    messages,
    input,
    setInput,
    isStreaming,
    isThinking,
    error,
    suggestions,
    send,
    sendSuggestion,
    regenerate,
    clear,
  } = chat

  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [messages, isThinking, isStreaming])

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 220)
      return () => clearTimeout(t)
    }
  }, [open])

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    void send(input)
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      void send(input)
    }
  }

  const lastAssistant = useMemo(
    () => [...messages].reverse().find((m) => m.role === "assistant"),
    [messages],
  )
  const streamingId = isStreaming ? lastAssistant?.id : undefined

  return (
    <div
      className={cn(
        "pointer-events-none fixed bottom-5 right-5 z-50 sm:bottom-7 sm:right-7",
        className,
      )}
    >
      <AnimatePresence mode="wait">
        {open ? (
          <motion.div
            key="panel"
            initial={{ opacity: 0, y: 24, scale: 0.94, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 18, scale: 0.96, filter: "blur(8px)" }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="r24-agent-dark-panel pointer-events-auto flex h-[min(640px,calc(100dvh-6rem))] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[1.35rem] border border-white/[0.1] bg-[rgba(7,7,10,0.82)] shadow-[0_28px_90px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-2xl"
          >
            <div
              className="pointer-events-none absolute -left-16 top-0 size-40 rounded-full bg-emerald-500/15 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute -right-10 bottom-20 size-36 rounded-full bg-cyan-500/10 blur-3xl"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
              aria-hidden
            />

            <div className="relative flex items-center justify-between border-b border-white/[0.07] px-4 py-3.5">
              <div className="flex items-center gap-3">
                <AssistantAvatar size="md" thinking={isThinking || isStreaming} />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold tracking-tight text-zinc-50">
                      Deployment Engineer
                    </h2>
                    <motion.span
                      className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-emerald-400"
                      animate={{ opacity: [0.55, 1, 0.55] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {isStreaming ? "Typing" : "Online"}
                    </motion.span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-zinc-500">
                    Rapid24.ai · grounded in live deployment state
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => void regenerate()}
                  disabled={isStreaming || messages.length === 0}
                  className="text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200 disabled:opacity-40"
                  title="Regenerate response"
                >
                  <RefreshCw className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={clear}
                  className="text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200"
                  title="Clear conversation"
                >
                  <Eraser className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setOpen(false)}
                  className="text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-200"
                  aria-label="Close assistant"
                >
                  <X className="size-4" />
                </Button>
              </div>
            </div>

            <div
              ref={listRef}
              className="relative flex-1 space-y-4 overflow-y-auto px-4 py-4"
            >
              {messages.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4 backdrop-blur-md">
                    <p className="text-sm leading-relaxed text-zinc-300">
                      I&apos;m not a general chatbot — I&apos;m your AI Deployment
                      Engineer. I use your live pipeline, logs, and health checks
                      to diagnose failures.
                    </p>
                  </div>

                  <div>
                    <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-500">
                      Suggested
                    </p>
                    <div className="flex flex-col gap-2">
                      {suggestions.map((suggestion, i) => (
                        <motion.button
                          key={suggestion}
                          type="button"
                          initial={{ opacity: 0, x: 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 24,
                            delay: 0.05 * i,
                          }}
                          whileHover={{
                            x: 3,
                            borderColor: "rgba(16,185,129,0.35)",
                          }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => sendSuggestion(suggestion)}
                          disabled={isStreaming}
                          className="rounded-xl border border-white/[0.07] bg-black/25 px-3 py-2.5 text-left text-xs text-zinc-300 backdrop-blur-md transition-colors hover:text-zinc-100 disabled:opacity-50"
                        >
                          {suggestion}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                messages.map((message, index) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    isStreaming={message.id === streamingId}
                    showRegenerate={
                      message.role === "assistant" &&
                      index === messages.length - 1 &&
                      !isStreaming
                    }
                    onRegenerate={() => void regenerate()}
                  />
                ))
              )}

              {error ? (
                <p className="font-mono text-[11px] text-red-400/90">{error}</p>
              ) : null}
            </div>

            <form
              onSubmit={onSubmit}
              className="relative border-t border-white/[0.07] bg-black/20 p-3 backdrop-blur-xl"
            >
              {messages.length > 0 ? (
                <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
                  {suggestions.slice(0, 3).map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      disabled={isStreaming}
                      onClick={() => sendSuggestion(suggestion)}
                      className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] text-zinc-400 hover:border-emerald-500/30 hover:text-emerald-300 disabled:opacity-40"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="flex items-end gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-2 focus-within:border-emerald-500/35">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={onKeyDown}
                  rows={1}
                  placeholder="Ask about the deployment…"
                  disabled={isStreaming}
                  className="max-h-28 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 disabled:opacity-60"
                />
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="submit"
                    size="icon-sm"
                    disabled={isStreaming || !input.trim()}
                    className="rounded-xl bg-emerald-500 text-zinc-950 hover:bg-emerald-400 disabled:bg-white/10 disabled:text-zinc-500"
                    aria-label="Send message"
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                </motion.div>
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.button
            key="fab"
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            onClick={() => setOpen(true)}
            className="r24-agent-dark-panel pointer-events-auto group relative flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-[#07070a]/80 px-3.5 py-3 shadow-[0_16px_50px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
          >
            <motion.span
              className="absolute inset-0 rounded-2xl bg-emerald-500/10 blur-xl"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2.4, repeat: Infinity }}
            />
            <AssistantAvatar size="sm" />
            <div className="relative pr-1 text-left">
              <p className="text-xs font-semibold text-zinc-100">
                Ask Deployment Engineer
              </p>
              <p className="text-[10px] text-zinc-500">
                Diagnose builds · Docker · prod
              </p>
            </div>
            <Bot className="relative size-4 text-emerald-400/80 opacity-0 transition-opacity group-hover:opacity-100" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
