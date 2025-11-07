// 何を: ユーザー詳細画面（PC版）
// なぜ: 管理者がユーザー情報を詳細に確認・編集できるようにする

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/pc/Header';
import { getUserDetail, updateUser } from '../../api/admin';
import type { UserDetail } from '../../api/admin';

export default function AdminUserDetailPC() {
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
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 text-lg">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <p className="text-gray-600 text-lg">ユーザーが見つかりません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/admin/users')}
              className="mr-6 text-gray-600 hover:text-gray-800 text-lg"
            >
              ← 戻る
            </button>
            <h1 className="text-3xl font-bold text-gray-800">👤 ユーザー詳細</h1>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
            >
              編集
            </button>
          )}
          {editing && (
            <div className="flex gap-3">
              <button
                onClick={() => setEditing(false)}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
              >
                保存
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* 左カラム - 基本情報 */}
          <div className="col-span-2 space-y-6">
            {/* 基本情報カード */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">基本情報</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">ユーザー名</label>
                    <p className="font-semibold">{user.username}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">表示名</label>
                    <p className="font-semibold">{user.displayName || '-'}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-600">メールアドレス</label>
                  <p className="font-semibold">{user.email}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">ロール</label>
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
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
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
                    <label className="text-sm text-gray-600">プラン</label>
                    <p className="font-semibold capitalize">{user.planType}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">アカウント状態</label>
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
                    <label className="text-sm text-gray-600">メール認証</label>
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">登録日</label>
                    <p className="font-semibold">
                      {new Date(user.createdAt).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">出身都道府県</label>
                    <p className="font-semibold">{user.homePrefecture || '-'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 最近の活動 */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">最近登録した電柱</h2>
              {user.poleNumbers.length === 0 ? (
                <p className="text-gray-400">登録した電柱はありません</p>
              ) : (
                <div className="space-y-3">
                  {user.poleNumbers.map((poleNum) => (
                    <div key={poleNum.id} className="border-b pb-3 last:border-b-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{poleNum.poleNumber}</p>
                          <p className="text-sm text-gray-600">{poleNum.operatorName}</p>
                        </div>
                        <p className="text-sm text-gray-400">
                          {new Date(poleNum.createdAt).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 投稿した写真 */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">投稿した写真</h2>
              {user.uploadedPhotos.length === 0 ? (
                <p className="text-gray-400">投稿した写真はありません</p>
              ) : (
                <div className="grid grid-cols-5 gap-3">
                  {user.uploadedPhotos.map((photo) => (
                    <img
                      key={photo.id}
                      src={photo.photoThumbnailUrl}
                      alt="電柱写真"
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 右カラム - 統計 */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">活動統計</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">登録した電柱</span>
                  <span className="text-2xl font-bold text-blue-600">{user.stats.poles}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">投稿した写真</span>
                  <span className="text-2xl font-bold text-green-600">{user.stats.photos}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">作成したメモ</span>
                  <span className="text-2xl font-bold text-purple-600">{user.stats.memos}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">通報数</span>
                  <span className="text-2xl font-bold text-orange-600">{user.stats.reports}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
