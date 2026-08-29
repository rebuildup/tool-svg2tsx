# ADR-0002: Embed Architecture (Standalone Extract from my-web-2025)

- 調査日: 2026-08-29
- Status: Accepted
- 解決したい capability: 親 monorepo (`my-web-2025`) から抽出した component を standalone library として配布可能にする。

## Selected

- 公開 entry: `src/index.ts` が `Svg2tsxApp` を default export。
- peer dependency: `next ^16.3.0` (Next.js App Router の client component として埋め込まれるため)。
- cross-repo dependency (`../../../../external/ui/src/RawDOMContainer`) は廃止し、`src/components/RawDOMContainer.tsx` に inline する minimal 版を採用。
- すべての component は `"use client"` ディレクティブ付き。

## Selection reason

### 抽出元との疎結合

抽出前の svg2tsx は `my-web-2025/external/ui/src/RawDOMContainer` を import していた。これは monorepo 内の alias を 4 階層遡る相対パスで、standalone repo では物理的に存在しない。選択肢は 3 つ:

1. **`@rebuildup/ui` のような共有 package を別 repo として切り出す** — 過剰。RawDOMContainer 単独のために別 repo を作るのは小さい。
2. **inline する (採用)** — 最も小さく、standalone で完結する。consumer は wrapping で上書き可能。
3. **wrapper を削除** — `RawDOMContainer` の責務 (title / breadcrumbs 表示) を失う。これは UI 変更に該当し、init task の範囲を超える。

3 は将来の改善余地として残し、init 段階では 2 を採用する。

### peer dep on Next.js

この component は `"use client"` を使い、Next.js App Router の client component tree に組み込まれることが前提。peerDependencies に `next ^16.3.0` を置くことで、consumer の Next.js と二重 install を避けられる (Bun は peer を自動 install しないため重複なし)。

### `"use client"` ディレクティブ

DOMParser / FileReader / Clipboard / `dangerouslySetInnerHTML` など、SSR で利用できない API を使う component が含まれる。すべての component を `"use client"` 付きにすることで、Next.js App Router 上で適切に client bundle に分離される。

## Alternatives considered

- **SSR safe 化 (DOM 依存を util に分離、component は state のみ)**: 大改造。init の範囲外。
- **`RawDOMContainer` の共有化 (別 repo)**: 別 repo の管理コスト。`@rebuildup/ui` に統合するなら別 ADR が必要。
- **wrapper の完全削除**: UI の見た目が変わる。design-first 協議が必要 (init policy §14)。
- **`react` を peer に**: consumer が必ず React を持つため peer 化候補。が、現在は standalone library として component 単体を独立に動作させる要件もある (preview / storybook 単体動作など) ため regular dep のまま。

## Rejection reasons

- **共有 UI repo 化**: 現時点で他に共有 component がない。必要になった時点で別途 ADR を起こす。
- **`RawDOMContainer` の SSR 化**: 単一の `<div>` ベースであり SSR 価値が薄い。

## Overlap with native capability

`RawDOMContainer` のレイアウト責務は本来 host application が担う。inline することで host が上書きできる自由度を狭めるが、現状は host 非依存で preview できるメリットを優先。

## Context cost

inline `RawDOMContainer.tsx` は約 40 行。常時 context に入る量は無視できる。

## Maintenance state

`my-web-2025` 側の `RawDOMContainer` が大きく進化した場合は差分を取り込む sync task を別途起こす。今は baseline を固定。

## Security consideration

inline 版は外部の依存を持たず、`dangerouslySetInnerHTML` 等の危険 API も `RawDOMContainer` 自体は使わない (子 component 側の責務)。追加の security リスクなし。

## License

inline 版は project 自身の成果物。`my-web-2025` 側のコードを copy せず、責務のみを再現しているため attribution 不要。

## Version / pinning

なし (component 内定数のみ)。

## Project-local reproduction

`src/components/RawDOMContainer.tsx` に存在。`my-web-2025` の存在は不要。

## Re-evaluation condition

- `my-web-2025` に他の共有 UI component が現れ、共通 repo 化の意義が出た場合
- consumer が host 側で完全に wrap する pattern に統一された場合 (inline を削除)
- `RawDOMContainer` の layout が固定され、host 毎の override 需要が消えた場合