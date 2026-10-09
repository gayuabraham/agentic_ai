import { handleAssistantChatRequest } from "@/lib/assistant/route-handler"

export const runtime = "nodejs"

/**
 * Compatibility alias for older clients.
 * Prefer POST /api/chat going forward.
 */
export async function POST(request: Request) {
  try {
    return await handleAssistantChatRequest(request)
  } catch (error) {
    console.error("[api/assistant]", error)
    return Response.json({ error: "Invalid request" }, { status: 400 })
  }
}
