# DEVELOPMENT.md

> 内部開発者向け文書 (日本語)。`AGENTS.md` を補完する詳細手順。

## アーキテクチャ概要

```
src/
├── index.ts              # public entry: `Svg2tsxApp` を default export
├── Svg2tsxApp.tsx        # `"use client"` root component (SVGToTSXConverter を wrap)
├── components/
│   ├── RawDOMContainer.tsx      # 組み込み用 minimal layout wrapper
│   ├── SVGToTSXConverter.tsx    # orchestrator (state + parse + convert)
│   ├── SVGInput.tsx             # SVG 入力 (file / code / URL)
│   ├── ConversionSettings.tsx   # 変換設定 UI
│   ├── PreviewPanel.tsx         # SVG / TSX preview
│   └── DownloadPanel.tsx        # download / clipboard copy
├── types/index.ts        # ConversionSettings / SVGElement / ConversionResult 等
└── utils/
    ├── svgParser.ts      # DOMParser ベースの SVG → SVGElement 変換
    ├── svgParser.test.ts
    ├── tsxConverter.ts   # SVGElement → TSX 文字列生成
    └── tsxConverter.test.ts
```

データフローは単方向:

```
SVGInput → (svgInput state)
  → validateSVG / parseSVG (utils)
  → convertSVGToTSX (utils)
  → PreviewPanel (表示)
  → DownloadPanel (download / copy)
```

state はすべて `SVGToTSXConverter` が所有。子 component は props 経由でのみ操作する。

## 主要 decision

- **Bun + Biome + Vitest + Knip** を toolchain として固定。詳細は `docs/architecture/ADR-0001-toolchain.md`。
- **Embed 戦略**: Next.js 16 を peer dep とし、standalone library として配布。詳細は `docs/architecture/ADR-0002-embed-architecture.md`。
- **Test 戦略**: 純関数 (svgParser, tsxConverter) を Vitest + jsdom で coverage 80% を強制。詳細は `docs/architecture/ADR-0003-test-strategy.md`。

## 開発手順

### 初回 setup

```bash
bun install
```

### 開発中の validation

```bash
bun run typecheck       # TypeScript no-emit check
bun run format          # biome format --write
bun run lint:fix        # biome check --write
bun run test:watch      # Vitest watch mode
```

### 完了前 validation (canonical)

```bash
bun run validate
```

これは `typecheck → format:check → lint → test` を順に実行する。すべて exit 0、warning 0、skip / `.only` / blanket suppress 0 が合格条件。

加えて定期的に:

```bash
bun run knip            # unused file / export / dependency の検出
bun run test:coverage   # coverage 80% 以上を維持
```

### Embed 検証

UI 変更時は必ずブラウザでの rendered result を確認する。手順:

1. 別ディレクトリに Next.js 16 host を作成 (または既存の `my-web-2025` 等を使う)
2. `bun link` または file: 参照で `@rebuildup/tool-svg2tsx` を link
3. host の page で `<Svg2tsxApp />` を render
4. screenshot / interaction を `.tmp/` に保存

## 命名規約

- filename / directory / component / hook / function / variable は所有する責務を英語で表す。
- leaf 側で ancestor path の意味を繰り返さない。
- `utils` / `helpers` / `common` / `misc` / `manager` 等の dumping-ground 名は禁止。
- UI ラベルは日本語 (legitimate localization)。

## directory width

同一階層に並列で並ぶ file はおおむね 10 以内。超える場合は domain / feature / responsibility 境界で分割する。

## 公開 interface

`src/index.ts` の export 形状と `src/types/index.ts` の型は公開契約。変更前にユーザー協議 + 本書更新。

## Knip 設定

`knip.json` の `ignoreDependencies: ["react-dom", "@types/react-dom"]` は、Next.js の `"use client"` 境界で framework が必要とするが source code から直接 import されない package に対する narrow な exception。blanket suppress ではない。将来 source code から直接 import する形に変更したら ignore 設定を削除すること。

## 既知の既存 quality debt

init 時に検出した既存問題。将来の task で対応する:

- `src/utils/tsxConverter.ts:52-57` `generateImports()` が分岐の両側で同一文字列を返している (dead branch)。
- UI 全 component が inline style を使用。design system が確立したら移行を検討。
- `formatCode()` は単純な文字列置換ベース。専用の prettier / dprint 統合は将来検討。
- component unit test がない (現時点では utils のみ対象)。host 統合時に Playwright smoke を host 側で追加予定。

## 関連文書

- `AGENTS.md` — canonical project contract (dispatcher)
- `docs/architecture/ADR-0001-toolchain.md`
- `docs/architecture/ADR-0002-embed-architecture.md`
- `docs/architecture/ADR-0003-test-strategy.md`