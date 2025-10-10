/**
 * 共通型定義
 * Backend/Frontend 両方で使用
 */

// ========================================
// 柱の種類
// ========================================

export type PoleType = '電柱' | '照明柱' | '標識柱' | '信号柱' | 'その他';

export type PhotoType = 'plate' | 'full' | 'detail';

export type LocationMethod = 'auto' | 'manual' | 'verified';

export type VerificationStatus = 'unverified' | 'verified' | 'highly_verified';

// ========================================
// レスポンス型
// ========================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}