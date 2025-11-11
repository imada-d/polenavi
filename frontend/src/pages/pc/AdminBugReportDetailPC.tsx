/**
 * 管理者用バグ報告詳細ページ（PC版）
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Bug } from 'lucide-react';
import Header from '../../components/pc/Header';
import { apiClient } from '../../api/client';

interface BugReport {
  id: number;
  title: string;
  category: string;
  description: string;
  steps?: string;
  environment?: string;
  contactEmail?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
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

export default function AdminBugReportDetailPC() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [bugReport, setBugReport] = useState<BugReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchBugReport();
  }, [id]);

  const fetchBugReport = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/bug-reports/${id}`);
      setBugReport(response.data.data);
    } catch (error) {
      console.error('バグ報告の取得に失敗:', error);
      alert('バグ報告の取得に失敗しました');
      navigate('/admin/bug-reports');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus: string) => {
    if (!bugReport) return;

    try {
      setUpdating(true);
      await apiClient.patch(`/bug-reports/${id}/status`, { status: newStatus });
      setBugReport({ ...bugReport, status: newStatus });
      alert('ステータスを更新しました');
    } catch (error) {
      console.error('ステータス更新に失敗:', error);
      alert('ステータスの更新に失敗しました');
    } finally {
      setUpdating(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!bugReport) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-6 py-12 text-center">
          <p className="text-gray-600 text-lg">バグ報告が見つかりません</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* ヘッダー */}
        <div className="mb-6 flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/bug-reports')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← 戻る
          </button>
          <Bug className="w-8 h-8 text-red-600" />
          <h1 className="text-3xl font-bold text-gray-800">バグ報告詳細</h1>
        </div>

        <div className="space-y-6">
          {/* ステータス */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-gray-700 mb-3">ステータス</h2>
            <select
              value={bugReport.status}
              onChange={(e) => updateStatus(e.target.value)}
              disabled={updating}
              className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="open">未対応</option>
              <option value="in_progress">対応中</option>
              <option value="resolved">解決済み</option>
              <option value="closed">クローズ</option>
            </select>
          </div>

          {/* 基本情報 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded text-sm font-medium ${statusColors[bugReport.status]}`}>
                  {statusLabels[bugReport.status]}
                </span>
                <span className="text-sm text-gray-500">
                  {categoryLabels[bugReport.category]}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{bugReport.title}</h2>
              </div>
            </div>
          </div>

          {/* 詳細 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-700 mb-3">問題の詳細</h3>
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{bugReport.description}</p>
          </div>

          {/* 再現手順 */}
          {bugReport.steps && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-700 mb-3">再現手順</h3>
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{bugReport.steps}</p>
            </div>
          )}

          {/* 環境情報 */}
          {bugReport.environment && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-700 mb-3">環境情報</h3>
              <p className="text-gray-800">{bugReport.environment}</p>
            </div>
          )}

          {/* 連絡先 */}
          {bugReport.contactEmail && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-700 mb-3">連絡先</h3>
              <a
                href={`mailto:${bugReport.contactEmail}`}
                className="text-blue-600 hover:underline text-lg"
              >
                📧 {bugReport.contactEmail}
              </a>
            </div>
          )}

          {/* 日時情報 */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-600 text-sm">報告日時:</span>
                <p className="text-gray-800 font-medium">{formatDate(bugReport.createdAt)}</p>
              </div>
              <div>
                <span className="text-gray-600 text-sm">最終更新:</span>
                <p className="text-gray-800 font-medium">{formatDate(bugReport.updatedAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
