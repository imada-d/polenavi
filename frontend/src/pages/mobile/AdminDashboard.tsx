// 何を: 管理者ダッシュボード（モバイル版）
// なぜ: 管理者向けの詳細統計とユーザー管理へのアクセス

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminStats } from '../../api/stats';
import type { AdminStats } from '../../api/stats';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getAdminStats();
      setStats(data);
    } catch (error) {
      console.error('統計データの取得に失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">統計データの取得に失敗しました</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-3 flex items-center">
        <button
          onClick={() => navigate('/mypage')}
          className="mr-4 text-gray-600 hover:text-gray-800"
        >
          ← 戻る
        </button>
        <h1 className="text-lg font-bold">🛠️ 管理画面</h1>
      </header>

      {/* コンテンツ */}
      <div className="p-4 space-y-4">
        {/* クイックアクション */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h2 className="text-base font-bold text-gray-800 mb-3">
            クイックアクション
          </h2>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/admin/users')}
              className="w-full bg-blue-50 text-blue-700 py-3 rounded-lg font-semibold text-sm hover:bg-blue-100 transition-colors flex items-center justify-between px-4"
            >
              <span>👥 ユーザー管理</span>
              <span className="text-blue-600">→</span>
            </button>
            <button
              onClick={() => alert('Phase 2で実装予定')}
              className="w-full bg-gray-50 text-gray-600 py-3 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors flex items-center justify-between px-4"
            >
              <span>🚨 通報管理</span>
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {stats.admin.pendingReports}
              </span>
            </button>
          </div>
        </div>

        {/* 総計 */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h2 className="text-base font-bold text-gray-800 mb-3">総計</h2>
          <div className="grid grid-cols-2 gap-3">
            <StatCard icon="👥" label="ユーザー" value={stats.totals.users} />
            <StatCard icon="📍" label="電柱" value={stats.totals.poles} />
            <StatCard icon="📷" label="写真" value={stats.totals.photos} />
            <StatCard icon="📝" label="メモ" value={stats.totals.memos} />
            <StatCard
              icon="🏷️"
              label="電柱番号"
              value={stats.totals.poleNumbers}
            />
            <StatCard icon="🚨" label="通報" value={stats.totals.reports} />
          </div>
        </div>

        {/* 管理者情報 */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h2 className="text-base font-bold text-gray-800 mb-3">
            管理者情報
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-gray-600">未処理の通報</span>
              <span className="text-lg font-semibold text-red-600">
                {stats.admin.pendingReports}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">非アクティブユーザー</span>
              <span className="text-lg font-semibold text-gray-600">
                {stats.admin.inactiveUsers}
              </span>
            </div>
          </div>
        </div>

        {/* 都道府県別統計 */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h2 className="text-base font-bold text-gray-800 mb-3">
            都道府県別登録数（上位10件）
          </h2>
          <div className="space-y-2">
            {stats.byPrefecture.slice(0, 10).map((pref, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center py-2 border-b last:border-b-0"
              >
                <span className="text-sm text-gray-700">
                  {pref.prefecture || '不明'}
                </span>
                <span className="text-sm font-semibold text-blue-600">
                  {pref.count.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: string;
  label: string;
  value: number;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xs text-gray-600 mb-1">{label}</div>
      <div className="text-xl font-bold text-blue-600">
        {value.toLocaleString()}
      </div>
    </div>
  );
}
