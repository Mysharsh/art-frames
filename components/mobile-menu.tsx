"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Home, Grid3X3, ClipboardList, PhoneCall, Calendar, Info, X, Package } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { categories } from "@/lib/products"

export function MobileMenu() {
  const isMobileMenuOpen = useAppStore((s) => s.isMobileMenuOpen)
  const closeMobileMenu = useAppStore((s) => s.closeMobileMenu)

  // Close menu on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileMenuOpen) {
        closeMobileMenu()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isMobileMenuOpen, closeMobileMenu])

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isMobileMenuOpen])

  return (
    <>
      {/* Drawer sidebar */}
      <div
        className={`fixed inset-0 top-14 z-50 w-full overflow-hidden bg-background transition-transform duration-300 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <nav className="flex h-full flex-col overflow-y-auto">
          {/* Header: Logo + Close Button */}
          <div className="border-b border-border/40 bg-background/95 px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-display text-xl font-bold tracking-wide text-foreground">
                  Metal
                </span>
                <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary-foreground">
                  Posters
                </span>
              </div>
              <button
                onClick={closeMobileMenu}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary text-foreground transition-colors active:bg-secondary/80"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
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
                <Home className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">Home</span>
              </Link>
              <Link
                href="/waitlist"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-foreground transition-colors hover:bg-secondary active:bg-secondary/60"
              >
                <ClipboardList className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">My Waitlist</span>
              </Link>
            </div>

            {/* Explore Section */}
            <div className="mt-8 pt-6 border-t border-border/40">
              <div className="mb-4 flex items-center gap-2 px-3">
                <Package className="h-4 w-4 text-primary" />
                <p className="text-xs font-bold uppercase tracking-widest text-foreground">
                  Explore
                </p>
              </div>
              <div className="space-y-1">
                <Link
                  href="/#order"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-foreground transition-colors hover:bg-secondary active:bg-secondary/60"
                >
                  <Grid3X3 className="h-4 w-4 text-primary" />
                  <span className="text-sm">Order & Track</span>
                </Link>
                <Link
                  href="/#about"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-foreground transition-colors hover:bg-secondary active:bg-secondary/60"
                >
                  <Info className="h-4 w-4 text-primary" />
                  <span className="text-sm">About Us</span>
                </Link>
                <Link
                  href="/#events"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-foreground transition-colors hover:bg-secondary active:bg-secondary/60"
                >
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="text-sm">Events</span>
                </Link>
                <Link
                  href="/#contact"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-foreground transition-colors hover:bg-secondary active:bg-secondary/60"
                >
                  <PhoneCall className="h-4 w-4 text-primary" />
                  <span className="text-sm">Contact</span>
                </Link>
              </div>
            </div>

            {/* Categories Section */}
            <div className="mt-8 pt-6 border-t border-border/40">
              <div className="mb-4 flex items-center gap-2 px-3">
                <Grid3X3 className="h-4 w-4 text-primary" />
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
                      href={`/?category=${category}`}
                      onClick={closeMobileMenu}
                      className="block rounded-lg px-3 py-2 text-sm text-foreground transition-colors hover:bg-secondary active:bg-secondary/60"
                    >
                      {category}
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </nav>
      </div>
    </>
  )
}

