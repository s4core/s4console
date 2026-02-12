'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
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
        <button onClick={() => setPrefix('')} className="text-accent-pink hover:underline">
          {bucketName}
        </button>
        {breadcrumbs.map((part, i) => {
          const path = breadcrumbs.slice(0, i + 1).join('/') + '/';
          return (
            <span key={path} className="flex items-center gap-1">
              <ChevronRight size={14} className="text-muted" />
              <button onClick={() => setPrefix(path)} className="text-accent-pink hover:underline">
                {part}
              </button>
            </span>
          );
        })}
      </div>

      <div className="bg-panel-light dark:bg-panel rounded-card border border-black/5 dark:border-white/5 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[500px]">
          <thead>
            <tr className="border-b border-white/5 dark:border-white/5 border-black/5">
              <th className="text-left px-6 py-3 text-muted font-medium">Name</th>
              <th className="text-left px-6 py-3 text-muted font-medium">Size</th>
              <th className="text-left px-6 py-3 text-muted font-medium">Type</th>
              <th className="text-left px-6 py-3 text-muted font-medium">Last Modified</th>
            </tr>
          </thead>
          <tbody>
            {prefixes.map((p) => (
              <tr
                key={p}
                className="border-b border-white/5 dark:border-white/5 border-black/5 hover:bg-white/[.02] dark:hover:bg-white/[.02] hover:bg-black/[.02] cursor-pointer"
                onClick={() => setPrefix(p)}
              >
                <td className="px-6 py-3 flex items-center gap-2 text-accent-pink">
                  <Folder size={16} /> {p.replace(prefix, '').replace(/\/$/, '')}
                </td>
                <td className="px-6 py-3 text-muted">-</td>
                <td className="px-6 py-3 text-muted">Folder</td>
                <td className="px-6 py-3 text-muted">-</td>
              </tr>
            ))}
            {objects.map((obj) => (
              <tr key={obj.key} className="border-b border-white/5 dark:border-white/5 border-black/5 hover:bg-white/[.02] dark:hover:bg-white/[.02] hover:bg-black/[.02]">
                <td className="px-6 py-3 flex items-center gap-2">
                  <File size={16} className="text-muted" /> {obj.key.replace(prefix, '')}
                </td>
                <td className="px-6 py-3">{formatBytes(obj.size)}</td>
                <td className="px-6 py-3 text-muted">{obj.content_type}</td>
                <td className="px-6 py-3 text-muted">{new Date(obj.last_modified / 1_000_000).toLocaleString()}</td>
              </tr>
            ))}
            {!loading && objects.length === 0 && prefixes.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-muted">No objects found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isTruncated && (
        <div className="mt-4 text-center">
          <button
            onClick={() => load(continuationToken)}
            className="px-4 py-2 text-sm rounded-xl border border-white/10 dark:border-white/10 border-black/10 hover:bg-white/5 transition-colors"
          >
            Load More
          </button>
        </div>
      )}
    </>
  );
}
