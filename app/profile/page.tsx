"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { auth } from "@/lib/firebase/client"
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth"

export default function ProfilePage() {
    const router = useRouter()
    const [user, setUser] = useState<FirebaseUser | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Subscribe to auth state changes
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            if (!firebaseUser) {
                router.push("/auth/login")
                return
            }
            setUser(firebaseUser)
            setLoading(false)
        })

        return () => {
            unsubscribe()
        }
    }, [router])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="min-h-screen px-4 py-8">
            <div className="mx-auto max-w-2xl">
                <h1 className="font-display text-3xl font-bold text-foreground mb-8">
                    Profile Settings
                </h1>

                {/* User Info Card */}
                <div className="rounded-lg border border-border bg-card p-6 mb-6">
                    <h2 className="font-semibold text-foreground mb-4">Account Information</h2>

                    <div className="space-y-4">
                        <div>
                            <p className="text-sm text-muted-foreground">Full Name</p>
                            <p className="text-foreground font-medium">
                                {user.displayName || "Not provided"}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="text-foreground font-medium">{user.email}</p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">Account Type</p>
                            <p className="text-foreground font-medium capitalize">
                                Google
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-muted-foreground">Member Since</p>
                            <p className="text-foreground font-medium">
                                {user.metadata?.creationTime
                                    ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                    })
                                    : "Unknown"
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="grid gap-4 sm:grid-cols-2">
                    <a
                        href="/orders"
                        className="block rounded-lg border border-border bg-card hover:bg-card/80 transition-colors p-6 text-center"
                    >
                        <p className="font-semibold text-foreground mb-2">My Orders</p>
                        <p className="text-sm text-muted-foreground">Track and manage your orders</p>
                    </a>

                    <a
                        href="/waitlist"
                        className="block rounded-lg border border-border bg-card hover:bg-card/80 transition-colors p-6 text-center"
                    >
                        <p className="font-semibold text-foreground mb-2">My Waitlist</p>
                        <p className="text-sm text-muted-foreground">View your waitlisted products</p>
                    </a>
                </div>

                {/* Back to home */}
                <div className="mt-8 text-center">
                    <Link
                        href="/"
                        className="text-sm text-primary hover:underline"
                    >
                        ← Back to home
                    </Link>
                </div>
            </div>
        </div>
    )
}
