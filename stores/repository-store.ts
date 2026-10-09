"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { useShallow } from "zustand/react/shallow"
import type { GitHubRepository, RepositoryAnalysis } from "@/lib/github/types"
import type { RepositoryInfo } from "@/components/ai-agent/types"

function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "—"
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return "—"
  const delta = Date.now() - then
  const mins = Math.floor(delta / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 48) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

/** Map GitHub repo → existing dashboard RepositoryInfo contract */
export function githubRepoToDashboardInfo(repo: GitHubRepository): RepositoryInfo {
  return {
    name: repo.name,
    owner: repo.owner.login,
    branch: repo.defaultBranch,
    commit: repo.latestCommitSha?.slice(0, 7) ?? "·······",
    commitMessage: repo.latestCommitMessage ?? "Fetching latest commit…",
    updatedAt: formatRelative(repo.pushedAt ?? repo.updatedAt),
  }
}

interface RepositoryStore {
  selected: GitHubRepository | null
  /** Live Repository Analysis Engine report */
  analysis: RepositoryAnalysis | null
  analysisStatus: "idle" | "loading" | "ready" | "error"
  analysisError: string | null
  selectRepository: (repo: GitHubRepository) => void
  patchSelected: (patch: Partial<GitHubRepository>) => void
  clearSelection: () => void
  setAnalysis: (analysis: RepositoryAnalysis | null) => void
  setAnalysisStatus: (
    status: RepositoryStore["analysisStatus"],
    error?: string | null,
  ) => void
}

/**
 * Global selected-repository store.
 * Dashboard panels and the AI assistant read from here — no deep prop drilling.
 */
export const useRepositoryStore = create<RepositoryStore>()(
  persist(
    (set) => ({
      selected: null,
      analysis: null,
      analysisStatus: "idle",
      analysisError: null,
      selectRepository: (repo) =>
        set({
          selected: repo,
          analysis: null,
          analysisStatus: "idle",
          analysisError: null,
        }),
      patchSelected: (patch) =>
        set((state) => {
          if (!state.selected) return state
          const next = { ...state.selected, ...patch }
          const unchanged = (Object.keys(patch) as (keyof GitHubRepository)[]).every(
            (key) => Object.is(state.selected![key], next[key]),
          )
          return unchanged ? state : { selected: next }
        }),
      clearSelection: () =>
        set({
          selected: null,
          analysis: null,
          analysisStatus: "idle",
          analysisError: null,
        }),
      setAnalysis: (analysis) =>
        set((state) => {
          if (
            state.analysis === analysis &&
            state.analysisStatus === (analysis ? "ready" : "idle") &&
            state.analysisError === null
          ) {
            return state
          }
          return {
            analysis,
            analysisStatus: analysis ? "ready" : "idle",
            analysisError: null,
          }
        }),
      setAnalysisStatus: (status, error = null) =>
        set((state) =>
          state.analysisStatus === status && state.analysisError === error
            ? state
            : { analysisStatus: status, analysisError: error },
        ),
    }),
    {
      name: "rapid24-selected-repo",
      partialize: (state) => ({ selected: state.selected }),
    },
  ),
)

export function useSelectedGitHubRepository() {
  return useRepositoryStore((s) => s.selected)
}

export function useRepositoryAnalysisState() {
  return useRepositoryStore(
    useShallow((s) => ({
      analysis: s.analysis,
      status: s.analysisStatus,
      error: s.analysisError,
    })),
  )
}

export function useDashboardRepository(
  fallback?: RepositoryInfo,
): RepositoryInfo | undefined {
  const selected = useRepositoryStore((s) => s.selected)
  if (selected) return githubRepoToDashboardInfo(selected)
  return fallback
}
