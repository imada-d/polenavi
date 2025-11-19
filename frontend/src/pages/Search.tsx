import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { searchPoleByNumber } from '../api/poles';

export default function Search() {
  const navigate = useNavigate();
  const [number, setNumber] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
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

  const handleShowOnMap = () => {
    if (searchResult && searchResult.pole) {
      // 地図画面に移動して、該当の電柱の位置を表示
      navigate('/', {
        state: {
          center: [
            Number(searchResult.pole.latitude),
            Number(searchResult.pole.longitude),
          ],
          zoom: 18,
        },
      });
    }
  };

  return (
    <>
      <Helmet>
        <title>検索 - PoleNavi</title>
        <meta name="description" content="電柱番号やハッシュタグで柱を検索。番号札の番号、キーワード、ハッシュタグから柱の位置情報を素早く見つけられます。" />
        <meta property="og:title" content="検索 - PoleNavi" />
        <meta property="og:description" content="電柱番号やハッシュタグで柱を検索。番号札の番号、キーワード、ハッシュタグから柱の位置情報を素早く見つけられます。" />
        <link rel="canonical" href="https://polenavi.com/search" />
      </Helmet>
      <div className="p-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">🔍 検索</h1>

      <div className="space-y-4">
        {/* 番号検索 */}
        <div>
          <label className="block text-sm font-medium mb-1">番号札の番号</label>
          <input
            type="text"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch();
              }
            }}
            placeholder="例: 247エ714"
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            電柱番号（全角・半角どちらでも可）
          </p>
        </div>

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

        {/* 検索結果 */}
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
              onClick={handleShowOnMap}
              className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition-colors mt-4"
            >
              📍 地図で見る
            </button>
          </div>
        )}
      </div>
      </div>
    </>
  );
}
