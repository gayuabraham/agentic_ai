/**
 * GitHub repository domain types.
 * Structured for future: file explorer, README, workflows, PRs, branches.
 */

export interface GitHubOwner {
  id: number
  login: string
  avatarUrl: string
  htmlUrl: string
}

export interface GitHubRepository {
  id: number
  name: string
  fullName: string
  description: string | null
  owner: GitHubOwner
  defaultBranch: string
  private: boolean
  language: string | null
  stargazersCount: number
  forksCount: number
  updatedAt: string
  pushedAt: string | null
  htmlUrl: string
  cloneUrl: string
  /** Lazily hydrated after selection */
  latestCommitSha?: string | null
  latestCommitMessage?: string | null
  latestCommitDate?: string | null
  /** Repo size in KB from GitHub meta (optional) */
  sizeKb?: number | null
}

export type {
  RepositoryAnalysis,
  RepositoryAnalysisStub,
  AnalysisFinding,
  AnalysisRecommendation,
  DeploymentSignals,
  PackageAnalysis,
  FrameworkDetection,
  ReadinessBreakdown,
  AnalysisStatusLevel,
  AnalysisFindingSeverity,
} from "./analysis/types"

export type RepoSortKey = "updated" | "stars" | "name"
export type RepoVisibilityFilter = "all" | "public" | "private"

export interface RepoListFilters {
  query: string
  sort: RepoSortKey
  visibility: RepoVisibilityFilter
  language: string | "all"
}
