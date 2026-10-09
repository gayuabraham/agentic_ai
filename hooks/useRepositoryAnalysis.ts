"use client"

import { useEffect } from "react"
import useSWR from "swr"
import type { RepositoryAnalysis } from "@/lib/github/types"
import { useRepositoryStore } from "@/stores/repository-store"

interface AnalyzeResponse {
  analysis?: RepositoryAnalysis
  error?: string
  code?: string
}

async function fetchAnalysis(url: string): Promise<RepositoryAnalysis> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 40_000)
  try {
    const res = await fetch(url, { signal: controller.signal })
    const data = (await res.json()) as AnalyzeResponse
    if (!res.ok || !data.analysis) {
      const err = new Error(data.error ?? "Analysis failed") as Error & {
        status?: number
        code?: string
      }
      err.status = res.status
      err.code = data.code
      throw err
    }
    return data.analysis
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Analysis timed out. Try Refresh on the analysis card.")
    }
    throw error
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Runs the Repository Analysis Engine for the currently selected GitHub repo.
 * Results sync into the global Zustand store for dashboard + AI context.
 */
export function useRepositoryAnalysis(enabled = true) {
  const selected = useRepositoryStore((s) => s.selected)
  const analysis = useRepositoryStore((s) => s.analysis)
  const setAnalysis = useRepositoryStore((s) => s.setAnalysis)
  const setAnalysisStatus = useRepositoryStore((s) => s.setAnalysisStatus)

  const key =
    enabled && selected
      ? `/api/github/repos/${encodeURIComponent(selected.owner.login)}/${encodeURIComponent(selected.name)}/analyze?branch=${encodeURIComponent(selected.defaultBranch)}&enrich=0${
          selected.latestCommitSha
            ? `&commit=${encodeURIComponent(selected.latestCommitSha)}`
            : ""
        }${
          selected.latestCommitMessage
            ? `&message=${encodeURIComponent(selected.latestCommitMessage)}`
            : ""
        }`
      : null

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    key,
    fetchAnalysis,
    {
      revalidateOnFocus: false,
      dedupingInterval: 120_000,
      errorRetryCount: 1,
      shouldRetryOnError: true,
    },
  )

  useEffect(() => {
    const state = useRepositoryStore.getState()

    if (!selected) {
      if (
        state.analysis !== null ||
        state.analysisStatus !== "idle" ||
        state.analysisError !== null
      ) {
        setAnalysis(null)
        setAnalysisStatus("idle")
      }
      return
    }

    if (isLoading && !data && !state.analysis) {
      if (state.analysisStatus !== "loading") {
        setAnalysisStatus("loading")
      }
      return
    }

    if (error && !data) {
      const message = (error as Error).message
      if (state.analysisStatus !== "error" || state.analysisError !== message) {
        setAnalysisStatus("error", message)
      }
      return
    }

    if (!data) return

    if (state.analysis !== data) {
      setAnalysis(data)
    }

    if (data.latestCommitSha) {
      const current = useRepositoryStore.getState().selected
      if (
        current &&
        (current.latestCommitSha !== data.latestCommitSha ||
          current.latestCommitMessage !== data.latestCommitMessage ||
          current.sizeKb !== data.sizeKb)
      ) {
        useRepositoryStore.getState().patchSelected({
          latestCommitSha: data.latestCommitSha,
          latestCommitMessage: data.latestCommitMessage,
          sizeKb: data.sizeKb,
        })
      }
    }
  }, [selected, data, error, isLoading, setAnalysis, setAnalysisStatus])

  return {
    analysis: data ?? analysis,
    error,
    isLoading: isLoading && !data && !analysis,
    isValidating,
    refresh: mutate,
  }
}
