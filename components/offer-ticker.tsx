"use client"

import { siteContent } from "@/lib/site-content"

export function OfferTicker() {
  const repeated = [...siteContent.tickerMessages, ...siteContent.tickerMessages]

  return (
    <div className="overflow-hidden border-b border-foreground/10 bg-foreground text-background">
      <div className="animate-ticker flex whitespace-nowrap py-2.5">
        {repeated.map((message, index) => (
          <span
            key={`${message}-${index}`}
            className="mx-8 text-[10px] font-semibold uppercase tracking-[0.3em] text-background/85"
          >
            {message}
          </span>
        ))}
      </div>
    </div>
  )
}
