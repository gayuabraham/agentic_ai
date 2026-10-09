import { createAssistantProvider } from "@/lib/assistant/provider"
import type { AssistantChatRequest } from "@/lib/assistant/types"

/**
 * Shared NDJSON streaming handler for Rapid24 chat endpoints.
 * Used by POST /api/chat (canonical) and POST /api/assistant (compat).
 */
export async function handleAssistantChatRequest(request: Request) {
  const body = (await request.json()) as AssistantChatRequest
  if (!body?.messages?.length) {
    return Response.json({ error: "messages required" }, { status: 400 })
  }

  const provider = createAssistantProvider()
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of provider.streamReply(body)) {
          controller.enqueue(encoder.encode(`${JSON.stringify(chunk)}\n`))
          // Stop early on provider error chunk
          if (chunk.type === "error") break
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Assistant stream failed"
        controller.enqueue(
          encoder.encode(
            `${JSON.stringify({ type: "error", error: message })}\n`,
          ),
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  })
}
