"use client"

import { useEffect } from "react"
import * as Sentry from "@sentry/nextjs"
import { AlertCircle, Home, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ErrorProps {
    error: Error & { digest?: string }
    reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
    useEffect(() => {
        Sentry.captureException(error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/30 px-4">
            <div className="text-center max-w-md">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-6">
                    <AlertCircle className="w-8 h-8 text-destructive" />
                </div>

                <h1 className="text-2xl font-bold tracking-tight mb-2">
                    Something Went Wrong
                </h1>

                <p className="text-muted-foreground mb-2 text-sm">
                    We encountered an unexpected error. Our team has been notified.
                </p>

                {error.digest && (
                    <p className="text-xs text-muted-foreground/70 mb-6 font-mono">
                        Error ID: {error.digest}
                    </p>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button
                        onClick={reset}
                        variant="default"
                        size="sm"
                        className="gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </Button>

                    <Link href="/">
                        <Button variant="outline" size="sm" className="gap-2 w-full">
                            <Home className="w-4 h-4" />
                            Go Home
                        </Button>
                    </Link>
                </div>

                <p className="text-xs text-muted-foreground mt-6">
                    If the problem persists, please contact support.
                </p>
            </div>
        </div>
    )
}
