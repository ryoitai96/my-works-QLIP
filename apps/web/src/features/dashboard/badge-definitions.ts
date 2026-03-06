export interface BadgeDefinition {
  id: string;
  emoji: string;
  title: string;
  description: string;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  { id: 'first_task', emoji: '\u{1F389}', title: 'はじめてのおしごと', description: 'タスクを1回かんりょうしたよ！' },
  { id: 'attendance_streak_7', emoji: '\u{1F337}', title: '1しゅうかん連続出勤', description: '日報を7日れんぞくで書けたよ！' },
  { id: 'attendance_streak_30', emoji: '\u{1F33A}', title: '1ヶ月連続出勤', description: '日報を30日れんぞくで書けたよ！' },
  { id: 'health_report_10', emoji: '\u{1F33B}', title: '日報マスター', description: '日報を10回いじょう書けたよ！' },
  { id: 'health_report_50', emoji: '\u{1F33C}', title: '日報グランドマスター', description: '日報を50回いじょう書けたよ！' },
  { id: 'task_complete_10', emoji: '\u{1F4AA}', title: 'おしごと10回', description: 'タスクを10回かんりょうしたよ！' },
  { id: 'task_complete_50', emoji: '\u{1F3C6}', title: 'おしごと50回', description: 'タスクを50回かんりょうしたよ！' },
  { id: 'thanks_sent_5', emoji: '\u{1F339}', title: 'サンクス職人', description: 'サンクスカードを5まいおくったよ！' },
  { id: 'thanks_received_10', emoji: '\u{1F490}', title: 'チームのたいよう', description: 'サンクスカードを10まいもらったよ！' },
  { id: 'assessment_3', emoji: '\u{1F340}', title: 'アセスメントチャレンジ', description: 'アセスメントを3回かんりょうしたよ！' },
];

const BADGE_MAP = new Map(BADGE_DEFINITIONS.map((b) => [b.id, b]));

export function getBadgeDefinition(id: string): BadgeDefinition | undefined {
  return BADGE_MAP.get(id);
}

export const POINT_WEIGHTS = {
  healthReport: 10,
  taskComplete: 20,
  thanksSent: 15,
  thanksReceived: 15,
  assessment: 30,
} as const;
