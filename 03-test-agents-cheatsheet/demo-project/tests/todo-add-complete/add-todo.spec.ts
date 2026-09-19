// spec: specs/todo-add-complete.test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Todo item lifecycle', () => {
  test('Add a new todo item', async ({ page }) => {
    // 1. Start from a fresh empty TodoMVC page.
    await page.goto('https://demo.playwright.dev/todomvc');
    await expect(page.getByRole('heading', { name: 'todos' })).toBeVisible();
    const todoInput = page.getByRole('textbox', { name: 'What needs to be done?' });
    await expect(todoInput).toBeVisible();
    await expect(page.getByRole('listitem')).toHaveCount(0);
    await expect(page.getByText(/item[s]? left/)).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Active' })).toHaveCount(0);

    // 2. Enter "Buy milk" in the "What needs to be done?" textbox and press Enter.
    await todoInput.fill('Buy milk');
    await todoInput.press('Enter');
    const todoRow = page.getByRole('listitem').filter({ hasText: 'Buy milk' });
    await expect(todoRow).toBeVisible();
    await expect(todoRow.getByRole('checkbox', { name: 'Toggle Todo' })).not.toBeChecked();
    await expect(page.getByText('1 item left')).toBeVisible();
    await expect(todoInput).toHaveValue('');
  });
});
