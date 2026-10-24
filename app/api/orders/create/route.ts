import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { safeParseCheckoutOrder } from "@/lib/validations"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient as createServerSupabaseClient } from "@/lib/supabase/server"
import { checkRateLimit, getClientIp } from "@/lib/rate-limit"
import { calculateTotals, priceOrderLines } from "@/lib/pricing"
import { captureException } from "@/lib/sentry"
import type { OrderConfirmation } from "@/lib/orders"

function makeOrderId() {
  return `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${randomUUID().slice(0, 8).toUpperCase()}`
}

export async function POST(request: Request) {
  const clientIp = getClientIp(request)
  const rateLimitResult = await checkRateLimit("orders", clientIp)

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

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

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

  // Online payment has no provider integration yet; refuse rather than create
  // orders that sit in "pending_payment" with no way to pay.
  if (payload.paymentMethod !== "cod") {
    return NextResponse.json(
      { error: "Online payment is not available yet. Please choose Cash on Delivery." },
      { status: 400 }
    )
  }

  // Prices are always resolved from the catalogue, never taken from the request.
  const priced = priceOrderLines(payload.cartItems)
  if (!priced.ok) {
    return NextResponse.json(
      { error: "Some items in your cart are no longer available", details: priced.error },
      { status: 400 }
    )
  }

  const totals = calculateTotals(priced.items, payload.paymentMethod)
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

  const now = new Date().toISOString()
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
    status: "pending_cod_confirm" as const,
    currency: "INR",
    subtotal: totals.subtotal,
    cod_fee: totals.codFee,
    total: totals.total,
    line_items: priced.items,
    notes: payload.notes || null,
    created_at: now,
    updated_at: now,
  }

  try {
    const admin = createAdminClient()
    const { error } = await admin.from("orders").insert(orderRecord)
    if (error) {
      throw error
    }
  } catch (error) {
    // Never report success for an order that was not saved: the client clears the
    // cart on success, so a silent failure would lose the order entirely.
    console.error("Order persistence failed:", error)
    // Supabase returns plain PostgrestError objects, not Error instances.
    const message = (error as { message?: string } | null)?.message ?? String(error)
    captureException(error instanceof Error ? error : new Error(message), {
      orderId,
      endpoint: "/api/orders/create",
    })
    return NextResponse.json(
      { error: "We couldn't place your order right now. Your cart is saved; please try again." },
      { status: 503 }
    )
  }

  const confirmation: OrderConfirmation = {
    orderId,
    status: "pending_cod_confirm",
    paymentMethod: payload.paymentMethod,
    customerName: payload.customerName,
    city: payload.city,
    items: priced.items.map(({ productId, title, size, material, quantity, lineTotal }) => ({
      productId,
      title,
      size,
      material,
      quantity,
      lineTotal,
    })),
    subtotal: totals.subtotal,
    codFee: totals.codFee,
    total: totals.total,
    createdAt: now,
  }

  return NextResponse.json({
    success: true,
    orderId,
    paymentMethod: payload.paymentMethod,
    amount: totals.total,
    status: orderRecord.status,
    order: confirmation,
  })
}
