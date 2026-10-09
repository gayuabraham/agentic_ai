import type { AssistantChatRequest, AssistantStreamChunk } from "./types"

/**
 * Client transport for the deployment assistant.
 * Default: POST /api/chat (server holds the LLM key).
 */
const CHAT_API_URL = process.env.NEXT_PUBLIC_CHAT_API_URL ?? "/api/chat"

export class AssistantApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "AssistantApiError"
    this.status = status
  }
}

/**
 * Reads an NDJSON stream from the chat API.
 */
export async function* streamAssistantChat(
  request: AssistantChatRequest,
  init?: RequestInit,
): AsyncGenerator<AssistantStreamChunk, void, unknown> {
  const response = await fetch(CHAT_API_URL, {
    method: "POST",
    ...init,
    headers: {
      Accept: "application/x-ndjson",
      "Content-Type": "application/json",
      ...init?.headers,
    },
    body: JSON.stringify(request),
  })

  if (!response.ok || !response.body) {
    let detail = `Chat API failed with ${response.status}`
    try {
      const json = (await response.json()) as { error?: string }
      if (json.error) detail = json.error
    } catch {
      // ignore
    }
    throw new AssistantApiError(detail, response.status)
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""

  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    let newlineIndex = buffer.indexOf("\n")
    while (newlineIndex >= 0) {
      const line = buffer.slice(0, newlineIndex).trim()
      buffer = buffer.slice(newlineIndex + 1)
      if (line) {
        yield JSON.parse(line) as AssistantStreamChunk
      }
      newlineIndex = buffer.indexOf("\n")
    }
  }

  const rest = buffer.trim()
  if (rest) {
    yield JSON.parse(rest) as AssistantStreamChunk
  }
}
