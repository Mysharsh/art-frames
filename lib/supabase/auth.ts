"use client"

import type { User } from "@supabase/supabase-js"
import { createClient } from "./client"

function normalizeNextPath(nextPath?: string) {
  if (!nextPath || !nextPath.startsWith("/")) {
    return "/"
  }

  return nextPath
}

function getAuthRedirectUrl(nextPath?: string) {
  const callbackUrl = new URL("/auth/callback", window.location.origin)
  callbackUrl.searchParams.set("next", normalizeNextPath(nextPath))
  return callbackUrl.toString()
}

export async function signInWithGoogle(nextPath?: string) {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: getAuthRedirectUrl(nextPath),
    },
  })

  if (error) {
    throw new Error(error.message || "Authentication failed")
  }
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()

  // Best-effort cleanup for legacy session endpoint.
  await fetch("/api/auth/session", { method: "DELETE" }).catch(() => undefined)

  if (error) {
    throw new Error(error.message || "Sign out failed")
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}
