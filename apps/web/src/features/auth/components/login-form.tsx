'use client';

import { useRouter } from 'next/navigation';
import { type FormEvent, useState } from 'react';

import { Role, STAFF_ROLES, type RoleId } from '@qlip/shared';
import { ApiClientError } from '../../../lib/api-client';
import { login } from '../api';
import { authStore } from '../auth-store';

interface LoginFormProps {
  email: string;
  password: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
}

export function LoginForm({ email, password, onEmailChange, onPasswordChange }: LoginFormProps) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit = email.trim() !== '' && password !== '' && !isLoading;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { accessToken, user } = await login({ email: email.trim(), password });
      authStore.setToken(accessToken);
      authStore.setUser(user);

      const role = user.role as RoleId;
      const isStaff =
        (STAFF_ROLES as readonly string[]).includes(role);

      let redirectPath: string;
      if (isStaff) {
        redirectPath = '/dashboard';
      } else if (role === Role.CLIENT_HR) {
        redirectPath = '/client-dashboard';
      } else if (role === Role.CLIENT_EMPLOYEE) {
        redirectPath = '/thanks';
      } else {
        redirectPath = '/health-check';
      }
      router.push(redirectPath);
    } catch (err) {
      if (err instanceof ApiClientError && err.statusCode === 401) {
        setError('メールアドレスまたはパスワードが正しくありません。');
      } else {
        setError('ログインに失敗しました。しばらく経ってから再度お試しください。');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-5">
      {error && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          メールアドレス
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 ring-offset-2 focus:border-[#ffc000] focus:outline-none focus:ring-2 focus:ring-[#ffc000]/30"
          placeholder="you@example.com"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          パスワード
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 ring-offset-2 focus:border-[#ffc000] focus:outline-none focus:ring-2 focus:ring-[#ffc000]/30"
          placeholder="パスワード"
        />
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className="w-full rounded-lg bg-[#ffc000] px-4 py-2.5 text-sm font-semibold text-gray-900 transition-all hover:bg-[#e6ad00] focus:outline-none focus:ring-2 focus:ring-[#ffc000]/40 focus:ring-offset-2 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
      >
        {isLoading ? 'ログイン中...' : 'ログイン'}
      </button>
    </form>
  );
}
