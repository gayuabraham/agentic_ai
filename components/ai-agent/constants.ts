import type {
  ActivityEvent,
  DeploymentInfo,
  HealthCheckItem,
  PipelineStepData,
  RepositoryInfo,
  TerminalLine,
} from "./types"

export const DEMO_REPOSITORY: RepositoryInfo = {
  name: "rapid24-platform",
  owner: "rapid24-ai",
  branch: "main",
  commit: "a3f8c21",
  commitMessage: "feat: add autonomous deploy pipeline",
  updatedAt: "2m ago",
}

export const DEMO_PIPELINE_STEPS: PipelineStepData[] = [
  { id: "1", label: "Push to GitHub", description: "Webhook received", status: "completed", duration: "0.4s" },
  { id: "2", label: "AI Analysis", description: "Scanning build config", status: "completed", duration: "12s" },
  { id: "3", label: "Automatic Fixes", description: "Resolving env drift", status: "running", duration: "8s" },
  { id: "4", label: "Deployment", description: "Rolling out to production", status: "pending" },
  { id: "5", label: "Production Live", description: "Health verification", status: "pending" },
]

export const DEMO_TERMINAL_LINES: TerminalLine[] = [
  { id: "1", timestamp: "14:32:01", level: "command", content: "rapid24 analyze --repo rapid24-ai/rapid24-platform" },
  { id: "2", timestamp: "14:32:02", level: "info", content: "Connected to GitHub · branch main @ a3f8c21" },
  { id: "3", timestamp: "14:32:04", level: "warn", content: "Detected missing DATABASE_URL in production env" },
  { id: "4", timestamp: "14:32:06", level: "info", content: "Applying automatic fix: inject secret from vault" },
  { id: "5", timestamp: "14:32:09", level: "success", content: "Build analysis complete · 2 issues resolved" },
  { id: "6", timestamp: "14:32:11", level: "command", content: "rapid24 deploy --env production --verify" },
  { id: "7", timestamp: "14:32:14", level: "info", content: "Deploying container image to us-east-1..." },
]

export const DEMO_DEPLOYMENT: DeploymentInfo = {
  id: "dep_8x2k9m",
  environment: "production",
  phase: "deploying",
  url: "https://app.rapid24.ai",
  startedAt: "14:32:11",
  progress: 68,
}

export const DEMO_HEALTH_CHECKS: HealthCheckItem[] = [
  { id: "1", label: "HTTP Health", endpoint: "/api/health", status: "healthy", latency: "42ms" },
  { id: "2", label: "Database", endpoint: "postgres://...", status: "healthy", latency: "18ms" },
  { id: "3", label: "SSL Certificate", status: "healthy", message: "Valid until 2027-03-15" },
  { id: "4", label: "Smoke Tests", endpoint: "/api/status", status: "pending", message: "Awaiting deploy" },
]

export const DEMO_ACTIVITY: ActivityEvent[] = [
  { id: "1", timestamp: "14:31:58", title: "Repository connected", description: "rapid24-ai/rapid24-platform", status: "success" },
  { id: "2", timestamp: "14:32:02", title: "Build analysis started", description: "Scanning Dockerfile & CI config", status: "analyzing" },
  { id: "3", timestamp: "14:32:06", title: "Environment validated", description: "Fixed missing DATABASE_URL", status: "fixing" },
  { id: "4", timestamp: "14:32:11", title: "Deployment initiated", description: "production · us-east-1", status: "deploying" },
]

export const DEMO_ENVIRONMENT = {
  name: "production",
  provider: "AWS ECS",
  region: "us-east-1",
  cluster: "rapid24-prod-cluster",
}

export const DEMO_SERVER_METRICS = [
  { id: "1", type: "cpu" as const, label: "CPU Usage", value: 34 },
  { id: "2", type: "memory" as const, label: "Memory", value: 58 },
  { id: "3", type: "disk" as const, label: "Disk I/O", value: 22 },
  { id: "4", type: "instances" as const, label: "Instances", value: 72 },
]

export const AGENT_PANEL_CLASS =
  "relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#060608]/90 text-zinc-100 shadow-[0_24px_80px_rgba(0,0,0,0.65)] backdrop-blur-3xl"

export const AGENT_SURFACE_CLASS =
  "bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl"

export const AGENT_MUTED_TEXT = "text-zinc-500"

export const AGENT_ACCENT = "text-emerald-400"
