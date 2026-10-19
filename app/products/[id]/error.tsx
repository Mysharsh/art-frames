"use client"

import { useEffect } from "react"
import { AlertCircle, Home, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface ErrorProps {
    error: Error & { digest?: string }
    reset: () => void
}

export default function ProductError({ error, reset }: ErrorProps) {
    useEffect(() => {
        console.error("Product page error:", error)
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

                <p className="text-muted-foreground mb-6 text-sm">
                    We couldn&apos;t load the product details. Please try again.
                </p>

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
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
