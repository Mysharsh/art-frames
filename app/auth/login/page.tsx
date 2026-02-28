"use client"

import { useSearchParams } from "next/navigation"
import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Mail, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
    const searchParams = useSearchParams()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Memoize Supabase client to avoid recreation on every render
    const supabase = useMemo(() => createClient(), [])

    useEffect(() => {
        const errorParam = searchParams.get("error")
        if (errorParam === "auth_error") {
            const errorDescription = searchParams.get("error_description")
            setError(errorDescription || "Authentication failed. Please try again.")
        }
    }, [searchParams])

    const handleGoogleSignIn = async () => {
        try {
            setLoading(true)
            setError(null)

            const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "")
            const origin = configuredSiteUrl || window.location.origin

            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${origin}/auth/callback`,
                    skipBrowserRedirect: false,
                },
            })

            if (error) throw error

            // Browser will redirect, keep loading state
        } catch (err) {
            setError(err instanceof Error ? err.message : "Authentication failed")
            setLoading(false)
        }
    }



    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                        Sign In
                    </h1>
                    <p className="text-muted-foreground">
                        Join our community to track orders and manage your waitlist
                    </p>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-6 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                        <p className="text-sm text-destructive">{error}</p>
                    </div>
                )}

                {/* Social Auth Buttons */}
                <div className="space-y-3 mb-6">
                    <Button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        variant="outline"
                        className="w-full h-10 rounded-full"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Redirecting to Google...
                            </>
                        ) : (
                            <>
                                <Mail className="mr-2 h-4 w-4" />
                                Sign in with Google
                            </>
                        )}
                    </Button>
                </div>

                {/* Divider */}
                <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                </div>

                {/* Register link */}
                <div className="text-center">
                    <p className="text-muted-foreground text-sm">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/auth/register"
                            className="text-primary hover:underline font-semibold"
                        >
                            Create one
                        </Link>
                    </p>
                </div>

                {/* Back to home */}
                <div className="mt-8 text-center">
                    <Link
                        href="/"
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        ← Back to home
                    </Link>
                </div>
            </div>
        </div>
    )
}
