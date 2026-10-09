import { readFile } from "fs/promises"
import path from "path"
import type { DeploymentManifest } from "./types"

/**
 * Server-side loader for the mock deployment manifest.
 * Tomorrow this can read from a DB / remote config instead of a JSON file.
 */
export async function loadDeploymentManifest(): Promise<DeploymentManifest> {
  const filePath = path.join(process.cwd(), "data", "deployment.json")
  const raw = await readFile(filePath, "utf-8")
  return JSON.parse(raw) as DeploymentManifest
}
