"use client"

import Image from "next/image"
import Link from "next/link"
import { getMaterialLabel, type Product } from "@/lib/products"
import { formatPrice } from "@/lib/pricing"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null

  return (
    <Link
      href={`/products/${product.id}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.image}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-80 transition-opacity group-hover:opacity-100" />
        {discountPercent && discountPercent > 0 ? (
          <span className="absolute left-2 top-2 rounded-full bg-destructive px-2.5 py-1 text-2xs font-bold uppercase tracking-widest text-destructive-foreground">
            -{discountPercent}%
          </span>
        ) : null}
        <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between gap-2">
          <div className="whitespace-nowrap rounded-md border border-white/20 bg-black/45 px-2 py-1 text-2xs font-medium uppercase tracking-label text-white/90">
            {getMaterialLabel(product)}
          </div>
          <span className="translate-y-3 rounded-full border border-white/25 bg-black/45 px-3 py-1 text-2xs font-semibold uppercase tracking-label text-white/90 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            View drop
          </span>
        </div>
      </div>
      <div className="p-3.5">
        <p className="text-2xs font-semibold uppercase tracking-kicker text-muted-foreground">
          {product.category}
        </p>
        <h3 className="mt-1 truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary-ink">
          {product.title}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">by {product.artist}</p>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-base font-bold text-foreground">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-xs font-semibold text-muted-foreground line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-border/80 pt-3">
          <span className="whitespace-nowrap text-2xs font-semibold uppercase tracking-label text-muted-foreground">
            {product.sizes.length} sizes
          </span>
          <span aria-hidden="true" className="hidden whitespace-nowrap text-2xs font-semibold uppercase tracking-label text-primary-ink sm:inline">
            View details
          </span>
        </div>
      </div>
    </Link>
  )
}
