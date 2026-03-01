import { apiClient } from '../../lib/api-client';

export interface ThanksCard {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  category: string;
  createdAt: string;
  fromUser: { id: string; name: string };
}

export interface SendThanksRequest {
  toUserId: string;
  content: string;
  category: string;
}

export async function fetchReceivedThanks(): Promise<ThanksCard[]> {
  return apiClient<ThanksCard[]>('/thanks', { auth: true });
}

export async function sendThanks(data: SendThanksRequest): Promise<ThanksCard> {
  return apiClient<ThanksCard>('/thanks', {
    method: 'POST',
    body: data,
    auth: true,
  });
}
