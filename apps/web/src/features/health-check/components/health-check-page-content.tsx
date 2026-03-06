'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiClientError } from '../../../lib/api-client';
import { authStore } from '../../auth/auth-store';
import { type HealthCheckData, fetchTodayHealthCheck } from '../api';
import { HealthCheckForm } from './health-check-form';

/* ── Flower bloom animation (CSS-only SVG) ── */

function FlowerBloomAnimation() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          className="animate-bloom"
          aria-hidden="true"
        >
          {/* Petals */}
          {[0, 60, 120, 180, 240, 300].map((angle) => (
            <ellipse
              key={angle}
              cx="60"
              cy="30"
              rx="14"
              ry="24"
              fill="#ffc000"
              opacity="0.85"
              transform={`rotate(${angle} 60 60)`}
            />
          ))}
          {/* Center */}
          <circle cx="60" cy="60" r="14" fill="#ff9500" />
          <circle cx="60" cy="60" r="8" fill="#ffab00" />
          {/* Stem */}
          <line x1="60" y1="84" x2="60" y2="115" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" />
          {/* Leaves */}
          <ellipse cx="52" cy="98" rx="8" ry="4" fill="#4ade80" transform="rotate(-30 52 98)" />
          <ellipse cx="68" cy="104" rx="8" ry="4" fill="#4ade80" transform="rotate(30 68 104)" />
        </svg>
        <p className="text-lg font-bold text-gray-800">記録できました!</p>
        <p className="text-sm text-gray-500">タスク一覧へ移動します...</p>
      </div>

      <style>{`
        @keyframes bloom {
          0% {
            transform: scale(0) rotate(-30deg);
            opacity: 0;
          }
          60% {
            transform: scale(1.15) rotate(5deg);
            opacity: 1;
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }
        .animate-bloom {
          animation: bloom 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </div>
  );
}

/* ── Label helpers for summary ── */

const MOOD_LABELS = ['', 'とてもつらい', 'つらい', 'ふつう', 'よい', 'とてもよい'];
const SLEEP_LABELS = ['', '眠れなかった', 'あまり眠れず', 'ふつう', 'よく眠れた', 'ぐっすり'];
const CONDITION_LABELS = ['', 'つらい', 'やや不調', 'ふつう', 'まあまあ', '元気'];
const APPETITE_LABELS: Record<string, string> = { good: 'ある', normal: 'ふつう', none: 'ない' };
const MED_LABELS: Record<string, string> = { taken: '飲んだ', not_taken: '飲み忘れた', not_applicable: '該当なし' };
const PRN_EFFECT_LABELS: Record<string, string> = { effective: '効いた', not_effective: '効かなかった', unknown: 'わからない' };

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="shrink-0 text-xs font-semibold text-gray-500">{label}</span>
      <span className="text-right text-sm font-medium text-gray-800">{value}</span>
    </div>
  );
}

function HealthCheckSummary({
  data,
  onEdit,
}: {
  data: HealthCheckData;
  onEdit: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Condition & Mood */}
      <div className="rounded-2xl border border-white/60 bg-gradient-to-br from-amber-50/80 to-orange-50/60 p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-bold text-gray-800">体調・気分</h3>
        <div className="divide-y divide-white/80">
          <SummaryRow label="気分" value={`${MOOD_LABELS[data.mood]} (${data.mood}/5)`} />
          {data.moodComment && <SummaryRow label="気分コメント" value={data.moodComment} />}
          <SummaryRow label="体調" value={`${CONDITION_LABELS[data.condition]} (${data.condition}/5)`} />
          {data.conditionComment && <SummaryRow label="体調コメント" value={data.conditionComment} />}
          {data.bodyTemperature != null && <SummaryRow label="体温" value={`${data.bodyTemperature} ℃`} />}
        </div>
      </div>

      {/* Sleep */}
      <div className="rounded-2xl border border-white/60 bg-gradient-to-br from-indigo-50/80 to-violet-50/60 p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-bold text-gray-800">睡眠</h3>
        <div className="divide-y divide-white/80">
          <SummaryRow label="睡眠の質" value={`${SLEEP_LABELS[data.sleep]} (${data.sleep}/5)`} />
          {data.bedTime && data.wakeTime && (
            <SummaryRow label="就寝 → 起床" value={`${data.bedTime} → ${data.wakeTime}`} />
          )}
          {data.sleepHours != null && <SummaryRow label="睡眠時間" value={`${data.sleepHours.toFixed(1)} 時間`} />}
        </div>
      </div>

      {/* Meals & Medication */}
      <div className="rounded-2xl border border-white/60 bg-gradient-to-br from-emerald-50/80 to-teal-50/60 p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-bold text-gray-800">食事・服薬</h3>
        <div className="divide-y divide-white/80">
          {data.mealDinner != null && <SummaryRow label="前夜の夕食" value={data.mealDinner ? '食べた' : '食べなかった'} />}
          {data.mealBreakfast != null && <SummaryRow label="今朝の朝食" value={data.mealBreakfast ? '食べた' : '食べなかった'} />}
          {data.appetite && <SummaryRow label="食欲" value={APPETITE_LABELS[data.appetite] ?? data.appetite} />}
          {data.medicationTaken && <SummaryRow label="今朝の服薬" value={MED_LABELS[data.medicationTaken] ?? data.medicationTaken} />}
          {data.medicationNote && <SummaryRow label="服薬備考" value={data.medicationNote} />}
          {data.prnMedicationUsed != null && (
            <SummaryRow label="前日の頓服" value={data.prnMedicationUsed ? '使用した' : '使用していない'} />
          )}
          {data.prnMedicationUsed && data.prnMedicationEffect && (
            <SummaryRow label="頓服の効果" value={PRN_EFFECT_LABELS[data.prnMedicationEffect] ?? data.prnMedicationEffect} />
          )}
        </div>
      </div>

      {/* Note */}
      {data.note && (
        <div className="rounded-2xl border border-white/60 bg-gradient-to-br from-sky-50/80 to-blue-50/60 p-5 shadow-sm">
          <h3 className="mb-2 text-sm font-bold text-gray-800">ひとこと</h3>
          <p className="text-sm text-gray-700">{data.note}</p>
        </div>
      )}

      {/* Edit button */}
      <button
        type="button"
        onClick={onEdit}
        className="w-full rounded-2xl border-2 border-gray-200 bg-white px-6 py-4 text-base font-bold text-gray-600 transition-all duration-200 hover:border-gray-300 hover:text-gray-800 active:scale-[0.98]"
      >
        修正する
      </button>
    </div>
  );
}

export function HealthCheckPageContent() {
  const router = useRouter();
  const [initialData, setInitialData] = useState<HealthCheckData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [streakDays, setStreakDays] = useState(0);
  const [showFlowerAnimation, setShowFlowerAnimation] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const loadToday = useCallback(async () => {
    if (!authStore.isAuthenticated()) {
      router.replace('/login');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await fetchTodayHealthCheck();
      setInitialData(data);
      if (data) {
        setStreakDays(data.streakDays);
      }
    } catch (err) {
      if (err instanceof ApiClientError && err.statusCode === 401) {
        authStore.removeToken();
        router.replace('/login');
        return;
      }
      setError('データの取得に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadToday();
  }, [loadToday]);

  const handleSubmitSuccess = (
    result: HealthCheckData & { isUpdate: boolean },
  ) => {
    setInitialData(result);
    setStreakDays(result.streakDays);

    if (result.isUpdate) {
      setShowForm(false);
      setSuccessMessage('体調を更新しました!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      // First submission: show flower animation then navigate
      setShowFlowerAnimation(true);
      setTimeout(() => {
        router.push('/micro-tasks');
      }, 2000);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-20 animate-pulse rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50" />
        <div className="h-72 animate-pulse rounded-2xl bg-gray-50" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 p-8 text-center">
        <svg
          className="mx-auto mb-3 h-10 w-10 text-red-300"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-sm font-medium text-red-700">{error}</p>
        <button
          onClick={loadToday}
          className="mt-4 rounded-xl bg-red-100 px-5 py-2 text-sm font-semibold text-red-700 transition-colors hover:bg-red-200"
        >
          再読み込み
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Flower animation overlay */}
      {showFlowerAnimation && <FlowerBloomAnimation />}

      {/* Header with greeting */}
      <div className="text-center">
        <h2 className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-xl font-bold text-transparent">
          {initialData && !showForm ? '今日の記録' : '今日の体調を記録しましょう'}
        </h2>
        <p className="mt-1 text-xs text-gray-400">
          {initialData && !showForm
            ? '本日の体調は記録済みです'
            : '毎日の記録があなたの健康管理に役立ちます'}
        </p>
      </div>

      {/* Streak badge */}
      {streakDays > 0 && (
        <div className="relative overflow-hidden rounded-2xl border border-[#ffc000]/20 bg-gradient-to-r from-[#ffc000]/10 via-amber-50 to-orange-50 px-5 py-4">
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#ffc000] to-orange-400 shadow-lg shadow-[#ffc000]/30">
              <svg
                className="h-5 w-5 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177A7.547 7.547 0 016.648 6.61a.75.75 0 00-1.152.082A9 9 0 009.6 19.9a8.993 8.993 0 004.32-.648.75.75 0 00.07-1.313 4.493 4.493 0 01-1.695-2.29 5.066 5.066 0 012.347-1.46.75.75 0 00.332-1.14A10.2 10.2 0 0112.963 2.286z" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">
                <span className="text-2xl text-[#ffc000]">{streakDays}</span>
                <span className="ml-1 text-sm">日連続</span>
              </p>
              <p className="text-[10px] text-gray-500">
                継続は力なり!
              </p>
            </div>
          </div>
          {/* Decorative circles */}
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-[#ffc000]/10" />
          <div className="absolute -bottom-2 -left-2 h-10 w-10 rounded-full bg-orange-200/20" />
        </div>
      )}

      {/* Success toast */}
      {successMessage && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 px-5 py-3.5 shadow-sm">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100">
            <svg
              className="h-4 w-4 text-emerald-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
          <span className="text-sm font-semibold text-emerald-700">
            {successMessage}
          </span>
        </div>
      )}

      {/* Summary or Form */}
      {initialData && !showForm ? (
        <HealthCheckSummary
          data={initialData}
          onEdit={() => setShowForm(true)}
        />
      ) : (
        <HealthCheckForm
          key={initialData?.id ?? 'new'}
          initialData={initialData}
          onSubmitSuccess={handleSubmitSuccess}
        />
      )}
    </div>
  );
}
