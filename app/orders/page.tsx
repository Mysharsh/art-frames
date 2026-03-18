import type { Metadata } from "next"
import { AppShell } from "@/components/app-shell"
import { ContentPageShell } from "@/components/page-shells"

export const metadata: Metadata = {
  title: "My Orders",
  description: "Track and manage your recent orders.",
}

export default function OrdersPage() {
  return (
    <AppShell>
      <ContentPageShell
        eyebrow="Orders"
        title="My Orders"
        description="Order history UI is the next implementation slice. For now, place orders from checkout and monitor responses in-app."
      >
        <section className="rounded-2xl border border-border/70 bg-card p-5">
          <p className="text-sm leading-7 text-muted-foreground">
            This page is now scaffolded so account navigation no longer dead-ends. Next step is rendering order list data from the orders table and status timeline.
          </p>
        </section>
      </ContentPageShell>
    </AppShell>
  )
}
