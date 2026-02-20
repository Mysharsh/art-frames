"use client"

export function OfferTicker() {
  const messages = [
    "Metal Posters. Bold. Durable. Limited Drops.",
    "Buy 2 Get 1 Free on Metal Posters",
    "Free Shipping on Prepaid Orders",
    "New Drops Every Friday",
  ]

  const repeated = [...messages, ...messages]

  return (
    <div className="overflow-hidden bg-primary py-2">
      <div className="animate-ticker flex whitespace-nowrap">
        {repeated.map((msg, i) => (
          <span
            key={i}
            className="mx-8 text-xs font-semibold uppercase tracking-[0.25em] text-primary-foreground"
          >
            {msg}
          </span>
        ))}
      </div>
    </div>
  )
}
