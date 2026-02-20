"use client"

import Link from "next/link"

export function HeroBanner() {
  return (
    <div className="relative mx-4 my-4 overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/20 via-background to-primary/10">
      <div className="relative aspect-[16/9] w-full md:aspect-[2/1] lg:aspect-[3/1]">
        {/* Background gradient for brand messaging */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-transparent" />

        {/* Brand messaging content */}
        <div className="flex h-full flex-col items-start justify-center px-6 py-8 md:px-10">
          {/* Tagline badge */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary bg-primary/10 px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-foreground">
              Metal Posters
            </span>
          </div>

          {/* Main headline */}
          <h1 className="font-display text-4xl leading-tight text-foreground md:text-5xl lg:text-6xl">
            Bold. Durable.
            <br />
            <span className="text-primary">Limited Drops.</span>
          </h1>

          {/* Subheading */}
          <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
            India&apos;s premier metal print store. Premium artwork meets unmatched quality.
          </p>

          {/* CTA buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/#products"
              className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-sm font-bold uppercase tracking-widest text-primary-foreground transition-transform hover:scale-105 active:scale-95"
            >
              Shop Now
            </Link>
            <Link
              href="/?section=about"
              className="inline-flex items-center rounded-full border-2 border-primary bg-transparent px-6 py-3 text-sm font-bold uppercase tracking-widest text-primary transition-colors hover:bg-primary/10"
            >
              Explore More
            </Link>
          </div>

          {/* Limited offer callout */}
          <div className="mt-6 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2">
            <span className="text-xs font-bold uppercase tracking-wider text-destructive">⚡ Limited Stock</span>
            <span className="text-xs text-destructive/80">• Up to 35% off on select drops</span>
          </div>
        </div>
      </div>
    </div>
  )
}
