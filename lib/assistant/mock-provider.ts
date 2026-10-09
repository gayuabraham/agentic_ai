import type { DeploymentChatContext } from "./types"

/**
 * Mock deployment-engineer knowledge base.
 * Keys are matched loosely against the user question.
 */
export const MOCK_ASSISTANT_REPLIES: Record<string, string> = {
  "why did deployment fail": `I reviewed the last rollout for rapid24-platform.

**Root cause:** the production container failed the readiness probe on \`/api/health\` because \`DATABASE_URL\` was missing from the ECS task definition after the last secret rotation.

**Impact**
- Image built successfully
- Deploy rolled out to 2/3 tasks
- Health checks marked the service degraded and rolled back

**Fix applied**
1. Re-injected \`DATABASE_URL\` from the vault
2. Re-ran smoke tests
3. Confirmed latency back under 50ms

You're clear to redeploy when ready.`,

  "explain this docker error": `Docker scan complete for \`rapid24-platform\`.

**Dockerfile**
- Base: \`node:20-alpine\` ✓
- Multi-stage build present ✓
- Non-root user configured ✓

**Findings**
1. Layer cache is healthy — \`npm ci\` is correctly ordered before COPY of source
2. Healthcheck instruction is missing in the final stage (not fatal — ECS probe covers it)
3. Image size ~312MB — within budget

**Verdict:** Docker configuration is valid for production deploy.`,

  "check my build": `The build log shows a TypeScript failure in the App Router bundle:

\`\`\`ts
Type error: Property 'region' does not exist on type 'EnvironmentConfig'
./lib/deploy/config.ts:42:18
\`\`\`

**What it means**
The deploy config type was tightened, but \`region\` is still read from a legacy shape during image build.

**Recommended fix**
1. Extend \`EnvironmentConfig\` with \`region: string\`
2. Or map \`providerRegion\` → \`region\` before the build step

Re-run **Analyze Project** so AI Fixes can patch this automatically.`,

  "how can i optimize deployment": `Here are the highest-leverage optimizations for this Next.js → Docker → ECS path:

1. **Cache Docker layers** — keep \`package-lock.json\` copy + \`npm ci\` before source COPY
2. **Trim image** — multi-stage build already present; drop unused \`devDependencies\` in the final stage
3. **Parallelize checks** — TypeScript + ESLint can run as concurrent CI jobs before image push
4. **Health probe budget** — keep \`/api/health\` under 100ms so rollouts don't stall
5. **Pin digests** — tag images with commit SHA (\`a3f8c21\`) and promote by digest

Want a full optimization checklist for AWS ECS specifically?`,

  "explain health check failures": `Production health snapshot · \`us-east-1\`

| Check | Status | Detail |
|-------|--------|--------|
| HTTP \`/api/health\` | Healthy | 42ms |
| Database | Healthy | 18ms |
| SSL Certificate | Healthy | Valid until 2027-03-15 |
| Smoke Tests | Healthy | 31ms |

If a check fails, verify:
1. Env secrets are injected (\`DATABASE_URL\`, \`NEXT_PUBLIC_API_URL\`)
2. Target group health path matches the container port
3. SSL cert has not expired
4. Smoke tests hit the new revision, not a stale task`,

  "generate deployment summary": `## Deployment Summary — rapid24-ai/rapid24-platform

**Environment:** production · AWS ECS · us-east-1  
**Commit:** \`a3f8c21\` — feat: add autonomous deploy pipeline  
**Branch:** main

### Pipeline
1. Repository connected  
2. Project analyzed (Next.js App Router)  
3. Dependencies resolved  
4. Docker + env validated  
5. Build + AI fixes applied  
6. Image published  
7. Rolled out + health verified  

### Result
**Status:** Production Live  
**URL:** https://app.rapid24.ai  

No blocking errors remain. Ready for traffic.`,
}

const FALLBACK_REPLY = `I'm your Rapid24 Deployment Engineer.

I can help with:
- Diagnosing failed rollouts
- Explaining build / TypeScript errors
- Auditing Docker & env config
- Verifying production health
- Summarizing the latest deploy

Try one of the suggested questions, or describe the deployment symptom you're seeing.`

function normalize(input: string) {
  return input
    .toLowerCase()
    .replace(/[?.!]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function contextPreamble(context?: DeploymentChatContext): string {
  if (!context?.pipelineStage && !context?.interactivePhase) return ""
  const stage = context.pipelineStage ?? context.interactivePhase
  const health = context.healthChecks
    ?.map((h) => `${h.label}=${h.status}`)
    .join(", ")
  return `_Context: stage **${stage}** · progress ${context.buildProgress ?? 0}%${health ? ` · health ${health}` : ""}_\n\n`
}

export function resolveMockReply(
  userMessage: string,
  context?: DeploymentChatContext,
): string {
  const q = normalize(userMessage)
  const prefix = contextPreamble(context)

  if (
    (q.includes("fail") || q.includes("error")) &&
    context?.recentErrors?.length
  ) {
    const errors = context.recentErrors.map((e) => `- ${e}`).join("\n")
    return `${prefix}I inspected the live dashboard state.

**Current stage:** ${context.pipelineStage ?? "unknown"}  
**Status:** ${context.deploymentStatus ?? context.deploymentPhase ?? "unknown"}

**Signals from your session**
${errors}

**What to do next**
1. Confirm the missing env / failing check is present in production secrets
2. Re-run the failing pipeline stage
3. Verify health checks turn green before promoting traffic

Ask me to dig into Docker, build, or health specifically if you want a deeper fix plan.`
  }

  for (const [key, reply] of Object.entries(MOCK_ASSISTANT_REPLIES)) {
    if (q.includes(key) || key.includes(q)) return prefix + reply
  }

  const suggestionHints: Array<{ needle: string; key: string }> = [
    { needle: "fail", key: "why did deployment fail" },
    { needle: "docker", key: "explain this docker error" },
    { needle: "build", key: "check my build" },
    { needle: "optim", key: "how can i optimize deployment" },
    { needle: "health", key: "explain health check failures" },
    { needle: "summary", key: "generate deployment summary" },
  ]

  for (const hint of suggestionHints) {
    if (q.includes(hint.needle)) {
      return prefix + MOCK_ASSISTANT_REPLIES[hint.key]
    }
  }

  return prefix + FALLBACK_REPLY
}

export function isKnownSuggestion(text: string): boolean {
  const q = normalize(text)
  return Object.keys(MOCK_ASSISTANT_REPLIES).some(
    (k) => q.includes(k) || k.includes(q),
  )
}
