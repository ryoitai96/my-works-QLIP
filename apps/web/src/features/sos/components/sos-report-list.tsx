'use client';

import { useState } from 'react';
import { type SosReport, updateSosStatus } from '../api';

const CATEGORY_LABELS: Record<string, string> = {
  harassment: 'ハラスメント',
  overwork: '業務過多',
  health: '体調不良',
  other: 'その他',
};

const CATEGORY_COLORS: Record<string, string> = {
  harassment: 'bg-red-100 text-red-700',
  overwork: 'bg-orange-100 text-orange-700',
  health: 'bg-blue-100 text-blue-700',
  other: 'bg-gray-100 text-gray-700',
};

const STATUS_LABELS: Record<string, string> = {
  pending: '未対応',
  in_progress: '対応中',
  resolved: '解決済み',
  closed: 'クローズ',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-600',
};

const STATUS_OPTIONS = ['pending', 'in_progress', 'resolved', 'closed'];

interface SosReportListProps {
  reports: SosReport[];
  isR01: boolean;
  onRefresh: () => void;
}

export function SosReportList({ reports, isR01, onRefresh }: SosReportListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNote, setEditNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const handleStartEdit = (report: SosReport) => {
    setEditingId(report.id);
    setEditStatus(report.status);
    setEditNote(report.resolutionNote ?? '');
    setError('');
  };

  const handleSave = async (id: string) => {
    setUpdating(true);
    setError('');
    try {
      await updateSosStatus(id, { status: editStatus, resolutionNote: editNote || undefined });
      setEditingId(null);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新に失敗しました');
    } finally {
      setUpdating(false);
    }
  };

  if (reports.length === 0) {
    return (
      <div className="rounded-2xl bg-gray-50 p-8 text-center">
        <svg className="mx-auto mb-3 h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
        </svg>
        <p className="text-sm font-medium text-gray-500">通報はありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((report) => {
        const isExpanded = expandedId === report.id;
        const isEditing = editingId === report.id;

        return (
          <div
            key={report.id}
            className="rounded-xl border border-gray-200 bg-white overflow-hidden transition-shadow hover:shadow-sm"
          >
            {/* Header row */}
            <button
              type="button"
              onClick={() => setExpandedId(isExpanded ? null : report.id)}
              className="w-full flex items-center gap-3 p-4 text-left"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${CATEGORY_COLORS[report.category] ?? 'bg-gray-100 text-gray-700'}`}>
                    {CATEGORY_LABELS[report.category] ?? report.category}
                  </span>
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${STATUS_COLORS[report.status] ?? 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_LABELS[report.status] ?? report.status}
                  </span>
                  {report.isAnonymous && (
                    <span className="inline-block rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-bold text-purple-700">
                      匿名
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-800 truncate">{report.content}</p>
                <p className="mt-0.5 text-[11px] text-gray-400">
                  {report.site.name}
                  {report.reporter && !report.isAnonymous && ` / ${report.reporter.name}`}
                  {' / '}
                  {new Date(report.createdAt).toLocaleString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <svg
                className={`h-5 w-5 shrink-0 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {/* Expanded detail */}
            {isExpanded && (
              <div className="border-t border-gray-100 p-4 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">通報内容</p>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{report.content}</p>
                </div>

                {report.resolutionNote && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">対応メモ</p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{report.resolutionNote}</p>
                  </div>
                )}

                {report.resolvedBy && (
                  <p className="text-xs text-gray-400">
                    対応者: {report.resolvedBy.name}
                    {report.resolvedAt && ` (${new Date(report.resolvedAt).toLocaleString('ja-JP')})`}
                  </p>
                )}

                {/* R01: edit status */}
                {isR01 && !isEditing && (
                  <button
                    type="button"
                    onClick={() => handleStartEdit(report)}
                    className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200"
                  >
                    ステータス変更
                  </button>
                )}

                {isR01 && isEditing && (
                  <div className="space-y-3 rounded-xl bg-gray-50 p-3">
                    <div>
                      <label htmlFor={`status-${report.id}`} className="text-xs font-semibold text-gray-600">
                        ステータス
                      </label>
                      <select
                        id={`status-${report.id}`}
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor={`note-${report.id}`} className="text-xs font-semibold text-gray-600">
                        対応メモ
                      </label>
                      <textarea
                        id={`note-${report.id}`}
                        value={editNote}
                        onChange={(e) => setEditNote(e.target.value)}
                        rows={3}
                        className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-500 focus:outline-none"
                        placeholder="対応内容を記入..."
                      />
                    </div>
                    {error && <p className="text-xs text-red-600">{error}</p>}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        disabled={updating}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                      >
                        キャンセル
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSave(report.id)}
                        disabled={updating}
                        className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-50"
                      >
                        {updating ? '保存中...' : '保存'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
