"use client"

import Image from "next/image"
import Link from "next/link"
import { getSaleProducts } from "@/lib/products"

export function FeaturedRow() {
  const saleProducts = getSaleProducts().slice(0, 6)

  return (
    <section className="px-4 pt-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">
            Best Selling
          </h2>
          <p className="text-xs text-muted-foreground">Fan favorites & trending picks</p>
        </div>
        <Link href="/?category=All" className="text-xs font-medium text-primary">
          See all
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
        {saleProducts.map((product) => (
          <Link
            key={product.id}
            href={`/product/${product.id}`}
            className="flex-shrink-0 w-[140px] group"
          >
            <div className="relative aspect-square rounded-lg overflow-hidden bg-card">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="140px"
              />
              {product.onSale && product.originalPrice && (
                <span className="absolute bottom-2 left-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
                  -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                </span>
              )}
            </div>
            <h3 className="text-xs font-semibold text-foreground mt-2 truncate">{product.title}</h3>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-xs font-bold text-foreground">${product.price}</span>
              {product.originalPrice && (
                <span className="text-[10px] text-muted-foreground line-through">${product.originalPrice}</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
