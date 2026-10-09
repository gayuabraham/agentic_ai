import OpenAI from "openai"
import { buildSystemMessages } from "./prompt"
import { resolveMockReply } from "./mock-provider"
import type {
  AssistantChatRequest,
  AssistantProvider,
  AssistantStreamChunk,
} from "./types"

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Streams a mock deployment-engineer reply token-by-token.
 * Used when OPENAI_API_KEY is missing so the dashboard still works offline.
 */
export class MockAssistantProvider implements AssistantProvider {
  async *streamReply(
    request: AssistantChatRequest,
  ): AsyncGenerator<AssistantStreamChunk, void, unknown> {
    const lastUser = [...request.messages].reverse().find((m) => m.role === "user")
    const full = resolveMockReply(lastUser?.content ?? "", request.context)

    await sleep(280 + Math.random() * 220)

    const parts = full.split(/(\s+)/)
    for (const part of parts) {
      if (!part) continue
      yield { type: "token", content: part }
      const pace =
        part.length > 8 ? 16 + Math.random() * 20 : 8 + Math.random() * 14
      await sleep(pace)
    }

    yield { type: "done" }
  }
}

/**
 * Real OpenAI Chat Completions streaming provider.
 * API key stays server-side only (OPENAI_API_KEY).
 */
export class OpenAIAssistantProvider implements AssistantProvider {
  private client: OpenAI

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey })
  }

  async *streamReply(
    request: AssistantChatRequest,
  ): AsyncGenerator<AssistantStreamChunk, void, unknown> {
    const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini"
    const history = request.messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      }))

    try {
      const stream = await this.client.chat.completions.create({
        model,
        stream: true,
        temperature: 0.35,
        messages: [...buildSystemMessages(request.context), ...history],
      })

      for await (const chunk of stream) {
        const token = chunk.choices[0]?.delta?.content
        if (token) {
          yield { type: "token", content: token }
        }
      }

      yield { type: "done" }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "OpenAI request failed"
      yield { type: "error", error: message }
    }
  }
}

/**
 * Optional Google Gemini streaming via REST (no extra SDK required).
 * Enabled with ASSISTANT_PROVIDER=gemini and GEMINI_API_KEY.
 */
export class GeminiAssistantProvider implements AssistantProvider {
  constructor(private readonly apiKey: string) {}

  async *streamReply(
    request: AssistantChatRequest,
  ): AsyncGenerator<AssistantStreamChunk, void, unknown> {
    const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash"
    const system = buildSystemMessages(request.context)
      .map((m) => m.content)
      .join("\n\n")

    const contents = request.messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }))

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${this.apiKey}`

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents,
          generationConfig: { temperature: 0.35 },
        }),
      })

      if (!response.ok || !response.body) {
        const detail = await response.text().catch(() => "")
        yield {
          type: "error",
          error: `Gemini error ${response.status}: ${detail.slice(0, 200)}`,
        }
        return
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })

        const events = buffer.split("\n")
        buffer = events.pop() ?? ""

        for (const line of events) {
          const trimmed = line.trim()
          if (!trimmed.startsWith("data:")) continue
          const payload = trimmed.slice(5).trim()
          if (!payload || payload === "[DONE]") continue
          try {
            const json = JSON.parse(payload) as {
              candidates?: Array<{
                content?: { parts?: Array<{ text?: string }> }
              }>
            }
            const text = json.candidates?.[0]?.content?.parts
              ?.map((p) => p.text ?? "")
              .join("")
            if (text) yield { type: "token", content: text }
          } catch {
            // ignore malformed SSE lines
          }
        }
      }

      yield { type: "done" }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Gemini request failed"
      yield { type: "error", error: message }
    }
  }
}

/**
 * Prefer real LLM when keys exist; otherwise mock keeps local demos working.
 *
 * ASSISTANT_PROVIDER=openai | gemini | mock | auto (default)
 */
export function createAssistantProvider(): AssistantProvider {
  const mode = (process.env.ASSISTANT_PROVIDER ?? "auto").toLowerCase()
  const openaiKey = process.env.OPENAI_API_KEY
  const geminiKey = process.env.GEMINI_API_KEY

  if (mode === "mock") {
    return new MockAssistantProvider()
  }

  if (mode === "openai" || (mode === "auto" && openaiKey)) {
    if (!openaiKey) {
      console.warn(
        "[assistant] ASSISTANT_PROVIDER=openai but OPENAI_API_KEY is missing — using mock.",
      )
      return new MockAssistantProvider()
    }
    return new OpenAIAssistantProvider(openaiKey)
  }

  if (mode === "gemini" || (mode === "auto" && !openaiKey && geminiKey)) {
    if (!geminiKey) {
      console.warn(
        "[assistant] ASSISTANT_PROVIDER=gemini but GEMINI_API_KEY is missing — using mock.",
      )
      return new MockAssistantProvider()
    }
    return new GeminiAssistantProvider(geminiKey)
  }

  return new MockAssistantProvider()
}
