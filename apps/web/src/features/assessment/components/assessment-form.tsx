'use client';

import { useState } from 'react';
import {
  type AssessmentData,
  type SubmitAssessmentRequest,
  submitAssessment,
} from '../api';

/* ── 必須14問の定義 ── */

interface QuestionDef {
  questionId: string;
  domain: string;
  questionText: string;
}

const DOMAINS = [
  {
    key: 'D1',
    label: 'D1: 職務の遂行',
    description: '仕事のやり方や取り組み方について',
  },
  {
    key: 'D2',
    label: 'D2: 職業生活の遂行',
    description: '職場でのルールや生活について',
  },
  {
    key: 'D3',
    label: 'D3: 対人関係・感情コントロール',
    description: 'コミュニケーションや気持ちのコントロールについて',
  },
  {
    key: 'D4',
    label: 'D4: 日常生活の遂行',
    description: '毎日の生活リズムや身だしなみについて',
  },
  {
    key: 'D5',
    label: 'D5: 疾病・障害の管理',
    description: '通院や服薬、体調の管理について',
  },
] as const;

const QUESTIONS: QuestionDef[] = [
  { questionId: 'D1-01', domain: 'D1', questionText: '指示された手順に従って作業できていますか？' },
  { questionId: 'D1-02', domain: 'D1', questionText: '安全に注意して作業していますか？' },
  { questionId: 'D1-03', domain: 'D1', questionText: '決められた時間内に作業を終えていますか？' },
  { questionId: 'D2-01', domain: 'D2', questionText: '職場のルールや決まりを守っていますか？' },
  { questionId: 'D2-02', domain: 'D2', questionText: '遅刻・早退・欠勤は正当な理由以外にしていませんか？' },
  { questionId: 'D2-03', domain: 'D2', questionText: '休む時や遅れる時に連絡できていますか？' },
  { questionId: 'D3-01', domain: 'D3', questionText: '場面に応じたあいさつや返事ができていますか？' },
  { questionId: 'D3-02', domain: 'D3', questionText: '自分の気持ちや要望を伝えられていますか？' },
  { questionId: 'D3-03', domain: 'D3', questionText: '報告・連絡・相談ができていますか？' },
  { questionId: 'D4-01', domain: 'D4', questionText: '規則正しい生活リズム（睡眠・食事）を送れていますか？' },
  { questionId: 'D4-02', domain: 'D4', questionText: '身だしなみを清潔に保てていますか？' },
  { questionId: 'D5-01', domain: 'D5', questionText: '医師の指示通りに通院できていますか？' },
  { questionId: 'D5-02', domain: 'D5', questionText: '処方された薬を指示通りに服用していますか？' },
  { questionId: 'D5-03', domain: 'D5', questionText: '体調の変化に気づいて報告できていますか？' },
];

const SCORE_OPTIONS = [
  { value: 1, label: 'まったく\n当てはまらない', emoji: '😢' },
  { value: 2, label: 'あまり\n当てはまらない', emoji: '😟' },
  { value: 3, label: 'どちらとも\nいえない', emoji: '😐' },
  { value: 4, label: 'やや\n当てはまる', emoji: '🙂' },
  { value: 5, label: '非常に\n当てはまる', emoji: '😊' },
];

/* ── Form ── */

interface AssessmentFormProps {
  initialAnswers?: Record<string, number>;
  onSubmitSuccess: (data: AssessmentData) => void;
}

export function AssessmentForm({
  initialAnswers,
  onSubmitSuccess,
}: AssessmentFormProps) {
  const [answers, setAnswers] = useState<Record<string, number>>(
    initialAnswers ?? {},
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const answeredCount = Object.keys(answers).length;
  const totalCount = QUESTIONS.length;
  const canSubmit = answeredCount === totalCount;

  const handleScore = (questionId: string, score: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: score }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setError('');

    try {
      const payload: SubmitAssessmentRequest = {
        answers: QUESTIONS.map((q) => ({
          questionId: q.questionId,
          domain: q.domain,
          questionText: q.questionText,
          score: answers[q.questionId],
        })),
      };
      const result = await submitAssessment(payload);
      onSubmitSuccess(result);
    } catch {
      setError('送信に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group questions by domain
  const grouped = DOMAINS.map((domain) => ({
    ...domain,
    questions: QUESTIONS.filter((q) => q.domain === domain.key),
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">
            回答済み {answeredCount}/{totalCount}
          </span>
          <span className="text-gray-400">
            {canSubmit ? '全問回答しました！' : `残り ${totalCount - answeredCount} 問`}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-[#ffc000] transition-all duration-300"
            style={{ width: `${(answeredCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Domain sections */}
      {grouped.map((domain) => (
        <section key={domain.key} className="space-y-4">
          <div className="border-b border-gray-100 pb-2">
            <h3 className="text-base font-semibold text-gray-900">
              {domain.label}
            </h3>
            <p className="text-xs text-gray-400">{domain.description}</p>
          </div>

          {domain.questions.map((q, qIdx) => (
            <fieldset
              key={q.questionId}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <legend className="sr-only">{q.questionText}</legend>
              <p className="mb-3 text-sm font-medium text-gray-800">
                <span className="mr-2 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-xs font-semibold text-gray-500">
                  {qIdx + 1}
                </span>
                {q.questionText}
              </p>
              <div
                className="flex items-stretch gap-1"
                role="radiogroup"
                aria-label={q.questionText}
              >
                {SCORE_OPTIONS.map((opt) => {
                  const isSelected = answers[q.questionId] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={`${opt.value}点: ${opt.label.replace('\n', '')}`}
                      onClick={() => handleScore(q.questionId, opt.value)}
                      className={`flex min-h-[56px] flex-1 flex-col items-center justify-center rounded-lg border-2 px-1 py-2 transition-all ${
                        isSelected
                          ? 'border-[#ffc000] bg-[#ffc000]/10'
                          : 'border-gray-200 bg-white hover:border-gray-300'
                      }`}
                    >
                      <span className="text-xl" aria-hidden="true">
                        {opt.emoji}
                      </span>
                      <span
                        className={`mt-0.5 whitespace-pre-line text-center text-[9px] leading-tight ${
                          isSelected ? 'text-gray-700' : 'text-gray-400'
                        }`}
                      >
                        {opt.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}
        </section>
      ))}

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
        {isSubmitting ? '送信中...' : '回答を送信する'}
      </button>
    </form>
  );
}
