import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

/**
 * Automated WCAG 2.1 A/AA scan (axe-core) of the key pages and overlays.
 * Any violation fails the test with a readable summary.
 */
async function expectNoViolations(page: Page, context: string) {
    const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze()

    const summary = results.violations.map(
        (v) => `${v.id} (${v.impact}): ${v.help}\n    ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join('\n    ')}`
    )
    expect(summary, `${context}\n${summary.join('\n')}`).toEqual([])
}

async function addToCart(page: Page) {
    await page.goto('/products/p1')
    await page.getByRole('button', { name: 'Add To Cart' }).click()
}

test.describe('Automated accessibility (axe, WCAG 2.1 AA)', () => {
    for (const [name, path] of [
        ['home', '/'],
        ['collection', '/collections/all'],
        ['product', '/products/p1'],
        ['login', '/auth/login'],
        ['about', '/about'],
        ['empty cart', '/cart'],
        ['orders', '/orders'],
    ] as const) {
        test(`${name} page`, async ({ page }) => {
            await page.goto(path)
            await page.waitForLoadState('domcontentloaded')
            await expectNoViolations(page, path)
        })
    }

    test('cart with items', async ({ page }) => {
        await addToCart(page)
        await page.goto('/cart')
        await expect(page.getByRole('heading', { name: 'Neon Samurai' })).toBeVisible()
        await expectNoViolations(page, '/cart (with items)')
    })

    test('checkout with validation errors', async ({ page }) => {
        await addToCart(page)
        await page.goto('/checkout')
        await page.getByRole('button', { name: /Place Order/ }).click()
        await expect(page.getByLabel('Full name')).toHaveAttribute('aria-invalid', 'true')
        await expectNoViolations(page, '/checkout (errors shown)')
    })

    test('order confirmation', async ({ page }) => {
        await page.goto('/')
        await page.evaluate(() =>
            sessionStorage.setItem(
                'posterwaala:last-order',
                JSON.stringify({
                    orderId: 'ORD-20261019-ABCDEF12',
                    status: 'pending_cod_confirm',
                    paymentMethod: 'cod',
                    customerName: 'Harsh Singh',
                    city: 'Bengaluru',
                    items: [{ productId: 'p1', title: 'Neon Samurai', size: 'M (12x16)', material: 'Metal Print', quantity: 1, lineTotal: 29 }],
                    subtotal: 29,
                    codFee: 49,
                    total: 78,
                    createdAt: new Date().toISOString(),
                })
            )
        )
        await page.goto('/orders/confirmation?id=ORD-20261019-ABCDEF12')
        await expect(page.getByRole('heading', { name: /Thank you, Harsh/ })).toBeVisible()
        await expectNoViolations(page, '/orders/confirmation')
    })

    test.describe('overlays (mobile)', () => {
        test.use({ viewport: { width: 375, height: 667 } })

        test('waitlist modal', async ({ page }) => {
            await page.goto('/products/p1')
            await page.getByRole('button', { name: 'Notify Me For Drop' }).click()
            await expect(page.getByRole('dialog')).toBeVisible()
            await expectNoViolations(page, 'waitlist modal')
        })

        test('search', async ({ page }) => {
            await page.goto('/')
            await page.getByRole('button', { name: 'Search' }).click()
            await page.getByRole('searchbox').fill('neon')
            await expect(page.getByRole('link', { name: /Neon Samurai/ })).toBeVisible()
            await expectNoViolations(page, 'search')
        })

        test('mobile menu', async ({ page }) => {
            await page.goto('/')
            await page.getByRole('button', { name: 'Open menu' }).click()
            await expect(page.getByRole('dialog')).toBeVisible()
            await expectNoViolations(page, 'mobile menu')
        })
    })
})
