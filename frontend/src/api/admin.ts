// 何を: 管理者機能API
// なぜ: ユーザー管理などの管理者向け機能を提供

import { apiClient } from './client';

export interface AdminUser {
  id: number;
  email: string;
  username: string;
  displayName: string | null;
  role: string;
  isActive: boolean;
  emailVerified: boolean;
  homePrefecture: string | null;
  planType: string;
  createdAt: string;
  stats: {
    poles: number;
    photos: number;
    memos: number;
  };
}

export interface UserDetail extends AdminUser {
  poleNumbers: Array<{
    id: number;
    poleNumber: string;
    operatorName: string;
    createdAt: string;
    pole: {
      latitude: number;
      longitude: number;
    };
  }>;
  uploadedPhotos: Array<{
    id: number;
    photoThumbnailUrl: string;
    photoType: string;
    createdAt: string;
    poleId: number | null;
  }>;
  memos: Array<{
    id: number;
    hashtags: string[];
    memoText: string | null;
    createdAt: string;
    poleId: number;
  }>;
  stats: AdminUser['stats'] & {
    reports: number;
  };
}

export interface UserActivity {
  type: 'pole' | 'photo' | 'memo';
  createdAt: string;
  data: any;
}

/**
 * ユーザー一覧を取得
 */
export async function getUsers(params?: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'createdAt' | 'username' | 'email';
  sortOrder?: 'asc' | 'desc';
  role?: string;
  isActive?: boolean;
}) {
  const response = await apiClient.get('/admin/users', { params });
  return response.data.data as {
    users: AdminUser[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

/**
 * ユーザー詳細を取得
 */
export async function getUserDetail(userId: number): Promise<UserDetail> {
  const response = await apiClient.get(`/admin/users/${userId}`);
  return response.data.data;
}

/**
 * ユーザー情報を更新
 */
export async function updateUser(
  userId: number,
  data: {
    role?: string;
    isActive?: boolean;
    emailVerified?: boolean;
  }
) {
  const response = await apiClient.patch(`/admin/users/${userId}`, data);
  return response.data;
}

/**
 * ユーザーのアクティビティを取得
 */
export async function getUserActivity(
  userId: number,
  days?: number
): Promise<UserActivity[]> {
  const response = await apiClient.get(`/admin/users/${userId}/activity`, {
    params: { days },
  });
  return response.data.data;
}

// ========================================
// 通報管理
// ========================================

export interface Report {
  id: number;
  reportType: 'photo' | 'pole' | 'number';
  targetId: number;
  reason: string;
  description: string | null;
  reportedBy: number | null;
  reportedByName: string;
  reportedByUser: {
    id: number;
    username: string;
    displayName: string | null;
  } | null;
  status: 'pending' | 'reviewed' | 'resolved';
  autoHidden: boolean;
  reviewedBy: number | null;
  reviewedByUser: {
    id: number;
    username: string;
    displayName: string | null;
  } | null;
  resolution: string | null;
  createdAt: string;
  reviewedAt: string | null;
}

export interface ReportDetail extends Report {
  targetData: any;
}

/**
 * 通報一覧を取得
 */
export async function getReports(params?: {
  page?: number;
  limit?: number;
  status?: 'pending' | 'reviewed' | 'resolved';
  reportType?: 'photo' | 'pole' | 'number';
  search?: string;
}) {
  const response = await apiClient.get('/admin/reports', { params });
  return response.data.data as {
    reports: Report[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

/**
 * 通報詳細を取得
 */
export async function getReportDetail(reportId: number): Promise<ReportDetail> {
  const response = await apiClient.get(`/admin/reports/${reportId}`);
  return response.data.data;
}

/**
 * 通報を処理
 */
export async function reviewReport(
  reportId: number,
  data: {
    status: 'reviewed' | 'resolved';
    resolution: string;
    action?: 'delete' | 'hide' | 'no_action';
  }
) {
  const response = await apiClient.patch(`/admin/reports/${reportId}`, data);
  return response.data;
}
