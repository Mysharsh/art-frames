import { NextResponse, type NextRequest } from "next/server"
import { createClient } from "@/lib/supabase/server"

function normalizeNextPath(nextPath: string | null) {
  if (!nextPath || !nextPath.startsWith("/")) {
    return "/"
  }

  return nextPath
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const nextPath = normalizeNextPath(requestUrl.searchParams.get("next"))

  if (code) {
    try {
      const supabase = await createClient()
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (!error) {
        return NextResponse.redirect(new URL(nextPath, requestUrl.origin))
      }

      const loginUrl = new URL("/auth/login", requestUrl.origin)
      loginUrl.searchParams.set("error", "auth_error")
      loginUrl.searchParams.set("error_description", error.message)
      return NextResponse.redirect(loginUrl)
    } catch {
      const loginUrl = new URL("/auth/login", requestUrl.origin)
      loginUrl.searchParams.set("error", "auth_error")
      loginUrl.searchParams.set("error_description", "Authentication failed. Please try again.")
      return NextResponse.redirect(loginUrl)
    }
  }

  return NextResponse.redirect(new URL("/auth/login", requestUrl.origin))
}
