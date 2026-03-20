import { NextResponse } from "next/server"
import { z } from "zod"
import { getClientIp, waitlistLimiter } from "@/lib/utils/rate-limit"
import { getStripeClient } from "@/lib/stripe/client"

const createIntentSchema = z.object({
    cartItems: z
        .array(
            z.object({
                price: z.number().positive(),
                quantity: z.number().int().min(1),
            })
        )
        .min(1),
    email: z.string().trim().email().optional(),
})

export async function POST(request: Request) {
    const clientIp = getClientIp(request)
    const rateLimitResult = waitlistLimiter.isAllowed(`stripe-intent:${clientIp}`)

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
        const parsed = createIntentSchema.safeParse(body)

        if (!parsed.success) {
            const details = parsed.error.errors
                .map((err) => `${err.path.join(".")}: ${err.message}`)
                .join("; ")

            return NextResponse.json({ error: "Validation failed", details }, { status: 400 })
        }

        const subtotal = parsed.data.cartItems.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0
        )

        const amountInPaise = Math.round(subtotal * 100)

        const stripe = getStripeClient()
        const intent = await stripe.paymentIntents.create({
            amount: amountInPaise,
            currency: "inr",
            receipt_email: parsed.data.email,
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                checkout_mode: "mvp_phase1",
            },
        })

        return NextResponse.json({
            success: true,
            paymentIntentId: intent.id,
            clientSecret: intent.client_secret,
            amount: subtotal,
            currency: "INR",
        })
    } catch (error) {
        console.error("Stripe create intent API error:", error)
        return NextResponse.json({ error: "Failed to create payment intent" }, { status: 500 })
    }
}
