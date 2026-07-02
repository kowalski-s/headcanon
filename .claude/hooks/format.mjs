#!/usr/bin/env node
// Stop hook: prettier-format files changed this turn so the working tree stays
// format:check-clean without a manual pass. Best-effort — never throws, exits 0.
// Also works as a PostToolUse hook (uses tool_input.file_path when present).
import { execSync } from 'node:child_process';

const FMT = /\.(ts|tsx|css|md|json)$/;
let input = '';
process.stdin.on('data', (d) => (input += d));
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input || '{}');
    const single = data?.tool_input?.file_path;
    let files = [];
    if (single && FMT.test(single)) {
      files = [single];
    } else {
      const out = execSync('git diff --name-only --diff-filter=ACMR HEAD', { encoding: 'utf8' });
      files = out
        .split('\n')
        .map((s) => s.trim())
        .filter((f) => f && FMT.test(f));
    }
    if (files.length) {
      const args = files.map((f) => JSON.stringify(f)).join(' ');
      execSync(`pnpm exec prettier --write ${args}`, { stdio: 'ignore' });
    }
  } catch {
    // best-effort — CI enforces format:check as the real gate
  }
  process.exit(0);
});
