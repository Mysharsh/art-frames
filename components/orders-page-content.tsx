"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useAppStore } from "@/store/cart"

function formatStatus(status: string) {
    return status.replaceAll("_", " ")
}

export function OrdersPageContent() {
    const recentOrders = useAppStore((s) => s.recentOrders)

    const sortedOrders = useMemo(
        () => [...recentOrders].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)),
        [recentOrders]
    )

    if (sortedOrders.length === 0) {
        return (
            <section className="rounded-2xl border border-border/70 bg-card p-5">
                <p className="text-sm leading-7 text-muted-foreground">
                    No orders yet. Place your first order from checkout to see status updates here.
                </p>
                <div className="mt-5">
                    <Link
                        href="/collections/all"
                        className="inline-flex rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
                    >
                        Start Shopping
                    </Link>
                </div>
            </section>
        )
    }

    return (
        <div className="space-y-3">
            {sortedOrders.map((order) => (
                <article
                    key={order.orderId}
                    className="rounded-2xl border border-border/70 bg-card p-5"
                >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                                Order ID
                            </p>
                            <h2 className="font-semibold text-foreground">{order.orderId}</h2>
                        </div>
                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                            {formatStatus(order.status)}
                        </span>
                    </div>

                    <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                        <p>
                            <span className="font-medium text-foreground">Amount:</span> ${order.amount.toFixed(2)}
                        </p>
                        <p>
                            <span className="font-medium text-foreground">Payment:</span> {order.paymentMethod.toUpperCase()}
                        </p>
                        <p>
                            <span className="font-medium text-foreground">Placed:</span>{" "}
                            {new Date(order.createdAt).toLocaleString()}
                        </p>
                    </div>
                </article>
            ))}
        </div>
    )
}
