import { test, expect } from '@playwright/test'

// ---------------------------------------------------------------------------
// Login page — static UI
// ---------------------------------------------------------------------------

test.describe('Authentication – Login page UI', () => {
    test.beforeEach(async ({ page }) => {
        await page.context().clearCookies()
        await page.goto('/auth/login')
        await page.waitForLoadState('networkidle')
    })

    test('shows page title and heading', async ({ page }) => {
        await expect(page).toHaveTitle(/ArtFrames/i)
        await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible()
        await expect(page.getByText(/Join our community/i)).toBeVisible()
    })

    test('Google sign-in button is visible and enabled', async ({ page }) => {
        const btn = page.getByRole('button', { name: /Sign in with Google/i })
        await expect(btn).toBeVisible()
        await expect(btn).toBeEnabled()
    })

    test('register link points to /auth/register', async ({ page }) => {
        const link = page.getByRole('link', { name: /Create one/i })
        await expect(link).toBeVisible()
        await expect(link).toHaveAttribute('href', '/auth/register')
    })

    test('back-to-home link is present and correct', async ({ page }) => {
        const link = page.getByRole('link', { name: /Back to home/i })
        await expect(link).toBeVisible()
        await expect(link).toHaveAttribute('href', '/')
    })
})

// ---------------------------------------------------------------------------
// Login page — error banner
// ---------------------------------------------------------------------------

test.describe('Authentication – Login page error banner', () => {
    test('shows error text from error_description query param', async ({ page }) => {
        await page.goto('/auth/login?error=auth_error&error_description=Test%20authentication%20error')
        await page.waitForLoadState('networkidle')
        await expect(page.getByText('Test authentication error')).toBeVisible()
    })

    test('error banner is absent after navigating without error param', async ({ page }) => {
        await page.goto('/auth/login?error=auth_error&error_description=Stale%20error')
        await expect(page.getByText('Stale error')).toBeVisible()

        await page.goto('/auth/login')
        await page.waitForLoadState('networkidle')
        await expect(page.getByText('Stale error')).not.toBeVisible()
    })
})

// ---------------------------------------------------------------------------
// Login page — button interaction
// ---------------------------------------------------------------------------

test.describe('Authentication – Google button interaction', () => {
    /**
     * In headless Playwright, window.open() can open a real popup. If it opens,
     * we immediately close it → Firebase throws auth/popup-closed-by-user.
     * If the popup is blocked, Firebase throws auth/popup-blocked.
     * Either way, the login page must show an error container.
     *
     * We match the error <div> by its Tailwind destructive class rather than
     * by the exact error string, so the test is robust to both error codes.
     */
    test('shows an error container after sign-in fails in headless', async ({ page }) => {
        await page.context().clearCookies()
        await page.goto('/auth/login')
        await page.waitForLoadState('networkidle')

        page.on('popup', async popup => { await popup.close() })

        await page.getByRole('button', { name: /Sign in with Google/i }).click()

        // Error <div> has border-destructive/50 and bg-destructive/10 classes
        const errorBox = page.locator('div').filter({ hasText: /cancelled|blocked|failed|error/i })
            .and(page.locator('[class*="destructive"]'))
        await expect(errorBox.first()).toBeVisible({ timeout: 15000 })
    })

    test('button is re-enabled after a failed sign-in attempt (not stuck)', async ({ page }) => {
        await page.context().clearCookies()
        await page.goto('/auth/login')
        await page.waitForLoadState('networkidle')

        page.on('popup', async popup => { await popup.close() })

        await page.getByRole('button', { name: /Sign in with Google/i }).click()

        // While the async attempt is running the button label is "Redirecting to
        // Google...". We wait for it to revert to "Sign in with Google" first,
        // which proves loading has finished, then assert it is enabled.
        const btn = page.getByRole('button', { name: /Sign in with Google/i })
        await expect(btn).toBeVisible({ timeout: 15000 })  // waits for loading to clear
        await expect(btn).toBeEnabled()
    })

    test('Google button is reachable via keyboard Tab', async ({ page }) => {
        await page.context().clearCookies()
        await page.goto('/auth/login')
        await page.waitForLoadState('networkidle')

        const btn = page.getByRole('button', { name: /Sign in with Google/i })

        let buttonFocused = false
        for (let i = 0; i < 15; i++) {
            await page.keyboard.press('Tab')
            const isFocused = await btn.evaluate(el => el === document.activeElement)
            if (isFocused) { buttonFocused = true; break }
        }

        expect(buttonFocused).toBe(true)
    })
})

// ---------------------------------------------------------------------------
// Login page — responsive layout
// ---------------------------------------------------------------------------

test.describe('Authentication – Login page responsive', () => {
    test('renders correctly on 375×667 mobile viewport', async ({ browser }) => {
        const ctx = await browser.newContext({ viewport: { width: 375, height: 667 } })
        const mobilePage = await ctx.newPage()
        await mobilePage.goto('/auth/login')
        await mobilePage.waitForLoadState('networkidle')

        await expect(mobilePage.getByRole('heading', { name: 'Sign In' })).toBeVisible()

        const btn = mobilePage.getByRole('button', { name: /Sign in with Google/i })
        await expect(btn).toBeVisible()

        const box = await btn.boundingBox()
        expect(box).not.toBeNull()           // hard fail if bounding box missing
        expect(box!.width).toBeGreaterThan(280)

        await ctx.close()
    })
})

// ---------------------------------------------------------------------------
// Login flow — URL parameter handling
// ---------------------------------------------------------------------------

test.describe('Authentication – Login flow params', () => {
    test('preserves ?next= param for post-login redirect', async ({ page }) => {
        await page.goto('/auth/login?next=/profile')
        await page.waitForLoadState('networkidle')
        const url = new URL(page.url())
        expect(url.searchParams.get('next')).toBe('/profile')
    })

    test('loads correctly without any query params', async ({ page }) => {
        await page.goto('/auth/login')
        await page.waitForLoadState('networkidle')
        await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible()
    })
})

// ---------------------------------------------------------------------------
// Protected routes — unauthenticated redirect
// ---------------------------------------------------------------------------

test.describe('Authentication – Protected routes', () => {
    test('visiting /profile while logged out redirects to /auth/login', async ({ page }) => {
        await page.context().clearCookies()
        await page.goto('/profile')
        await expect(page).toHaveURL(/\/auth\/login/, { timeout: 8000 })
    })
})

// ---------------------------------------------------------------------------
// Registration page
// ---------------------------------------------------------------------------

test.describe('Authentication – Registration page', () => {
    test('navigating from login register link reaches /auth/register', async ({ page }) => {
        await page.goto('/auth/login')
        await page.getByRole('link', { name: /Create one/i }).click()
        await expect(page).toHaveURL(/\/auth\/register/)
        await page.waitForLoadState('networkidle')
    })

    test('register page shows heading "Join Us"', async ({ page }) => {
        await page.goto('/auth/register')
        await page.waitForLoadState('networkidle')
        await expect(page.getByRole('heading', { name: 'Join Us' })).toBeVisible()
    })

    test('register page has a "Sign up with Google" button', async ({ page }) => {
        await page.goto('/auth/register')
        await page.waitForLoadState('networkidle')
        const btn = page.getByRole('button', { name: /Sign up with Google/i })
        await expect(btn).toBeVisible()
        await expect(btn).toBeEnabled()
    })

    test('register page has a "Sign in" link back to /auth/login', async ({ page }) => {
        await page.goto('/auth/register')
        await page.waitForLoadState('networkidle')
        const link = page.getByRole('link', { name: /^Sign in$/i })
        await expect(link).toBeVisible()
        await expect(link).toHaveAttribute('href', '/auth/login')
    })
})

// ---------------------------------------------------------------------------
// Header AuthMenu — unauthenticated state
// ---------------------------------------------------------------------------

test.describe('Authentication – Header AuthMenu (logged out)', () => {
    test.beforeEach(async ({ page }) => {
        await page.context().clearCookies()
        await page.goto('/')
        await page.waitForLoadState('networkidle')
    })

    test('shows "Sign In" link in header when logged out', async ({ page }) => {
        const link = page.getByRole('link', { name: /Sign In/i }).first()
        await expect(link).toBeVisible()
        await expect(link).toHaveAttribute('href', '/auth/login')
    })

    test('"Sign In" link navigates to login page', async ({ page }) => {
        await page.getByRole('link', { name: /Sign In/i }).first().click()
        await expect(page).toHaveURL(/\/auth\/login/)
    })
})
