import type { Metadata } from 'next';

import { LoginForm } from '../../features/auth/components/login-form';

export const metadata: Metadata = {
  title: 'ログイン | QLIP',
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">QLIP</h1>
          <p className="mt-1 text-sm text-gray-500">
            HR-ESGプラットフォーム
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
