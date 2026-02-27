'use client';

import { useEffect, useState, useCallback } from 'react';
import { Header } from '@/components/header';
import { Modal } from '@/components/modal';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { apiFetch } from '@/lib/api';
import { User, S3Credentials } from '@/lib/types';
import { Plus, Trash2, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const BTN_PRIMARY = 'flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-sm)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium shadow-[var(--shadow-card)] hover:-translate-y-0.5 transition-all';
const BTN_SECONDARY = 'px-4 py-2 text-sm rounded-[var(--radius-sm)] border border-[var(--border)] hover:bg-[var(--sidebar-hover-bg)] transition-colors text-[var(--text-dark)]';
const INPUT_STYLES = 'w-full px-4 py-2.5 rounded-[var(--radius-sm)] bg-[var(--input-bg)] border border-[var(--input-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 text-[var(--text-dark)]';
const TABLE_CARD = 'bg-[var(--card-bg)] rounded-[var(--radius-card)] border border-[var(--border)] overflow-hidden overflow-x-auto shadow-[var(--shadow-card)]';
const TR_BORDER = 'border-b border-[var(--border)]';
const TR_HOVER = `${TR_BORDER} hover:bg-black/[.02] dark:hover:bg-white/[.02]`;

export default function KeysPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showGenerate, setShowGenerate] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [credentials, setCredentials] = useState<S3Credentials | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const load = useCallback(() => {
    apiFetch<{ users: User[] }>('/admin/users')
      .then((r) => setUsers(r.users))
      .catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const usersWithKeys = users.filter((u) => u.access_key);

  const handleGenerate = async () => {
    if (!selectedUserId) return;
    setLoading(true);
    try {
      const creds = await apiFetch<S3Credentials>(`/admin/users/${selectedUserId}/credentials`, {
        method: 'POST',
      });
      setCredentials(creds);
      toast.success('Credentials generated');
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      await apiFetch(`/admin/users/${deleteTarget.id}/credentials`, { method: 'DELETE' });
      toast.success('Credentials deleted');
      setDeleteTarget(null);
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete credentials');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <>
      <Header title="API Keys" description="Manage S3 access credentials" />
      <div className="mb-4">
        <button
          onClick={() => {
            setShowGenerate(true);
            setCredentials(null);
            setSelectedUserId('');
          }}
          className={BTN_PRIMARY}
        >
          <Plus size={16} /> Generate Keys
        </button>
      </div>

      <div className={TABLE_CARD}>
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr className={TR_BORDER}>
              <th className="text-left px-6 py-3 text-[var(--text-muted)] font-medium">Username</th>
              <th className="text-left px-6 py-3 text-[var(--text-muted)] font-medium">Access Key</th>
              <th className="text-left px-6 py-3 text-[var(--text-muted)] font-medium">Status</th>
              <th className="text-right px-6 py-3 text-[var(--text-muted)] font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {usersWithKeys.map((u) => (
              <tr key={u.id} className={TR_HOVER}>
                <td className="px-6 py-3 font-medium text-[var(--text-dark)]">{u.username}</td>
                <td className="px-6 py-3 font-mono text-xs text-[var(--text-dark)]">{u.access_key}</td>
                <td className="px-6 py-3">
                  <span className="text-green-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400" /> Active
                  </span>
                </td>
                <td className="px-6 py-3 text-right">
                  <button onClick={() => setDeleteTarget(u)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {usersWithKeys.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-[var(--text-muted)]">No API keys found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Generate Keys Modal */}
      <Modal open={showGenerate} onClose={() => setShowGenerate(false)} title={credentials ? 'Credentials Generated' : 'Generate API Keys'}>
        {!credentials ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-[var(--text-dark)]">Select User</label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className={INPUT_STYLES}
              >
                <option value="">Choose a user...</option>
                {users.filter((u) => !u.access_key).map((u) => (
                  <option key={u.id} value={u.id}>{u.username} ({u.role})</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowGenerate(false)} className={BTN_SECONDARY}>
                Cancel
              </button>
              <button onClick={handleGenerate} disabled={!selectedUserId || loading} className="px-4 py-2 text-sm rounded-[var(--radius-sm)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium transition-opacity disabled:opacity-50">
                {loading ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-[var(--radius-sm)] text-sm text-yellow-600 dark:text-yellow-300">
              Save these credentials now. The secret key will not be shown again.
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-[var(--text-dark)]">Access Key</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 rounded-[var(--radius-sm)] bg-[var(--input-bg)] text-xs font-mono break-all text-[var(--text-dark)]">
                  {credentials.access_key}
                </code>
                <button onClick={() => copyToClipboard(credentials.access_key, 'access')} className="p-2 rounded-lg hover:bg-[var(--sidebar-hover-bg)] transition-colors text-[var(--text-muted)]">
                  {copiedField === 'access' ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-[var(--text-dark)]">Secret Key</label>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-3 py-2 rounded-[var(--radius-sm)] bg-[var(--input-bg)] text-xs font-mono break-all text-[var(--text-dark)]">
                  {credentials.secret_key}
                </code>
                <button onClick={() => copyToClipboard(credentials.secret_key, 'secret')} className="p-2 rounded-lg hover:bg-[var(--sidebar-hover-bg)] transition-colors text-[var(--text-muted)]">
                  {copiedField === 'secret' ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={() => setShowGenerate(false)} className="px-4 py-2 text-sm rounded-[var(--radius-sm)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium transition-opacity">
                Done
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Credentials"
        message={`Are you sure you want to delete API keys for "${deleteTarget?.username}"?`}
        loading={loading}
      />
    </>
  );
}
