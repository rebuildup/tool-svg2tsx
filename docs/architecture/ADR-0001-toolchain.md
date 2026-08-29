# ADR-0001: Toolchain 選定

- 調査日: 2026-08-29
- Status: Accepted
- 解決したい capability: standalone library としての reproducible development environment。

## Selected

| Capability | Tool | Version |
| --- | --- | --- |
| Package manager | Bun | 1.4.x |
| Language | TypeScript | ^5.7.0 |
| Formatter / Lint | Biome | ^1.9.4 |
| Unit test | Vitest | ^3.0.0 |
| Coverage | @vitest/coverage-v8 | ^3.0.0 |
| DOM env for test | jsdom | ^25.0.0 |
| Static analysis | Knip | ^5.50.0 |
| React types | @types/react, @types/react-dom | ^19.2.0 |
| Runtime | dompurify | ^3.2.6 |
| Framework peer | next, react, react-dom | ^16.3.0 / ^19.2.8 / ^19.2.8 |

## Selection reason

### Bun

既存の `bun.lock` により Bun が既に採用されている。`my-web-2025` からの抽出時にも lockfile を維持した (commit `fc104dc`)。init policy §10 と一致するため継続採用。npm / pnpm / Yarn / `npx` は混在を避けるため導入しない。

### Biome

`type: module` の単一 library に対し、Prettier + ESLint の二重実行は冗長。Biome 単一で format と lint を兼ねる。Rust 実装で高速。既存 source が tab indent / double quote / always semicolon を使用しており、Biome の既定 (`tab`, `double`, `always`) と一致するため追加設定不要。

### Vitest + jsdom

`svgParser.ts` は `DOMParser` を使うため jsdom 環境が必要。Vitest は標準的な選択肢で、React 19 + jsdom 25 の組み合わせは公式に動作確認されている (vitest 3 系)。test config は ESM (`vitest.config.ts`) で `import.meta.url` ベースの alias を採用。coverage は `src/utils/**` のみを対象とし、presentational component は対象外 (browser smoke で担保)。

### Knip

`src/index.ts` が唯一の entry であり、tree-shake や将来 split の観点で unused export / file / dependency を早期検出したい。CI ではなく developer の手元で `bun run knip` として実行する軽量スクリプトとして配置。

`react-dom` と `@types/react-dom` は Next.js の `"use client"` 境界で間接的に必要だが、source code から直接 import されない。`knip.json` の `ignoreDependencies` で framework peer として narrow に指定。これは blanket suppress ではなく、framework 規約上の必然に対する narrow exception。

### React peer dependency

`react` と `react-dom` は Next.js host が提供するため `peerDependencies` に置く。`devDependencies` にも同 version を入れることで local 開発時の type-check と build を可能にしている。`react-dom` が source code に直接 import されないため knip の `ignoreDependencies` で対応。

### dompurify

`PreviewPanel` が `dangerouslySetInnerHTML` 経由で SVG を表示する前に sanitize するために必要。`react-dom/client` 同様 browser-only runtime。`dependencies` に置き、`peerDependencies` ではなく library が bundle する形を選択 (consumer が別途 install する必要がない)。

## Alternatives considered

- **npm + Prettier + ESLint + Jest**: 標準だが Bun / Biome / Vitest の高速性と比較すると冗長。
- **Deno**: Bun ほど Next.js との互換実績がない。
- **pnpm**: Bun の lockfile との互換性が弱く、混在の混乱を招く。
- **Playwright (browser test)**: unit テスト導入時に component 統合は手動 smoke で十分と判断。host (Next.js) 側の統合時に browser verify する。
- **Prettier (standalone)**: Biome で format と lint が揃うため不要。
- **ESLint (standalone)**: Biome で lint が揃うため不要。
- **Storybook**: component library ではない (tool) ため不要。
- **Renovate / Dependabot**: dependency 更新は manual で十分 (private library, version 0.x)。

## Rejection reasons

- **Oxlint / oxfmt**: Biome より機能面で劣る (formatter 内蔵なし)。
- **Web Test Runner**: Vitest + jsdom で必要十分。
- **uv / Poetry**: Python であり init policy §10 により禁止。

## Overlap with native capability

- Bun は `bun test` を内蔵するが、Vitest の API/mocking/coverage 統合を好む。
- TypeScript compiler は native の `tsc --noEmit` を利用 (Vitest 経由ではなく独立 script)。

## Context cost

4 つの dev tool (Biome, Vitest, Knip, TypeScript) はいずれも高速で出力が小さい。常時 context に注入するのは `package.json scripts` と `bun.lock` のみ。Schema 注入は各ツールの実行時のみ。

## Maintenance state

すべて actively maintained (2026-08-29 時点):
- Bun: 公式、weekly release
- Biome: 公式、bi-weekly release
- Vitest: 公式、monthly release
- Knip: 個人プロジェクトだが広く使われており monthly release
- TypeScript: 公式、quarterly release

## Security consideration

すべて first-party または信頼できる organization が maintain。network 通信は Bun install 時の registry アクセスのみ。`sharp` 等の native binding は dependencies に含めない (svg2tsx は pure DOM 操作のみ)。

## License

すべて MIT / Apache-2.0 / ISC など permissive license。project の MIT と互換。

## Version / pinning

`^x.y.z` で minor / patch の自動更新を許可。lockfile (`bun.lock`) で再現性を担保。

## Project-local reproduction

すべて `package.json` + `bun.lock` + `tsconfig.json` + `biome.json` + `vitest.config.ts` で再現可能。global install 前提の tool はない。

## Re-evaluation condition

- Bun が Next.js 16 と公式互換を失った場合
- Biome が React 19 / TypeScript 5 の構文サポートで 1 年以上遅延した場合
- Vitest が maintenance mode に入った場合