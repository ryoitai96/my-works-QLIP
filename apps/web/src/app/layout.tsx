import type { Metadata } from 'next';
import { ToastProvider } from '../components/toast';
import './globals.css';

export const metadata: Metadata = {
  title: 'QLIP - HR-ESGプラットフォーム',
  description: '障害者雇用マネジメントを支えるHR-ESGプラットフォーム',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
