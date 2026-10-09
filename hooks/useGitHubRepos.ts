"use client"

import { useCallback } from "react"
import useSWR from "swr"
import type { GitHubRepository } from "@/lib/github/types"
import { useRepositoryStore } from "@/stores/repository-store"

interface ReposResponse {
  repositories: GitHubRepository[]
  error?: string
  code?: string
}

async function fetchRepos(url: string): Promise<GitHubRepository[]> {
  const res = await fetch(url)
  const data = (await res.json()) as ReposResponse
  if (!res.ok) {
    const err = new Error(data.error ?? "Failed to load repositories") as Error & {
      status?: number
      code?: string
    }
    err.status = res.status
    err.code = data.code
    throw err
  }
  return data.repositories
}

/**
 * Cached repository list for the signed-in GitHub user.
 */
export function useGitHubRepos(enabled: boolean) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    enabled ? "/api/github/repos" : null,
    fetchRepos,
    {
      revalidateOnFocus: false,
      revalidateIfStale: true,
      dedupingInterval: 60_000,
      errorRetryCount: 2,
    },
  )

  return {
    repositories: data ?? [],
    error,
    isLoading,
    isValidating,
    refresh: mutate,
  }
}

/**
 * Hydrate latest commit for the active repo (lazy).
 */
export function useHydrateSelectedCommit() {
  const selected = useRepositoryStore((s) => s.selected)
  const patchSelected = useRepositoryStore((s) => s.patchSelected)

  const hydrate = useCallback(async () => {
    if (!selected) return
    if (selected.latestCommitSha) return

    const url = `/api/github/repos/${encodeURIComponent(selected.owner.login)}/${encodeURIComponent(selected.name)}/commit?branch=${encodeURIComponent(selected.defaultBranch)}`
    const res = await fetch(url)
    if (!res.ok) return
    const data = (await res.json()) as {
      commit?: { sha: string; message: string; date: string | null }
    }
    if (!data.commit) return
    patchSelected({
      latestCommitSha: data.commit.sha,
      latestCommitMessage: data.commit.message,
      latestCommitDate: data.commit.date,
    })
  }, [selected, patchSelected])

  return { hydrate }
}
