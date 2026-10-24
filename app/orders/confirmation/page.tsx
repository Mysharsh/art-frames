import type { Metadata } from "next"
import { AppShell } from "@/components/app-shell"
import { ContentPageShell } from "@/components/page-shells"
import { OrderConfirmationContent } from "@/components/order-confirmation-content"

export const metadata: Metadata = {
  title: "Order Confirmed",
  description: "Your Posterwaala order has been placed.",
  robots: { index: false, follow: false },
}

const ORDER_ID_PATTERN = /^ORD-\d{8}-[A-F0-9]{8}$/

export default async function OrderConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string | string[] }>
}) {
  const { id } = await searchParams
  const orderId = typeof id === "string" && ORDER_ID_PATTERN.test(id) ? id : null

  return (
    <AppShell>
      <ContentPageShell eyebrow="Checkout" title="Order Confirmed">
        <OrderConfirmationContent orderId={orderId} />
      </ContentPageShell>
    </AppShell>
  )
}
