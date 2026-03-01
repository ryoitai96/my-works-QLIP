import type { Metadata } from 'next';

import { LoginPageContent } from '../../features/auth/components/login-page-content';

export const metadata: Metadata = {
  title: 'ログイン | My WORKS by QLIP',
};

export default function Home() {
  return (
    <div className="flex min-h-screen">
      {/* Left — Brand Panel */}
      <div className="hidden flex-col justify-between bg-gradient-to-br from-[#ffc000] via-[#ffce3a] to-[#e6ac00] lg:flex lg:w-1/2">
        <div className="flex flex-1 flex-col items-center justify-center px-12">
          {/* Signpost logo (same as sidebar) */}
          <svg
            className="mb-6 h-20 w-20 drop-shadow-lg"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="20" cy="6" r="4.5" fill="#D03A2F" />
            <polygon points="10,13 28,13 30,17 10,17" fill="#E8922F" />
            <polygon points="10,20 26,20 28,24 10,24" fill="#8AB535" />
            <rect x="16" y="27" width="8" height="9" rx="1" fill="#2E7D4F" />
          </svg>
          <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
            My WORKS
          </h1>
          <p className="mt-1 text-sm font-medium text-white/80">by QLIP</p>
          <p className="mt-6 max-w-xs text-center text-base leading-relaxed text-white/90">
            一人ひとりの強みを活かし、
            <br />
            働きがいのある職場をつくる。
          </p>
        </div>
        <footer className="px-12 pb-6 text-center text-xs text-white/60">
          &copy; 2026 QLIP Inc.
        </footer>
      </div>

      {/* Right — Login Form */}
      <div className="flex w-full flex-col items-center justify-center bg-gray-50 px-6 lg:w-1/2">
        {/* Mobile-only brand header */}
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <svg
            className="h-10 w-10"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="20" cy="6" r="4.5" fill="#D03A2F" />
            <polygon points="10,13 28,13 30,17 10,17" fill="#E8922F" />
            <polygon points="10,20 26,20 28,24 10,24" fill="#8AB535" />
            <rect x="16" y="27" width="8" height="9" rx="1" fill="#2E7D4F" />
          </svg>
          <div>
            <p className="text-xl font-bold leading-tight text-gray-900">
              My WORKS
            </p>
            <p className="text-[10px] font-medium text-gray-400">by QLIP</p>
          </div>
        </div>

        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">ログイン</h2>
            <p className="mt-1 text-sm text-gray-500">
              アカウント情報を入力してください
            </p>
          </div>

          <LoginPageContent />
        </div>
      </div>
    </div>
  );
}
