import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { safeParseCheckoutOrder } from "@/lib/validations/schemas"
import { calculateTotals } from "@/lib/commerce"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server"
import { getClientIp, waitlistLimiter } from "@/lib/utils/rate-limit"

function makeOrderId() {
  return `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${randomUUID().slice(0, 8).toUpperCase()}`
}

export async function POST(request: Request) {
  const clientIp = getClientIp(request)
  const rateLimitResult = waitlistLimiter.isAllowed(`orders:${clientIp}`)

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
    const parseResult = await safeParseCheckoutOrder(body)

    if (!parseResult.success) {
      const details = parseResult.error.errors
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join("; ")

      return NextResponse.json(
        { error: "Validation failed", details },
        { status: 400 }
      )
    }

    const payload = parseResult.data
    const totals = calculateTotals(payload.cartItems, payload.paymentMethod)
    const orderId = makeOrderId()

    let userId: string | null = null
    try {
      const supabase = await createServerSupabaseClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      userId = user?.id ?? null
    } catch {
      userId = null
    }

    const orderRecord = {
      order_id: orderId,
      user_id: userId,
      customer_name: payload.customerName,
      email: payload.email,
      phone: payload.phone,
      address_line_1: payload.addressLine1,
      address_line_2: payload.addressLine2 || null,
      city: payload.city,
      state: payload.state,
      pincode: payload.pincode,
      gst_number: payload.gstNumber || null,
      payment_method: payload.paymentMethod,
      stripe_payment_intent_id: payload.stripePaymentIntentId || null,
      status: payload.paymentMethod === "cod" ? "pending_cod_confirm" : "pending_payment",
      subtotal: totals.subtotal,
      cod_fee: totals.codFee,
      total: totals.total,
      line_items: payload.cartItems,
      notes: payload.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    let persisted = false
    try {
      const admin = createAdminClient()
      const { error } = await admin.from("orders").insert(orderRecord)
      if (error) {
        throw error
      }
      persisted = true
    } catch (error) {
      console.error("Order persistence warning:", error)
    }

    return NextResponse.json({
      success: true,
      orderId,
      paymentMethod: payload.paymentMethod,
      amount: totals.total,
      status: orderRecord.status,
      persisted,
    })
  } catch (error) {
    console.error("Order create API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
