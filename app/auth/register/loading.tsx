"use client"

import { Loader2 } from "lucide-react"

export default function AuthLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-8">
            <div className="w-full max-w-md">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                    <p className="text-muted-foreground text-sm">Loading...</p>
                </div>
            </div>
        </div>
    )
}
