'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { SidebarProvider } from '@/lib/sidebar-context';
import { Sidebar } from '@/components/sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) return null;

  return (
    <SidebarProvider>
      <div className="w-full h-full lg:w-[95%] lg:h-[92%] bg-sidebar-light dark:bg-sidebar lg:rounded-window shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 bg-surface-light dark:bg-surface overflow-y-auto py-4 px-4 sm:py-6 sm:px-6 lg:py-[30px] lg:px-[40px] flex flex-col gap-4 sm:gap-6 lg:gap-[30px]">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
