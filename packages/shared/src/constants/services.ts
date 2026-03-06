/**
 * テナント別サービストグル定義
 */
export const TenantService = {
  ATTENDANCE: 'attendance',
  HEALTH_CHECK: 'health_check',
  ASSESSMENT: 'assessment',
  MICRO_TASK: 'micro_task',
  MESSAGE: 'message',
  THANKS: 'thanks',
  FLOWER_ORDER: 'flower_order',
  SOS: 'sos',
} as const;

export type TenantServiceKey = (typeof TenantService)[keyof typeof TenantService];

export const TENANT_SERVICE_LABELS: Record<TenantServiceKey, string> = {
  attendance: '勤怠管理',
  health_check: '体調入力',
  assessment: 'アセスメント',
  micro_task: 'マイクロタスク',
  message: 'メッセージ',
  thanks: 'サンクスカード',
  flower_order: 'フラワーギフト',
  sos: 'SOS通報',
};

export const TENANT_SERVICE_KEYS: TenantServiceKey[] = Object.values(TenantService);

export const DEFAULT_TENANT_SERVICES: Record<TenantServiceKey, boolean> = {
  attendance: true,
  health_check: true,
  assessment: true,
  micro_task: true,
  message: true,
  thanks: true,
  flower_order: true,
  sos: true,
};
