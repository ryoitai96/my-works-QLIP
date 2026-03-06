import type { Metadata } from 'next';

import { LoginPageContent } from '../../features/auth/components/login-page-content';

export const metadata: Metadata = {
  title: 'ログイン | QLIP by My WORKS',
};

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
      <div className="w-full max-w-sm space-y-10">
        {/* Brand */}
        <div className="flex flex-col items-center">
          <svg
            className="mb-5 h-16 w-16"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="20" cy="6" r="4.5" fill="#D03A2F" />
            <polygon points="10,13 28,13 30,17 10,17" fill="#E8922F" />
            <polygon points="10,20 26,20 28,24 10,24" fill="#8AB535" />
            <rect x="16" y="27" width="8" height="9" rx="1" fill="#2E7D4F" />
          </svg>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            QLIP
          </h1>
          <p className="mt-1 text-sm font-medium text-gray-400">by My WORKS</p>
        </div>

        {/* Login heading */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">ログイン</h2>
          <p className="mt-1 text-sm text-gray-500">
            アカウント情報を入力してください
          </p>
        </div>

        <LoginPageContent />
      </div>

      <footer className="mt-16 pb-8 text-center text-xs text-gray-300">
        &copy; 2026 QLIP Inc.
      </footer>
    </div>
  );
}
