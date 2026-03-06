'use client';

import { type AlertMember } from '../api';
import { MemberAvatar } from '../../../components/member-avatar';

const STATUS_BADGE = {
  warning: { bg: 'bg-red-100', text: 'text-red-700', label: '要対応' },
  caution: { bg: 'bg-amber-100', text: 'text-amber-700', label: '注意' },
  not_submitted: { bg: 'bg-gray-100', text: 'text-gray-600', label: '未入力' },
  good: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: '良好' },
};

interface AlertListProps {
  alerts: AlertMember[];
  onSetManualAlert?: (member: AlertMember) => void;
}

export function AlertList({ alerts, onSetManualAlert }: AlertListProps) {
  if (alerts.length === 0) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center">
        <p className="text-sm font-medium text-emerald-700">
          現在アラートはありません。全メンバー良好です。
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => {
        const badge = STATUS_BADGE[alert.status];
        return (
          <div
            key={alert.memberId}
            className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <MemberAvatar avatarId={alert.avatarId} size="md" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-gray-900">
                  {alert.name}
                </h4>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${badge.bg} ${badge.text}`}
                >
                  {badge.label}
                </span>
                <span className="text-[11px] text-gray-400">
                  {alert.siteName}
                </span>
              </div>

              {/* Alert reasons */}
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {alert.alertReasons.map((reason, i) => (
                  <span
                    key={i}
                    className="rounded-md bg-gray-100 px-2 py-0.5 text-[11px] text-gray-600"
                  >
                    {reason}
                  </span>
                ))}
              </div>

              {/* Recommended actions */}
              {alert.recommendedActions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {alert.recommendedActions.map((action, i) => (
                    <button
                      key={i}
                      className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-[12px] font-medium text-blue-700 transition-colors hover:bg-blue-100"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Manual alert button */}
            <button
              onClick={() => onSetManualAlert?.(alert)}
              className="shrink-0 rounded-lg border border-gray-200 px-3 py-1.5 text-[12px] font-medium text-gray-600 transition-colors hover:bg-gray-50"
              title="手動アラート設定"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </button>
          </div>
        );
      })}
    </div>
  );
}
