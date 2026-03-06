'use client';

import { useState } from 'react';
import {
  type AssessmentData,
  type SubmitAssessmentRequest,
  submitAssessment,
} from '../api';

/* ── 型定義 ── */

interface QuestionDef {
  questionId: string;
  domain: string;
  questionText: string;
}

/* ── 5ドメイン × 10問 = 50問 ── */

const DOMAINS = [
  {
    key: 'D1',
    label: 'D1: 職務遂行・認知処理能力',
    shortLabel: '職務遂行',
    description: '仕事の遂行や認知・処理に関する能力',
  },
  {
    key: 'D2',
    label: 'D2: 基本的労働習慣・身体的耐性',
    shortLabel: '労働習慣',
    description: '出勤・マナー・体力など基本的な労働習慣',
  },
  {
    key: 'D3',
    label: 'D3: 対人関係・コミュニケーション',
    shortLabel: '対人関係',
    description: '職場での対人関係やコミュニケーション力',
  },
  {
    key: 'D4',
    label: 'D4: 感情・ストレスコントロール',
    shortLabel: '感情制御',
    description: '感情の制御やストレスへの対処力',
  },
  {
    key: 'D5',
    label: 'D5: 障害理解・自己管理',
    shortLabel: '自己管理',
    description: '障害特性の理解と健康・生活の自己管理',
  },
] as const;

const QUESTIONS: QuestionDef[] = [
  // D1: 職務遂行・認知処理能力（10問）
  { questionId: 'D1-01', domain: 'D1', questionText: '指示された手順を正確に記憶し、再現できる。' },
  { questionId: 'D1-02', domain: 'D1', questionText: 'マニュアルや手順書を読んで、一人で作業を進められる。' },
  { questionId: 'D1-03', domain: 'D1', questionText: '複数の作業（マルチタスク）を並行して混乱せずに進められる。' },
  { questionId: 'D1-04', domain: 'D1', questionText: '単調な反復作業でも、長時間集中力を切らさずに取り組める。' },
  { questionId: 'D1-05', domain: 'D1', questionText: '作業中のミスに気づいた際、パニックにならず冷静に対処できる。' },
  { questionId: 'D1-06', domain: 'D1', questionText: '突発的なスケジュールの変更や、予期せぬトラブルに柔軟に対応できる。' },
  { questionId: 'D1-07', domain: 'D1', questionText: '自身の作業スピードや処理能力を正確に把握している。' },
  { questionId: 'D1-08', domain: 'D1', questionText: '決められた納期や期限から逆算して、スケジュールを管理できる。' },
  { questionId: 'D1-09', domain: 'D1', questionText: '新しいツールやITシステム（PC操作など）を抵抗なく習得できる。' },
  { questionId: 'D1-10', domain: 'D1', questionText: '自分の作業の品質（丁寧さ、正確さ）を客観的にチェックできる。' },

  // D2: 基本的労働習慣・身体的耐性（10問）
  { questionId: 'D2-01', domain: 'D2', questionText: '決められたシフトや出勤時間を守り、遅刻や無断欠勤をしない。' },
  { questionId: 'D2-02', domain: 'D2', questionText: '1日の所定労働時間を、極端な疲労なく働き通す体力がある。' },
  { questionId: 'D2-03', domain: 'D2', questionText: '挨拶や言葉遣いなど、職場にふさわしい基本的なマナーを守れる。' },
  { questionId: 'D2-04', domain: 'D2', questionText: '服装や身だしなみを、職場のルールに合わせて清潔に保てる。' },
  { questionId: 'D2-05', domain: 'D2', questionText: '休憩時間を適切に取得し、業務へのオンオフを切り替えられる。' },
  { questionId: 'D2-06', domain: 'D2', questionText: '職場の安全ルールを理解し、危険を予測して行動できる。' },
  { questionId: 'D2-07', domain: 'D2', questionText: '通勤ラッシュや長時間の移動など、通勤にかかる負荷に耐えられる。' },
  { questionId: 'D2-08', domain: 'D2', questionText: '業務中に体調が悪くなった際、無理をせずに休む判断ができる。' },
  { questionId: 'D2-09', domain: 'D2', questionText: '職場の備品や機材を丁寧かつ適切に扱うことができる。' },
  { questionId: 'D2-10', domain: 'D2', questionText: '業務時間中の私語やスマートフォンの使用など、不適切な行動を自制できる。' },

  // D3: 対人関係・コミュニケーション（10問）
  { questionId: 'D3-01', domain: 'D3', questionText: '上司や同僚からの指示を最後まで聞き、正確に理解できる。' },
  { questionId: 'D3-02', domain: 'D3', questionText: '業務上の「報告・連絡・相談」を適切なタイミングで行える。' },
  { questionId: 'D3-03', domain: 'D3', questionText: 'わからないことや困ったことがあった際、自分から助けを求められる。' },
  { questionId: 'D3-04', domain: 'D3', questionText: '他者からの注意や指導を受けた際、感情的にならずに受け入れられる。' },
  { questionId: 'D3-05', domain: 'D3', questionText: '自分の意見や要望を、相手を不快にさせない適切な言葉で伝えられる。' },
  { questionId: 'D3-06', domain: 'D3', questionText: 'チームのメンバーと協力し、役割分担をして作業を進められる。' },
  { questionId: 'D3-07', domain: 'D3', questionText: '雑談や軽いコミュニケーションを通じて、職場の人間関係を築ける。' },
  { questionId: 'D3-08', domain: 'D3', questionText: '相手の表情や声のトーンから、感情や状況をある程度推測できる。' },
  { questionId: 'D3-09', domain: 'D3', questionText: '意見が対立した際、自分の主張を押し通さず妥協点を見つけられる。' },
  { questionId: 'D3-10', domain: 'D3', questionText: '職場の人間関係のトラブルに巻き込まれた際、一人で抱え込まず第三者に相談できる。' },

  // D4: 感情・ストレスコントロール（10問）
  { questionId: 'D4-01', domain: 'D4', questionText: '自身の気分の波（気分の上がり下がり）のサイクルや前兆を自覚している。' },
  { questionId: 'D4-02', domain: 'D4', questionText: '強いストレスやプレッシャーを感じた際でも、極端に焦らず行動できる。' },
  { questionId: 'D4-03', domain: 'D4', questionText: '業務でミスをして落ち込んだ際、気持ちを切り替えて立ち直ることができる。' },
  { questionId: 'D4-04', domain: 'D4', questionText: 'イライラしたり怒りを感じた際、衝動的な言動をとらずに抑えることができる。' },
  { questionId: 'D4-05', domain: 'D4', questionText: '他者のイライラや職場の緊張した雰囲気に、自分自身が過剰に影響されない。' },
  { questionId: 'D4-06', domain: 'D4', questionText: '業務上のストレスを休日に持ち込まず、適切にリフレッシュする方法を持っている。' },
  { questionId: 'D4-07', domain: 'D4', questionText: '不安や焦りが身体症状（頭痛、腹痛、動悸など）として表れにくい。' },
  { questionId: 'D4-08', domain: 'D4', questionText: '自分のキャパシティを超える要求をされた際、パニックにならず「できない」と伝えられる。' },
  { questionId: 'D4-09', domain: 'D4', questionText: '過去の失敗やネガティブな経験に強く囚われすぎず、目の前のことに集中できる。' },
  { questionId: 'D4-10', domain: 'D4', questionText: 'ストレスが溜まった際、不適切な行動（衝動買い等）に頼らず健全に対処できる。' },

  // D5: 障害理解・自己管理（10問）
  { questionId: 'D5-01', domain: 'D5', questionText: '自身の障害特性（得意なこと、苦手なこと）を客観的に理解している。' },
  { questionId: 'D5-02', domain: 'D5', questionText: '自分の特性について、職場の上司や同僚に分かりやすく説明できる。' },
  { questionId: 'D5-03', domain: 'D5', questionText: '自分が能力を発揮するために必要な「合理的配慮」を具体的に提示できる。' },
  { questionId: 'D5-04', domain: 'D5', questionText: '処方された薬を、医師の指示通りに忘れずに服用できる。' },
  { questionId: 'D5-05', domain: 'D5', questionText: '定期的な通院スケジュールを自分で管理し、業務と調整できる。' },
  { questionId: 'D5-06', domain: 'D5', questionText: '睡眠、食事、運動など、規則正しい基本的な生活リズムを毎日維持できている。' },
  { questionId: 'D5-07', domain: 'D5', questionText: '自身の体調悪化のサイン（不眠、食欲低下など）にいち早く気づくことができる。' },
  { questionId: 'D5-08', domain: 'D5', questionText: '体調を崩す前に、自分なりの予防策や対処法を実行できる。' },
  { questionId: 'D5-09', domain: 'D5', questionText: '支援機関（ジョブコーチ、主治医、相談支援員など）と定期的に連携を取れている。' },
  { questionId: 'D5-10', domain: 'D5', questionText: '自身の将来のキャリアや目標について、現実的な見通しを持っている。' },
];

const SCORE_LABELS = ['', '当てはまらない', '', 'どちらとも\nいえない', '', '当てはまる'];

/* ── Form ── */

interface AssessmentFormProps {
  initialAnswers?: Record<string, number>;
  initialStrengths?: Set<string>;
  onSubmitSuccess: (data: AssessmentData) => void;
}

export function AssessmentForm({
  initialAnswers,
  initialStrengths,
  onSubmitSuccess,
}: AssessmentFormProps) {
  const [answers, setAnswers] = useState<Record<string, number>>(
    initialAnswers ?? {},
  );
  const [strengths, setStrengths] = useState<Set<string>>(
    initialStrengths ?? new Set(),
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const toggleStrength = (questionId: string) => {
    setStrengths((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) next.delete(questionId);
      else next.add(questionId);
      return next;
    });
  };

  const answeredCount = Object.keys(answers).length;
  const totalCount = QUESTIONS.length;

  const currentDomain = DOMAINS[currentStep];
  const currentQuestions = QUESTIONS.filter(
    (q) => q.domain === currentDomain.key,
  );
  const currentDomainAnswered = currentQuestions.filter(
    (q) => answers[q.questionId] != null,
  ).length;
  const isCurrentDomainComplete =
    currentDomainAnswered === currentQuestions.length;
  const isLastStep = currentStep === DOMAINS.length - 1;
  const canSubmit = answeredCount === totalCount;

  const handleScore = (questionId: string, score: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: score }));
  };

  const handleNext = () => {
    if (currentStep < DOMAINS.length - 1) {
      setCurrentStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── Overall progress ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">
            {answeredCount} / {totalCount} 問
          </span>
          <span className="text-gray-400">
            {canSubmit
              ? '全問回答済み'
              : `残り ${totalCount - answeredCount} 問`}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-[#ffc000] transition-all duration-500"
            style={{ width: `${(answeredCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* ── Domain stepper ── */}
      <nav className="flex gap-1.5 rounded-xl bg-gray-50 p-1.5">
        {DOMAINS.map((domain, idx) => {
          const dqs = QUESTIONS.filter((q) => q.domain === domain.key);
          const dAnswered = dqs.filter(
            (q) => answers[q.questionId] != null,
          ).length;
          const isDone = dAnswered === dqs.length;
          const isCurrent = idx === currentStep;

          return (
            <button
              key={domain.key}
              type="button"
              onClick={() => setCurrentStep(idx)}
              className={`relative flex flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-2.5 text-xs font-semibold transition-all ${
                isCurrent
                  ? 'bg-white text-gray-900 shadow-sm'
                  : isDone
                    ? 'text-[#ffc000] hover:bg-white/60'
                    : 'text-gray-400 hover:bg-white/60'
              }`}
            >
              {isDone && (
                <svg
                  className="absolute right-1 top-1 h-3 w-3 text-[#ffc000]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              )}
              <span className="text-[11px]">{domain.shortLabel}</span>
              {/* mini progress */}
              <div className="h-1 w-full overflow-hidden rounded-full bg-gray-200/60">
                <div
                  className="h-full rounded-full bg-[#ffc000] transition-all duration-300"
                  style={{
                    width: `${(dAnswered / dqs.length) * 100}%`,
                  }}
                />
              </div>
            </button>
          );
        })}
      </nav>

      {/* ── Domain header ── */}
      <div>
        <h3 className="text-lg font-bold text-gray-900">
          {currentDomain.label}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {currentDomain.description} ({currentDomainAnswered}/
          {currentQuestions.length})
        </p>
      </div>

      {/* ── Questions ── */}
      <div className="space-y-4">
        {currentQuestions.map((q, qIdx) => {
          const selected = answers[q.questionId];
          return (
            <div
              key={q.questionId}
              className={`rounded-xl border p-4 transition-all ${
                selected != null
                  ? 'border-[#ffc000]/30 bg-[#ffc000]/[0.03]'
                  : 'border-gray-200 bg-white'
              }`}
            >
              {/* Question text with strength toggle */}
              <div className="mb-3 flex items-start gap-2">
                <p className="flex-1 text-sm leading-relaxed text-gray-800">
                  <span className="mr-1.5 inline-flex h-5 w-5 items-center justify-center rounded-md bg-gray-100 text-[11px] font-bold tabular-nums text-gray-500">
                    {qIdx + 1}
                  </span>
                  {q.questionText}
                </p>
                <button
                  type="button"
                  onClick={() => toggleStrength(q.questionId)}
                  title={strengths.has(q.questionId) ? 'ストレングスを解除' : 'これは得意!'}
                  className={`shrink-0 rounded-md p-1 text-lg transition-all ${
                    strengths.has(q.questionId)
                      ? 'text-[#ffc000] hover:text-[#e0a800]'
                      : 'text-gray-300 hover:text-gray-400'
                  }`}
                  aria-label={strengths.has(q.questionId) ? 'ストレングス設定済み' : 'ストレングスを設定'}
                >
                  {strengths.has(q.questionId) ? '\u2605' : '\u2606'}
                </button>
              </div>

              {/* Segmented scoring control */}
              <div role="radiogroup" aria-label={q.questionText}>
                {/* Labels row */}
                <div className="mb-1.5 flex justify-between px-0.5">
                  <span className="text-[11px] text-gray-400">
                    当てはまらない
                  </span>
                  <span className="text-[11px] text-gray-400">
                    当てはまる
                  </span>
                </div>

                {/* Buttons */}
                <div className="flex overflow-hidden rounded-lg border border-gray-200">
                  {[1, 2, 3, 4, 5].map((v) => {
                    const isSelected = selected === v;
                    return (
                      <button
                        key={v}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        aria-label={`${v}点: ${SCORE_LABELS[v]}`}
                        onClick={() => handleScore(q.questionId, v)}
                        className={`flex flex-1 flex-col items-center justify-center border-r border-gray-200 py-2.5 text-sm transition-all last:border-r-0 ${
                          isSelected
                            ? 'bg-[#ffc000] font-bold text-gray-900'
                            : 'bg-white text-gray-500 hover:bg-gray-50 active:bg-gray-100'
                        }`}
                      >
                        <span className="text-base font-semibold">{v}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Error ── */}
      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {/* ── Navigation ── */}
      <div className="flex gap-3 pt-2">
        {currentStep > 0 && (
          <button
            type="button"
            onClick={handlePrev}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 px-5 py-3.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
            戻る
          </button>
        )}
        {isLastStep ? (
          <button
            type="submit"
            disabled={!canSubmit || isSubmitting}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0077c7] px-6 py-3.5 text-base font-bold text-white shadow-sm transition-colors hover:bg-[#005fa3] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSubmitting ? '送信中...' : '回答を送信する'}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            disabled={!isCurrentDomainComplete}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#0077c7] px-6 py-3.5 text-base font-bold text-white shadow-sm transition-colors hover:bg-[#005fa3] disabled:cursor-not-allowed disabled:opacity-40"
          >
            次のセクションへ
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        )}
      </div>
    </form>
  );
}
