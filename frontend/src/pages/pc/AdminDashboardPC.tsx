// 何を: 管理者ダッシュボード（PC版）
// なぜ: 管理者向けの詳細統計とユーザー管理へのアクセス

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/pc/Header';
import { getAdminStats } from '../../api/stats';
import type { AdminStats } from '../../api/stats';

export default function AdminDashboardPC() {
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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600 text-lg">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <p className="text-gray-600 text-lg">統計データの取得に失敗しました</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/mypage')}
              className="mr-6 text-gray-600 hover:text-gray-800 text-lg"
            >
              ← 戻る
            </button>
            <h1 className="text-3xl font-bold text-gray-800">🛠️ 管理画面</h1>
          </div>
        </div>

        {/* クイックアクション */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            クイックアクション
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/admin/users')}
              className="bg-blue-50 text-blue-700 py-4 rounded-lg font-semibold hover:bg-blue-100 transition-colors flex items-center justify-between px-6"
            >
              <span className="text-lg">👥 ユーザー管理</span>
              <span className="text-blue-600 text-2xl">→</span>
            </button>
            <button
              onClick={() => navigate('/admin/poles')}
              className="bg-green-50 text-green-700 py-4 rounded-lg font-semibold hover:bg-green-100 transition-colors flex items-center justify-between px-6"
            >
              <span className="text-lg">📍 電柱管理</span>
              <span className="text-green-600 text-2xl">→</span>
            </button>
            <button
              onClick={() => navigate('/admin/reports')}
              className="bg-gray-50 text-gray-600 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center justify-between px-6"
            >
              <span className="text-lg">🚨 通報管理</span>
              <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full">
                {stats.admin.pendingReports}
              </span>
            </button>
            <button
              onClick={() => navigate('/admin/bug-reports')}
              className="bg-red-50 text-red-700 py-4 rounded-lg font-semibold hover:bg-red-100 transition-colors flex items-center justify-between px-6"
            >
              <span className="text-lg">🐛 バグ報告管理</span>
              <span className="text-red-600 text-2xl">→</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* 左カラム - 総計 */}
          <div className="col-span-2 space-y-6">
            {/* 総計 */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">総計</h2>
              <div className="grid grid-cols-3 gap-4">
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

            {/* 都道府県別統計 */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                都道府県別登録数（上位10件）
              </h2>
              <div className="space-y-2">
                {stats.byPrefecture.slice(0, 10).map((pref, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center py-3 border-b last:border-b-0"
                  >
                    <div className="flex items-center">
                      <span className="text-sm font-semibold text-gray-400 w-8">
                        {idx + 1}.
                      </span>
                      <span className="text-base text-gray-700">
                        {pref.prefecture || '不明'}
                      </span>
                    </div>
                    <span className="text-lg font-semibold text-blue-600">
                      {pref.count.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 右カラム - 管理者情報 */}
          <div className="space-y-6">
            {/* 管理者情報 */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                管理者情報
              </h2>
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-sm text-red-700 mb-1">未処理の通報</div>
                  <div className="text-3xl font-bold text-red-600">
                    {stats.admin.pendingReports}
                  </div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">
                    非アクティブユーザー
                  </div>
                  <div className="text-3xl font-bold text-gray-700">
                    {stats.admin.inactiveUsers}
                  </div>
                </div>
              </div>
            </div>

            {/* アクティブユーザー */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                アクティブユーザー
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-gray-600">過去24時間</span>
                  <span className="text-lg font-semibold text-blue-600">
                    {stats.activeUsers.last24h}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm text-gray-600">過去7日</span>
                  <span className="text-lg font-semibold text-blue-600">
                    {stats.activeUsers.last7d}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-gray-600">過去30日</span>
                  <span className="text-lg font-semibold text-blue-600">
                    {stats.activeUsers.last30d}
                  </span>
                </div>
              </div>
            </div>
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
    <div className="bg-gray-50 rounded-lg p-4 text-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-sm text-gray-600 mb-2">{label}</div>
      <div className="text-2xl font-bold text-blue-600">
        {value.toLocaleString()}
      </div>
    </div>
  );
}
