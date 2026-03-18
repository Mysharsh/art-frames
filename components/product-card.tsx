"use client"

import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/lib/products"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  // Synthetic rating for demo (in real app, this would come from database)
  // Use product ID to seed ratings so they're stable across renders
  const productIdSum = product.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const rating = 4.0 + ((productIdSum % 10) / 10) * 0.9
  const reviewCount = ((productIdSum * 7) % 90) + 10
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
        <div className="absolute left-2 top-2 flex flex-col gap-1">
          <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
            Metal Poster
          </span>
          {product.onSale && (
            <span className="rounded-full bg-destructive px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-destructive-foreground">
              Hot Deal
            </span>
          )}
        </div>
        {discountPercent && discountPercent > 0 && (
          <span className="absolute right-2 top-2 rounded-full border border-primary/40 bg-background/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
            -{discountPercent}%
          </span>
        )}
        <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between gap-2">
          <div className="rounded-md border border-white/20 bg-black/45 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-white/90">
            {product.materials.includes("Metal Print") ? "Premium metal" : product.materials[0]}
          </div>
          <span className="translate-y-3 rounded-full border border-white/25 bg-black/45 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/90 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            View drop
          </span>
        </div>
      </div>
      <div className="p-3.5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          {product.category}
        </p>
        <h3 className="mt-1 truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
          {product.title}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">by {product.artist}</p>
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <span>⭐ {rating}</span>
          <span>({reviewCount})</span>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-base font-bold text-foreground">
            ${product.price}
          </span>
          {product.originalPrice && (
            <span className="text-xs font-semibold text-muted-foreground line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-border/80 pt-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {product.sizes.length} sizes
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary">
            Quick view
          </span>
        </div>
      </div>
    </Link>
  )
}
