import { describe, it, expect } from "vitest"
import {
    checkoutOrderSchema,
    safeParseWaitlistEntry,
    waitlistEntrySchema,
} from "@/lib/validations"

describe("Validations", () => {
    describe("waitlistEntrySchema", () => {
        it("should validate correct input", () => {
            const validData = {
                email: "test@example.com",
                productId: "p1",
                productTitle: "Test Art",
            }
            const result = waitlistEntrySchema.safeParse(validData)
            expect(result.success).toBe(true)
        })

        it("should reject invalid email format", () => {
            const invalidData = {
                email: "not-an-email",
                productId: "p1",
                productTitle: "Test Art",
            }
            const result = waitlistEntrySchema.safeParse(invalidData)
            expect(result.success).toBe(false)
        })

        it("should reject disposable email domains", () => {
            const disposableEmail = {
                email: "test@tempmail.com",
                productId: "p1",
                productTitle: "Test Art",
            }
            const result = waitlistEntrySchema.safeParse(disposableEmail)
            expect(result.success).toBe(false)
        })

        it("should reject missing product ID", () => {
            const missingProductId = {
                email: "test@example.com",
                productId: "",
                productTitle: "Test Art",
            }
            const result = waitlistEntrySchema.safeParse(missingProductId)
            expect(result.success).toBe(false)
        })

        it("should reject invalid product ID format", () => {
            const invalidProductId = {
                email: "test@example.com",
                productId: "invalid@product#",
                productTitle: "Test Art",
            }
            const result = waitlistEntrySchema.safeParse(invalidProductId)
            expect(result.success).toBe(false)
        })

        it("should trim and lowercase email", () => {
            const data = {
                email: "  Test@EXAMPLE.COM  ",
                productId: "p1",
                productTitle: "Test Art",
            }
            const result = waitlistEntrySchema.safeParse(data)
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.email).toBe("test@example.com")
            }
        })

        it("should accept optional product title", () => {
            const dataWithoutTitle = {
                email: "test@example.com",
                productId: "p1",
            }
            const result = waitlistEntrySchema.safeParse(dataWithoutTitle)
            expect(result.success).toBe(true)
        })

        it("should reject product title over 200 characters", () => {
            const longTitle = {
                email: "test@example.com",
                productId: "p1",
                productTitle: "A".repeat(201),
            }
            const result = waitlistEntrySchema.safeParse(longTitle)
            expect(result.success).toBe(false)
        })
    })

    describe("safeParseWaitlistEntry", () => {
        it("should handle valid JSON objects", async () => {
            const validData = {
                email: "test@example.com",
                productId: "p1",
                productTitle: "Test Art",
            }
            const result = await safeParseWaitlistEntry(validData)
            expect(result.success).toBe(true)
        })

        it("should return detailed error messages", async () => {
            const invalidData = {
                email: "invalid",
                productId: "",
            }
            const result = await safeParseWaitlistEntry(invalidData)
            expect(result.success).toBe(false)
            if (!result.success) {
                expect(result.error.errors.length).toBeGreaterThan(0)
                expect(
                    result.error.errors.some((e) => e.path.includes("email") || e.path.includes("productId"))
                ).toBe(true)
            }
        })
    })

    describe("checkoutOrderSchema", () => {
        const basePayload = {
            customerName: "Harsh Singh",
            email: "harsh@example.com",
            phone: "9876543210",
            addressLine1: "101, Residency Road",
            addressLine2: "Near Central Park",
            city: "Bengaluru",
            state: "Karnataka",
            pincode: "560001",
            gstNumber: "29ABCDE1234F1Z5",
            paymentMethod: "cod" as const,
            notes: "Call before delivery",
            cartItems: [
                {
                    productId: "p1",
                    title: "Neon Samurai",
                    image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&h=600&fit=crop",
                    artist: "Yuki Tanaka",
                    price: 29,
                    size: "M (12x16)",
                    material: "Metal Print",
                    quantity: 2,
                },
            ],
        }

        it("should validate a correct checkout payload", () => {
            const result = checkoutOrderSchema.safeParse(basePayload)
            expect(result.success).toBe(true)
        })

        it("should reject invalid payment method", () => {
            const payload = {
                ...basePayload,
                paymentMethod: "paypal",
            }
            const result = checkoutOrderSchema.safeParse(payload)
            expect(result.success).toBe(false)
        })

        it("should reject invalid pincode", () => {
            const payload = {
                ...basePayload,
                pincode: "5600",
            }
            const result = checkoutOrderSchema.safeParse(payload)
            expect(result.success).toBe(false)
        })

        it("should reject empty cart", () => {
            const payload = {
                ...basePayload,
                cartItems: [],
            }
            const result = checkoutOrderSchema.safeParse(payload)
            expect(result.success).toBe(false)
        })

        it("should reject non-Indian mobile format", () => {
            const payload = {
                ...basePayload,
                phone: "1234567890",
            }
            const result = checkoutOrderSchema.safeParse(payload)
            expect(result.success).toBe(false)
        })
    })
})
