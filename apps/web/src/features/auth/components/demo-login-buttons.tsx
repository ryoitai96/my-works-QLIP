'use client';

interface DemoAccount {
  label: string;
  email: string;
  password: string;
}

const demoGroups: { title: string; accounts: DemoAccount[] }[] = [
  {
    title: 'スーパーアドミン',
    accounts: [
      { label: '管理太郎', email: 'admin@sann.co.jp', password: 'password123' },
    ],
  },
  {
    title: 'ジョブコーチ',
    accounts: [
      { label: '指導花子', email: 'coach@sann.co.jp', password: 'password123' },
    ],
  },
  {
    title: 'メンバー',
    accounts: [
      { label: '田中一郎', email: 'tanaka@sann.co.jp', password: 'password123' },
      { label: '鈴木次郎', email: 'suzuki@sann.co.jp', password: 'password123' },
    ],
  },
];

interface DemoLoginButtonsProps {
  onSelect: (email: string, password: string) => void;
}

export function DemoLoginButtons({ onSelect }: DemoLoginButtonsProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-gray-50 px-3 text-gray-500">デモアカウント</span>
        </div>
      </div>

      <div className="space-y-3">
        {demoGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-1.5 text-xs font-medium text-gray-500">
              {group.title}
            </p>
            <div className="flex gap-2">
              {group.accounts.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  onClick={() => onSelect(account.email, account.password)}
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {account.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
