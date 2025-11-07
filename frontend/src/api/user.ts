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

// 自分が登録した電柱一覧を取得
export const getMyPoles = async (): Promise<any[]> => {
  try {
    const response = await apiClient.get('/users/my-data/poles');
    console.log('✅ 電柱一覧取得成功:', response.data);
    return response.data.data.poleNumbers || [];
  } catch (error: any) {
    console.error('❌ 電柱一覧取得エラー:', error);
    return [];
  }
};

// 自分が作成したメモ一覧を取得
export const getMyMemos = async (): Promise<any[]> => {
  try {
    const response = await apiClient.get('/users/my-data/memos');
    console.log('✅ メモ一覧取得成功:', response.data);
    return response.data.data.memos || [];
  } catch (error: any) {
    console.error('❌ メモ一覧取得エラー:', error);
    return [];
  }
};

// 自分がアップロードした写真一覧を取得
export const getMyPhotos = async (): Promise<any[]> => {
  try {
    const response = await apiClient.get('/users/my-data/photos');
    console.log('✅ 写真一覧取得成功:', response.data);
    return response.data.data.photos || [];
  } catch (error: any) {
    console.error('❌ 写真一覧取得エラー:', error);
    return [];
  }
};

// 自分が使用したハッシュタグ一覧を取得
export const getMyHashtags = async (): Promise<any[]> => {
  try {
    const response = await apiClient.get('/users/my-data/hashtags');
    console.log('✅ ハッシュタグ一覧取得成功:', response.data);
    return response.data.data.hashtags || [];
  } catch (error: any) {
    console.error('❌ ハッシュタグ一覧取得エラー:', error);
    return [];
  }
};

// 通知設定を更新
export const updateNotificationSettings = async (emailNotifications: boolean): Promise<any> => {
  try {
    const response = await apiClient.put('/users/notification-settings', { emailNotifications });
    console.log('✅ 通知設定更新成功:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ 通知設定更新エラー:', error);
    const errorMessage = error.response?.data?.message || '通知設定の更新に失敗しました';
    throw new Error(errorMessage);
  }
};

// プライバシー設定を更新
export const updatePrivacySettings = async (dataVisibility: string): Promise<any> => {
  try {
    const response = await apiClient.put('/users/privacy-settings', { dataVisibility });
    console.log('✅ プライバシー設定更新成功:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ プライバシー設定更新エラー:', error);
    const errorMessage = error.response?.data?.message || 'プライバシー設定の更新に失敗しました';
    throw new Error(errorMessage);
  }
};

// アカウントを削除
export const deleteUserAccount = async (): Promise<any> => {
  try {
    const response = await apiClient.delete('/users/account');
    console.log('✅ アカウント削除成功:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ アカウント削除エラー:', error);
    const errorMessage = error.response?.data?.message || 'アカウントの削除に失敗しました';
    throw new Error(errorMessage);
  }
};
