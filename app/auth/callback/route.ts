import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")
    const error = requestUrl.searchParams.get("error")
    const errorDescription = requestUrl.searchParams.get("error_description")

    if (error) {
        const loginUrl = new URL("/auth/login", requestUrl.origin)
        loginUrl.searchParams.set("error", "auth_error")
        if (errorDescription) {
            loginUrl.searchParams.set("error_description", errorDescription)
        }
        return NextResponse.redirect(loginUrl)
    }

    if (!code) {
        const loginUrl = new URL("/auth/login", requestUrl.origin)
        loginUrl.searchParams.set("error", "auth_error")
        loginUrl.searchParams.set("error_description", "Missing OAuth code")
        return NextResponse.redirect(loginUrl)
    }

    try {
        const supabase = await createClient()
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

        if (!exchangeError) {
            return NextResponse.redirect(new URL("/", requestUrl.origin))
        }

        const loginUrl = new URL("/auth/login", requestUrl.origin)
        loginUrl.searchParams.set("error", "auth_error")
        loginUrl.searchParams.set(
            "error_description",
            exchangeError.message || "Unable to complete sign-in",
        )
        return NextResponse.redirect(loginUrl)
    } catch {
        const loginUrl = new URL("/auth/login", requestUrl.origin)
        loginUrl.searchParams.set("error", "auth_error")
        loginUrl.searchParams.set(
            "error_description",
            "Unexpected error during authentication",
        )
        return NextResponse.redirect(loginUrl)
    }
}
