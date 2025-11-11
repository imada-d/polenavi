/**
 * 管理者用バグ報告詳細ページ（モバイル版）
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Bug } from 'lucide-react';
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

export default function AdminBugReportDetailMobile() {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!bugReport) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">バグ報告が見つかりません</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/bug-reports')}
            className="text-gray-600 hover:text-gray-800"
          >
            ← 戻る
          </button>
          <Bug className="w-6 h-6 text-red-600" />
          <h1 className="text-xl font-bold">バグ報告詳細</h1>
        </div>
      </header>

      {/* コンテンツ */}
      <main className="p-4 space-y-4">
        {/* ステータス */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="text-sm font-bold text-gray-700 mb-2">ステータス</h2>
          <select
            value={bugReport.status}
            onChange={(e) => updateStatus(e.target.value)}
            disabled={updating}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="open">未対応</option>
            <option value="in_progress">対応中</option>
            <option value="resolved">解決済み</option>
            <option value="closed">クローズ</option>
          </select>
        </div>

        {/* 基本情報 */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="space-y-3">
            <div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[bugReport.status]}`}>
                {statusLabels[bugReport.status]}
              </span>
              <span className="ml-2 text-xs text-gray-500">
                {categoryLabels[bugReport.category]}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">{bugReport.title}</h2>
            </div>
          </div>
        </div>

        {/* 詳細 */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-bold text-gray-700 mb-2">問題の詳細</h3>
          <p className="text-gray-800 whitespace-pre-wrap">{bugReport.description}</p>
        </div>

        {/* 再現手順 */}
        {bugReport.steps && (
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-bold text-gray-700 mb-2">再現手順</h3>
            <p className="text-gray-800 whitespace-pre-wrap">{bugReport.steps}</p>
          </div>
        )}

        {/* 環境情報 */}
        {bugReport.environment && (
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-bold text-gray-700 mb-2">環境情報</h3>
            <p className="text-gray-800">{bugReport.environment}</p>
          </div>
        )}

        {/* 連絡先 */}
        {bugReport.contactEmail && (
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-sm font-bold text-gray-700 mb-2">連絡先</h3>
            <a
              href={`mailto:${bugReport.contactEmail}`}
              className="text-blue-600 hover:underline"
            >
              📧 {bugReport.contactEmail}
            </a>
          </div>
        )}

        {/* 日時情報 */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">報告日時:</span>
              <span className="text-gray-800">{formatDate(bugReport.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">最終更新:</span>
              <span className="text-gray-800">{formatDate(bugReport.updatedAt)}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
