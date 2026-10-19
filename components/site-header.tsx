"use client"

import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { Menu, Search, ShoppingBag, X } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { siteContent } from "@/lib/site-content"
import { useHydrated } from "@/hooks/use-hydrated"
import { SearchOverlay } from "@/components/search-overlay"
import { MobileMenu } from "@/components/mobile-menu"
import { AuthMenu } from "@/components/auth-menu"

export function SiteHeader() {
  const pathname = usePathname()
  const hydrated = useHydrated()
  const cartCount = useAppStore((s) =>
    s.cartItems.reduce((acc, item) => acc + item.quantity, 0)
  )
  const isMobileMenuOpen = useAppStore((s) => s.isMobileMenuOpen)
  const isSearchOpen = useAppStore((s) => s.isSearchOpen)
  const toggleMobileMenu = useAppStore((s) => s.toggleMobileMenu)
  const toggleSearch = useAppStore((s) => s.toggleSearch)

  // The cart is persisted in localStorage, so its count is only known after hydration.
  const visibleCartCount = hydrated ? cartCount : 0
  const cartLabel =
    visibleCartCount > 0
      ? `Cart, ${visibleCartCount} item${visibleCartCount === 1 ? "" : "s"}`
      : "Cart"

  return (
    <>
      <header role="banner" className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur-md">
        <div className="flex h-14 items-center justify-between px-4">
          <button
            onClick={toggleMobileMenu}
            className={buttonVariants({ variant: "ghost", size: "icon", className: "md:hidden" })}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <X />
            ) : (
              <Menu />
            )}
          </button>

          <Link href="/" className="flex h-11 items-center gap-2">
            <span className="font-display text-2xl tracking-wide text-foreground">
              {siteContent.brand.name}
            </span>
          </Link>

          <nav
            aria-label="Main"
            className="hidden items-center gap-6 text-xs font-semibold uppercase tracking-label text-foreground/80 md:flex"
          >
            {siteContent.primaryNav.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`transition-colors hover:text-foreground ${isActive ? "text-primary-ink" : ""}`}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleSearch}
              className={buttonVariants({ variant: "ghost", size: "icon" })}
              aria-label="Search"
            >
              <Search />
            </button>
            <Link
              href="/cart"
              className={buttonVariants({ variant: "ghost", size: "icon", className: "relative" })}
              aria-label={cartLabel}
            >
              <ShoppingBag />
              {visibleCartCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-2xs font-bold text-primary-foreground"
                >
                  {visibleCartCount > 99 ? "99+" : visibleCartCount}
                </span>
              )}
            </Link>
            <AuthMenu />
          </div>
        </div>
      </header>

      {isSearchOpen && <SearchOverlay />}
      {isMobileMenuOpen && <MobileMenu />}
    </>
  )
}
