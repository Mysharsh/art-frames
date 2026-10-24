import { describe, it, expect, beforeEach } from "vitest"
import {
    LAST_ORDER_STORAGE_KEY,
    getOrderStatusLabel,
    parseLastOrder,
    saveLastOrder,
    type OrderConfirmation,
} from "@/lib/orders"

const order: OrderConfirmation = {
    orderId: "ORD-20261019-ABCDEF12",
    status: "pending_cod_confirm",
    paymentMethod: "cod",
    customerName: "Harsh Singh",
    city: "Bengaluru",
    items: [
        {
            productId: "p1",
            title: "Neon Samurai",
            size: "M (12x16)",
            material: "Metal Print",
            quantity: 2,
            lineTotal: 58,
        },
    ],
    subtotal: 58,
    codFee: 49,
    total: 107,
    createdAt: "2026-10-19T10:00:00.000Z",
}

describe("Orders Library", () => {
    beforeEach(() => {
        sessionStorage.clear()
    })

    describe("getOrderStatusLabel", () => {
        it("should return a customer-friendly label for known statuses", () => {
            expect(getOrderStatusLabel("pending_cod_confirm")).toBe("Awaiting confirmation")
            expect(getOrderStatusLabel("shipped")).toBe("Shipped")
        })

        it("should fall back to a readable version of unknown statuses", () => {
            expect(getOrderStatusLabel("on_hold")).toBe("on hold")
        })
    })

    describe("saveLastOrder / parseLastOrder", () => {
        it("should round-trip the last order through sessionStorage", () => {
            saveLastOrder(order)
            const raw = sessionStorage.getItem(LAST_ORDER_STORAGE_KEY)
            expect(parseLastOrder(raw, order.orderId)).toEqual(order)
        })

        it("should ignore a stored order with a different id", () => {
            saveLastOrder(order)
            const raw = sessionStorage.getItem(LAST_ORDER_STORAGE_KEY)
            expect(parseLastOrder(raw, "ORD-20261019-00000000")).toBeNull()
        })

        it("should return null for missing or corrupt data", () => {
            expect(parseLastOrder(null, order.orderId)).toBeNull()
            expect(parseLastOrder("{not json", order.orderId)).toBeNull()
        })
    })
})
