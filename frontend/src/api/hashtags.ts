// 何を: ハッシュタグ管理APIクライアント
// なぜ: ユーザー独自のハッシュタグを管理するため

import apiClient from './client';

/**
 * ハッシュタグ型定義
 */
export interface Hashtag {
  id: number;
  userId: number;
  tag: string; // 正規化されたタグ（小文字、#なし）
  displayTag: string; // 表示用タグ
  color: string | null;
  icon: string | null;
  usageCount: number;
  sortOrder: number | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * ユーザーのハッシュタグ一覧を取得
 */
export async function getUserHashtags(): Promise<Hashtag[]> {
  const response = await apiClient.get('/hashtags');
  return response.data.data.hashtags;
}

/**
 * ハッシュタグを作成
 */
export async function createHashtag(data: {
  name: string;
  color: string;
}): Promise<Hashtag> {
  const response = await apiClient.post('/hashtags', data);
  return response.data.data.hashtag;
}

/**
 * ハッシュタグを更新
 */
export async function updateHashtag(
  id: number,
  data: {
    name?: string;
    color?: string;
  }
): Promise<Hashtag> {
  const response = await apiClient.put(`/hashtags/${id}`, data);
  return response.data.data.hashtag;
}

/**
 * ハッシュタグを削除
 */
export async function deleteHashtag(id: number): Promise<void> {
  await apiClient.delete(`/hashtags/${id}`);
}

/**
 * ハッシュタグの表示順序を変更
 */
export async function reorderHashtags(hashtagIds: number[]): Promise<Hashtag[]> {
  const response = await apiClient.put('/hashtags/reorder', { hashtagIds });
  return response.data.data.hashtags;
}
