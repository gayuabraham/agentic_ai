"use client"

import { AnimatePresence, motion } from "framer-motion"
import {
  GitBranch,
  Globe2,
  Loader2,
  Lock,
  Search,
  Star,
  X,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { useSession, signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useGitHubRepos } from "@/hooks/useGitHubRepos"
import type {
  GitHubRepository,
  RepoSortKey,
  RepoVisibilityFilter,
} from "@/lib/github/types"
import { cn } from "@/lib/utils"
import { useRepositoryStore } from "@/stores/repository-store"

interface RepositorySelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called after a repo is selected (e.g. continue Connect flow) */
  onSelected?: (repo: GitHubRepository) => void
}

function formatUpdated(iso: string | null | undefined) {
  if (!iso) return "—"
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return "—"
  const days = Math.round((then - Date.now()) / 86_400_000)
  if (!Number.isFinite(days)) return "—"
  try {
    return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
      days,
      "day",
    )
  } catch {
    return new Date(iso).toLocaleDateString()
  }
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03] p-4">
      <div className="mb-3 h-4 w-2/3 rounded bg-white/10" />
      <div className="mb-2 h-3 w-full rounded bg-white/[0.06]" />
      <div className="h-3 w-1/2 rounded bg-white/[0.06]" />
    </div>
  )
}

function RepoCard({
  repo,
  active,
  onSelect,
}: {
  repo: GitHubRepository
  active: boolean
  onSelect: () => void
}) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onSelect}
      className={cn(
        "w-full rounded-2xl border p-4 text-left transition-colors",
        active
          ? "border-emerald-500/40 bg-emerald-500/10"
          : "border-white/[0.07] bg-white/[0.03] hover:border-white/15 hover:bg-white/[0.05]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight text-zinc-50">
            {repo.fullName || `${repo.owner?.login}/${repo.name}`}
          </p>
          <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
            {repo.description ?? "No description"}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider",
            repo.private
              ? "border-amber-500/25 bg-amber-500/10 text-amber-300"
              : "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
          )}
        >
          {repo.private ? (
            <Lock className="size-2.5" />
          ) : (
            <Globe2 className="size-2.5" />
          )}
          {repo.private ? "Private" : "Public"}
        </span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-zinc-500">
        {repo.language ? (
          <span className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-zinc-300">
            {repo.language}
          </span>
        ) : null}
        <span className="inline-flex items-center gap-1">
          <GitBranch className="size-3" />
          {repo.defaultBranch || "main"}
        </span>
        <span className="inline-flex items-center gap-1">
          <Star className="size-3" />
          {repo.stargazersCount ?? 0}
        </span>
        <span>Updated {formatUpdated(repo.pushedAt ?? repo.updatedAt)}</span>
      </div>
    </motion.button>
  )
}

export function RepositorySelector({
  open,
  onOpenChange,
  onSelected,
}: RepositorySelectorProps) {
  const { status } = useSession()
  const signedIn = status === "authenticated"
  const sessionLoading = status === "loading"
  const selectedId = useRepositoryStore((s) => s.selected?.id)
  const selectRepository = useRepositoryStore((s) => s.selectRepository)
  const [mounted, setMounted] = useState(false)

  const { repositories, error, isLoading, refresh, isValidating } =
    useGitHubRepos(open && signedIn)

  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<RepoSortKey>("updated")
  const [visibility, setVisibility] = useState<RepoVisibilityFilter>("all")
  const [language, setLanguage] = useState<string>("all")

  useEffect(() => {
    setMounted(true)
  }, [])

  const languages = useMemo(() => {
    const set = new Set<string>()
    for (const repo of repositories) {
      if (repo.language) set.add(repo.language)
    }
    return Array.from(set).sort()
  }, [repositories])

  const filtered = useMemo(() => {
    let list = Array.isArray(repositories) ? [...repositories] : []
    if (visibility === "public") list = list.filter((r) => !r.private)
    if (visibility === "private") list = list.filter((r) => r.private)
    if (language !== "all") list = list.filter((r) => r.language === language)
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter(
        (r) =>
          (r.fullName ?? "").toLowerCase().includes(q) ||
          (r.name ?? "").toLowerCase().includes(q) ||
          (r.description ?? "").toLowerCase().includes(q),
      )
    }
    list.sort((a, b) => {
      if (sort === "name") return (a.name ?? "").localeCompare(b.name ?? "")
      if (sort === "stars") return (b.stargazersCount ?? 0) - (a.stargazersCount ?? 0)
      const tb = new Date(b.pushedAt ?? b.updatedAt ?? 0).getTime()
      const ta = new Date(a.pushedAt ?? a.updatedAt ?? 0).getTime()
      return (Number.isFinite(tb) ? tb : 0) - (Number.isFinite(ta) ? ta : 0)
    })
    return list
  }, [repositories, query, sort, visibility, language])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
    }
    window.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
    }
  }, [open, onOpenChange])

  const handleSelect = async (repo: GitHubRepository) => {
    selectRepository(repo)
    onSelected?.(repo)
    onOpenChange(false)

    try {
      const url = `/api/github/repos/${encodeURIComponent(repo.owner.login)}/${encodeURIComponent(repo.name)}/commit?branch=${encodeURIComponent(repo.defaultBranch || "main")}`
      const res = await fetch(url)
      if (!res.ok) return
      const data = (await res.json()) as {
        commit?: { sha: string; message: string; date: string | null }
      }
      if (!data.commit) return
      useRepositoryStore.getState().patchSelected({
        latestCommitSha: data.commit.sha,
        latestCommitMessage: data.commit.message,
        latestCommitDate: data.commit.date,
      })
    } catch {
      // Non-blocking
    }
  }

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[200] flex items-end justify-center p-3 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/75 backdrop-blur-md"
            aria-label="Close repository selector"
            onClick={() => onOpenChange(false)}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Select a GitHub repository"
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative z-10 flex max-h-[min(720px,90dvh)] min-h-[320px] w-full max-w-2xl flex-col overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#0c0c10] shadow-[0_40px_100px_rgba(0,0,0,0.7)]"
          >
            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-emerald-400/80">
                  GitHub
                </p>
                <h2 className="mt-1 text-base font-semibold tracking-tight text-zinc-50">
                  Select a repository
                </h2>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => onOpenChange(false)}
                className="text-zinc-400 hover:text-zinc-100"
              >
                <X className="size-4" />
              </Button>
            </div>

            {sessionLoading ? (
              <div className="space-y-2.5 px-5 py-4">
                <SkeletonCard />
                <SkeletonCard />
              </div>
            ) : !signedIn ? (
              <div className="flex flex-col items-center gap-4 px-6 py-16 text-center">
                <p className="max-w-sm text-sm text-zinc-400">
                  Sign in with GitHub to browse your repositories and connect one
                  to the Rapid24 deployment pipeline.
                </p>
                <Button
                  type="button"
                  onClick={() => void signIn("github", { callbackUrl: "/agent" })}
                  className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
                >
                  Sign in with GitHub
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-3 border-b border-white/[0.06] px-5 py-4">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-500" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search repositories…"
                      autoFocus
                      className="h-10 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-9 pr-3 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-emerald-500/40"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={sort}
                      onChange={(e) => setSort(e.target.value as RepoSortKey)}
                      className="h-8 rounded-lg border border-white/10 bg-black/40 px-2 text-[11px] text-zinc-300 outline-none"
                    >
                      <option value="updated">Recently updated</option>
                      <option value="stars">Stars</option>
                      <option value="name">Name</option>
                    </select>
                    <select
                      value={visibility}
                      onChange={(e) =>
                        setVisibility(e.target.value as RepoVisibilityFilter)
                      }
                      className="h-8 rounded-lg border border-white/10 bg-black/40 px-2 text-[11px] text-zinc-300 outline-none"
                    >
                      <option value="all">All visibility</option>
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                    </select>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="h-8 rounded-lg border border-white/10 bg-black/40 px-2 text-[11px] text-zinc-300 outline-none"
                    >
                      <option value="all">All languages</option>
                      {languages.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => void refresh()}
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 px-2 text-[11px] text-zinc-400 hover:text-zinc-200"
                    >
                      {isValidating ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : null}
                      Refresh
                    </button>
                  </div>
                </div>

                <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-5 py-4">
                  {isLoading ? (
                    <>
                      <SkeletonCard />
                      <SkeletonCard />
                      <SkeletonCard />
                    </>
                  ) : error ? (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-8 text-center">
                      <p className="text-sm text-red-300">
                        {(error as Error).message ||
                          "Could not load repositories"}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-4 border-white/10"
                        onClick={() => void refresh()}
                      >
                        Try again
                      </Button>
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-12 text-center">
                      <p className="text-sm text-zinc-400">
                        {repositories.length === 0
                          ? "No repositories found on this GitHub account."
                          : "No repositories match your filters."}
                      </p>
                    </div>
                  ) : (
                    filtered.map((repo) => (
                      <RepoCard
                        key={repo.id}
                        repo={repo}
                        active={repo.id === selectedId}
                        onSelect={() => void handleSelect(repo)}
                      />
                    ))
                  )}
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
