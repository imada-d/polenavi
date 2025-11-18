// 何を: モバイル用検索画面（フルスクリーン）
// なぜ: モバイルでメモ・ハッシュタグ検索を使えるようにするため

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchPoleByNumber, searchPolesByMemo } from '../../api/poles';
import BottomNav from '../../components/mobile/BottomNav';
import HashtagSelector from '../../components/hashtag/HashtagSelector';
import HashtagChip from '../../components/hashtag/HashtagChip';

export default function Search() {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState<'number' | 'memo'>('number');
  const [number, setNumber] = useState('');
  const [memoQuery, setMemoQuery] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [memoResults, setMemoResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHashtagSelector, setShowHashtagSelector] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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
    // 選択されたタグまたは手動入力されたキーワードを使用
    const searchQuery = selectedTags.length > 0
      ? selectedTags.join(' ')
      : memoQuery;

    if (!searchQuery.trim()) {
      setError('検索キーワードまたはタグを選択してください');
      return;
    }

    setIsSearching(true);
    setError(null);
    setMemoResults([]);

    try {
      const result = await searchPolesByMemo(searchQuery);
      setMemoResults(result.poles || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  };

  // タグ選択時の処理
  const handleTagsChange = (tags: string[]) => {
    setSelectedTags(tags);
    // タグが選択されたら、手動入力欄にも反映
    setMemoQuery(tags.join(' '));
  };

  // タグ削除
  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove);
    setSelectedTags(newTags);
    setMemoQuery(newTags.join(' '));
  };

  const handleShowOnMap = (poleId: number) => {
    navigate(`/pole/${poleId}`);
  };

  const handleSearch = () => {
    if (searchType === 'number') {
      handleNumberSearch();
    } else {
      handleMemoSearch();
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-3">
        <h1 className="text-lg font-bold">🔍 検索</h1>
      </header>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
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
                  : 'text-gray-600'
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
                  : 'text-gray-600'
              }`}
            >
              メモ・タグ検索
            </button>
          </div>

          {/* 番号検索 */}
          {searchType === 'number' && (
            <div className="space-y-3">
              <input
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="電柱番号を入力（例: 247エ714）"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleNumberSearch}
                disabled={isSearching}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isSearching ? '検索中...' : '検索'}
              </button>
            </div>
          )}

          {/* メモ・タグ検索 */}
          {searchType === 'memo' && (
            <div className="space-y-3">
              {/* マスターから選択ボタン */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">
                  🏷️ ハッシュタグで検索
                </label>
                <button
                  onClick={() => setShowHashtagSelector(true)}
                  className="text-blue-600 text-sm font-semibold hover:text-blue-700"
                >
                  マスターから選択
                </button>
              </div>

              {/* 選択されたタグ */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag) => (
                    <HashtagChip
                      key={tag}
                      hashtag={tag}
                      onRemove={() => handleRemoveTag(tag)}
                      size="md"
                    />
                  ))}
                </div>
              )}

              {/* 手動入力欄 */}
              <input
                type="text"
                value={memoQuery}
                onChange={(e) => {
                  setMemoQuery(e.target.value);
                  setSelectedTags([]); // 手動入力時はタグ選択をクリア
                }}
                placeholder="キーワードやハッシュタグを入力（例: #修理完了）"
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleMemoSearch}
                disabled={isSearching}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isSearching ? '検索中...' : '検索'}
              </button>
              <p className="text-sm text-gray-500 px-1">
                💡 ヒント: マスターから選択 or 手動入力できます
              </p>
            </div>
          )}

          {/* ハッシュタグ選択モーダル */}
          {showHashtagSelector && (
            <HashtagSelector
              selectedTags={selectedTags}
              onTagsChange={handleTagsChange}
              onClose={() => setShowHashtagSelector(false)}
            />
          )}

          {/* エラー表示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* 番号検索結果 */}
          {searchType === 'number' && searchResult && (
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h2 className="font-bold text-lg mb-3">検索結果</h2>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  電柱番号: <span className="font-bold text-blue-600">{searchResult.poleNumber}</span>
                </p>
                <p className="text-sm text-gray-600">
                  事業者: {searchResult.operatorName || '不明'}
                </p>
                <p className="text-sm text-gray-600">
                  種類: {searchResult.poleTypeName || 'その他'}
                </p>
                <button
                  onClick={() => handleShowOnMap(searchResult.poleId)}
                  className="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
                >
                  📍 詳細を見る
                </button>
              </div>
            </div>
          )}

          {/* メモ検索結果 */}
          {searchType === 'memo' && memoResults.length > 0 && (
            <div className="space-y-3">
              <h2 className="font-bold text-lg">検索結果（{memoResults.length}件）</h2>
              {memoResults.map((pole: any) => (
                <div key={pole.id} className="bg-white rounded-lg shadow-sm border p-4">
                  <div className="space-y-2">
                    {/* 電柱番号 */}
                    {pole.numbers && pole.numbers.length > 0 && (
                      <p className="font-bold text-blue-600">
                        {pole.numbers[0]}
                        {pole.numbers.length > 1 && ` +${pole.numbers.length - 1}件`}
                      </p>
                    )}
                    {/* メモ */}
                    {pole.memo && (
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {pole.memo}
                      </p>
                    )}
                    {/* ハッシュタグ */}
                    {pole.hashtags && pole.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {pole.hashtags.slice(0, 3).map((tag: string, index: number) => (
                          <span
                            key={index}
                            className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded"
                          >
                            #{tag}
                          </span>
                        ))}
                        {pole.hashtags.length > 3 && (
                          <span className="text-xs text-gray-500 px-2 py-1">
                            +{pole.hashtags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                    {/* 詳細ボタン */}
                    <button
                      onClick={() => handleShowOnMap(pole.id)}
                      className="w-full mt-2 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
                    >
                      📍 詳細を見る
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* メモ検索結果が0件 */}
          {searchType === 'memo' && memoResults.length === 0 && !isSearching && memoQuery && !error && (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-500">検索結果が見つかりませんでした</p>
            </div>
          )}
        </div>
      </div>

      {/* ボトムナビ */}
      <BottomNav />
    </div>
  );
}
