export interface LoginResponse {
  token: string;
  expires_at: string;
}

export interface User {
  id: string;
  username: string;
  role: 'Reader' | 'Writer' | 'SuperUser';
  access_key?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export interface StatsResponse {
  uptime_seconds: number;
  buckets_count: number;
  objects_count: number;
  storage_used_bytes: number;
  dedup_unique_blobs: number;
  dedup_total_references: number;
  dedup_ratio: number;
}

export interface BucketStat {
  name: string;
  objects_count: number;
  storage_used_bytes: number;
  created_at: number;
}

export interface BucketStatsResponse {
  buckets: BucketStat[];
  total_storage_bytes: number;
}

export interface S3Credentials {
  access_key: string;
  secret_key: string;
}

export interface ObjectInfo {
  key: string;
  size: number;
  content_type: string;
  last_modified: number;
  etag: string;
}

export interface ListObjectsResponse {
  objects: ObjectInfo[];
  common_prefixes: string[];
  is_truncated: boolean;
  next_continuation_token?: string;
}
