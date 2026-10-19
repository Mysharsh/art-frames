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

        await page.getByLabel('Full name').fill('Harsh Singh')
        await page.getByLabel('Email').fill('harsh@example.com')
        await page.getByLabel('Mobile number').fill('+91 98765 43210')
        await page.getByLabel('House number and street').fill('101, Residency Road')
        await page.getByLabel('City').fill('Bengaluru')
        await page.getByLabel('Pincode').fill('560001')
        await page.getByLabel('State').selectOption('Karnataka')
        await page.getByRole('button', { name: 'Place Order' }).click()

        await expect(page).toHaveURL(/\/orders\/confirmation\?id=ORD-20261019-ABCDEF12$/)
        await expect(page.getByRole('heading', { name: /Thank you, Harsh/ })).toBeVisible()
        await expect(page.getByText('₹107').first()).toBeVisible()
        await expect(cartLink).toHaveAccessibleName('Cart')

        // Only identifiers are sent; the server sets prices.
        expect(requestBody!.cartItems).toEqual([
            { productId: 'p1', size: 'M (12x16)', material: 'Metal Print', quantity: 2 },
        ])
        // The phone is normalised to bare digits before it is sent.
        expect((requestBody as unknown as { phone: string }).phone).toBe('9876543210')
    })

    test('shows field-level errors and focuses the first invalid field', async ({ page }) => {
        await page.goto('/products/p1')
        await page.getByRole('button', { name: 'Add To Cart' }).click()
        await page.goto('/checkout')

        await page.getByRole('button', { name: /Place Order/ }).click()

        await expect(page.getByRole('alert').filter({ hasText: /Please fix \d+ fields below/ })).toBeVisible()
        const name = page.getByLabel('Full name')
        await expect(name).toBeFocused()
        await expect(name).toHaveAttribute('aria-invalid', 'true')
        await expect(name).toHaveAccessibleDescription('Enter your full name')
        await expect(page.getByLabel('State')).toHaveAccessibleDescription('Select your state')

        // The error clears as soon as the value is fixed.
        await name.fill('Harsh Singh')
        await expect(name).not.toHaveAttribute('aria-invalid')
    })

    test('redirects the old /product URL to the canonical /products URL', async ({ page }) => {
        await page.goto('/product/p1')
        await expect(page).toHaveURL(/\/products\/p1$/)
    })
})
