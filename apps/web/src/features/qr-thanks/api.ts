import { apiClient } from '../../lib/api-client';

export interface QrStoryData {
  memberDisplayName: string;
  siteName: string;
  storyText: string;
  isUsed: boolean;
}

export interface QrThanksResult {
  id: string;
  message: string;
}

export interface CreateTokenRequest {
  memberId: string;
  storyText: string;
  flowerOrderId?: string;
  expiresInDays?: number;
}

export interface CreateTokenResult {
  id: string;
  token: string;
  expiresAt: string;
}

export interface QrTokenListItem {
  id: string;
  token: string;
  memberId: string;
  memberDisplayName: string;
  siteName: string;
  storyText: string;
  isUsed: boolean;
  expiresAt: string;
  createdAt: string;
  _count: { thanksCards: number };
}

export async function fetchQrStory(token: string): Promise<QrStoryData> {
  return apiClient<QrStoryData>(`/qr-thanks/story/${token}`);
}

export async function submitQrThanks(
  token: string,
  body?: { senderDisplayName?: string; message?: string },
): Promise<QrThanksResult> {
  return apiClient<QrThanksResult>(`/qr-thanks/story/${token}/thanks`, {
    method: 'POST',
    body: body ?? {},
  });
}

export async function createQrToken(
  data: CreateTokenRequest,
): Promise<CreateTokenResult> {
  return apiClient<CreateTokenResult>('/qr-thanks/tokens', {
    method: 'POST',
    body: data,
    auth: true,
  });
}

export async function fetchQrTokens(): Promise<QrTokenListItem[]> {
  return apiClient<QrTokenListItem[]>('/qr-thanks/tokens', { auth: true });
}
