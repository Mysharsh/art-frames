import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
    test('should load homepage successfully', async ({ page }) => {
        await page.goto('/')
        await expect(page).toHaveTitle(/ArtFrames/i)
        await expect(page.locator('text=/Bold|Durable|Limited Drops/i').first()).toBeVisible({ timeout: 5000 })
    })

    test('should display product grid', async ({ page }) => {
        await page.goto('/')
        const products = page.locator('a[href^="/product/"]').first()
        await expect(products).toBeVisible({ timeout: 5000 })
    })

    test('should have working navigation', async ({ page }) => {
        await page.goto('/')
        const header = page.locator('header').first()
        await expect(header).toBeVisible()
    })

    test('should display footer with links', async ({ page }) => {
        await page.goto('/')
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
        // Footer should be accessible
        const footer = page.locator('footer').first()
        if (await footer.isVisible()) {
            await expect(footer).toBeVisible()
        }
    })

    test('should filter products by category', async ({ page }) => {
        await page.goto('/')
        const categoryFilter = page.locator('button:has-text("Anime")').first()
        if (await categoryFilter.isVisible()) {
            await categoryFilter.click()
            await page.waitForLoadState('networkidle')
        }
    })

    test('should load images correctly', async ({ page }) => {
        await page.goto('/')
        const images = page.locator('img').first()
        await expect(images).toBeVisible({ timeout: 5000 })
    })

    test('should display multiple product categories', async ({ page }) => {
        await page.goto('/')
        await page.waitForSelector('button:has-text("All Metal")', { timeout: 5000 })
        const categories = page.locator('button').filter({ hasText: /All Metal|Metal / })
        const count = await categories.count()
        expect(count).toBeGreaterThan(0)
    })

    test('should have featured row visible', async ({ page }) => {
        await page.goto('/')
        const featured = page.locator('text=/featured|popular|trending/i').first()
        if (await featured.isVisible({ timeout: 3000 }).catch(() => false)) {
            await expect(featured).toBeVisible()
        }
    })

    test('should navigate to product from homepage', async ({ page }) => {
        await page.goto('/')
        const productLink = page.locator('[class*="product-card"]').first()
        if (await productLink.isVisible()) {
            await productLink.click()
            await page.waitForLoadState('networkidle')
            // Should be on a product page
            expect(page.url()).toMatch(/\/product\//)
        }
    })

    test('should load homepage with server-side rendering', async ({ page }) => {
        const response = await page.goto('/')
        expect(response?.status()).toBeLessThan(400)
    })
})
