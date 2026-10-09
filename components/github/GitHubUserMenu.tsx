"use client"

import { signIn, signOut, useSession } from "next-auth/react"
import { Github, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface GitHubUserMenuProps {
  className?: string
  onConnectClick?: () => void
}

export function GitHubUserMenu({ className, onConnectClick }: GitHubUserMenuProps) {
  const { data: session, status } = useSession()
  const loading = status === "loading"
  const user = session?.user

  if (loading) {
    return (
      <div
        className={cn(
          "h-8 w-28 animate-pulse rounded-lg border border-white/10 bg-white/[0.04]",
          className,
        )}
      />
    )
  }

  if (!user) {
    return (
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => void signIn("github", { callbackUrl: "/agent" })}
        className={cn(
          "h-8 border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.07] hover:text-zinc-50",
          className,
        )}
      >
        <Github className="size-3.5" />
        Sign in with GitHub
      </Button>
    )
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {onConnectClick ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onConnectClick}
          className="h-8 border-emerald-500/30 bg-emerald-500/10 text-emerald-200 hover:bg-emerald-500/20"
        >
          <Github className="size-3.5" />
          Repositories
        </Button>
      ) : null}
      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] py-1 pl-1 pr-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={user.image ?? undefined}
          alt=""
          className="size-6 rounded-md object-cover"
        />
        <span className="max-w-[96px] truncate text-[11px] font-medium text-zinc-300">
          {user.login ?? user.name}
        </span>
        <button
          type="button"
          onClick={() => void signOut({ callbackUrl: "/agent" })}
          className="rounded p-1 text-zinc-500 transition-colors hover:bg-white/[0.06] hover:text-zinc-200"
          title="Sign out"
          aria-label="Sign out"
        >
          <LogOut className="size-3.5" />
        </button>
      </div>
    </div>
  )
}
