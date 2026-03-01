'use client';

import { useState } from 'react';
import {
  type HealthCheckData,
  type SubmitHealthCheckRequest,
  submitHealthCheck,
} from '../api';

/* ── Mood face SVG icons (1-5) ── */

function MoodIcon({ level, size = 40 }: { level: number; size?: number }) {
  // Mouth paths for each mood level
  const mouths: Record<number, React.ReactNode> = {
    1: (
      <path
        d="M13 28c2-3 5-4.5 7-4.5s5 1.5 7 4.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    ),
    2: (
      <path
        d="M14 27c1.5-1.5 3.5-2.5 6-2.5s4.5 1 6 2.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    ),
    3: (
      <line
        x1="14"
        y1="26"
        x2="26"
        y2="26"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    ),
    4: (
      <path
        d="M14 25c1.5 1.5 3.5 2.5 6 2.5s4.5-1 6-2.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    ),
    5: (
      <path
        d="M13 24c2 3 5 4.5 7 4.5s5-1.5 7-4.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="20" cy="20" r="18" fill="currentColor" opacity="0.15" />
      {/* Eyes */}
      <circle cx="14" cy="17" r="2" fill="currentColor" />
      <circle cx="26" cy="17" r="2" fill="currentColor" />
      {mouths[level]}
    </svg>
  );
}

/* ── Rating button group ── */

interface RatingGroupProps {
  label: string;
  value: number | null;
  onChange: (v: number) => void;
  labels: string[];
  renderIcon?: (level: number) => React.ReactNode;
}

function RatingGroup({
  label,
  value,
  onChange,
  labels,
  renderIcon,
}: RatingGroupProps) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-semibold text-gray-700">{label}</legend>
      <div
        className="flex items-center justify-between gap-1"
        role="radiogroup"
        aria-label={label}
      >
        {[1, 2, 3, 4, 5].map((level) => {
          const isSelected = value === level;
          return (
            <button
              key={level}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={labels[level - 1]}
              onClick={() => onChange(level)}
              className={`flex min-h-[52px] flex-1 flex-col items-center justify-center rounded-xl border-2 px-1 py-2 transition-all ${
                isSelected
                  ? 'border-[#ffc000] bg-[#ffc000]/10 text-[#ffc000]'
                  : 'border-gray-200 bg-white text-gray-300 hover:border-gray-300 hover:text-gray-400'
              }`}
            >
              {renderIcon ? (
                renderIcon(level)
              ) : (
                <span className="text-lg font-bold">{level}</span>
              )}
              <span
                className={`mt-1 text-[10px] leading-tight ${isSelected ? 'text-gray-700' : 'text-gray-400'}`}
              >
                {labels[level - 1]}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/* ── Main Form ── */

interface HealthCheckFormProps {
  initialData: HealthCheckData | null;
  onSubmitSuccess: (data: HealthCheckData & { isUpdate: boolean }) => void;
}

export function HealthCheckForm({
  initialData,
  onSubmitSuccess,
}: HealthCheckFormProps) {
  const [mood, setMood] = useState<number | null>(initialData?.mood ?? null);
  const [sleep, setSleep] = useState<number | null>(initialData?.sleep ?? null);
  const [condition, setCondition] = useState<number | null>(
    initialData?.condition ?? null,
  );
  const [note, setNote] = useState(initialData?.note ?? '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isUpdate = initialData !== null;
  const canSubmit = mood !== null && sleep !== null && condition !== null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError('');

    try {
      const payload: SubmitHealthCheckRequest = {
        mood: mood!,
        sleep: sleep!,
        condition: condition!,
        ...(note.trim() ? { note: note.trim() } : {}),
      };
      const result = await submitHealthCheck(payload);
      onSubmitSuccess(result);
    } catch {
      setError('送信に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Mood */}
      <RatingGroup
        label="今日の気分"
        value={mood}
        onChange={setMood}
        labels={['とてもつらい', 'つらい', 'ふつう', 'よい', 'とてもよい']}
        renderIcon={(level) => <MoodIcon level={level} size={32} />}
      />

      {/* Sleep */}
      <RatingGroup
        label="昨晩の睡眠"
        value={sleep}
        onChange={setSleep}
        labels={['眠れなかった', 'あまり眠れず', 'ふつう', 'よく眠れた', 'ぐっすり']}
        renderIcon={(level) => (
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M21.752 15.002A9.718 9.718 0 0112.478 3c-.37 0-.738.02-1.103.058a9.72 9.72 0 008.377 11.944z"
              fill="currentColor"
              opacity={0.15 + level * 0.17}
            />
            <path
              d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      />

      {/* Condition */}
      <RatingGroup
        label="体調"
        value={condition}
        onChange={setCondition}
        labels={['つらい', 'やや不調', 'ふつう', 'まあまあ', '元気']}
        renderIcon={(level) => (
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              fill="currentColor"
              opacity={0.15 + level * 0.17}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      />

      {/* Note */}
      <div className="space-y-2">
        <label
          htmlFor="health-check-note"
          className="text-sm font-semibold text-gray-700"
        >
          ひとこと
          <span className="ml-1 text-xs font-normal text-gray-400">
            （任意）
          </span>
        </label>
        <textarea
          id="health-check-note"
          rows={2}
          placeholder="今日の気持ちをひとこと..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#ffc000] focus:outline-none focus:ring-2 focus:ring-[#ffc000]/30"
        />
      </div>

      {/* Error */}
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit || isSubmitting}
        className="w-full rounded-xl bg-[#ffc000] px-6 py-3.5 text-base font-semibold text-gray-900 transition-colors hover:bg-[#e6ad00] focus:outline-none focus:ring-2 focus:ring-[#ffc000]/50 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting
          ? '送信中...'
          : isUpdate
            ? '更新する'
            : '記録する'}
      </button>
    </form>
  );
}
