'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PentagonChart } from '../../assessment/components/pentagon-chart';
import { fetchMemberDashboardStats, type MemberDashboardStats } from '../api';
import { BADGE_DEFINITIONS, POINT_WEIGHTS } from '../badge-definitions';

const MOCK_SCORES = { d1: 3.8, d2: 4.2, d3: 3.0, d4: 3.5, d5: 4.0 };
const MOCK_PREVIOUS_SCORES = { d1: 3.2, d2: 3.8, d3: 2.8, d4: 3.0, d5: 3.5 };

interface Strength {
  id: string;
  domain: string;
  text: string;
}

const MOCK_STRENGTHS: Strength[] = [
  { id: 's1', domain: 'D1', text: '\u3057\u3058\u3055\u308C\u305F\u624B\u9806\u3069\u304A\u308A\u306B\u4F5C\u696D\u3092\u3059\u3059\u3081\u3089\u308C\u308B' },
  { id: 's2', domain: 'D1', text: '\u9053\u5177\u3084\u6750\u6599\u3092\u3066\u3044\u306D\u3044\u306B\u3042\u3064\u304B\u3048\u308B' },
  { id: 's3', domain: 'D2', text: '\u6BCE\u65E5\u304D\u307E\u3063\u305F\u6642\u9593\u306B\u51FA\u52E4\u3067\u304D\u308B' },
  { id: 's4', domain: 'D3', text: '\u3053\u307E\u3063\u305F\u3068\u304D\u306B\u300C\u305F\u3059\u3051\u3066\u300D\u3068\u8A00\u3048\u308B' },
  { id: 's5', domain: 'D5', text: '\u3058\u3076\u3093\u306E\u4F53\u8ABF\u306E\u5909\u5316\u306B\u304D\u3065\u3051\u308B' },
];

const DOMAIN_LABELS: Record<string, string> = {
  D1: '\u3057\u3054\u3068\u306E\u3061\u304B\u3089',
  D2: '\u306F\u305F\u3089\u304F\u3057\u3085\u3046\u304B\u3093',
  D3: '\u3072\u3068\u3068\u306E\u304B\u304B\u308F\u308A',
  D4: '\u304D\u3082\u3061\u306E\u30B3\u30F3\u30C8\u30ED\u30FC\u30EB',
  D5: '\u3058\u3076\u3093\u306E\u3053\u3068\u3092\u77E5\u308B',
};

export function GrowthRecordContent() {
  const [stats, setStats] = useState<MemberDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMemberDashboardStats()
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : '\u8AAD\u307F\u8FBC\u307F\u306B\u5931\u6557\u3057\u307E\u3057\u305F'))
      .finally(() => setLoading(false));
  }, []);

  const strengthsByDomain = MOCK_STRENGTHS.reduce<Record<string, Strength[]>>((acc, s) => {
    if (!acc[s.domain]) acc[s.domain] = [];
    acc[s.domain].push(s);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-2xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-red-200 bg-red-50 p-8">
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  const earnedCount = stats?.badges.filter((b) => b.earned).length ?? 0;
  const totalCount = BADGE_DEFINITIONS.length;

  return (
    <div className="space-y-8">
      {/* ポイント */}
      {stats && (
        <section className="rounded-2xl border border-[#ffc000]/30 bg-[#ffc000]/5 p-6 shadow-sm">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">これまでのポイント</p>
            <p className="mt-1 text-4xl font-extrabold text-[#ffc000]">
              {stats.points.toLocaleString()}
              <span className="ml-1 text-base font-bold">pt</span>
            </p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
            <div className="rounded-lg bg-white/70 px-3 py-2 text-center">
              <p className="text-gray-500">日報</p>
              <p className="font-bold text-gray-800">{stats.badgeStats.healthReports}\u56DE <span className="text-gray-400">({POINT_WEIGHTS.healthReport}pt/\u56DE)</span></p>
            </div>
            <div className="rounded-lg bg-white/70 px-3 py-2 text-center">
              <p className="text-gray-500">タスク完了</p>
              <p className="font-bold text-gray-800">{stats.badgeStats.tasksCompleted}\u56DE <span className="text-gray-400">({POINT_WEIGHTS.taskComplete}pt/\u56DE)</span></p>
            </div>
            <div className="rounded-lg bg-white/70 px-3 py-2 text-center">
              <p className="text-gray-500">サンクス送信</p>
              <p className="font-bold text-gray-800">{stats.badgeStats.thanksSent}\u56DE <span className="text-gray-400">({POINT_WEIGHTS.thanksSent}pt/\u56DE)</span></p>
            </div>
            <div className="rounded-lg bg-white/70 px-3 py-2 text-center">
              <p className="text-gray-500">サンクス受信</p>
              <p className="font-bold text-gray-800">{stats.badgeStats.thanksReceived}\u56DE <span className="text-gray-400">({POINT_WEIGHTS.thanksReceived}pt/\u56DE)</span></p>
            </div>
            <div className="rounded-lg bg-white/70 px-3 py-2 text-center">
              <p className="text-gray-500">アセスメント</p>
              <p className="font-bold text-gray-800">{stats.badgeStats.assessments}\u56DE <span className="text-gray-400">({POINT_WEIGHTS.assessment}pt/\u56DE)</span></p>
            </div>
          </div>
        </section>
      )}

      {/* 五角形チャート */}
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-gray-900">
          {'\u{1F4CA}'} いまのわたし
        </h2>
        <PentagonChart scores={MOCK_SCORES} previousScores={MOCK_PREVIOUS_SCORES} />
        <p className="mt-3 text-center text-sm text-gray-500">
          グレーの点線が前回のきろくだよ。のびたところがわかるね！
        </p>
        <p className="mt-2 text-center text-xs text-gray-400">
          2026年2月 のアセスメント結果（モック）
        </p>
      </section>

      {/* わたしの強み */}
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-gray-900">
          \u2B50 わたしの強み
        </h2>
        <div className="space-y-4">
          {Object.entries(strengthsByDomain).map(([domain, items]) => (
            <div key={domain}>
              <p className="mb-2 text-sm font-semibold text-[#ffc000]">
                {DOMAIN_LABELS[domain] ?? domain}
              </p>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-start gap-2 rounded-xl bg-[#ffc000]/5 px-4 py-3"
                  >
                    <span className="mt-0.5 text-[#ffc000]">\u2605</span>
                    <span className="text-sm text-gray-700">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* かくとくバッジ */}
      <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            {'\u{1F3C5}'} かくとくバッジ
          </h2>
          <span className="text-sm font-medium text-gray-500">
            {earnedCount} / {totalCount}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {BADGE_DEFINITIONS.map((def) => {
            const earned = stats?.badges.find((b) => b.id === def.id)?.earned ?? false;
            return (
              <div
                key={def.id}
                className={`flex flex-col items-center rounded-2xl border p-4 text-center transition-all ${
                  earned
                    ? 'border-[#ffc000]/30 bg-[#ffc000]/5 shadow-sm'
                    : 'border-gray-100 bg-gray-50 opacity-50'
                }`}
              >
                <span className="text-3xl">{def.emoji}</span>
                <p className={`mt-2 text-xs font-bold ${earned ? 'text-gray-900' : 'text-gray-400'}`}>
                  {def.title}
                </p>
                <p className="mt-1 text-[10px] leading-tight text-gray-400">
                  {def.description}
                </p>
                {earned && (
                  <span className="mt-2 inline-block rounded-full bg-[#ffc000] px-2 py-0.5 text-[10px] font-bold text-white">
                    GET!
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ダッシュボードにもどる */}
      <div className="text-center">
        <Link
          href="/dashboard"
          className="text-sm text-gray-400 transition-colors hover:text-gray-600"
        >
          \u2190 ダッシュボードにもどる
        </Link>
      </div>
    </div>
  );
}
