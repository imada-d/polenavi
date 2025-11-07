// 何を: 公開統計ページ（モバイル版）
// なぜ: サービス全体の統計情報を誰でも閲覧できるようにする

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPublicStats } from '../../api/stats';
import type { PublicStats } from '../../api/stats';

export default function Stats() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getPublicStats();
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
          onClick={() => navigate(-1)}
          className="mr-4 text-gray-600 hover:text-gray-800"
        >
          ← 戻る
        </button>
        <h1 className="text-lg font-bold">📊 統計情報</h1>
      </header>

      {/* コンテンツ */}
      <div className="p-4 space-y-4">
        {/* 総計 */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h2 className="text-base font-bold text-gray-800 mb-3">総計</h2>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon="👥"
              label="ユーザー"
              value={stats.totals.users.toLocaleString()}
            />
            <StatCard
              icon="📍"
              label="電柱"
              value={stats.totals.poles.toLocaleString()}
            />
            <StatCard
              icon="📷"
              label="写真"
              value={stats.totals.photos.toLocaleString()}
            />
            <StatCard
              icon="📝"
              label="メモ"
              value={stats.totals.memos.toLocaleString()}
            />
          </div>
        </div>

        {/* 今日の活動 */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h2 className="text-base font-bold text-gray-800 mb-3">今日の活動</h2>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon="🆕"
              label="新規ユーザー"
              value={stats.today.newUsers.toLocaleString()}
              color="green"
            />
            <StatCard
              icon="✨"
              label="新規電柱"
              value={stats.today.newPoles.toLocaleString()}
              color="green"
            />
          </div>
        </div>

        {/* アクティブユーザー */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h2 className="text-base font-bold text-gray-800 mb-3">
            アクティブユーザー
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-gray-600">過去24時間</span>
              <span className="text-lg font-semibold text-blue-600">
                {stats.activeUsers.last24h.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b">
              <span className="text-sm text-gray-600">過去7日</span>
              <span className="text-lg font-semibold text-blue-600">
                {stats.activeUsers.last7d.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">過去30日</span>
              <span className="text-lg font-semibold text-blue-600">
                {stats.activeUsers.last30d.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="text-center py-4 text-xs text-gray-500">
          最終更新: {new Date().toLocaleString('ja-JP')}
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: string;
  label: string;
  value: string;
  color?: 'blue' | 'green';
}

function StatCard({ icon, label, value, color = 'blue' }: StatCardProps) {
  const colorClass = color === 'green' ? 'text-green-600' : 'text-blue-600';

  return (
    <div className="bg-gray-50 rounded-lg p-3 text-center">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xs text-gray-600 mb-1">{label}</div>
      <div className={`text-xl font-bold ${colorClass}`}>{value}</div>
    </div>
  );
}
