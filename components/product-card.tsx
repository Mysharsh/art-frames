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

  return (
    <Link
      href={`/product/${product.id}`}
      className="group block overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={product.image}
          alt={product.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
          sizes="(max-width: 640px) 50vw, 33vw"
        />
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
      </div>
      <div className="p-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          {product.category}
        </p>
        <h3 className="mt-1 truncate text-sm font-semibold text-foreground">
          {product.title}
        </h3>
        <p className="mt-0.5 text-xs text-muted-foreground">by {product.artist}</p>
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <span>⭐ {rating}</span>
          <span>({reviewCount})</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-base font-bold text-foreground">
            ${product.price}
          </span>
          {product.originalPrice && (
            <span className="text-xs font-semibold text-muted-foreground line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
