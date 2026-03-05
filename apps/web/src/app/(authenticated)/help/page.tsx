import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '利用方法 | QLIP',
};

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50/50 to-gray-50">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">利用方法</h1>
        <div className="rounded-xl bg-white p-8 text-center shadow-sm">
          <p className="text-gray-500">準備中です</p>
        </div>
      </div>
    </div>
  );
}
