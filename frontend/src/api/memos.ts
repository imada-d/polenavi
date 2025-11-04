// 何を: メモ・ハッシュタグのAPI呼び出し
// なぜ: バックエンドのメモAPIと通信するため

import { apiClient } from './client';

/**
 * メモを作成
 */
export const createMemo = async (
  poleId: number,
  hashtags: string[],
  memoText?: string,
  createdByName: string = 'guest'
): Promise<any> => {
  const response = await apiClient.post('/pole-memos', {
    poleId,
    hashtags,
    memoText,
    createdByName,
    isPublic: true,
  });
  return response.data.data.memo;
};

/**
 * 電柱のメモ一覧を取得
 */
export const getMemosByPoleId = async (poleId: number): Promise<any[]> => {
  const response = await apiClient.get(`/pole-memos/${poleId}`);
  return response.data.data.memos;
};

/**
 * メモを更新
 */
export const updateMemo = async (
  memoId: number,
  hashtags?: string[],
  memoText?: string
): Promise<any> => {
  const response = await apiClient.put(`/pole-memos/${memoId}`, {
    hashtags,
    memoText,
  });
  return response.data.data.memo;
};

/**
 * メモを削除
 */
export const deleteMemo = async (memoId: number): Promise<void> => {
  await apiClient.delete(`/pole-memos/${memoId}`);
};
