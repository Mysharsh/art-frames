import { z } from "zod"
import { MAX_LINE_QUANTITY } from "@/lib/pricing"

/**
 * Validation schemas for API endpoints
 */

// Email validation with disposable email detection
const emailSchema = z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address")
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
    quantity: z.number().int().min(1).max(MAX_LINE_QUANTITY),
})

const paymentMethodSchema = z.enum(["cod", "stripe"])

export const checkoutOrderSchema = z.object({
    customerName: z.string().trim().min(2, "Enter your full name").max(120),
    email: emailSchema,
    // Accept the ways people type Indian mobiles ("+91 98765 43210", "098765-43210")
    // and store the bare 10 digits.
    phone: z
        .string()
        .trim()
        .transform((value) => value.replace(/[\s-]/g, "").replace(/^(\+?91|0)(?=\d{10}$)/, ""))
        .pipe(z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number")),
    addressLine1: z.string().trim().min(5, "Enter your house number and street").max(180),
    addressLine2: z.string().trim().max(180).optional().default(""),
    city: z.string().trim().min(2, "Enter your city").max(80),
    state: z.string().trim().min(2, "Select your state").max(80),
    pincode: z
        .string()
        .trim()
        .transform((value) => value.replace(/\s/g, ""))
        .pipe(z.string().regex(/^[1-9]\d{5}$/, "Enter a valid 6-digit pincode")),
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

/** First error message per top-level field, for showing errors next to inputs. */
export function getFieldErrors(error: z.ZodError): Record<string, string> {
    const errors: Record<string, string> = {}
    for (const issue of error.issues) {
        const field = String(issue.path[0] ?? "form")
        errors[field] ??= issue.message
    }
    return errors
}

export async function safeParseCheckoutOrder(json: unknown) {
    return checkoutOrderSchema.safeParse(json)
}
