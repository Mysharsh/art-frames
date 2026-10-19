import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
    test('renders the hero, primary navigation, and product grid', async ({ page }) => {
        await page.goto('/')

        await expect(page).toHaveTitle(/Posterwaala/i)
        await expect(page.getByRole('banner')).toBeVisible()
        await expect(page.getByRole('heading', { level: 1, name: /Owns the Wall/i })).toBeVisible()
        await expect(page.getByRole('link', { name: 'Shop Collection' })).toHaveAttribute('href', '/#products')

        const mainNav = page.getByRole('navigation', { name: 'Main' })
        await expect(mainNav.getByRole('link', { name: 'Shop' })).toHaveAttribute('href', '/collections/all')
        await expect(mainNav.getByRole('link', { name: 'Waitlist' })).toHaveAttribute('href', '/waitlist')

        await expect(page.getByRole('link', { name: /Neon Samurai/i }).first()).toBeVisible()
    })

    test('renders category shortcuts for browsing', async ({ page }) => {
        await page.goto('/')

        await expect(page.getByRole('heading', { name: 'Browse By Category' })).toBeVisible()
        await expect(page.getByRole('link', { name: /Anime/i }).first()).toBeVisible()
        await expect(page.getByRole('link', { name: /Gaming/i }).first()).toBeVisible()
        await expect(page.getByRole('link', { name: /Music/i }).first()).toBeVisible()
    })

    test('filters products from the category query string', async ({ page }) => {
        await page.goto('/?category=Anime')

        await expect(page.getByRole('link', { name: /Neon Samurai/i }).first()).toBeVisible()
        await expect(page.getByRole('link', { name: /Cyber Dragon/i }).first()).toBeVisible()
    })

    test('shows global header actions for search, waitlist, and auth', async ({ page }) => {
        await page.goto('/')

        await expect(page.getByRole('button', { name: 'Search' })).toBeVisible()
        await expect(page.getByRole('link', { name: /Waitlist/i })).toBeVisible()
        await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible()
    })
})
