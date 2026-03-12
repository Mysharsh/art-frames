import { test, expect } from '@playwright/test'

test.describe('Waitlist Functionality', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/product/p1')
        await page.getByRole('button', { name: 'Notify Me for Drop' }).click()
        await expect(page.getByRole('heading', { name: 'Join the Waitlist' })).toBeVisible()
    })

    test('shows the waitlist form for the selected product', async ({ page }) => {
        await expect(page.getByText('Neon Samurai')).toBeVisible()
        await expect(page.getByLabel('Email address')).toBeVisible()
        await expect(page.getByRole('button', { name: 'Join Waitlist for Launch' })).toBeVisible()
    })

    test('rejects disposable email addresses with a visible error', async ({ page }) => {
        await page.getByLabel('Email address').fill('playwright@tempmail.com')
        await page.getByRole('button', { name: 'Join Waitlist for Launch' }).click()

        await expect(page.getByText('Validation failed')).toBeVisible()
    })

    test('submits successfully and persists the item on the waitlist page', async ({ page }) => {
        const email = `playwright-${Date.now()}@example.com`

        await page.getByLabel('Email address').fill(email)
        await page.getByRole('button', { name: 'Join Waitlist for Launch' }).click()

        await expect(page.getByRole('heading', { name: /You're on the list!/i })).toBeVisible()
        await expect(page.getByText(email)).toBeVisible()

        await page.getByRole('button', { name: 'Continue Browsing' }).click()
        await page.getByRole('link', { name: /Waitlist/i }).click()

        await expect(page).toHaveURL(/\/waitlist$/)
        await expect(page.getByRole('heading', { name: 'My Waitlist' })).toBeVisible()
        await expect(page.getByText('Neon Samurai')).toBeVisible()
        await expect(page.getByText(email)).toBeVisible()
    })
})
