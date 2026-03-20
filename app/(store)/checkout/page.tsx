import type { Metadata } from "next"
import { CheckoutPageContent } from "@/components/checkout-page-content"
import { ContentPageShell } from "@/components/page-shells"

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your order using Stripe or Cash on Delivery.",
}

export default function CheckoutPage() {
  return (
    <ContentPageShell
      eyebrow="Checkout"
      title="Payment & Delivery"
      description="Complete your shipping details and place your order using COD or Stripe."
    >
      <CheckoutPageContent />
    </ContentPageShell>
  )
}
