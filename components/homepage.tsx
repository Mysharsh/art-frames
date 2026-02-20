"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { HeroBanner } from "@/components/hero-banner"
import { CategoryThumbnails } from "@/components/category-thumbnails"
import { ProductTabs } from "@/components/product-tabs"
import { type Category } from "@/lib/products"

export function Homepage() {
  const searchParams = useSearchParams()
  const initialCategory = (searchParams.get("category") as Category) || "All"
  const [selectedCategory, setSelectedCategory] =
    useState<Category>(initialCategory)

  useEffect(() => {
    const category = (searchParams.get("category") as Category) || "All"
    setSelectedCategory(category)
  }, [searchParams])

  return (
    <div className="w-full">
      <HeroBanner />
      <CategoryThumbnails />
      
      {/* All-Time Favorites section header */}
      <section className="px-4 py-8">
        <div className="flex flex-col items-center text-center">
          <h2 className="font-display text-4xl font-bold tracking-wide text-foreground">
            All-Time Favorites
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Discover the most loved metal posters in our collection
          </p>
        </div>
      </section>
      
      <ProductTabs selectedCategory={selectedCategory} />
    </div>
  )
}
