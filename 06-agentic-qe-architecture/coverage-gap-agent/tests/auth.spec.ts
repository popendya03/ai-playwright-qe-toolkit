import { test, expect } from '@playwright/test';

test.describe('Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login.html');
  });

  test('logs in with valid credentials', async ({ page }) => {
    await page.getByTestId('login-email').fill('user@example.com');
    await page.getByTestId('login-password').fill('correct-password');
    await page.getByTestId('login-submit').click();

    await expect(page.getByTestId('login-success')).toBeVisible();
    await expect(page.getByTestId('login-success')).toHaveText('Welcome back!');
  });

  test('shows an error with invalid credentials', async ({ page }) => {
    await page.getByTestId('login-email').fill('user@example.com');
    await page.getByTestId('login-password').fill('wrong-password');
    await page.getByTestId('login-submit').click();

    await expect(page.getByTestId('login-error')).toBeVisible();
    await expect(page.getByTestId('login-error')).toHaveText('Invalid credentials');
  });

  test('does not submit when email is empty', async ({ page }) => {
    await page.getByTestId('login-password').fill('correct-password');
    await page.getByTestId('login-submit').click();

    await expect(page.getByTestId('login-success')).toBeHidden();
    await expect(page.getByTestId('login-error')).toBeHidden();
  });
});