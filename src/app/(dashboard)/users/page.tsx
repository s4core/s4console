'use client';

import { useEffect, useState, useCallback } from 'react';
import { Header } from '@/components/header';
import { Modal } from '@/components/modal';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { apiFetch } from '@/lib/api';
import { User } from '@/lib/types';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLES = ['Reader', 'Writer', 'SuperUser'] as const;

function roleBadge(role: string) {
  const colors: Record<string, string> = {
    SuperUser: 'bg-[var(--accent-light)] text-[var(--accent)]',
    Writer: 'bg-orange-500/20 text-orange-400',
    Reader: 'bg-blue-500/20 text-blue-400',
  };
  return (
    <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${colors[role] ?? ''}`}>
      {role}
    </span>
  );
}

const BTN_PRIMARY = 'flex items-center gap-2 px-5 py-2.5 rounded-[var(--radius-sm)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white text-sm font-medium shadow-[var(--shadow-card)] hover:-translate-y-0.5 transition-all';
const BTN_SECONDARY = 'px-4 py-2 text-sm rounded-[var(--radius-sm)] border border-[var(--border)] hover:bg-[var(--sidebar-hover-bg)] transition-colors text-[var(--text-dark)]';
const INPUT_STYLES = 'w-full px-4 py-2.5 rounded-[var(--radius-sm)] bg-[var(--input-bg)] border border-[var(--input-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 text-[var(--text-dark)]';
const TABLE_CARD = 'bg-[var(--card-bg)] rounded-[var(--radius-card)] border border-[var(--border)] overflow-hidden overflow-x-auto shadow-[var(--shadow-card)]';
const TR_BORDER = 'border-b border-[var(--border)]';
const TR_HOVER = `${TR_BORDER} hover:bg-black/[.02] dark:hover:bg-white/[.02]`;

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [form, setForm] = useState({ username: '', password: '', role: 'Reader' as string });
  const [editForm, setEditForm] = useState({ password: '', role: '', is_active: true });
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    apiFetch<{ users: User[] }>('/admin/users')
      .then((r) => setUsers(r.users))
      .catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch('/admin/users', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      toast.success(`User "${form.username}" created`);
      setShowCreate(false);
      setForm({ username: '', password: '', role: 'Reader' });
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUser) return;
    setLoading(true);
    try {
      const body: Record<string, unknown> = { role: editForm.role, is_active: editForm.is_active };
      if (editForm.password) body.password = editForm.password;
      await apiFetch(`/admin/users/${editUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
      });
      toast.success(`User "${editUser.username}" updated`);
      setEditUser(null);
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      await apiFetch(`/admin/users/${deleteTarget.id}`, { method: 'DELETE' });
      toast.success(`User "${deleteTarget.username}" deleted`);
      setDeleteTarget(null);
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (user: User) => {
    setEditUser(user);
    setEditForm({ password: '', role: user.role, is_active: user.is_active });
  };

  return (
    <>
      <Header title="Users" description="Manage IAM users" />
      <div className="mb-4">
        <button onClick={() => setShowCreate(true)} className={BTN_PRIMARY}>
          <Plus size={16} /> Create User
        </button>
      </div>

      <div className={TABLE_CARD}>
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className={TR_BORDER}>
              <th className="text-left px-6 py-3 text-[var(--text-muted)] font-medium">Username</th>
              <th className="text-left px-6 py-3 text-[var(--text-muted)] font-medium">Role</th>
              <th className="text-left px-6 py-3 text-[var(--text-muted)] font-medium">Status</th>
              <th className="text-left px-6 py-3 text-[var(--text-muted)] font-medium">Created</th>
              <th className="text-right px-6 py-3 text-[var(--text-muted)] font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className={TR_HOVER}>
                <td className="px-6 py-3 font-medium text-[var(--text-dark)]">{u.username}</td>
                <td className="px-6 py-3">{roleBadge(u.role)}</td>
                <td className="px-6 py-3">
                  <span className={`flex items-center gap-1.5 ${u.is_active ? 'text-green-400' : 'text-red-400'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? 'bg-green-400' : 'bg-red-400'}`} />
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-3 text-[var(--text-muted)]">{new Date(u.created_at).toLocaleDateString()}</td>
                <td className="px-6 py-3 text-right space-x-1">
                  <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-[var(--sidebar-hover-bg)] transition-colors text-[var(--text-muted)]">
                    <Pencil size={16} />
                  </button>
                  <button onClick={() => setDeleteTarget(u)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-[var(--text-muted)]">No users found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create User Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create User">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-dark)]">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className={INPUT_STYLES}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-dark)]">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className={INPUT_STYLES}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-dark)]">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className={INPUT_STYLES}
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setShowCreate(false)} className={BTN_SECONDARY}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm rounded-[var(--radius-sm)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium transition-opacity disabled:opacity-50">
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal open={!!editUser} onClose={() => setEditUser(null)} title={`Edit ${editUser?.username}`}>
        <form onSubmit={handleEdit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-dark)]">New Password (leave blank to keep)</label>
            <input
              type="password"
              value={editForm.password}
              onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
              className={INPUT_STYLES}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-[var(--text-dark)]">Role</label>
            <select
              value={editForm.role}
              onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
              className={INPUT_STYLES}
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={editForm.is_active}
              onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="is_active" className="text-sm text-[var(--text-dark)]">Active</label>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setEditUser(null)} className={BTN_SECONDARY}>
              Cancel
            </button>
            <button type="submit" disabled={loading} className="px-4 py-2 text-sm rounded-[var(--radius-sm)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-medium transition-opacity disabled:opacity-50">
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteTarget?.username}"?`}
        loading={loading}
      />
    </>
  );
}
