import type { PipelineStepStatus } from "./types"
import type { SimulatedStage } from "./useDeploymentAgent"

export interface PipelineNodeDefinition {
  id: string
  label: string
  /** Underlying deployment.json step ids this visual node aggregates */
  stepIds: string[]
  description: string
  aiExplanation: string
}

/** Condensed interactive pipeline — maps onto full deployment steps */
export const PIPELINE_NODES: PipelineNodeDefinition[] = [
  {
    id: "github",
    label: "GitHub",
    stepIds: ["connected"],
    description: "Authenticate and clone the linked repository from GitHub.",
    aiExplanation:
      "Securely connecting to the remote origin and verifying branch integrity before any local analysis begins.",
  },
  {
    id: "repository",
    label: "Repository",
    stepIds: ["reading"],
    description: "Read project manifests and source structure on the active branch.",
    aiExplanation:
      "Parsing package.json and workspace layout to understand the application surface area.",
  },
  {
    id: "analysis",
    label: "Analysis",
    stepIds: ["analyzing", "dependencies", "docker", "env"],
    description: "Detect framework, dependencies, Docker config, and environment readiness.",
    aiExplanation:
      "Mapping the dependency graph, validating container config, and checking production secrets for drift.",
  },
  {
    id: "build",
    label: "Build",
    stepIds: ["build", "detect", "fixes", "tests"],
    description: "Typecheck, lint, apply AI fixes, and compile the production bundle.",
    aiExplanation:
      "Running TypeScript and ESLint gates, auto-resolving safe issues, then producing an optimized Next.js build.",
  },
  {
    id: "docker",
    label: "Docker",
    stepIds: ["image"],
    description: "Package the application into a versioned container image.",
    aiExplanation:
      "Building a multi-stage image tagged to the current commit for reproducible deploys.",
  },
  {
    id: "deploy",
    label: "Deploy",
    stepIds: ["deploying"],
    description: "Push the image and roll out a new service revision.",
    aiExplanation:
      "Publishing to the registry and forcing a controlled ECS rollout in the target region.",
  },
  {
    id: "health",
    label: "Health",
    stepIds: ["health"],
    description: "Verify HTTP, database, SSL, and smoke checks after rollout.",
    aiExplanation:
      "Confirming every critical probe is green before promoting traffic to the new revision.",
  },
  {
    id: "production",
    label: "Production",
    stepIds: ["live"],
    description: "Mark the release live and serving production traffic.",
    aiExplanation:
      "Deployment verified — the new revision is healthy and receiving live requests.",
  },
]

export interface InteractivePipelineNode extends PipelineNodeDefinition {
  status: PipelineStepStatus
  /** Aggregate scheduled duration (ms) from underlying steps */
  durationMs: number
  /** Formatted execution time when completed or running */
  executionTime?: string
}

function formatDuration(ms: number) {
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

/**
 * Collapse detailed deployment stages into the 8 interactive pipeline nodes.
 */
export function derivePipelineNodes(stages: SimulatedStage[]): InteractivePipelineNode[] {
  const byId = new Map(stages.map((s) => [s.id, s]))

  return PIPELINE_NODES.map((node) => {
    const members = node.stepIds
      .map((id) => byId.get(id))
      .filter((s): s is SimulatedStage => Boolean(s))

    const durationMs = members.reduce((sum, s) => sum + s.duration, 0)
    const anyFailed = members.some((s) => s.status === "failed")
    const anyRunning = members.some((s) => s.status === "running")
    const allCompleted =
      members.length > 0 && members.every((s) => s.status === "completed")
    const anyCompleted = members.some((s) => s.status === "completed")

    let status: PipelineStepStatus = "pending"
    if (anyFailed) status = "failed"
    else if (anyRunning) status = "running"
    else if (allCompleted) status = "completed"
    else if (anyCompleted) status = "running" // mid-group progress

    const completedMs = members
      .filter((s) => s.status === "completed")
      .reduce((sum, s) => sum + s.duration, 0)

    const executionTime =
      status === "completed"
        ? formatDuration(durationMs || completedMs)
        : status === "running" && completedMs > 0
          ? formatDuration(completedMs)
          : status === "running"
            ? formatDuration(durationMs)
            : undefined

    return {
      ...node,
      status,
      durationMs,
      executionTime,
    }
  })
}

export function statusLabel(status: PipelineStepStatus) {
  switch (status) {
    case "completed":
      return "Completed"
    case "running":
      return "In progress"
    case "failed":
      return "Failed"
    case "skipped":
      return "Skipped"
    default:
      return "Pending"
  }
}
