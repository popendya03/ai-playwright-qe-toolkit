# ai-playwright-qe-toolkit

Notes, code, and templates from building AI into my day-to-day QE work — mostly around Playwright, MCP, and agent-assisted test authoring and maintenance.

## Why this repo exists

I've been in QE for 9 years — manual testing, then automation, and lately I've been trying to bring AI into how I actually test. AI showed up in tooling the way it's shown up everywhere else: fast, unevenly, with a lot of noise about what it can supposedly do.

Rather than read about it, I decided to actually implement it — set up MCP, work with Playwright's test agents, build a couple of small custom agents, break things, fix things, and keep notes on what held up under real work and what didn't.

This repo is those notes, cleaned up. If you're a QE or SDET trying to figure out the same thing — where AI is actually useful in a Playwright-based testing workflow versus where it's just another tool to babysit — this might save you some time.

## What's here

- **`01-glossary/`** — Terms I kept having to explain to my team: MCP, accessibility tree, self-healing locators, agentic testing, and the difference between codegen and an actual agent.
- **`02-mcp-setup/`** — How I set up Playwright MCP with an AI assistant, including the parts that weren't obvious from the docs.
- **`03-test-agents-cheatsheet/`** — Quick reference for Playwright's built-in planner/generator/healer agents — what each one actually does and when I reach for it.
- **`04-prompt-templates/`** — Prompts I use to turn a written requirement into a first-draft Playwright test.
- **`05-ai-test-review-checklist/`** — What I check before an AI-generated test gets merged. This came out of catching the same three mistakes repeatedly.
- **`06-agentic-qe-architecture/`** — Notes and a diagram on a small custom agent I built that flags coverage gaps from a PR diff.
- **`07-adoption-roadmap/`** — The 30-60-90 day plan I used to bring this into my team, including the version of the pitch that actually got approved.
- **`08-case-study-notes/`** — Before/after numbers from rolling this out on a real suite, anonymized where it needs to be.

## Status

Building this out over several weeks, in order, as I actually use each piece — not writing it all up front and backfilling. Folders will fill in gradually; check commit history if you want to see the order.

## Using this

Take whatever's useful. If you adapt something for your own team or run into a gap I haven't covered, I'd like to hear about it — open an issue or find me on [LinkedIn](https://www.linkedin.com/in/poojapendyala).

## License

MIT.
