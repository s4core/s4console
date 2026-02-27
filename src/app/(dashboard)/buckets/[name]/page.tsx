'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Header } from '@/components/header';
import { apiFetch } from '@/lib/api';
import { ListObjectsResponse, ObjectInfo } from '@/lib/types';
import { Folder, File, ChevronRight } from 'lucide-react';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

const TABLE_CARD = 'bg-[var(--card-bg)] rounded-[var(--radius-card)] border border-[var(--border)] overflow-hidden overflow-x-auto shadow-[var(--shadow-card)]';
const TR_BORDER = 'border-b border-[var(--border)]';
const TR_HOVER = `${TR_BORDER} hover:bg-black/[.02] dark:hover:bg-white/[.02]`;

export default function ObjectBrowserPage() {
  const params = useParams();
  const bucketName = params.name as string;
  const [prefix, setPrefix] = useState('');
  const [objects, setObjects] = useState<ObjectInfo[]>([]);
  const [prefixes, setPrefixes] = useState<string[]>([]);
  const [isTruncated, setIsTruncated] = useState(false);
  const [continuationToken, setContinuationToken] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  const load = useCallback((token?: string) => {
    setLoading(true);
    const params = new URLSearchParams();
    if (prefix) params.set('prefix', prefix);
    params.set('max-keys', '50');
    if (token) params.set('continuation-token', token);

    apiFetch<ListObjectsResponse>(`/admin/buckets/${bucketName}/objects?${params}`)
      .then((r) => {
        setObjects(token ? (prev) => [...prev, ...r.objects] : r.objects);
        setPrefixes(token ? (prev) => [...prev, ...r.common_prefixes] : r.common_prefixes);
        setIsTruncated(r.is_truncated);
        setContinuationToken(r.next_continuation_token);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [bucketName, prefix]);

  useEffect(() => {
    setObjects([]);
    setPrefixes([]);
    load();
  }, [prefix, load]);

  const breadcrumbs = prefix.split('/').filter(Boolean);

  return (
    <>
      <Header title={bucketName} description="Browse objects" />

      {/* Breadcrumbs */}
      <div className="flex items-center gap-1 text-sm mb-4 flex-wrap">
        <button onClick={() => setPrefix('')} className="text-[var(--accent)] hover:underline">
          {bucketName}
        </button>
        {breadcrumbs.map((part, i) => {
          const path = breadcrumbs.slice(0, i + 1).join('/') + '/';
          return (
            <span key={path} className="flex items-center gap-1">
              <ChevronRight size={14} className="text-[var(--text-muted)]" />
              <button onClick={() => setPrefix(path)} className="text-[var(--accent)] hover:underline">
                {part}
              </button>
            </span>
          );
        })}
      </div>

      <div className={TABLE_CARD}>
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr className={TR_BORDER}>
              <th className="text-left px-6 py-3 text-[var(--text-muted)] font-medium">Name</th>
              <th className="text-left px-6 py-3 text-[var(--text-muted)] font-medium">Size</th>
              <th className="text-left px-6 py-3 text-[var(--text-muted)] font-medium">Type</th>
              <th className="text-left px-6 py-3 text-[var(--text-muted)] font-medium">Last Modified</th>
            </tr>
          </thead>
          <tbody>
            {prefixes.map((p) => (
              <tr
                key={p}
                className={`${TR_HOVER} cursor-pointer`}
                onClick={() => setPrefix(p)}
              >
                <td className="px-6 py-3 flex items-center gap-2 text-[var(--accent)]">
                  <Folder size={16} /> {p.replace(prefix, '').replace(/\/$/, '')}
                </td>
                <td className="px-6 py-3 text-[var(--text-muted)]">-</td>
                <td className="px-6 py-3 text-[var(--text-muted)]">Folder</td>
                <td className="px-6 py-3 text-[var(--text-muted)]">-</td>
              </tr>
            ))}
            {objects.map((obj) => (
              <tr key={obj.key} className={TR_HOVER}>
                <td className="px-6 py-3 flex items-center gap-2 text-[var(--text-dark)]">
                  <File size={16} className="text-[var(--text-muted)]" /> {obj.key.replace(prefix, '')}
                </td>
                <td className="px-6 py-3 text-[var(--text-dark)]">{formatBytes(obj.size)}</td>
                <td className="px-6 py-3 text-[var(--text-muted)]">{obj.content_type}</td>
                <td className="px-6 py-3 text-[var(--text-muted)]">{new Date(obj.last_modified / 1_000_000).toLocaleString()}</td>
              </tr>
            ))}
            {!loading && objects.length === 0 && prefixes.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-[var(--text-muted)]">No objects found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isTruncated && (
        <div className="mt-4 text-center">
          <button
            onClick={() => load(continuationToken)}
            className="px-4 py-2 text-sm rounded-[var(--radius-sm)] border border-[var(--border)] hover:bg-[var(--sidebar-hover-bg)] transition-colors text-[var(--text-dark)]"
          >
            Load More
          </button>
        </div>
      )}
    </>
  );
}
