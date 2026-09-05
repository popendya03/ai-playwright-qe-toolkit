# ai-playwright-qe-toolkit
# Glossary

Terms I kept having to explain — to my team, in interviews, in conversations where someone used one of these words to mean three different things. Plain definitions, plus why each one actually matters in practice, not just what it stands for.

---

### MCP (Model Context Protocol)

An open standard (originally from Anthropic, now used by Playwright's own MCP server) that lets an AI agent read structured data about a webpage — its accessibility tree — and take real actions in a browser: click, type, navigate, assert.

**Why it matters:** before MCP-style tooling, "AI testing" mostly meant a vision model looking at a screenshot and guessing where a button was. That was slow and broke with every minor UI shift. MCP-based tools work off structured data instead, so they're faster and far less flaky.

---

### Accessibility tree

The structured representation of a page that assistive technologies (screen readers) already rely on — every element's role, label, and state, independent of how it looks visually.

**Why it matters:** this is what MCP-based agents actually read instead of pixels. It also means if your app's accessibility tree is messy, your AI tooling will struggle the same way a screen reader user would. Good accessibility hygiene and good AI-testability turn out to be the same problem.

---

### Self-healing locator

A selector that an AI agent can automatically repair when the underlying element changes (renamed class, restructured DOM) without a human manually rewriting it.

**Why it matters:** locator rot is the single biggest maintenance tax on any large Playwright suite. Self-healing doesn't eliminate that tax, but it changes who pays it — from an engineer manually re-inspecting the DOM to a quick approve/reject of a proposed fix.

---

### Test Agents (planner / generator / healer)

Playwright's built-in AI agents, invoked via `npx playwright init-agents`. Three distinct roles:
- **Planner** — scopes what a test should cover, given a feature or requirement.
- **Generator** — writes the actual Playwright test code.
- **Healer** — detects and repairs broken tests when the UI changes.

**Why it matters:** most people think "AI + Playwright" means one thing — code generation. It's actually a three-stage lifecycle, and knowing which agent you need for which problem saves a lot of wasted prompting.

---

### Codegen (vs. an agent)

Codegen records what you physically do in a browser and converts it into code. It's a recorder, not a reasoner.

**Why it matters:** an agent, by contrast, is given a goal ("complete checkout, verify the confirmation modal") and figures out the steps itself. Conflating the two leads to wrong expectations — codegen won't adapt if the flow changes; an agent might.

---

### Agentic testing / agentic QE

Testing workflows where an AI agent doesn't just generate a script once, but participates continuously — healing broken tests, flagging coverage gaps against new code changes, reasoning about what to test next.

**Why it matters:** this is the actual shift happening right now. Most teams are still stuck at "AI wrote my first draft." The value compounds when AI stays involved after that first draft, not before it.

---

### Autonomous testing agent

A step beyond agentic QE — an agent that can execute a test scenario end-to-end from a natural-language instruction, without a pre-written script at all, deciding its own steps at runtime.

**Why it matters:** useful for exploratory testing and edge-case discovery, but I wouldn't rely on it as your only regression strategy — deterministic, versioned test code still matters for CI stability and audit trails, especially in regulated environments.

---

### MCP vs. CLI-based agent (cost tradeoff)

MCP-based agents stream the full accessibility tree inline for every interaction, which is token-expensive — often several times more than a CLI-based agent that writes context to disk and references it.

**Why it matters:** MCP is great for exploratory, interactive sessions where you want to watch the agent reason step by step. For bulk work — coverage sweeps, multi-file refactors — a CLI-based agent is usually the cheaper and faster choice. Picking the wrong one for the job is where AI tooling costs quietly get out of hand.

---

### Source-code-aware agent

A custom agent (not out-of-the-box) that reads your actual codebase or a PR diff — not just the running app — to reason about what changed and whether test coverage exists for it.

**Why it matters:** this is where agentic QE starts overlapping with static analysis and code review. It's the piece most teams haven't built yet, and where I think the real differentiation is over the next couple of years.
