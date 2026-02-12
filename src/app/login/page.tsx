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
    <div className="w-full h-full flex items-center justify-center p-4">
      <div className="bg-panel-light dark:bg-panel rounded-2xl sm:rounded-window p-6 sm:p-8 w-full max-w-sm shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-black/5 dark:border-white/5">
        <h1 className="text-2xl font-bold mb-1 bg-gradient-to-r from-accent-pink to-accent-coral bg-clip-text text-transparent">
          S4 Admin
        </h1>
        <p className="text-sm text-muted mb-6">Sign in to manage your storage server</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-light dark:bg-surface border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-accent-pink/50"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface-light dark:bg-surface border border-black/10 dark:border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-accent-pink/50"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-accent-pink to-accent-coral text-white font-medium text-sm shadow-[0_4px_15px_rgba(255,75,145,0.3)] hover:shadow-[0_6px_20px_rgba(255,75,145,0.5)] hover:-translate-y-0.5 transition-all disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
