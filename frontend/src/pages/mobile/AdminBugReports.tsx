/**
 * 管理者用バグ報告一覧ページ（モバイル版）
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bug, ChevronRight } from 'lucide-react';
import { apiClient } from '../../api/client';

interface BugReport {
  id: number;
  title: string;
  category: string;
  description: string;
  status: string;
  createdAt: string;
  contactEmail?: string;
}

const categoryLabels: Record<string, string> = {
  map: '地図表示',
  registration: '電柱登録',
  photo: '写真関連',
  search: '検索機能',
  ui: 'UI/表示',
  performance: 'パフォーマンス',
  other: 'その他',
};

const statusLabels: Record<string, string> = {
  open: '未対応',
  in_progress: '対応中',
  resolved: '解決済み',
  closed: 'クローズ',
};

const statusColors: Record<string, string> = {
  open: 'bg-red-100 text-red-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
};

export default function AdminBugReportsMobile() {
  const navigate = useNavigate();
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchBugReports();
  }, [filterStatus]);

  const fetchBugReports = async () => {
    try {
      setLoading(true);
      const url = filterStatus === 'all' ? '/bug-reports' : `/bug-reports?status=${filterStatus}`;
      const response = await apiClient.get(url);
      setBugReports(response.data.data);
    } catch (error) {
      console.error('バグ報告の取得に失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← 戻る
          </button>
          <Bug className="w-6 h-6 text-red-600" />
          <h1 className="text-xl font-bold">バグ報告管理</h1>
        </div>
      </header>

      {/* フィルター */}
      <div className="bg-white border-b p-4">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">すべて</option>
          <option value="open">未対応</option>
          <option value="in_progress">対応中</option>
          <option value="resolved">解決済み</option>
          <option value="closed">クローズ</option>
        </select>
      </div>

      {/* コンテンツ */}
      <main className="p-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">読み込み中...</p>
          </div>
        ) : bugReports.length === 0 ? (
          <div className="text-center py-12">
            <Bug className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">バグ報告はありません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bugReports.map((report) => (
              <div
                key={report.id}
                onClick={() => navigate(`/admin/bug-reports/${report.id}`)}
                className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[report.status]}`}>
                        {statusLabels[report.status]}
                      </span>
                      <span className="text-xs text-gray-500">
                        {categoryLabels[report.category]}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-800 line-clamp-2">{report.title}</h3>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-2">{report.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{formatDate(report.createdAt)}</span>
                  {report.contactEmail && (
                    <span className="truncate ml-2">📧 {report.contactEmail}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
