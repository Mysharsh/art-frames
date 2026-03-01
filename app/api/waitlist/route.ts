import { NextResponse } from "next/server"
import { db } from "@/lib/firebase/client"
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  getCountFromServer,
} from "firebase/firestore"
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

    // Check if already on waitlist for this product
    const q = query(
      collection(db, "waitlist"),
      where("email", "==", email),
      where("product_id", "==", productId)
    )
    const snapshot = await getDocs(q)

    if (!snapshot.empty) {
      return NextResponse.json(
        { error: "You're already on the waitlist for this product" },
        { status: 409 }
      )
    }

    // Add to waitlist
    await addDoc(collection(db, "waitlist"), {
      email,
      product_id: productId,
      product_title: productTitle || null,
      created_at: new Date(),
      updated_at: new Date(),
    })

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
    // Use Firestore aggregation to avoid reading all documents into memory
    const snapshot = await getCountFromServer(collection(db, "waitlist"))
    const count = snapshot.data().count

    return NextResponse.json({ count })
  } catch {
    return NextResponse.json({ count: 0 })
  }
}
