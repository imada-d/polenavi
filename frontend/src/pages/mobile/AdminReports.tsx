// 何を: 通報管理画面（モバイル版）
// なぜ: 管理者が通報を確認・処理できるようにする

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReports } from '../../api/admin';
import type { Report } from '../../api/admin';

export default function AdminReports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'reviewed' | 'resolved'>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadReports();
  }, [page, statusFilter]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await getReports({
        page,
        limit: 20,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      setReports(data.reports);
      setTotal(data.pagination.total);
    } catch (error) {
      console.error('通報データの取得に失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      inappropriate: '不適切',
      spam: 'スパム',
      misinformation: '誤情報',
      duplicate: '重複',
      other: 'その他',
    };
    return labels[reason] || reason;
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: '未処理' },
      reviewed: { bg: 'bg-blue-100', text: 'text-blue-700', label: '確認済み' },
      resolved: { bg: 'bg-green-100', text: 'text-green-700', label: '解決済み' },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-3 flex items-center">
        <button
          onClick={() => navigate('/admin')}
          className="mr-4 text-gray-600"
        >
          ← 戻る
        </button>
        <h1 className="text-lg font-bold">🚨 通報管理</h1>
      </header>

      {/* フィルター */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg text-sm font-semibold whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            全て
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1 rounded-lg text-sm font-semibold whitespace-nowrap ${
              statusFilter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            未処理
          </button>
          <button
            onClick={() => setStatusFilter('reviewed')}
            className={`px-3 py-1 rounded-lg text-sm font-semibold whitespace-nowrap ${
              statusFilter === 'reviewed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            確認済み
          </button>
          <button
            onClick={() => setStatusFilter('resolved')}
            className={`px-3 py-1 rounded-lg text-sm font-semibold whitespace-nowrap ${
              statusFilter === 'resolved'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            解決済み
          </button>
        </div>
      </div>

      {/* 件数 */}
      <div className="px-4 py-2 text-sm text-gray-600">
        全{total}件の通報
      </div>

      {/* コンテンツ */}
      <div className="p-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            通報が見つかりません
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                onClick={() => navigate(`/admin/reports/${report.id}`)}
                className="bg-white rounded-lg shadow-sm border p-4 cursor-pointer"
              >
                <div className="flex justify-between items-start mb-2">
                  {getStatusBadge(report.status)}
                  <span className="text-xs text-gray-400">
                    {new Date(report.createdAt).toLocaleDateString('ja-JP')}
                  </span>
                </div>
                <div className="font-semibold text-gray-800 mb-1">
                  {getReasonLabel(report.reason)}
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {report.reportType === 'photo' && '写真'}
                  {report.reportType === 'pole' && '電柱'}
                  {report.reportType === 'number' && '電柱番号'}
                  {' (ID: ' + report.targetId + ')'}
                </div>
                <div className="text-xs text-gray-500">
                  通報者: {report.reportedByUser?.displayName || report.reportedByName}
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
