import { test, expect } from '@playwright/test'

test.describe('Product Pages', () => {
    test('renders the full product detail page for Neon Samurai', async ({ page }) => {
        await page.goto('/product/p1')

        await expect(page).toHaveTitle(/Neon Samurai/i)
        await expect(page.getByRole('heading', { name: 'Neon Samurai' })).toBeVisible()
        await expect(page.getByText('by Yuki Tanaka')).toBeVisible()
        await expect(page.getByText('$29')).toBeVisible()
        await expect(page.getByText('$39')).toBeVisible()
        await expect(page.getByRole('button', { name: 'Share' })).toBeVisible()
        await expect(page.getByRole('button', { name: 'Wishlist' })).toBeVisible()
        await expect(page.getByRole('button', { name: 'Bag' })).toBeVisible()
        await expect(page.getByRole('button', { name: 'Notify Me for Drop' })).toBeVisible()
        await expect(page.getByText('Metal Print')).toBeVisible()
    })

    test('opens and closes the waitlist modal from the product page', async ({ page }) => {
        await page.goto('/product/p1')

        await page.getByRole('button', { name: 'Notify Me for Drop' }).click()
        await expect(page.getByRole('heading', { name: 'Join the Waitlist' })).toBeVisible()
        await expect(page.getByLabel('Email address')).toBeVisible()

        await page.getByRole('button', { name: 'Close modal' }).click()
        await expect(page.getByRole('heading', { name: 'Join the Waitlist' })).not.toBeVisible()
    })

    test('shows related products for discovery', async ({ page }) => {
        await page.goto('/product/p1')

        await expect(page.getByRole('heading', { name: 'You May Also Like' })).toBeVisible()
        await expect(page.getByRole('link', { name: /Cyber Dragon/i }).first()).toBeVisible()
    })

    test('renders the custom 404 page for unknown products', async ({ page }) => {
        await page.goto('/product/non-existent-id')

        await expect(page.getByRole('heading', { name: '404' })).toBeVisible()
        await expect(page.getByRole('heading', { name: 'Page Not Found' })).toBeVisible()
        await expect(page.getByRole('link', { name: /Back to Home/i })).toBeVisible()
    })
})
