// 何を: PC版のメモ・ハッシュタグ入力欄
// なぜ: 任意でメモ・ハッシュタグを入力できるようにするため

import { useState } from 'react';
import HashtagSelector from '../../hashtag/HashtagSelector';
import HashtagChip from '../../hashtag/HashtagChip';

interface MemoSectionProps {
  hashtags: string;
  memoText: string;
  onHashtagsChange: (hashtags: string) => void;
  onMemoTextChange: (memoText: string) => void;
}

export default function MemoSection({
  hashtags,
  memoText,
  onHashtagsChange,
  onMemoTextChange,
}: MemoSectionProps) {
  const [showHashtagSelector, setShowHashtagSelector] = useState(false);

  // ハッシュタグを配列に変換
  const selectedTags = hashtags
    .split(/\s+/)
    .filter(tag => tag.trim() !== '')
    .map(tag => tag.startsWith('#') ? tag : `#${tag}`);

  // ハッシュタグが変更された時
  const handleTagsChange = (tags: string[]) => {
    onHashtagsChange(tags.join(' '));
  };

  // タグを削除
  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = selectedTags.filter(tag => tag !== tagToRemove);
    onHashtagsChange(newTags.join(' '));
  };

  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold mb-3">📝 メモ・ハッシュタグ</h2>

      {/* ハッシュタグ入力欄 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-gray-700">
            🏷️ ハッシュタグ
          </label>
          <button
            type="button"
            onClick={() => setShowHashtagSelector(true)}
            className="text-blue-600 text-sm font-semibold hover:text-blue-700"
          >
            マスターから選択
          </button>
        </div>

        {/* 選択されたタグ */}
        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
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
          value={hashtags}
          onChange={(e) => onHashtagsChange(e.target.value)}
          placeholder="#2連○ #LED"
          className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          📝 スペース区切りで複数入力 or マスターから選択
        </p>
      </div>

      {/* ハッシュタグ選択モーダル */}
      {showHashtagSelector && (
        <HashtagSelector
          selectedTags={selectedTags}
          onTagsChange={handleTagsChange}
          onClose={() => setShowHashtagSelector(false)}
        />
      )}

      {/* メモ入力欄 */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2 text-gray-700">
          📝 メモ欄
        </label>
        <textarea
          value={memoText}
          onChange={(e) => onMemoTextChange(e.target.value)}
          placeholder="2025/09/30 設置&#10;管理番号: 123"
          rows={4}
          className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <p className="text-xs text-gray-500 mt-1">
          📝 自由にメモを入力できます
        </p>
      </div>

      {/* 注意事項 */}
      <div className="bg-blue-50 border border-blue-200 rounded p-3">
        <p className="text-xs text-gray-700">
          <strong>📝 任意項目</strong>
          <br />
          メモ・ハッシュタグは省略可能です
          <br />
          後から編集することも可能です
        </p>
      </div>
    </div>
  );
}
