'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/header';
import { apiFetch } from '@/lib/api';
import { StatsResponse, BucketStatsResponse } from '@/lib/types';
import { Wifi, Clock, Database, FileText, HardDrive, Copy, Activity, Server } from 'lucide-react';

const COLORS = ['#2DD4BF', '#14B8A6', '#8E54E9', '#4776E6', '#34d399', '#fbbf24', '#f87171'];

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${d}d ${h}h ${m}m`;
}

/** Fake sparkline SVG — purely decorative. */
function Sparkline({ color, seed }: { color: string; seed: number }) {
  const points: number[] = [];
  let v = 30 + (seed * 7) % 20;
  for (let i = 0; i < 12; i++) {
    v = Math.max(5, Math.min(55, v + ((seed * (i + 1) * 13) % 17) - 8));
    points.push(v);
  }
  const path = points.map((y, i) => `${i === 0 ? 'M' : 'L'}${i * 8},${60 - y}`).join(' ');
  return (
    <svg viewBox="0 0 88 60" className="w-full h-[40px] mt-2" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`sg-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L88,60 L0,60 Z`} fill={`url(#sg-${seed})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** CSS conic-gradient donut chart. */
function DonutChart({ total, label, buckets }: { total: number; label: string; buckets: { name: string; value: number }[] }) {
  const max = total * 1.5 || 1;
  const pct = total > 0 ? Math.min((total / max) * 100, 100) : 0;

  let angle = 0;
  const stops: string[] = [];
  if (buckets.length > 0) {
    const bucketTotal = buckets.reduce((s, b) => s + b.value, 0);
    buckets.forEach((b, i) => {
      const segPct = bucketTotal > 0 ? (b.value / bucketTotal) * pct : 0;
      const color = COLORS[i % COLORS.length];
      stops.push(`${color} ${angle.toFixed(1)}% ${(angle + segPct).toFixed(1)}%`);
      angle += segPct;
    });
  }
  stops.push(`var(--border) ${angle.toFixed(1)}% 100%`);

  const gradient = `conic-gradient(from 220deg, ${stops.join(', ')})`;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-[140px] h-[140px]">
        <div
          className="w-full h-full rounded-full flex items-center justify-center"
          style={{ background: gradient }}
        >
          <div className="w-[108px] h-[108px] bg-[var(--card-bg)] rounded-full flex flex-col items-center justify-center">
            <span className="text-xl font-bold leading-tight text-[var(--text-dark)]">{label}</span>
            <span className="text-[10px] text-[var(--text-muted)]">Used</span>
          </div>
        </div>
        <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 text-[9px] text-[var(--text-muted)]">0%</span>
        <span className="absolute bottom-0 left-0 text-[9px] text-[var(--text-muted)]">100%</span>
        <span className="absolute bottom-0 right-0 text-[9px] text-[var(--text-muted)]">50%</span>
      </div>
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-3">
        {buckets.map((b, i) => (
          <div key={b.name} className="flex items-center gap-1.5 text-[10px]">
            <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            <span className="text-[var(--text-muted)] truncate max-w-[70px]">{b.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const CARD_STYLES = 'bg-[var(--card-bg)] rounded-[var(--radius-card)] p-4 sm:p-5 lg:p-[25px] border border-[var(--border)] shadow-[var(--shadow-card)]';

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [bucketStats, setBucketStats] = useState<BucketStatsResponse | null>(null);

  useEffect(() => {
    apiFetch<StatsResponse>('/stats').then(setStats).catch(() => {});
    apiFetch<BucketStatsResponse>('/admin/bucket-stats').then(setBucketStats).catch(() => {});
  }, []);

  const pieData = bucketStats?.buckets.map((b) => ({
    name: b.name,
    value: b.storage_used_bytes,
  })) ?? [];

  return (
    <>
      <Header title="Dashboard" description="System overview and storage metrics" />

      {/* Status bar */}
      <div className={`${CARD_STYLES} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4`}>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[var(--text-muted)]">Server Status:</span>
          <span className="flex items-center gap-1.5 text-green-400 font-medium">
            <Wifi size={14} />
            Online
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-[var(--text-muted)]">Uptime:</span>
          <span className="font-medium text-[var(--text-dark)]">{stats ? formatUptime(stats.uptime_seconds) : '...'}</span>
        </div>
      </div>

      {/* Main grid: left 4 cards + right donut */}
      <div className="grid gap-4 sm:gap-5 lg:gap-[25px] grid-cols-1 xl:grid-cols-[1fr_auto]">
        {/* Left: 2x2 metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 lg:gap-[20px]">
          {/* Total Buckets */}
          <div className={CARD_STYLES}>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-1">
              <Database size={14} /> Total Buckets
            </div>
            <div className="text-[32px] font-bold leading-tight text-[var(--text-dark)]">{stats?.buckets_count ?? '...'}</div>
            <Sparkline color="var(--accent)" seed={1} />
          </div>

          {/* Total Objects */}
          <div className={CARD_STYLES}>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-1">
              <FileText size={14} /> Total Objects
            </div>
            <div className="text-[32px] font-bold leading-tight text-[var(--text-dark)]">{stats?.objects_count ?? '...'}</div>
            <Sparkline color="#34d399" seed={2} />
          </div>

          {/* Storage Used */}
          <div className={CARD_STYLES}>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-1">
              <HardDrive size={14} /> Storage Used
            </div>
            <div className="text-[32px] font-bold leading-tight text-[var(--text-dark)]">{stats ? formatBytes(stats.storage_used_bytes) : '...'}</div>
            <Sparkline color="#8E54E9" seed={3} />
          </div>

          {/* Dedup Ratio */}
          <div className={CARD_STYLES}>
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-1">
              <Copy size={14} /> Dedup Ratio
            </div>
            <div className="text-[32px] font-bold leading-tight text-[var(--text-dark)]">
              {stats ? `${(stats.dedup_ratio * 100).toFixed(1)}%` : '...'}
            </div>
            {/* Mini progress bar */}
            <div className="mt-3 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-all"
                style={{ width: `${stats ? stats.dedup_ratio * 100 : 0}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1">
              <span>0.0%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Right: Storage Limit donut */}
        <div className={`${CARD_STYLES} flex flex-col items-center justify-center w-full xl:w-[260px]`}>
          <p className="text-sm font-medium text-[var(--text-muted)] mb-4">Storage Limit</p>
          <DonutChart
            total={stats?.storage_used_bytes ?? 0}
            label={stats ? formatBytes(stats.storage_used_bytes) : '...'}
            buckets={pieData}
          />
        </div>
      </div>

      {/* System Health Overview */}
      <div className={CARD_STYLES}>
        <p className="text-sm font-medium text-[var(--text-muted)] mb-4">System Health Overview</p>
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2 text-sm">
            <Activity size={14} className="text-[var(--text-muted)]" />
            <span className="text-[var(--text-muted)]">Status</span>
            <span className="flex items-center gap-1.5 text-green-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              Online
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock size={14} className="text-[var(--text-muted)]" />
            <span className="text-[var(--text-muted)]">Uptime</span>
            <span className="font-medium text-[var(--text-dark)]">{stats ? formatUptime(stats.uptime_seconds) : '...'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Database size={14} className="text-[var(--text-muted)]" />
            <span className="text-[var(--text-muted)]">Buckets</span>
            <span className="font-medium text-[var(--text-dark)]">{stats?.buckets_count ?? '...'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Server size={14} className="text-[var(--text-muted)]" />
            <span className="text-[var(--text-muted)]">Objects</span>
            <span className="font-medium text-[var(--text-dark)]">{stats?.objects_count ?? '...'}</span>
          </div>
        </div>
      </div>
    </>
  );
}
