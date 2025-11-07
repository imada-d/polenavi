// 何を: ユーザー詳細画面（モバイル版）
// なぜ: 管理者がユーザー情報を詳細に確認・編集できるようにする

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUserDetail, updateUser } from '../../api/admin';
import type { UserDetail } from '../../api/admin';

export default function AdminUserDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    role: '',
    isActive: true,
    emailVerified: false,
  });

  useEffect(() => {
    if (id) {
      loadUser(parseInt(id));
    }
  }, [id]);

  const loadUser = async (userId: number) => {
    try {
      setLoading(true);
      const data = await getUserDetail(userId);
      setUser(data);
      setEditForm({
        role: data.role,
        isActive: data.isActive,
        emailVerified: data.emailVerified,
      });
    } catch (error) {
      console.error('ユーザー情報の取得に失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      await updateUser(user.id, editForm);
      alert('ユーザー情報を更新しました');
      setEditing(false);
      loadUser(user.id);
    } catch (error) {
      console.error('更新に失敗:', error);
      alert('更新に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b px-4 py-3">
          <h1 className="text-lg font-bold">ユーザー詳細</h1>
        </header>
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b px-4 py-3">
          <h1 className="text-lg font-bold">ユーザー詳細</h1>
        </header>
        <div className="text-center py-16 text-gray-400">
          ユーザーが見つかりません
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/admin/users')}
            className="mr-4 text-gray-600"
          >
            ← 戻る
          </button>
          <h1 className="text-lg font-bold">ユーザー詳細</h1>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            編集
          </button>
        )}
      </header>

      {/* コンテンツ */}
      <div className="p-4 space-y-4">
        {/* 基本情報 */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h2 className="font-bold mb-3">基本情報</h2>
          <div className="space-y-3 text-sm">
            <div>
              <label className="text-gray-600">ユーザー名</label>
              <p className="font-semibold">{user.username}</p>
            </div>
            <div>
              <label className="text-gray-600">表示名</label>
              <p className="font-semibold">{user.displayName || '-'}</p>
            </div>
            <div>
              <label className="text-gray-600">メールアドレス</label>
              <p className="font-semibold text-xs break-all">{user.email}</p>
            </div>
            <div>
              <label className="text-gray-600">ロール</label>
              {editing ? (
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                >
                  <option value="user">user</option>
                  <option value="moderator">moderator</option>
                  <option value="admin">admin</option>
                </select>
              ) : (
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                    user.role === 'admin'
                      ? 'bg-purple-100 text-purple-700'
                      : user.role === 'moderator'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {user.role}
                </span>
              )}
            </div>
            <div>
              <label className="text-gray-600">アカウント状態</label>
              {editing ? (
                <label className="flex items-center mt-1">
                  <input
                    type="checkbox"
                    checked={editForm.isActive}
                    onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <span>アクティブ</span>
                </label>
              ) : (
                <p className="font-semibold">
                  {user.isActive ? (
                    <span className="text-green-600">✓ アクティブ</span>
                  ) : (
                    <span className="text-red-600">✗ 非アクティブ</span>
                  )}
                </p>
              )}
            </div>
            <div>
              <label className="text-gray-600">メール認証</label>
              {editing ? (
                <label className="flex items-center mt-1">
                  <input
                    type="checkbox"
                    checked={editForm.emailVerified}
                    onChange={(e) =>
                      setEditForm({ ...editForm, emailVerified: e.target.checked })
                    }
                    className="mr-2"
                  />
                  <span>認証済み</span>
                </label>
              ) : (
                <p className="font-semibold">
                  {user.emailVerified ? (
                    <span className="text-green-600">✓ 認証済み</span>
                  ) : (
                    <span className="text-gray-400">未認証</span>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 統計 */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h2 className="font-bold mb-3">活動統計</h2>
          <div className="grid grid-cols-2 gap-3 text-center text-sm">
            <div className="bg-blue-50 rounded p-3">
              <div className="text-2xl font-bold text-blue-600">{user.stats.poles}</div>
              <div className="text-gray-600 mt-1">電柱</div>
            </div>
            <div className="bg-green-50 rounded p-3">
              <div className="text-2xl font-bold text-green-600">{user.stats.photos}</div>
              <div className="text-gray-600 mt-1">写真</div>
            </div>
            <div className="bg-purple-50 rounded p-3">
              <div className="text-2xl font-bold text-purple-600">{user.stats.memos}</div>
              <div className="text-gray-600 mt-1">メモ</div>
            </div>
            <div className="bg-orange-50 rounded p-3">
              <div className="text-2xl font-bold text-orange-600">{user.stats.reports}</div>
              <div className="text-gray-600 mt-1">通報</div>
            </div>
          </div>
        </div>

        {/* 最近の電柱 */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h2 className="font-bold mb-3">最近登録した電柱</h2>
          {user.poleNumbers.length === 0 ? (
            <p className="text-gray-400 text-sm">登録した電柱はありません</p>
          ) : (
            <div className="space-y-2">
              {user.poleNumbers.map((poleNum) => (
                <div key={poleNum.id} className="border-b pb-2 last:border-b-0 text-sm">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-semibold">{poleNum.poleNumber}</p>
                      <p className="text-xs text-gray-600">{poleNum.operatorName}</p>
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(poleNum.createdAt).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 投稿した写真 */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h2 className="font-bold mb-3">投稿した写真</h2>
          {user.uploadedPhotos.length === 0 ? (
            <p className="text-gray-400 text-sm">投稿した写真はありません</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {user.uploadedPhotos.map((photo) => (
                <img
                  key={photo.id}
                  src={photo.photoThumbnailUrl}
                  alt="電柱写真"
                  className="w-full aspect-square object-cover rounded"
                />
              ))}
            </div>
          )}
        </div>

        {/* 編集ボタン */}
        {editing && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex gap-3">
            <button
              onClick={() => setEditing(false)}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold"
            >
              キャンセル
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold"
            >
              保存
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
