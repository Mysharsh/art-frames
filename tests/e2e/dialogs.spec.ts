import { test, expect, type Page } from '@playwright/test'

/**
 * Keyboard behaviour shared by every overlay: announced as a labelled dialog,
 * focus stays inside while open, Escape closes, focus returns to the opener.
 */
async function expectAccessibleDialog(page: Page, openerName: string, dialogName: string) {
    const opener = page.getByRole('button', { name: openerName })
    await opener.focus()
    await page.keyboard.press('Enter')

    const dialog = page.getByRole('dialog', { name: dialogName })
    await expect(dialog).toBeVisible()

    for (let i = 0; i < 12; i++) {
        await page.keyboard.press('Tab')
        expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true)
    }

    await page.keyboard.press('Escape')
    await expect(dialog).toBeHidden()
    await expect(opener).toBeFocused()
}

test.describe('Accessible dialogs', () => {
    test.use({ viewport: { width: 375, height: 667 } })

    test('waitlist modal', async ({ page }) => {
        await page.goto('/products/p1')
        await expectAccessibleDialog(page, 'Notify Me For Drop', 'Join the Waitlist')
    })

    test('search', async ({ page }) => {
        await page.goto('/')
        await expectAccessibleDialog(page, 'Search', 'Search products')
    })

    test('mobile menu', async ({ page }) => {
        await page.goto('/')
        await expectAccessibleDialog(page, 'Open menu', 'Posterwaala')
    })
})
