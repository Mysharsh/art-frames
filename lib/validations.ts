import { z } from "zod"

/**
 * Validation schemas for API endpoints
 */

// Email validation with disposable email detection
const emailSchema = z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email format")
    .max(254, "Email must be less than 254 characters")
    .refine(
        (email) => {
            // Block common disposable email domains
            const disposableDomains = [
                "tempmail.com",
                "10minutemail.com",
                "guerrillamail.com",
                "throwaway.email",
                "fakeinbox.com",
                "mailinator.com",
                "temp-mail.org",
            ]
            const domain = email.split("@")[1]
            return !disposableDomains.includes(domain)
        },
        { message: "Please use a valid email address (disposable emails not allowed)" }
    )

// Product ID validation
const productIdSchema = z
    .string()
    .min(1, "Product ID is required")
    .max(50, "Invalid product ID")
    .regex(/^[a-zA-Z0-9_-]+$/, "Invalid product ID format")

// Product title validation (optional)
const productTitleSchema = z
    .string()
    .max(200, "Product title must be less than 200 characters")
    .optional()
    .nullable()

// Waitlist entry schema
export const waitlistEntrySchema = z.object({
    email: emailSchema,
    productId: productIdSchema,
    productTitle: productTitleSchema,
})

export type WaitlistEntry = z.infer<typeof waitlistEntrySchema>

/**
 * Parse and validate waitlist entry
 * Throws ZodError if validation fails
 */
export async function parseWaitlistEntry(json: unknown): Promise<WaitlistEntry> {
    return waitlistEntrySchema.parse(json)
}

/**
 * Safely parse waitlist entry with error details
 */
export async function safeParseWaitlistEntry(json: unknown) {
    return waitlistEntrySchema.safeParse(json)
}
