// 何を: ユーザー管理画面（PC版）
// なぜ: 管理者がユーザー一覧を確認・検索できるようにする

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/pc/Header';
import { getUsers } from '../../api/admin';
import type { AdminUser } from '../../api/admin';

export default function AdminUsersPC() {
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
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/admin')}
              className="mr-6 text-gray-600 hover:text-gray-800 text-lg"
            >
              ← 戻る
            </button>
            <h1 className="text-3xl font-bold text-gray-800">👥 ユーザー管理</h1>
          </div>
          <div className="text-gray-600">全{total}件のユーザー</div>
        </div>

        {/* 検索バー */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <input
            type="text"
            placeholder="ユーザー名、メールアドレスで検索..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>

        {/* ユーザーテーブル */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-lg">
            ユーザーが見つかりません
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      ユーザー
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      役割
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                      電柱
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                      写真
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                      メモ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      登録日
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-gray-800">
                            {user.displayName || user.username}
                            {!user.isActive && (
                              <span className="ml-2 text-xs text-red-600">
                                ⚠️ 非アクティブ
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            @{user.username}
                          </div>
                          <div className="text-xs text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-700'
                              : user.role === 'moderator'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-semibold text-blue-600">
                          {user.stats.poles}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-semibold text-blue-600">
                          {user.stats.photos}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-semibold text-blue-600">
                          {user.stats.memos}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(user.createdAt).toLocaleDateString('ja-JP')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ページネーション */}
            {total > 20 && (
              <div className="flex justify-center gap-3 mt-6">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  前へ
                </button>
                <span className="px-4 py-2 font-semibold">
                  {page} / {Math.ceil(total / 20)}
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= Math.ceil(total / 20)}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  次へ
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
