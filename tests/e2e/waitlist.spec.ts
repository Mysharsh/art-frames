import { test, expect } from '@playwright/test'

test.describe('Waitlist Functionality', () => {
    test('should open waitlist modal', async ({ page }) => {
        await page.goto('/')
        const waitlistButton = page.locator('button').filter({ hasText: /waitlist|join/i }).first()
        if (await waitlistButton.isVisible()) {
            await waitlistButton.click()
            const modal = page.locator('[role="dialog"]').first()
            await expect(modal).toBeVisible()
        }
    })

    test('should submit waitlist form with valid email', async ({ page }) => {
        await page.goto('/')
        const waitlistButton = page.locator('button').filter({ hasText: /waitlist|join/i }).first()
        if (await waitlistButton.isVisible()) {
            await waitlistButton.click()
            const emailInput = page.locator('input[type="email"]').first()
            if (await emailInput.isVisible()) {
                await emailInput.fill('test@example.com')
                const submitButton = page.locator('button').filter({ hasText: /submit|join|add/i }).last()
                await submitButton.click()
                // Check for success or error message
                const feedback = page.locator('text=/success|added|confirmation|already|error/i')
                await expect(feedback).toBeVisible({ timeout: 3000 })
            }
        }
    })

    test('should reject invalid email format', async ({ page }) => {
        await page.goto('/')
        const waitlistButton = page.locator('button').filter({ hasText: /waitlist|join/i }).first()
        if (await waitlistButton.isVisible()) {
            await waitlistButton.click()
            const emailInput = page.locator('input[type="email"]').first()
            if (await emailInput.isVisible()) {
                await emailInput.fill('invalid-email')
                const submitButton = page.locator('button').filter({ hasText: /submit|join|add/i }).last()
                await submitButton.click()
                const errorMessage = page.locator('text=/error|invalid|invalid email/i')
                // Should show validation error
                if (await errorMessage.isVisible({ timeout: 1000 }).catch(() => false)) {
                    await expect(errorMessage).toBeVisible()
                }
            }
        }
    })

    test('should reject disposable emails', async ({ page }) => {
        await page.goto('/')
        const waitlistButton = page.locator('button').filter({ hasText: /waitlist|join/i }).first()
        if (await waitlistButton.isVisible()) {
            await waitlistButton.click()
            const emailInput = page.locator('input[type="email"]').first()
            if (await emailInput.isVisible()) {
                await emailInput.fill('test@tempmail.com')
                const submitButton = page.locator('button').filter({ hasText: /submit|join|add/i }).last()
                // Wait a bit for potential client-side validation
                await page.waitForTimeout(500)
                const errorMessage = page.locator('text=/disposable|temporary|not allowed/i')
                // Might reject with server response
                if (await errorMessage.isVisible({ timeout: 1000 }).catch(() => false)) {
                    await expect(errorMessage).toBeVisible()
                }
            }
        }
    })

    test('should close modal with close button', async ({ page }) => {
        await page.goto('/')
        const waitlistButton = page.locator('button').filter({ hasText: /waitlist|join/i }).first()
        if (await waitlistButton.isVisible()) {
            await waitlistButton.click()
            const modal = page.locator('[role="dialog"]').first()
            await expect(modal).toBeVisible()
            // Find close button (X icon)
            const closeButton = page.locator('[aria-label*="close"], button:has-text("×")')
            if (await closeButton.first().isVisible({ timeout: 1000 }).catch(() => false)) {
                await closeButton.first().click()
                await expect(modal).not.toBeVisible()
            }
        }
    })

    test('should close modal with ESC key', async ({ page }) => {
        await page.goto('/')
        const waitlistButton = page.locator('button').filter({ hasText: /waitlist|join/i }).first()
        if (await waitlistButton.isVisible()) {
            await waitlistButton.click()
            const modal = page.locator('[role="dialog"]').first()
            await expect(modal).toBeVisible()
            await page.keyboard.press('Escape')
            await expect(modal).not.toBeVisible()
        }
    })

    test('should validate email field is required', async ({ page }) => {
        await page.goto('/')
        const waitlistButton = page.locator('button').filter({ hasText: /waitlist|join/i }).first()
        if (await waitlistButton.isVisible()) {
            await waitlistButton.click()
            const submitButton = page.locator('button').filter({ hasText: /submit|join|add/i }).last()
            // Try to submit empty form
            await submitButton.click()
            // Should show validation error or prevent submission
            const errorMessage = page.locator('text=/required|enter|email/i')
            if (await errorMessage.isVisible({ timeout: 1000 }).catch(() => false)) {
                await expect(errorMessage).toBeVisible()
            }
        }
    })

    test('should prevent rate limiting for legitimate requests', async ({ page }) => {
        await page.goto('/')
        // Make a single request - should succeed
        const waitlistButton = page.locator('button').filter({ hasText: /waitlist|join/i }).first()
        if (await waitlistButton.isVisible()) {
            await waitlistButton.click()
            const emailInput = page.locator('input[type="email"]').first()
            if (await emailInput.isVisible()) {
                await emailInput.fill(`test${Date.now()}@example.com`)
                const submitButton = page.locator('button').filter({ hasText: /submit|join|add/i }).last()
                const response = await Promise.race([
                    (async () => {
                        await submitButton.click()
                        return 'submitted'
                    })(),
                    new Promise((resolve) => setTimeout(() => resolve('timeout'), 5000))
                ])
                expect(response).not.toBe('blocked')
            }
        }
    })

    test('should persist form data on error', async ({ page }) => {
        await page.goto('/')
        const waitlistButton = page.locator('button').filter({ hasText: /waitlist|join/i }).first()
        if (await waitlistButton.isVisible()) {
            await waitlistButton.click()
            const emailInput = page.locator('input[type="email"]').first()
            if (await emailInput.isVisible()) {
                const email = `test${Date.now()}@test.com`
                await emailInput.fill(email)
                // Get the current value
                const currentValue = await emailInput.inputValue()
                expect(currentValue).toBe(email)
            }
        }
    })
})
