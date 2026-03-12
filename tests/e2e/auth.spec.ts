import { test, expect } from '@playwright/test'

// ---------------------------------------------------------------------------

test.describe('Authentication', () => {
    test('renders the login page with the expected actions', async ({ page }) => {
        await page.goto('/auth/login')

        await expect(page).toHaveTitle(/Posterwaala/i)
        await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible()
        await expect(page.getByRole('button', { name: 'Sign in with Google' })).toBeVisible()
        await expect(page.getByRole('link', { name: 'Create one' })).toHaveAttribute('href', '/auth/register')
        await expect(page.getByRole('link', { name: /Back to home/i })).toHaveAttribute('href', '/')
    })

    test('renders auth errors passed through the query string', async ({ page }) => {
        await page.goto('/auth/login?error=auth_error&error_description=Test%20authentication%20error')

        await expect(page.getByText('Test authentication error')).toBeVisible()
    })

    test('renders the register page and link back to login', async ({ page }) => {
        await page.goto('/auth/register')

        await expect(page.getByRole('heading', { name: 'Join Us' })).toBeVisible()
        await expect(page.getByRole('button', { name: 'Sign up with Google' })).toBeVisible()
        await expect(page.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/auth/login')
    })

    test('redirects logged-out visitors from /profile to /auth/login', async ({ page }) => {
        await page.context().clearCookies()
        await page.goto('/profile')

        await expect(page).toHaveURL(/\/auth\/login\?next=%2Fprofile|\/auth\/login\?next=\/profile|\/auth\/login/)
        await expect(page.getByRole('heading', { name: 'Sign In' })).toBeVisible()
    })
})
