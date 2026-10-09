import type {
  ActivityEvent,
  DeploymentInfo,
  HealthCheckItem,
  PipelineStepData,
  RepositoryInfo,
  TerminalLine,
  TerminalScriptEntry,
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

export interface PipelineStageDefinition {
  id: string
  label: string
  description: string
  /** approximate ms the stage stays "running" before completing */
  duration: number
}

export const DEPLOYMENT_PIPELINE_STAGES: PipelineStageDefinition[] = [
  { id: "connected", label: "Repository Connected", description: "Linked rapid24-ai/rapid24-platform", duration: 1600 },
  { id: "reading", label: "Reading Repository", description: "Cloning source · branch main", duration: 2000 },
  { id: "analyzing", label: "Analyzing Project", description: "Detecting framework & structure", duration: 2400 },
  { id: "dependencies", label: "Checking Dependencies", description: "Resolving package graph", duration: 2200 },
  { id: "docker", label: "Scanning Docker Configuration", description: "Validating Dockerfile & layers", duration: 2400 },
  { id: "env", label: "Checking Environment Variables", description: "Verifying required secrets", duration: 2000 },
  { id: "build", label: "Running Build", description: "Compiling production bundle", duration: 3000 },
  { id: "detect", label: "Detecting Build Errors", description: "Parsing build output", duration: 2200 },
  { id: "fixes", label: "Applying AI Fixes", description: "Autonomously patching failures", duration: 3000 },
  { id: "tests", label: "Running Tests", description: "Executing integration suite", duration: 2800 },
  { id: "image", label: "Building Docker Image", description: "Packaging container image", duration: 3000 },
  { id: "deploying", label: "Deploying", description: "Rolling out to us-east-1", duration: 2800 },
  { id: "health", label: "Health Checks", description: "Verifying endpoints & uptime", duration: 2400 },
  { id: "live", label: "Production Live", description: "Deployment verified & serving", duration: 3200 },
]

export const TERMINAL_DEPLOYMENT_SCRIPT: TerminalScriptEntry[] = [
  { id: "t1", type: "command", text: "git clone git@github.com:rapid24-ai/rapid24-platform.git" },
  { id: "t2", type: "success", text: "Repository cloned" },
  { id: "t3", type: "info", text: "Reading package.json" },
  { id: "t4", type: "success", text: "Next.js detected" },
  { id: "t5", type: "command", text: "npm ci --omit=dev" },
  { id: "t6", type: "info", text: "Installing dependencies" },
  { id: "t7", type: "info", text: "Running TypeScript" },
  { id: "t8", type: "info", text: "Running ESLint" },
  { id: "t9", type: "warning", text: "2 warnings in legacy routes" },
  { id: "t10", type: "info", text: "Building application" },
  { id: "t11", type: "success", text: "Docker image created" },
  { id: "t12", type: "info", text: "Pushing image" },
  { id: "t13", type: "info", text: "Deploying" },
  { id: "t14", type: "info", text: "Health checks" },
  { id: "t15", type: "success", text: "Production Live" },
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
  "relative overflow-hidden rounded-[var(--r24-agent-radius-lg)] border border-[var(--r24-agent-panel-border)] bg-[var(--r24-agent-panel)] text-[var(--r24-agent-fg)] shadow-[var(--r24-agent-shadow)] backdrop-blur-[var(--r24-agent-blur)]"

export const AGENT_SURFACE_CLASS =
  "rounded-[var(--r24-agent-radius)] bg-[var(--r24-agent-surface)] border border-[var(--r24-agent-surface-border)] backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]"

export const AGENT_MUTED_TEXT = "text-[var(--r24-agent-muted)]"

export const AGENT_ACCENT = "text-[var(--r24-agent-accent)]"
