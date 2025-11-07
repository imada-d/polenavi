// 何を: ハッシュタグ別電柱一覧ページ（モバイル版）
// なぜ: 特定のハッシュタグが付いた電柱を一覧表示するため

import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { apiClient } from '../../api/client';

interface Pole {
  id: number;
  poleNumber: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  memos: Array<{
    id: number;
    memoText: string | null;
    hashtags: string[];
    createdAt: string;
    createdByUser: {
      id: number;
      username: string;
      displayName: string | null;
    } | null;
  }>;
  photos: Array<{
    id: number;
    photoUrl: string;
  }>;
}

export default function HashtagPoles() {
  const { tag } = useParams<{ tag: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const [poles, setPoles] = useState<Pole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPoles();
  }, [tag, userId]);

  const loadPoles = async () => {
    try {
      setLoading(true);
      const url = userId
        ? `/poles/hashtag/${tag}?userId=${userId}`
        : `/poles/hashtag/${tag}`;
      const response = await apiClient.get(url);
      console.log('✅ ハッシュタグ電柱取得:', response.data);
      setPoles(response.data.data);
    } catch (error) {
      console.error('❌ 電柱の取得に失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-3 flex items-center">
        <button onClick={() => navigate(-1)} className="mr-4 text-gray-600 hover:text-gray-800">
          ← 戻る
        </button>
        <h1 className="text-lg font-bold">#{tag}</h1>
      </header>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        {loading ? (
          <div className="text-center py-12 text-gray-400">
            読み込み中...
          </div>
        ) : poles.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-gray-600">このハッシュタグの電柱はまだありません</p>
          </div>
        ) : (
          <div className="space-y-4">
            {poles.map((pole) => (
              <button
                key={pole.id}
                onClick={() => navigate(`/pole/${pole.id}`)}
                className="w-full bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow text-left"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">
                      {pole.poleNumber || '電柱番号未登録'}
                    </h3>
                    {pole.memos[0]?.createdByUser && (
                      <p className="text-sm text-gray-500 mt-1">
                        登録者: {pole.memos[0].createdByUser.displayName || pole.memos[0].createdByUser.username}
                      </p>
                    )}
                  </div>
                  {pole.photos.length > 0 && (
                    <img
                      src={pole.photos[0].photoUrl}
                      alt="電柱"
                      className="w-16 h-16 object-cover rounded ml-3"
                    />
                  )}
                </div>

                {pole.memos.length > 0 && pole.memos[0].memoText && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 line-clamp-2">
                      {pole.memos[0].memoText}
                    </p>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                  <span>{new Date(pole.createdAt).toLocaleDateString('ja-JP')}</span>
                  <span>→ 詳細を見る</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
