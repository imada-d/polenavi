// 何を: ユーザー管理画面（モバイル版）
// なぜ: 管理者がユーザー一覧を確認・検索できるようにする

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers } from '../../api/admin';
import type { AdminUser } from '../../api/admin';

export default function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadUsers();
  }, [page, search]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers({
        page,
        limit: 20,
        search: search || undefined,
      });
      setUsers(data.users);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error('ユーザーデータの取得に失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-3 flex items-center">
        <button
          onClick={() => navigate('/admin')}
          className="mr-4 text-gray-600 hover:text-gray-800"
        >
          ← 戻る
        </button>
        <h1 className="text-lg font-bold">👥 ユーザー管理</h1>
      </header>

      {/* 検索バー */}
      <div className="bg-white border-b px-4 py-3">
        <input
          type="text"
          placeholder="ユーザー名、メールアドレスで検索..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {/* ユーザー数 */}
      <div className="px-4 py-2 text-sm text-gray-600">
        全{total}件のユーザー
      </div>

      {/* コンテンツ */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            ユーザーが見つかりません
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => navigate(`/admin/users/${user.id}`)}
                className="bg-white rounded-lg shadow-sm border p-4 cursor-pointer hover:bg-gray-50"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">
                      {user.displayName || user.username}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      @{user.username}
                    </div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                  <div className="ml-3">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        user.role === 'admin'
                          ? 'bg-purple-100 text-purple-700'
                          : user.role === 'moderator'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-gray-600">電柱</div>
                    <div className="font-semibold text-blue-600">
                      {user.stats.poles}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-gray-600">写真</div>
                    <div className="font-semibold text-blue-600">
                      {user.stats.photos}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <div className="text-gray-600">メモ</div>
                    <div className="font-semibold text-blue-600">
                      {user.stats.memos}
                    </div>
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  登録日: {new Date(user.createdAt).toLocaleDateString('ja-JP')}
                </div>

                {!user.isActive && (
                  <div className="mt-2 text-xs text-red-600 font-semibold">
                    ⚠️ 非アクティブ
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ページネーション */}
        {total > 20 && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              前へ
            </button>
            <span className="px-4 py-2">
              {page} / {Math.ceil(total / 20)}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(total / 20)}
              className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              次へ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
