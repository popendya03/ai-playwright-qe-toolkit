// spec: specs/login-valid-invalid-password.test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Login authentication', () => {
  test('Reject a valid username with an invalid password', async ({ page }) => {
    // 1. Start a fresh browser context and verify the login page is ready.
    await page.goto('https://practice.expandtesting.com/login');
    await expect(page).toHaveTitle('Test Login Page for Automation Testing Practice');
    await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();

    // 2. Submit the valid username with an invalid password and verify rejection.
    await page.locator('#username').fill('practice');
    await page.locator('#password').fill('WrongPassword');
    await page.locator('#submit-login').click();

    await expect(page).toHaveURL('https://practice.expandtesting.com/login');
    await expect(page.getByText('Your password is invalid!')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Hi, practice!' })).toBeHidden();
    await expect(page.getByRole('link', { name: 'Logout' })).toBeHidden();
  });
});
