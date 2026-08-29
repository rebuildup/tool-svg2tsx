# AGENTS.md — `@rebuildup/tool-svg2tsx`

> **Canonical cross-agent project contract.** This file is the dispatcher; detailed workflows live in Agent Skills. Keep this file concise.

## Project identity

- 名前: `@rebuildup/tool-svg2tsx`
- 種別: Embeddable React component library (Next.js 向け)
- 役割: SVG 文字列 / ファイル / URL を React TSX コンポーネントへ変換するブラウザツール
- 起源: `my-web-2025` モノレポから抽出 (commit `fc104dc`)
- License: MIT (Copyright (c) 2026 samuido)

## Boundaries

- `src/index.ts` が唯一の public entry。`Svg2tsxApp` を default export する。
- すべての component は `"use client"` ディレクティブ付き。Next.js の client component として埋め込まれる。
- DOM API (DOMParser, FileReader, Clipboard, `dangerouslySetInnerHTML`) を使うため、実行環境はブラウザ必須。
- Next.js 以外の host では自己責任で wrap すること。

## Stack (固定)

| 項目 | 採用 | 補足 |
| --- | --- | --- |
| Package manager | Bun (`bun.lock`) | npm / pnpm / Yarn / npx 導入禁止 |
| Language | TypeScript (ESM, `type: module`) | `verbatimModuleSyntax` 有効 |
| UI | React 19 + React DOM 19 | peer dep: `next ^16.3.0` |
| Formatter / Lint | Biome 1.9 | Prettier / ESLint 導入禁止 |
| Test | Vitest 3 (jsdom env) | unit / component テスト |
| Coverage | `@vitest/coverage-v8` | 80% threshold |
| Static analysis | Knip 5 | unused dep / file / export |

選定理由は `docs/architecture/ADR-0001-toolchain.md` を参照。

## Source / documentation 言語

- **Source code** (identifier / filename / comment / config): 英語のみ。
- **UI ラベル** (button / legend / label / aria-label): 日本語 (legitimate localization)。
- **内部開発文書** (本ファイル / ADR / DEVELOPMENT.md / Agent Skill): 日本語。
- **Git / GitHub message**: 英語のみ。

## Task scope 方針

- ユーザーは縮小要求をしていない限り MVP に勝手に切らない (init policy §17)。
- 初期開発段階のため backward compatibility shim は不要。直接最終形へ移行 (init policy §16)。
- 公開 interface (`src/index.ts` の export 形状、`ConversionSettings` 等の型) を変更する場合は事前に協議すること。

## Branch / worktree

- 指定がない限り local `main` のみ。feature branch / temporary branch / worktree は作成しない (init policy §21)。
- 同一 file を複数 agent が同時編集してはならない (init policy §22)。

## Validation entry point

実装タスク完了時の canonical validation:

```
bun run validate
```

これは内部で `typecheck` → `format:check` → `lint` → `test` を順に実行する。すべて exit 0、warning 0、skip / `.only` / blanket suppress 0 が合格条件。`bun run knip` も適宜実行。

詳細は `.claude/skills/svg2tsx-validate/SKILL.md` を参照 (Skill が存在しない環境では `bun run validate` の各 script を直接実行)。

## UI / Browser 検証

この library は browser 専用 tool なので、UI 変更時は実際の rendered result を Playwright (または同等) で確認する。verification artifact は `.tmp/` に保存し commit しない。

## Design approval gate

`ConversionSettings` の shape、`svgParser` / `tsxConverter` の公開出力、embed interface を変更する場合は `docs/DEVELOPMENT.md` の該当節を更新してから実装に着手する。

## Mode / permission policy

active agent mode で意図的に制限された tool は bypass しない。permission / authentication gate も正当な user gate として扱う (init policy §39)。

## Skill discovery

| Skill | Trigger |
| --- | --- |
| `svg2tsx-validate` | 実装タスク完了前、commit 前、CI 失敗時 |

`.claude/skills/` 配下に project-local で配置する。global install しない。