# スーパーアドミン向け「企業管理」「個人管理」実装計画

## 概要
スーパーアドミン（R01）専用の管理画面として、テナント（企業）一覧・詳細、ユーザー（個人）一覧・詳細の4画面を実装する。
バックエンドは `@Roles(Role.SUPER_ADMIN)` で保護し、フロントエンドはサイドバーの条件付き表示で制御する。

---

## 新規・変更ファイル一覧（12ファイル）

| # | ファイル | 操作 | 概要 |
|---|---------|------|------|
| 1 | `apps/api/src/modules/admin/admin.module.ts` | 新規 | AdminModule 定義 |
| 2 | `apps/api/src/modules/admin/admin.service.ts` | 新規 | テナント・ユーザーの一覧・詳細取得ロジック |
| 3 | `apps/api/src/modules/admin/admin.controller.ts` | 新規 | 4つのGETエンドポイント（SUPER_ADMIN専用） |
| 4 | `apps/api/src/app.module.ts` | 編集 | AdminModule を imports に追加 |
| 5 | `apps/web/src/features/admin/api.ts` | 新規 | APIクライアント関数と型定義 |
| 6 | `apps/web/src/features/admin/components/tenants-page-content.tsx` | 新規 | 企業一覧テーブルUI |
| 7 | `apps/web/src/features/admin/components/tenant-detail-content.tsx` | 新規 | 企業詳細（企業情報+所属ユーザー一覧） |
| 8 | `apps/web/src/features/admin/components/users-page-content.tsx` | 新規 | 個人一覧テーブルUI |
| 9 | `apps/web/src/features/admin/components/user-detail-content.tsx` | 新規 | 個人詳細（ユーザー情報+Member属性） |
| 10 | `apps/web/src/app/(authenticated)/admin/tenants/page.tsx` | 新規 | 企業管理一覧ページ |
| 11 | `apps/web/src/app/(authenticated)/admin/tenants/[id]/page.tsx` | 新規 | 企業詳細ページ |
| 12 | `apps/web/src/app/(authenticated)/admin/users/page.tsx` | 新規 | 個人管理一覧ページ |
| 13 | `apps/web/src/app/(authenticated)/admin/users/[id]/page.tsx` | 新規 | 個人詳細ページ |
| 14 | `apps/web/src/components/sidebar.tsx` | 編集 | R01のみ「企業管理」「個人管理」リンクを追加 |

---

## 1. バックエンド — AdminModule

### 1-1. admin.module.ts
- `DatabaseModule` をインポート
- `AdminController`, `AdminService` を登録

### 1-2. admin.service.ts
- `findAllTenants()`: `prisma.tenant.findMany` で全企業取得。`_count: { users: true, members: true }` でユーザー数・メンバー数を集計
- `findTenantById(id)`: `prisma.tenant.findUnique` + `include: { users, sites }` で詳細と所属ユーザー一覧を返却
- `findAllUsers()`: `prisma.user.findMany` + `include: { tenant: { select: { name } } }` でロール・所属企業名付きで取得
- `findUserById(id)`: `prisma.user.findUnique` + `include: { tenant, site, member }` でユーザー詳細とMember情報を返却
- パスワードハッシュ（`passwordHash`）は全レスポンスから除外する

### 1-3. admin.controller.ts
- `@Controller('admin')` + `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles(Role.SUPER_ADMIN)` をクラスレベルに適用
- `GET /api/admin/tenants` → `findAllTenants()`
- `GET /api/admin/tenants/:id` → `findTenantById(id)`
- `GET /api/admin/users` → `findAllUsers()`
- `GET /api/admin/users/:id` → `findUserById(id)`

### 1-4. app.module.ts
- `AdminModule` を `imports` 配列に追加

---

## 2. フロントエンド — APIクライアント

### api.ts
- 型定義: `TenantSummary`, `TenantDetail`, `UserSummary`, `UserDetail`
- 関数: `fetchTenants()`, `fetchTenantById(id)`, `fetchUsers()`, `fetchUserById(id)`
- すべて `apiClient<T>(path, { auth: true })` を使用

---

## 3. フロントエンド — ページ & コンポーネント

### 3-1. 企業管理一覧 (tenants/page.tsx + tenants-page-content.tsx)
- 白背景テーブルカード（`rounded-xl border shadow-sm`）
- 列: 企業名 / 業種 / ユーザー数 / メンバー数 / ステータス / 登録日
- 行クリックで `/admin/tenants/[id]` へ遷移
- ローディング・エラー状態のハンドリング

### 3-2. 企業詳細 (tenants/[id]/page.tsx + tenant-detail-content.tsx)
- 上部: 企業基本情報カード（企業名、業種、ID、登録日、ステータス）
- 下部: 所属ユーザー一覧テーブル（氏名、メール、ロール、ステータス）
- 「← 企業一覧に戻る」リンク

### 3-3. 個人管理一覧 (users/page.tsx + users-page-content.tsx)
- テーブル列: 氏名 / メール / ロール / 所属企業 / ステータス / 登録日
- 行クリックで `/admin/users/[id]` へ遷移

### 3-4. 個人詳細 (users/[id]/page.tsx + user-detail-content.tsx)
- 上部: ユーザー基本情報カード（氏名、メール、ロール、所属企業、拠点、ステータス）
- 下部: Member情報セクション（Member属性がある場合のみ表示。従業員番号、入職日、雇用形態、ステータス等）
- 機微データ（disabilityType等）は表示しない
- 「← 個人一覧に戻る」リンク

---

## 4. サイドバー — 条件付きメニュー追加

- `sidebar.tsx` の `useEffect` 内で `isSuperAdmin(user.role)` を判定
- `true` の場合、メインナビの末尾に「企業管理」「個人管理」を追加表示
- アイコン: ビルアイコン（BuildingOffice）とユーザーグループアイコン（Users）

---

## 検証手順

1. `npx pnpm build` — ビルド成功確認
2. `admin@sann.co.jp` (R01) でログイン → サイドバーに「企業管理」「個人管理」が表示されること
3. `/admin/tenants` で企業一覧が表示され、行クリックで詳細へ遷移
4. `/admin/users` で個人一覧が表示され、行クリックで詳細へ遷移
5. `member1@sann.co.jp` (R04) でログイン → サイドバーに管理メニューが表示されないこと
6. R04ユーザーが直接 `/api/admin/tenants` にアクセス → 403 Forbidden
