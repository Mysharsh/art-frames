import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
    test('renders the hero, primary navigation, and product grid', async ({ page }) => {
        await page.goto('/')

        await expect(page).toHaveTitle(/Posterwaala/i)
        await expect(page.getByRole('banner')).toBeVisible()
        await expect(page.getByRole('heading', { name: /Bold\. Durable\./i })).toBeVisible()
        await expect(page.getByRole('link', { name: 'Shop Now' })).toHaveAttribute('href', '/#products')
        await expect(page.getByRole('link', { name: 'Learn More' })).toHaveAttribute('href', '/#about')
        await expect(page.getByRole('heading', { name: 'All-Time Favorites' })).toBeVisible()
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
