"use client"

import Link from "next/link"
import { Home, Grid3X3, ClipboardList, PhoneCall, Info, ShoppingBag, CreditCard, X, Package, LayoutTemplate } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { categories, getCategoryHandle } from "@/lib/products"
import { siteContent } from "@/lib/site-content"
import { buttonVariants } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { useReturnFocus } from "@/hooks/use-return-focus"

export function MobileMenu() {
  const isMobileMenuOpen = useAppStore((s) => s.isMobileMenuOpen)
  const closeMobileMenu = useAppStore((s) => s.closeMobileMenu)
  const returnFocus = useReturnFocus()

  // Radix Sheet provides role="dialog", the focus trap, Escape, scroll lock and
  // focus return to the menu button.
  return (
    <Sheet open={isMobileMenuOpen} onOpenChange={(open) => !open && closeMobileMenu()}>
      <SheetContent
        {...returnFocus}
        side="left"
        showClose={false}
        aria-describedby={undefined}
        className="flex w-full flex-col gap-0 p-0 sm:max-w-sm"
      >
        <nav aria-label="Mobile" className="flex h-full flex-col overflow-y-auto">
          <div className="border-b border-border/40 bg-background/95 px-4 py-2">
            <div className="flex items-center justify-between">
              <SheetTitle className="font-display text-xl font-normal tracking-wide text-foreground">
                {siteContent.brand.name}
              </SheetTitle>
              <SheetClose className={buttonVariants({ variant: "secondary", size: "icon", className: "rounded-lg" })} aria-label="Close menu">
                <X />
              </SheetClose>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6">
            {/* Primary Links */}
            <div className="space-y-1">
              <Link
                href="/"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-foreground transition-colors hover:bg-secondary active:bg-secondary/60"
              >
                <Home className="h-5 w-5 text-primary-ink" />
                <span className="text-sm font-medium">Home</span>
              </Link>
              <Link
                href="/collections/all"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-foreground transition-colors hover:bg-secondary active:bg-secondary/60"
              >
                <LayoutTemplate className="h-5 w-5 text-primary-ink" />
                <span className="text-sm font-medium">Shop Collections</span>
              </Link>
              <Link
                href="/waitlist"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-foreground transition-colors hover:bg-secondary active:bg-secondary/60"
              >
                <ClipboardList className="h-5 w-5 text-primary-ink" />
                <span className="text-sm font-medium">My Waitlist</span>
              </Link>
              <Link
                href="/cart"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-foreground transition-colors hover:bg-secondary active:bg-secondary/60"
              >
                <ShoppingBag className="h-5 w-5 text-primary-ink" />
                <span className="text-sm font-medium">Cart</span>
              </Link>
              <Link
                href="/checkout"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-foreground transition-colors hover:bg-secondary active:bg-secondary/60"
              >
                <CreditCard className="h-5 w-5 text-primary-ink" />
                <span className="text-sm font-medium">Checkout</span>
              </Link>
            </div>

            {/* Explore Section */}
            <div className="mt-8 pt-6 border-t border-border/40">
              <div className="mb-4 flex items-center gap-2 px-3">
                <Package className="h-4 w-4 text-primary-ink" />
                <p className="text-xs font-bold uppercase tracking-widest text-foreground">
                  Explore
                </p>
              </div>
              <div className="space-y-1">
                <Link
                  href="/gallery-walls"
                  onClick={closeMobileMenu}
                  className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-foreground transition-colors hover:bg-secondary active:bg-secondary/60"
                >
                  <Grid3X3 className="h-4 w-4 text-primary-ink" />
                  <span className="text-sm">Gallery Walls</span>
                </Link>
                <Link
                  href="/about"
                  onClick={closeMobileMenu}
                  className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-foreground transition-colors hover:bg-secondary active:bg-secondary/60"
                >
                  <Info className="h-4 w-4 text-primary-ink" />
                  <span className="text-sm">About Us</span>
                </Link>
                <Link
                  href={`mailto:${siteContent.brand.supportEmail}`}
                  onClick={closeMobileMenu}
                  className="flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-foreground transition-colors hover:bg-secondary active:bg-secondary/60"
                >
                  <PhoneCall className="h-4 w-4 text-primary-ink" />
                  <span className="text-sm">Contact</span>
                </Link>
              </div>
            </div>

            {/* Categories Section */}
            <div className="mt-8 pt-6 border-t border-border/40">
              <div className="mb-4 flex items-center gap-2 px-3">
                <Grid3X3 className="h-4 w-4 text-primary-ink" />
                <p className="text-xs font-bold uppercase tracking-widest text-foreground">
                  Categories
                </p>
              </div>
              <div className="space-y-1">
                {categories
                  .filter((c) => c !== "All")
                  .map((category) => (
                    <Link
                      key={category}
                      href={`/collections/${getCategoryHandle(category)}`}
                      onClick={closeMobileMenu}
                      className="flex min-h-11 items-center rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary active:bg-secondary/60"
                    >
                      {category}
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
}

