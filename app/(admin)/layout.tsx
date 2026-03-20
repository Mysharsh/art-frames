'use client'

import { redirect } from "next/navigation"
import { useEffect, useState } from "react"

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const [isChecking, setIsChecking] = useState(true)

    useEffect(() => {
        // Middleware will handle the actual protection
        // This is a client-side hint for UX
        setIsChecking(false)
    }, [])

    if (isChecking) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
                {children}
            </div>
        </div>
    )
}
