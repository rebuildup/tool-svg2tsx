---
name: svg2tsx-validate
description: Use when preparing a change for completion, before commit, after implementing a feature or fix, or when CI signals a regression. Runs the full canonical validation pipeline (type-check, format-check, lint, test, knip) for @rebuildup/tool-svg2tsx and guides recovery when any step fails.
---

# svg2tsx-validate

## When to use

Trigger this Skill when any of the following applies:

- A non-trivial implementation task is being completed.
- Changes are about to be committed.
- A CI signal reports a regression.
- The user asks "is this ready?", "validate", or "make sure tests pass".

Skip when the task is purely conversational, a quick one-line fix, or unrelated to the source tree.

## Canonical command

```
bun run validate
```

This runs in order:

1. `bun run typecheck` — TypeScript no-emit check.
2. `bun run format:check` — Biome format check (no write).
3. `bun run lint` — Biome lint.
4. `bun run test` — Vitest unit tests.

Additionally, run these on demand:

- `bun run test:coverage` — adds coverage; enforce ≥ 80% on lines / statements / functions / branches for source under `src/utils/`.
- `bun run knip` — static analysis for unused file / export / dependency.

## Pass criteria

Every step exits 0. No actionable warnings. No:

- skipped tests
- `.only`
- disabled suites
- blanket ignores
- lint / type suppressions
- coverage threshold relaxations
- ignored exit codes (`|| true`, `--no-fail`)

If a step exits non-zero, do not declare the task complete. Fix root cause and re-run.

## Recovery patterns

| Symptom | Action |
| --- | --- |
| `typecheck` reports errors | Read the diagnostic, fix the source. Do not add `// @ts-ignore` or `any`. |
| `format:check` reports diffs | Run `bun run format` to auto-fix, re-run `bun run validate`. |
| `lint` reports rule violations | Fix per-rule. Do not add blanket `biome-ignore`. For narrow suppression, justify in code comment. |
| `test` failures | Read assertion message, find root cause, fix. Do not skip the test. |
| `test:coverage` < 80% | Add tests for the changed path. Do not lower thresholds or exclude files. |
| `knip` reports unused | Remove unused file / export / dep. If intentional, justify in `docs/DEVELOPMENT.md`. |

## References (read on demand, not always)

- `AGENTS.md` — canonical project contract.
- `docs/DEVELOPMENT.md` — internal developer documentation.
- `docs/architecture/ADR-0001-toolchain.md` — toolchain rationale.
- `docs/architecture/ADR-0003-test-strategy.md` — test coverage policy.

## Anti-patterns to refuse

- "I'll fix the typecheck warning later" — not done until 0 warnings.
- "Coverage is at 79%, let's drop threshold to 75" — never lower thresholds.
- "The lint rule is annoying, disable it" — adjust source instead.
- "The test is flaky, skip it" — fix the flakiness.

## Completion

When `bun run validate` is fully green AND `bun run knip` reports nothing actionable, the validation step is complete. Continue with the rest of the implementation loop (rubber-duck → replan → continue) per the parent init policy.