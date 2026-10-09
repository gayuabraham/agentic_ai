import React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono, IBM_Plex_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AppProviders } from "@/components/providers/AppProviders"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
  preload: true,
  weight: ["400", "500", "600", "700"],
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
  preload: true,
  weight: ["400", "500", "600"],
})

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-ibm-plex",
  display: "swap",
  preload: false,
})

export const metadata: Metadata = {
  title: "Rapid24.ai — Autonomous AI DevOps Engineer",
  description:
    "From commit to production. Rapid24.ai analyzes every deployment, fixes build failures, resolves infrastructure issues, deploys automatically, and verifies your application is live.",
  keywords: [
    "AI DevOps",
    "autonomous deployment",
    "CI/CD automation",
    "build failure resolution",
    "production verification",
    "Rapid24",
  ],
  authors: [{ name: "Rapid24.ai" }],
  openGraph: {
    title: "Rapid24.ai — From Commit to Production",
    description:
      "Autonomous AI that monitors, detects, fixes, deploys, and verifies your applications—so your team can focus on building.",
    type: "website",
    url: "https://rapid24.ai",
    siteName: "Rapid24.ai",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rapid24.ai — Autonomous AI DevOps Engineer",
    description: "From commit to production. Powered by autonomous AI.",
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${ibmPlexSans.variable} font-sans antialiased`}
      >
        <AppProviders>
          {children}
          <Toaster />
        </AppProviders>
        <Analytics />
      </body>
    </html>
  )
}
