// 何を: 統計データ取得API
// なぜ: 公開統計と管理者統計を取得

import { apiClient } from './client';

export interface PublicStats {
  totals: {
    users: number;
    poles: number;
    photos: number;
    memos: number;
  };
  today: {
    newUsers: number;
    newPoles: number;
  };
  activeUsers: {
    last24h: number;
    last7d: number;
    last30d: number;
  };
}

export interface AdminStats extends PublicStats {
  totals: PublicStats['totals'] & {
    poleNumbers: number;
    reports: number;
  };
  admin: {
    pendingReports: number;
    inactiveUsers: number;
  };
  daily: Array<{
    date: string;
    poles: number;
    users: number;
  }>;
  byPrefecture: Array<{
    prefecture: string | null;
    count: number;
  }>;
}

/**
 * 公開統計を取得
 */
export async function getPublicStats(): Promise<PublicStats> {
  const response = await apiClient.get('/stats/public');
  return response.data.data;
}

/**
 * 管理者統計を取得
 */
export async function getAdminStats(): Promise<AdminStats> {
  const response = await apiClient.get('/stats/admin');
  return response.data.data;
}
