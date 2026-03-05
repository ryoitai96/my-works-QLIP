'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Role, type TenantServiceKey } from '@qlip/shared';

import { authStore, type UserInfo } from '../features/auth/auth-store';
import { isClientRole, isClientHR, isStaffRole } from '../features/auth/role-check';
import { useTenantServices } from '../features/auth/tenant-services-context';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  serviceKey?: TenantServiceKey;
}

const mainNavItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'ダッシュボード',
    icon: (
      <svg
        className="h-5 w-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
        />
      </svg>
    ),
  },
  {
    href: '/members',
    label: '従業員管理',
    icon: (
      <svg
        className="h-5 w-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
        />
      </svg>
    ),
  },
  {
    href: '/attendance',
    label: '勤怠管理',
    serviceKey: 'attendance',
    icon: (
      <svg
        className="h-5 w-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    href: '/health-check',
    label: '体調入力',
    serviceKey: 'health_check',
    icon: (
      <svg
        className="h-5 w-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
        />
      </svg>
    ),
  },
  {
    href: '/assessment',
    label: 'アセスメント',
    serviceKey: 'assessment',
    icon: (
      <svg
        className="h-5 w-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6"
        />
      </svg>
    ),
  },
  {
    href: '/micro-tasks',
    label: 'マイクロタスク',
    serviceKey: 'micro_task',
    icon: (
      <svg
        className="h-5 w-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
        />
      </svg>
    ),
  },
  {
    href: '/production',
    label: '注文管理',
    serviceKey: 'flower_order',
    icon: (
      <svg
        className="h-5 w-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z"
        />
      </svg>
    ),
  },
  {
    href: '/messages',
    label: 'メッセージ',
    serviceKey: 'message',
    icon: (
      <svg
        className="h-5 w-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
        />
      </svg>
    ),
  },
  {
    href: '/thanks',
    label: '感謝一覧',
    serviceKey: 'thanks',
    icon: (
      <svg
        className="h-5 w-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    ),
  },
];

const adminNavItems: NavItem[] = [
  {
    href: '/admin/tenants',
    label: '企業管理',
    icon: (
      <svg
        className="h-5 w-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
        />
      </svg>
    ),
  },
  {
    href: '/admin/users',
    label: '個人管理',
    icon: (
      <svg
        className="h-5 w-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
        />
      </svg>
    ),
  },
  {
    href: '/products',
    label: '商品管理',
    icon: (
      <svg
        className="h-5 w-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1012 10.125 2.625 2.625 0 0012 4.875zm0 0v5.25m0 0h4.5m-4.5 0H7.5"
        />
      </svg>
    ),
  },
  {
    href: '/orders',
    label: '注文管理',
    icon: (
      <svg
        className="h-5 w-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z"
        />
      </svg>
    ),
  },
];

const orderNavItem: NavItem = {
  href: '/orders',
  label: '花を注文',
  serviceKey: 'flower_order',
  icon: (
    <svg
      className="h-5 w-5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1012 10.125 2.625 2.625 0 0012 4.875zm0 0v5.25m0 0h4.5m-4.5 0H7.5"
      />
    </svg>
  ),
};

/** R04（企業人事）向けナビゲーション */
const clientHRNavItems: NavItem[] = [
  {
    href: '/client-dashboard',
    label: 'ダッシュボード',
    icon: (
      <svg
        className="h-5 w-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
        />
      </svg>
    ),
  },
  {
    href: '/attendance',
    label: '勤怠承認',
    serviceKey: 'attendance',
    icon: (
      <svg
        className="h-5 w-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    href: '/members',
    label: '従業員管理',
    icon: (
      <svg
        className="h-5 w-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
        />
      </svg>
    ),
  },
  orderNavItem,
  {
    href: '/messages',
    label: 'メッセージ',
    serviceKey: 'message',
    icon: (
      <svg
        className="h-5 w-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
        />
      </svg>
    ),
  },
  {
    href: '/thanks',
    label: '感謝一覧',
    serviceKey: 'thanks',
    icon: (
      <svg
        className="h-5 w-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    ),
  },
];

/** R05（企業一般社員）向けナビゲーション */
const clientEmployeeNavItems: NavItem[] = [
  orderNavItem,
  {
    href: '/thanks',
    label: '感謝一覧',
    serviceKey: 'thanks',
    icon: (
      <svg
        className="h-5 w-5 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    ),
  },
];

const settingsItem = {
  href: '/settings',
  label: '設定',
  icon: (
    <svg
      className="h-5 w-5 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
};

function NavLink({
  href,
  label,
  icon,
  isActive,
  isCollapsed,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  isCollapsed: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        aria-current={isActive ? 'page' : undefined}
        title={isCollapsed ? label : undefined}
        className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150 ${
          isActive
            ? 'bg-gray-100 text-gray-900 font-semibold'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
        } ${isCollapsed ? 'justify-center px-0' : ''}`}
      >
        {icon}
        {!isCollapsed && <span className="truncate">{label}</span>}
      </Link>
    </li>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { isServiceEnabled } = useTenantServices();

  useEffect(() => {
    setUser(authStore.getUser());
    setMounted(true);
  }, []);

  /** Filter nav items: hide items whose serviceKey is disabled (R01/R02 bypass via context) */
  const filterByService = (items: NavItem[]) =>
    items.filter((item) => !item.serviceKey || isServiceEnabled(item.serviceKey));

  return (
    <aside
      className={`flex h-full shrink-0 flex-col border-r border-gray-200 bg-white transition-all duration-200 ${
        isCollapsed ? 'w-16' : 'w-56'
      }`}
    >
      {/* Main Navigation */}
      <nav
        aria-label="メインナビゲーション"
        className={`flex-1 py-4 ${isCollapsed ? 'px-2' : 'px-3'}`}
      >
        {mounted && user?.role && isClientRole(user.role) ? (
          <ul className="space-y-0.5">
            {filterByService(isClientHR(user.role) ? clientHRNavItems : clientEmployeeNavItems).map(
              ({ href, label, icon }) => (
                <NavLink
                  key={href}
                  href={href}
                  label={label}
                  icon={icon}
                  isActive={pathname === href || pathname.startsWith(href + '/')}
                  isCollapsed={isCollapsed}
                />
              ),
            )}
          </ul>
        ) : (
          <>
            <ul className="space-y-0.5">
              {filterByService(mainNavItems)
                .filter(({ href }) => {
                  // R03: 「従業員管理」を非表示（代わりに「マイページ」を使う）
                  if (href === '/members' && user?.role === Role.MEMBER) {
                    return false;
                  }
                  // R03 only: 制作管理
                  if (href === '/production' && user?.role !== Role.MEMBER) {
                    return false;
                  }
                  if (user?.role === Role.JOB_COACH) {
                    return !['/health-check', '/assessment', '/thanks'].includes(href);
                  }
                  return true;
                })
                .map(({ href, label, icon }) => (
                  <NavLink
                    key={href}
                    href={href}
                    label={label}
                    icon={icon}
                    isActive={pathname === href || pathname.startsWith(href + '/')}
                    isCollapsed={isCollapsed}
                  />
                ))}
              {mounted && user?.role === Role.MEMBER && (
                <NavLink
                  href="/members/me"
                  label="マイページ"
                  icon={
                    <svg
                      className="h-5 w-5 shrink-0"
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
                  }
                  isActive={pathname === '/members/me'}
                  isCollapsed={isCollapsed}
                />
              )}
            </ul>

            {mounted && user?.role && isStaffRole(user.role) && (
              <>
                <div className="mx-1 my-3 border-t border-gray-200" />
                {!isCollapsed && (
                  <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                    管理
                  </p>
                )}
                <ul className="space-y-0.5">
                  {adminNavItems.map(({ href, label, icon }) => (
                    <NavLink
                      key={href}
                      href={href}
                      label={label}
                      icon={icon}
                      isActive={pathname.startsWith(href)}
                      isCollapsed={isCollapsed}
                    />
                  ))}
                </ul>
              </>
            )}
          </>
        )}
      </nav>

      {/* Bottom: Settings + Collapse */}
      <div className={`${isCollapsed ? 'px-2' : 'px-3'} pb-1`}>
        <div className="border-t border-gray-200 pt-2">
          <ul>
            <NavLink
              href={
                mounted && user?.role && isClientRole(user.role)
                  ? '/client-settings/profile'
                  : settingsItem.href
              }
              label={settingsItem.label}
              icon={settingsItem.icon}
              isActive={
                pathname === '/settings' ||
                pathname.startsWith('/client-settings')
              }
              isCollapsed={isCollapsed}
            />
          </ul>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`mt-0.5 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-gray-400 transition-all duration-150 hover:bg-gray-100 hover:text-gray-500 ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            aria-label={isCollapsed ? 'サイドバーを開く' : 'サイドバーを閉じる'}
          >
            {isCollapsed ? (
              <svg
                className="h-5 w-5 shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            ) : (
              <>
                <svg
                  className="h-5 w-5 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18.75 19.5l-7.5-7.5 7.5-7.5m-6 15L4.5 12l7.5-7.5"
                  />
                </svg>
                <span>閉じる</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Footer links */}
      {!isCollapsed && (
        <div className="px-5 pb-4 pt-1">
          <div className="flex flex-col gap-1 text-[10px] text-gray-400">
            <a
              href="https://www.sann.co.jp/privacy/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-gray-600"
            >
              利用規約
            </a>
            <a
              href="https://www.sann.co.jp/privacy/"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-gray-600"
            >
              プライバシーポリシー
            </a>
          </div>
        </div>
      )}
    </aside>
  );
}
