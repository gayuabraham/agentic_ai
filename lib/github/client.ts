import type { GitHubRepository } from "./types"

/** Raw GitHub REST list-repos payload (subset). */
interface GhRepoRaw {
  id: number
  name: string
  full_name: string
  description: string | null
  private: boolean
  html_url: string
  clone_url: string
  language: string | null
  stargazers_count: number
  forks_count: number
  default_branch: string
  updated_at: string
  pushed_at: string | null
  owner: {
    id: number
    login: string
    avatar_url: string
    html_url: string
  }
}

interface GhCommitRaw {
  sha: string
  commit: {
    message: string
    author?: { date?: string }
  }
}

export class GitHubApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "GitHubApiError"
    this.status = status
  }
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`GitHub request timed out after ${ms}ms`)), ms)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (err) => {
        clearTimeout(timer)
        reject(err)
      },
    )
  })
}

async function githubFetch<T>(
  path: string,
  accessToken: string,
  init?: RequestInit,
): Promise<T> {
  const response = await withTimeout(
    fetch(`https://api.github.com${path}`, {
      ...init,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${accessToken}`,
        "X-GitHub-Api-Version": "2022-11-28",
        ...init?.headers,
      },
      next: { revalidate: 0 },
    }),
    15_000,
  )

  if (response.status === 401 || response.status === 403) {
    const body = await response.text().catch(() => "")
    const rateLimited = response.headers.get("x-ratelimit-remaining") === "0"
    throw new GitHubApiError(
      rateLimited
        ? "GitHub API rate limit exceeded. Try again shortly."
        : body.includes("Bad credentials")
          ? "GitHub session expired. Please sign in again."
          : `GitHub API denied access (${response.status}).`,
      response.status,
    )
  }

  if (!response.ok) {
    throw new GitHubApiError(
      `GitHub API error (${response.status})`,
      response.status,
    )
  }

  return response.json() as Promise<T>
}

export function mapGitHubRepository(raw: GhRepoRaw): GitHubRepository {
  return {
    id: raw.id,
    name: raw.name,
    fullName: raw.full_name,
    description: raw.description,
    owner: {
      id: raw.owner.id,
      login: raw.owner.login,
      avatarUrl: raw.owner.avatar_url,
      htmlUrl: raw.owner.html_url,
    },
    defaultBranch: raw.default_branch,
    private: raw.private,
    language: raw.language,
    stargazersCount: raw.stargazers_count,
    forksCount: raw.forks_count,
    updatedAt: raw.updated_at,
    pushedAt: raw.pushed_at,
    htmlUrl: raw.html_url,
    cloneUrl: raw.clone_url,
  }
}

/**
 * List repositories for the authenticated user (affiliation: owner + collaborator).
 */
export async function listUserRepositories(
  accessToken: string,
): Promise<GitHubRepository[]> {
  const pages: GitHubRepository[] = []
  // Cap pages to keep the selector snappy; users with huge orgs can paginate later
  for (let page = 1; page <= 3; page += 1) {
    const batch = await githubFetch<GhRepoRaw[]>(
      `/user/repos?per_page=100&page=${page}&sort=updated&affiliation=owner,collaborator,organization_member`,
      accessToken,
    )
    pages.push(...batch.map(mapGitHubRepository))
    if (batch.length < 100) break
  }
  return pages
}

/**
 * Lazy-load latest commit on the default branch (called after selection).
 */
export async function fetchLatestCommit(
  accessToken: string,
  owner: string,
  repo: string,
  branch: string,
): Promise<{ sha: string; message: string; date: string | null }> {
  const data = await githubFetch<GhCommitRaw>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits/${encodeURIComponent(branch)}`,
    accessToken,
  )
  return {
    sha: data.sha,
    message: data.commit.message.split("\n")[0] ?? data.commit.message,
    date: data.commit.author?.date ?? null,
  }
}

interface GhRepoMetaRaw {
  size: number
  default_branch: string
  private: boolean
  language: string | null
  full_name: string
  name: string
  owner: { login: string }
}

interface GhTreeRaw {
  tree: Array<{ path: string; type: string; size?: number }>
  truncated: boolean
}

interface GhContentFileRaw {
  type: string
  encoding?: string
  content?: string
  size?: number
  name: string
  path: string
}

/** Repository metadata (size, etc.) */
export async function fetchRepositoryMeta(
  accessToken: string,
  owner: string,
  repo: string,
): Promise<{
  sizeKb: number
  defaultBranch: string
  private: boolean
  language: string | null
  fullName: string
  name: string
  owner: string
}> {
  const data = await githubFetch<GhRepoMetaRaw>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    accessToken,
  )
  return {
    sizeKb: data.size,
    defaultBranch: data.default_branch,
    private: data.private,
    language: data.language,
    fullName: data.full_name,
    name: data.name,
    owner: data.owner.login,
  }
}

/**
 * Recursive file path list for analysis (capped paths for large repos).
 */
export async function fetchRepositoryTreePaths(
  accessToken: string,
  owner: string,
  repo: string,
  branch: string,
): Promise<string[]> {
  const data = await githubFetch<GhTreeRaw>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
    accessToken,
  )
  return data.tree
    .filter((n) => n.type === "blob" && n.path)
    .map((n) => n.path)
}

/** Decode a single file from the Contents API (text only). */
export async function fetchRepositoryFileText(
  accessToken: string,
  owner: string,
  repo: string,
  path: string,
  ref: string,
): Promise<string | null> {
  try {
    const data = await githubFetch<GhContentFileRaw | GhContentFileRaw[]>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path
        .split("/")
        .map(encodeURIComponent)
        .join("/")}?ref=${encodeURIComponent(ref)}`,
      accessToken,
    )
    if (Array.isArray(data) || data.type !== "file" || !data.content) return null
    if (data.encoding === "base64") {
      return Buffer.from(data.content.replace(/\n/g, ""), "base64").toString("utf8")
    }
    return data.content
  } catch (error) {
    if (error instanceof GitHubApiError && error.status === 404) return null
    throw error
  }
}
