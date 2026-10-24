import type { PaymentMethod } from "@/lib/pricing"

export type OrderStatus =
  | "pending_cod_confirm"
  | "pending_payment"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled"

export const orderStatusLabels: Record<OrderStatus, string> = {
  pending_cod_confirm: "Awaiting confirmation",
  pending_payment: "Awaiting payment",
  confirmed: "Confirmed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
}

export function getOrderStatusLabel(status: string): string {
  return orderStatusLabels[status as OrderStatus] ?? status.replaceAll("_", " ")
}

export interface OrderSummaryLine {
  productId: string
  title: string
  size: string
  material: string
  quantity: number
  lineTotal: number
}

/** What the order API returns on success; enough to render a confirmation. */
export interface OrderConfirmation {
  orderId: string
  status: OrderStatus
  paymentMethod: PaymentMethod
  customerName: string
  city: string
  items: OrderSummaryLine[]
  subtotal: number
  codFee: number
  total: number
  createdAt: string
}

/**
 * The confirmation is kept in sessionStorage (this tab only) rather than fetched by
 * order id: guest orders have no account, and an order id alone must not expose the
 * customer's address or phone number.
 */
export const LAST_ORDER_STORAGE_KEY = "posterwaala:last-order"

export function saveLastOrder(order: OrderConfirmation) {
  try {
    sessionStorage.setItem(LAST_ORDER_STORAGE_KEY, JSON.stringify(order))
  } catch {
    // Storage can be unavailable (private mode, quota); the page falls back to the order id.
  }
}

export function parseLastOrder(raw: string | null, orderId: string): OrderConfirmation | null {
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw) as OrderConfirmation
    return parsed.orderId === orderId ? parsed : null
  } catch {
    return null
  }
}
