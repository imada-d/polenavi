/**
 * 写真から登録 - メモ・ハッシュタグ入力画面（モバイル版）
 * 写真データを確実に保持して次画面へ渡す
 */

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import HashtagSelector from '../../components/hashtag/HashtagSelector';
import HashtagChip from '../../components/hashtag/HashtagChip';

export default function PhotoRegisterMemo() {
  const navigate = useNavigate();
  const location = useLocation();

  // 前の画面から受け取ったデータ
  const {
    location: pinLocation,
    poleType,
    poleSubType,
    plateCount,
    numbers,
    photos,
  } = location.state || {};

  // デバッグ用
  console.log('📝 PhotoRegisterMemo - 受け取ったデータ:', {
    pinLocation,
    poleType,
    poleSubType,
    plateCount,
    numbers,
    photos: photos ? `✅あり (${Array.isArray(photos) ? photos.length : 'object'})` : '❌なし'
  });

  // メモ・ハッシュタグの状態
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [memoText, setMemoText] = useState<string>('');
  const [showHashtagSelector, setShowHashtagSelector] = useState(false);

  // スキップ（メモなしで次へ）
  const handleSkip = () => {
    navigate('/register/confirm', {
      state: {
        location: pinLocation,
        poleType,
        poleSubType,
        plateCount,
        numbers,
        photos, // 写真データを確実に保持
        registrationMethod: 'photo-first',
        hashtags: [],
        memoText: '',
      },
    });
  };

  // 次へ（メモありで次へ）
  const handleNext = () => {
    // ハッシュタグ配列を#付きに変換
    const hashtagArray = selectedTags.map((tag) =>
      tag.startsWith('#') ? tag : `#${tag}`
    );

    navigate('/register/confirm', {
      state: {
        location: pinLocation,
        poleType,
        poleSubType,
        plateCount,
        numbers,
        photos, // 写真データを確実に保持
        registrationMethod: 'photo-first',
        hashtags: hashtagArray,
        memoText: memoText.trim(),
      },
    });
  };

  return (
    <div className="h-screen w-full flex flex-col bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-3 flex items-center">
        <button onClick={() => navigate(-1)} className="text-2xl mr-3">
          ←
        </button>
        <h1 className="text-xl font-bold">メモを入力（任意）</h1>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-1 overflow-y-auto p-4">
        {/* ハッシュタグ選択 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-lg font-bold">🏷️ ハッシュタグ</label>
            <button
              onClick={() => setShowHashtagSelector(true)}
              className="text-blue-600 text-sm font-semibold hover:text-blue-700"
            >
              タグを選択
            </button>
          </div>

          {/* 選択されたタグ */}
          {selectedTags.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-3">
              {selectedTags.map((tag) => (
                <HashtagChip
                  key={tag}
                  hashtag={tag}
                  onRemove={() =>
                    setSelectedTags(selectedTags.filter((t) => t !== tag))
                  }
                  size="md"
                />
              ))}
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg p-4 text-center mb-3">
              <p className="text-gray-500 text-sm">タグが選択されていません</p>
            </div>
          )}

          <button
            onClick={() => setShowHashtagSelector(true)}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
          >
            ＋ タグを選択・作成
          </button>
          <p className="text-sm text-gray-500 mt-2">
            💡 ハッシュタグで検索・分類がしやすくなります
          </p>
        </div>

        {/* メモ入力 */}
        <div className="mb-6">
          <label className="block text-lg font-bold mb-2">📝 メモ</label>
          <textarea
            value={memoText}
            onChange={(e) => setMemoText(e.target.value)}
            placeholder="2025/09/30 交換済み&#10;管理番号: 123"
            rows={6}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <p className="text-sm text-gray-500 mt-2">
            💡 メモは後から編集できます
          </p>
        </div>

        {/* ヒント */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <strong>💡 ヒント</strong>
            <br />
            ・ハッシュタグで検索・絞り込みができます
            <br />
            ・独自のタグを作成して色分けできます
            <br />
            ・メモは個人的な管理用に使えます
            <br />
            ・スキップもできます
          </p>
        </div>
      </main>

      {/* ハッシュタグ選択モーダル */}
      {showHashtagSelector && (
        <HashtagSelector
          selectedTags={selectedTags}
          onTagsChange={setSelectedTags}
          onClose={() => setShowHashtagSelector(false)}
        />
      )}

      {/* ボタンエリア */}
      <div className="p-4 pb-20 bg-white border-t space-y-3">
        <button
          onClick={handleNext}
          className="w-full py-3 rounded-lg font-bold text-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          次へ（確認画面）
        </button>
        <button
          onClick={handleSkip}
          className="w-full py-3 rounded-lg font-bold text-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
        >
          スキップ
        </button>
      </div>
    </div>
  );
}
