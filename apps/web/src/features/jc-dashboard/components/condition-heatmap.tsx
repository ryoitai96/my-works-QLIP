'use client';

import { type TeamMemberOverview } from '../api';
import { MemberAvatar } from '../../../components/member-avatar';

const STATUS_CONFIG = {
  good: { bg: 'bg-emerald-50', border: 'border-emerald-200', dot: 'bg-emerald-500', label: '良好' },
  caution: { bg: 'bg-amber-50', border: 'border-amber-200', dot: 'bg-amber-500', label: '注意' },
  warning: { bg: 'bg-red-50', border: 'border-red-200', dot: 'bg-red-500', label: '要対応' },
  not_submitted: { bg: 'bg-gray-50', border: 'border-gray-200', dot: 'bg-gray-400', label: '未入力' },
};

interface ConditionHeatmapProps {
  members: TeamMemberOverview[];
  onMemberClick?: (member: TeamMemberOverview) => void;
}

export function ConditionHeatmap({ members, onMemberClick }: ConditionHeatmapProps) {
  const counts = {
    good: members.filter((m) => m.status === 'good').length,
    caution: members.filter((m) => m.status === 'caution').length,
    warning: members.filter((m) => m.status === 'warning').length,
    not_submitted: members.filter((m) => m.status === 'not_submitted').length,
  };

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex gap-4 text-sm">
        {(Object.keys(counts) as Array<keyof typeof counts>).map((key) => {
          const config = STATUS_CONFIG[key];
          return (
            <div key={key} className="flex items-center gap-1.5">
              <span className={`inline-block h-2.5 w-2.5 rounded-full ${config.dot}`} />
              <span className="text-gray-600">{config.label}</span>
              <span className="font-semibold text-gray-900">{counts[key]}</span>
            </div>
          );
        })}
      </div>

      {/* Member cards grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {members.map((member) => {
          const config = STATUS_CONFIG[member.status];
          return (
            <button
              key={member.memberId}
              onClick={() => onMemberClick?.(member)}
              className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition-all hover:shadow-md ${config.bg} ${config.border}`}
            >
              <div className="relative">
                <MemberAvatar avatarId={member.avatarId} size="md" />
                <span
                  className={`absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white ${config.dot}`}
                />
              </div>
              <div className="w-full text-center">
                <p className="truncate text-xs font-semibold text-gray-900">
                  {member.name}
                </p>
                {member.vitalScore ? (
                  <div className="mt-1 flex items-center justify-center gap-1 text-[11px] text-gray-500">
                    <span>
                      {member.vitalScore.mood}/{member.vitalScore.sleep}/{member.vitalScore.condition}
                    </span>
                    {member.vitalScore.streakDays >= 3 && (
                      <span className="text-orange-500" title={`${member.vitalScore.streakDays}日連続`}>
                        {member.vitalScore.streakDays}d
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="mt-1 text-[11px] text-gray-400">--</p>
                )}
                {member.alertLevel && (
                  <span className="mt-1 inline-block rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700">
                    {member.alertLevel}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
