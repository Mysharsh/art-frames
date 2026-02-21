import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { waitlistLimiter, countLimiter, getClientIp } from "@/lib/rate-limit"
import { safeParseWaitlistEntry } from "@/lib/validations"

export async function POST(request: Request) {
  // Rate limiting: 10 requests per minute per IP
  const clientIp = getClientIp(request)
  const rateLimitResult = waitlistLimiter.isAllowed(clientIp)

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimitResult.retryAfter || 60),
        },
      }
    )
  }

  try {
    const body = await request.json()

    // Validate input using Zod schema
    const parseResult = await safeParseWaitlistEntry(body)

    if (!parseResult.success) {
      const errors = parseResult.error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("; ")
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      )
    }

    const { email, productId, productTitle } = parseResult.data

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
      // Log error for debugging (in production, this would go to Sentry)
      console.error("Waitlist insert error:", error)
      return NextResponse.json(
        { error: "Failed to join waitlist. Please try again later." },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    // Log error for debugging (in production, this would go to Sentry)
    console.error("Waitlist API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  // Rate limiting: 5 requests per minute per IP
  const clientIp = getClientIp(request)
  const rateLimitResult = countLimiter.isAllowed(clientIp)

  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimitResult.retryAfter || 60),
        },
      }
    )
  }

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
