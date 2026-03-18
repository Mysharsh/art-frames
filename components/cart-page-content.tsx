"use client"

import Link from "next/link"
import { Minus, Plus, Trash2 } from "lucide-react"
import { useAppStore } from "@/lib/store"

export function CartPageContent() {
  const cartItems = useAppStore((s) => s.cartItems)
  const updateCartQuantity = useAppStore((s) => s.updateCartQuantity)
  const removeFromCart = useAppStore((s) => s.removeFromCart)
  const clearCart = useAppStore((s) => s.clearCart)

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const codFee = cartItems.length > 0 ? 49 : 0
  const total = subtotal + codFee

  if (cartItems.length === 0) {
    return (
      <section className="rounded-2xl border border-border/70 bg-card p-5">
        <p className="text-sm leading-7 text-muted-foreground">
          Your cart is empty. Browse collections and add your first wall art piece.
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
      <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-5">
        {cartItems.map((item) => (
          <article
            key={`${item.productId}-${item.size}-${item.material}`}
            className="rounded-xl border border-border/70 bg-background/70 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold text-foreground">{item.title}</h2>
                <p className="text-xs text-muted-foreground">{item.artist}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {item.size} • {item.material}
                </p>
              </div>
              <button
                onClick={() =>
                  removeFromCart(item.productId, item.size, item.material)
                }
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:text-destructive"
                aria-label="Remove item"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">
                ${(item.price * item.quantity).toFixed(2)}
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    updateCartQuantity(
                      item.productId,
                      item.size,
                      item.material,
                      item.quantity - 1
                    )
                  }
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-foreground"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-sm font-semibold text-foreground">
                  {item.quantity}
                </span>
                <button
                  onClick={() =>
                    updateCartQuantity(
                      item.productId,
                      item.size,
                      item.material,
                      item.quantity + 1
                    )
                  }
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background text-foreground"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <aside className="rounded-2xl border border-border/70 bg-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground/75">
          Order Summary
        </h2>

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>COD Fee</span>
            <span>${codFee.toFixed(2)}</span>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-3 font-semibold text-foreground">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>

        <div className="mt-5 grid gap-2">
          <Link
            href="/checkout"
            className="inline-flex justify-center rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            Continue To Checkout
          </Link>
          <button
            onClick={clearCart}
            className="inline-flex justify-center rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-foreground/80 transition-colors hover:border-destructive/40 hover:text-destructive"
          >
            Clear Cart
          </button>
        </div>
      </aside>
    </div>
  )
}
