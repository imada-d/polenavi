// 何を: ハッシュタグ選択モーダル
// なぜ: メモ作成時にハッシュタグを選択・作成するため

import { useState, useEffect } from 'react';
import { getUserHashtags, createHashtag, type Hashtag } from '../../api/hashtags';
import HashtagChip from './HashtagChip';
import ColorPicker from './ColorPicker';

interface HashtagSelectorProps {
  selectedTags: string[]; // 現在選択されているタグ名の配列
  onTagsChange: (tags: string[]) => void; // タグが変更されたときのコールバック
  onClose: () => void; // モーダルを閉じるコールバック
}

export default function HashtagSelector({
  selectedTags,
  onTagsChange,
  onClose,
}: HashtagSelectorProps) {
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6');
  const [creating, setCreating] = useState(false);

  // ハッシュタグ一覧を取得
  useEffect(() => {
    const fetchHashtags = async () => {
      try {
        const data = await getUserHashtags();
        setHashtags(data);
      } catch (error) {
        console.error('ハッシュタグ取得エラー:', error);
        alert('ハッシュタグの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    fetchHashtags();
  }, []);

  // タグを選択/解除
  const handleToggleTag = (hashtag: Hashtag) => {
    const tagName = hashtag.displayTag;
    if (selectedTags.includes(tagName)) {
      onTagsChange(selectedTags.filter((t) => t !== tagName));
    } else {
      onTagsChange([...selectedTags, tagName]);
    }
  };

  // 新しいハッシュタグを作成
  const handleCreateHashtag = async () => {
    if (!newTagName.trim()) {
      alert('ハッシュタグ名を入力してください');
      return;
    }

    setCreating(true);
    try {
      const newHashtag = await createHashtag({
        name: newTagName.trim(),
        color: newTagColor,
      });

      setHashtags([...hashtags, newHashtag]);
      setShowCreateForm(false);
      setNewTagName('');
      setNewTagColor('#3B82F6');

      // 作成したタグを自動選択
      onTagsChange([...selectedTags, newHashtag.displayTag]);
    } catch (error: any) {
      console.error('ハッシュタグ作成エラー:', error);
      alert(error.response?.data?.message || 'ハッシュタグの作成に失敗しました');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-bold">ハッシュタグ選択</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* コンテンツ */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500">読み込み中...</div>
          ) : (
            <>
              {/* 選択中のタグ */}
              {selectedTags.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-bold text-gray-700 mb-2">選択中</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tagName) => {
                      const hashtag = hashtags.find((h) => h.displayTag === tagName);
                      return (
                        <HashtagChip
                          key={tagName}
                          hashtag={hashtag || tagName}
                          onRemove={() => hashtag && handleToggleTag(hashtag)}
                          size="md"
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {/* タグ一覧 */}
              <div className="mb-4">
                <p className="text-sm font-bold text-gray-700 mb-2">タグ一覧</p>
                {hashtags.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-2">まだハッシュタグがありません</p>
                    <p className="text-sm">下のボタンから作成できます</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {hashtags.map((hashtag) => {
                      const isSelected = selectedTags.includes(hashtag.displayTag);
                      return (
                        <button
                          key={hashtag.id}
                          onClick={() => handleToggleTag(hashtag)}
                          className={`${
                            isSelected ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                          }`}
                        >
                          <HashtagChip hashtag={hashtag} size="md" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 新規作成フォーム */}
              {showCreateForm ? (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="mb-3">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      タグ名
                    </label>
                    <input
                      type="text"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      placeholder="例: 修理必要"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      maxLength={50}
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      色を選択
                    </label>
                    <ColorPicker
                      selectedColor={newTagColor}
                      onColorSelect={setNewTagColor}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewTagName('');
                        setNewTagColor('#3B82F6');
                      }}
                      disabled={creating}
                      className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50"
                    >
                      キャンセル
                    </button>
                    <button
                      onClick={handleCreateHashtag}
                      disabled={creating || !newTagName.trim()}
                      className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {creating ? '作成中...' : '作成'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 font-semibold hover:border-blue-500 hover:text-blue-600"
                >
                  ＋ 新しいタグを作成
                </button>
              )}
            </>
          )}
        </div>

        {/* フッター */}
        <div className="p-4 border-t">
          <button
            onClick={onClose}
            className="w-full py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800"
          >
            完了
          </button>
        </div>
      </div>
    </div>
  );
}
