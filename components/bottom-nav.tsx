"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { ClipboardList, Home, Layers3, ShoppingBag, UserRound } from "lucide-react"
import { siteContent } from "@/lib/site-content"

const icons = [Home, Layers3, ClipboardList, ShoppingBag, UserRound]

export function BottomNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const section = searchParams.get("section")

  return (
    <nav
      aria-label="Mobile bottom navigation"
      className="safe-bottom fixed inset-x-3 bottom-3 z-40 md:hidden"
    >
      <div className="grid grid-cols-5 rounded-[28px] border border-border/80 bg-card/95 px-2 py-2 shadow-[0_18px_40px_rgba(22,13,7,0.18)] backdrop-blur-xl">
        {siteContent.mobileBottomNav.map((item, index) => {
          const Icon = icons[index]
          const isActive = item.section
            ? pathname === "/" && section === item.section
            : item.href === "/"
              ? pathname === "/" && !section
              : pathname.startsWith(item.href.split("?")[0])

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-1 rounded-[20px] px-2 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors ${
                isActive ? "bg-primary text-primary-foreground" : "text-foreground/62"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
