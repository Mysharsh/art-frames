import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
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
    const supabase = createAdminClient()
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

    // Check if already on waitlist for this product
    const { data: existing, error: existingError } = await supabase
      .from("waitlist")
      .select("id")
      .eq("email", email)
      .eq("product_id", productId)
      .limit(1)

    if (existingError) {
      throw existingError
    }

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "You're already on the waitlist for this product" },
        { status: 409 }
      )
    }

    const now = new Date().toISOString()
    const { error: insertError } = await supabase.from("waitlist").insert({
      email,
      product_id: productId,
      product_title: productTitle || null,
      created_at: now,
      updated_at: now,
    })

    if (insertError) {
      throw insertError
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
    const supabase = createAdminClient()
    const { count, error } = await supabase
      .from("waitlist")
      .select("id", { count: "exact", head: true })

    if (error) {
      throw error
    }

    return NextResponse.json({ count: count ?? 0 })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
