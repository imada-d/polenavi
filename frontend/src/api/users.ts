// 何を: ユーザー関連のAPI呼び出し
// なぜ: ユーザー統計、プロフィール管理機能を提供するため

import apiClient from './client';

/**
 * ユーザー統計データを取得
 * GET /api/users/stats
 */
export async function getUserStats(): Promise<{
  registeredPoles: number;
  photos: number;
  memos: number;
  groups: number;
}> {
  try {
    console.log('📊 ユーザー統計取得開始');
    const response = await apiClient.get('/users/stats');
    console.log('✅ ユーザー統計取得成功:', response.data);
    return response.data.stats;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || '統計データの取得に失敗しました';
    console.error('❌ ユーザー統計取得エラー:', error);
    throw new Error(errorMessage);
  }
}

/**
 * プロフィールを更新
 * PUT /api/users/profile
 */
export async function updateProfile(data: {
  displayName?: string;
  username?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}): Promise<any> {
  try {
    const response = await apiClient.put('/users/profile', data);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'プロフィールの更新に失敗しました';
    console.error('❌ プロフィール更新エラー:', error);
    throw new Error(errorMessage);
  }
}
