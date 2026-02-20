"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Grid3X3, ClipboardList, PhoneCall } from "lucide-react"

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/?section=order", label: "Order", icon: Grid3X3 },
  { href: "/waitlist", label: "Waitlist", icon: ClipboardList },
  { href: "/?section=contact", label: "Contact", icon: PhoneCall },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 pb-safe backdrop-blur-md">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href.split("?")[0])
          const Icon = item.icon

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 transition-colors ${isActive ? "text-primary" : "text-muted-foreground"
                }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
