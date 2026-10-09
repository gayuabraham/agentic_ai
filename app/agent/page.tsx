"use client"

import dynamic from "next/dynamic"
import { useCallback } from "react"
import { AgentDecor } from "@/components/ai-agent/AgentDecor"
import { AgentWindow } from "@/components/ai-agent"
import { useDeploymentAgent } from "@/components/ai-agent/useDeploymentAgent"
import { buildDeploymentChatContext } from "@/lib/assistant/deployment-context"
import {
  useRepositoryAnalysisState,
  useSelectedGitHubRepository,
} from "@/stores/repository-store"

const AssistantPanel = dynamic(
  () => import("@/components/ai-assistant").then((mod) => mod.AssistantPanel),
  { ssr: false },
)

export default function AgentPage() {
  const agent = useDeploymentAgent()
  const githubRepo = useSelectedGitHubRepository()
  const { analysis } = useRepositoryAnalysisState()

  const getDeploymentContext = useCallback(
    () => buildDeploymentChatContext(agent, githubRepo, analysis),
    [agent, githubRepo, analysis],
  )

  return (
    <div
      data-r24-agent
      className="relative min-h-dvh bg-[var(--r24-agent-bg)] text-[var(--r24-agent-fg)]"
    >
      <div className="pointer-events-none fixed inset-0 r24-agent-backdrop" aria-hidden />
      <AgentDecor />

      <div className="relative mx-auto w-full max-w-[1520px] px-3 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-8">
        <AgentWindow agent={agent} />
      </div>

      <AssistantPanel getDeploymentContext={getDeploymentContext} />
    </div>
  )
}
