# ADR-0003: Test Strategy

- 調査日: 2026-08-29
- Status: Accepted
- 解決したい capability: 純関数ロジックの継続的検証と coverage 監視。

## Selected

- Unit / integration テスト: Vitest 3 + jsdom 25
- Coverage: `@vitest/coverage-v8`
- Threshold: lines / statements / functions / branches すべて 80%
- Test 配置: source と co-located (`src/utils/svgParser.test.ts` 等)
- Scope: 純関数 (`svgParser`, `tsxConverter`) を unit test。React component は browser smoke で手動確認。

## Selection reason

### Vitest 3 + jsdom

`svgParser.ts` が `DOMParser` を使うため、jsdom 環境が必要。Vitest 3 は React 19 + jsdom 25 と公式互換。`import.meta.url` alias 設定で ESM project に自然に統合できる。

### co-located test

vitest の default convention。`.test.ts` / `.test.tsx` を source の隣に置くことで、責務単位のレビューがしやすくなる。`src/index.ts` のような trivial re-export は coverage 計測から除外する (threshold を満たすためだけに空 test を書かない)。

### 80% threshold

init policy §29 の最低値。`svgParser.ts` (~70 行) と `tsxConverter.ts` (~280 行) を合わせると ~350 行の pure logic。80% は十分に達成可能で、未到達時は新ロジックの test 漏れを示す signal として機能する。

### React component は unit test 対象外

component は内部 state と DOM 副作用の組み合わせで、unit test の費用対効果が低い。`SVGToTSXConverter` は純関数の薄い glue なので、純関数の test で代替する。`PreviewPanel` 等の DOM 描画は Playwright による host 統合 smoke でカバーする (host 側 task で setup)。

## Alternatives considered

- **React Testing Library + jsdom で component test**: 導入コスト対効果が低い (component が thin wrapper)。
- **happy-dom**: jsdom 25 で十分。happy-dom の軽量化メリットを上回る互換性メリット (DOMParser 含む) を優先。
- **Bun test (`bun test`)**: Vitest の mocking / coverage / watch DX に劣る。
- **E2E (Playwright) を CI で常時実行**: host (Next.js) が必要。standalone library 単体では別 task として分離。
- **Mutation test (Stryker)**: 350 行の pure logic には overkill。

## Rejection reasons

- **Storybook + Chromatic**: component library ではないため不要。
- **MSW (Mock Service Worker)**: network mock 対象がない (URL fetch は `SVGInput` の手動 smoke で確認)。

## Overlap with native capability

- Bun は `bun test` を内蔵。Vitest の jest-compatible API / coverage / UI / mock library は standalone library 規模では必須ではないが、host 側 (Next.js) で Vitest が標準採用されている可能性に揃える意図で採用。
- TypeScript compiler は `tsc --noEmit` で type test を兼ねる。Vitest 単独では unknown property 等の型エラーを検知できないため、`bun run typecheck` を canonical validation に含める。

## Context cost

Vitest 実行時の snapshot / diff は terminal に直接出力される。Schema 注入量は中程度 (`@vitest/coverage-v8` の型定義)。

## Maintenance state

- Vitest: official (vitest.dev)
- jsdom: official (jsdom project)
- @vitest/coverage-v8: official

すべて actively maintained (2026-08-29 時点)。

## Security consideration

なし。test は in-process のみ。

## License

すべて MIT。project の MIT と互換。

## Version / pinning

`vitest ^3.0.0`, `@vitest/coverage-v8 ^3.0.0`, `jsdom ^25.0.0`。

## Project-local reproduction

`vitest.config.ts` + `package.json scripts` + 各 `*.test.ts` で完結。host / CI / local のいずれでも `bun run test:coverage` で再現可能。

## Re-evaluation condition

- coverage 80% が新ロジック追加で自然に達成困難になった場合 (component test 導入を再検討)
- Vitest が maintenance mode に入った場合
- component の logic が増えて unit 単体で coverage が割に合わなくなった場合