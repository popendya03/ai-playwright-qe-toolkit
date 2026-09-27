// spec: specs/login-valid-invalid-password.test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Login authentication', () => {
  test('Log in with valid credentials', async ({ page }) => {
    // 1. Start a fresh browser context and navigate to the login page.
    await page.goto('https://practice.expandtesting.com/login');
    await expect(page).toHaveTitle('Test Login Page for Automation Testing Practice');
    await expect(page.getByRole('textbox', { name: 'Username' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    await expect(page.getByText('Username: practice', { exact: true })).toBeVisible();
    await expect(page.getByText('Password: SuperSecretPassword!', { exact: true })).toBeVisible();

    // 2. Submit the valid credentials and verify successful authentication.
    await page.locator('#username').fill('practice');
    await page.locator('#password').fill('SuperSecretPassword!');
    await page.locator('#submit-login').click();

    await expect(page).toHaveURL('https://practice.expandtesting.com/secure');
    await expect(page.getByText('You logged into a secure area!')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Hi, practice!' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Logout' })).toBeVisible();
  });
});
