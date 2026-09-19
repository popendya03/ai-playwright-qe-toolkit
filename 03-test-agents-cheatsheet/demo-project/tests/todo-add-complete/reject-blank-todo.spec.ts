// spec: specs/todo-add-complete.test.plan.md
// seed: tests/seed.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Todo item lifecycle', () => {
  test('Ignore whitespace-only todo submission', async ({ page }) => {
    // 1. Start from a fresh empty TodoMVC page.
    await page.goto('https://demo.playwright.dev/todomvc');
    const todoInput = page.getByRole('textbox', { name: 'What needs to be done?' });
    await expect(todoInput).toBeVisible();
    await expect(page.getByRole('listitem')).toHaveCount(0);

    // 2. Enter only spaces in the "What needs to be done?" textbox and press Enter.
    await todoInput.fill('   ');
    await todoInput.press('Enter');
    await expect(page.getByRole('listitem')).toHaveCount(0);
    await expect(page.getByText(/item[s]? left/)).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Active' })).toHaveCount(0);
  });
});
