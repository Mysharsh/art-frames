import type { Metadata } from "next"
import { CartPageContent } from "@/components/cart-page-content"
import { ContentPageShell } from "@/components/page-shells"

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your selections before continuing to checkout.",
}

export default function CartPage() {
  return (
    <ContentPageShell
      eyebrow="Cart"
      title="Your Cart"
      description="Review your selected items, update quantities, and continue to checkout."
    >
      <CartPageContent />
    </ContentPageShell>
  )
}
