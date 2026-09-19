// spec: specs/todo-add-complete.test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Todo item lifecycle', () => {
  test('Complete an existing todo item', async ({ page }) => {
    // 1. Start from a fresh empty TodoMVC page and add a todo named "Buy milk" by entering it in the primary textbox and pressing Enter.
    await page.goto('https://demo.playwright.dev/todomvc');
    const todoInput = page.getByRole('textbox', { name: 'What needs to be done?' });
    await expect(todoInput).toBeVisible();
    await todoInput.fill('Buy milk');
    await todoInput.press('Enter');
    const todoRow = page.getByRole('listitem').filter({ hasText: 'Buy milk' });
    await expect(todoRow).toBeVisible();
    await expect(todoRow.getByRole('checkbox', { name: 'Toggle Todo' })).not.toBeChecked();
    await expect(page.getByText('1 item left')).toBeVisible();

    // 2. Click the "Toggle Todo" checkbox for the "Buy milk" row.
    await todoRow.getByRole('checkbox', { name: 'Toggle Todo' }).check();
    await expect(todoRow.getByRole('checkbox', { name: 'Toggle Todo' })).toBeChecked();
    await expect(todoRow.locator('label')).toHaveCSS('text-decoration-line', 'line-through');
    await expect(page.getByText('0 items left')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Clear completed' })).toBeVisible();
    await expect(todoRow).toBeVisible();

    // 3. Open the Completed filter.
    await page.getByRole('link', { name: 'Completed' }).click();
    await expect(todoRow).toBeVisible();

    // 4. Open the Active filter.
    await page.getByRole('link', { name: 'Active' }).click();
    await expect(page.getByRole('listitem').filter({ hasText: 'Buy milk' })).toHaveCount(0);
  });
});
