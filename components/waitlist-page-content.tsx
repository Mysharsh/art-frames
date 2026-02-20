"use client"

import Link from "next/link"
import { ClipboardList, ArrowRight } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { getProductById } from "@/lib/products"
import Image from "next/image"

export function WaitlistPageContent() {
  const { waitlistItems, waitlistCount } = useAppStore()

  return (
    <div className="px-4 py-6">
      <h1 className="font-display text-2xl font-bold text-foreground">
        My Waitlist
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {waitlistCount} total sign-ups across all products
      </p>

      {waitlistItems.length === 0 ? (
        <div className="mt-16 flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <ClipboardList className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mt-4 font-display text-lg font-bold text-foreground">
            No waitlist items yet
          </h2>
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            Browse our collection and join the waitlist for products you love.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105 active:scale-95"
          >
            Browse Posters
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {waitlistItems.map((item, index) => {
            const product = getProductById(item.productId)
            return (
              <Link
                key={`${item.productId}-${index}`}
                href={`/product/${item.productId}`}
                className="flex items-center gap-4 rounded-xl bg-card p-3 transition-colors hover:ring-1 hover:ring-primary/30"
              >
                {product && (
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={product.image}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {item.productTitle}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Signed up as{" "}
                    <span className="text-primary">{item.email}</span>
                  </p>
                  {product && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      From ${product.price}
                    </p>
                  )}
                </div>
                <div className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  Joined
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
