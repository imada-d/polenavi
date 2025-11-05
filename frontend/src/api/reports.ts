// 何を: 通報・削除要請APIのクライアント関数
// なぜ: フロントエンドからバックエンドの削除要請APIを呼び出すため

import { apiClient } from './client';

// 何を: 削除要請を送信する関数
// なぜ: ユーザーが誤った電柱や不要な電柱の削除を要請できるようにするため
export const createDeleteRequest = async (
  poleId: number,
  reason: string,
  description: string
): Promise<any> => {
  try {
    const response = await apiClient.post('/reports', {
      reportType: 'pole',
      targetId: poleId,
      reason,
      description,
    });

    console.log('✅ 削除要請送信成功:', response.data);
    return response.data.data;
  } catch (error: any) {
    console.error('❌ 削除要請エラー:', error);

    const errorMessage = error.response?.data?.error?.message || '削除要請の送信に失敗しました';
    throw new Error(errorMessage);
  }
};
