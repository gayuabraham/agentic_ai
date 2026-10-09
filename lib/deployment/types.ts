/**
 * Deployment API contract.
 * Swap the client transport later — these shapes stay stable.
 */

export type AgentStatus =
  | "idle"
  | "thinking"
  | "analyzing"
  | "fixing"
  | "deploying"
  | "verifying"
  | "success"
  | "error"

export type DeploymentPhase =
  | "queued"
  | "building"
  | "deploying"
  | "verifying"
  | "live"
  | "failed"

export type TerminalLineType = "command" | "success" | "info" | "warning"

export interface DeploymentTerminalLine {
  type: TerminalLineType
  text: string
}

export interface DeploymentStep {
  id: string
  label: string
  description: string
  durationMs: number
  agentStatus: AgentStatus
  phase: DeploymentPhase
  terminal: DeploymentTerminalLine[]
}

export interface DeploymentRepository {
  name: string
  owner: string
  branch: string
  commit: string
  commitMessage: string
  updatedAt: string
}

export interface DeploymentEnvironment {
  name: string
  provider: string
  region: string
  cluster: string
}

export interface DeploymentMeta {
  id: string
  environment: string
  url: string
  startedAt: string
}

export interface MetricBaseline {
  id: string
  type: "cpu" | "memory" | "disk" | "instances"
  label: string
  value: number
}

export interface HealthCheckTemplate {
  id: string
  label: string
  endpoint?: string
  unlockAfterStepId: string
  healthyLatency?: string
  healthyMessage?: string
}

export interface DeploymentSimulationConfig {
  autoStart: boolean
  loop: boolean
  loopDelayMs: number
  metricTickMs: number
}

/** Full mock/API payload returned by GET /api/deployment */
export interface DeploymentManifest {
  version: number
  simulation: DeploymentSimulationConfig
  repository: DeploymentRepository
  environment: DeploymentEnvironment
  deployment: DeploymentMeta
  aiThoughts: string[]
  metricsBaseline: MetricBaseline[]
  healthChecks: HealthCheckTemplate[]
  steps: DeploymentStep[]
}
