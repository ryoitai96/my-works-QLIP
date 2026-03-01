import { apiClient } from '../../lib/api-client';

export interface HealthCheckData {
  id: string;
  mood: number;
  sleep: number;
  condition: number;
  note: string | null;
  streakDays: number;
  recordDate: string;
  createdAt: string;
}

export interface SubmitHealthCheckRequest {
  mood: number;
  sleep: number;
  condition: number;
  note?: string;
}

export interface SubmitHealthCheckResponse extends HealthCheckData {
  isUpdate: boolean;
}

export async function fetchTodayHealthCheck(): Promise<HealthCheckData | null> {
  return apiClient<HealthCheckData | null>('/health-checks/today', {
    auth: true,
  });
}

export async function submitHealthCheck(
  data: SubmitHealthCheckRequest,
): Promise<SubmitHealthCheckResponse> {
  return apiClient<SubmitHealthCheckResponse>('/health-checks', {
    method: 'POST',
    body: data,
    auth: true,
  });
}
