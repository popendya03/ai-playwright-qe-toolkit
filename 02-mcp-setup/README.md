# MCP Setup Guide — Playwright + AI

Notes from actually connecting Playwright MCP to an AI assistant on my Windows machine. Each path below has the exact steps to follow, plus what actually happened when I did it — including the errors, since those are the parts most guides leave out.

## What I was actually trying to do

My AI assistant (tried both Claude Code and GitHub Copilot) can read and write code fine, but has no way to open a real browser and click around a live webpage — it's blind to anything actually running. Playwright MCP is a small server that fixes that — gives it a set of tools to navigate, click, type, and read a page's structure, so it can test something for real instead of guessing based on how I describe it.

## Before starting

- Node.js 18+ — I'm on 20.11.1
- VS Code
- If you're on Windows and going for Path B, read step 2 there before you start — it'll save you a confused five minutes

---

## Path A — GitHub Copilot (free)

Went this way in the end, mainly because Path B needed payment and I wanted something free to start with.

### Steps to do this yourself

1. **Confirm GitHub Copilot is installed and signed in.** Extensions panel → search "GitHub Copilot" → confirm it's installed, and check you're signed in via the Accounts icon, bottom-left of VS Code.

2. **Create a `.vscode` folder in your project root**, if it doesn't already exist. In a VS Code terminal:
   ```powershell
   mkdir .vscode -Force
   ```

3. **Create the MCP config file** at `.vscode/mcp.json` with this content:
   ```json
   {
     "servers": {
       "playwright": {
         "command": "npx",
         "args": ["@playwright/mcp@latest"]
       }
     }
   }
   ```
   Fastest way to create it directly from the terminal:
   ```powershell
   @'
   {
     "servers": {
       "playwright": {
         "command": "npx",
         "args": ["@playwright/mcp@latest"]
       }
     }
   }
   '@ | Out-File -FilePath .vscode\mcp.json -Encoding utf8
   ```
   *(If pasting that throws a "here-string header" error, see the note below — it's a paste issue, not a typo on your part.)*
   Check it saved correctly:
   ```powershell
   cat .vscode\mcp.json
   ```

4. **Start the server.** Command Palette (`Ctrl+Shift+P`) → `MCP: List Servers` → click `playwright` in the list → click **Start**.

5. **Verify it's running.** Run `MCP: List Servers` again — status should say "Running." You can also check the Output panel (filter dropdown → "MCP: playwright") for a log line like `Discovered 24 tools`.

6. **Test it.** Open Copilot's chat panel, switch it to **Agent mode** (there's a mode selector at the top of the panel — "Ask" mode won't trigger the tools), and type:
   ```
   Go to https://playwright.dev and tell me what the page title is
   ```
   If it comes back with the real title, you're connected.

### What actually happened when I did it

Step 3 wasn't my first attempt — I tried the built-in "MCP: Add Server" wizard first, picked the "NPM Package" option since it seemed like the safest choice, typed in the package name, and it just broke: `Cannot destructure property 'name' of 'w_(...)' as it is undefined`. Not a helpful error message. Didn't spend time debugging it — looked like a bug in that specific wizard flow, not anything I'd done wrong — so I skipped it and wrote the config file by hand instead (that's the version in step 3 above). Ended up preferring the manual way anyway, since you can actually see what's in the file instead of trusting a wizard did it right.

Also worth flagging on step 3: the multi-line `@' ... '@` PowerShell snippet only works if it pastes in cleanly as multiple lines. Depending on your terminal, pasting can collapse it onto one line, which throws:
```
No characters are allowed after a here-string header but before the end of the line.
```
Ran into this myself in a separate test. If it happens to you, skip the here-string entirely and use a single-line version instead:
```powershell
Set-Content -Path .vscode\mcp.json -Value '{"servers":{"playwright":{"command":"npx","args":["@playwright/mcp@latest"]}}}'
```
Or just create the file directly in VS Code's Explorer panel (right-click → New Folder → `.vscode`, then New File → `mcp.json`, paste the JSON, save) — sidesteps the terminal entirely, honestly more reliable than fighting PowerShell's paste behavior.

Step 4 took about 20 seconds the first time, since `npx` had to actually download the package before it could run. Don't worry if it seems to hang briefly.

Step 6 was the moment it felt real — typed the instruction, and Copilot genuinely opened a browser in the background, navigated to the page, and read the real title back to me. Not a guess.

---

## Path B — Claude Code (this one costs money)

Tried this first, actually, before landing on Copilot. Worth knowing upfront: Claude Code doesn't have a free tier. It needs either a Claude.ai subscription or pay-as-you-go API billing through the Anthropic Console.

### Steps to do this yourself

1. **Install Claude Code:**
   ```bash
   npm install -g @anthropic-ai/claude-code
   ```

2. **(Windows only) Fix PowerShell's execution policy if it blocks you.** If `claude --version` fails with a "running scripts is disabled" error, run:
   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
   ```
   Confirm with `Y` when prompted, then try the version command again.

3. **Log in:**
   ```bash
   claude
   ```
   Pick a login method when prompted — a Claude.ai subscription, an Anthropic Console (API billing) account, or a third-party platform if your company has one set up.

4. **Add the Playwright MCP server:**
   ```bash
   claude mcp add playwright npx @playwright/mcp@latest
   ```

5. **Verify it connected.** Start a session with `claude`, then type `/mcp` — you should see `playwright` listed as connected, with a tool count.

6. **Test it** — same test as Path A:
   ```
   Go to https://playwright.dev and tell me what the page title is
   ```

### What actually happened when I did it

Step 1 threw a warning — it wants Node 22+, I'm on 20.11.1 — but it installed anyway and ran fine. Didn't turn out to matter.

Step 2 wasn't optional for me — hit that exact PowerShell error immediately after installing. Turned out to have nothing to do with Claude Code specifically; it's a default Windows security setting that blocks basically every Node CLI tool the first time you touch PowerShell on a fresh machine.

Step 3 is where things stalled. I picked the Console/API billing option since I don't have a Claude.ai subscription. There's supposedly a one-time ~$5 trial credit for new accounts, but it never showed up for mine — no phone verification prompt, nothing, balance just sat at $0. Couldn't figure out why, and didn't want to spend the day chasing it, so I switched to Path A instead. If you're going this route, go in expecting you might need to add a payment method — a demo like this typically costs under a dollar in actual usage, so it's not a big spend, just an unexpected one if you assumed it'd be fully free.

Steps 5 worked fine once I got past login — saw `playwright` connected with 24 tools, same count as the Copilot path, which makes sense since it's the identical underlying MCP server either way. Never got to properly complete step 6 on this path since the billing wall hit right around there — switched to Copilot before finishing the live test.

---

## What I actually took away from doing both

The AI client (Copilot vs. Claude Code) barely matters for this specific thing — same MCP server, same 24 tools, same actual capability either way. The real decision is just: do you already have one of these set up, and can you afford the one that needs payment. Pick based on that, not because one is supposedly better at browser automation — they're not, they're using the identical tool underneath.