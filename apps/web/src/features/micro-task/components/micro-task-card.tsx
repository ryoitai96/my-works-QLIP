'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ApiClientError } from '../../../lib/api-client';
import { completeMicroTask } from '../api';
import type { MicroTask } from '../api';
import { showToast } from '../../../components/toast';

const LOAD_LABELS: Record<string, { text: string; className: string }> = {
  low: { text: '低', className: 'bg-green-100 text-green-700' },
  medium: { text: '中', className: 'bg-yellow-100 text-yellow-700' },
  high: { text: '高', className: 'bg-red-100 text-red-700' },
};

const DIFFICULTY_COLORS = [
  'bg-green-400',
  'bg-lime-400',
  'bg-yellow-400',
  'bg-orange-400',
  'bg-red-400',
];

function DifficultyDots({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-1" aria-label={`難易度 ${level}`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`inline-block h-2 w-2 rounded-full ${
            i < level ? DIFFICULTY_COLORS[level - 1] : 'bg-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

function LoadBadge({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  const config = LOAD_LABELS[value];
  if (!config) return null;

  return (
    <span className="text-xs text-gray-500">
      {label}:
      <span
        className={`ml-1 inline-block rounded px-1.5 py-0.5 text-xs font-medium ${config.className}`}
      >
        {config.text}
      </span>
    </span>
  );
}

interface MicroTaskCardProps {
  task: MicroTask;
}

export function MicroTaskCard({ task }: MicroTaskCardProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  async function handleComplete() {
    setIsSubmitting(true);
    try {
      await completeMicroTask(task.id);
      showToast(`「${task.name}」の完了を記録しました`, 'success');
      setIsCompleted(true);
    } catch (err) {
      const message =
        err instanceof ApiClientError && err.statusCode === 403
          ? 'メンバーアカウントでログインしてください。'
          : '完了の記録に失敗しました。再度お試しください。';
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <article className="rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="p-5">
        <div className="mb-3 flex items-start justify-between">
          <span className="text-xs font-medium text-gray-400">
            {task.taskCode}
          </span>
          {task.category && (
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
              {task.category}
            </span>
          )}
        </div>

        <h3 className="mb-3 text-base font-semibold text-gray-900">
          {task.name}
        </h3>

        <div className="mb-3 flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500">難易度</span>
            <DifficultyDots level={task.difficultyLevel} />
          </div>
          {task.standardDuration != null && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{task.standardDuration}分</span>
            </div>
          )}
        </div>

        <div className="mb-3 flex items-center gap-3">
          <LoadBadge label="身体" value={task.physicalLoad} />
          <LoadBadge label="認知" value={task.cognitiveLoad} />
        </div>

        {task.requiredSkillTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {task.requiredSkillTags.map((tag) => (
              <span
                key={tag}
                className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-gray-200 px-5 py-3">
        {isCompleted ? (
          <div className="space-y-2 text-center">
            <p className="text-sm font-medium text-green-700">
              お疲れ様でした！
            </p>
            <Link
              href="/thanks"
              className="inline-flex items-center gap-1 rounded-lg bg-[#0077c7] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#005fa3]"
            >
              仲間にサンクスカードを送る
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleComplete}
            disabled={isSubmitting}
            aria-label={`${task.name} を完了として記録`}
            className="w-full rounded-lg bg-[#0077c7] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#005fa3] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? '記録中...' : '完了'}
          </button>
        )}
      </div>
    </article>
  );
}
