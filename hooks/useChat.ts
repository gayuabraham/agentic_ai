"use client"

import { useCallback, useRef, useState } from "react"
import { streamAssistantChat } from "@/lib/assistant"
import { ASSISTANT_SUGGESTIONS } from "@/lib/assistant/types"
import type {
  AssistantMessage,
  DeploymentChatContext,
} from "@/lib/assistant/types"

function uid() {
  return `msg_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`
}

function stamp() {
  return new Date().toISOString()
}

export interface UseChatOptions {
  /** Live dashboard snapshot — refreshed on every send */
  getContext?: () => DeploymentChatContext | undefined
  /** Static context fallback */
  context?: DeploymentChatContext
}

/**
 * Frontend chat hook. Talks only to POST /api/chat.
 * Never calls OpenAI / Gemini directly from the browser.
 */
export function useChat(options: UseChatOptions = {}) {
  const { getContext, context } = options
  const [messages, setMessages] = useState<AssistantMessage[]>([])
  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const messagesRef = useRef(messages)
  messagesRef.current = messages

  const resolveContext = useCallback((): DeploymentChatContext | undefined => {
    return getContext?.() ?? context
  }, [getContext, context])

  const streamToAssistant = useCallback(
    async (
      history: Array<{ role: AssistantMessage["role"]; content: string }>,
      assistantId: string,
    ) => {
      setError(null)
      setIsThinking(true)
      setIsStreaming(true)

      const controller = new AbortController()
      abortRef.current = controller

      try {
        let receivedToken = false

        for await (const chunk of streamAssistantChat(
          {
            messages: history,
            context: resolveContext(),
          },
          { signal: controller.signal },
        )) {
          if (chunk.type === "error") {
            throw new Error(chunk.error ?? "Assistant error")
          }
          if (chunk.type === "token" && chunk.content) {
            if (!receivedToken) {
              receivedToken = true
              setIsThinking(false)
            }
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: m.content + chunk.content }
                  : m,
              ),
            )
          }
          if (chunk.type === "done") break
        }
      } catch (err) {
        if ((err as Error).name === "AbortError") return
        const message =
          err instanceof Error ? err.message : "Failed to reach assistant"
        setError(message)
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId && !m.content
              ? {
                  ...m,
                  content:
                    "I couldn't complete that diagnosis. Check your API key / network and try again.",
                }
              : m,
          ),
        )
      } finally {
        setIsThinking(false)
        setIsStreaming(false)
        abortRef.current = null
      }
    },
    [resolveContext],
  )

  const send = useCallback(
    async (raw: string) => {
      const content = raw.trim()
      if (!content || abortRef.current) return

      const userMessage: AssistantMessage = {
        id: uid(),
        role: "user",
        content,
        createdAt: stamp(),
      }

      const assistantId = uid()
      const placeholder: AssistantMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        createdAt: stamp(),
      }

      const history = [...messagesRef.current, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }))

      setMessages((prev) => [...prev, userMessage, placeholder])
      setInput("")

      await streamToAssistant(history, assistantId)
    },
    [streamToAssistant],
  )

  const sendSuggestion = useCallback(
    (suggestion: string) => {
      void send(suggestion)
    },
    [send],
  )

  /** Re-run the last user turn */
  const regenerate = useCallback(async () => {
    if (abortRef.current) return
    const current = messagesRef.current
    const lastUserIndex = [...current]
      .map((m, i) => ({ m, i }))
      .reverse()
      .find((x) => x.m.role === "user")?.i

    if (lastUserIndex === undefined) return

    const truncated = current.slice(0, lastUserIndex + 1)
    const assistantId = uid()
    const placeholder: AssistantMessage = {
      id: assistantId,
      role: "assistant",
      content: "",
      createdAt: stamp(),
    }

    setMessages([...truncated, placeholder])

    const history = truncated.map((m) => ({
      role: m.role,
      content: m.content,
    }))

    await streamToAssistant(history, assistantId)
  }, [streamToAssistant])

  const stop = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setIsStreaming(false)
    setIsThinking(false)
  }, [])

  const clear = useCallback(() => {
    stop()
    setMessages([])
    setError(null)
    setInput("")
  }, [stop])

  return {
    messages,
    input,
    setInput,
    isStreaming,
    isThinking,
    isLoading: isStreaming || isThinking,
    error,
    suggestions: ASSISTANT_SUGGESTIONS,
    send,
    sendSuggestion,
    regenerate,
    stop,
    clear,
  }
}

export type UseChatReturn = ReturnType<typeof useChat>
