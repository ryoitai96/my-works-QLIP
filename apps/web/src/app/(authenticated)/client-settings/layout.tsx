'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const subNavItems = [
  { href: '/client-settings/profile', label: '企業プロフィール' },
  { href: '/client-settings/members', label: 'ユーザー管理' },
  { href: '/client-settings/teams', label: 'チーム設定' },
];

export default function ClientSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/50 to-gray-50">
      <div className="mx-auto max-w-5xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">設定</h1>

        <div className="flex gap-6">
          {/* Sub-navigation */}
          <nav className="w-48 shrink-0">
            <ul className="space-y-1">
              {subNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[#ffc000]/10 text-[#8a6800]'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Content */}
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
