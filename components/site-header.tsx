"use client"

import Link from "next/link"
import { Menu, Search, ShoppingBag, X } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { SearchOverlay } from "@/components/search-overlay"
import { MobileMenu } from "@/components/mobile-menu"

const primaryNav = [
  { label: "Order", href: "/?section=order" },
  { label: "About", href: "/?section=about" },
  { label: "Events", href: "/?section=events" },
  { label: "Contact", href: "/?section=contact" },
]

export function SiteHeader() {
  const waitlistItems = useAppStore((s) => s.waitlistItems)
  const isMobileMenuOpen = useAppStore((s) => s.isMobileMenuOpen)
  const isSearchOpen = useAppStore((s) => s.isSearchOpen)
  const toggleMobileMenu = useAppStore((s) => s.toggleMobileMenu)
  const toggleSearch = useAppStore((s) => s.toggleSearch)

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between px-4">
          <button
            onClick={toggleMobileMenu}
            className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:text-primary md:hidden"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          <Link href="/" className="flex items-center gap-2">
            <span className="font-display text-2xl tracking-wide text-foreground">
              Metal
            </span>
            <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-widest text-primary-foreground">
              Posters
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-xs font-semibold uppercase tracking-[0.2em] text-foreground/80 md:flex">
            {primaryNav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSearch}
              className="flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:text-primary"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <Link
              href="/waitlist"
              className="relative flex h-10 w-10 items-center justify-center text-foreground transition-colors hover:text-primary"
              aria-label="Waitlist"
            >
              <ShoppingBag className="h-5 w-5" />
              {waitlistItems.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {waitlistItems.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {isSearchOpen && <SearchOverlay />}
      {isMobileMenuOpen && <MobileMenu />}
    </>
  )
}
