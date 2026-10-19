"use client"

import { useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { checkoutOrderSchema, getFieldErrors } from "@/lib/validations"
import { COD_FEE, formatPrice, getCodFee, getUnitPrice, type PaymentMethod } from "@/lib/pricing"
import { saveLastOrder, type OrderConfirmation } from "@/lib/orders"
import { INDIAN_STATES } from "@/lib/address"
import { Button, buttonVariants } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

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

type FormField = keyof typeof initialForm

/** Visual and focus order; the first invalid field in this order gets focus. */
const FIELD_ORDER: FormField[] = [
  "customerName",
  "email",
  "phone",
  "addressLine1",
  "addressLine2",
  "city",
  "state",
  "pincode",
  "gstNumber",
  "notes",
]

const selectClassName =
  "flex h-11 w-full rounded-xl border border-input bg-background px-4 text-base ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-[invalid=true]:border-destructive md:text-sm"

export function CheckoutPageContent() {
  const router = useRouter()
  const cartItems = useAppStore((s) => s.cartItems)
  const clearCart = useAppStore((s) => s.clearCart)
  const [form, setForm] = useState(initialForm)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<FormField, string>>>({})
  const errorSummaryRef = useRef<HTMLDivElement>(null)
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null)

  const subtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + getUnitPrice(item.productId, item.price) * item.quantity, 0),
    [cartItems]
  )
  const codFee = getCodFee(paymentMethod, cartItems.length)
  const total = subtotal + codFee

  const buildPayload = (values: typeof initialForm) => ({
    ...values,
    paymentMethod,
    // Only identifiers are sent; the server prices every line from the catalogue.
    cartItems: cartItems.map(({ productId, size, material, quantity }) => ({
      productId,
      size,
      material,
      quantity,
    })),
  })

  const updateField = (field: FormField, value: string) => {
    const next = { ...form, [field]: value }
    setForm(next)

    // Re-check only fields already showing an error, so the message clears as soon as
    // the value is fixed without nagging about fields the customer hasn't reached.
    if (fieldErrors[field]) {
      const parsed = checkoutOrderSchema.safeParse(buildPayload(next))
      const errors = parsed.success ? {} : getFieldErrors(parsed.error)
      setFieldErrors((prev) => {
        const updated = { ...prev }
        if (errors[field]) updated[field] = errors[field]
        else delete updated[field]
        return updated
      })
    }
  }

  const fieldProps = (field: FormField) => ({
    name: field,
    value: form[field],
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      updateField(field, event.target.value),
  })

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitError("")

    const parsed = checkoutOrderSchema.safeParse(buildPayload(form))
    if (!parsed.success) {
      const errors = getFieldErrors(parsed.error)
      const invalidFields = FIELD_ORDER.filter((field) => errors[field])
      setFieldErrors(Object.fromEntries(invalidFields.map((field) => [field, errors[field]])))

      if (invalidFields.length > 0) {
        setSubmitError(
          `Please fix ${invalidFields.length} field${invalidFields.length === 1 ? "" : "s"} below.`
        )
        document.getElementById(`checkout-${invalidFields[0]}`)?.focus()
      } else {
        // Not a form field (e.g. a cart line): show it in the summary.
        setSubmitError(Object.values(errors)[0] ?? "Please check your details.")
        errorSummaryRef.current?.focus()
      }
      return
    }

    setFieldErrors({})

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
      errorSummaryRef.current?.focus()
    } finally {
      setIsSubmitting(false)
    }
  }

  // The cart is cleared once the order is placed; keep showing progress until the
  // confirmation page loads instead of flashing the empty-cart state.
  if (placedOrderId) {
    return (
      <section className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-5" role="status">
        <Loader2 className="h-4 w-4 animate-spin text-primary-ink" />
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
          <Link href="/collections/all" className={buttonVariants({ variant: "soft", size: "pill" })}>
            Browse Collections
          </Link>
        </div>
      </section>
    )
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <form onSubmit={handleSubmit} noValidate className="space-y-6 rounded-2xl border border-border/70 bg-card p-5">
        <div
          ref={errorSummaryRef}
          tabIndex={-1}
          role="alert"
          className={submitError ? "rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm font-medium text-destructive focus:outline-none" : "sr-only"}
        >
          {submitError}
        </div>

        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold uppercase tracking-label text-foreground/75">
            Contact
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="checkout-customerName" label="Full name" error={fieldErrors.customerName} className="sm:col-span-2">
              <Input {...fieldProps("customerName")} autoComplete="name" maxLength={120} />
            </Field>
            <Field id="checkout-email" label="Email" hint="For your order updates" error={fieldErrors.email}>
              <Input {...fieldProps("email")} type="email" autoComplete="email" inputMode="email" maxLength={254} />
            </Field>
            <Field id="checkout-phone" label="Mobile number" hint="We'll call to confirm your order" error={fieldErrors.phone}>
              <Input {...fieldProps("phone")} type="tel" autoComplete="tel-national" inputMode="tel" maxLength={16} />
            </Field>
          </div>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-sm font-semibold uppercase tracking-label text-foreground/75">
            Delivery address
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="checkout-addressLine1" label="House number and street" error={fieldErrors.addressLine1} className="sm:col-span-2">
              <Input {...fieldProps("addressLine1")} autoComplete="address-line1" maxLength={180} />
            </Field>
            <Field id="checkout-addressLine2" label="Area, landmark" optional error={fieldErrors.addressLine2} className="sm:col-span-2">
              <Input {...fieldProps("addressLine2")} autoComplete="address-line2" maxLength={180} />
            </Field>
            <Field id="checkout-city" label="City" error={fieldErrors.city}>
              <Input {...fieldProps("city")} autoComplete="address-level2" maxLength={80} />
            </Field>
            <Field id="checkout-pincode" label="Pincode" error={fieldErrors.pincode}>
              <Input {...fieldProps("pincode")} autoComplete="postal-code" inputMode="numeric" maxLength={7} />
            </Field>
            <Field id="checkout-state" label="State" error={fieldErrors.state} className="sm:col-span-2">
              <select {...fieldProps("state")} autoComplete="address-level1" className={selectClassName}>
                <option value="">Select your state</option>
                {INDIAN_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </Field>
            <Field id="checkout-gstNumber" label="GST number" optional hint="For a business invoice" error={fieldErrors.gstNumber}>
              <Input {...fieldProps("gstNumber")} autoCapitalize="characters" maxLength={15} />
            </Field>
            <Field id="checkout-notes" label="Delivery notes" optional error={fieldErrors.notes} className="sm:col-span-2">
              <Textarea {...fieldProps("notes")} maxLength={300} />
            </Field>
          </div>
        </fieldset>

        <fieldset className="space-y-3">
          <legend className="text-sm font-semibold uppercase tracking-label text-foreground/75">
            Payment method
          </legend>
          <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm has-[:checked]:border-primary has-[:checked]:bg-primary/10">
            <input
              type="radio"
              name="paymentMethod"
              value="cod"
              checked={paymentMethod === "cod"}
              onChange={() => setPaymentMethod("cod")}
              className="h-4 w-4 accent-[hsl(var(--primary-ink))]"
            />
            <span>
              Cash on Delivery <span className="text-muted-foreground">(+{formatPrice(COD_FEE)})</span>
            </span>
          </label>
          <label className="flex min-h-11 cursor-not-allowed items-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
            <input type="radio" name="paymentMethod" value="online" disabled className="h-4 w-4" />
            Online payment (coming soon)
          </label>
        </fieldset>

        <Button type="submit" size="block" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" aria-hidden="true" />
              Placing order…
            </>
          ) : (
            `Place Order · ${formatPrice(total)}`
          )}
        </Button>
      </form>

      <aside className="rounded-2xl border border-border/70 bg-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-label text-foreground/75">
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
          <Link href="/cart" className={buttonVariants({ variant: "outline", size: "pill" })}>
            Back To Cart
          </Link>
        </div>
      </aside>
    </div>
  )
}
