import { test, expect } from '@playwright/test'

test.describe('Search Functionality', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/')
        await page.getByRole('button', { name: 'Search' }).click()
    })

    test('opens the overlay and focuses the search input', async ({ page }) => {
        const input = page.getByPlaceholder('Search metal posters, artists...')

        await expect(input).toBeVisible()
        await expect(input).toBeFocused()
        await expect(page.getByRole('button', { name: 'Close search' })).toBeVisible()
    })

    test('finds products by title and navigates to the chosen result', async ({ page }) => {
        const input = page.getByPlaceholder('Search metal posters, artists...')
        await input.fill('samurai')

        const result = page.getByRole('link', { name: /Neon Samurai/i }).first()
        await expect(result).toBeVisible()
        await result.click()

        await expect(page).toHaveURL(/\/product\/p1$/)
        await expect(page.getByRole('heading', { name: 'Neon Samurai' })).toBeVisible()
    })

    test('shows an empty-state message when nothing matches', async ({ page }) => {
        const input = page.getByPlaceholder('Search metal posters, artists...')
        await input.fill('zzzzzz')

        await expect(page.getByText(/No results found for/i)).toBeVisible()
    })

    test('closes the overlay with Escape', async ({ page }) => {
        const input = page.getByPlaceholder('Search metal posters, artists...')
        await expect(input).toBeVisible()

        await page.keyboard.press('Escape')
        await expect(input).not.toBeVisible()
    })
})
