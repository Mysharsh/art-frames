"use client"

import { ProductCard } from "@/components/product-card"
import type { Product } from "@/lib/products"

interface ProductGridProps {
  products: Product[]
  title?: string
  hideTitle?: boolean
}

export function ProductGrid({ products, title, hideTitle }: ProductGridProps) {
  return (
    <section className="px-4 py-6">
      {title && !hideTitle && (
        <div className="mb-4 flex items-end justify-between">
          <h2 className="font-display text-2xl tracking-wide text-foreground">
            {title}
          </h2>
          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Metal Posters
          </span>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
