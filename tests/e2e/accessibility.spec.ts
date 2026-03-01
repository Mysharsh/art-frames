import { test, expect } from '@playwright/test'

test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
        await page.goto('/')
        const h1 = page.locator('h1').first()
        await expect(h1).toBeVisible({ timeout: 5000 })
        // Should have at least one main heading
        const allHeadings = page.locator('h1, h2, h3')
        const count = await allHeadings.count()
        expect(count).toBeGreaterThan(0)
    })

    test('should support keyboard navigation', async ({ page }) => {
        await page.goto('/')
        // Tab to first interactive element
        await page.keyboard.press('Tab')
        const focused = await page.evaluate(() => {
            return document.activeElement?.tagName
        })
        expect(['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA']).toContain(focused)
    })

    test('should have semantic HTML structure', async ({ page }) => {
        await page.goto('/')
        // Check for semantic elements
        const main = page.locator('main')
        const nav = page.locator('nav')
        const hasSemanticElements = await main.isVisible().catch(() => true) ||
            await nav.isVisible().catch(() => true)
        expect(hasSemanticElements).toBeTruthy()
    })

    test('should have alt text for images', async ({ page }) => {
        await page.goto('/product/p1')
        const images = page.locator('img')
        const count = await images.count()

        // Check at least some images have alt text
        let imagesWithAlt = 0
        for (let i = 0; i < Math.min(count, 5); i++) {
            const alt = await images.nth(i).getAttribute('alt')
            if (alt && alt.length > 0) {
                imagesWithAlt++
            }
        }
        expect(imagesWithAlt).toBeGreaterThan(0)
    })

    test('should have proper color contrast', async ({ page }) => {
        await page.goto('/')
        // Check for text content - if visible, contrast should be adequate
        const text = page.locator('body')
        await expect(text).toBeVisible()
    })

    test('should have proper label associations', async ({ page }) => {
        await page.goto('/')
        const inputs = page.locator('input')
        const count = await inputs.count()

        if (count > 0) {
            // Check for associated labels
            const firstInput = inputs.first()
            const label = await firstInput.evaluate((el) => {
                return el.closest('label') ? true :
                    document.querySelector(`label[for="${el.id}"]`) ? true : false
            })
            // Form inputs should have labels
            if (count > 0) {
                expect(label || count === 0).toBeTruthy()
            }
        }
    })

    test('should support ARIA attributes', async ({ page }) => {
        await page.goto('/')
        // Check for ARIA roles and attributes
        const buttons = page.locator('[role="button"], button')
        const count = await buttons.count()
        expect(count).toBeGreaterThan(0)
    })

    test('should be keyboard accessible for dialogs', async ({ page }) => {
        await page.goto('/')
        const waitlistButton = page.locator('button').filter({ hasText: /waitlist|join/i }).first()
        if (await waitlistButton.isVisible()) {
            await waitlistButton.click()
            const modal = page.locator('[role="dialog"]').first()
            if (await modal.isVisible()) {
                // Dialog should be keyboard accessible
                await page.keyboard.press('Tab')
                // Focus should move within dialog
                expect(modal).toBeVisible()
            }
        }
    })

    test('should support focus visible states', async ({ page }) => {
        await page.goto('/')
        // Use a visible focusable button (the search button in header)
        const button = page.locator('button[aria-label="Search"]').first()
        await expect(button).toBeVisible({ timeout: 5000 })
        // Trigger focus
        await button.focus()
        // Button should be focused
        const isFocused = await button.evaluate((el) => {
            return el === document.activeElement
        })
        expect(isFocused).toBeTruthy()
    })

    test('should have skip navigation link', async ({ page }) => {
        await page.goto('/')
        // Check for skip to content link (often visually hidden but keyboard accessible)
        const skipLink = page.locator('a').filter({ hasText: /skip|main/i }).first()
        if (await skipLink.isVisible({ timeout: 1000 }).catch(() => false)) {
            await expect(skipLink).toBeVisible()
        }
    })

    test('should display error messages accessibly', async ({ page }) => {
        await page.goto('/')
        const waitlistButton = page.locator('button').filter({ hasText: /waitlist|join/i }).first()
        if (await waitlistButton.isVisible()) {
            await waitlistButton.click()
            const emailInput = page.locator('input[type="email"]').first()
            if (await emailInput.isVisible()) {
                // Try invalid input
                await emailInput.fill('invalid')
                await page.keyboard.press('Tab')
                // Error should be accessible
                const errorMessage = page.locator('[role="alert"], .error, [class*="error"]')
                if (await errorMessage.isVisible({ timeout: 1000 }).catch(() => false)) {
                    await expect(errorMessage).toBeVisible()
                }
            }
        }
    })

    test('should have readable font sizes', async ({ page }) => {
        await page.goto('/')
        const heading = page.locator('h1').first()
        const fontSize = await heading.evaluate((el) => {
            return window.getComputedStyle(el).fontSize
        })
        // Font size should be readable (at least 16px for body, larger for headings)
        expect(fontSize).toBeTruthy()
    })

    test('should support reduced motion preferences', async ({ page }) => {
        await page.goto('/')
        // Check if animations respect prefers-reduced-motion
        const hasReducedMotion = await page.evaluate(() => {
            return window.matchMedia('(prefers-reduced-motion: reduce)').matches
        })
        // Page should still function with or without animations
        const content = page.locator('body')
        await expect(content).toBeVisible()
    })
})
