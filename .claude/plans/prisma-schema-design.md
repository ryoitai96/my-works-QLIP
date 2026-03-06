# Phase 0 Prismaスキーマ設計計画

## 対象スコープ（Phase 0: PoC — 要件定義書 9.1 準拠）

| 領域 | Phase 0に含む | Phase 0に含まない |
|------|-------------|-----------------|
| Module A | 特性プロファイル入力、マイクロタスクDB（FL+SO両方）、手動タスクアサイン | AIマッチングアルゴリズム |
| Assessment | 推奨14問の月次簡易アセスメント（5領域）、自己評価のみ、簡易五角形チャート | JC協同評価、環境アセスメント、レディネススコア、人事評価連動 |
| Module B | 朝の体調入力UI（ゲーミフィケーション付き）、手動アラート | エシカルクオータ自動算出、予兆検知 |
| Module D | サンクス通知（QR→ありがとうボタン→通知） | 内部通報システム |
| インフラ | シングルテナント（モデルは作成）、基本RBAC | マルチテナントRLS、ゼロトラスト |

---

## エンティティ一覧: 12モデル + 8 enum

### 基盤（3モデル）
1. **Tenant** — クライアント企業（PoCはシングルテナントだがモデル化）
2. **Site** — 拠点（Flower Lab / サテライトオフィス / リモート）
3. **User** — 認証アカウント（R01〜R07共通）— 既存モデルを拡張

### モジュールA: 特性マッピング＆タスクアサイン（4モデル）
4. **Member** — メンバーの就労基本情報（Userと1:1）
5. **CharacteristicProfile** — 特性プロファイル（version管理で更新履歴保持、1:N）
6. **MicroTask** — マイクロタスク定義DB（事業カテゴリ別）
7. **TaskAssignment** — タスクアサイン（Phase 0は手動）

### アセスメント（3モデル）
8. **AssessmentItem** — 設問マスタ（D1〜D5の5領域、推奨/選択区分）
9. **AssessmentResult** — 実施セッション + 五角形パラメータ（D1〜D5平均スコア）
10. **AssessmentAnswer** — 個別回答（5段階リッカート + ストレングスフラグ）

### モジュールB（1モデル）
11. **VitalScore** — 朝の体調入力（気分・睡眠・体調・服薬・ひとこと）

### モジュールD（1モデル）
12. **ThanksNotification** — QRサンクス通知

---

## ER図（リレーション概要）

```
Tenant 1───* Site 1───* Member
  │                │       │
  │                │       ├──1:1 User
  │                │       ├──1:N CharacteristicProfile（version管理）
  │                │       ├──1:N VitalScore（1日1件制約）
  │                │       ├──1:N TaskAssignment ──N:1 MicroTask
  │                │       ├──1:N AssessmentResult
  │                │       │        └──1:N AssessmentAnswer ──N:1 AssessmentItem
  │                │       └──1:N ThanksNotification（受取メンバー）
  │                │
  │                ├──* MicroTask（拠点固有タスク）
  │                └──* ThanksNotification（制作拠点）
  │
  └──* MicroTask（テナント固有カスタムタスク）

AssessmentItem（設問マスタ — グローバル）
```

---

## 各モデルのフィールド設計

### 1. Tenant（クライアント企業）

| フィールド | 型 | 制約 | 説明 |
|-----------|-----|------|------|
| id | String | PK, UUID | |
| name | String | | 企業名 |
| code | String | unique | テナント識別コード |
| industry | String? | | 業種 |
| contactName | String? | | 担当者名 |
| contactEmail | String? | | 担当者メール |
| isActive | Boolean | default:true | |
| createdAt | DateTime | default:now() | |
| updatedAt | DateTime | @updatedAt | |

### 2. Site（拠点）

| フィールド | 型 | 制約 | 説明 |
|-----------|-----|------|------|
| id | String | PK, UUID | |
| tenantId | String | FK→Tenant | |
| name | String | | 拠点名 |
| siteType | SiteType (enum) | | FLOWER_LAB / SATELLITE_OFFICE / REMOTE |
| address | String? | | 住所 |
| isActive | Boolean | default:true | |
| createdAt | DateTime | default:now() | |
| updatedAt | DateTime | @updatedAt | |

### 3. User（認証アカウント）— 既存モデル拡張

現行の `User` に `tenantId`, `isActive` を追加。`siteId` は既にある。

| フィールド | 型 | 制約 | 説明 |
|-----------|-----|------|------|
| id | String | PK, UUID | |
| email | String | unique | |
| name | String | | |
| role | String | | R01〜R07 |
| tenantId | String? | FK→Tenant | R01はテナント横断のためnullable |
| siteId | String? | FK→Site | |
| isActive | Boolean | default:true | |
| createdAt | DateTime | default:now() | |
| updatedAt | DateTime | @updatedAt | |

### 4. Member（メンバー基本情報）

| フィールド | 型 | 制約 | 機密 | 説明 |
|-----------|-----|------|------|------|
| id | String | PK, UUID | | |
| userId | String | FK→User, unique | | 1:1 |
| siteId | String | FK→Site | | 所属拠点 |
| tenantId | String | FK→Tenant | | 所属テナント |
| employeeNumber | String? | | | 従業員番号 |
| nameKana | String? | | | 氏名かな |
| dateOfBirth | DateTime? | | **L3** | 生年月日 |
| disabilityType | DisabilityType? (enum) | | **L3** | 障害種別 |
| disabilityGrade | String? | | **L3** | 障害等級 |
| handbookType | String? | | **L3** | 手帳種類 |
| handbookIssuedAt | DateTime? | | | 手帳取得日 |
| handbookExpiresAt | DateTime? | | | 手帳有効期限 |
| employmentType | EmploymentType (enum) | default:PART_TIME | | 雇用形態 |
| employmentStartDate | DateTime? | | | 雇用開始日 |
| workExperience | String? | | | 就労経験 |
| preferredTasks | String? | | | 希望業務領域 |
| isActive | Boolean | default:true | | |
| createdAt | DateTime | default:now() | | |
| updatedAt | DateTime | @updatedAt | | |

**enum DisabilityType**: PHYSICAL(身体) / INTELLECTUAL(知的) / MENTAL(精神) / DEVELOPMENTAL(発達) / MULTIPLE(重複)
**enum EmploymentType**: FULL_TIME(正社員) / PART_TIME(パート・有期) / CONTRACT(契約社員)

### 5. CharacteristicProfile（特性プロファイル）

1:N（version管理）。JCが面談を通じて入力、月次更新。

| フィールド | 型 | 制約 | 機密 | 説明 |
|-----------|-----|------|------|------|
| id | String | PK, UUID | | |
| memberId | String | FK→Member | | |
| version | Int | default:1 | | 更新バージョン |
| visualCognition | Int? | | **L3** | 視覚認知力 (1-5) |
| auditoryCognition | Int? | | **L3** | 聴覚認知力 (1-5) |
| dexterity | Int? | | **L3** | 手先の器用さ (1-5) |
| physicalEndurance | Int? | | **L3** | 体力・持久力 (1-5) |
| repetitionTolerance | Int? | | **L3** | 反復作業耐性 (1-5) |
| adaptability | Int? | | **L3** | 変化対応力 (1-5) |
| communication | Int? | | **L3** | 対人コミュニケーション (1-5) |
| concentrationMinutes | Int? | | **L3** | 集中持続時間（分） |
| stressTolerance | Int? | | **L3** | ストレス耐性 (1-5) |
| specialNotes | String? | | **L4** | 特記事項（感覚過敏、こだわり等） |
| clinicSchedule | String? | | **L4** | 通院スケジュール |
| medicationTiming | String? | | **L4** | 服薬タイミング |
| environmentalNeeds | String? | | **L3** | 環境配慮（騒音、照明等） |
| communicationNeeds | String? | | **L3** | コミュニケーション配慮 |
| assessedById | String? | | | 評価実施者（JC）のUser ID |
| assessedAt | DateTime | default:now() | | 評価実施日 |
| createdAt | DateTime | default:now() | | |
| updatedAt | DateTime | @updatedAt | | |

@@index: [memberId, version]

### 6. MicroTask（マイクロタスク定義）

| フィールド | 型 | 制約 | 説明 |
|-----------|-----|------|------|
| id | String | PK, UUID | |
| siteId | String? | FK→Site | 拠点固有タスクの場合 |
| tenantId | String? | FK→Tenant | テナント固有カスタムタスクの場合 |
| taskCode | String | unique | FL-001, SO-001 等 |
| name | String | | タスク名 |
| category | String | | 下処理, 加工, 制作, 出荷, 事務 等 |
| businessCategory | BusinessCategory (enum) | | FLOWER_LAB / SATELLITE_OFFICE / CUSTOM |
| requiredSkillTags | Json? | | ["視覚認知", "色彩識別"] |
| difficulty | Int | | 難易度 (1-5) |
| standardMinutes | Int | | 標準所要時間（分） |
| physicalLoad | LoadLevel (enum) | default:LOW | 身体負荷 |
| cognitiveLoad | LoadLevel (enum) | default:LOW | 認知負荷 |
| description | String? | | タスク説明 |
| isActive | Boolean | default:true | |
| createdAt | DateTime | default:now() | |
| updatedAt | DateTime | @updatedAt | |

**enum BusinessCategory**: FLOWER_LAB / SATELLITE_OFFICE / CUSTOM
**enum LoadLevel**: LOW / MEDIUM / HIGH

### 7. TaskAssignment（タスクアサイン — Phase 0: 手動）

| フィールド | 型 | 制約 | 説明 |
|-----------|-----|------|------|
| id | String | PK, UUID | |
| memberId | String | FK→Member | |
| microTaskId | String | FK→MicroTask | |
| assignedById | String | FK→User | アサインしたJC/マネージャー |
| assignedDate | DateTime | @db.Date | アサイン日 |
| status | TaskAssignmentStatus (enum) | default:ASSIGNED | |
| startedAt | DateTime? | | |
| completedAt | DateTime? | | |
| notes | String? | | JCメモ |
| createdAt | DateTime | default:now() | |
| updatedAt | DateTime | @updatedAt | |

**enum TaskAssignmentStatus**: ASSIGNED / IN_PROGRESS / COMPLETED / CANCELLED

@@index: [memberId, assignedDate]

### 8. AssessmentItem（アセスメント設問マスタ）

要件定義書 5.1.5 の D1-01〜D5-08 全48問を格納。Phase 0は推奨14問のみ使用。

| フィールド | 型 | 制約 | 説明 |
|-----------|-----|------|------|
| id | String | PK, UUID | |
| code | String | unique | D1-01, D2-03 等 |
| domain | AssessmentDomain (enum) | | D1〜D5 |
| category | AssessmentCategory (enum) | | RECOMMENDED / OPTIONAL |
| questionText | String | | 設問テキスト |
| qualityElement | String? | | 質の5要素との対応（①能力発揮 等） |
| sortOrder | Int | default:0 | 表示順 |
| isActive | Boolean | default:true | |
| createdAt | DateTime | default:now() | |
| updatedAt | DateTime | @updatedAt | |

**enum AssessmentDomain**: D1(職務の遂行) / D2(職業生活) / D3(対人関係・感情) / D4(日常生活) / D5(疾病・障害管理)
**enum AssessmentCategory**: RECOMMENDED / OPTIONAL

### 9. AssessmentResult（アセスメント実施結果）

1回のセッション。五角形パラメータ（D1-D5の領域平均スコア）を直接格納。

| フィールド | 型 | 制約 | 機密 | 説明 |
|-----------|-----|------|------|------|
| id | String | PK, UUID | | |
| memberId | String | FK→Member | | |
| assessmentType | AssessmentType (enum) | default:MONTHLY_SIMPLE | | Phase 0は月次簡易のみ |
| status | AssessmentStatus (enum) | default:DRAFT | | |
| assessedAt | DateTime | default:now() | | 実施日 |
| domainD1Score | Float? | | **L3** | 職務の遂行（平均） |
| domainD2Score | Float? | | **L3** | 職業生活の遂行 |
| domainD3Score | Float? | | **L3** | 対人関係・感情コントロール |
| domainD4Score | Float? | | **L3** | 日常生活の遂行 |
| domainD5Score | Float? | | **L3** | 疾病・障害の管理 |
| createdAt | DateTime | default:now() | | |
| updatedAt | DateTime | @updatedAt | | |

**enum AssessmentType**: MONTHLY_SIMPLE / QUARTERLY_FULL / SEMI_ANNUAL_ENV / AD_HOC
**enum AssessmentStatus**: DRAFT / COMPLETED

@@index: [memberId, assessedAt]

### 10. AssessmentAnswer（個別回答）

| フィールド | 型 | 制約 | 機密 | 説明 |
|-----------|-----|------|------|------|
| id | String | PK, UUID | | |
| assessmentResultId | String | FK→AssessmentResult | | |
| assessmentItemId | String | FK→AssessmentItem | | |
| evaluatorType | EvaluatorType (enum) | default:SELF | | Phase 0は自己評価のみ |
| score | Int? | | **L3** | 回答スコア (1-5, null=未確認"?") |
| isStrength | Boolean | default:false | | ストレングスフラグ（★） |
| createdAt | DateTime | default:now() | | |

**enum EvaluatorType**: SELF / COACH_UNASSISTED / COACH_ASSISTED（後2つはPhase 1+）

@@unique: [assessmentResultId, assessmentItemId, evaluatorType]

### 11. VitalScore（朝の体調入力）

1日1レコード制約。ゲーミフィケーション対応。

| フィールド | 型 | 制約 | 機密 | 説明 |
|-----------|-----|------|------|------|
| id | String | PK, UUID | | |
| memberId | String | FK→Member | | |
| recordDate | DateTime | @db.Date | | 記録日 |
| mood | Int | | **L3** | 気分 (1-5: 表情アイコン) |
| sleep | Int | | **L3** | 睡眠 (1-5) |
| condition | Int | | **L3** | 体調 (1-5) |
| medicationTaken | MedicationStatus? (enum) | | **L4** | 服薬確認 |
| comment | String? | | **L4** | ひとこと（自由入力/音声対応） |
| createdAt | DateTime | default:now() | | |

**enum MedicationStatus**: TAKEN / NOT_TAKEN / NOT_APPLICABLE

@@unique: [memberId, recordDate]

### 12. ThanksNotification（QRサンクス通知）

| フィールド | 型 | 制約 | 説明 |
|-----------|-----|------|------|
| id | String | PK, UUID | |
| qrToken | String | unique | QRコードに埋め込むトークン |
| siteId | String | FK→Site | ギフト制作拠点 |
| memberId | String? | FK→Member | 制作担当メンバー（匿名時null） |
| thankedAt | DateTime? | | 「ありがとう」タップ日時 |
| senderMessage | String? | | 受取者からのメッセージ（任意） |
| isNotified | Boolean | default:false | メンバーへの通知済みか |
| notifiedAt | DateTime? | | メンバーへの通知日時 |
| createdAt | DateTime | default:now() | |

---

## 設計判断ポイント

### enum vs String の選択
- **Prisma enum を使用する**: Phase 0はグリーンフィールドであり、列挙値の型安全性の恩恵が大きい
- 頻繁に変更が必要になった場合はマイグレーションで対応可能

### CharacteristicProfile の 1:N 設計
- 要件定義書: 「初回アセスメント後、月次の面談時に更新」→ 更新履歴の保持が必要
- `version` フィールドで最新を判別。過去バージョンも参照可能

### 五角形パラメータの非正規化
- `AssessmentResult.domainD1Score〜D5Score` に領域平均スコアを直接格納
- 表示パフォーマンス優先。回答データからの再計算も可能

### 暗号化に関する方針
- Prismaコメント（`///`）で機密レベル(L3/L4)を明記
- 実際の暗号化はアプリケーション層（NestJSインターセプタ）で実装
- Phase 0ではコメントで対象を示し、Phase 1で暗号化ミドルウェアを実装

### Phase 0 でスコープ外としたモデル（Phase 1+で追加）
EmployeeHash, GiftOrder, DeliveryTracking, EnvironmentAssessment, ReadinessScore, PerformanceReview, ConsultationRecord, TrainingRecord, Alert, Whistleblowing, AuditLog, ParameterConfig, EthicalQuota, FlowerInventory, SOP, ReasonableAccommodationPlan

---

## 実装ステップ

1. `apps/api/prisma/schema.prisma` に全12モデル + 8 enumを記述
2. 各フィールドに `///` コメントで機密レベル(L3/L4)を明記
3. `npx prisma format` でフォーマット
4. `npx prisma validate` でスキーマ検証
5. `npx prisma generate` でクライアント再生成
6. `npx pnpm build` で全体ビルド検証
