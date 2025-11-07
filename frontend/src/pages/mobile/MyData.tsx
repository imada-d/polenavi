// 何を: モバイル用マイデータ画面
// なぜ: 自分が登録した電柱、メモ、写真、ハッシュタグを一覧で見るため

import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getMyPoles, getMyMemos, getMyPhotos, getMyHashtags } from '../../api/user';

type Tab = 'poles' | 'memos' | 'photos' | 'hashtags';

export default function MyData() {
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
      {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-3 flex items-center">
        <button
          onClick={() => navigate('/mypage')}
          className="mr-4 text-gray-600 hover:text-gray-800"
        >
          ← 戻る
        </button>
        <h1 className="text-lg font-bold">📊 マイデータ</h1>
      </header>

      {/* タブ */}
      <div className="bg-white border-b px-2 overflow-x-auto">
        <div className="flex space-x-1 min-w-max">
          <button
            onClick={() => setActiveTab('poles')}
            className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
              activeTab === 'poles'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600'
            }`}
          >
            電柱 ({poles.length})
          </button>
          <button
            onClick={() => setActiveTab('memos')}
            className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
              activeTab === 'memos'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600'
            }`}
          >
            メモ ({memos.length})
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
              activeTab === 'photos'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600'
            }`}
          >
            写真 ({photos.length})
          </button>
          <button
            onClick={() => setActiveTab('hashtags')}
            className={`px-4 py-3 font-medium text-sm whitespace-nowrap ${
              activeTab === 'hashtags'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600'
            }`}
          >
            ハッシュタグ ({hashtags.length})
          </button>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-8 text-gray-400">読み込み中...</div>
        ) : (
          <>
            {/* 電柱タブ */}
            {activeTab === 'poles' && (
              <div className="space-y-3">
                {poles.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    登録した電柱がありません
                  </div>
                ) : (
                  poles.map((poleNumber: any) => (
                    <div
                      key={poleNumber.id}
                      className="bg-white rounded-lg shadow-sm border p-4"
                      onClick={() => navigate(`/pole/${poleNumber.pole.id}`)}
                    >
                      <div className="font-bold text-blue-600 mb-1">
                        {poleNumber.poleNumber}
                      </div>
                      <div className="text-sm text-gray-600">
                        {poleNumber.operatorName}
                      </div>
                      <div className="text-xs text-gray-400 mt-2">
                        {new Date(poleNumber.createdAt).toLocaleDateString('ja-JP')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* メモタブ */}
            {activeTab === 'memos' && (
              <div className="space-y-3">
                {memos.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    作成したメモがありません
                  </div>
                ) : (
                  memos.map((memo: any) => (
                    <div
                      key={memo.id}
                      className="bg-white rounded-lg shadow-sm border p-4"
                      onClick={() => navigate(`/pole/${memo.pole.id}`)}
                    >
                      <div className="flex flex-wrap gap-1 mb-2">
                        {memo.hashtags.map((tag: string, idx: number) => (
                          <span
                            key={idx}
                            className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      {memo.memoText && (
                        <div className="text-sm text-gray-700 mb-2">
                          {memo.memoText}
                        </div>
                      )}
                      <div className="text-xs text-gray-400">
                        {memo.pole.poleNumbers?.[0]?.poleNumber || '電柱番号不明'} •{' '}
                        {new Date(memo.createdAt).toLocaleDateString('ja-JP')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 写真タブ */}
            {activeTab === 'photos' && (
              <div className="grid grid-cols-2 gap-3">
                {photos.length === 0 ? (
                  <div className="col-span-2 text-center py-8 text-gray-400">
                    アップロードした写真がありません
                  </div>
                ) : (
                  photos.map((photo: any) => (
                    <div
                      key={photo.id}
                      className="bg-white rounded-lg shadow-sm border overflow-hidden"
                      onClick={() => navigate(`/pole/${photo.pole.id}`)}
                    >
                      <img
                        src={photo.photoUrl}
                        alt="電柱写真"
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-2">
                        <div className="text-xs text-gray-600 truncate">
                          {photo.pole.poleNumbers?.[0]?.poleNumber || '電柱番号不明'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(photo.createdAt).toLocaleDateString('ja-JP')}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ハッシュタグタブ */}
            {activeTab === 'hashtags' && (
              <div className="space-y-2">
                {hashtags.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    使用したハッシュタグがありません
                  </div>
                ) : (
                  hashtags.map((hashtag: any, idx: number) => (
                    <div
                      key={idx}
                      className="bg-white rounded-lg shadow-sm border p-4 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">#{hashtag.tag}</span>
                      </div>
                      <div className="text-sm text-gray-500">
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
  );
}
