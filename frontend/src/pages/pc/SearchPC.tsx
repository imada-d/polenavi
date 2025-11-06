// 何を: PC用検索画面
// なぜ: PC画面で電柱番号・メモ・ハッシュタグ検索を提供するため

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchPoleByNumber, searchPolesByMemo } from '../../api/poles';
import Header from '../../components/pc/Header';

export default function SearchPC() {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState<'number' | 'memo'>('number');
  const [number, setNumber] = useState('');
  const [memoQuery, setMemoQuery] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [memoResults, setMemoResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNumberSearch = async () => {
    if (!number.trim()) {
      setError('番号を入力してください');
      return;
    }

    setIsSearching(true);
    setError(null);
    setSearchResult(null);

    try {
      const result = await searchPoleByNumber(number);
      setSearchResult(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleMemoSearch = async () => {
    if (!memoQuery.trim()) {
      setError('検索キーワードを入力してください');
      return;
    }

    setIsSearching(true);
    setError(null);
    setMemoResults([]);

    try {
      const result = await searchPolesByMemo(memoQuery);
      setMemoResults(result.poles || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleShowOnMap = (poleId: number) => {
    navigate(`/pole/${poleId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">🔍 電柱検索</h1>

        {/* 検索タイプ選択 */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => {
                setSearchType('number');
                setError(null);
                setSearchResult(null);
                setMemoResults([]);
              }}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                searchType === 'number'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📋 番号検索
            </button>
            <button
              onClick={() => {
                setSearchType('memo');
                setError(null);
                setSearchResult(null);
                setMemoResults([]);
              }}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                searchType === 'memo'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              🏷️ メモ・タグ検索
            </button>
          </div>

          {/* 番号検索フォーム */}
          {searchType === 'number' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  電柱番号
                </label>
                <input
                  type="text"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="例: 247エ714"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                  onKeyPress={(e) => e.key === 'Enter' && handleNumberSearch()}
                />
              </div>
              <button
                onClick={handleNumberSearch}
                disabled={isSearching}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg"
              >
                {isSearching ? '検索中...' : '検索'}
              </button>
            </div>
          )}

          {/* メモ・タグ検索フォーム */}
          {searchType === 'memo' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  検索キーワード
                </label>
                <input
                  type="text"
                  value={memoQuery}
                  onChange={(e) => setMemoQuery(e.target.value)}
                  placeholder="例: #修理完了、LED交換"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                  onKeyPress={(e) => e.key === 'Enter' && handleMemoSearch()}
                />
                <p className="text-sm text-gray-500 mt-2">
                  💡 ハッシュタグ（#付き）やメモ本文で検索できます
                </p>
              </div>
              <button
                onClick={handleMemoSearch}
                disabled={isSearching}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-lg"
              >
                {isSearching ? '検索中...' : '検索'}
              </button>
            </div>
          )}
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* 番号検索結果 */}
        {searchType === 'number' && searchResult && (
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold mb-4">検索結果</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">電柱番号</p>
                <p className="text-lg font-bold text-blue-600">{searchResult.poleNumber}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">事業者</p>
                <p className="text-lg font-semibold">{searchResult.operatorName || '不明'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">種類</p>
                <p className="text-lg font-semibold">{searchResult.poleTypeName || 'その他'}</p>
              </div>
            </div>
            <button
              onClick={() => handleShowOnMap(searchResult.poleId)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              📍 地図で詳細を見る
            </button>
          </div>
        )}

        {/* メモ検索結果 */}
        {searchType === 'memo' && memoResults.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold">検索結果（{memoResults.length}件）</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {memoResults.map((pole: any) => (
                <div key={pole.id} className="bg-white rounded-lg shadow-sm border p-4">
                  {/* 電柱番号 */}
                  {pole.numbers && pole.numbers.length > 0 && (
                    <p className="font-bold text-blue-600 mb-2">
                      {pole.numbers[0]}
                      {pole.numbers.length > 1 && ` +${pole.numbers.length - 1}件`}
                    </p>
                  )}
                  {/* メモ */}
                  {pole.memo && (
                    <p className="text-sm text-gray-700 mb-3 line-clamp-3">{pole.memo}</p>
                  )}
                  {/* ハッシュタグ */}
                  {pole.hashtags && pole.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {pole.hashtags.slice(0, 5).map((tag: string, index: number) => (
                        <span
                          key={index}
                          className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded"
                        >
                          #{tag}
                        </span>
                      ))}
                      {pole.hashtags.length > 5 && (
                        <span className="text-xs text-gray-500 px-2 py-1">
                          +{pole.hashtags.length - 5}
                        </span>
                      )}
                    </div>
                  )}
                  <button
                    onClick={() => handleShowOnMap(pole.id)}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
                  >
                    📍 詳細を見る
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* メモ検索結果が0件 */}
        {searchType === 'memo' && memoResults.length === 0 && !isSearching && memoQuery && !error && (
          <div className="bg-gray-100 rounded-lg p-12 text-center">
            <p className="text-gray-600 text-lg">検索結果が見つかりませんでした</p>
          </div>
        )}
      </div>
    </div>
  );
}
