import type { Metadata } from "next"
import Link from "next/link"
import { Package } from "lucide-react"
import { AppShell } from "@/components/app-shell"
import { ContentPageShell } from "@/components/page-shells"
import { createClient } from "@/lib/supabase/server"
import { formatPrice } from "@/lib/pricing"
import { getOrderStatusLabel } from "@/lib/orders"

// Per-user data: always render at request time, never prerender at build.
export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "My Orders",
  description: "Track and manage your recent orders.",
  robots: { index: false, follow: false },
}

interface OrderRow {
  order_id: string
  status: string
  payment_method: string
  total: number | string
  line_items: Array<{ title: string; size: string; material: string; quantity: number }> | null
  created_at: string
}

type OrdersResult =
  | { state: "signed-out" }
  | { state: "error" }
  | { state: "ok"; orders: OrderRow[] }

async function loadOrders(): Promise<OrdersResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { state: "signed-out" }
    }

    // RLS (orders_select_own_or_admin) also restricts rows to this user.
    const { data, error } = await supabase
      .from("orders")
      .select("order_id, status, payment_method, total, line_items, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) {
      console.error("Order history query failed:", error)
      return { state: "error" }
    }

    return { state: "ok", orders: (data ?? []) as OrderRow[] }
  } catch (error) {
    console.error("Order history unavailable:", error)
    return { state: "error" }
  }
}

const cardClass = "rounded-2xl border border-border/70 bg-card p-5"
const primaryAction =
  "inline-flex rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

export default async function OrdersPage() {
  const result = await loadOrders()

  return (
    <AppShell>
      <ContentPageShell
        eyebrow="Orders"
        title="My Orders"
        description="Orders placed while signed in appear here with their latest status."
      >
        {result.state === "signed-out" ? (
          <section className={cardClass}>
            <p className="text-sm leading-7 text-muted-foreground">
              Sign in to see your order history. Ordered as a guest? Contact us with the order ID from your confirmation page.
            </p>
            <div className="mt-5">
              <Link href="/auth/login?next=/orders" className={primaryAction}>
                Sign In
              </Link>
            </div>
          </section>
        ) : result.state === "error" ? (
          <section className={cardClass} role="alert">
            <p className="text-sm leading-7 text-muted-foreground">
              We couldn&apos;t load your orders right now. Please refresh the page in a moment.
            </p>
          </section>
        ) : result.orders.length === 0 ? (
          <section className={`${cardClass} text-center`}>
            <Package className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
            <p className="mt-3 text-sm leading-7 text-muted-foreground">You haven&apos;t placed any orders yet.</p>
            <div className="mt-5">
              <Link href="/collections/all" className={primaryAction}>
                Browse Collections
              </Link>
            </div>
          </section>
        ) : (
          <ul className="space-y-3">
            {result.orders.map((order) => {
              const items = order.line_items ?? []
              const itemCount = items.reduce((acc, item) => acc + item.quantity, 0)
              return (
                <li key={order.order_id} className={cardClass}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{order.order_id}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {dateFormatter.format(new Date(order.created_at))} · {itemCount} item{itemCount === 1 ? "" : "s"} ·{" "}
                        {order.payment_method === "cod" ? "Cash on Delivery" : "Online payment"}
                      </p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                      {getOrderStatusLabel(order.status)}
                    </span>
                  </div>

                  <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                    {items.map((item, index) => (
                      <li key={`${order.order_id}-${index}`}>
                        {item.title} ×{item.quantity}{" "}
                        <span className="text-xs">
                          ({item.size} • {item.material})
                        </span>
                      </li>
                    ))}
                  </ul>

                  <p className="mt-3 border-t border-border pt-3 text-sm font-semibold text-foreground">
                    Total {formatPrice(Number(order.total))}
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </ContentPageShell>
    </AppShell>
  )
}
