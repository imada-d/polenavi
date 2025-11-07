// 何を: 公開統計ページ（PC版）
// なぜ: サービス全体の統計情報を誰でも閲覧できるようにする

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/pc/Header';
import { getPublicStats } from '../../api/stats';
import type { PublicStats } from '../../api/stats';

export default function StatsPC() {
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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
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
        <div className="max-w-6xl mx-auto px-6 py-16 text-center">
          <p className="text-gray-600 text-lg">統計データの取得に失敗しました</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* ヘッダー */}
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mr-6 text-gray-600 hover:text-gray-800 text-lg"
          >
            ← 戻る
          </button>
          <h1 className="text-3xl font-bold text-gray-800">📊 統計情報</h1>
        </div>

        {/* 総計 */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">総計</h2>
          <div className="grid grid-cols-4 gap-6">
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
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">今日の活動</h2>
          <div className="grid grid-cols-2 gap-6">
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
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            アクティブユーザー
          </h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">過去24時間</div>
              <div className="text-3xl font-bold text-blue-600">
                {stats.activeUsers.last24h.toLocaleString()}
              </div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">過去7日</div>
              <div className="text-3xl font-bold text-blue-600">
                {stats.activeUsers.last7d.toLocaleString()}
              </div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">過去30日</div>
              <div className="text-3xl font-bold text-blue-600">
                {stats.activeUsers.last30d.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* フッター */}
        <div className="text-center py-6 text-sm text-gray-500">
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
    <div className="bg-gray-50 rounded-lg p-6 text-center">
      <div className="text-4xl mb-2">{icon}</div>
      <div className="text-sm text-gray-600 mb-2">{label}</div>
      <div className={`text-3xl font-bold ${colorClass}`}>{value}</div>
    </div>
  );
}
