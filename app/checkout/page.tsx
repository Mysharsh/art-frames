import type { Metadata } from "next"
import { AppShell } from "@/components/app-shell"
import { CheckoutPageContent } from "@/components/checkout-page-content"
import { ContentPageShell } from "@/components/page-shells"

export const metadata: Metadata = {
  title: "Checkout",
  description: "Enter your delivery details and pay with Cash on Delivery.",
}

export default function CheckoutPage() {
  return (
    <AppShell>
      <ContentPageShell
        eyebrow="Checkout"
        title="Payment & Delivery"
        description="Enter your delivery details and pay when your posters arrive."
      >
        <CheckoutPageContent />
      </ContentPageShell>
    </AppShell>
  )
}
