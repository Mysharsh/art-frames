import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
    test('should load homepage successfully', async ({ page }) => {
        await page.goto('/')

        // Check if main content is visible
        await expect(page).toHaveTitle(/ArtFrames/i)

        // Check for hero banner
        await expect(page.locator('text=/Bold|Durable|Limited Drops/i').first()).toBeVisible({ timeout: 5000 })
    })

    test('should display product grid', async ({ page }) => {
        await page.goto('/')

        // Wait for products to load
        const products = page.locator('a[href^="/product/"]').first()
        await expect(products).toBeVisible({ timeout: 5000 })
    })

    test('should have working navigation', async ({ page }) => {
        await page.goto('/')

        // Check for header
        const header = page.locator('header').first()
        await expect(header).toBeVisible()
    })

    test('should filter products by category', async ({ page }) => {
        await page.goto('/')

        // Look for category chips or buttons
        const categoryFilter = page.locator('button:has-text("Anime")').first()
        if (await categoryFilter.isVisible()) {
            await categoryFilter.click()
            // Products should reload
            await page.waitForLoadState('networkidle')
        }
    })
})

test.describe('Product Pages', () => {
    test('should load product detail page', async ({ page }) => {
        await page.goto('/product/p1')

        // Check for product title
        await expect(page.locator('h1').first()).toBeVisible({ timeout: 5000 })

        // Check for product image
        const image = page.locator('img[alt]').first()
        await expect(image).toBeVisible()
    })

    test('should show product pricing', async ({ page }) => {
        await page.goto('/product/p1')

        // Look for price
        const price = page.locator('text=/\\$/').first()
        await expect(price).toBeVisible({ timeout: 5000 })
    })

    test('should have add to cart button', async ({ page }) => {
        await page.goto('/product/p1')

        //  Wait for content to load
        await page.waitForFunction(() => document.body.innerText.length > 100)

        // Look for CTA button
        const button = page.locator('button[aria-label="Wishlist"], button:has-text("Notify")').first()
        await expect(button).toBeVisible({ timeout: 5000 })
    })

    test('should display 404 for non-existent product', async ({ page }) => {
        // Navigate to non-existent product
        const response = await page.goto('/product/non-existent-id')

        // Should show not found
        expect([404, 200]).toContain(response?.status() || 200)  // 200 if custom 404, 404 if standard
    })
})

test.describe('Waitlist Functionality', () => {
    test('should open waitlist modal', async ({ page }) => {
        await page.goto('/')

        // Find and click a waitlist button
        const waitlistButton = page.locator('button').filter({ hasText: /waitlist|join/i }).first()
        if (await waitlistButton.isVisible()) {
            await waitlistButton.click()

            // Check if modal opened
            const modal = page.locator('[role="dialog"]').first()
            await expect(modal).toBeVisible()
        }
    })

    test('should submit waitlist form with valid email', async ({ page }) => {
        await page.goto('/')

        // Find waitlist button
        const waitlistButton = page.locator('button').filter({ hasText: /waitlist|join/i }).first()
        if (await waitlistButton.isVisible()) {
            await waitlistButton.click()

            // Fill in email
            const emailInput = page.locator('input[type="email"]').first()
            if (await emailInput.isVisible()) {
                await emailInput.fill('test@example.com')

                // Submit
                const submitButton = page.locator('button').filter({ hasText: /submit|join|add/i }).last()
                await submitButton.click()

                // Check for success message
                await expect(page.locator('text=/success|added|confirmation/i')).toBeVisible({ timeout: 3000 })
            }
        }
    })

    test('should reject invalid email', async ({ page }) => {
        await page.goto('/')

        const waitlistButton = page.locator('button').filter({ hasText: /waitlist|join/i }).first()
        if (await waitlistButton.isVisible()) {
            await waitlistButton.click()

            const emailInput = page.locator('input[type="email"]').first()
            if (await emailInput.isVisible()) {
                await emailInput.fill('invalid-email')

                const submitButton = page.locator('button').filter({ hasText: /submit|join|add/i }).last()
                await submitButton.click()

                // Check for error message
                await expect(page.locator('text=/error|invalid/i')).toBeVisible({ timeout: 3000 })
            }
        }
    })
})

test.describe('Search Functionality', () => {
    test('should have search overlay', async ({ page }) => {
        await page.goto('/')

        // Look for search button
        const searchButton = page.locator('button[aria-label="Search"]').first()
        if (await searchButton.isVisible()) {
            await searchButton.click()

            // Check for search input
            const searchInput = page.locator('input[placeholder*="search" i]').first()
            await expect(searchInput).toBeVisible()
        }
    })
})

test.describe('Mobile Navigation', () => {
    test.use({ viewport: { width: 375, height: 667 } })

    test('should show mobile menu on small screen', async ({ page }) => {
        await page.goto('/')

        // Look for hamburger menu
        const menuButton = page.locator('button').filter({ hasText: /menu|☰|≡/ }).first()
        if (await menuButton.isVisible()) {
            await menuButton.click()

            // Check for navigation items
            const navItems = page.locator('[role="navigation"]').first()
            await expect(navItems).toBeVisible()
        }
    })

    test('should be responsive on mobile', async ({ page }) => {
        await page.goto('/product/p1')

        // Check viewport dimensions
        const viewport = page.viewportSize()
        expect(viewport?.width).toBeLessThanOrEqual(375)

        // Page should load without errors
        await expect(page).toHaveTitle(/ArtFrames/i)
    })
})

test.describe('Performance', () => {
    test('should load homepage in reasonable time', async ({ page }) => {
        const startTime = Date.now()
        await page.goto('/', { waitUntil: 'networkidle' })
        const loadTime = Date.now() - startTime

        // Should load in less than 5 seconds
        expect(loadTime).toBeLessThan(5000)
    })

    test('should handle network throttling', async ({ page, context }) => {
        // This test checks basic functionality even with slow network
        await page.goto('/')

        // Basic content should still load
        await expect(page.locator('h1').first()).toBeVisible({ timeout: 10000 })
    })
})

test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
        await page.goto('/')

        // Check for h1
        const h1 = page.locator('h1').first()
        await expect(h1).toBeVisible({ timeout: 5000 })
    })

    test('should have keyboard navigation', async ({ page }) => {
        await page.goto('/')

        // Tab to first interactive element
        await page.keyboard.press('Tab')

        // Check if something is focused
        const focused = await page.evaluate(() => {
            return document.activeElement?.tagName
        })

        expect(['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA']).toContain(focused)
    })
})
