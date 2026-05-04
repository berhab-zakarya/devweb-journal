import type { Metadata } from 'next';
import { QueryProvider } from '@/shared/tanstack/providers';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';
import { primaryFont } from '@/shared/fonts/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'DevWeb Journal',
  description: 'Academic Journal Editorial System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${primaryFont.variable} font-primary`}>
        <QueryProvider>
          <ErrorBoundary>{children}</ErrorBoundary>
        </QueryProvider>
      </body>
    </html>
  );
}
