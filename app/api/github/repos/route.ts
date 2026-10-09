import { getGitHubAccessToken } from "@/lib/github/auth-token"
import { GitHubApiError, listUserRepositories } from "@/lib/github"

export const runtime = "nodejs"

/**
 * GET /api/github/repos — list repositories for the signed-in GitHub user.
 * Token never leaves the server.
 */
export async function GET() {
  const accessToken = await getGitHubAccessToken()
  if (!accessToken) {
    return Response.json(
      { error: "Unauthorized", code: "NOT_SIGNED_IN" },
      { status: 401 },
    )
  }

  try {
    const repositories = await listUserRepositories(accessToken)
    return Response.json({ repositories })
  } catch (error) {
    if (error instanceof GitHubApiError) {
      return Response.json(
        { error: error.message, code: "GITHUB_API", status: error.status },
        { status: error.status === 403 ? 429 : error.status },
      )
    }
    console.error("[api/github/repos]", error)
    return Response.json({ error: "Failed to load repositories" }, { status: 500 })
  }
}
