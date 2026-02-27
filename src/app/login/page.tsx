'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      router.push('/');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center p-4 bg-[var(--bg)]">
      <div className="bg-[var(--card-bg)] rounded-[var(--radius-card)] sm:rounded-[var(--radius-window,var(--radius-card))] p-6 sm:p-8 w-full max-w-sm shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-[var(--border)]">
        <h1 className="text-2xl font-bold mb-1 text-[var(--accent)]">
          S4 Admin
        </h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">Sign in to manage your storage server</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-dark)]">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] bg-[var(--input-bg)] border border-[var(--input-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 text-[var(--text-dark)]"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-dark)]">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] bg-[var(--input-bg)] border border-[var(--input-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 text-[var(--text-dark)]"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-[var(--radius-sm)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium text-sm shadow-[var(--shadow-card)] hover:-translate-y-0.5 transition-all disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
