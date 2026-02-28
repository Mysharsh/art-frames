import { createClient } from "@/lib/supabase/server"

function getAuthCallbackUrl() {
    const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "")
    const origin = configuredSiteUrl || "http://localhost:3000"
    return `${origin}/auth/callback`
}

export async function signInWithGoogle() {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: getAuthCallbackUrl(),
        },
    })
    return { data, error }
}

export async function signInWithGitHub() {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
            redirectTo: getAuthCallbackUrl(),
        },
    })
    return { data, error }
}

export async function signOut() {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()
    return { error }
}

export async function getSession() {
    const supabase = await createClient()
    const {
        data: { session },
    } = await supabase.auth.getSession()
    return session
}

export async function getUser() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()
    return user
}
