import { test, expect } from '@playwright/test'

test.describe('Accessibility', () => {
    test('uses visible semantic landmarks on the homepage', async ({ page }) => {
        await page.goto('/')

        await expect(page.getByRole('banner')).toBeVisible()
        await expect(page.getByRole('main')).toBeVisible()
        await expect(page.getByRole('navigation').first()).toBeVisible()
        await expect(page.getByRole('heading', { level: 1, name: /Art That/i })).toBeVisible()
    })

    test('exposes accessible names for key header controls', async ({ page }) => {
        await page.goto('/')

        await expect(page.getByRole('button', { name: 'Search' })).toBeVisible()
        await expect(page.getByRole('link', { name: 'Cart' })).toBeVisible()
        await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible()
    })

    test('associates the waitlist email field with its label', async ({ page }) => {
        await page.goto('/products/p1')
        await page.getByRole('button', { name: 'Notify Me for Drop' }).click()

        await expect(page.getByLabel('Email address')).toBeVisible()
    })

    test('renders product imagery with meaningful alt text', async ({ page }) => {
        await page.goto('/products/p1')

        await expect(page.getByAltText('Neon Samurai view 1')).toBeVisible()
    })
})
