// 何を: 検索パネル（PC版）
// なぜ: PC版で画面遷移せずに検索できるようにするため

import { useState } from 'react';
import { searchPoleByNumber, searchPolesByMemo } from '../../api/poles';

interface SearchPanelProps {
  onClose: () => void;
  onShowOnMap: (poleId: number, latitude: number, longitude: number) => void;
}

export default function SearchPanel({ onClose, onShowOnMap }: SearchPanelProps) {
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

  const handleShowOnMap = (poleId: number, lat: string | number, lng: string | number) => {
    onShowOnMap(poleId, Number(lat), Number(lng));
    onClose();
  };

  const handleSearch = () => {
    if (searchType === 'number') {
      handleNumberSearch();
    } else {
      handleMemoSearch();
    }
  };

  return (
    <div className="hidden md:flex fixed right-0 top-0 h-screen w-[550px] bg-white border-l shadow-lg z-[1500] flex-col">
      {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">🔍 検索</h1>
        <button
          onClick={onClose}
          className="text-2xl text-gray-600 hover:text-gray-900 transition-colors"
        >
          ✕
        </button>
      </header>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          {/* 検索タイプ選択 */}
          <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => {
                setSearchType('number');
                setError(null);
                setSearchResult(null);
                setMemoResults([]);
              }}
              className={`flex-1 py-2 px-4 rounded font-semibold transition-colors ${
                searchType === 'number'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              番号検索
            </button>
            <button
              onClick={() => {
                setSearchType('memo');
                setError(null);
                setSearchResult(null);
                setMemoResults([]);
              }}
              className={`flex-1 py-2 px-4 rounded font-semibold transition-colors ${
                searchType === 'memo'
                  ? 'bg-white text-blue-600 shadow'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              メモ・ハッシュタグ
            </button>
          </div>

          {/* 番号検索フォーム */}
          {searchType === 'number' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">番号札の番号</label>
                <input
                  type="text"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleNumberSearch();
                    }
                  }}
                  placeholder="例: 247エ714"
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  電柱番号（全角・半角どちらでも可）
                </p>
              </div>
            </>
          )}

          {/* メモ・ハッシュタグ検索フォーム */}
          {searchType === 'memo' && (
            <>
              <div>
                <label className="block text-sm font-medium mb-1">メモ・ハッシュタグ</label>
                <input
                  type="text"
                  value={memoQuery}
                  onChange={(e) => setMemoQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleMemoSearch();
                    }
                  }}
                  placeholder="例: #危険、修理必要"
                  className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  メモのテキストまたはハッシュタグで検索
                </p>
              </div>
            </>
          )}

          {/* 検索ボタン */}
          <button
            onClick={handleSearch}
            disabled={isSearching}
            className={`w-full py-3 rounded-lg font-bold transition-colors ${
              isSearching
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSearching ? '検索中...' : '検索'}
          </button>

          {/* エラー表示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              ❌ {error}
            </div>
          )}

          {/* 番号検索結果 */}
          {searchResult && (
            <div className="bg-white border rounded-lg p-4 shadow-sm space-y-3">
              <h2 className="text-lg font-bold text-green-600">✅ 見つかりました！</h2>

              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-gray-500">番号:</span>
                  <p className="text-lg font-bold">{searchResult.poleNumber}</p>
                </div>

                <div>
                  <span className="text-sm font-medium text-gray-500">事業者:</span>
                  <p>{searchResult.operatorName}</p>
                </div>

                {searchResult.areaPrefix && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">エリア:</span>
                    <p>{searchResult.areaPrefix}</p>
                  </div>
                )}

                <div>
                  <span className="text-sm font-medium text-gray-500">位置情報:</span>
                  <p className="text-sm text-gray-600">
                    緯度: {Number(searchResult.pole.latitude).toFixed(6)}
                    <br />
                    経度: {Number(searchResult.pole.longitude).toFixed(6)}
                  </p>
                </div>

                {searchResult.pole.poleTypeName && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">種類:</span>
                    <p>{searchResult.pole.poleTypeName}</p>
                  </div>
                )}

                <div>
                  <span className="text-sm font-medium text-gray-500">登録番号数:</span>
                  <p>{searchResult.pole.numberCount}個</p>
                </div>

                {searchResult.verificationStatus && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">検証状態:</span>
                    <p>
                      {searchResult.verificationStatus === 'verified' ? (
                        <span className="text-green-600 font-semibold">✓ 検証済み</span>
                      ) : (
                        <span className="text-gray-500">未検証</span>
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* 地図で見るボタン */}
              <button
                onClick={() =>
                  handleShowOnMap(
                    searchResult.pole.id,
                    searchResult.pole.latitude,
                    searchResult.pole.longitude
                  )
                }
                className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors mt-4"
              >
                📍 地図で見る
              </button>
            </div>
          )}

          {/* メモ検索結果 */}
          {memoResults.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-green-600">
                ✅ {memoResults.length}件見つかりました！
              </h2>

              {memoResults.map((result, index) => (
                <div key={index} className="bg-white border rounded-lg p-4 shadow-sm space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {result.hashtags && result.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2">
                          {result.hashtags.map((tag: string, tagIndex: number) => (
                            <span
                              key={tagIndex}
                              className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {result.memoText && (
                        <p className="text-sm text-gray-700 mb-2">{result.memoText}</p>
                      )}

                      <div className="text-xs text-gray-500">
                        <p>種類: {result.poleTypeName || 'その他'}</p>
                        {result.numbers && result.numbers.length > 0 && (
                          <p>番号: {result.numbers.join(', ')}</p>
                        )}
                        <p>
                          登録者: {result.createdByName} ·{' '}
                          {new Date(result.createdAt).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      handleShowOnMap(result.poleId, result.latitude, result.longitude)
                    }
                    className="w-full bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition-colors text-sm"
                  >
                    📍 地図で見る
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 検索結果なし */}
          {!isSearching &&
            !error &&
            searchType === 'memo' &&
            memoResults.length === 0 &&
            memoQuery && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
                検索結果が見つかりませんでした
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
