import { describe, it, expect } from "vitest"
import {
    COD_FEE,
    calculateTotals,
    formatPrice,
    getCodFee,
    getUnitPrice,
    priceOrderLines,
} from "@/lib/pricing"
import { getProductById } from "@/lib/products"

describe("Pricing Library", () => {
    describe("formatPrice", () => {
        it("should format amounts in Indian Rupees", () => {
            expect(formatPrice(29)).toBe("₹29")
            expect(formatPrice(1499.5)).toBe("₹1,499.5")
            expect(formatPrice(150000)).toBe("₹1,50,000")
        })
    })

    describe("getCodFee", () => {
        it("should charge the COD fee only for cash on delivery", () => {
            expect(getCodFee("cod", 2)).toBe(COD_FEE)
            expect(getCodFee("stripe", 2)).toBe(0)
        })

        it("should not charge a fee for an empty cart", () => {
            expect(getCodFee("cod", 0)).toBe(0)
        })
    })

    describe("calculateTotals", () => {
        const items = [
            { price: 100, quantity: 2 },
            { price: 50, quantity: 1 },
        ]

        it("should add the COD fee for cash on delivery", () => {
            expect(calculateTotals(items, "cod")).toEqual({
                subtotal: 250,
                codFee: COD_FEE,
                total: 250 + COD_FEE,
            })
        })

        it("should not add the COD fee for online payment", () => {
            expect(calculateTotals(items, "stripe")).toEqual({
                subtotal: 250,
                codFee: 0,
                total: 250,
            })
        })
    })

    describe("getUnitPrice", () => {
        it("should prefer the catalogue price over a stale stored price", () => {
            const product = getProductById("p1")!
            expect(getUnitPrice("p1", 1)).toBe(product.price)
        })

        it("should fall back to the stored price for unknown products", () => {
            expect(getUnitPrice("missing", 42)).toBe(42)
        })
    })

    describe("priceOrderLines", () => {
        const product = getProductById("p1")!

        it("should price lines from the catalogue", () => {
            const result = priceOrderLines([
                {
                    productId: "p1",
                    size: product.sizes[0],
                    material: product.materials[0],
                    quantity: 3,
                },
            ])

            expect(result.ok).toBe(true)
            if (result.ok) {
                expect(result.items[0].price).toBe(product.price)
                expect(result.items[0].lineTotal).toBe(product.price * 3)
                expect(result.items[0].title).toBe(product.title)
            }
        })

        it("should ignore any price smuggled into the request", () => {
            const tampered = {
                productId: "p1",
                size: product.sizes[0],
                material: product.materials[0],
                quantity: 1,
                price: 1,
            }
            const result = priceOrderLines([tampered])

            expect(result.ok).toBe(true)
            if (result.ok) {
                expect(result.items[0].price).toBe(product.price)
            }
        })

        it("should reject unknown products", () => {
            const result = priceOrderLines([
                { productId: "nope", size: "M (12x16)", material: "Matte Paper", quantity: 1 },
            ])
            expect(result.ok).toBe(false)
        })

        it("should reject sizes the product does not offer", () => {
            const result = priceOrderLines([
                { productId: "p1", size: "XXL (40x60)", material: product.materials[0], quantity: 1 },
            ])
            expect(result.ok).toBe(false)
        })

        it("should reject materials the product does not offer", () => {
            const result = priceOrderLines([
                { productId: "p1", size: product.sizes[0], material: "Gold Leaf", quantity: 1 },
            ])
            expect(result.ok).toBe(false)
        })
    })
})
