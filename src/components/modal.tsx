'use client';

import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-[var(--card-bg)] rounded-[var(--radius-card)] p-6 w-full max-w-md shadow-2xl border border-[var(--border)]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--text-dark)]">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-[var(--sidebar-hover-bg)] rounded-lg transition-colors text-[var(--text-muted)]">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
