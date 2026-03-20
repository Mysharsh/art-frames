import type { Metadata } from "next"
import Link from "next/link"
import { AppShell } from "@/components/app-shell"
import { ContentPageShell } from "@/components/page-shells"
import { createAdminClient } from "@/lib/supabase/admin"

export const metadata: Metadata = {
    title: "Order Success",
    description: "Your order has been placed successfully.",
}

export default async function OrderSuccessPage({
    searchParams,
}: {
    searchParams: Promise<{ orderId?: string; status?: string }>
}) {
    const { orderId, status } = await searchParams
    let order: {
        order_id: string
        status: string
        payment_method: string
        subtotal: number | null
        cod_fee: number | null
        total: number
        created_at: string
    } | null = null

    if (orderId) {
        try {
            const admin = createAdminClient()
            const { data } = await admin
                .from("orders")
                .select("order_id,status,payment_method,subtotal,cod_fee,total,created_at")
                .eq("order_id", orderId)
                .limit(1)
                .maybeSingle()

            order = data
        } catch (error) {
            console.error("Order success fetch warning:", error)
        }
    }

    const displayOrderId = order?.order_id ?? orderId ?? "N/A"
    const displayStatus = (order?.status ?? status ?? "created").replaceAll("_", " ")

    return (
        <AppShell>
            <ContentPageShell
                eyebrow="Order Confirmed"
                title="Thank You For Your Order"
                description="Your order is in progress. You can track recent orders from your account page."
            >
                <section className="rounded-2xl border border-border/70 bg-card p-5">
                    <p className="text-sm leading-7 text-muted-foreground">
                        Order ID: <span className="font-semibold text-foreground">{displayOrderId}</span>
                    </p>
                    <p className="mt-1 text-sm leading-7 text-muted-foreground">
                        Current Status:{" "}
                        <span className="font-semibold text-foreground">
                            {displayStatus}
                        </span>
                    </p>

                    {order ? (
                        <>
                            <p className="mt-1 text-sm leading-7 text-muted-foreground">
                                Payment Method:{" "}
                                <span className="font-semibold text-foreground">
                                    {order.payment_method.replaceAll("_", " ")}
                                </span>
                            </p>
                            <p className="mt-1 text-sm leading-7 text-muted-foreground">
                                Total:{" "}
                                <span className="font-semibold text-foreground">${order.total.toFixed(2)}</span>
                            </p>
                        </>
                    ) : null}

                    <div className="mt-5 flex flex-wrap gap-3">
                        <Link
                            href="/orders"
                            className="inline-flex rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                        >
                            View My Orders
                        </Link>
                        <Link
                            href="/collections/all"
                            className="inline-flex rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                        >
                            Continue Shopping
                        </Link>
                    </div>
                </section>
            </ContentPageShell>
        </AppShell>
    )
}
