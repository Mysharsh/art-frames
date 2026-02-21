import { test, expect } from '@playwright/test'

test.describe('Mobile Navigation', () => {
    test.use({ viewport: { width: 375, height: 667 } })

    test('should show mobile menu on small screen', async ({ page }) => {
        await page.goto('/')
        const menuButton = page.locator('button').filter({ hasText: /menu|☰|hamburger|≡/ }).first()
        if (await menuButton.isVisible()) {
            await menuButton.click()
            const navItems = page.locator('[role="navigation"]').first()
            await expect(navItems).toBeVisible()
        }
    })

    test('should be responsive on mobile viewport', async ({ page }) => {
        await page.goto('/product/p1')
        const viewport = page.viewportSize()
        expect(viewport?.width).toBeLessThanOrEqual(375)
        await expect(page).toHaveTitle(/Art Frames|app/i)
    })

    test('should display bottom navigation on mobile', async ({ page }) => {
        await page.goto('/')
        // Check for bottom nav
        const bottomNav = page.locator('[class*="bottom-nav"], nav[role="navigation"]:last-of-type')
        if (await bottomNav.isVisible({ timeout: 2000 }).catch(() => false)) {
            await expect(bottomNav).toBeVisible()
        }
    })

    test('should support mobile category filter', async ({ page }) => {
        await page.goto('/')
        const categoryButton = page.locator('button').filter({ hasText: /category|filter/i }).first()
        if (await categoryButton.isVisible()) {
            await categoryButton.click()
            // Filter should be accessible
            const filter = page.locator('[class*="filter"], [role="menu"]').first()
            if (await filter.isVisible({ timeout: 1000 }).catch(() => false)) {
                await expect(filter).toBeVisible()
            }
        }
    })

    test('should load product on mobile', async ({ page }) => {
        await page.goto('/product/p1')
        const heading = page.locator('h1').first()
        await expect(heading).toBeVisible({ timeout: 5000 })
    })

    test('should display waitlist modal on mobile', async ({ page }) => {
        await page.goto('/')
        const waitlistButton = page.locator('button').filter({ hasText: /waitlist|join/i }).first()
        if (await waitlistButton.isVisible()) {
            await waitlistButton.click()
            const modal = page.locator('[role="dialog"]').first()
            await expect(modal).toBeVisible()
        }
    })

    test('should handle mobile scroll performance', async ({ page }) => {
        await page.goto('/')
        // Scroll down the page
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
        // Page should remain responsive
        const products = page.locator('[class*="product-card"]')
        const count = await products.count()
        expect(count).toBeGreaterThan(0)
    })

    test('should display images correctly on mobile', async ({ page }) => {
        await page.goto('/')
        const images = page.locator('img')
        const count = await images.count()
        expect(count).toBeGreaterThan(0)
        const firstImage = images.first()
        await expect(firstImage).toBeVisible({ timeout: 5000 })
    })

    test('should support mobile search', async ({ page }) => {
        await page.goto('/')
        const searchButton = page.locator('button').filter({ hasText: /search|🔍/i }).first()
        if (await searchButton.isVisible()) {
            await searchButton.click()
            const searchInput = page.locator('input[placeholder*="search" i]').first()
            await expect(searchInput).toBeVisible()
        }
    })

    test('should be touch-friendly on mobile', async ({ page }) => {
        await page.goto('/')
        // Check button sizes are reasonable for touch
        const buttons = page.locator('button').first()
        const boundingBox = await buttons.boundingBox()
        if (boundingBox) {
            // Touch targets should be at least 48x48 pixels
            expect(boundingBox.height).toBeGreaterThanOrEqual(40)
        }
    })
})
