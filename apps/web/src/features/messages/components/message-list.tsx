'use client';

import { useState } from 'react';
import {
  type Message,
  type MessageStatus,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  STATUS_LABELS,
} from '../api';

const STATUS_FILTERS: { value: MessageStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: 'open', label: '対応中' },
  { value: 'resolved', label: '解決済み' },
  { value: 'closed', label: 'クローズ' },
];

function formatTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();
  if (isToday) {
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }
  return `${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')}`;
}

export function MessageList({
  messages,
  selectedId,
  onSelect,
  onNewMessage,
  isHR,
}: {
  messages: Message[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onNewMessage: () => void;
  isHR: boolean;
}) {
  const [statusFilter, setStatusFilter] = useState<MessageStatus | 'all'>('all');

  const filtered =
    statusFilter === 'all'
      ? messages
      : messages.filter((m) => m.status === statusFilter);

  return (
    <>
      {/* ── Header ── */}
      <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
        <h2 className="text-sm font-bold text-gray-900">メッセージ</h2>
        {!isHR && (
          <button
            onClick={onNewMessage}
            className="flex items-center gap-1.5 rounded-lg bg-[#0077c7] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#005fa3] active:scale-[0.98]"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            追加
          </button>
        )}
      </div>

      {/* ── Filter ── */}
      <div className="flex items-center gap-1 border-b border-gray-100 px-4 py-2">
        {STATUS_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setStatusFilter(value)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              statusFilter === value
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── List ── */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-300">
            <svg className="mb-3 h-12 w-12" fill="none" viewBox="0 0 24 24" strokeWidth={0.8} stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
            <p className="text-sm">メッセージはありません</p>
          </div>
        ) : (
          filtered.map((msg) => {
            const active = msg.id === selectedId;
            const commentCount = msg._count?.comments ?? 0;
            return (
              <button
                key={msg.id}
                onClick={() => onSelect(msg.id)}
                className={`relative w-full border-b border-gray-100 px-4 py-3.5 text-left transition-colors ${
                  active ? 'bg-gray-50' : 'hover:bg-gray-50'
                }`}
              >
                {active && (
                  <span className="absolute inset-y-0 left-0 w-[3px] rounded-r bg-[#0077c7]" />
                )}

                {/* Row 1: name + time */}
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-bold text-gray-900">
                    {isHR ? msg.fromUser.name : msg.toUser.name}
                  </span>
                  <span className="shrink-0 text-xs tabular-nums text-gray-400">
                    {formatTime(msg.createdAt)}
                  </span>
                </div>

                {/* Row 2: subject */}
                <p className="mt-1 truncate text-sm text-gray-700">
                  {msg.subject}
                </p>

                {/* Row 3: preview */}
                <p className="mt-0.5 truncate text-xs text-gray-400">
                  {msg.content}
                </p>

                {/* Row 4: badges */}
                <div className="mt-2 flex items-center gap-1.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${CATEGORY_COLORS[msg.category]}`}
                  >
                    {CATEGORY_LABELS[msg.category]}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      msg.status === 'open'
                        ? 'bg-yellow-50 text-yellow-600'
                        : msg.status === 'resolved'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {STATUS_LABELS[msg.status]}
                  </span>
                  {commentCount > 0 && (
                    <span className="ml-auto flex items-center gap-1 text-xs tabular-nums text-gray-400">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
                        />
                      </svg>
                      {commentCount}
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </>
  );
}
