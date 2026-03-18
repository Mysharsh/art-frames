import type { Metadata } from "next"
import { AppShell } from "@/components/app-shell"
import { ContentPageShell } from "@/components/page-shells"
import { siteContent } from "@/lib/site-content"

export const metadata: Metadata = {
  title: "About Posterwaala",
  description: "Learn about the Posterwaala vision, process, and support channels.",
}

export default function AboutPage() {
  return (
    <AppShell>
      <ContentPageShell
        eyebrow="Brand Story"
        title="Built For Bold Walls"
        description="Posterwaala curates design-forward wall art for Indian homes with a drop-first model and premium finish quality."
      >
        <div className="grid gap-6">
          <section className="space-y-4 rounded-2xl border border-border/70 bg-background/70 p-5">
            {siteContent.aboutCopy.map((copy) => (
              <p key={copy} className="text-sm leading-7 text-muted-foreground sm:text-base">
                {copy}
              </p>
            ))}
          </section>

          <section className="rounded-2xl border border-border/70 bg-background/70 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground/70">
              Why Customers Trust Us
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {siteContent.aboutTags.map((tag) => (
                <div
                  key={tag}
                  className="rounded-xl border border-border/70 bg-card px-4 py-3 text-sm text-foreground/85"
                >
                  {tag}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-border/70 bg-card p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-foreground/70">
              Support
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Need help with an order, waitlist status, or product recommendation?
            </p>
            <a
              className="mt-3 inline-flex rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
              href={`mailto:${siteContent.brand.supportEmail}`}
            >
              Contact Support
            </a>
          </section>
        </div>
      </ContentPageShell>
    </AppShell>
  )
}
