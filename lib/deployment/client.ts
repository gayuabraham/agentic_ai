import type { DeploymentManifest } from "./types"

/**
 * Client transport for deployment data.
 *
 * Today: GET /api/deployment (mock JSON)
 * Tomorrow: point DEPLOYMENT_API_URL at a real backend — no UI changes needed.
 */
const DEPLOYMENT_API_URL =
  process.env.NEXT_PUBLIC_DEPLOYMENT_API_URL ?? "/api/deployment"

export class DeploymentApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "DeploymentApiError"
    this.status = status
  }
}

export async function fetchDeploymentManifest(
  init?: RequestInit,
): Promise<DeploymentManifest> {
  const response = await fetch(DEPLOYMENT_API_URL, {
    ...init,
    headers: {
      Accept: "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  })

  if (!response.ok) {
    throw new DeploymentApiError(
      `Deployment API failed with ${response.status}`,
      response.status,
    )
  }

  return (await response.json()) as DeploymentManifest
}
