'use client';

import { useState } from 'react';
import {
  type HealthCheckData,
  type SubmitHealthCheckRequest,
  submitHealthCheck,
} from '../api';

/* ── Mood face SVG icons (1-5) ── */

function MoodIcon({ level, size = 40 }: { level: number; size?: number }) {
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
      <circle cx="14" cy="17" r="2" fill="currentColor" />
      <circle cx="26" cy="17" r="2" fill="currentColor" />
      {mouths[level]}
    </svg>
  );
}

/* ── Section wrapper ── */

function Section({
  icon,
  title,
  optional,
  gradient,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  optional?: boolean;
  gradient: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/60 p-5 shadow-sm ${gradient}`}
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/70 shadow-sm">
          {icon}
        </span>
        <h3 className="text-sm font-bold text-gray-800">{title}</h3>
        {optional && (
          <span className="ml-auto rounded-full bg-white/60 px-2 py-0.5 text-[10px] font-medium text-gray-400">
            任意
          </span>
        )}
      </div>
      {children}
    </div>
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
    <fieldset>
      <legend className="sr-only">{label}</legend>
      <div
        className="flex items-center justify-between gap-1.5"
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
              className={`flex min-h-[56px] flex-1 flex-col items-center justify-center rounded-xl border-2 px-1 py-2 transition-all duration-200 ${
                isSelected
                  ? 'scale-105 border-[#ffc000] bg-white text-[#ffc000] shadow-md shadow-[#ffc000]/20'
                  : 'border-transparent bg-white/60 text-gray-300 hover:border-gray-200 hover:text-gray-400'
              }`}
            >
              {renderIcon ? (
                renderIcon(level)
              ) : (
                <span className="text-lg font-bold">{level}</span>
              )}
              <span
                className={`mt-1 text-[10px] leading-tight ${isSelected ? 'font-semibold text-gray-700' : 'text-gray-400'}`}
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

/* ── Meal toggle button ── */

function MealToggle({
  label,
  icon,
  value,
  onChange,
}: {
  label: string;
  icon: string;
  value: boolean | null;
  onChange: (v: boolean | null) => void;
}) {
  return (
    <div className="flex-1">
      <p className="mb-2 text-center text-xs font-semibold text-gray-600">
        {icon} {label}
      </p>
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={() => onChange(value === true ? null : true)}
          className={`flex-1 rounded-xl border-2 px-2 py-2.5 text-xs font-semibold transition-all duration-200 ${
            value === true
              ? 'border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm'
              : 'border-transparent bg-white/60 text-gray-400 hover:border-gray-200'
          }`}
        >
          食べた
        </button>
        <button
          type="button"
          onClick={() => onChange(value === false ? null : false)}
          className={`flex-1 rounded-xl border-2 px-2 py-2.5 text-xs font-semibold transition-all duration-200 ${
            value === false
              ? 'border-orange-400 bg-orange-50 text-orange-700 shadow-sm'
              : 'border-transparent bg-white/60 text-gray-400 hover:border-gray-200'
          }`}
        >
          食べなかった
        </button>
      </div>
    </div>
  );
}

/* ── Sleep hours slider ── */

function SleepHoursSlider({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  const displayValue = value ?? 7;
  const ticks = [0, 3, 6, 9, 12];

  return (
    <div>
      <div className="mb-3 text-center">
        <span className="text-3xl font-bold text-indigo-600">
          {value != null ? displayValue.toFixed(1) : '--'}
        </span>
        <span className="ml-1 text-sm font-medium text-gray-500">時間</span>
      </div>
      <input
        type="range"
        min="0"
        max="12"
        step="0.5"
        value={displayValue}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-gradient-to-r from-indigo-200 via-indigo-300 to-indigo-400 accent-indigo-500 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 [&::-webkit-slider-thumb]:shadow-lg"
        aria-label="睡眠時間"
      />
      <div className="mt-1 flex justify-between px-0.5">
        {ticks.map((t) => (
          <span key={t} className="text-[10px] text-gray-400">
            {t}h
          </span>
        ))}
      </div>
    </div>
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
  const [bodyTemperature, setBodyTemperature] = useState(
    initialData?.bodyTemperature != null
      ? String(initialData.bodyTemperature)
      : '',
  );
  const [sleepHours, setSleepHours] = useState<number | null>(
    initialData?.sleepHours ?? null,
  );
  // mealDinner = 前夜の食事, mealBreakfast = 今朝の食事
  const [mealDinner, setMealDinner] = useState<boolean | null>(
    initialData?.mealDinner ?? null,
  );
  const [mealBreakfast, setMealBreakfast] = useState<boolean | null>(
    initialData?.mealBreakfast ?? null,
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
      const parsedTemp = parseFloat(bodyTemperature);
      const payload: SubmitHealthCheckRequest = {
        mood: mood!,
        sleep: sleep!,
        condition: condition!,
        ...(bodyTemperature && !isNaN(parsedTemp)
          ? { bodyTemperature: parsedTemp }
          : {}),
        ...(sleepHours != null ? { sleepHours } : {}),
        ...(mealBreakfast != null ? { mealBreakfast } : {}),
        ...(mealDinner != null ? { mealDinner } : {}),
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* ── Section 1: Mood / Sleep Quality / Condition ── */}
      <Section
        icon={
          <svg
            className="h-4 w-4 text-amber-500"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
          </svg>
        }
        title="今日のコンディション"
        gradient="bg-gradient-to-br from-amber-50/80 to-orange-50/60"
      >
        <div className="space-y-4">
          {/* Mood */}
          <div>
            <p className="mb-2 text-xs font-semibold text-gray-500">
              気分
            </p>
            <RatingGroup
              label="今日の気分"
              value={mood}
              onChange={setMood}
              labels={['とてもつらい', 'つらい', 'ふつう', 'よい', 'とてもよい']}
              renderIcon={(level) => <MoodIcon level={level} size={32} />}
            />
          </div>

          <div className="border-t border-white/80" />

          {/* Sleep Quality */}
          <div>
            <p className="mb-2 text-xs font-semibold text-gray-500">
              昨晩の睡眠
            </p>
            <RatingGroup
              label="昨晩の睡眠"
              value={sleep}
              onChange={setSleep}
              labels={[
                '眠れなかった',
                'あまり眠れず',
                'ふつう',
                'よく眠れた',
                'ぐっすり',
              ]}
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
          </div>

          <div className="border-t border-white/80" />

          {/* Condition */}
          <div>
            <p className="mb-2 text-xs font-semibold text-gray-500">
              体調
            </p>
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
          </div>
        </div>
      </Section>

      {/* ── Section 2: Sleep Hours ── */}
      <Section
        icon={
          <svg
            className="h-4 w-4 text-indigo-500"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z"
              clipRule="evenodd"
            />
          </svg>
        }
        title="睡眠時間"
        optional
        gradient="bg-gradient-to-br from-indigo-50/80 to-violet-50/60"
      >
        <SleepHoursSlider value={sleepHours} onChange={setSleepHours} />
      </Section>

      {/* ── Section 3: Meals ── */}
      <Section
        icon={
          <svg
            className="h-4 w-4 text-emerald-500"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M11.25 3v4.046a3 3 0 01-4.277 2.713L3.375 8.25 8.25 3h3zm1.5 0v4.046a3 3 0 004.277 2.713L20.625 8.25 15.75 3h-3zM1.5 12.75c0-.966.784-1.75 1.75-1.75h17.5c.966 0 1.75.784 1.75 1.75v.5A1.75 1.75 0 0120.75 15H3.25a1.75 1.75 0 01-1.75-1.75v-.5zM3 17.25a.75.75 0 01.75-.75h16.5a.75.75 0 01.75.75v.5c0 1.794-1.456 3.25-3.25 3.25H6.25A3.25 3.25 0 013 17.75v-.5z" />
          </svg>
        }
        title="食事"
        optional
        gradient="bg-gradient-to-br from-emerald-50/80 to-teal-50/60"
      >
        <div className="flex gap-4">
          <MealToggle
            label="前夜"
            icon="🌙"
            value={mealDinner}
            onChange={setMealDinner}
          />
          <MealToggle
            label="今朝"
            icon="☀️"
            value={mealBreakfast}
            onChange={setMealBreakfast}
          />
        </div>
      </Section>

      {/* ── Section 4: Body Temperature ── */}
      <Section
        icon={
          <svg
            className="h-4 w-4 text-rose-500"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12 2.25a.75.75 0 01.75.75v11.69l1.72-1.72a.75.75 0 111.06 1.06l-3 3a.75.75 0 01-1.06 0l-3-3a.75.75 0 111.06-1.06l1.72 1.72V3a.75.75 0 01.75-.75z"
              clipRule="evenodd"
            />
            <path d="M8.25 17.25a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0z" />
          </svg>
        }
        title="体温"
        optional
        gradient="bg-gradient-to-br from-rose-50/80 to-pink-50/60"
      >
        <div className="flex items-center gap-3">
          <input
            id="health-check-body-temp"
            type="number"
            step="0.1"
            min="35.0"
            max="42.0"
            placeholder="36.5"
            value={bodyTemperature}
            onChange={(e) => setBodyTemperature(e.target.value)}
            className="w-28 rounded-xl border-2 border-transparent bg-white/70 px-4 py-3 text-center text-lg font-semibold text-gray-900 placeholder:text-gray-300 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
          />
          <span className="text-sm font-medium text-gray-500">℃</span>
        </div>
      </Section>

      {/* ── Section 5: Note ── */}
      <Section
        icon={
          <svg
            className="h-4 w-4 text-sky-500"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.29 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.68-3.348 3.97a48.901 48.901 0 01-3.476.383.39.39 0 00-.297.17l-2.755 4.133a.75.75 0 01-1.248 0l-2.755-4.133a.39.39 0 00-.297-.17 48.9 48.9 0 01-3.476-.384c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H7.5z"
              clipRule="evenodd"
            />
          </svg>
        }
        title="ひとこと"
        optional
        gradient="bg-gradient-to-br from-sky-50/80 to-blue-50/60"
      >
        <textarea
          id="health-check-note"
          rows={2}
          placeholder="今日の気持ちをひとこと..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full rounded-xl border-2 border-transparent bg-white/70 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200"
        />
      </Section>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={!canSubmit || isSubmitting}
        className="w-full rounded-2xl bg-gradient-to-r from-[#ffc000] to-[#ffab00] px-6 py-4 text-base font-bold text-gray-900 shadow-lg shadow-[#ffc000]/30 transition-all duration-200 hover:from-[#ffab00] hover:to-[#ff9500] hover:shadow-xl hover:shadow-[#ffc000]/40 focus:outline-none focus:ring-2 focus:ring-[#ffc000]/50 focus:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="h-5 w-5 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                className="opacity-25"
              />
              <path
                d="M4 12a8 8 0 018-8"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                className="opacity-75"
              />
            </svg>
            送信中...
          </span>
        ) : isUpdate ? (
          '更新する'
        ) : (
          '記録する'
        )}
      </button>
    </form>
  );
}
