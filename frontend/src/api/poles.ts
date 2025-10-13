// 何を: 柱の登録に必要なデータの型定義
// なぜ: モバイル版もPC版も同じ型を使うため、型安全性を保つため
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
  // Phase 1: 仮実装（alertで確認）
  console.log('登録データ:', data);
  alert(`登録データ:\n${JSON.stringify(data, null, 2)}`);
  
  // Phase 2で実装予定:
  /*
  try {
    const response = await fetch('/api/poles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error('登録に失敗しました');
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('登録エラー:', error);
    throw error;
  }
  */
  
  // Phase 1: 仮の成功レスポンスを返す
  return {
    success: true,
    message: '登録成功（仮）',
    id: 'dummy-id-123'
  };
};