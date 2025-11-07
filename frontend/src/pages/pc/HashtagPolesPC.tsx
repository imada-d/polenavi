// 何を: ハッシュタグ別電柱一覧ページ（PC版）
// なぜ: 特定のハッシュタグが付いた電柱を一覧表示するため

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/pc/Header';
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

export default function HashtagPolesPC() {
  const { tag } = useParams<{ tag: string }>();
  const navigate = useNavigate();
  const [poles, setPoles] = useState<Pole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPoles();
  }, [tag]);

  const loadPoles = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/poles/hashtag/${tag}`);
      setPoles(response.data.data);
    } catch (error) {
      console.error('電柱の取得に失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* ヘッダー */}
        <div className="flex items-center mb-8">
          <button onClick={() => navigate(-1)} className="mr-4 text-gray-600 hover:text-gray-800">
            ← 戻る
          </button>
          <h1 className="text-3xl font-bold text-gray-800">#{tag}</h1>
        </div>

        {/* コンテンツ */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">
            読み込み中...
          </div>
        ) : poles.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-6">🔍</div>
            <p className="text-xl text-gray-600">このハッシュタグの電柱はまだありません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {poles.map((pole) => (
              <button
                key={pole.id}
                onClick={() => navigate(`/pole/${pole.id}`)}
                className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-lg transition-shadow text-left"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">
                      {pole.poleNumber || '電柱番号未登録'}
                    </h3>
                    {pole.memos[0]?.createdByUser && (
                      <p className="text-sm text-gray-500 mt-2">
                        登録者: {pole.memos[0].createdByUser.displayName || pole.memos[0].createdByUser.username}
                      </p>
                    )}
                  </div>
                  {pole.photos.length > 0 && (
                    <img
                      src={pole.photos[0].photoUrl}
                      alt="電柱"
                      className="w-24 h-24 object-cover rounded-lg ml-4"
                    />
                  )}
                </div>

                {pole.memos.length > 0 && pole.memos[0].memoText && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700 line-clamp-3">
                      {pole.memos[0].memoText}
                    </p>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <span>{new Date(pole.createdAt).toLocaleDateString('ja-JP')}</span>
                  <span className="text-blue-600 font-semibold">→ 詳細を見る</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
