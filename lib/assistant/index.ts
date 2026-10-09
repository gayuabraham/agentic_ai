export type {
  AssistantMessage,
  AssistantChatRequest,
  AssistantStreamChunk,
  AssistantSuggestion,
  AssistantProvider,
  DeploymentChatContext,
} from "./types"
export { ASSISTANT_SUGGESTIONS, RAPID24_SYSTEM_PROMPT } from "./types"
export { streamAssistantChat, AssistantApiError } from "./client"
export { createAssistantProvider } from "./provider"
export { buildDeploymentChatContext } from "./deployment-context"
export { formatDeploymentContext, buildSystemMessages } from "./prompt"
