import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET() {
    const startTime = Date.now()

    const supabaseConfigured =
        !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
        !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
        !!process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseConfigured) {
        return NextResponse.json(
            {
                status: "unhealthy",
                timestamp: new Date().toISOString(),
                error: "Supabase configuration is missing",
                responseTime: Date.now() - startTime,
            },
            { status: 503 }
        )
    }

    let dbStatus: "ok" | "unavailable" = "unavailable"

    try {
        const supabase = createAdminClient()
        const { error } = await supabase
            .from("waitlist")
            .select("id", { head: true, count: "exact" })

        if (!error) {
            dbStatus = "ok"
        }
    } catch {
        dbStatus = "unavailable"
    }

    return NextResponse.json({
        status: "healthy",
        timestamp: new Date().toISOString(),
        checks: {
            supabase: "ok",
            database: dbStatus,
            api: "ok",
        },
        responseTime: Date.now() - startTime,
        environment: process.env.NODE_ENV || "unknown",
    })
}
