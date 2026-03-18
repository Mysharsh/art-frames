import type { Metadata } from "next"
import { AppShell } from "@/components/app-shell"
import { CheckoutPageContent } from "@/components/checkout-page-content"
import { ContentPageShell } from "@/components/page-shells"

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your order using Stripe or Cash on Delivery.",
}

export default function CheckoutPage() {
  return (
    <AppShell>
      <ContentPageShell
        eyebrow="Checkout"
        title="Payment & Delivery"
        description="Complete your shipping details and place your order using COD or Stripe."
      >
        <CheckoutPageContent />
      </ContentPageShell>
    </AppShell>
  )
}
