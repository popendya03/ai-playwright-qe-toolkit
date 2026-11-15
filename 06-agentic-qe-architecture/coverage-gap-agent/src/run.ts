import { readFileSync } from 'fs';

const MODEL = process.env.OPENROUTER_MODEL ?? 'nvidia/nemotron-3-ultra-550b-a55b:free';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

function parseArgs() {
  const args = process.argv.slice(2);
  const diffIndex = args.indexOf('--diff');
  const testsIndex = args.indexOf('--tests');

  if (diffIndex === -1 || testsIndex === -1) {
    console.error('Usage: tsx src/run.ts --diff <diff-file> --tests <spec-file> [more-spec-files...]');
    process.exit(1);
  }

  return {
    diffPath: args[diffIndex + 1],
    testPaths: args.slice(testsIndex + 1).filter((a) => !a.startsWith('--')),
  };
}

function loadFile(path: string): string {
  try {
    return readFileSync(path, 'utf-8');
  } catch {
    console.error(`Could not read file: ${path}`);
    process.exit(1);
  }
}

const SYSTEM_PROMPT = `You are a senior QE reviewing a pull request diff against an existing
Playwright test suite. Your job is to find testing gaps a reviewer might miss under
time pressure. Do not praise the code, do not write full test files, and do not invent
issues the diff doesn't support.

Respond in this exact structure:

## What Changed
Plain-English summary of the user-facing behavior this diff adds or modifies (2-4 sentences).

## Existing Coverage
What the current tests already cover that is relevant to this diff, if anything.

## Coverage Gap
Exactly which user-facing behavior from this diff has NO matching test. Name the actual
flow or state. If coverage is adequate, say so plainly instead of inventing a gap.

## Suggested Test Scenarios
2-5 short Playwright test scenario descriptions (not full code) that would close the gap.
Include a happy path and at least one error case if the diff adds error handling.
Base every statement only on what is visible in the diff and the test file. If you cannot tell how something behaves, say it is unclear instead of guessing.
Keep the whole response under 300 words. Be direct.`;

async function main() {
  const { diffPath, testPaths } = parseArgs();

  const diff = loadFile(diffPath);
  const tests = testPaths.map((p) => `--- ${p} ---\n${loadFile(p)}`).join('\n\n');

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error('OPENROUTER_API_KEY is not set. Check your .env file.');
    process.exit(1);
  }

  console.log(`Analyzing PR diff against the existing test suite (${MODEL}, OpenRouter free tier)...\n`);

  const response = await fetch(OPENROUTER_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: 0,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `PR DIFF:\n\`\`\`diff\n${diff}\n\`\`\`\n\nEXISTING TEST SUITE:\n\`\`\`typescript\n${tests}\n\`\`\`\n\nAnalyze this diff against the existing test suite.`,
        },
      ],
    }),
  });

  if (!response.ok) {
    console.error(`OpenRouter request failed (${response.status}): ${await response.text()}`);
    process.exit(1);
  }

  const data = await response.json();
  console.log(data.choices?.[0]?.message?.content ?? 'No response generated.');
}

main().catch((err) => {
  console.error('Agent run failed:', err);
  process.exit(1);
});