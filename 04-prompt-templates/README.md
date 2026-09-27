# Prompt Templates — Playwright + AI Agents

Prompts I actually use, not theoretical examples. Start with the decision guide below to know which one to reach for — then jump to the matching numbered section.

## Which prompt do I use? Start here.

**If you're testing something for the first time and want to see it work end-to-end, follow this exact order — it works for any URL:**

```
Step 1 → Use Prompt #1 (Planner) to explore the site and get a test plan
Step 2 → Review the plan it gives you (read it, make sure it makes sense)
Step 3 → Use Prompt #2 (Generator) to turn that plan into real test code
Step 4 → Run the generated tests yourself to confirm they pass
Step 5 → Use Prompt #5 (Review) to double-check the generated code before you trust it
Step 6 → If a test ever breaks later, use Prompt #3 (Healer) to fix it
```

This is the default path — when in doubt, start here.

**Skip straight to Prompt #4 instead of Steps 1-3 only if:** you already know exactly what needs testing — you're working from a written requirement or ticket, not exploring an unfamiliar page — and you don't need the AI to inspect the live site first. Prompt #4 generates a test directly from a description, no exploration step. Use this when you're translating a known requirement into a test, not when you're figuring out what to test on a page you haven't worked with yet.

**Use Prompt #6 any time**, independently of the above — it's for checking whether existing tests already cover something, not for creating new tests.

---

## Try it yourself, step by step, on any URL

Pick any website with a simple flow — a login form, a search bar, a signup page. Then:

1. Open Copilot Chat with the **Planner** agent selected
2. Run **Prompt #1** below, replacing the URL and action with your own site
3. Read the plan it saves — does it make sense for what that page actually does?
4. Switch to the **Generator** agent, run **Prompt #2**, pointing at the plan file it just created
5. Run the generated tests yourself: `npx playwright test [path to the new test file]`
6. If they pass — good. Run **Prompt #5** against the generated code as a second check anyway, since passing doesn't always mean the assertions are meaningful, just that they didn't fail.
7. If a test fails, or if you deliberately break something later to test the healer, switch to the **Healer** agent and run **Prompt #3**

---

## 1. Exploring a page and writing a test plan (Planner)

```
Explore [URL] and create a test plan for [specific user action, e.g. "logging in with valid credentials"]
```

**When to use this:** you have a live page and want the AI to actually look at it before deciding what to test — this is the starting point for testing anything unfamiliar.

**Why this structure works:** giving the planner a real URL means it inspects the actual live page instead of guessing from a description. Keep the action specific ("logging in with valid credentials," not just "test the app") so it has a clear scope.

**What I actually got back, testing this on a todo app:** a plan with three scenarios — including one I didn't ask for (rejecting blank input), because the planner tested that boundary itself while exploring.

---

## 2. Turning a plan into real code (Generator)

```
Generate the Playwright tests from the plan at [path to plan file]
```

**When to use this:** right after Prompt #1, once you've reviewed the plan it produced and you're ready to turn it into actual test code.

**Why this structure works:** pointing at an already-reviewed plan file means the generator builds from something you've checked over, instead of writing code from a fresh, un-reviewed interpretation.

**What to watch for:** if the generator can't verify a test live (a file lock, a network issue), a good response says so plainly rather than pretending everything passed. If you get a suspiciously clean "all done" with no mention of verification, run the tests yourself before trusting them.

---

## 3. Fixing a broken test (Healer)

```
The test [file path] is failing. Run it and fix it.
```

**When to use this:** any time a test that used to pass is now failing — whether it broke naturally (the app changed) or you broke it on purpose to test the healer.

**Why this structure works:** short and direct. The healer's job is to investigate — over-explaining the problem in the prompt can bias it toward your guess instead of checking the real cause itself.

**What a good fix looks like:** it should tell you *why* the test broke — usually a locator no longer matching the real page — and correct that specific mismatch. If the response only mentions "increasing timeout" or "retrying," that's a weaker fix worth double-checking.

---

## 4. Generating a test from a plain-English requirement (skips exploration)

```
Generate a Playwright test for the following requirement: [requirement].
Include: happy path, one negative case, and assertions on both UI state and network response.
Use [your team's naming/structure conventions, if any].
```

**When to use this instead of Prompt #1:** when you already know exactly what you want tested — turning a Jira ticket directly into a first-draft test, for example — and don't need the AI to explore the page itself first. If you're not sure yet what a page even does, use Prompt #1 instead; this one skips that discovery step entirely.

**Why this matters:** the explicit "include happy path + negative case" instruction matters — without it, generated tests tend to only cover the obvious success case.

---

## 5. Reviewing an AI-generated test before merging

```
Review this Playwright test for: hallucinated assertions that don't match real app behavior,
overly broad selectors that could match the wrong element, missing negative-path coverage,
and unnecessary duplicate tests. Flag anything you're not confident about rather than assuming it's correct.

[paste the test file]
```

**When to use this:** every time, right before merging any AI-generated test — whether it came from Prompt #2 or Prompt #4. Treat this as a mandatory last step, not optional.

**What it's good at:** structural issues — broad selectors, missing cases, duplicated tests. **What it's weaker at:** confirming an assertion is actually *true* about your app, since that really requires running the test, not just reading it. Prefer a reviewer that can execute the test over one that only reads the code, when that option is available — see the real example in `05-ai-test-review-checklist` for why this distinction matters in practice.

---

## 6. Asking an agent to check test coverage for a specific flow

```
Look at [feature/page] and check whether the existing tests in [test folder] cover:
- The happy path
- What happens with invalid input
- What happens if [a specific failure condition, e.g. "the network request fails"]
Report gaps plainly — don't assume coverage exists if you're not certain.
```

**When to use this:** any time, independently of the workflow above — before you start writing new tests for a feature, to check what's already covered rather than duplicating work or assuming a gap exists.

---

## The pattern across all of these

None of these prompts say "just do it and tell me it's done." Every one points to something concrete to check against (a live page, a plan file, real test files) or explicitly asks the agent to flag uncertainty. Vague prompts get you confident-sounding but unverified output. Specific, checkable prompts get you output you can actually trust, or at least know where to double-check.

---

## Does this actually generalize? Tested it on a second, unrelated site

Everything above was originally built around a todo-list app. Before trusting it, I ran the full Steps 1-6 workflow on a completely different kind of page — a login form at `practice.expandtesting.com` — to check whether the prompts hold up outside the one example they were written for, not just reused wording that happens to work once.

**Prompt #1 (Planner)**, given the login page and a plain description of valid/invalid credentials, came back with a plan covering both a successful login and a wrong-password case — including a detail I didn't specify: it planned to check that the "Logout" link and secure-area greeting are specifically **not** visible after a failed login, not just that an error appears.

**Prompt #2 (Generator)** turned that into two real files, `valid-login.spec.ts` and `invalid-password.spec.ts`. Both passed on the first run:
```
npx playwright test tests/login-check
```

**Prompt #5 (Review)**, run against both files with no flaws injected this time, came back clean — and was explicit about the limits of what it had actually checked:

> "I reviewed the code and the previously observed browser behavior; I did not run the specs."

It also corrected something worth being precise about: the `// seed:` comment at the top of a generated test file is just a label — metadata noting an assumption — not something that actually executes. The real test isolation comes from Playwright's own default of giving every test its own fresh browser context. Worth knowing, since it's easy to assume that comment is doing more than it is.

**What this actually proves:** the workflow isn't tuned to one example. Same prompts, unrelated site, real pass, and a review that was honest about exactly what it had and hadn't verified.