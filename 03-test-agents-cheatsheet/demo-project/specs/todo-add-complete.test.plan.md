# TodoMVC Add and Complete Todo Test Plan

## Application Overview

Test plan for the React TodoMVC demo at https://demo.playwright.dev/todomvc. The core workflow creates a todo from the primary input and marks it complete with its row checkbox. The plan also covers the blank-input boundary so invalid submissions do not create todos. Each scenario starts from a fresh empty application state using tests/seed.spec.ts.

## Test Scenarios

### 1. Todo item lifecycle

**Seed:** `tests/seed.spec.ts`

#### 1.1. Add a new todo item

**File:** `tests/todo-add-complete/add-todo.spec.ts`

**Steps:**
  1. Start from a fresh empty TodoMVC page.
    - expect: The page shows the heading "todos" and the textbox "What needs to be done?".
    - expect: No todo row, item counter, or filters are shown.
  2. Enter "Buy milk" in the "What needs to be done?" textbox and press Enter.
    - expect: A todo row labeled "Buy milk" is created.
    - expect: The row's "Toggle Todo" checkbox is unchecked.
    - expect: The counter shows "1 item left".
    - expect: The input is cleared and ready for another todo.

#### 1.2. Complete an existing todo item

**File:** `tests/todo-add-complete/complete-todo.spec.ts`

**Steps:**
  1. Start from a fresh empty TodoMVC page and add a todo named "Buy milk" by entering it in the primary textbox and pressing Enter.
    - expect: The "Buy milk" row is visible with an unchecked "Toggle Todo" checkbox.
    - expect: The counter shows "1 item left".
  2. Click the "Toggle Todo" checkbox for the "Buy milk" row.
    - expect: The checkbox becomes checked.
    - expect: The "Buy milk" row is visually marked completed, such as struck-through text.
    - expect: The counter changes to "0 items left".
    - expect: A "Clear completed" button appears.
    - expect: The completed todo remains visible in the default All view.
  3. Open the Completed filter.
    - expect: The completed "Buy milk" todo is shown in the Completed view.
  4. Open the Active filter.
    - expect: The active list contains no todo items.

#### 1.3. Ignore whitespace-only todo submission

**File:** `tests/todo-add-complete/reject-blank-todo.spec.ts`

**Steps:**
  1. Start from a fresh empty TodoMVC page.
    - expect: The primary textbox is visible and the todo list is empty.
  2. Enter only spaces in the "What needs to be done?" textbox and press Enter.
    - expect: No todo row is created.
    - expect: The page remains in the empty-list state.
    - expect: No item counter or filter controls appear.
