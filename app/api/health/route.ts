import { NextResponse } from "next/server"
import { adminDb } from "@/lib/firebase/server"

export async function GET() {
    const startTime = Date.now()

    // Verify required client-side Firebase env vars are present
    const firebaseConfigured =
        !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
        !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
        !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID

    if (!firebaseConfigured) {
        return NextResponse.json(
            {
                status: "unhealthy",
                timestamp: new Date().toISOString(),
                error: "Firebase client configuration is missing",
                responseTime: Date.now() - startTime,
            },
            { status: 503 }
        )
    }

    // If Admin SDK is configured, do a lightweight Firestore ping via Admin (bypasses rules)
    let dbStatus: "ok" | "unavailable" | "unconfigured" = "unconfigured"
    if (adminDb) {
        try {
            await adminDb.collection("_health").doc("ping").get()
            dbStatus = "ok"
        } catch {
            dbStatus = "unavailable"
        }
    }

    return NextResponse.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        checks: {
            firebase: "ok",
            database: dbStatus,
            api: "ok",
        },
        responseTime: Date.now() - startTime,
        environment: process.env.NODE_ENV || "unknown",
    })
}
