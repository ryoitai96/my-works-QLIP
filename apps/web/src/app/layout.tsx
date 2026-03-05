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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
