import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
    const startTime = Date.now()

    try {
        // Check Supabase connectivity
        const supabase = await createClient()
        const { error: dbError } = await supabase.rpc("current_database", {})

        // If rpc doesn't exist, try a simple query as fallback
        if (dbError) {
            const { error: selectError } = await supabase
                .from("waitlist_entries")
                .select("count", { count: "exact", head: true })

            if (selectError) {
                return NextResponse.json(
                    {
                        status: "unhealthy",
                        timestamp: new Date().toISOString(),
                        checks: {
                            database: "failed",
                            message: selectError.message,
                        },
                        responseTime: Date.now() - startTime,
                    },
                    { status: 503 }
                )
            }
        }

        return NextResponse.json({
            status: "healthy",
            timestamp: new Date().toISOString(),
            checks: {
                database: "ok",
                api: "ok",
            },
            responseTime: Date.now() - startTime,
            environment: process.env.NODE_ENV || "unknown",
        })
    } catch (error) {
        console.error("Health check failed:", error)
        return NextResponse.json(
            {
                status: "unhealthy",
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : "Unknown error",
                responseTime: Date.now() - startTime,
            },
            { status: 503 }
        )
    }
}
