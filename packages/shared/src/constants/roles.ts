/**
 * RBAC ロール定義
 * @see docs/SYSTEM_REQUIREMENTS.md セクション 3.1
 */
export const Role = {
  /** My WORKS管理者（スーパーアドミン） — 全拠点・全クライアントの管理権限 */
  SUPER_ADMIN: 'R01',
  /** 支援員（ジョブコーチ） — メンバーの現場支援・日次ケア担当 */
  JOB_COACH: 'R02',
  /** 障害者メンバー（ワーカー） — Flower Labで就労する障害のある従業員 */
  MEMBER: 'R03',
  /** クライアント企業 人事担当者 — 導入企業の人事部門 */
  CLIENT_HR: 'R04',
  /** クライアント企業 一般従業員（ギフト受取者） — サンクス通知の送信者 */
  CLIENT_EMPLOYEE: 'R05',
  /** 第三者監査者（社労士・労働局） */
  AUDITOR: 'R06',
} as const;

export type RoleId = (typeof Role)[keyof typeof Role];

/** 管理者ロール（R01: スーパーアドミン） — 管理パネル（企業管理・個人管理） */
export const ADMIN_ROLES: RoleId[] = [Role.SUPER_ADMIN];

/** MW運営スタッフロール（R01: スーパーアドミン, R02: 支援員） — ダッシュボード・メンバー管理 */
export const STAFF_ROLES: RoleId[] = [Role.SUPER_ADMIN, Role.JOB_COACH];

/** メンバーロール（R03: 障害者メンバー） — 制作管理 */
export const MEMBER_ROLES: RoleId[] = [Role.MEMBER];

/** クライアントロール（R04: 企業人事, R05: 企業一般社員） */
export const CLIENT_ROLES: RoleId[] = [Role.CLIENT_HR, Role.CLIENT_EMPLOYEE];

export const ROLE_LABELS: Record<RoleId, string> = {
  R01: 'MW管理者',
  R02: 'MW支援員',
  R03: '障害者',
  R04: '人事担当',
  R05: '従業員',
  R06: '第三者監査者',
};
