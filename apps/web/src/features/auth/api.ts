import { apiClient } from '../../lib/api-client';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  user: { name: string; role: string; email: string };
}

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  return apiClient<LoginResponse>('/auth/login', {
    method: 'POST',
    body: credentials,
  });
}
