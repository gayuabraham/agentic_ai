import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"
import { cookies } from "next/headers"

/**
 * Read the GitHub OAuth access token from the Auth.js JWT cookie.
 * Never expose this to the client — use only in Route Handlers / Server Components.
 */
export async function getGitHubAccessToken(
  req?: NextRequest,
): Promise<string | undefined> {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET
  if (!secret) return undefined

  if (req) {
    const token = await getToken({ req, secret })
    return typeof token?.accessToken === "string" ? token.accessToken : undefined
  }

  const cookieStore = await cookies()
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ")

  const token = await getToken({
    // getToken only needs a cookie header; cast via unknown for App Router
    req: { headers: { cookie: cookieHeader } } as unknown as NextRequest,
    secret,
  })

  return typeof token?.accessToken === "string" ? token.accessToken : undefined
}
