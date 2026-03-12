import { test, expect } from '@playwright/test'

test.describe('Mobile Navigation', () => {
    test.use({ viewport: { width: 375, height: 667 } })

    test('opens the mobile menu and shows key navigation links', async ({ page }) => {
        await page.goto('/')

        await page.getByRole('button', { name: 'Open menu' }).click()
        const mobileNav = page.getByRole('navigation').filter({ hasText: 'My Waitlist' })

        await expect(mobileNav.getByRole('button', { name: 'Close menu' })).toBeVisible()
        await expect(mobileNav.getByRole('link', { name: 'Home' })).toBeVisible()
        await expect(mobileNav.getByRole('link', { name: 'My Waitlist' })).toBeVisible()
        await expect(mobileNav.getByRole('link', { name: 'Anime', exact: true })).toBeVisible()
        await expect(mobileNav.getByRole('link', { name: 'Contact' })).toBeVisible()
    })

    test('opens search from the mobile header', async ({ page }) => {
        await page.goto('/')

        await page.getByRole('button', { name: 'Search' }).click()
        await expect(page.getByPlaceholder('Search metal posters, artists...')).toBeVisible()
    })

    test('renders the primary CTA on a mobile product page', async ({ page }) => {
        await page.goto('/product/p1')

        await expect(page.getByRole('heading', { name: 'Neon Samurai' })).toBeVisible()
        await expect(page.getByRole('button', { name: 'Notify Me for Drop' })).toBeVisible()
    })
})
