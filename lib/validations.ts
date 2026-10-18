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

// Only identifiers and quantity are accepted from the client. Price, title and image
// are resolved server-side from the catalogue (see lib/pricing.ts); extra keys are stripped.
const cartItemSchema = z.object({
    productId: productIdSchema,
    size: z.string().min(1).max(60),
    material: z.string().min(1).max(60),
    quantity: z.number().int().min(1).max(20),
})

const paymentMethodSchema = z.enum(["cod", "stripe"])

export const checkoutOrderSchema = z.object({
    customerName: z.string().trim().min(2).max(120),
    email: emailSchema,
    phone: z
        .string()
        .trim()
        .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
    addressLine1: z.string().trim().min(5).max(180),
    addressLine2: z.string().trim().max(180).optional().default(""),
    city: z.string().trim().min(2).max(80),
    state: z.string().trim().min(2).max(80),
    pincode: z
        .string()
        .trim()
        .regex(/^\d{6}$/, "Enter a valid 6-digit pincode"),
    gstNumber: z
        .string()
        .trim()
        .toUpperCase()
        .regex(/^[0-9A-Z]{15}$/, "Enter a valid 15-character GST number")
        .optional()
        .or(z.literal("")),
    paymentMethod: paymentMethodSchema,
    cartItems: z.array(cartItemSchema).min(1).max(50),
    notes: z.string().trim().max(300).optional().default(""),
})

export type CheckoutOrderInput = z.infer<typeof checkoutOrderSchema>

export async function safeParseCheckoutOrder(json: unknown) {
    return checkoutOrderSchema.safeParse(json)
}
