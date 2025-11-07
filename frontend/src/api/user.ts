// 何を: ユーザー関連のAPI関数
// なぜ: バックエンドのユーザーエンドポイントと通信するため

import { apiClient } from './client';

// ユーザー統計データ
export interface UserStats {
  registeredPoles: number;
  photos: number;
  memos: number;
  groups: number;
}

// プロフィール更新データ
export interface UpdateProfileData {
  displayName?: string;
  username?: string;
  email?: string;
  currentPassword?: string;
  newPassword?: string;
}

// ユーザー統計を取得
export const getUserStats = async (): Promise<UserStats> => {
  try {
    const response = await apiClient.get('/users/stats');
    console.log('✅ 統計取得成功:', response.data);
    return response.data.stats;
  } catch (error: any) {
    console.error('❌ 統計取得エラー:', error);
    // エラー時はデフォルト値を返す
    return {
      registeredPoles: 0,
      photos: 0,
      memos: 0,
      groups: 0
    };
  }
};

// プロフィールを更新
export const updateProfile = async (data: UpdateProfileData): Promise<any> => {
  try {
    const response = await apiClient.put('/users/profile', data);
    console.log('✅ プロフィール更新成功:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ プロフィール更新エラー:', error);

    const errorMessage = error.response?.data?.message || 'プロフィールの更新に失敗しました';
    throw new Error(errorMessage);
  }
};
