/**
 * Assistant / chat API contract.
 * UI talks to hooks/useChat → POST /api/chat → provider (OpenAI | mock).
 */

export type AssistantRole = "user" | "assistant" | "system"

export interface AssistantMessage {
  id: string
  role: AssistantRole
  content: string
  createdAt: string
}

/** Live deployment snapshot sent with every chat turn */
export interface DeploymentChatContext {
  repository?: string
  owner?: string
  branch?: string
  commit?: string
  commitMessage?: string
  language?: string
  repositoryUrl?: string
  visibility?: "public" | "private"
  environment?: string
  region?: string
  interactivePhase?: string
  pipelineStage?: string
  pipelineStageDescription?: string
  deploymentStatus?: string
  deploymentPhase?: string
  buildProgress?: number
  isComplete?: boolean
  healthChecks?: Array<{
    label: string
    status: string
    latency?: string
    message?: string
  }>
  terminalLogs?: string[]
  recentErrors?: string[]
  deploymentUrl?: string
  /** Repository Analysis Engine snapshot */
  analysisScore?: number
  analysisFramework?: string
  analysisPackageManager?: string
  analysisFindings?: string[]
  analysisRecommendations?: string[]
  analysisDocker?: string
  analysisCicd?: string
  analysisHealth?: string
  analysisEnvironment?: string
  analysisSecurity?: string
  analysisNodeVersion?: string
}

export interface AssistantChatRequest {
  messages: Array<{ role: AssistantRole; content: string }>
  /** Current Rapid24 deployment dashboard state for grounded answers */
  context?: DeploymentChatContext
}

export interface AssistantStreamChunk {
  type: "token" | "done" | "error"
  content?: string
  error?: string
}

export interface AssistantProvider {
  streamReply(
    request: AssistantChatRequest,
  ): AsyncGenerator<AssistantStreamChunk, void, unknown>
}

export const ASSISTANT_SUGGESTIONS = [
  "Why did deployment fail?",
  "Explain this Docker error.",
  "Check my build.",
  "How can I optimize deployment?",
  "Explain health check failures.",
  "Generate deployment summary.",
] as const

export type AssistantSuggestion = (typeof ASSISTANT_SUGGESTIONS)[number]

export const RAPID24_SYSTEM_PROMPT = `You are Rapid24.ai, an autonomous AI DevOps Engineer.

Your job is to help developers solve deployment problems.

You specialize in:

Next.js
React
Docker
GitHub
GitHub Actions
CI/CD
AWS
Azure
Vercel
Environment Variables
Node.js
TypeScript
Build Errors
Infrastructure
Production Deployments

Always explain problems clearly.

Suggest fixes.

Be concise.

Prefer actionable steps.

Never act like a generic chatbot.

When deployment context is provided, use it to ground your answer in the user's actual pipeline stage, logs, health checks, and errors.
Format responses with clear markdown when helpful (headings, bullets, fenced code blocks).`
