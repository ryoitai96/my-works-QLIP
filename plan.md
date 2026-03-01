# アセスメント画面 UIブラッシュアップ計画

## 概要
アセスメント画面（`/assessment`）の見た目を改善し、質問カードの視認性・操作性を向上させる。

---

## 変更ファイル一覧（2ファイル）

| # | ファイル | 概要 |
|---|---------|------|
| 1 | `apps/web/src/features/assessment/components/assessment-form.tsx` | 質問カード・ボタンのデザイン改善 |
| 2 | `apps/web/src/features/assessment/components/pentagon-chart.tsx` | チャートの視認性向上 |

---

## 1. assessment-form.tsx — 質問カード・ボタンのデザイン改善

### 1-1. 質問カード（fieldset要素）
- **現状**: `p-4`, `border-gray-200`, `bg-white`
- **変更**: パディングを `p-5` に拡大、`shadow-sm` 追加で立体感を付与

### 1-2. 質問文（p要素）
- **現状**: `text-sm font-medium`
- **変更**: `text-base font-medium` に拡大して読みやすく

### 1-3. 表情ボタン（button要素）
- **現状**: `min-h-[56px]`, emoji `text-xl`
- **変更**:
  - ボタンサイズを `min-h-[64px]` に拡大
  - emojiサイズを `text-2xl` に拡大
  - ラベルテキストを `text-[10px]` に微増

### 1-4. 選択時のスタイル
- **現状**: `border-[#ffc000] bg-[#ffc000]/10`
- **変更**: `border-[#ffc000] bg-[#ffc000]/20` で選択状態をより鮮明に

---

## 2. pentagon-chart.tsx — チャートの視認性向上

### 2-1. グリッド線・軸線
- **現状**: `stroke="#e5e7eb"` (gray-200相当)
- **変更**: `stroke="#f3f4f6"` (gray-100相当) に薄くしてデータを際立たせる

### 2-2. データポリゴン
- **現状**: `fillOpacity="0.2"`
- **変更**: `fillOpacity="0.35"` に上げてデータ領域を鮮やかに

### 2-3. データポリゴンの枠線
- **現状**: `strokeWidth="2"`
- **変更**: `strokeWidth="2.5"` で少し太く、存在感を増す

### 2-4. スコアドット
- **現状**: `r="4"`
- **変更**: `r="5"` で少し大きく

---

## 検証手順

1. `npx pnpm build` — ビルド成功確認
2. `/assessment` にアクセスし質問フォームの見た目を確認
3. ボタンの選択時にブランドカラーの背景が鮮明に表示されることを確認
4. アセスメント送信後、五角形チャートのデータ部分がグリッドより際立っていることを確認
