/**
 * RBAC ロール定義
 * @see docs/SYSTEM_REQUIREMENTS.md セクション 3.1
 */
export const Role = {
  /** QLIPスーパーアドミン — 全拠点・全クライアントの管理権限 */
  SUPER_ADMIN: 'R01',
  /** 拠点マネージャー — 各Flower Lab拠点の運営責任者 */
  SITE_MANAGER: 'R02',
  /** ジョブコーチ（JC） — メンバーの現場支援・日次ケア担当 */
  JOB_COACH: 'R03',
  /** メンバー — Flower Labで就労する障害のある従業員 */
  MEMBER: 'R04',
  /** クライアント人事担当者 — 導入企業の人事部門 */
  CLIENT_HR: 'R05',
  /** クライアント一般従業員 — ギフト受取者・サンクス通知の送信者 */
  CLIENT_EMPLOYEE: 'R06',
  /** 第三者監査者 — 社労士・労働局担当者 */
  AUDITOR: 'R07',
} as const;

export type RoleId = (typeof Role)[keyof typeof Role];

/** 管理者ロール（R01: スーパーアドミン, R02: 拠点マネージャー） */
export const ADMIN_ROLES: RoleId[] = [Role.SUPER_ADMIN, Role.SITE_MANAGER];

export const ROLE_LABELS: Record<RoleId, string> = {
  R01: 'QLIPスーパーアドミン',
  R02: '拠点マネージャー',
  R03: 'ジョブコーチ',
  R04: 'メンバー',
  R05: 'クライアント人事担当者',
  R06: 'クライアント一般従業員',
  R07: '第三者監査者',
};
