// 何を: PC版のメモ・ハッシュタグ入力欄
// なぜ: 任意でメモ・ハッシュタグを入力できるようにするため

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
  return (
    <div className="mb-6">
      <h2 className="text-lg font-bold mb-3">📝 メモ・ハッシュタグ</h2>

      {/* ハッシュタグ入力欄 */}
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2 text-gray-700">
          🏷️ ハッシュタグ
        </label>
        <input
          type="text"
          value={hashtags}
          onChange={(e) => onHashtagsChange(e.target.value)}
          placeholder="#2連○ #LED"
          className="w-full px-3 py-2 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          📝 スペース区切りで複数入力できます
        </p>
      </div>

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
