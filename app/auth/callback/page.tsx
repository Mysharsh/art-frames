import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function CallbackPage({
    searchParams,
}: {
    searchParams: { code?: string; error?: string }
}) {
    const code = searchParams.code
    const error = searchParams.error

    // Handle OAuth errors
    if (error) {
        console.error("OAuth error:", error)
        return redirect(`/auth/login?error=auth_error`)
    }

    // Exchange code for session
    if (code) {
        try {
            const supabase = await createClient()
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

            if (!exchangeError) {
                // Successfully authenticated, redirect to home
                return redirect("/")
            }

            console.error("Session exchange error:", exchangeError)
        } catch (err) {
            console.error("Callback error:", err)
        }
    }

    // Fallback: redirect to login with error
    return redirect("/auth/login?error=auth_error")
}
