import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import type { JWT } from "next-auth/jwt"

/**
 * Auth.js (NextAuth v5) — GitHub OAuth for Rapid24.
 * Access token lives in the encrypted JWT only — never sent to the browser session.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      authorization: {
        params: {
          // `repo` allows private repos; public-only apps can drop it later
          scope: "read:user user:email repo",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account?.access_token) {
        token.accessToken = account.access_token
      }
      if (profile && "login" in profile) {
        token.login = profile.login as string
      }
      return token as JWT
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.login =
          (token.login as string | undefined) ?? session.user.name ?? undefined
      }
      // Intentionally omit accessToken from the client session
      return session
    },
  },
  pages: {
    signIn: "/agent",
    error: "/agent",
  },
  trustHost: true,
})
