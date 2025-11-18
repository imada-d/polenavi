// 何を: 電柱管理画面（モバイル版）
// なぜ: 管理者が電柱一覧を確認・検索できるようにする

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPoles } from '../../api/admin';
import type { AdminPole } from '../../api/admin';

export default function AdminPoles() {
  const navigate = useNavigate();
  const [poles, setPoles] = useState<AdminPole[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedPoles, setSelectedPoles] = useState<Set<number>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadPoles();
  }, [page, search]);

  const loadPoles = async () => {
    try {
      setLoading(true);
      const data = await getPoles({
        page,
        limit: 20,
        search: search || undefined,
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

  const formatPoleNumbers = (poleNumbers: AdminPole['poleNumbers']) => {
    if (poleNumbers.length === 0) return '未登録';
    const first3 = poleNumbers.slice(0, 3);
    const display = first3.map(p => `${p.operatorName}:${p.poleNumber}`).join(', ');
    return poleNumbers.length > 3 ? `${display}...` : display;
  };

  // チェックボックス選択
  const handleSelectPole = (poleId: number, checked: boolean) => {
    const newSelected = new Set(selectedPoles);
    if (checked) {
      newSelected.add(poleId);
    } else {
      newSelected.delete(poleId);
    }
    setSelectedPoles(newSelected);
  };

  // 一括削除
  const handleBulkDelete = async () => {
    if (selectedPoles.size === 0) {
      alert('削除する電柱を選択してください');
      return;
    }

    const confirmed = window.confirm(
      `選択した${selectedPoles.size}件の電柱を削除しますか？\n\n⚠️ この操作は取り消せません。`
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);
      const token = localStorage.getItem('token');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/poles/bulk-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ poleIds: Array.from(selectedPoles) }),
      });

      if (!response.ok) {
        throw new Error('削除に失敗しました');
      }

      alert(`${selectedPoles.size}件の電柱を削除しました`);
      setSelectedPoles(new Set());
      loadPoles(); // リロード
    } catch (error) {
      console.error('一括削除エラー:', error);
      alert('削除に失敗しました');
    } finally {
      setIsDeleting(false);
    }
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
        <h1 className="text-lg font-bold">📍 電柱管理</h1>
      </header>

      {/* 検索バー */}
      <div className="bg-white border-b px-4 py-3">
        <input
          type="text"
          placeholder="電柱番号、都道府県で検索..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {/* 電柱数と一括削除ボタン */}
      <div className="px-4 py-2 flex items-center justify-between">
        <div className="text-sm text-gray-600">全{total}件の電柱</div>
        {selectedPoles.size > 0 && (
          <button
            onClick={handleBulkDelete}
            disabled={isDeleting}
            className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 text-sm font-semibold"
          >
            {isDeleting ? '削除中...' : `🗑️ ${selectedPoles.size}件削除`}
          </button>
        )}
      </div>

      {/* コンテンツ */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : poles.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            電柱が見つかりません
          </div>
        ) : (
          <div className="space-y-3">
            {poles.map((pole) => (
              <div
                key={pole.id}
                className="bg-white rounded-lg shadow-sm border p-4 relative"
              >
                {/* チェックボックス（左上） */}
                <div className="absolute top-3 left-3">
                  <input
                    type="checkbox"
                    checked={selectedPoles.has(pole.id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleSelectPole(pole.id, e.target.checked);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-5 h-5 cursor-pointer"
                  />
                </div>

                {/* クリック可能エリア */}
                <div
                  onClick={() => navigate(`/pole/${pole.id}`)}
                  className="ml-8 cursor-pointer"
                >
                {/* 電柱番号 */}
                <div className="font-semibold text-gray-800">
                  {formatPoleNumbers(pole.poleNumbers)}
                </div>

                {/* 位置情報 */}
                <div className="mt-2 text-sm text-gray-700">
                  📍 {pole.prefecture || '不明'}
                </div>

                {/* 緯度・経度 */}
                <div className="mt-2 text-xs text-gray-500 font-mono">
                  {pole.latitude.toFixed(6)}, {pole.longitude.toFixed(6)}
                </div>

                {/* 統計情報 */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="bg-blue-50 rounded p-2">
                    <div className="text-gray-600">📷 写真</div>
                    <div className="font-semibold text-blue-600">
                      {pole.photoCount}
                    </div>
                  </div>
                  <div className="bg-green-50 rounded p-2">
                    <div className="text-gray-600">📝 メモ</div>
                    <div className="font-semibold text-green-600">
                      {pole.memoCount}
                    </div>
                  </div>
                </div>

                {/* 登録者と日付 */}
                <div className="mt-3 text-xs text-gray-500">
                  <div>
                    登録者: {pole.poleNumbers[0]?.registeredByName || '不明'}
                  </div>
                  <div className="mt-1">
                    登録日: {new Date(pole.createdAt).toLocaleDateString('ja-JP')}
                  </div>
                </div>
                </div>
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
