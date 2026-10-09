import { handleAssistantChatRequest } from "@/lib/assistant/route-handler"

export const runtime = "nodejs"

/**
 * Canonical Rapid24 AI chat endpoint.
 * Streams NDJSON: { type: "token" | "done" | "error", content?, error? }
 *
 * Frontend → hooks/useChat → POST /api/chat → OpenAI (or mock/Gemini).
 * Never expose OPENAI_API_KEY to the client.
 */
export async function POST(request: Request) {
  try {
    return await handleAssistantChatRequest(request)
  } catch (error) {
    console.error("[api/chat]", error)
    return Response.json({ error: "Invalid request" }, { status: 400 })
  }
}
