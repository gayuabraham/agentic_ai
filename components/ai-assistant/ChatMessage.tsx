"use client"

import { motion } from "framer-motion"
import { Check, Copy, RefreshCw } from "lucide-react"
import { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { cn } from "@/lib/utils"
import { AssistantAvatar } from "./AssistantAvatar"
import { TypingIndicator } from "./TypingIndicator"
import type { AssistantMessage } from "@/lib/assistant/types"

interface ChatMessageProps {
  message: AssistantMessage
  isStreaming?: boolean
  onRegenerate?: () => void
  showRegenerate?: boolean
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

function CodeBlock({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const code = String(children).replace(/\n$/, "")
  const language = /language-(\w+)/.exec(className ?? "")?.[1]
  const [copied, setCopied] = useState(false)

  return (
    <div className="group/code relative my-2 overflow-hidden rounded-xl border border-white/10 bg-black/50">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-1.5">
        <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
          {language ?? "code"}
        </span>
        <button
          type="button"
          onClick={async () => {
            const ok = await copyText(code)
            if (ok) {
              setCopied(true)
              setTimeout(() => setCopied(false), 1400)
            }
          }}
          className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-zinc-200"
        >
          {copied ? (
            <>
              <Check className="size-3 text-emerald-400" />
              Copied
            </>
          ) : (
            <>
              <Copy className="size-3" />
              Copy
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 font-mono text-[12px] leading-relaxed text-zinc-200">
        <code>{code}</code>
      </pre>
    </div>
  )
}

function MarkdownBody({ content }: { content: string }) {
  return (
    <div className="prose-invert max-w-none text-sm leading-relaxed text-zinc-200 [&_a]:text-cyan-300 [&_a]:underline-offset-2 hover:[&_a]:underline [&_li]:my-0.5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-4 [&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0 [&_strong]:font-semibold [&_strong]:text-zinc-50 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-4">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const isBlock = Boolean(className) || String(children).includes("\n")
            if (!isBlock) {
              return (
                <code
                  className="rounded bg-white/[0.08] px-1 py-0.5 font-mono text-[12px] text-emerald-200"
                  {...props}
                >
                  {children}
                </code>
              )
            }
            return <CodeBlock className={className}>{children}</CodeBlock>
          },
          pre({ children }) {
            return <>{children}</>
          },
          table({ children }) {
            return (
              <div className="my-2 overflow-x-auto rounded-lg border border-white/10">
                <table className="w-full text-left text-[12px]">{children}</table>
              </div>
            )
          },
          th({ children }) {
            return (
              <th className="border-b border-white/10 bg-white/[0.04] px-2 py-1.5 font-medium text-zinc-300">
                {children}
              </th>
            )
          },
          td({ children }) {
            return (
              <td className="border-b border-white/[0.05] px-2 py-1.5 text-zinc-400">
                {children}
              </td>
            )
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

export function ChatMessage({
  message,
  isStreaming = false,
  onRegenerate,
  showRegenerate = false,
}: ChatMessageProps) {
  const isUser = message.role === "user"
  const [copied, setCopied] = useState(false)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}
    >
      {!isUser ? (
        <AssistantAvatar size="sm" thinking={isStreaming && !message.content} />
      ) : null}

      <div className={cn("group/msg max-w-[88%]", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-2xl border px-3.5 py-2.5 text-sm leading-relaxed",
            isUser
              ? "border-emerald-500/25 bg-emerald-500/15 text-emerald-50"
              : "border-white/[0.08] bg-white/[0.04] text-zinc-200 backdrop-blur-xl",
          )}
        >
          {message.role === "assistant" && !message.content && isStreaming ? (
            <TypingIndicator />
          ) : isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : (
            <MarkdownBody content={message.content} />
          )}
          {isStreaming && message.content ? (
            <motion.span
              className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] bg-emerald-400 align-baseline"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
            />
          ) : null}
        </div>

        {!isStreaming && message.content ? (
          <div
            className={cn(
              "mt-1 flex gap-1 opacity-0 transition-opacity group-hover/msg:opacity-100",
              isUser ? "justify-end" : "justify-start",
            )}
          >
            <button
              type="button"
              onClick={async () => {
                const ok = await copyText(message.content)
                if (ok) {
                  setCopied(true)
                  setTimeout(() => setCopied(false), 1400)
                }
              }}
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-300"
            >
              {copied ? (
                <Check className="size-3 text-emerald-400" />
              ) : (
                <Copy className="size-3" />
              )}
              {copied ? "Copied" : "Copy"}
            </button>
            {showRegenerate && onRegenerate ? (
              <button
                type="button"
                onClick={onRegenerate}
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-300"
              >
                <RefreshCw className="size-3" />
                Regenerate
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </motion.div>
  )
}
