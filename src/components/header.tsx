'use client';

import { Menu } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useSidebar } from '@/lib/sidebar-context';
import { ThemeToggle } from './theme-toggle';

interface HeaderProps {
  title: string;
  description?: string;
}

export function Header({ title, description }: HeaderProps) {
  const { username, role } = useAuth();
  const { toggle } = useSidebar();

  return (
    <header className="flex items-center justify-between gap-4">
      {/* Left section: Menu button + Title */}
      <div className="flex items-center gap-4 min-w-0">
        {/* Mobile menu button */}
        <button
          onClick={toggle}
          className="lg:hidden p-2 -ml-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-dark)] hover:bg-[var(--sidebar-hover-bg)] transition-colors flex-shrink-0"
          aria-label="Open menu"
        >
          <Menu size={24} />
        </button>

        {/* Title */}
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-[28px] font-semibold truncate text-[var(--text-dark)]">{title}</h1>
          {description && (
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 truncate">{description}</p>
          )}
        </div>
      </div>

      {/* Right section: Theme toggle + User info */}
      <div className="flex items-center gap-3 sm:gap-5 flex-shrink-0">
        {/* Theme toggle */}
        <div className="flex items-center gap-5 bg-[var(--card-bg)] px-3 sm:px-4 py-1.5 rounded-[30px] border border-[var(--border)]">
          <ThemeToggle />
        </div>

        {/* User avatar and info */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="w-[36px] h-[36px] sm:w-[45px] sm:h-[45px] rounded-full bg-[var(--accent)] flex items-center justify-center text-white font-semibold text-xs sm:text-sm flex-shrink-0">
            {username?.charAt(0).toUpperCase()}
          </div>
          {/* Hide user details on very small screens */}
          <div className="hidden sm:block text-sm text-right">
            <div className="font-medium text-[var(--text-dark)]">{username}</div>
            <div className="text-[var(--text-muted)] text-xs">{role}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
