import { describe, it, expect } from "vitest"
import { waitlistEntrySchema, safeParseWaitlistEntry } from "@/lib/validations"

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
})
