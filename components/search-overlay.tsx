"use client"

import { useState, useRef, useEffect } from "react"
import { Search, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { products } from "@/lib/products"
import { useAppStore } from "@/lib/store"

export function SearchOverlay() {
  const [query, setQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const closeSearch = useAppStore((s) => s.closeSearch)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Close search on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeSearch()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [closeSearch])

  // Lock body scroll when search is open
  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = ""
    }
  }, [])

  const filtered = query.length >= 2
    ? products.filter(
      (p) =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.artist.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 8)
    : []

  return (
    <div className="fixed inset-0 z-[60] bg-background/98 backdrop-blur-sm">
      <div className="mx-auto max-w-lg px-4 pt-4">
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search metal posters, artists..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <button
            onClick={closeSearch}
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Close search"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {filtered.length > 0 && (
          <div className="mt-4 space-y-2">
            {filtered.map((product) => (
              <Link
                key={product.id}
                href={`/product/${product.id}`}
                onClick={closeSearch}
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-card"
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md">
                  <Image
                    src={product.image}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {product.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {product.artist} &middot; {product.category}
                  </p>
                </div>
                <span className="text-sm font-semibold text-primary">
                  ${product.price}
                </span>
              </Link>
            ))}
          </div>
        )}

        {query.length >= 2 && filtered.length === 0 && (
          <p className="mt-8 text-center text-sm text-muted-foreground">
            No results found for &ldquo;{query}&rdquo;
          </p>
        )}
      </div>
    </div>
  )
}
