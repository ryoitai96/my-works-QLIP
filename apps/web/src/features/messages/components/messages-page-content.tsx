'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authStore, type UserInfo } from '../../auth/auth-store';
import { isClientHR } from '../../auth/role-check';
import { type Message, fetchMessages, fetchMessage } from '../api';
import { MessageList } from './message-list';
import { MessageDetail } from './message-detail';
import { MessageForm } from './message-form';

export function MessagesPageContent() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadMessages = useCallback(async () => {
    try {
      const data = await fetchMessages();
      setMessages(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDetail = useCallback(async (id: string) => {
    try {
      const data = await fetchMessage(id);
      setSelectedMessage(data);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    if (!authStore.isAuthenticated()) {
      router.replace('/login');
      return;
    }
    setUser(authStore.getUser());
    setMounted(true);
    loadMessages();
  }, [router, loadMessages]);

  useEffect(() => {
    if (selectedId) {
      loadDetail(selectedId);
    } else {
      setSelectedMessage(null);
    }
  }, [selectedId, loadDetail]);

  if (!mounted || loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#ffc000] border-t-transparent" />
      </div>
    );
  }

  const isHR = user?.role ? isClientHR(user.role) : false;

  return (
    <div className="flex h-full">
      {/* Left pane — message list */}
      <div className="flex w-[320px] shrink-0 flex-col border-r border-gray-200 bg-white">
        <MessageList
          messages={messages}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onNewMessage={() => setShowForm(true)}
          isHR={isHR}
        />
      </div>

      {/* Right pane — detail / empty state */}
      <div className="flex min-w-0 flex-1 flex-col bg-gray-50">
        {selectedMessage ? (
          <MessageDetail
            message={selectedMessage}
            currentUserId={user?.id ?? ''}
            isHR={isHR}
            onRefresh={() => {
              loadDetail(selectedMessage.id);
              loadMessages();
            }}
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center text-gray-300">
            <svg
              className="mb-4 h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={0.8}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
            <p className="text-sm font-medium">メッセージを選択してください</p>
            <p className="mt-1 text-xs">
              左の一覧からメッセージを選択すると、ここに詳細が表示されます
            </p>
          </div>
        )}
      </div>

      {showForm && (
        <MessageForm
          onClose={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
            loadMessages();
          }}
        />
      )}
    </div>
  );
}
