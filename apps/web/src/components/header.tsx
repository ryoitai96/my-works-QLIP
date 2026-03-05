'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ROLE_LABELS, type RoleId } from '@qlip/shared';

import { authStore, type UserInfo } from '../features/auth/auth-store';
import { isMemberRole, isClientRole } from '../features/auth/role-check';
import { MemberAvatar } from './member-avatar';

export function Header() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    setUser(authStore.getUser());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!showDropdown) return;
    const handleClick = () => setShowDropdown(false);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [showDropdown]);

  const handleLogout = () => {
    authStore.removeToken();
    router.push('/');
  };

  const getInitial = (name: string) => name.charAt(0);

  const getMyPageHref = (role: string) => {
    if (isMemberRole(role)) return '/members/me';
    if (isClientRole(role)) return '/client-settings/profile';
    return '/settings';
  };

  return (
    <header className="fixed top-0 right-0 left-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
      {/* Left: Logo + Company name */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <svg
            className="h-7 w-7 shrink-0"
            viewBox="0 0 40 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="20" cy="6" r="4.5" fill="#D03A2F" />
            <polygon points="10,13 28,13 30,17 10,17" fill="#E8922F" />
            <polygon points="10,20 26,20 28,24 10,24" fill="#8AB535" />
            <rect x="16" y="27" width="8" height="9" rx="1" fill="#2E7D4F" />
          </svg>
          <span className="text-xl font-bold tracking-wide text-gray-900">
            QLIP
          </span>
        </div>
        {mounted && user?.tenantName && (
          <span className="text-base font-medium text-gray-700">{user.tenantName}</span>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Help & Support */}
        <Link
          href="/help"
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
            />
          </svg>
          <span className="hidden sm:inline">ヘルプ＆サポート</span>
        </Link>

        {/* Language placeholder */}
        <div className="flex items-center gap-1 rounded-md px-2 py-1.5 text-sm font-medium text-gray-700">
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
            />
          </svg>
          <span className="text-sm font-medium">JP</span>
        </div>

        {/* Notification bell */}
        <button
          className="rounded-md p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-800"
          aria-label="お知らせ"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
            />
          </svg>
        </button>

        {/* Divider */}
        <div className="mx-1 h-6 w-px bg-gray-200" />

        {/* Avatar dropdown */}
        {mounted && user && (
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowDropdown(!showDropdown);
              }}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-gray-100"
            >
              {isMemberRole(user.role) && user.avatarId ? (
                <MemberAvatar avatarId={user.avatarId} size="sm" />
              ) : (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#ffc000] text-xs font-semibold text-gray-900">
                  {getInitial(user.name)}
                </div>
              )}
              <svg
                className="h-4 w-4 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
            </button>

            {/* Dropdown menu */}
            {showDropdown && (
              <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
                <Link
                  href={getMyPageHref(user.role)}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <svg
                    className="h-5 w-5 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                    />
                  </svg>
                  マイページ
                </Link>
                <div className="mx-3 my-1 border-t border-gray-100" />
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <svg
                    className="h-5 w-5 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
                    />
                  </svg>
                  ログアウト
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
