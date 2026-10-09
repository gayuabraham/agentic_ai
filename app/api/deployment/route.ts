import { NextResponse } from "next/server"
import { loadDeploymentManifest } from "@/lib/deployment/repository"

/**
 * Fake backend endpoint.
 * Replace the body of this handler with a real service call later —
 * the client contract (DeploymentManifest) stays the same.
 */
export async function GET() {
  try {
    // Simulate network latency so the UI practices async loading
    await new Promise((resolve) => setTimeout(resolve, 280))
    const manifest = await loadDeploymentManifest()
    return NextResponse.json(manifest, {
      headers: {
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("[api/deployment]", error)
    return NextResponse.json(
      { error: "Failed to load deployment manifest" },
      { status: 500 },
    )
  }
}
