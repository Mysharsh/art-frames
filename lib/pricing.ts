import { getProductById } from "@/lib/products"

/**
 * Single source of truth for currency formatting and order totals.
 * The server recomputes every total from the catalogue; client-side totals are display-only.
 */

export const CURRENCY = "INR"
export const COD_FEE = 49
/** Most units of one size/material per order; enforced by the cart and the order API. */
export const MAX_LINE_QUANTITY = 20

export type PaymentMethod = "cod" | "stripe"

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: CURRENCY,
  maximumFractionDigits: 2,
  minimumFractionDigits: 0,
})

export function formatPrice(amount: number): string {
  return currencyFormatter.format(amount)
}

/**
 * Current catalogue price for a cart line. Persisted carts can hold stale prices,
 * so display code should use this to match what the server will charge.
 */
export function getUnitPrice(productId: string, fallback: number): number {
  return getProductById(productId)?.price ?? fallback
}

export function getCodFee(paymentMethod: PaymentMethod, itemCount: number): number {
  return paymentMethod === "cod" && itemCount > 0 ? COD_FEE : 0
}

export function calculateTotals(
  items: Array<{ price: number; quantity: number }>,
  paymentMethod: PaymentMethod
) {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const codFee = getCodFee(paymentMethod, items.length)
  return { subtotal, codFee, total: subtotal + codFee }
}

export interface OrderLineRequest {
  productId: string
  size: string
  material: string
  quantity: number
}

export interface PricedLineItem extends OrderLineRequest {
  title: string
  artist: string
  image: string
  price: number
  lineTotal: number
}

export type PriceLinesResult =
  | { ok: true; items: PricedLineItem[] }
  | { ok: false; error: string }

/**
 * Resolve requested lines against the catalogue. Prices, titles and images come
 * from the catalogue only, so a tampered request cannot change what is charged.
 */
export function priceOrderLines(lines: OrderLineRequest[]): PriceLinesResult {
  const items: PricedLineItem[] = []

  for (const line of lines) {
    const product = getProductById(line.productId)
    if (!product) {
      return { ok: false, error: `Unknown product: ${line.productId}` }
    }
    if (!product.sizes.includes(line.size)) {
      return { ok: false, error: `Size "${line.size}" is not available for ${product.title}` }
    }
    if (!product.materials.includes(line.material)) {
      return {
        ok: false,
        error: `Material "${line.material}" is not available for ${product.title}`,
      }
    }

    items.push({
      productId: product.id,
      size: line.size,
      material: line.material,
      quantity: line.quantity,
      title: product.title,
      artist: product.artist,
      image: product.image,
      price: product.price,
      lineTotal: product.price * line.quantity,
    })
  }

  return { ok: true, items }
}
