"use client"

import { SessionProvider } from "next-auth/react"
import type { ReactNode } from "react"
import { SWRConfig } from "swr"
import { ThemeProvider } from "@/components/theme-provider"

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
        <SWRConfig
          value={{
            shouldRetryOnError: false,
            revalidateOnFocus: false,
          }}
        >
          {children}
        </SWRConfig>
      </SessionProvider>
    </ThemeProvider>
  )
}
