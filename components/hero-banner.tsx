"use client"

import Link from "next/link"

export function HeroBanner() {
  return (
    <section className="relative mx-4 my-4 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/25 via-background to-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.28),transparent_45%),radial-gradient(circle_at_80%_15%,hsl(var(--foreground)/0.08),transparent_35%)]" />
      <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-24 left-8 h-52 w-52 rounded-full bg-primary/15 blur-3xl" />

      <div className="relative grid min-h-[26rem] w-full gap-6 px-6 py-8 md:min-h-[30rem] md:grid-cols-[1.1fr_0.9fr] md:px-10 lg:min-h-[34rem] lg:px-12">
        <div className="flex flex-col justify-center">
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-primary/40 bg-background/70 px-4 py-2 backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.22em] text-foreground/90">
              Drop 03 is now live
            </span>
          </div>

          <h1 className="font-display text-4xl leading-[0.95] text-foreground sm:text-5xl lg:text-7xl">
            Art That
            <br />
            <span className="text-primary">Owns the Wall</span>
          </h1>

          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Premium metal posters crafted for bold rooms. Limited editions, quick drops, and museum-grade print depth for collectors across India.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/#products"
              className="inline-flex items-center rounded-full bg-primary px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_25px_hsl(var(--primary)/0.35)]"
            >
              Shop Collection
            </Link>
            <Link
              href="/waitlist"
              className="inline-flex items-center rounded-full border border-foreground/20 bg-background/80 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-foreground transition-colors hover:border-primary/60 hover:text-primary"
            >
              Join Early Access
            </Link>
          </div>

          <div className="mt-7 grid max-w-xl grid-cols-3 gap-2 text-left">
            <div className="rounded-xl border border-border/80 bg-background/70 px-3 py-2">
              <p className="font-display text-2xl text-foreground">24h</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Drop windows</p>
            </div>
            <div className="rounded-xl border border-border/80 bg-background/70 px-3 py-2">
              <p className="font-display text-2xl text-foreground">4.8</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Avg rating</p>
            </div>
            <div className="rounded-xl border border-border/80 bg-background/70 px-3 py-2">
              <p className="font-display text-2xl text-foreground">5-7d</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Pan-India ship</p>
            </div>
          </div>
        </div>

        <div className="relative hidden md:block">
          <div className="absolute inset-x-0 bottom-6 top-6 rounded-2xl border border-border/70 bg-background/60 p-4 backdrop-blur-sm">
            <div className="h-full rounded-xl border border-border/60 bg-gradient-to-br from-foreground/[0.06] to-transparent p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">Featured Drop</p>
              <h2 className="mt-2 font-display text-3xl text-foreground">Neon Samurai</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Matte metal finish with deep contrast and anti-fade coating.
              </p>
              <div className="mt-4 space-y-2">
                <div className="rounded-lg border border-border bg-background/70 px-3 py-2 text-xs text-foreground/90">Limited run: 120 units</div>
                <div className="rounded-lg border border-border bg-background/70 px-3 py-2 text-xs text-foreground/90">Free mounting kit included</div>
                <div className="rounded-lg border border-border bg-background/70 px-3 py-2 text-xs text-foreground/90">Early access members save 15%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
