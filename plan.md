# メンバー向けエンパワーメント・ダッシュボード 実装計画

## 概要
障害者メンバー（R04: MEMBER）向けに、モチベーションを高める「エンパワーメント・ダッシュボード」を `/dashboard` に実装する。管理者はそのまま既存のダッシュボードが表示され、MEMBERロールのときだけ専用UIに切り替わる。

---

## 1. データベーススキーマ拡張

**ファイル:** `apps/api/prisma/schema.prisma`

新しいモデル `DailyMessage` を追加（Memberモデルに直接フィールドを追加するより、日付ごとのメッセージを管理でき拡張性が高い）:

```prisma
model DailyMessage {
  id        String   @id @default(uuid())
  memberId  String
  member    Member   @relation(fields: [memberId], references: [id])

  messageDate DateTime @db.Date       /// メッセージ対象日
  content     String                   /// ジョブコーチ等からの一言コメント
  authorId    String                   /// コメント投稿者（User.id）
  author      User     @relation("AuthoredMessages", fields: [authorId], references: [id])

  createdAt DateTime @default(now())

  @@unique([memberId, messageDate])
  @@map("daily_messages")
}
```

- `Member` モデルに `dailyMessages DailyMessage[]` リレーション追加
- `User` モデルに `authoredMessages DailyMessage[]` リレーション追加
- マイグレーション実行: `npx prisma migrate dev --name add_daily_message`

---

## 2. バックエンド API

**ファイル:** `apps/api/src/modules/dashboard/dashboard.service.ts`

新メソッド `getMemberDashboard(user: JwtPayload)` を追加:

```typescript
async getMemberDashboard(user: JwtPayload) {
  // 1. member を取得
  // 2. 最新の VitalScore を取得 → streakDays（連続出勤日数）
  // 3. 直近の VitalScore を走査して mood >= 4 の連続日数を算出
  // 4. 最新の AssessmentResult の assessmentDate を取得
  // 5. 今日の DailyMessage を取得（ジョブコーチからの一言）
  // 6. 最新 VitalScore を元にシステム自動コメント生成
  //    例: sleep >= 4 → "睡眠が取れていて素晴らしいです！"
  //        mood >= 4 → "気分が良い日が続いていますね！"
  //        streakDays >= 7 → "1週間連続で記録を続けています！すごい！"
  return {
    userName,
    streakDays,
    goodMoodStreak,
    lastAssessmentDate,
    dailySupportMessage,
    dailySupportMessageAuthor,
    systemComment,
  };
}
```

**ファイル:** `apps/api/src/modules/dashboard/dashboard.controller.ts`

新エンドポイント追加:

```typescript
@Get('member')
@Roles(Role.MEMBER)
async getMemberDashboard(@CurrentUser() user: JwtPayload) {
  return this.dashboardService.getMemberDashboard(user);
}
```

---

## 3. フロントエンド APIクライアント

**ファイル:** `apps/web/src/features/dashboard/api.ts`（既存ファイルに追記）

```typescript
export interface MemberDashboardData {
  userName: string;
  streakDays: number;
  goodMoodStreak: number;
  lastAssessmentDate: string | null;
  dailySupportMessage: string | null;
  dailySupportMessageAuthor: string | null;
  systemComment: string;
}

export async function fetchMemberDashboard(): Promise<MemberDashboardData> {
  return apiClient<MemberDashboardData>('/dashboard/member', { auth: true });
}
```

---

## 4. フロントエンド UI

**新ファイル:** `apps/web/src/features/dashboard/components/member-dashboard.tsx`

### ヒーローエリア
- ユーザー名への挨拶: 「おはようございます、○○さん！」
- グラデーション背景（amber → orange 系）
- 実績バッジ横並び:
  - 「🔥 連続出勤 N日」（amber/orange グラデーションカード）
  - 「✨ 体調良好 N日」（emerald グラデーションカード）
  - 最終アセスメント日（indigo カード）

### メッセージエリア
- ジョブコーチからの「今日の一言」: 吹き出し風カード（左に小さなアバターアイコン、パステルカラーの背景）
- システムからの労いコメント: 別の吹き出しカード（ロボットアイコン付き、柔らかい色合い）
- メッセージがない場合は「今日もがんばりましょう！」の代替テキスト

### クイックアクション
- 「日報を入力する」→ `/health-check` へ（大きなグラデーションボタン、📋アイコン付き）
- 「タスクを見る」→ `/micro-tasks` へ（大きなアウトラインボタン、✅アイコン付き）
- 各ボタンはアイコン付き、余白広め

### デザイン原則
- 余白を広く取り認知負荷を下げる
- カラフルなアクセント（#ffc000 ベース、emerald, indigo, rose 等）
- 角丸の大きめカード、ソフトなグラデーション背景
- WCAG 2.1 AA 準拠のコントラスト

---

## 5. ページルーティング分岐

**新ファイル:** `apps/web/src/features/dashboard/components/dashboard-router.tsx`

クライアントコンポーネント。`authStore.getUser()` のロールで分岐:
- `Role.MEMBER` → `<MemberDashboard />`
- それ以外 → `<DashboardPageContent />`（既存の管理者ダッシュボード）

**ファイル:** `apps/web/src/app/(authenticated)/dashboard/page.tsx`

`DashboardPageContent` の代わりに `DashboardRouter` を使用するよう変更。`h1` タイトルはルーター内で動的に切り替え。

---

## 6. role-check.ts の拡張

**ファイル:** `apps/web/src/features/auth/role-check.ts`

`isMember()` ヘルパー関数を追加。

---

## 対象ファイル一覧

| ファイル | 変更種別 | 内容 |
|---------|---------|------|
| `apps/api/prisma/schema.prisma` | 編集 | DailyMessage モデル追加 + リレーション |
| `apps/api/src/modules/dashboard/dashboard.service.ts` | 編集 | `getMemberDashboard()` 追加 |
| `apps/api/src/modules/dashboard/dashboard.controller.ts` | 編集 | `GET /dashboard/member` 追加 |
| `apps/web/src/features/dashboard/api.ts` | 編集 | 型 + fetch関数追加 |
| `apps/web/src/features/dashboard/components/member-dashboard.tsx` | 新規 | メンバー用ダッシュボードUI |
| `apps/web/src/features/dashboard/components/dashboard-router.tsx` | 新規 | ロール分岐コンポーネント |
| `apps/web/src/app/(authenticated)/dashboard/page.tsx` | 編集 | DashboardRouter 使用 |
| `apps/web/src/features/auth/role-check.ts` | 編集 | `isMember()` 追加 |

## 実装順序

1. Prisma schema 更新 → マイグレーション
2. Backend: service + controller 拡張
3. Frontend: API型 + fetchMemberDashboard
4. Frontend: role-check に isMember 追加
5. Frontend: MemberDashboard コンポーネント作成
6. Frontend: DashboardRouter 作成 + page.tsx 修正
7. ビルド確認
