# 業務フロー導線の実装計画

## 概要
各モジュール（体調入力・タスク・サンクス）を「一日の業務フロー」として繋ぎ、
ロールに応じた遷移先の分岐を実装する。

---

## 変更ファイル一覧（4ファイル）

| # | ファイル | 操作 | 概要 |
|---|---------|------|------|
| 1 | `apps/web/src/features/auth/components/login-form.tsx` | 編集 | ログイン後の遷移先をロール別に分岐 |
| 2 | `apps/web/src/features/health-check/components/health-check-page-content.tsx` | 編集 | 初回送信成功後に2秒で `/micro-tasks` へ自動遷移 |
| 3 | `apps/web/src/features/micro-task/components/micro-task-card.tsx` | 編集 | 完了後にサンクスカード誘導メッセージ表示 |
| 4 | `apps/web/src/components/hero-cta.tsx` | 編集 | ロール別の遷移先（dashboard or health-check） |

---

## 1. login-form.tsx — ロール別遷移

**現状**: `router.push('/micro-tasks')` 固定
**変更後**:
- `authStore.setUser(user)` の後、`user.role` をチェック
- `ADMIN_ROLES` (R01, R02) / `JOB_COACH` (R03) → `/dashboard`
- `MEMBER` (R04) 他 → `/health-check`
- `@qlip/shared` の `Role`, `ADMIN_ROLES` 定数を使用

---

## 2. health-check-page-content.tsx — 自動遷移

**現状**: 送信成功後にトーストのみ表示
**変更後**:
- `handleSubmitSuccess` で `result.isUpdate` が `false`（初回送信）の場合:
  - トースト表示 + 「タスク一覧へ移動します...」メッセージ
  - 2秒後に `router.push('/micro-tasks')` で自動遷移
- `isUpdate` が `true`（更新）の場合: 現行通りトーストのみ

---

## 3. micro-task-card.tsx — サンクス誘導

**現状**: 完了ボタン押下 → showToast のみ
**変更後**:
- 完了成功後、カード内の完了ボタンの代わりに:
  - 「お疲れ様でした！」メッセージ
  - 「仲間にサンクスカードを送る →」のリンクボタン（`/thanks` へ）
- `useState` で `isCompleted` フラグを管理

---

## 4. hero-cta.tsx — ロール別CTA

**現状**: ログイン済みなら `/micro-tasks` 固定
**変更後**:
- `authStore.getUser()` でロールを取得
- `ADMIN_ROLES` / `JOB_COACH` → `/dashboard`（ボタンテキスト: 「ダッシュボードへ」）
- `MEMBER` 他 → `/health-check`（ボタンテキスト: 「今日の体調を記録」）
- `@qlip/shared` の `Role`, `ADMIN_ROLES` を使用

---

## 検証手順

1. `npx pnpm build` — ビルド成功
2. メンバー(R04)でログイン → `/health-check` へ遷移
3. 体調入力送信 → 2秒後に `/micro-tasks` へ自動遷移
4. タスク完了 → 「サンクスカードを送る」誘導が表示
5. コーチ(R03)でログイン → `/dashboard` へ遷移
6. トップページCTAがロール別で正しく動作
