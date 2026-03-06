'use client';

import { useState, useEffect } from 'react';
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

/* ── Three-option toggle ── */

function ThreeOptionToggle({
  value,
  onChange,
  options,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
  options: { value: string; label: string; activeClass: string }[];
}) {
  return (
    <div className="flex gap-1.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(value === opt.value ? null : opt.value)}
          className={`flex-1 rounded-xl border-2 px-2 py-2.5 text-xs font-semibold transition-all duration-200 ${
            value === opt.value
              ? opt.activeClass
              : 'border-transparent bg-white/60 text-gray-400 hover:border-gray-200'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* ── Progress bar ── */

const STEP_LABELS = ['体調・気分', '睡眠', '食事・服薬'];

function StepProgressBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between">
        {STEP_LABELS.map((label, i) => {
          const step = i + 1;
          const isActive = step === currentStep;
          const isCompleted = step < currentStep;
          return (
            <div key={step} className="flex items-center gap-1.5">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                  isActive
                    ? 'bg-[#ffc000] text-white shadow-md shadow-[#ffc000]/30'
                    : isCompleted
                      ? 'bg-[#ffc000]/80 text-white'
                      : 'bg-gray-200 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  step
                )}
              </div>
              <span
                className={`text-[11px] font-semibold ${
                  isActive ? 'text-gray-800' : isCompleted ? 'text-gray-500' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-[#ffc000] transition-all duration-500 ease-out"
          style={{ width: `${(currentStep / 3) * 100}%` }}
        />
      </div>
    </div>
  );
}

/* ── Input style helper ── */

const inputClass =
  'w-full rounded-xl border-2 border-transparent bg-white/70 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-200';

/* ── Main Form ── */

interface HealthCheckFormProps {
  initialData: HealthCheckData | null;
  onSubmitSuccess: (data: HealthCheckData & { isUpdate: boolean }) => void;
}

export function HealthCheckForm({
  initialData,
  onSubmitSuccess,
}: HealthCheckFormProps) {
  const [step, setStep] = useState(1);

  // Step 1: Mood / Condition
  const [mood, setMood] = useState<number | null>(initialData?.mood ?? null);
  const [moodComment, setMoodComment] = useState(initialData?.moodComment ?? '');
  const [condition, setCondition] = useState<number | null>(initialData?.condition ?? null);
  const [conditionComment, setConditionComment] = useState(initialData?.conditionComment ?? '');
  const [bodyTemperature, setBodyTemperature] = useState(
    initialData?.bodyTemperature != null ? String(initialData.bodyTemperature) : '',
  );

  // Step 2: Sleep
  const [sleep, setSleep] = useState<number | null>(initialData?.sleep ?? null);
  const [bedTime, setBedTime] = useState(initialData?.bedTime ?? '');
  const [wakeTime, setWakeTime] = useState(initialData?.wakeTime ?? '');
  const [sleepHours, setSleepHours] = useState<number | null>(initialData?.sleepHours ?? null);

  // Step 3: Meal / Medication
  const [mealDinner, setMealDinner] = useState<boolean | null>(initialData?.mealDinner ?? null);
  const [mealBreakfast, setMealBreakfast] = useState<boolean | null>(initialData?.mealBreakfast ?? null);
  const [appetite, setAppetite] = useState<string | null>(initialData?.appetite ?? null);
  const [medicationTaken, setMedicationTaken] = useState<string | null>(initialData?.medicationTaken ?? null);
  const [medicationNote, setMedicationNote] = useState(initialData?.medicationNote ?? '');
  const [prnMedicationUsed, setPrnMedicationUsed] = useState<boolean | null>(initialData?.prnMedicationUsed ?? null);
  const [prnMedicationEffect, setPrnMedicationEffect] = useState<string | null>(initialData?.prnMedicationEffect ?? null);
  const [note, setNote] = useState(initialData?.note ?? '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isUpdate = initialData !== null;

  // Auto-calculate sleep hours from bedTime/wakeTime
  useEffect(() => {
    if (bedTime && wakeTime) {
      const [bh, bm] = bedTime.split(':').map(Number);
      const [wh, wm] = wakeTime.split(':').map(Number);
      let bedMinutes = bh * 60 + bm;
      const wakeMinutes = wh * 60 + wm;
      // If bedTime > wakeTime, assume crossing midnight
      if (bedMinutes > wakeMinutes) {
        bedMinutes -= 24 * 60;
      }
      const diff = (wakeMinutes - bedMinutes) / 60;
      if (diff >= 0 && diff <= 24) {
        setSleepHours(Math.round(diff * 2) / 2); // Round to 0.5
      }
    }
  }, [bedTime, wakeTime]);

  // Step validation
  const canProceedStep1 = mood !== null && condition !== null;
  const canProceedStep2 = sleep !== null;

  const handleSubmit = async () => {
    if (!canProceedStep1 || !canProceedStep2) return;

    setIsSubmitting(true);
    setError('');

    try {
      const parsedTemp = parseFloat(bodyTemperature);
      const payload: SubmitHealthCheckRequest = {
        mood: mood!,
        sleep: sleep!,
        condition: condition!,
        ...(bodyTemperature && !isNaN(parsedTemp) ? { bodyTemperature: parsedTemp } : {}),
        ...(sleepHours != null ? { sleepHours } : {}),
        ...(mealBreakfast != null ? { mealBreakfast } : {}),
        ...(mealDinner != null ? { mealDinner } : {}),
        ...(moodComment.trim() ? { moodComment: moodComment.trim() } : {}),
        ...(conditionComment.trim() ? { conditionComment: conditionComment.trim() } : {}),
        ...(bedTime ? { bedTime } : {}),
        ...(wakeTime ? { wakeTime } : {}),
        ...(appetite ? { appetite } : {}),
        ...(medicationTaken ? { medicationTaken } : {}),
        ...(medicationNote.trim() ? { medicationNote: medicationNote.trim() } : {}),
        ...(prnMedicationUsed != null ? { prnMedicationUsed } : {}),
        ...(prnMedicationEffect ? { prnMedicationEffect } : {}),
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
    <div>
      <StepProgressBar currentStep={step} />

      {/* ── Step 1: Mood & Condition ── */}
      {step === 1 && (
        <div className="space-y-4">
          <Section
            icon={
              <svg className="h-4 w-4 text-amber-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
              </svg>
            }
            title="体調・気分"
            gradient="bg-gradient-to-br from-amber-50/80 to-orange-50/60"
          >
            <div className="space-y-4">
              {/* Mood */}
              <div>
                <p className="mb-2 text-xs font-semibold text-gray-500">気分</p>
                <RatingGroup
                  label="今日の気分"
                  value={mood}
                  onChange={setMood}
                  labels={['とてもつらい', 'つらい', 'ふつう', 'よい', 'とてもよい']}
                  renderIcon={(level) => <MoodIcon level={level} size={32} />}
                />
                <input
                  type="text"
                  placeholder="気分についてひとこと（任意）"
                  value={moodComment}
                  onChange={(e) => setMoodComment(e.target.value)}
                  className={`mt-2 ${inputClass}`}
                />
              </div>

              <div className="border-t border-white/80" />

              {/* Condition */}
              <div>
                <p className="mb-2 text-xs font-semibold text-gray-500">体調</p>
                <RatingGroup
                  label="体調"
                  value={condition}
                  onChange={setCondition}
                  labels={['つらい', 'やや不調', 'ふつう', 'まあまあ', '元気']}
                  renderIcon={(level) => (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
                <input
                  type="text"
                  placeholder="体調についてひとこと（任意）"
                  value={conditionComment}
                  onChange={(e) => setConditionComment(e.target.value)}
                  className={`mt-2 ${inputClass}`}
                />
              </div>

              <div className="border-t border-white/80" />

              {/* Body Temperature */}
              <div>
                <p className="mb-2 text-xs font-semibold text-gray-500">
                  体温 <span className="font-normal text-gray-400">（任意）</span>
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="0.1"
                    min="35.0"
                    max="42.0"
                    placeholder="36.5"
                    value={bodyTemperature}
                    onChange={(e) => setBodyTemperature(e.target.value)}
                    className="w-28 rounded-xl border-2 border-transparent bg-white/70 px-4 py-3 text-center text-lg font-semibold text-gray-900 placeholder:text-gray-300 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
                  />
                  <span className="text-sm font-medium text-gray-500">&#8451;</span>
                </div>
              </div>
            </div>
          </Section>

          <button
            type="button"
            disabled={!canProceedStep1}
            onClick={() => setStep(2)}
            className="w-full rounded-2xl bg-gradient-to-r from-[#ffc000] to-[#ffab00] px-6 py-4 text-base font-bold text-gray-900 shadow-lg shadow-[#ffc000]/30 transition-all duration-200 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
          >
            次へ
          </button>
        </div>
      )}

      {/* ── Step 2: Sleep ── */}
      {step === 2 && (
        <div className="space-y-4">
          <Section
            icon={
              <svg className="h-4 w-4 text-indigo-500" viewBox="0 0 24 24" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z"
                  clipRule="evenodd"
                />
              </svg>
            }
            title="睡眠"
            gradient="bg-gradient-to-br from-indigo-50/80 to-violet-50/60"
          >
            <div className="space-y-4">
              {/* Sleep Quality */}
              <div>
                <p className="mb-2 text-xs font-semibold text-gray-500">昨晩の睡眠</p>
                <RatingGroup
                  label="昨晩の睡眠"
                  value={sleep}
                  onChange={setSleep}
                  labels={['眠れなかった', 'あまり眠れず', 'ふつう', 'よく眠れた', 'ぐっすり']}
                  renderIcon={(level) => (
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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

              {/* Bed/Wake Time */}
              <div>
                <p className="mb-2 text-xs font-semibold text-gray-500">
                  就寝・起床時間 <span className="font-normal text-gray-400">（任意）</span>
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="mb-1 block text-[11px] text-gray-500">就寝</label>
                    <input
                      type="time"
                      value={bedTime}
                      onChange={(e) => setBedTime(e.target.value)}
                      className="w-full rounded-xl border-2 border-transparent bg-white/70 px-3 py-2.5 text-sm font-semibold text-gray-900 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <span className="mt-5 text-gray-400">→</span>
                  <div className="flex-1">
                    <label className="mb-1 block text-[11px] text-gray-500">起床</label>
                    <input
                      type="time"
                      value={wakeTime}
                      onChange={(e) => setWakeTime(e.target.value)}
                      className="w-full rounded-xl border-2 border-transparent bg-white/70 px-3 py-2.5 text-sm font-semibold text-gray-900 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-white/80" />

              {/* Sleep Hours (read-only, auto-calculated) */}
              <div>
                <p className="mb-2 text-xs font-semibold text-gray-500">
                  睡眠時間 <span className="font-normal text-gray-400">（自動計算）</span>
                </p>
                {sleepHours != null ? (
                  <div className="flex items-baseline gap-1 rounded-xl bg-white/70 px-4 py-3">
                    <span className="text-3xl font-bold text-indigo-600">
                      {sleepHours.toFixed(1)}
                    </span>
                    <span className="text-sm font-medium text-gray-500">時間</span>
                  </div>
                ) : (
                  <p className="rounded-xl bg-white/40 px-4 py-3 text-sm text-gray-400">
                    就寝・起床時間を入力すると自動計算されます
                  </p>
                )}
              </div>
            </div>
          </Section>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 rounded-2xl border-2 border-gray-200 bg-white px-6 py-4 text-base font-bold text-gray-500 transition-all duration-200 hover:border-gray-300 hover:text-gray-700 active:scale-[0.98]"
            >
              戻る
            </button>
            <button
              type="button"
              disabled={!canProceedStep2}
              onClick={() => setStep(3)}
              className="flex-1 rounded-2xl bg-gradient-to-r from-[#ffc000] to-[#ffab00] px-6 py-4 text-base font-bold text-gray-900 shadow-lg shadow-[#ffc000]/30 transition-all duration-200 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              次へ
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Meals & Medication ── */}
      {step === 3 && (
        <div className="space-y-4">
          {/* Meals */}
          <Section
            icon={
              <svg className="h-4 w-4 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.25 3v4.046a3 3 0 01-4.277 2.713L3.375 8.25 8.25 3h3zm1.5 0v4.046a3 3 0 004.277 2.713L20.625 8.25 15.75 3h-3zM1.5 12.75c0-.966.784-1.75 1.75-1.75h17.5c.966 0 1.75.784 1.75 1.75v.5A1.75 1.75 0 0120.75 15H3.25a1.75 1.75 0 01-1.75-1.75v-.5zM3 17.25a.75.75 0 01.75-.75h16.5a.75.75 0 01.75.75v.5c0 1.794-1.456 3.25-3.25 3.25H6.25A3.25 3.25 0 013 17.75v-.5z" />
              </svg>
            }
            title="食事"
            optional
            gradient="bg-gradient-to-br from-emerald-50/80 to-teal-50/60"
          >
            <div className="space-y-4">
              <div className="flex gap-4">
                <MealToggle label="前夜" icon="🌙" value={mealDinner} onChange={setMealDinner} />
                <MealToggle label="今朝" icon="☀️" value={mealBreakfast} onChange={setMealBreakfast} />
              </div>

              <div className="border-t border-white/80" />

              {/* Appetite */}
              <div>
                <p className="mb-2 text-xs font-semibold text-gray-500">
                  食欲 <span className="font-normal text-gray-400">（任意）</span>
                </p>
                <ThreeOptionToggle
                  value={appetite}
                  onChange={setAppetite}
                  options={[
                    { value: 'good', label: 'ある', activeClass: 'border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm' },
                    { value: 'normal', label: 'ふつう', activeClass: 'border-sky-400 bg-sky-50 text-sky-700 shadow-sm' },
                    { value: 'none', label: 'ない', activeClass: 'border-orange-400 bg-orange-50 text-orange-700 shadow-sm' },
                  ]}
                />
              </div>
            </div>
          </Section>

          {/* Medication */}
          <Section
            icon={
              <svg className="h-4 w-4 text-violet-500" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" d="M10.5 3.798v5.02a3 3 0 01-.879 2.121l-2.377 2.377a9.845 9.845 0 015.091 1.013 8.315 8.315 0 005.713.636l.285-.071-3.954-3.955a3 3 0 01-.879-2.121v-5.02a23.614 23.614 0 00-3 0zm4.5.138a.75.75 0 00.093-1.495A24.837 24.837 0 0012 2.25a25.048 25.048 0 00-3.093.191A.75.75 0 009 3.936v4.882a1.5 1.5 0 01-.44 1.06l-6.293 6.294c-1.62 1.621-.903 4.475 1.471 4.88 2.686.46 5.447.698 8.262.698 2.816 0 5.576-.239 8.262-.697 2.373-.406 3.092-3.26 1.471-4.881L15.44 9.879A1.5 1.5 0 0115 8.818V3.936z" clipRule="evenodd" />
              </svg>
            }
            title="服薬"
            optional
            gradient="bg-gradient-to-br from-violet-50/80 to-purple-50/60"
          >
            <div className="space-y-4">
              <p className="text-[10px] text-gray-400">
                ※ この項目は任意です。ご本人の同意のもと記録されます。
              </p>

              {/* Medication Taken */}
              <div>
                <p className="mb-2 text-xs font-semibold text-gray-500">今朝の服薬</p>
                <ThreeOptionToggle
                  value={medicationTaken}
                  onChange={setMedicationTaken}
                  options={[
                    { value: 'taken', label: '飲んだ', activeClass: 'border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm' },
                    { value: 'not_taken', label: '飲み忘れた', activeClass: 'border-orange-400 bg-orange-50 text-orange-700 shadow-sm' },
                    { value: 'not_applicable', label: '該当なし', activeClass: 'border-gray-400 bg-gray-50 text-gray-600 shadow-sm' },
                  ]}
                />
              </div>

              {/* Medication Note */}
              <div>
                <p className="mb-2 text-xs font-semibold text-gray-500">
                  服薬備考 <span className="font-normal text-gray-400">（任意）</span>
                </p>
                <input
                  type="text"
                  placeholder="気になることがあれば..."
                  value={medicationNote}
                  onChange={(e) => setMedicationNote(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="border-t border-white/80" />

              {/* PRN Medication */}
              <div>
                <p className="mb-2 text-xs font-semibold text-gray-500">前日の頓服</p>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (prnMedicationUsed === true) {
                        setPrnMedicationUsed(null);
                        setPrnMedicationEffect(null);
                      } else {
                        setPrnMedicationUsed(true);
                      }
                    }}
                    className={`flex-1 rounded-xl border-2 px-2 py-2.5 text-xs font-semibold transition-all duration-200 ${
                      prnMedicationUsed === true
                        ? 'border-violet-400 bg-violet-50 text-violet-700 shadow-sm'
                        : 'border-transparent bg-white/60 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    使用した
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (prnMedicationUsed === false) {
                        setPrnMedicationUsed(null);
                      } else {
                        setPrnMedicationUsed(false);
                        setPrnMedicationEffect(null);
                      }
                    }}
                    className={`flex-1 rounded-xl border-2 px-2 py-2.5 text-xs font-semibold transition-all duration-200 ${
                      prnMedicationUsed === false
                        ? 'border-gray-400 bg-gray-50 text-gray-600 shadow-sm'
                        : 'border-transparent bg-white/60 text-gray-400 hover:border-gray-200'
                    }`}
                  >
                    使用していない
                  </button>
                </div>
              </div>

              {/* PRN Effect (only when prnMedicationUsed === true) */}
              {prnMedicationUsed === true && (
                <div>
                  <p className="mb-2 text-xs font-semibold text-gray-500">頓服の効果</p>
                  <ThreeOptionToggle
                    value={prnMedicationEffect}
                    onChange={setPrnMedicationEffect}
                    options={[
                      { value: 'effective', label: '効いた', activeClass: 'border-emerald-400 bg-emerald-50 text-emerald-700 shadow-sm' },
                      { value: 'not_effective', label: '効かなかった', activeClass: 'border-orange-400 bg-orange-50 text-orange-700 shadow-sm' },
                      { value: 'unknown', label: 'わからない', activeClass: 'border-gray-400 bg-gray-50 text-gray-600 shadow-sm' },
                    ]}
                  />
                </div>
              )}
            </div>
          </Section>

          {/* Note */}
          <Section
            icon={
              <svg className="h-4 w-4 text-sky-500" viewBox="0 0 24 24" fill="currentColor">
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
              rows={2}
              placeholder="今日の気持ちをひとこと..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={inputClass}
            />
          </Section>

          {/* Error */}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex-1 rounded-2xl border-2 border-gray-200 bg-white px-6 py-4 text-base font-bold text-gray-500 transition-all duration-200 hover:border-gray-300 hover:text-gray-700 active:scale-[0.98]"
            >
              戻る
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="flex-1 rounded-2xl bg-gradient-to-r from-[#ffc000] to-[#ffab00] px-6 py-4 text-base font-bold text-gray-900 shadow-lg shadow-[#ffc000]/30 transition-all duration-200 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" />
                  </svg>
                  送信中...
                </span>
              ) : isUpdate ? (
                '更新する'
              ) : (
                '記録する'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
