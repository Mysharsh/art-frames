import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    if (!id) {
        return NextResponse.json({ error: "Order id is required" }, { status: 400 })
    }

    try {
        const admin = createAdminClient()
        const { data, error } = await admin
            .from("orders")
            .select("order_id,status,payment_method,subtotal,cod_fee,total,line_items,created_at")
            .eq("order_id", id)
            .limit(1)
            .maybeSingle()

        if (error) {
            throw error
        }

        if (!data) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        return NextResponse.json({ order: data })
    } catch (error) {
        console.error("Order details API error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
