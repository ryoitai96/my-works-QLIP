import { apiClient } from '../../lib/api-client';

// ========== 型定義 ==========

export type MessageCategory =
  | 'late_notice'
  | 'early_leave'
  | 'paid_leave'
  | 'welfare'
  | 'meeting'
  | 'other';

export type MessageStatus = 'open' | 'resolved' | 'closed';

export interface MessageUser {
  id: string;
  name: string;
  role: string;
}

export interface MessageComment {
  id: string;
  messageId: string;
  userId: string;
  user: MessageUser;
  content: string;
  createdAt: string;
}

export interface Message {
  id: string;
  tenantId: string;
  fromUserId: string;
  fromUser: MessageUser;
  toUserId: string;
  toUser: MessageUser;
  category: MessageCategory;
  subject: string;
  content: string;
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
  comments?: MessageComment[];
  _count?: { comments: number };
}

export const CATEGORY_LABELS: Record<MessageCategory, string> = {
  late_notice: '遅刻連絡',
  early_leave: '早退申請',
  paid_leave: '有給申請',
  welfare: '福利厚生',
  meeting: '面談設定',
  other: 'その他',
};

export const CATEGORY_COLORS: Record<MessageCategory, string> = {
  late_notice: 'bg-orange-100 text-orange-700',
  early_leave: 'bg-amber-100 text-amber-700',
  paid_leave: 'bg-blue-100 text-blue-700',
  welfare: 'bg-green-100 text-green-700',
  meeting: 'bg-purple-100 text-purple-700',
  other: 'bg-gray-100 text-gray-700',
};

export const STATUS_LABELS: Record<MessageStatus, string> = {
  open: '対応中',
  resolved: '解決済み',
  closed: 'クローズ',
};

// ========== API関数 ==========

export async function fetchRecipients(): Promise<MessageUser[]> {
  return apiClient<MessageUser[]>('/messages/recipients', { auth: true });
}

export async function fetchMessages(): Promise<Message[]> {
  return apiClient<Message[]>('/messages', { auth: true });
}

export async function fetchMessage(id: string): Promise<Message> {
  return apiClient<Message>(`/messages/${id}`, { auth: true });
}

export async function createMessage(data: {
  toUserId: string;
  category: MessageCategory;
  subject: string;
  content: string;
}): Promise<Message> {
  return apiClient<Message>('/messages', {
    method: 'POST',
    body: data,
    auth: true,
  });
}

export async function updateMessageStatus(
  id: string,
  status: 'resolved' | 'closed',
): Promise<Message> {
  return apiClient<Message>(`/messages/${id}/status`, {
    method: 'PATCH',
    body: { status },
    auth: true,
  });
}

export async function addComment(
  messageId: string,
  content: string,
): Promise<MessageComment> {
  return apiClient<MessageComment>(`/messages/${messageId}/comments`, {
    method: 'POST',
    body: { content },
    auth: true,
  });
}
