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
  try {
    // 何を: Backend API にPOSTリクエストを送信
    // なぜ: データベースに柱の情報を保存するため
    const response = await fetch('http://localhost:3000/api/poles', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
    
    // エラーレスポンスの処理
    // 何を: HTTPステータスコードが200番台以外の場合、エラーとして扱う
    // なぜ: 失敗時に適切なエラーメッセージを表示するため
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '登録に失敗しました');
    }
    
    // 成功レスポンスを返す
    const result = await response.json();
    console.log('✅ 登録成功:', result);
    return result;
    
  } catch (error: any) {
    console.error('❌ 登録エラー:', error);
    
    // ネットワークエラーの場合
    // 何を: fetch自体が失敗した場合（サーバーが起動していないなど）
    // なぜ: ユーザーに適切なエラーメッセージを表示するため
    if (error.message === 'Failed to fetch') {
      throw new Error('サーバーに接続できません。Backend が起動しているか確認してください。');
    }
    
    // その他のエラー
    throw error;
  }
};