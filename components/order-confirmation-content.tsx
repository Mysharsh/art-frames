"use client"

import { useMemo, useSyncExternalStore } from "react"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"
import { formatPrice } from "@/lib/pricing"
import { LAST_ORDER_STORAGE_KEY, getOrderStatusLabel, parseLastOrder } from "@/lib/orders"

const subscribe = () => () => {}

function readStoredOrder() {
  try {
    return sessionStorage.getItem(LAST_ORDER_STORAGE_KEY)
  } catch {
    return null
  }
}

const primaryAction =
  "inline-flex justify-center rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
const secondaryAction =
  "inline-flex justify-center rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-foreground transition-colors hover:border-primary/40 hover:text-primary"

function Actions() {
  return (
    <div className="mt-5 flex flex-wrap gap-2">
      <Link href="/collections/all" className={primaryAction}>
        Continue Shopping
      </Link>
      <Link href="/orders" className={secondaryAction}>
        View My Orders
      </Link>
    </div>
  )
}

export function OrderConfirmationContent({ orderId }: { orderId: string | null }) {
  // sessionStorage is browser-only: the server snapshot is null and the summary
  // appears after hydration.
  const raw = useSyncExternalStore(subscribe, readStoredOrder, () => null)
  const order = useMemo(() => (orderId ? parseLastOrder(raw, orderId) : null), [raw, orderId])

  if (!orderId) {
    return (
      <section className="rounded-2xl border border-border/70 bg-card p-5">
        <p className="text-sm leading-7 text-muted-foreground">
          We couldn&apos;t find that order. If you just placed one, check My Orders or contact us with your order ID.
        </p>
        <Actions />
      </section>
    )
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-2xl border border-border/70 bg-card p-5" aria-labelledby="order-placed-heading">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
          <div>
            <h2 id="order-placed-heading" className="font-display text-2xl leading-none text-foreground">
              {order ? `Thank you, ${order.customerName.split(" ")[0]}!` : "Thank you for your order!"}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Order <span className="font-semibold text-foreground">{orderId}</span> has been placed.
              Keep this ID for any questions about your order.
            </p>
          </div>
        </div>

        <h3 className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-foreground/75">
          What happens next
        </h3>
        <ol className="mt-3 space-y-3 text-sm text-muted-foreground">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
            <span>We&apos;ll contact you on the phone number you gave to confirm your Cash on Delivery order.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground">2</span>
            <span>Your posters are printed, packed and shipped.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground">3</span>
            <span>
              Pay {order ? formatPrice(order.total) : "the order total"} on delivery, usually within 5–7 business days
              {order ? ` in ${order.city}` : ""}.
            </span>
          </li>
        </ol>

        <Actions />
      </section>

      {order ? (
        <aside className="rounded-2xl border border-border/70 bg-card p-5" aria-label="Order summary">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground/75">
              Order Summary
            </h2>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
              {getOrderStatusLabel(order.status)}
            </span>
          </div>

          <ul className="mt-4 space-y-3 text-sm">
            {order.items.map((item) => (
              <li
                key={`${item.productId}-${item.size}-${item.material}`}
                className="flex items-start justify-between gap-3"
              >
                <div>
                  <p className="font-medium text-foreground">
                    {item.title} <span className="text-muted-foreground">×{item.quantity}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {item.size} • {item.material}
                  </p>
                </div>
                <span className="text-muted-foreground">{formatPrice(item.lineTotal)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-4 space-y-1 border-t border-border pt-3 text-sm">
            <div className="flex items-center justify-between text-muted-foreground">
              <dt>Subtotal</dt>
              <dd>{formatPrice(order.subtotal)}</dd>
            </div>
            {order.codFee > 0 ? (
              <div className="flex items-center justify-between text-muted-foreground">
                <dt>COD Fee</dt>
                <dd>{formatPrice(order.codFee)}</dd>
              </div>
            ) : null}
            <div className="flex items-center justify-between pt-1 font-semibold text-foreground">
              <dt>Total (pay on delivery)</dt>
              <dd>{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </aside>
      ) : null}
    </div>
  )
}
