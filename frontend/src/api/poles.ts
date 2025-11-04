// 何を: 柱の登録に必要なデータの型定義
// なぜ: モバイル版もPC版も同じ型を使うため、型安全性を保つため

import { apiClient } from './client';

export interface RegisterPoleData {
  location: [number, number]; // [緯度, 経度]
  poleType: 'electric' | 'other';
  poleSubType?: 'light' | 'sign' | 'traffic' | 'other' | null;
  plateCount: number;
  numbers: string[]; // 番号の配列
  photos?: {
    plate?: string; // Base64
    full?: string[]; // Base64配列
    detail?: string[]; // Base64配列
  };
  memo?: string;
  hashtag?: string;
}

// 何を: 柱の登録APIを呼び出す関数
// なぜ: モバイル版もPC版も同じ処理を使い回すため
export const registerPole = async (data: RegisterPoleData): Promise<any> => {
  try {
    // 何を: Backend API にPOSTリクエストを送信（apiClientを使用）
    // なぜ: データベースに柱の情報を保存するため、環境変数で設定したAPIサーバーに接続する
    const response = await apiClient.post('/poles', {
      latitude: data.location[0],
      longitude: data.location[1],
      poleType: data.poleType,
      poleSubType: data.poleSubType,
      plateCount: data.plateCount,
      numbers: data.numbers,
      memo: data.memo,
      hashtag: data.hashtag,
    });

    // 成功レスポンスを返す
    // バックエンドのレスポンス形式: { success: true, message: "...", data: {...} }
    const result = response.data;
    console.log('✅ 登録成功:', result);
    return result.data; // data.data を返す（poleId, numberCountなどが入っている）

  } catch (error: any) {
    console.error('❌ 登録エラー:', error);

    // エラーメッセージを抽出
    const errorMessage = error.response?.data?.error?.message || '登録に失敗しました';

    throw new Error(errorMessage);
  }
};

// 何を: 番号から電柱を検索する関数
// なぜ: ユーザーが番号札の番号で電柱を検索できるようにするため
export const searchPoleByNumber = async (number: string): Promise<any> => {
  try {
    const response = await apiClient.get('/poles/search', {
      params: { number },
    });

    console.log('✅ 検索成功:', response.data);
    return response.data.data.poleNumber;
  } catch (error: any) {
    console.error('❌ 検索エラー:', error);

    if (error.response?.status === 404) {
      throw new Error('番号が見つかりませんでした');
    }

    const errorMessage = error.response?.data?.error?.message || '検索に失敗しました';
    throw new Error(errorMessage);
  }
};