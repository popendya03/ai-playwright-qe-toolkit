# coverage-gap-agent

A small script that finds **what a code change added that no test checks**.

You give it two things: the list of changes in a pull request, and the tests you already have. It asks an AI model one question: "what did this change add that nothing tests?" Then it prints a report.

This page walks through everything from zero, including how to get the free key it needs. You don't need to know AI or Playwright to follow it.

## The problem, in one minute

Developers add features quickly. Tests don't always keep up.

When the old tests still pass, everything shows green. But green only means "the old things still work." It says nothing about the new feature. If nobody wrote tests for it, nothing warns you.

Think of a teacher who checks that last week's homework is still correct, sees a perfect score, and never notices this week's assignment was never handed in.

This tool is a second pair of eyes that reads the change and points out what's unchecked.

## What it does, and what it doesn't

**It does:** read a diff and a test file, then print a report listing what looks untested, with ideas for tests to write.

**It doesn't:**
- run by itself. You run it by hand. Running it automatically on every pull request is the next step.
- write the missing tests, or stop anyone from merging.
- run your tests. It only reads files.
- always get every detail right. See "What it got wrong" below.

It is one request to an AI model, not a multi-step robot. "Agent" is a loose word for it.

## Words you'll see

| Word | Meaning |
|---|---|
| **Pull request (PR)** | A request on GitHub saying "I finished something, please review it before it goes live." |
| **Diff** | A list of exactly what changed. Lines starting with `+` were added, lines starting with `-` were removed. |
| **Playwright** | A tool that writes automated tests, which act like a robot clicking through an app. |
| **API key** | A secret password that lets a program use an online service. Explained in Step 1. |
| **AI model** | The program that reads your text and writes a reply, like the one behind ChatGPT. |

## What you need

- **Node.js 20.6 or newer.** Check with `node --version`. Get it at [nodejs.org](https://nodejs.org).
- **Git.** Check with `git --version`.
- **A terminal.** I used Git Bash on Windows. Mac and Linux terminals work the same way.
- **A free OpenRouter account.** Step 1 covers this.

---

## Step 1: Get a free API key

### What an API key is, and why you need one

The script sends your text to an AI model over the internet. The company running that model needs to know who is asking, so it can apply limits and, for paid models, send a bill.

The key is that identity. It's a long string of characters that works like a password.

Chat tools like ChatGPT in your browser already know who you are because you're logged in. A script has no login, so it shows a key instead.

### Why OpenRouter

OpenRouter is a website that gives access to many AI models through one key. Some of those models are free: they cost $0 per request, with limits on how many requests you can make. That's what this tool uses.

I created my key without adding a payment method.

### How to get it

1. Go to [openrouter.ai](https://openrouter.ai) and sign up. Google, GitHub or email all work.
2. Open your profile menu and choose **Keys**, or go straight to [openrouter.ai/keys](https://openrouter.ai/keys).
3. Click **Create Key**.
4. Fill in the form:
   - **Name:** `coverage-gap-agent`
   - **Expiration:** `No expiration` is fine for a demo key.
   - **Credit limit:** choose **Custom amount** and enter `1`. Free models cost nothing, so this is a safety net. If a typo ever made the script call a paid model, requests stop after $1.
5. Click **Create**.
6. **Copy the key right away.** It starts with `sk-or-` and is only shown in full once. Paste it somewhere temporary on your computer.

The screen may look slightly different by the time you read this.

### Keep the key secret

Anyone with your key can use your account. Never paste it into a chat, an email, a screenshot, a video or a file you commit to GitHub. If it leaks, go to the Keys page, delete it, and create a new one.

---

## Step 2: Get the code

```bash
git clone https://github.com/popendya03/ai-playwright-qe-toolkit.git
cd ai-playwright-qe-toolkit/06-agentic-qe-architecture/coverage-gap-agent
npm install
```

- The first command downloads this repository.
- The second moves into this folder. **Every command from here on runs in this folder.**
- `npm install` downloads the tools the script needs.

---

## Step 3: Put your key in a `.env` file

A `.env` file is a plain text file that holds secrets, so they stay out of the code. The script reads your key from it.

1. Copy the template and name the copy `.env`.

   Git Bash, Mac or Linux:
   ```bash
   cp .env.example .env
   ```
   Windows PowerShell:
   ```powershell
   copy .env.example .env
   ```

2. Open `.env` in any text editor and replace `your-key-here` with the key you copied:

   ```
   OPENROUTER_API_KEY=sk-or-paste-your-real-key-here
   ```

   No quotes and no spaces around the `=`.

3. Save the file.

This repository has a file called `.gitignore` that tells git to ignore `.env`. So your key stays on your computer and can't be uploaded by accident. You can confirm it:

```bash
git check-ignore -v .env
```

It should print a line mentioning `.gitignore` and `.env`. If it prints nothing, stop and don't commit anything.

---

## Step 4: Run it

```bash
npm run demo
```

This reads a sample diff (`sample-diff/pr-forgot-password.diff`) and a test file (`tests/auth.spec.ts`), then asks the AI model for a report.

### What you should see

First, a line like:

```
Analyzing PR diff against the existing test suite (cohere/north-mini-code:free, OpenRouter free tier)...
```

After a short wait (free models can take up to a minute), a report with four headings. The wording differs a little every run.

### How to read the report

| Heading | What it tells you |
|---|---|
| **What Changed** | A plain-English summary of what the pull request added |
| **Existing Coverage** | What the current tests already check |
| **Coverage Gap** | What's new but unchecked. This is the part that matters |
| **Suggested Test Scenarios** | Ideas for tests to write. They are ideas, not finished tests |

Treat it as a list for a person to review, not as the truth.

---

## What the demo is about

The sample diff comes from a pull request I made on purpose: a **Forgot Password** flow added to a small login app, with no tests. The tool should notice.

You can look at it yourself: [pull request #4](../../pulls) in this repository. It's left open on purpose. **Please don't merge it.**

### What I did, in order

1. Built a small login page (`demo-app/login.html`) and three Playwright tests (`tests/auth.spec.ts`). All three pass. This is on `main`.
2. Created a branch called `feature/forgot-password`. Added a "Forgot your password?" link and a new reset page. **Wrote no tests for it.**
3. Ran the tests again. Still `3 passed`. Green, even though a whole feature has no tests.
4. Opened pull request #4 and left it open.
5. Generated the diff for that pull request with git.
6. Wrote `src/run.ts`, the script in this folder, and ran it.

### Where things live

| Piece | Location |
|---|---|
| Login page and its three tests | `main` |
| The Forgot Password change (no tests) | Branch `feature/forgot-password`, pull request #4 |
| The diff of that change | `sample-diff/pr-forgot-password.diff` |
| The script | `src/run.ts` |
| Test settings | `playwright.config.ts` |
| Your key (never committed) | `.env` |

### See the green result yourself (optional)

```bash
npx playwright install chromium
npx playwright test
```

On `main` this prints `3 passed`. If you check out `feature/forgot-password` first, it still prints `3 passed`, even though the new feature has no tests. That hidden gap is the thing the tool looks for.

---

## What the tool said, and what it got wrong

It found the real gap in every run I tried: the reset form, its success message, its error message and the new link have no tests. I checked each claim against the diff and the files.

This is the report from the run in my video.

<details>
<summary>Show the full report</summary>

```
## What Changed
A new forgot-password.html page was added, containing a form that accepts an email,
validates it against a single known address (user@example.com), and shows a success
or error message accordingly. The login.html page was updated to include a
"Forgot your password?" link pointing to the new page.

## Existing Coverage
The test suite (auth.spec.ts) only covers login functionality:
- Successful login with valid credentials.
- Error handling for invalid credentials.
- Form validation when the email field is empty.

No tests exist for the forgot-password page or its link.

## Coverage Gap
The new page's user-facing behavior is untested:
- Submitting a known email displays the success confirmation.
- Submitting an unknown email displays the error message.
- The "Forgot your password?" link navigates to the correct page.
- UI state when the form is submitted with an empty or malformed email.

## Suggested Test Scenarios
1. Happy path: navigate to /forgot-password.html, fill the known email, submit, and
   verify the success message (data-testid="reset-confirmation") appears and the
   error message stays hidden.
2. Error case: enter an email that does not match user@example.com, submit, and
   assert the error message (data-testid="reset-error") is visible.
3. Link navigation: from /login.html, click the "Forgot your password?" link and
   confirm the URL changes to /forgot-password.html.
4. Empty email: submit the form with an empty email field and verify the error
   message appears (since the script treats empty input as unknown).
```

</details>

| What it said | Verdict |
|---|---|
| The reset page and link were added, and the result depends on one known email | Correct |
| The existing suite covers only login (valid, invalid, empty email) | Correct |
| The reset form's success state, error state and link have no tests | Correct. This is the real gap |
| Scenarios 1 to 3 | Correct and usable as written |
| Scenario 4: an empty email shows the error message | **Wrong.** See below |
| The "Back to log in" link on the reset page | **Missed.** It never mentioned this link in any run |

### Why scenario 4 is wrong

The email box is marked `required`. When someone clicks the button with the box empty, the **browser itself** stops the form and shows "Please fill out this field." The page's own code never runs, so no message appears. A test written exactly as suggested would fail.

The empty-email behavior is untested, so the model was right that it's a gap. It was wrong about what should happen. The correct check is that **neither** message appears, the same way the existing login test checks an empty email.

### An invented claim from an earlier run

In an earlier run it said the pull request "fixes a duplicated CSS rule." That was made up. A removed line in a diff starts with `-`, so I searched for those:

```bash
grep "^-" sample-diff/pr-forgot-password.diff
```

It prints only two `---` file headers and no removed code. Nothing was removed, so nothing was fixed.

### What I changed to reduce mistakes

Two small changes:
- `temperature: 0`, which makes the model less random.
- One sentence in the instructions telling it to base every statement on the diff and the tests, and to say "unclear" instead of guessing.

They cut down the invented claims. They did not fix the empty-email mistake, which appeared in at least three runs, including the one in my video. One run each is not proof of how it behaves in general.

---

## Try it on your own pull request

1. Make a diff of your change. Run this from inside this folder, replacing the branch name:

   ```bash
   git diff --relative --output=my-change.diff main...your-branch
   ```

   Use **three dots** (`main...your-branch`). With two dots, git would compare the two branch tips directly and could show unrelated files.

2. Run the script on it:

   ```bash
   npx tsx --env-file=.env src/run.ts --diff my-change.diff --tests path/to/your.spec.ts
   ```

   You can list more than one test file after `--tests`.

To regenerate this demo's diff from the pull request:

```bash
git diff --relative --output=sample-diff/pr-forgot-password.diff main...origin/feature/forgot-password
```

Use `--output` instead of `>`. In Windows PowerShell, `>` saves text in an encoding that makes the file unreadable to the script.

---

## Troubleshooting

| What you see | What it means and what to do |
|---|---|
| `OPENROUTER_API_KEY is not set` | The `.env` file is missing, misnamed, or in the wrong folder. It must be called exactly `.env` and sit next to `package.json`. Check there are no quotes or spaces around the `=` |
| `OpenRouter request failed (401)` | The key is wrong or was deleted. Copy it again from openrouter.ai/keys, or create a new one |
| `404` with "model is unavailable for free" | Free model names change often and this one is no longer free. Pick a current free model at [openrouter.ai/models](https://openrouter.ai/models) (filter by **Free**), then add this line to `.env`: `OPENROUTER_MODEL=model-name-here` |
| `429` | You're being rate-limited, which is normal on the free tier. Wait a minute and run it again |
| Nothing happens for a while | Free models can take up to a minute or two. Give it time |
| `node: bad option: --env-file` | Your Node.js is older than 20.6. Update it from nodejs.org |
| `tsx: command not found` | Run `npm install` in this folder |
| `Could not read file` | You're in the wrong folder, or the path is wrong. Run `pwd` and make sure you're inside `coverage-gap-agent` |
| The report looks different from the one above | Normal. The wording changes every run |

---

## Limits

- You run it by hand. It does not trigger on its own yet.
- It makes one request to a free model, and free models vary from run to run.
- It sees only the diff and the test files you give it. It doesn't know about other tests.
- Free models can log what you send. The code in this demo is made up, but don't send private company code through a free model.
- The report is a starting point for a reviewer. It is not a verdict.

## What's next

Run it automatically on every pull request using a GitHub Action, and post the report as a comment on the pull request.