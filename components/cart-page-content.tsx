"use client"

import Link from "next/link"
import { Minus, Plus, Trash2 } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { COD_FEE, MAX_LINE_QUANTITY, formatPrice, getUnitPrice } from "@/lib/pricing"
import { Button, buttonVariants } from "@/components/ui/button"

export function CartPageContent() {
  const cartItems = useAppStore((s) => s.cartItems)
  const updateCartQuantity = useAppStore((s) => s.updateCartQuantity)
  const removeFromCart = useAppStore((s) => s.removeFromCart)
  const clearCart = useAppStore((s) => s.clearCart)

  const subtotal = cartItems.reduce((acc, item) => acc + getUnitPrice(item.productId, item.price) * item.quantity, 0)

  if (cartItems.length === 0) {
    return (
      <section className="rounded-2xl border border-border/70 bg-card p-5">
        <p className="text-sm leading-7 text-muted-foreground">
          Your cart is empty. Browse collections and add your first wall art piece.
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
              <Button
                variant="outline"
                size="icon"
                className="rounded-md text-muted-foreground hover:border-destructive/40 hover:text-destructive"
                onClick={() =>
                  removeFromCart(item.productId, item.size, item.material)
                }
                aria-label={`Remove ${item.title} (${item.size}, ${item.material})`}
              >
                <Trash2 />
              </Button>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">
                {formatPrice(getUnitPrice(item.productId, item.price) * item.quantity)}
              </p>

              <div className="flex items-center gap-2" role="group" aria-label={`Quantity of ${item.title}`}>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-md"
                  onClick={() =>
                    updateCartQuantity(
                      item.productId,
                      item.size,
                      item.material,
                      item.quantity - 1
                    )
                  }
                  aria-label={item.quantity === 1 ? `Remove ${item.title}` : "Decrease quantity"}
                >
                  <Minus />
                </Button>
                <span className="w-8 text-center text-sm font-semibold text-foreground" aria-live="polite">
                  {item.quantity}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-md"
                  disabled={item.quantity >= MAX_LINE_QUANTITY}
                  onClick={() =>
                    updateCartQuantity(
                      item.productId,
                      item.size,
                      item.material,
                      item.quantity + 1
                    )
                  }
                  aria-label="Increase quantity"
                >
                  <Plus />
                </Button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <aside className="rounded-2xl border border-border/70 bg-card p-5">
        <h2 className="text-sm font-semibold uppercase tracking-label text-foreground/75">
          Order Summary
        </h2>

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center justify-between font-semibold text-foreground">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            A {formatPrice(COD_FEE)} fee applies to Cash on Delivery orders. Final total is shown at checkout.
          </p>
        </div>

        <div className="mt-5 grid gap-2">
          <Link href="/checkout" className={buttonVariants({ size: "pill" })}>
            Continue To Checkout
          </Link>
          <Button
            variant="outline"
            size="pill"
            className="hover:border-destructive/40 hover:text-destructive"
            onClick={clearCart}
          >
            Clear Cart
          </Button>
        </div>
      </aside>
    </div>
  )
}
