// 何を: 通報詳細画面（PC版）
// なぜ: 管理者が通報内容を確認・処理できるようにする

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/pc/Header';
import { getReportDetail, reviewReport } from '../../api/admin';
import type { ReportDetail } from '../../api/admin';

export default function AdminReportDetailPC() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [resolution, setResolution] = useState('');
  const [action, setAction] = useState<'delete' | 'hide' | 'no_action'>('no_action');

  useEffect(() => {
    if (id) {
      loadReport(parseInt(id));
    }
  }, [id]);

  const loadReport = async (reportId: number) => {
    try {
      setLoading(true);
      const data = await getReportDetail(reportId);
      setReport(data);
    } catch (error) {
      console.error('通報情報の取得に失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!report || !resolution.trim()) {
      alert('解決コメントを入力してください');
      return;
    }

    try {
      setProcessing(true);
      await reviewReport(report.id, {
        status: 'resolved',
        resolution,
        action,
      });
      alert('通報を処理しました');
      navigate('/admin/reports');
    } catch (error) {
      console.error('処理に失敗:', error);
      alert('処理に失敗しました');
    } finally {
      setProcessing(false);
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

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-6 py-16 text-center">
          <p className="text-gray-600 text-lg">通報が見つかりません</p>
        </div>
      </div>
    );
  }

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      inappropriate: '不適切なコンテンツ',
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
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/admin/reports')}
              className="mr-6 text-gray-600 hover:text-gray-800 text-lg"
            >
              ← 戻る
            </button>
            <h1 className="text-3xl font-bold text-gray-800">🚨 通報詳細</h1>
          </div>
          {getStatusBadge(report.status)}
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* 左カラム - 通報情報 */}
          <div className="col-span-2 space-y-6">
            {/* 通報内容 */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">通報内容</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600">通報理由</label>
                  <p className="font-semibold text-lg">{getReasonLabel(report.reason)}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">対象タイプ</label>
                  <p className="font-semibold">
                    {report.reportType === 'photo' && '写真'}
                    {report.reportType === 'pole' && '電柱'}
                    {report.reportType === 'number' && '電柱番号'}
                    {' (ID: ' + report.targetId + ')'}
                  </p>
                </div>
                {report.description && (
                  <div>
                    <label className="text-sm text-gray-600">詳細説明</label>
                    <p className="mt-1 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                      {report.description}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm text-gray-600">通報日時</label>
                  <p className="font-semibold">
                    {new Date(report.createdAt).toLocaleString('ja-JP')}
                  </p>
                </div>
              </div>
            </div>

            {/* 通報対象 */}
            {report.targetData && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">通報対象</h2>
                {report.reportType === 'photo' && report.targetData.photoUrl && (
                  <div>
                    <img
                      src={report.targetData.photoUrl}
                      alt="通報対象の写真"
                      className="w-full max-w-md rounded-lg"
                    />
                    <p className="mt-2 text-sm text-gray-600">
                      投稿者: {report.targetData.uploadedByUser?.displayName || report.targetData.uploadedByName}
                    </p>
                  </div>
                )}
                {report.reportType === 'number' && (
                  <div>
                    <p className="text-lg font-semibold">{report.targetData.poleNumber}</p>
                    <p className="text-sm text-gray-600">事業者: {report.targetData.operatorName}</p>
                    {report.targetData.photoUrl && (
                      <img
                        src={report.targetData.photoUrl}
                        alt="電柱番号の写真"
                        className="mt-3 w-full max-w-md rounded-lg"
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 処理アクション */}
            {report.status === 'pending' && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">処理アクション</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600 mb-2 block">解決コメント *</label>
                    <textarea
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      placeholder="処理内容を記録してください"
                      className="w-full border rounded-lg px-4 py-3 min-h-[120px]"
                    />
                  </div>
                  {report.reportType === 'photo' && (
                    <div>
                      <label className="text-sm text-gray-600 mb-2 block">対象への対応</label>
                      <div className="space-y-2">
                        <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="action"
                            value="no_action"
                            checked={action === 'no_action'}
                            onChange={() => setAction('no_action')}
                            className="mr-3"
                          />
                          <div>
                            <div className="font-semibold">対応なし</div>
                            <div className="text-sm text-gray-600">通報を却下</div>
                          </div>
                        </label>
                        <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="action"
                            value="hide"
                            checked={action === 'hide'}
                            onChange={() => setAction('hide')}
                            className="mr-3"
                          />
                          <div>
                            <div className="font-semibold">非表示</div>
                            <div className="text-sm text-gray-600">写真を非表示にする</div>
                          </div>
                        </label>
                        <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="radio"
                            name="action"
                            value="delete"
                            checked={action === 'delete'}
                            onChange={() => setAction('delete')}
                            className="mr-3"
                          />
                          <div>
                            <div className="font-semibold text-red-600">削除</div>
                            <div className="text-sm text-gray-600">写真を削除する</div>
                          </div>
                        </label>
                      </div>
                    </div>
                  )}
                  <button
                    onClick={handleResolve}
                    disabled={processing}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                  >
                    {processing ? '処理中...' : '処理を完了する'}
                  </button>
                </div>
              </div>
            )}

            {/* 処理済み情報 */}
            {report.status !== 'pending' && (
              <div className="bg-white rounded-xl shadow-sm border p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">処理情報</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600">処理者</label>
                    <p className="font-semibold">
                      {report.reviewedByUser?.displayName || '不明'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">処理日時</label>
                    <p className="font-semibold">
                      {report.reviewedAt ? new Date(report.reviewedAt).toLocaleString('ja-JP') : '-'}
                    </p>
                  </div>
                  {report.resolution && (
                    <div>
                      <label className="text-sm text-gray-600">解決コメント</label>
                      <p className="mt-1 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                        {report.resolution}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 右カラム - 通報者情報 */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">通報者情報</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-600">名前</label>
                  <p className="font-semibold">
                    {report.reportedByUser?.displayName || report.reportedByName}
                  </p>
                </div>
                {report.reportedByUser && (
                  <>
                    <div>
                      <label className="text-sm text-gray-600">ユーザー名</label>
                      <p className="font-semibold">@{report.reportedByUser.username}</p>
                    </div>
                    <button
                      onClick={() => navigate(`/admin/users/${report.reportedBy}`)}
                      className="w-full bg-blue-50 text-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-100"
                    >
                      ユーザー詳細を見る
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
