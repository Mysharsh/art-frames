import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const { email, productId, productTitle } = await request.json()

    if (!email || !productId) {
      return NextResponse.json(
        { error: "Email and product ID are required" },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email" },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Check if already on waitlist for this product
    const { data: existing } = await supabase
      .from("waitlist_entries")
      .select("id")
      .eq("email", email)
      .eq("product_id", productId)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: "You're already on the waitlist for this product" },
        { status: 409 }
      )
    }

    const { error } = await supabase.from("waitlist_entries").insert({
      email,
      product_id: productId,
      product_title: productTitle || null,
    })

    if (error) {
      return NextResponse.json(
        { error: "Failed to join waitlist" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createClient()

    const { count, error } = await supabase
      .from("waitlist_entries")
      .select("*", { count: "exact", head: true })

    if (error) {
      return NextResponse.json({ count: 0 })
    }

    return NextResponse.json({ count: count || 0 })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
