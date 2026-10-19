"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { checkoutOrderSchema } from "@/lib/validations"
import { COD_FEE, formatPrice, getCodFee, getUnitPrice, type PaymentMethod } from "@/lib/pricing"
import { saveLastOrder, type OrderConfirmation } from "@/lib/orders"

const initialForm = {
  customerName: "",
  email: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  gstNumber: "",
  notes: "",
}

export function CheckoutPageContent() {
  const router = useRouter()
  const cartItems = useAppStore((s) => s.cartItems)
  const clearCart = useAppStore((s) => s.clearCart)
  const [form, setForm] = useState(initialForm)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null)

  const subtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + getUnitPrice(item.productId, item.price) * item.quantity, 0),
    [cartItems]
  )
  const codFee = getCodFee(paymentMethod, cartItems.length)
  const total = subtotal + codFee

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitError("")

    // Only identifiers are sent; the server prices every line from the catalogue.
    const payload = {
      ...form,
      paymentMethod,
      cartItems: cartItems.map(({ productId, size, material, quantity }) => ({
        productId,
        size,
        material,
        quantity,
      })),
    }

    const parsed = checkoutOrderSchema.safeParse(payload)
    if (!parsed.success) {
      setSubmitError(parsed.error.errors[0]?.message || "Please check your details.")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch("/api/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to place order")
      }

      const order = result.order as OrderConfirmation
      saveLastOrder(order)
      setPlacedOrderId(order.orderId)
      router.replace(`/orders/confirmation?id=${encodeURIComponent(order.orderId)}`)
      clearCart()
    } catch (error: unknown) {
      setSubmitError(error instanceof Error ? error.message : "Failed to place order")
    } finally {
      setIsSubmitting(false)
    }
  }

  // The cart is cleared once the order is placed; keep showing progress until the
  // confirmation page loads instead of flashing the empty-cart state.
  if (placedOrderId) {
    return (
      <section className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-5" role="status">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Order {placedOrderId} placed. Loading your confirmation…</p>
      </section>
    )
  }

  if (cartItems.length === 0) {
    return (
      <section className="rounded-2xl border border-border/70 bg-card p-5">
        <p className="text-sm leading-7 text-muted-foreground">
          Your cart is empty. Add products before continuing to checkout.
        </p>
        <div className="mt-5">
          <Link
            href="/collections/all"
            className="inline-flex rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            Browse Collections
          </Link>
        </div>
      </section>
    )
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-border/70 bg-card p-5">
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground/75">
            Shipping Details
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={form.customerName}
              onChange={(e) => updateField("customerName", e.target.value)}
              placeholder="Full Name"
              className="rounded-xl border border-border bg-background px-4 py-3 text-sm"
            />
            <input
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="Email"
              type="email"
              className="rounded-xl border border-border bg-background px-4 py-3 text-sm"
            />
            <input
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="Phone (10 digits)"
              className="rounded-xl border border-border bg-background px-4 py-3 text-sm"
            />
            <input
              value={form.pincode}
              onChange={(e) => updateField("pincode", e.target.value)}
              placeholder="Pincode"
              className="rounded-xl border border-border bg-background px-4 py-3 text-sm"
            />
          </div>

          <input
            value={form.addressLine1}
            onChange={(e) => updateField("addressLine1", e.target.value)}
            placeholder="Address Line 1"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm"
          />
          <input
            value={form.addressLine2}
            onChange={(e) => updateField("addressLine2", e.target.value)}
            placeholder="Address Line 2 (optional)"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm"
          />
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={form.city}
              onChange={(e) => updateField("city", e.target.value)}
              placeholder="City"
              className="rounded-xl border border-border bg-background px-4 py-3 text-sm"
            />
            <input
              value={form.state}
              onChange={(e) => updateField("state", e.target.value)}
              placeholder="State"
              className="rounded-xl border border-border bg-background px-4 py-3 text-sm"
            />
          </div>
          <input
            value={form.gstNumber}
            onChange={(e) => updateField("gstNumber", e.target.value)}
            placeholder="GST Number (optional)"
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm"
          />
          <textarea
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
            placeholder="Delivery notes (optional)"
            className="min-h-24 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm"
          />
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground/75">
            Payment Method
          </h2>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm">
            <input
              type="radio"
              name="paymentMethod"
              checked={paymentMethod === "cod"}
              onChange={() => setPaymentMethod("cod")}
            />
            Cash on Delivery (+{formatPrice(COD_FEE)})
          </label>
          <label className="flex cursor-not-allowed items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground opacity-60">
            <input type="radio" name="paymentMethod" disabled />
            Online payment (coming soon)
          </label>
        </section>

        {submitError ? <p className="text-sm text-destructive">{submitError}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-full border border-primary/40 bg-primary/10 px-4 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Place Order"}
        </button>
      </form>

      <aside className="rounded-2xl border border-border/70 bg-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground/75">
          Order Summary
        </h2>

        <div className="mt-4 space-y-2 text-sm">
          {cartItems.map((item) => (
            <div key={`${item.productId}-${item.size}-${item.material}`} className="flex items-center justify-between text-muted-foreground">
              <span className="pr-3">{item.title} x{item.quantity}</span>
              <span>{formatPrice(getUnitPrice(item.productId, item.price) * item.quantity)}</span>
            </div>
          ))}

          <div className="mt-3 border-t border-border pt-3">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="mt-1 flex items-center justify-between text-muted-foreground">
              <span>COD Fee</span>
              <span>{formatPrice(codFee)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between font-semibold text-foreground">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <Link
            href="/cart"
            className="inline-flex rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            Back To Cart
          </Link>
        </div>
      </aside>
    </div>
  )
}
