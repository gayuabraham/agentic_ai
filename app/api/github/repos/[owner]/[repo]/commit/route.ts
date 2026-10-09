import { getGitHubAccessToken } from "@/lib/github/auth-token"
import { fetchLatestCommit, GitHubApiError } from "@/lib/github"

export const runtime = "nodejs"

/**
 * GET /api/github/repos/[owner]/[repo]/commit?branch=
 * Lazy commit hydration for the selected repository.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ owner: string; repo: string }> },
) {
  const accessToken = await getGitHubAccessToken()
  if (!accessToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { owner, repo } = await context.params
  const { searchParams } = new URL(request.url)
  const branch = searchParams.get("branch") ?? "main"

  try {
    const commit = await fetchLatestCommit(accessToken, owner, repo, branch)
    return Response.json({ commit })
  } catch (error) {
    if (error instanceof GitHubApiError) {
      return Response.json(
        { error: error.message },
        { status: error.status },
      )
    }
    console.error("[api/github/commit]", error)
    return Response.json({ error: "Failed to load commit" }, { status: 500 })
  }
}
