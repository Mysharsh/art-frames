import { test, expect } from '@playwright/test'

test.describe('Checkout Flow', () => {
    test('adds to cart, places a COD order and shows the confirmation', async ({ page }) => {
        let requestBody: { cartItems: Array<Record<string, unknown>> } | null = null

        // Stub the order API so the UI flow is tested without a live database.
        await page.route('**/api/orders/create', async (route) => {
            requestBody = route.request().postDataJSON()
            const items = requestBody!.cartItems.map((item) => ({
                ...item,
                title: 'Neon Samurai',
                lineTotal: 29 * Number(item.quantity),
            }))
            const subtotal = items.reduce((acc, item) => acc + item.lineTotal, 0)
            await route.fulfill({
                json: {
                    success: true,
                    orderId: 'ORD-20261019-ABCDEF12',
                    order: {
                        orderId: 'ORD-20261019-ABCDEF12',
                        status: 'pending_cod_confirm',
                        paymentMethod: 'cod',
                        customerName: 'Harsh Singh',
                        city: 'Bengaluru',
                        items,
                        subtotal,
                        codFee: 49,
                        total: subtotal + 49,
                        createdAt: new Date().toISOString(),
                    },
                },
            })
        })

        await page.goto('/products/p1')
        await page.getByRole('button', { name: 'Add To Cart' }).click()
        await page.getByRole('button', { name: 'Add To Cart' }).click()

        const cartLink = page.getByRole('banner').getByRole('link', { name: /^Cart/ })
        await expect(cartLink).toHaveAccessibleName('Cart, 2 items')
        await cartLink.click()

        await expect(page).toHaveURL(/\/cart$/)
        await expect(page.getByText('₹58').first()).toBeVisible()
        await page.getByRole('link', { name: 'Continue To Checkout' }).click()

        await expect(page).toHaveURL(/\/checkout$/)
        await expect(page.getByText('Online payment (coming soon)')).toBeVisible()

        const fields: Record<string, string> = {
            'Full Name': 'Harsh Singh',
            Email: 'harsh@example.com',
            'Phone (10 digits)': '9876543210',
            Pincode: '560001',
            'Address Line 1': '101, Residency Road',
            City: 'Bengaluru',
            State: 'Karnataka',
        }
        for (const [placeholder, value] of Object.entries(fields)) {
            await page.getByPlaceholder(placeholder, { exact: true }).fill(value)
        }
        await page.getByRole('button', { name: 'Place Order' }).click()

        await expect(page).toHaveURL(/\/orders\/confirmation\?id=ORD-20261019-ABCDEF12$/)
        await expect(page.getByRole('heading', { name: /Thank you, Harsh/ })).toBeVisible()
        await expect(page.getByText('₹107').first()).toBeVisible()
        await expect(cartLink).toHaveAccessibleName('Cart')

        // Only identifiers are sent; the server sets prices.
        expect(requestBody!.cartItems).toEqual([
            { productId: 'p1', size: 'M (12x16)', material: 'Metal Print', quantity: 2 },
        ])
    })

    test('redirects the old /product URL to the canonical /products URL', async ({ page }) => {
        await page.goto('/product/p1')
        await expect(page).toHaveURL(/\/products\/p1$/)
    })
})
