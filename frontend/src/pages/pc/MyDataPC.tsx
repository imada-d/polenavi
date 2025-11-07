// 何を: PC用マイデータ画面
// なぜ: 自分が登録した電柱、メモ、写真、ハッシュタグを一覧で見るため

import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/pc/Header';
import { getMyPoles, getMyMemos, getMyPhotos, getMyHashtags } from '../../api/user';

type Tab = 'poles' | 'memos' | 'photos' | 'hashtags';

export default function MyDataPC() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('poles');
  const [loading, setLoading] = useState(true);

  const [poles, setPoles] = useState<any[]>([]);
  const [memos, setMemos] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [hashtags, setHashtags] = useState<any[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadData();
  }, [isAuthenticated]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [polesData, memosData, photosData, hashtagsData] = await Promise.all([
        getMyPoles(),
        getMyMemos(),
        getMyPhotos(),
        getMyHashtags()
      ]);
      setPoles(polesData);
      setMemos(memosData);
      setPhotos(photosData);
      setHashtags(hashtagsData);
    } catch (error) {
      console.error('データ取得エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* ヘッダー */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/mypage')}
            className="mr-6 text-gray-600 hover:text-gray-800 text-lg"
          >
            ← 戻る
          </button>
          <h1 className="text-3xl font-bold text-gray-800">📊 マイデータ</h1>
        </div>

        {/* タブ */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('poles')}
              className={`px-8 py-4 font-semibold text-base transition-colors ${
                activeTab === 'poles'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              電柱 ({poles.length})
            </button>
            <button
              onClick={() => setActiveTab('memos')}
              className={`px-8 py-4 font-semibold text-base transition-colors ${
                activeTab === 'memos'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              メモ ({memos.length})
            </button>
            <button
              onClick={() => setActiveTab('photos')}
              className={`px-8 py-4 font-semibold text-base transition-colors ${
                activeTab === 'photos'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              写真 ({photos.length})
            </button>
            <button
              onClick={() => setActiveTab('hashtags')}
              className={`px-8 py-4 font-semibold text-base transition-colors ${
                activeTab === 'hashtags'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              ハッシュタグ ({hashtags.length})
            </button>
          </div>
        </div>

        {/* コンテンツ */}
        <div>
          {loading ? (
            <div className="text-center py-16 text-gray-400 text-lg">読み込み中...</div>
          ) : (
            <>
              {/* 電柱タブ */}
              {activeTab === 'poles' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {poles.length === 0 ? (
                    <div className="col-span-full text-center py-16 text-gray-400 text-lg">
                      登録した電柱がありません
                    </div>
                  ) : (
                    poles.map((poleNumber: any) => (
                      <div
                        key={poleNumber.id}
                        className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="font-bold text-blue-600 mb-2 text-lg">
                          {poleNumber.poleNumber}
                        </div>
                        <div className="text-gray-600 mb-3">
                          {poleNumber.operatorName}
                        </div>
                        <div className="text-sm text-gray-400 mb-4">
                          {new Date(poleNumber.createdAt).toLocaleDateString('ja-JP')}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/?lat=${poleNumber.pole.latitude}&lng=${poleNumber.pole.longitude}&zoom=18`)}
                            className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                          >
                            🗺️ 地図で見る
                          </button>
                          <button
                            onClick={() => navigate(`/pole/${poleNumber.pole.id}`)}
                            className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                          >
                            詳細
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* メモタブ */}
              {activeTab === 'memos' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {memos.length === 0 ? (
                    <div className="col-span-full text-center py-16 text-gray-400 text-lg">
                      作成したメモがありません
                    </div>
                  ) : (
                    memos.map((memo: any) => (
                      <div
                        key={memo.id}
                        className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-wrap gap-2 mb-3">
                          {memo.hashtags.map((tag: string, idx: number) => (
                            <span
                              key={idx}
                              className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                        {memo.memoText && (
                          <div className="text-gray-700 mb-3">
                            {memo.memoText}
                          </div>
                        )}
                        <div className="text-sm text-gray-400 mb-4">
                          {memo.pole.poleNumbers?.[0]?.poleNumber || '電柱番号不明'} •{' '}
                          {new Date(memo.createdAt).toLocaleDateString('ja-JP')}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/?lat=${memo.pole.latitude}&lng=${memo.pole.longitude}&zoom=18`)}
                            className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                          >
                            🗺️ 地図で見る
                          </button>
                          <button
                            onClick={() => navigate(`/pole/${memo.pole.id}`)}
                            className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                          >
                            詳細
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* 写真タブ */}
              {activeTab === 'photos' && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {photos.length === 0 ? (
                    <div className="col-span-full text-center py-16 text-gray-400 text-lg">
                      アップロードした写真がありません
                    </div>
                  ) : (
                    photos.map((photo: any) => (
                      <div
                        key={photo.id}
                        className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
                      >
                        <img
                          src={photo.photoUrl}
                          alt="電柱写真"
                          className="w-full h-48 object-cover cursor-pointer"
                          onClick={() => navigate(`/pole/${photo.pole.id}`)}
                        />
                        <div className="p-4">
                          <div className="text-sm text-gray-600 truncate mb-1">
                            {photo.pole.poleNumbers?.[0]?.poleNumber || '電柱番号不明'}
                          </div>
                          <div className="text-xs text-gray-400 mb-3">
                            {new Date(photo.createdAt).toLocaleDateString('ja-JP')}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate(`/?lat=${photo.pole.latitude}&lng=${photo.pole.longitude}&zoom=18`)}
                              className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                            >
                              🗺️ 地図
                            </button>
                            <button
                              onClick={() => navigate(`/pole/${photo.pole.id}`)}
                              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
                            >
                              詳細
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ハッシュタグタブ */}
              {activeTab === 'hashtags' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hashtags.length === 0 ? (
                    <div className="col-span-full text-center py-16 text-gray-400 text-lg">
                      使用したハッシュタグがありません
                    </div>
                  ) : (
                    hashtags.map((hashtag: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-white rounded-xl shadow-sm border p-6 flex items-center justify-between hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-xl font-semibold">#{hashtag.tag}</span>
                        </div>
                        <div className="text-gray-500">
                          {hashtag.count}回使用
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
