// 何を: 電柱管理画面（PC版）
// なぜ: 管理者が電柱一覧を確認・検索できるようにする

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/pc/Header';
import { getPoles } from '../../api/admin';
import type { AdminPole } from '../../api/admin';

export default function AdminPolesPC() {
  const navigate = useNavigate();
  const [poles, setPoles] = useState<AdminPole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<'createdAt' | 'photoCount' | 'numberCount' | 'updatedAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadPoles();
  }, [page, search, sortBy, sortOrder]);

  const loadPoles = async () => {
    try {
      setLoading(true);
      const data = await getPoles({
        page,
        limit: 20,
        search: search || undefined,
        sortBy,
        sortOrder,
      });
      setPoles(data.poles);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error('電柱データの取得に失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      // 同じフィールドをクリックした場合は昇順/降順を切り替え
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const formatPoleNumbers = (poleNumbers: AdminPole['poleNumbers']) => {
    if (poleNumbers.length === 0) return '未登録';
    const first3 = poleNumbers.slice(0, 3);
    const display = first3.map(p => `${p.operatorName}:${p.poleNumber}`).join(', ');
    return poleNumbers.length > 3 ? `${display}...` : display;
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
            <h1 className="text-3xl font-bold text-gray-800">📍 電柱管理</h1>
          </div>
          <div className="text-gray-600">全{total}件の電柱</div>
        </div>

        {/* 検索バー */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <input
            type="text"
            placeholder="電柱番号、都道府県で検索..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full border rounded-lg px-4 py-2"
          />
        </div>

        {/* 電柱テーブル */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : poles.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-lg">
            電柱が見つかりません
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        電柱番号
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        位置情報
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        緯度・経度
                      </th>
                      <th
                        className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('photoCount')}
                      >
                        写真 {sortBy === 'photoCount' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                        メモ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                        登録者
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('createdAt')}
                      >
                        登録日 {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {poles.map((pole) => (
                      <tr
                        key={pole.id}
                        onClick={() => navigate(`/pole/${pole.id}`)}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-800 font-medium">
                            {formatPoleNumbers(pole.poleNumbers)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-800">
                            {pole.prefecture || '不明'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs text-gray-600 font-mono">
                            {pole.latitude.toFixed(6)}, {pole.longitude.toFixed(6)}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-semibold text-blue-600">
                            {pole.photoCount}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="font-semibold text-green-600">
                            {pole.memoCount}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-800">
                            {pole.poleNumbers[0]?.registeredByName || '不明'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(pole.createdAt).toLocaleDateString('ja-JP')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
