'use client';

import { useState, useEffect, useRef } from 'react';
import {
  type Message,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  STATUS_LABELS,
  addComment,
  updateMessageStatus,
} from '../api';

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export function MessageDetail({
  message,
  currentUserId,
  isHR,
  onRefresh,
}: {
  message: Message;
  currentUserId: string;
  isHR: boolean;
  onRefresh: () => void;
}) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);

  // 新しいメッセージが来たらスクロール
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [message.comments?.length]);

  const send = async () => {
    if (!text.trim()) return;
    setSending(true);
    try {
      await addComment(message.id, text.trim());
      setText('');
      onRefresh();
    } catch {
      alert('コメントの送信に失敗しました');
    } finally {
      setSending(false);
    }
  };

  const changeStatus = async (status: 'resolved' | 'closed') => {
    try {
      await updateMessageStatus(message.id, status);
      onRefresh();
    } catch {
      alert('ステータスの変更に失敗しました');
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      send();
    }
  };

  const isOwnMessage = message.fromUserId === currentUserId;

  return (
    <div className="flex h-full flex-col">
      {/* ═══ Header ═══ */}
      <div className="shrink-0 border-b border-gray-200 bg-white px-6 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                {message.fromUser.name} → {message.toUser.name}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLORS[message.category]}`}
              >
                {CATEGORY_LABELS[message.category]}
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  message.status === 'open'
                    ? 'bg-yellow-50 text-yellow-600'
                    : message.status === 'resolved'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-gray-100 text-gray-400'
                }`}
              >
                {STATUS_LABELS[message.status]}
              </span>
            </div>
            <h2 className="mt-1 text-base font-bold text-gray-900">
              {message.subject}
            </h2>
          </div>

          {isHR && message.status === 'open' && (
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => changeStatus('resolved')}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
              >
                解決済みにする
              </button>
              <button
                onClick={() => changeStatus('closed')}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                クローズ
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ═══ Thread ═══ */}
      <div ref={threadRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-6 py-6">
          {/* 元メッセージ */}
          <ChatBubble
            name={isOwnMessage ? 'あなた' : message.fromUser.name}
            time={formatDateTime(message.createdAt)}
            isOwn={isOwnMessage}
          >
            {message.content}
          </ChatBubble>

          {/* コメントスレッド */}
          {message.comments?.map((c) => {
            const own = c.userId === currentUserId;
            return (
              <ChatBubble
                key={c.id}
                name={own ? 'あなた' : c.user.name}
                time={formatDateTime(c.createdAt)}
                isOwn={own}
              >
                {c.content}
              </ChatBubble>
            );
          })}

          {/* コメントがない場合 */}
          {(!message.comments || message.comments.length === 0) && (
            <p className="mt-2 text-center text-sm text-gray-400">
              まだ返信はありません
            </p>
          )}
        </div>
      </div>

      {/* ═══ Input ═══ */}
      <div className="shrink-0 border-t border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-2xl items-end gap-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKey}
            placeholder="コメントを入力…（Ctrl+Enter で送信）"
            rows={2}
            className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm leading-relaxed text-gray-800 placeholder:text-gray-400 focus:border-[#0077c7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0077c7]/30"
          />
          <button
            onClick={send}
            disabled={sending || !text.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0077c7] text-white shadow-sm transition-all hover:bg-[#005fa3] active:scale-95 disabled:pointer-events-none disabled:opacity-30"
            aria-label="送信"
          >
            {sending ? (
              <span className="block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Chat Bubble ─── */

function ChatBubble({
  name,
  time,
  isOwn,
  children,
}: {
  name: string;
  time: string;
  isOwn: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      {/* Name + DateTime (隣接表示) */}
      <div className="mb-1.5 flex items-baseline gap-2">
        <span
          className={`text-sm font-bold ${isOwn ? 'text-gray-900' : 'text-gray-800'}`}
        >
          {name}
        </span>
        <span className="text-xs tabular-nums text-gray-400">
          {time}
        </span>
      </div>

      {/* Bubble */}
      <div
        className={`rounded-2xl px-5 py-4 text-sm leading-[1.8] ${
          isOwn
            ? 'bg-gray-100 text-gray-900'
            : 'bg-white text-gray-700 shadow-sm ring-1 ring-gray-200'
        }`}
      >
        <p className="whitespace-pre-wrap">{children}</p>
      </div>
    </div>
  );
}
