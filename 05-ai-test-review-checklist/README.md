# AI-Generated Test Review Checklist

A simple list of what to check before you trust an AI-written test enough to merge it. This isn't a theoretical list — it's built from real mistakes I've actually watched AI make. Below, I also show a real test: I broke a working test on purpose, in two specific ways, and had an AI review it to see if it would catch both.

## The four things to check, in plain terms

### 1. Did it make something up?

Sometimes an AI writes a check for something that sounds right, but isn't actually true about your app. For example, it might check for a message like "Success!" popping up — not because your app actually shows that message, but because a lot of apps show *some* success message, so it seemed like a safe guess.

This is the most important one to catch, because it's the easiest to miss just by reading the code — the line looks completely normal.

**How to catch it:** the best way is to actually run the test, not just read it. If the check is made up, running the test will fail immediately and tell you exactly which line is wrong. A reviewer that can run the test, not just read it, is much better at catching this.

### 2. Is it pointing at the right thing, reliably?

Some ways of finding a button or box on a page are risky. For example, "click the first input box on the page" — this works today, but if the page layout changes even slightly (a new field gets added above it), the test might click the wrong thing entirely, without any warning.

A safer way is to point at something by its actual label or role — like "the box labeled Email" — since that stays accurate even if the page layout shifts around.

**How to catch it:** look for anything that finds an element by its position ("the first one," "the third one") or by a generic tag name only ("just find a `div`"), instead of by something specific like a label or role.

### 3. Did it just copy an existing test?

Sometimes AI writes a test that's almost identical to one you already have, instead of building on it or skipping it. This clutters things up — and it gets worse if the copy has a small difference (like a mistake), because now you have two tests that disagree with each other about the same thing.

### 4. Is it missing a check for "what if this goes wrong?" — but check everywhere first

A good test suite doesn't just check that things work — it also checks what happens when something goes wrong (wrong password, empty field, and so on). If a specific test is missing that, it might look like a gap.

But before you flag it as missing, check whether a *different* test file already covers that case. Don't assume every single file needs to handle every situation on its own — sometimes the coverage exists, just somewhere else in the suite.

---

## A real example: I broke a test on purpose, then had it reviewed

I took a test that was already working correctly, made a copy, and added two problems to it, on purpose:

```typescript
// A risky way of finding an element — "just click the first input box"
await page.locator('input').first().click();

// A made-up check — the app never actually shows this message
await expect(page.getByText('Todo added successfully')).toBeVisible();
```

Then I asked an AI to review it, using this instruction:

```
Review this Playwright test for: hallucinated assertions that don't match real app behavior,
overly broad selectors that could match the wrong element, missing negative-path coverage,
and unnecessary duplicate tests. Flag anything you're not confident about rather than assuming it's correct.
```

### What it actually did, not just what it said

Before answering, it looked at the other test files nearby to understand the app's real behavior, noticed something suspicious, and then **actually ran both the broken version and the original test** to double check — rather than just guessing from reading the code.

### What it found, word for word

> **High:** The test asserts a nonexistent success message at `complete-todo-flawed.spec.ts:22`. The focused run confirmed `getByText('Todo added successfully')` never appears, so this is a hallucinated assertion and causes the test to fail.
>
> **Medium:** `page.locator('input').first().click()` at `complete-todo-flawed.spec.ts:21` is overly broad and unrelated to completing the todo. It depends on DOM ordering and could click the wrong input after a markup change. It should be removed; no click is needed after checking the checkbox.
>
> **Medium:** `complete-todo-flawed.spec.ts` duplicates `complete-todo.spec.ts` almost exactly, while adding the invalid toast assertion. If both files run, the flawed duplicate creates redundant coverage and a guaranteed failure.
>
> **Low / covered elsewhere:** This test has no negative-path coverage, but the suite does cover whitespace-only submission in `reject-blank-todo.spec.ts`. I would not add another negative case here unless this file is intended to be standalone.

### Why that last point matters

Notice it didn't just say "this test is missing a check for what happens with bad input." It actually went and looked at the other test files first, found that a different file already covers that exact situation, and correctly said "this isn't actually a gap." That's a meaningfully better answer than a reviewer that just checks one file at a time without looking at the bigger picture — it avoided crying wolf over something that wasn't actually a problem.

---

## The one-sentence takeaway

If you're using AI to review AI-written tests, try to use one that can actually **run** the test, not just read it — the difference between "this looks wrong" and "I ran it and confirmed it's wrong" is the whole ballgame, especially for the made-up-checks problem, which is genuinely hard to catch just by reading code.