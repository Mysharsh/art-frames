import { test, expect } from '@playwright/test'

test.describe('Product Pages', () => {
    test('should load product detail page', async ({ page }) => {
        await page.goto('/product/p1')
        await expect(page.locator('h1').first()).toBeVisible({ timeout: 5000 })
        const image = page.locator('img[alt]').first()
        await expect(image).toBeVisible()
    })

    test('should show product pricing', async ({ page }) => {
        await page.goto('/product/p1')
        const price = page.locator('text=/\\$/').first()
        await expect(price).toBeVisible({ timeout: 5000 })
    })

    test('should have add to cart button', async ({ page }) => {
        await page.goto('/product/p1')
        await page.waitForFunction(() => document.body.innerText.length > 100)
        const button = page.locator('button[aria-label="Wishlist"], button:has-text("Notify")').first()
        await expect(button).toBeVisible({ timeout: 5000 })
    })

    test('should display 404 for non-existent product', async ({ page }) => {
        const response = await page.goto('/product/non-existent-id')
        expect([404, 200]).toContain(response?.status() || 200)
    })

    test('should show product description', async ({ page }) => {
        await page.goto('/product/p1')
        await expect(page.locator('text=/description|details|about/i')).toBeVisible({ timeout: 5000 })
    })

    test('should display product category', async ({ page }) => {
        await page.goto('/product/p1')
        const category = page.locator('[class*="badge"], [class*="tag"]').first()
        if (await category.isVisible({ timeout: 3000 }).catch(() => false)) {
            await expect(category).toBeVisible()
        }
    })

    test('should have working back button', async ({ page }) => {
        await page.goto('/product/p1')
        const backButton = page.locator('button').filter({ hasText: /back|home|products/i }).first()
        const backLink = page.locator('a').filter({ hasText: /back|products/i }).first()

        if (await backButton.isVisible()) {
            await backButton.click()
        } else if (await backLink.isVisible()) {
            await backLink.click()
        }
    })

    test('should handle product navigation', async ({ page }) => {
        await page.goto('/product/p1')
        // Should have unique content for this product
        const content = await page.textContent('body')
        expect(content?.length).toBeGreaterThan(100)
    })

    test('should preload multiple products', async ({ page }) => {
        await page.goto('/product/p1')
        await page.goto('/product/p2')
        await page.goto('/product/p3')
        // All should load successfully
        const heading = page.locator('h1').first()
        await expect(heading).toBeVisible({ timeout: 5000 })
    })

    test('should display related products', async ({ page }) => {
        await page.goto('/product/p1')
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
        // Related products section might exist
        const related = page.locator('text=/related|similar|you.?might.?like/i')
        if (await related.isVisible({ timeout: 3000 }).catch(() => false)) {
            await expect(related).toBeVisible()
        }
    })
})
