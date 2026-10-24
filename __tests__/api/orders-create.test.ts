// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest"
import { getProductById } from "@/lib/products"
import { COD_FEE } from "@/lib/pricing"
import { ordersLimiter } from "@/lib/rate-limit"
import { POST } from "@/app/api/orders/create/route"

// vi.mock calls are hoisted above imports, so the route sees these mocks.
const insertMock = vi.hoisted(() => vi.fn())

vi.mock("@/lib/supabase/admin", () => ({
    createAdminClient: () => ({
        from: () => ({ insert: insertMock }),
    }),
}))

vi.mock("@/lib/supabase/server", () => ({
    createClient: async () => ({
        auth: { getUser: async () => ({ data: { user: null } }) },
    }),
}))

vi.mock("@/lib/sentry", () => ({
    captureException: vi.fn(),
}))

const product = getProductById("p1")!

function makePayload(overrides: Record<string, unknown> = {}) {
    return {
        customerName: "Harsh Singh",
        email: "harsh@example.com",
        phone: "9876543210",
        addressLine1: "101, Residency Road",
        addressLine2: "",
        city: "Bengaluru",
        state: "Karnataka",
        pincode: "560001",
        gstNumber: "",
        paymentMethod: "cod",
        notes: "",
        cartItems: [
            {
                productId: "p1",
                size: product.sizes[0],
                material: product.materials[0],
                quantity: 2,
            },
        ],
        ...overrides,
    }
}

function makeRequest(body: unknown, ip = "198.51.100.1") {
    return new Request("http://localhost/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-real-ip": ip },
        body: JSON.stringify(body),
    })
}

describe("POST /api/orders/create", () => {
    beforeEach(() => {
        insertMock.mockReset()
        insertMock.mockResolvedValue({ error: null })
        ordersLimiter.clear()
    })

    it("should create an order priced from the catalogue", async () => {
        const response = await POST(makeRequest(makePayload()))
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.success).toBe(true)
        expect(data.amount).toBe(product.price * 2 + COD_FEE)

        const record = insertMock.mock.calls[0][0]
        expect(record.subtotal).toBe(product.price * 2)
        expect(record.cod_fee).toBe(COD_FEE)
        expect(record.line_items[0].price).toBe(product.price)
    })

    it("should return a confirmation summary without address or phone", async () => {
        const response = await POST(makeRequest(makePayload()))
        const { order } = await response.json()

        expect(order.orderId).toMatch(/^ORD-\d{8}-[A-F0-9]{8}$/)
        expect(order.total).toBe(product.price * 2 + COD_FEE)
        expect(order.items[0]).toMatchObject({
            productId: "p1",
            title: product.title,
            quantity: 2,
            lineTotal: product.price * 2,
        })
        expect(order).not.toHaveProperty("phone")
        expect(order).not.toHaveProperty("addressLine1")
    })

    it("should ignore a tampered client price", async () => {
        const payload = makePayload({
            cartItems: [
                {
                    productId: "p1",
                    size: product.sizes[0],
                    material: product.materials[0],
                    quantity: 1,
                    price: 0.01,
                    title: "Free poster",
                },
            ],
        })

        const response = await POST(makeRequest(payload))
        const data = await response.json()

        expect(response.status).toBe(200)
        expect(data.amount).toBe(product.price + COD_FEE)
        expect(insertMock.mock.calls[0][0].line_items[0].title).toBe(product.title)
    })

    it("should reject a variant the product does not offer", async () => {
        const payload = makePayload({
            cartItems: [{ productId: "p1", size: "XXL (40x60)", material: "Gold", quantity: 1 }],
        })

        const response = await POST(makeRequest(payload))
        expect(response.status).toBe(400)
        expect(insertMock).not.toHaveBeenCalled()
    })

    it("should refuse online payment until a provider is integrated", async () => {
        const response = await POST(makeRequest(makePayload({ paymentMethod: "stripe" })))
        expect(response.status).toBe(400)
        expect(insertMock).not.toHaveBeenCalled()
    })

    it("should return an error, not success, when the order cannot be saved", async () => {
        insertMock.mockResolvedValue({ error: { message: 'relation "orders" does not exist' } })

        const response = await POST(makeRequest(makePayload()))
        const data = await response.json()

        expect(response.status).toBe(503)
        expect(data.success).toBeUndefined()
    })

    it("should reject malformed JSON", async () => {
        const request = new Request("http://localhost/api/orders/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "{not json",
        })

        const response = await POST(request)
        expect(response.status).toBe(400)
    })

    it("should rate limit repeated requests from the same IP", async () => {
        for (let i = 0; i < 5; i++) {
            await POST(makeRequest(makePayload(), "198.51.100.9"))
        }

        const response = await POST(makeRequest(makePayload(), "198.51.100.9"))
        expect(response.status).toBe(429)
        expect(response.headers.get("Retry-After")).toBeTruthy()
    })
})
