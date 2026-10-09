import type { LucideIcon } from "lucide-react"

export type AgentStatus = "idle" | "thinking" | "analyzing" | "fixing" | "deploying" | "verifying" | "success" | "error"

export type PipelineStepStatus = "pending" | "running" | "completed" | "failed" | "skipped"

export type HealthCheckStatus = "healthy" | "degraded" | "failing" | "pending"

export type DeploymentPhase = "queued" | "building" | "deploying" | "verifying" | "live" | "failed"

export interface RepositoryInfo {
  name: string
  owner: string
  branch: string
  commit: string
  commitMessage: string
  updatedAt: string
}

export interface PipelineStepData {
  id: string
  label: string
  description?: string
  status: PipelineStepStatus
  duration?: string
  icon?: LucideIcon
}

export interface TerminalLine {
  id: string
  timestamp: string
  level: "info" | "success" | "warn" | "error" | "command"
  content: string
}

export type TerminalScriptEntry = {
  id: string
  type: "command" | "success" | "info" | "warning"
  text: string
}

export interface RenderedTerminalLine {
  id: string
  type: TerminalScriptEntry["type"]
  text: string
}

export interface HealthCheckItem {
  id: string
  label: string
  endpoint?: string
  status: HealthCheckStatus
  latency?: string
  message?: string
}

export interface ActivityEvent {
  id: string
  timestamp: string
  title: string
  description?: string
  status: AgentStatus
}

export interface DeploymentInfo {
  id: string
  environment: string
  phase: DeploymentPhase
  url?: string
  startedAt: string
  progress: number
}

export interface ServerMetric {
  id: string
  type: "cpu" | "memory" | "disk" | "instances"
  label: string
  value: number
}

export interface DeploymentEnvironment {
  name: string
  provider: string
  region: string
  cluster: string
}
