/**
 * 管理者用バグ報告一覧ページ（PC版）
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bug, ChevronRight } from 'lucide-react';
import Header from '../../components/pc/Header';
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

export default function AdminBugReportsPC() {
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
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* ヘッダー */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin')}
              className="text-gray-600 hover:text-gray-800"
            >
              ← 戻る
            </button>
            <Bug className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-800">バグ報告管理</h1>
          </div>
          <div className="w-64">
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
        </div>

        {/* コンテンツ */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">読み込み中...</p>
          </div>
        ) : bugReports.length === 0 ? (
          <div className="text-center py-16">
            <Bug className="w-24 h-24 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">バグ報告はありません</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    カテゴリ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    タイトル
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    詳細
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    連絡先
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    報告日時
                  </th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bugReports.map((report) => (
                  <tr
                    key={report.id}
                    onClick={() => navigate(`/admin/bug-reports/${report.id}`)}
                    className="hover:bg-gray-50 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[report.status]}`}>
                        {statusLabels[report.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {categoryLabels[report.category]}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 max-w-md truncate">
                        {report.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {report.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {report.contactEmail ? (
                        <span className="truncate block max-w-[200px]">📧 {report.contactEmail}</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDate(report.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
