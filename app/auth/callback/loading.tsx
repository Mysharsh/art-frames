"use client"

import { Loader2 } from "lucide-react"

export default function CallbackLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <h2 className="text-lg font-semibold mb-2">Completing sign in...</h2>
                    <p className="text-muted-foreground text-sm">Please wait while we verify your account</p>
                </div>
            </div>
        </div>
    )
}
