'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Database, Users, Key, LogOut, X } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useSidebar } from '@/lib/sidebar-context';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/buckets', label: 'Buckets', icon: Database },
  { href: '/users', label: 'Users', icon: Users },
  { href: '/keys', label: 'Keys', icon: Key },
] as const;

interface NavLinkProps {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  isActive: boolean;
  onClick?: () => void;
}

function NavLink({ href, label, icon: Icon, isActive, onClick }: NavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center p-[15px] rounded-[var(--radius-sm)] font-medium transition-colors ${
        isActive
          ? 'bg-[var(--sidebar-active-bg)] text-white shadow-[var(--shadow-card)]'
          : 'text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover-bg)] hover:text-white'
      }`}
    >
      <span className={`w-5 mr-[15px] flex justify-center ${isActive ? 'text-[var(--accent)]' : ''}`}>
        <Icon size={20} />
      </span>
      {label}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { isOpen, close } = useSidebar();

  const handleNavClick = () => {
    close();
  };

  const handleLogout = () => {
    close();
    logout();
  };

  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-50
          w-[280px] lg:w-[260px] flex-shrink-0
          border-r border-[var(--border)]
          bg-[var(--sidebar-bg)]
          flex flex-col py-[30px] px-[20px]
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:transform-none
        `}
      >
        {/* Header with close button on mobile */}
        <div className="mb-[50px] flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-[var(--sidebar-title)]">
            S4 Admin
          </h1>
          <button
            onClick={close}
            className="lg:hidden p-2 rounded-lg text-[var(--sidebar-text)] hover:text-white hover:bg-[var(--sidebar-hover-bg)] transition-colors"
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-2.5">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);

            return (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                isActive={isActive}
                onClick={handleNavClick}
              />
            );
          })}
        </nav>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="flex items-center p-[15px] rounded-[var(--radius-sm)] font-medium text-[var(--sidebar-text)] hover:bg-[var(--sidebar-hover-bg)] hover:text-white transition-colors w-full"
        >
          <span className="w-5 mr-[15px] flex justify-center">
            <LogOut size={20} />
          </span>
          Logout
        </button>
      </aside>
    </>
  );
}
