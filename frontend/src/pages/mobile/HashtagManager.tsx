// 何を: モバイル用ハッシュタグ管理画面
// なぜ: ユーザーが独自のハッシュタグを管理できるようにするため

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getUserHashtags,
  createHashtag,
  updateHashtag,
  deleteHashtag,
  type Hashtag,
} from '../../api/hashtags';
import HashtagChip from '../../components/hashtag/HashtagChip';
import ColorPicker from '../../components/hashtag/ColorPicker';

export default function HashtagManager() {
  const navigate = useNavigate();
  const [hashtags, setHashtags] = useState<Hashtag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingHashtag, setEditingHashtag] = useState<Hashtag | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#3B82F6');
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);

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

  // ハッシュタグを作成
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
      setShowCreateModal(false);
      setNewTagName('');
      setNewTagColor('#3B82F6');
      alert('ハッシュタグを作成しました！');
    } catch (error: any) {
      console.error('ハッシュタグ作成エラー:', error);
      alert(error.response?.data?.message || 'ハッシュタグの作成に失敗しました');
    } finally {
      setCreating(false);
    }
  };

  // 編集モーダルを開く
  const handleOpenEditModal = (hashtag: Hashtag) => {
    setEditingHashtag(hashtag);
    setNewTagName(hashtag.displayTag);
    setNewTagColor(hashtag.color || '#3B82F6');
    setShowEditModal(true);
  };

  // ハッシュタグを更新
  const handleUpdateHashtag = async () => {
    if (!editingHashtag) return;
    if (!newTagName.trim()) {
      alert('ハッシュタグ名を入力してください');
      return;
    }

    setUpdating(true);
    try {
      const updated = await updateHashtag(editingHashtag.id, {
        name: newTagName.trim(),
        color: newTagColor,
      });

      setHashtags(hashtags.map((h) => (h.id === updated.id ? updated : h)));
      setShowEditModal(false);
      setEditingHashtag(null);
      setNewTagName('');
      setNewTagColor('#3B82F6');
      alert('ハッシュタグを更新しました！');
    } catch (error: any) {
      console.error('ハッシュタグ更新エラー:', error);
      alert(error.response?.data?.message || 'ハッシュタグの更新に失敗しました');
    } finally {
      setUpdating(false);
    }
  };

  // ハッシュタグを削除
  const handleDeleteHashtag = async (hashtag: Hashtag) => {
    if (!confirm(`「${hashtag.displayTag}」を削除しますか？`)) {
      return;
    }

    try {
      await deleteHashtag(hashtag.id);
      setHashtags(hashtags.filter((h) => h.id !== hashtag.id));
      alert('ハッシュタグを削除しました');
    } catch (error: any) {
      console.error('ハッシュタグ削除エラー:', error);
      alert(error.response?.data?.message || 'ハッシュタグの削除に失敗しました');
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-600 hover:text-gray-900 text-xl"
          >
            ←
          </button>
          <h1 className="text-lg font-bold"># ハッシュタグ管理</h1>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700"
        >
          ＋ 作成
        </button>
      </header>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500">読み込み中...</div>
        ) : (
          <div className="space-y-3">
            {hashtags.length === 0 ? (
              <div className="bg-white rounded-lg p-8 text-center">
                <p className="text-gray-500 mb-4">まだハッシュタグがありません</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
                >
                  ＋ ハッシュタグを作成
                </button>
              </div>
            ) : (
              <>
                {hashtags.map((hashtag) => (
                  <div
                    key={hashtag.id}
                    className="bg-white rounded-lg shadow-sm border p-4 flex items-center justify-between"
                  >
                    <HashtagChip hashtag={hashtag} size="lg" />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleOpenEditModal(hashtag)}
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => handleDeleteHashtag(hashtag)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* 使い方説明 */}
            <div className="bg-blue-50 rounded-lg p-4 mt-4">
              <h3 className="font-bold text-blue-900 mb-2">💡 ハッシュタグ機能とは？</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• メモに独自のタグを付けて分類</li>
                <li>• 色を付けて視覚的に区別</li>
                <li>• 例: #修理必要 #確認済み #重要</li>
                <li>• タグで絞り込んで検索が可能</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* 作成モーダル */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">ハッシュタグを作成</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  タグ名 <span className="text-red-500">*</span>
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

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  色を選択
                </label>
                <ColorPicker
                  selectedColor={newTagColor}
                  onColorSelect={setNewTagColor}
                />
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">プレビュー:</p>
                <HashtagChip
                  hashtag={newTagName || 'サンプル'}
                  size="lg"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
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
        </div>
      )}

      {/* 編集モーダル */}
      {showEditModal && editingHashtag && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">ハッシュタグを編集</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  タグ名 <span className="text-red-500">*</span>
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

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  色を選択
                </label>
                <ColorPicker
                  selectedColor={newTagColor}
                  onColorSelect={setNewTagColor}
                />
              </div>

              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">プレビュー:</p>
                <HashtagChip
                  hashtag={newTagName || 'サンプル'}
                  size="lg"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingHashtag(null);
                  setNewTagName('');
                  setNewTagColor('#3B82F6');
                }}
                disabled={updating}
                className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 disabled:opacity-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleUpdateHashtag}
                disabled={updating || !newTagName.trim()}
                className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updating ? '更新中...' : '更新'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
