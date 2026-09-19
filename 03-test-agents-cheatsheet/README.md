# Setting Up Playwright Test Agents — A Reproducible, Step-by-Step Walkthrough

This is the exact sequence I followed to set up and test Playwright's three built-in AI agents (planner, generator, healer), including every error I hit along the way and how I fixed it. Follow it in order and you should get the same result.

## What you need before starting

- Node.js 18+ installed
- VS Code installed
- GitHub Copilot extension installed and signed in (this guide uses the free Copilot path — see the MCP setup guide for the Claude Code alternative, which requires payment)
- **Important:** don't do this inside a OneDrive, Dropbox, or other synced folder. Use a plain local path like `C:\dev\...`. This matters — explained in Step 6.

---

## Step 1: Create a fresh project folder

```bash
mkdir demo-project
cd demo-project
```

Nothing generated yet — this is just an empty folder to work in.

---

## Step 2: Scaffold a Playwright project

```bash
npm init playwright@latest
```

This asks you a few questions. Answer:
- **TypeScript or JavaScript?** → TypeScript
- **Name of your tests folder?** → press Enter to accept the default (`tests`)
- **Add a GitHub Actions workflow?** → No
- **Install Playwright browsers?** → Yes

**What this generates:**
```
demo-project/
├── tests/
│   └── example.spec.ts       ← a sample test Playwright creates for you
├── tests-examples/
│   └── demo-todo-app.spec.ts ← a larger example test file
├── playwright.config.ts      ← Playwright's configuration file
├── package.json
├── package-lock.json
└── .gitignore
```

It ends with a message that says **"Happy hacking!"** — that's Playwright's way of confirming the scaffold completed successfully.

---

## Step 3: Add the Test Agents

```bash
npx playwright init-agents --loop=vscode
```

(If you're using Claude Code instead of Copilot, use `--loop=claude`. Other options are `--loop=codex` and `--loop=opencode`.)

**What this generates**, with the exact confirmation output you should see:

```
🎭 Using project "chromium" as a primary project
 📝 specs\README.md - directory for test plans
 🌱 tests\seed.spec.ts - default environment seed file
 🤖 .github\agents\playwright-test-generator.agent.md - agent definition
 🤖 .github\agents\playwright-test-healer.agent.md - agent definition
 🤖 .github\agents\playwright-test-planner.agent.md - agent definition
 🔧 .vscode\mcp.json - mcp configuration
 🔧 .github\workflows\copilot-setup-steps.yml - GitHub Copilot setup steps
 ✅ Done.
```

In plain terms, five new things get created:
- **`specs/README.md`** — an empty folder where test plans (from the planner) will get saved
- **`tests/seed.spec.ts`** — a baseline setup file the other agents reference
- **Three `.agent.md` files** in `.github/agents/` — these are the actual agent definitions; each one is a plain Markdown file with instructions telling Copilot how to behave when you select that agent
- **`.vscode/mcp.json`** — automatically configures the Playwright MCP server so the agents can control a real browser
- **`.github/workflows/copilot-setup-steps.yml`** — a GitHub Actions file for running Copilot's coding agent in CI (not something you need to touch for local use)

---

## Step 4: A problem you'll likely hit — the agents don't show up anywhere

If your `demo-project` folder is nested inside a bigger repo (for example, you created it inside a larger project folder rather than as its own standalone folder), **VS Code will not find the new agents**, even though the files genuinely exist on disk.

**Why:** VS Code's Copilot agent discovery scans for `.github/agents` at the root of whatever folder is currently open as your workspace. If `demo-project` is a subfolder of something else, and that something else is what's open in VS Code, the agents are one level too deep to be found.

**Check this yourself:** open the Command Palette (`Ctrl+Shift+P`) → type `Agent Customizations` → go to the **Agents** section → look at **Workspace**. If it says **0** agents, this is your problem.

**The fix:**
1. In VS Code, go to **File → Open Folder**
2. Select `demo-project` itself — not its parent folder
3. This reopens VS Code with `demo-project` as the actual workspace root

Check **Agent Customizations → Agents → Workspace** again — it should now show **3**, with all three agents listed.

---

## Step 5: Run the Planner

Open GitHub Copilot's chat panel. Find the agent/mode selector (usually near the chat input, or via **Configure Custom Agent...** in the mode dropdown) and select **playwright-test-planner**.

Give it a plain-English instruction. I used:

```
Explore https://demo.playwright.dev/todomvc and create a test plan for adding and completing a todo item
```

**What happens:** the planner actually opens a real browser in the background (using the MCP connection from Step 3), navigates to the page, inspects it, interacts with it (typing, clicking, checking results), and then writes a structured Markdown test plan.

**What gets generated:** a new file appears at `specs/[some-name].test.plan.md`, containing a breakdown of test scenarios — in my case, three: adding a todo, completing one, and rejecting blank input (that third one wasn't something I asked for — the planner added it on its own, having inspected the app's actual validation behavior).

This file is meant to be reviewed by you before moving to the next step — it's a checkpoint, not a final answer.

---

## Step 6: Run the Generator

Switch the agent selector to **playwright-test-generator**. Prompt it to build the plan into real code:

```
Generate the Playwright tests from the plan at specs/[your-plan-filename].md
```

**What it does normally:** reads the plan, opens the browser again to verify each step live while writing matching Playwright code, and produces one `.spec.ts` file per scenario in your `tests/` folder.

**A real error you may hit here:**

```
Error: EPERM: operation not permitted, rmdir 'C:\...\test-results\.playwright-artifacts-X'
```

This means the generator can't clear an old test-results folder because something else has that folder locked. Two separate causes I found for this, in order of likelihood:

**Cause 1 — you're working inside a OneDrive/Dropbox-synced folder.** These services actively lock files while syncing, and that conflicts directly with Playwright creating/deleting files during a test run. **Fix:** move your project to a plain, non-synced path (e.g., `C:\dev\demo-project`) instead of somewhere like `C:\Users\you\OneDrive\Documents\demo-project`.

**Cause 2 — a leftover process still has the folder open.** An earlier browser instance or test run that didn't fully close can hold the lock even outside OneDrive. **Fix:** open Task Manager, check the Details tab for any lingering `node.exe`, `chrome.exe`, or `chromium.exe` processes, and end them. Then clear the stuck folder manually:
```bash
rm -rf test-results
```

**What happens if the generator hits this error:** in my case, it didn't fail silently — it told me plainly that it couldn't verify the tests live because of the lock, but went ahead and wrote the test files based on the plan anyway, since it could still do that part reliably. Worth checking its output message for language like this rather than assuming a clean success.

**Validate manually once the lock is cleared:**

```bash
npx playwright test tests/[your-folder-name]
```

You should see something like:
```
Running 9 tests using 8 workers
  9 passed (12.8s)
```
(9 here = 3 test files × 3 default browser projects — your number will depend on how many scenarios were in your plan.)

---

## Step 7: Test the Healer — break something on purpose

This is the one worth actually verifying yourself rather than taking on faith.

**Break a locator deliberately.** Open one of the generated test files and find a locator line, for example:

```typescript
const todoInput = page.getByRole('textbox', { name: 'What needs to be done?' });
```

Change the text slightly so it no longer matches the real page:

```typescript
const todoInput = page.getByRole('textbox', { name: 'What needs to be done today?' });
```

Save the file.

**Confirm it actually fails:**

```bash
npx playwright test tests/[your-file].spec.ts
```

Expected output — a real, clean failure:
```
Locator: getByRole('textbox', { name: 'What needs to be done today?' })
Expected: visible
Timeout: 5000ms
Error: element(s) not found
```

**Now bring in the healer.** Switch the agent selector to **playwright-test-healer** and prompt:

```
The test tests/[your-file].spec.ts is failing. Run it and fix it.
```

**What it should do, in order:** run the test itself to confirm the exact failure, inspect the actual live page to find the real accessible name of the element, diagnose that the locator text is wrong (not the app), and correct it back to match reality.

**Verify the fix actually worked:**

```bash
npx playwright test tests/[your-file].spec.ts
```

Expected: a clean pass, e.g. `1 passed in 3.2s`.

**What to specifically check for:** did the healer explain that it found and fixed a locator mismatch (the right kind of fix), or did it do something evasive instead, like widening the locator to match anything or increasing the timeout (the wrong kind of fix, since it would hide a real future break rather than correcting the actual cause)? In my run, it correctly diagnosed the real cause.

---

## Full command reference, in order

```bash
mkdir demo-project
cd demo-project
npm init playwright@latest
npx playwright init-agents --loop=vscode
# (open demo-project directly as your VS Code workspace if nested in a bigger repo)
# — then use the agent selector in Copilot's chat panel for planner / generator / healer —
npx playwright test tests/[your-folder]          # to validate generated tests
rm -rf test-results                               # if you hit an EPERM lock error
npx playwright test tests/[your-file].spec.ts     # to confirm a break, and later confirm the heal
```

## Summary of issues you might hit, and the fix for each

| Issue | Cause | Fix |
|---|---|---|
| Agents don't appear anywhere in VS Code, despite files existing | Project nested inside a bigger repo, wrong workspace root open | Open the Playwright project folder itself as the workspace, not its parent |
| `EPERM: operation not permitted, rmdir ...test-results...` | Project inside a OneDrive/Dropbox-synced folder | Move the project to a plain, non-synced local path |
| Same EPERM error even outside a synced folder | A leftover process still holding the folder open | Check Task Manager for stray `node.exe`/`chrome.exe`, end them, then `rm -rf test-results` |