'use client';

interface StatCardProps {
  title: string;
  mainValue: string | number;
  mainLabel: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
}

export function StatCard({ title, mainValue, mainLabel, icon, children }: StatCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-500">{title}</h3>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ffc000]/10 text-[#ffc000]">
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{mainValue}</p>
      <p className="mt-1 text-sm text-gray-500">{mainLabel}</p>
      {children && <div className="mt-4 border-t border-gray-100 pt-4">{children}</div>}
    </div>
  );
}
