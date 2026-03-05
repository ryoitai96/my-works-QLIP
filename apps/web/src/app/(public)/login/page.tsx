import type { Metadata } from 'next';

import { LoginPageContent } from '../../../features/auth/components/login-page-content';

export const metadata: Metadata = {
  title: 'ログイン | QLIP',
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-3">
            <svg className="h-14 w-14" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="6" r="4.5" fill="#D03A2F" />
              <polygon points="10,13 28,13 30,17 10,17" fill="#E8922F" />
              <polygon points="10,20 26,20 28,24 10,24" fill="#8AB535" />
              <rect x="16" y="27" width="8" height="9" rx="1" fill="#2E7D4F" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">QLIP</h1>
          <p className="mt-1 text-sm text-gray-400">
            HR-ESGプラットフォーム
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <LoginPageContent />
        </div>
      </div>
    </main>
  );
}
