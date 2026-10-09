import { getGitHubAccessToken } from "@/lib/github/auth-token"
import { GitHubApiError } from "@/lib/github/client"
import { runRepositoryAnalysis } from "@/lib/github/analysis"

export const runtime = "nodejs"

/**
 * GET /api/github/repos/[owner]/[repo]/analyze
 *
 * Query:
 *   branch?=main
 *   enrich?=1|0  (default 0 — fast deterministic report; set 1 for OpenAI polish)
 *   commit?=sha
 *   message?=commit message
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ owner: string; repo: string }> },
) {
  const accessToken = await getGitHubAccessToken()
  if (!accessToken) {
    return Response.json(
      { error: "Unauthorized", code: "NOT_SIGNED_IN" },
      { status: 401 },
    )
  }

  const { owner, repo } = await context.params
  const { searchParams } = new URL(request.url)
  const branch = searchParams.get("branch") ?? undefined
  const enrich = searchParams.get("enrich") === "1"
  const commitSha = searchParams.get("commit")
  const commitMessage = searchParams.get("message")

  try {
    const analysis = await runRepositoryAnalysis({
      accessToken,
      owner,
      repo,
      branch,
      commitSha,
      commitMessage,
      enrichWithAi: enrich,
    })
    return Response.json({ analysis })
  } catch (error) {
    if (error instanceof GitHubApiError) {
      return Response.json(
        { error: error.message, code: "GITHUB_API", status: error.status },
        { status: error.status === 403 ? 429 : error.status },
      )
    }
    console.error("[api/github/analyze]", error)
    return Response.json(
      { error: "Failed to analyze repository" },
      { status: 500 },
    )
  }
}
