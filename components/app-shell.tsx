"use client"

import { useEffect } from "react"
import { SiteHeader } from "@/components/site-header"
import { OfferTicker } from "@/components/offer-ticker"
import { WaitlistModal } from "@/components/waitlist-modal"
import { useAppStore } from "@/lib/store"

export function AppShell({ children }: { children: React.ReactNode }) {
  const setWaitlistCount = useAppStore((s) => s.setWaitlistCount)

  useEffect(() => {
    fetch("/api/waitlist")
      .then((res) => res.json())
      .then((data) => {
        if (data.count) setWaitlistCount(data.count)
      })
      .catch(() => { })
  }, [setWaitlistCount])

  return (
    <>
      <OfferTicker />
      <SiteHeader />
      <main>{children}</main>
      <WaitlistModal />
    </>
  )
}
