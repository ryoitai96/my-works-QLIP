import { apiClient } from '../../lib/api-client';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    name: string;
    role: string;
    email: string;
    tenantName: string | null;
    avatarId: string | null;
  };
}

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  return apiClient<LoginResponse>('/auth/login', {
    method: 'POST',
    body: credentials,
  });
}
