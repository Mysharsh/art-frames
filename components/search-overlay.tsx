"use client"

import { useState } from "react"
import { Search, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { products } from "@/lib/products"
import { useAppStore } from "@/lib/store"
import { formatPrice } from "@/lib/pricing"
import { siteContent } from "@/lib/site-content"
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { useReturnFocus } from "@/hooks/use-return-focus"

export function SearchOverlay() {
  const returnFocus = useReturnFocus()
  const [query, setQuery] = useState("")
  const isSearchOpen = useAppStore((s) => s.isSearchOpen)
  const closeSearch = useAppStore((s) => s.closeSearch)

  const normalized = query.trim().toLowerCase()
  const filtered =
    normalized.length >= 2
      ? products
          .filter(
            (p) =>
              p.title.toLowerCase().includes(normalized) ||
              p.artist.toLowerCase().includes(normalized) ||
              p.category.toLowerCase().includes(normalized)
          )
          .slice(0, 8)
      : []

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setQuery("")
      closeSearch()
    }
  }

  // Radix Dialog provides the focus trap, Escape, scroll lock and focus return;
  // the input is the first focusable element, so it receives focus on open.
  return (
    <Dialog open={isSearchOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        {...returnFocus}
        showClose={false}
        aria-describedby={undefined}
        className="left-0 top-0 h-full max-w-none translate-x-0 translate-y-0 gap-0 border-0 bg-background p-0 shadow-none data-[state=closed]:slide-out-to-top-[2%] data-[state=open]:slide-in-from-top-[2%] sm:rounded-none"
      >
        <DialogTitle className="sr-only">Search products</DialogTitle>
        <div className="mx-auto w-full max-w-lg px-4 pt-4">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card pl-4 pr-1 focus-within:ring-2 focus-within:ring-ring">
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search metal posters, artists..."
              aria-label="Search products"
              aria-controls="search-results"
              autoComplete="off"
              enterKeyHint="search"
              className="h-12 flex-1 bg-transparent text-base [&::-webkit-search-cancel-button]:appearance-none text-foreground placeholder:text-muted-foreground focus:outline-none md:text-sm"
            />
            <DialogClose
              className="inline-flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Close search"
            >
              <X className="h-5 w-5" />
            </DialogClose>
          </div>

          <div id="search-results" aria-live="polite" className="mt-4">
            {filtered.length > 0 ? (
              <ul className="space-y-1">
                {filtered.map((product) => (
                  <li key={product.id}>
                    <Link
                      href={`/products/${product.id}`}
                      onClick={() => handleOpenChange(false)}
                      className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md">
                        <Image src={product.image} alt="" fill className="object-cover" sizes="48px" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-foreground">{product.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.artist} &middot; {product.category}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-primary-ink">
                        {formatPrice(product.price)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : normalized.length >= 2 ? (
              <p className="mt-8 text-center text-sm text-muted-foreground">
                No results found for &ldquo;{query.trim()}&rdquo;
              </p>
            ) : (
              <nav aria-label="Popular searches">
                <p className="text-2xs font-semibold uppercase tracking-label text-muted-foreground">Popular</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {siteContent.searchSuggestions.map((suggestion) => (
                    <li key={suggestion.href}>
                      <Link
                        href={suggestion.href}
                        onClick={() => handleOpenChange(false)}
                        className="inline-flex h-11 items-center rounded-full border border-border bg-card px-4 text-sm text-foreground transition-colors hover:border-primary/40 hover:text-primary-ink"
                      >
                        {suggestion.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
