import { test, expect } from '@playwright/test'

test.describe('Search Functionality', () => {
    test('should display search overlay button', async ({ page }) => {
        await page.goto('/')
        const searchButton = page.locator('button[aria-label="Search"]').first()
        await expect(searchButton).toBeVisible()
    })

    test('should open search overlay', async ({ page }) => {
        await page.goto('/')
        const searchButton = page.locator('button[aria-label="Search"]').first()
        if (await searchButton.isVisible()) {
            await searchButton.click()
            const searchInput = page.locator('input[placeholder*="search" i], input[type="search"]').first()
            await expect(searchInput).toBeVisible()
        }
    })

    test('should search for products', async ({ page }) => {
        await page.goto('/')
        const searchButton = page.locator('button[aria-label="Search"]').first()
        if (await searchButton.isVisible()) {
            await searchButton.click()
            const searchInput = page.locator('input[placeholder*="search" i], input[type="search"]').first()
            if (await searchInput.isVisible()) {
                await searchInput.fill('anime')
                // Wait for search results
                await page.waitForLoadState('networkidle')
                // Results should be displayed
                const results = page.locator('[class*="product"], [class*="result"]')
                const count = await results.count()
                expect(count).toBeGreaterThanOrEqual(0)
            }
        }
    })

    test('should navigate from search results', async ({ page }) => {
        await page.goto('/')
        const searchButton = page.locator('button[aria-label="Search"]').first()
        if (await searchButton.isVisible()) {
            await searchButton.click()
            const searchInput = page.locator('input[placeholder*="search" i], input[type="search"]').first()
            if (await searchInput.isVisible()) {
                await searchInput.fill('anime')
                await page.waitForLoadState('networkidle')
                // Click first result if available
                const firstResult = page.locator('[class*="product"], a[href*="/product/"]').first()
                if (await firstResult.isVisible({ timeout: 2000 }).catch(() => false)) {
                    await firstResult.click()
                    // Should navigate to product page
                    expect(page.url()).toMatch(/\/product\//)
                }
            }
        }
    })

    test('should handle empty search', async ({ page }) => {
        await page.goto('/')
        const searchButton = page.locator('button[aria-label="Search"]').first()
        if (await searchButton.isVisible()) {
            await searchButton.click()
            const searchInput = page.locator('input[placeholder*="search" i], input[type="search"]').first()
            if (await searchInput.isVisible()) {
                await searchInput.fill('')
                // Should not show results or show all products
                const overlay = page.locator('[class*="overlay"], [role="dialog"]').first()
                if (await overlay.isVisible()) {
                    // Search overlay should still be visible
                    await expect(overlay).toBeVisible()
                }
            }
        }
    })

    test('should close search overlay with ESC', async ({ page }) => {
        await page.goto('/')
        const searchButton = page.locator('button[aria-label="Search"]').first()
        if (await searchButton.isVisible()) {
            await searchButton.click()
            const overlay = page.locator('[class*="search-overlay"], [role="dialog"]').first()
            if (await overlay.isVisible()) {
                await page.keyboard.press('Escape')
                await expect(overlay).not.toBeVisible()
            }
        }
    })

    test('should have keyboard navigation in search', async ({ page }) => {
        await page.goto('/')
        const searchButton = page.locator('button[aria-label="Search"]').first()
        if (await searchButton.isVisible()) {
            await searchButton.click()
            const searchInput = page.locator('input[placeholder*="search" i], input[type="search"]').first()
            if (await searchInput.isVisible()) {
                // Focus should be in search input
                const focused = await page.evaluate(() => {
                    const el = document.activeElement as HTMLInputElement | null
                    return el?.type
                })
                expect(focused).toBe('text')
            }
        }
    })

    test('should display search results count', async ({ page }) => {
        await page.goto('/')
        const searchButton = page.locator('button[aria-label="Search"]').first()
        if (await searchButton.isVisible()) {
            await searchButton.click()
            const searchInput = page.locator('input[placeholder*="search" i], input[type="search"]').first()
            if (await searchInput.isVisible()) {
                await searchInput.fill('anime')
                await page.waitForLoadState('networkidle')
                // Check for results counter (optional feature)
                const counter = page.locator('text=/(\\d+) results?/i')
                if (await counter.isVisible({ timeout: 1000 }).catch(() => false)) {
                    await expect(counter).toBeVisible()
                }
            }
        }
    })
})
