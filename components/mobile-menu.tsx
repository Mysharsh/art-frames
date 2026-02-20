"use client"

import Link from "next/link"
import { Home, Grid3X3, ClipboardList, PhoneCall, Calendar, Info, User } from "lucide-react"
import { useAppStore } from "@/lib/store"
import { categories } from "@/lib/products"

export function MobileMenu() {
  const isMobileMenuOpen = useAppStore((s) => s.isMobileMenuOpen)
  const closeMobileMenu = useAppStore((s) => s.closeMobileMenu)

  const handleBackdropClick = () => {
    if (isMobileMenuOpen) closeMobileMenu()
  }

  return (
    <>
      {/* Backdrop overlay - tap to close */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 top-14 z-50 bg-black/40 backdrop-blur-sm"
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
      )}

      {/* Drawer sidebar */}
      <div
        className={`fixed inset-0 top-14 z-[55] w-full max-w-sm overflow-hidden bg-background transition-transform duration-300 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <nav className="flex h-full flex-col overflow-y-auto px-6 py-6">
          {/* Home & Waitlist */}
          <div className="space-y-1">
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-foreground transition-colors hover:bg-card"
            >
              <Home className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">Home</span>
            </Link>
            <Link
              href="/waitlist"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 rounded-lg px-3 py-3 text-foreground transition-colors hover:bg-card"
            >
              <ClipboardList className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium">My Waitlist</span>
            </Link>
          </div>

          {/* Shop In Section */}
          <div className="mt-6 border-t border-border pt-4">
            <p className="mb-3 px-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Shop In
            </p>
            <div className="space-y-1">
              <Link
                href="/?section=order"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-foreground transition-colors hover:bg-card"
              >
                <Grid3X3 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Order</span>
              </Link>
              <Link
                href="/?section=about"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-foreground transition-colors hover:bg-card"
              >
                <Info className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">About</span>
              </Link>
              <Link
                href="/?section=events"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-foreground transition-colors hover:bg-card"
              >
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Events</span>
              </Link>
              <Link
                href="/?section=contact"
                onClick={closeMobileMenu}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-foreground transition-colors hover:bg-card"
              >
                <PhoneCall className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Contact</span>
              </Link>
            </div>
          </div>

          {/* Metal Poster Themes */}
          <div className="mt-6 border-t border-border pt-4">
            <p className="mb-3 px-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Metal Poster Themes
            </p>
            <div className="space-y-1">
              {categories
                .filter((c) => c !== "All")
                .map((category) => (
                  <Link
                    key={category}
                    href={`/?category=${category}`}
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-foreground transition-colors hover:bg-card"
                  >
                    <Grid3X3 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{category}</span>
                  </Link>
                ))}
            </div>
          </div>

          {/* Profile section at bottom */}
          <div className="mt-auto border-t border-border pt-4">
            <p className="mb-3 px-3 text-xs font-bold uppercase tracking-widest text-muted-foreground">
              My Profile
            </p>
            <div className="space-y-2 pb-6">
              <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-foreground transition-colors hover:bg-card">
                <User className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Login / Sign Up</span>
              </button>
            </div>
          </div>
        </nav>
      </div>
    </>
  )
}

