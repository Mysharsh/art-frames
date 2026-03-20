import type { Metadata } from "next"
import { AppShell } from "@/components/app-shell"
import { ContentPageShell } from "@/components/page-shells"
import { OrdersPageContent } from "@/components/orders-page-content"

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
        description="Track your recent orders and payment method status in one place."
      >
        <OrdersPageContent />
      </ContentPageShell>
    </AppShell>
  )
}
