'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Modal } from '@/components/modal';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { apiFetch } from '@/lib/api';
import { BucketStatsResponse, BucketStat } from '@/lib/types';
import { Plus, Trash2, FolderOpen } from 'lucide-react';
import toast from 'react-hot-toast';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

const BTN_PRIMARY = 'flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-sm)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium shadow-[var(--shadow-card)] hover:-translate-y-0.5 transition-all';
const BTN_SECONDARY = 'px-4 py-2 text-sm rounded-[var(--radius-sm)] border border-[var(--border)] hover:bg-[var(--sidebar-hover-bg)] transition-colors text-[var(--text-dark)]';
const INPUT_STYLES = 'w-full px-4 py-2.5 rounded-[var(--radius-sm)] bg-[var(--input-bg)] border border-[var(--input-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 text-[var(--text-dark)]';
const TABLE_CARD = 'bg-[var(--card-bg)] rounded-[var(--radius-card)] border border-[var(--border)] overflow-hidden overflow-x-auto shadow-[var(--shadow-card)]';
const TR_BORDER = 'border-b border-[var(--border)]';
const TR_HOVER = `${TR_BORDER} hover:bg-black/[.02] dark:hover:bg-white/[.02]`;

export default function BucketsPage() {
  const [buckets, setBuckets] = useState<BucketStat[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(() => {
    apiFetch<BucketStatsResponse>('/admin/bucket-stats')
      .then((r) => setBuckets(r.buckets.sort((a, b) => a.name.localeCompare(b.name))))
      .catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await apiFetch(`/admin/buckets/${newName}`, { method: 'PUT' });
      toast.success(`Bucket "${newName}" created`);
      setShowCreate(false);
      setNewName('');
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create bucket');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiFetch(`/admin/buckets/${deleteTarget}`, { method: 'DELETE' });
      toast.success(`Bucket "${deleteTarget}" deleted`);
      setDeleteTarget(null);
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete bucket');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Header title="Buckets" description="Manage storage buckets" />
      <div className="mb-4">
        <button onClick={() => setShowCreate(true)} className={BTN_PRIMARY}>
          <Plus size={16} /> Create Bucket
        </button>
      </div>

      <div className={TABLE_CARD}>
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className={TR_BORDER}>
              <th className="text-left px-6 py-3 text-[var(--text-muted)] font-medium">Name</th>
              <th className="text-left px-6 py-3 text-[var(--text-muted)] font-medium">Objects</th>
              <th className="text-left px-6 py-3 text-[var(--text-muted)] font-medium">Size</th>
              <th className="text-left px-6 py-3 text-[var(--text-muted)] font-medium">Created</th>
              <th className="text-right px-6 py-3 text-[var(--text-muted)] font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {buckets.map((b) => (
              <tr key={b.name} className={TR_HOVER}>
                <td className="px-6 py-3">
                  <Link href={`/buckets/${b.name}`} className="flex items-center gap-2 text-[var(--accent)] hover:underline">
                    <FolderOpen size={16} /> {b.name}
                  </Link>
                </td>
                <td className="px-6 py-3 text-[var(--text-dark)]">{b.objects_count}</td>
                <td className="px-6 py-3 text-[var(--text-dark)]">{formatBytes(b.storage_used_bytes)}</td>
                <td className="px-6 py-3 text-[var(--text-muted)]">{new Date(b.created_at / 1_000_000).toLocaleDateString()}</td>
                <td className="px-6 py-3 text-right">
                  <button onClick={() => setDeleteTarget(b.name)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {buckets.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-[var(--text-muted)]">No buckets found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Bucket">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-dark)]">Bucket Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              pattern="[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]"
              title="Lowercase letters, numbers, hyphens, dots. 3-63 characters."
              className={INPUT_STYLES}
              required
            />
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setShowCreate(false)} className={BTN_SECONDARY}>
              Cancel
            </button>
            <button type="submit" disabled={creating} className="px-4 py-2 text-sm rounded-[var(--radius-sm)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium transition-opacity disabled:opacity-50">
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Bucket"
        message={`Are you sure you want to delete "${deleteTarget}"? This action cannot be undone.`}
        loading={deleting}
      />
    </>
  );
}
