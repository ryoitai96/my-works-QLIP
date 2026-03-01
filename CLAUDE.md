# QLIP プロジェクト開発ガイドライン

このプロジェクトは障害者雇用マネジメントサービスを支える「HR-ESGプラットフォーム（QLIP）」です。
システムの全体要件については `@docs/SYSTEM_REQUIREMENTS.md` を常に参照してください。

## 開発フェーズ
現在は「Phase 0: PoC（3ヶ月）」の実装フェーズです。モジュールA〜DのPoCスコープ（手動アサイン、簡易アセスメント、朝の体調入力UI、QRサンクス通知等）にスコープを絞って実装してください。

## 技術スタック（確定）

| レイヤー | 技術 |
|---------|------|
| フロントエンド | Next.js 15 (App Router) + Tailwind CSS v4 + TypeScript |
| バックエンド | NestJS 11 + TypeScript |
| データベース | PostgreSQL (Prisma ORM) |
| パッケージマネージャー | pnpm (v10) |
| モノリポ管理 | Turborepo |
| Linter/Formatter | ESLint (flat config) + Prettier |
| 共有バリデーション | Zod |

## ディレクトリ構成

```
project-QLIP/
├── apps/
│   ├── web/                    # Next.js フロントエンド (port 3000)
│   │   └── src/app/            # App Router
│   └── api/                    # NestJS バックエンドAPI (port 3001)
│       ├── src/modules/        # auth, member, task, assessment, health-check, thanks, import
│       ├── src/database/       # Prisma Service
│       └── prisma/schema.prisma
├── packages/
│   ├── shared/                 # @qlip/shared — 共有型定義・定数・バリデーション
│   ├── eslint-config/          # @qlip/eslint-config
│   └── typescript-config/      # @qlip/typescript-config
├── docs/SYSTEM_REQUIREMENTS.md
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## 開発コマンド

```bash
# pnpmが未インストールの場合、npx pnpm を使用
npx pnpm install          # 依存関係インストール
npx pnpm dev              # web(3000) + api(3001) 同時起動
npx pnpm build            # 全パッケージビルド
npx pnpm lint             # ESLint実行
npx pnpm format           # Prettier実行

# 個別パッケージ
npx pnpm turbo run dev --filter=@qlip/web   # フロントエンドのみ
npx pnpm turbo run dev --filter=@qlip/api   # バックエンドのみ

# Prisma
cd apps/api
npx prisma generate        # クライアント生成
npx prisma migrate dev     # マイグレーション実行
npx prisma studio          # Prisma Studio起動
```

## ワークスペースパッケージ

| パッケージ | 説明 |
|-----------|------|
| `@qlip/web` | Next.js フロントエンド |
| `@qlip/api` | NestJS バックエンドAPI |
| `@qlip/shared` | 共有型定義・定数（RBACロール等）・Zodバリデーション |
| `@qlip/eslint-config` | 共有ESLint設定 |
| `@qlip/typescript-config` | 共有TypeScript設定 |

## アーキテクチャ方針
- モノリポ構成でのモジュラーモノリス（将来のマイクロサービス化を前提）。
- メンバー向けUIはアクセシビリティ（WCAG 2.1 AA準拠、認知負荷低減）を最優先すること。

## セキュリティ・コーディング規約
- 要配慮個人情報を扱うため、ログ出力等に機微なデータ（メンタルスコア、服薬履歴等）を含めないこと。
- テストコードを書き、実装後に必ず検証を実行すること。
- コードを変更する前に、必ずPlan Modeで計画を提示し、合意を得てから実装に進むこと。

## 環境変数（.env.example参照）
- `DATABASE_URL` — PostgreSQL接続文字列
- `API_PORT` — APIサーバーポート（デフォルト: 3001）
- `JWT_SECRET` — JWT署名キー
