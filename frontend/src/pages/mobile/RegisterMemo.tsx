// 何を: メモ・ハッシュタグ入力画面（モバイル版）
// なぜ: 登録フローの一部として、任意でメモを追加できるようにするため

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function RegisterMemo() {
  const navigate = useNavigate();
  const location = useLocation();

  // 前の画面から受け取ったデータ
  const state = location.state || {};

  // メモ・ハッシュタグの状態
  const [hashtags, setHashtags] = useState<string>('');
  const [memoText, setMemoText] = useState<string>('');

  // スキップ（メモなしで次へ）
  const handleSkip = () => {
    navigate('/register/confirm', {
      state: {
        ...state,
        hashtags: [],
        memoText: '',
      },
    });
  };

  // 次へ（メモありで次へ）
  const handleNext = () => {
    // ハッシュタグを配列に変換
    const hashtagArray = hashtags
      .split(/[,、\s]+/) // カンマ、全角カンマ、スペースで分割
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
      .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`)); // #を自動追加

    navigate('/register/confirm', {
      state: {
        ...state,
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
        {/* ハッシュタグ入力 */}
        <div className="mb-6">
          <label className="block text-lg font-bold mb-2">🏷️ ハッシュタグ</label>
          <input
            type="text"
            value={hashtags}
            onChange={(e) => setHashtags(e.target.value)}
            placeholder="#防犯灯 #LED"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-sm text-gray-500 mt-2">
            💡 カンマ、スペースで区切って複数入力できます
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
            ・ハッシュタグで検索しやすくなります
            <br />
            ・メモは個人的な管理用に使えます
            <br />
            ・スキップもできます
          </p>
        </div>
      </main>

      {/* ボタンエリア */}
      <div className="p-4 bg-white border-t space-y-3">
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
