import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { DesignProvider } from '@/lib/design-context';
import { ToastProvider } from '@/components/toast-provider';

export const metadata: Metadata = {
  title: 'S4 Admin Console',
  description: 'S4 Storage Server Administration',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <DesignProvider>
          <AuthProvider>
            {children}
            <ToastProvider />
          </AuthProvider>
        </DesignProvider>
      </body>
    </html>
  );
}
