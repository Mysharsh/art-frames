"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, Loader2 } from "lucide-react"
import { signInWithGoogle } from "@/lib/firebase/auth"
import { Button } from "@/components/ui/button"

export default function RegisterPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleGoogleSignUp = async () => {
        try {
            setLoading(true)
            setError(null)

            await signInWithGoogle()
            router.push("/")
        } catch (err) {
            setError(err instanceof Error ? err.message : "Authentication failed")
        } finally {
            setLoading(false)
        }
    }



    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                        Join Us
                    </h1>
                    <p className="text-muted-foreground">
                        Create an account to access exclusive drops and manage your orders
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
                        onClick={handleGoogleSignUp}
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
                                Sign up with Google
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

                {/* Login link */}
                <div className="text-center">
                    <p className="text-muted-foreground text-sm">
                        Already have an account?{" "}
                        <Link
                            href="/auth/login"
                            className="text-primary hover:underline font-semibold"
                        >
                            Sign in
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
