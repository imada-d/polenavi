// 何を: 通報詳細画面（モバイル版）
// なぜ: 管理者が通報内容を確認・処理できるようにする

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getReportDetail, reviewReport } from '../../api/admin';
import type { ReportDetail } from '../../api/admin';
import { getFullImageUrl } from '../../utils/imageUrl';

export default function AdminReportDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [report, setReport] = useState<ReportDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [resolution, setResolution] = useState('');

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

  const handleResolve = async (action: 'keep' | 'reject') => {
    if (!report) return;

    const confirmMsg = action === 'keep'
      ? '写真を残して通報を却下しますか？'
      : '写真を削除して投稿者に警告を発行しますか？\n（警告5回で投稿禁止になります）';

    if (!confirm(confirmMsg)) return;

    const autoResolution = action === 'keep'
      ? '写真に問題なし。通報を却下しました。'
      : '不適切なコンテンツとして写真を削除し、投稿者に警告を発行しました。';

    try {
      setProcessing(true);
      const result = await reviewReport(report.id, {
        status: 'resolved',
        resolution: resolution.trim() || autoResolution,
        action: action === 'keep' ? 'no_action' : 'delete',
      });

      if (action === 'reject' && result.uploaderWarningCount) {
        alert(`処理完了しました。投稿者の警告数: ${result.uploaderWarningCount}/5`);
      } else {
        alert('処理完了しました');
      }
      navigate('/admin/reports');
    } catch (error) {
      console.error('処理に失敗:', error);
      alert('処理に失敗しました');
    } finally {
      setProcessing(false);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b px-4 py-3">
          <h1 className="text-lg font-bold">通報詳細</h1>
        </header>
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b px-4 py-3">
          <h1 className="text-lg font-bold">通報詳細</h1>
        </header>
        <div className="text-center py-16 text-gray-400">
          通報が見つかりません
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/admin/reports')}
            className="mr-4 text-gray-600"
          >
            ← 戻る
          </button>
          <h1 className="text-lg font-bold">通報詳細</h1>
        </div>
        {getStatusBadge(report.status)}
      </header>

      {/* コンテンツ */}
      <div className="p-4 space-y-4">
        {/* 通報内容 */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h2 className="font-bold mb-3">通報内容</h2>
          <div className="space-y-3 text-sm">
            <div>
              <label className="text-gray-600">通報理由</label>
              <p className="font-semibold">{getReasonLabel(report.reason)}</p>
            </div>
            <div>
              <label className="text-gray-600">対象タイプ</label>
              <p className="font-semibold">
                {report.reportType === 'photo' && '写真'}
                {report.reportType === 'pole' && '電柱'}
                {report.reportType === 'number' && '電柱番号'}
                {' (ID: ' + report.targetId + ')'}
              </p>
            </div>
            {report.description && (
              <div>
                <label className="text-gray-600">詳細説明</label>
                <p className="mt-1 p-3 bg-gray-50 rounded whitespace-pre-wrap">
                  {report.description}
                </p>
              </div>
            )}
            <div>
              <label className="text-gray-600">通報日時</label>
              <p className="font-semibold text-xs">
                {new Date(report.createdAt).toLocaleString('ja-JP')}
              </p>
            </div>
          </div>
        </div>

        {/* 通報対象 */}
        {report.targetData && (
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h2 className="font-bold mb-3">通報対象</h2>
            {report.reportType === 'photo' && report.targetData.photoUrl && (
              <div>
                {report.autoHidden && (
                  <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-xs text-yellow-800">
                      ⚠️ 自動非表示中
                    </p>
                  </div>
                )}
                <img
                  src={getFullImageUrl(report.targetData.photoUrl)}
                  alt="通報対象の写真"
                  className="w-full rounded-lg"
                />
                <p className="mt-2 text-xs text-gray-600">
                  投稿者: {report.targetData.uploadedByUser?.displayName || report.targetData.uploadedByName}
                </p>
                {report.targetData.uploadedBy && (
                  <button
                    onClick={() => navigate(`/admin/users/${report.targetData.uploadedBy}`)}
                    className="mt-2 text-blue-600 text-xs font-semibold"
                  >
                    → 投稿者の詳細を見る
                  </button>
                )}
                {report.targetData.poleId && (
                  <div className="mt-2">
                    <button
                      onClick={() => navigate(`/pole/${report.targetData.poleId}`)}
                      className="text-blue-600 text-xs font-semibold"
                    >
                      📍 この電柱の詳細を見る
                    </button>
                  </div>
                )}
              </div>
            )}
            {report.reportType === 'number' && (
              <div>
                <p className="font-semibold">{report.targetData.poleNumber}</p>
                <p className="text-xs text-gray-600">事業者: {report.targetData.operatorName}</p>
                {report.targetData.photoUrl && (
                  <img
                    src={getFullImageUrl(report.targetData.photoUrl)}
                    alt="電柱番号の写真"
                    className="mt-2 w-full rounded-lg"
                  />
                )}
                {report.targetData.pole?.id && (
                  <div className="mt-2">
                    <button
                      onClick={() => navigate(`/pole/${report.targetData.pole.id}`)}
                      className="text-blue-600 text-xs font-semibold"
                    >
                      📍 この電柱の詳細を見る
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* 通報者情報 */}
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h2 className="font-bold mb-3">通報者情報</h2>
          <div className="space-y-2 text-sm">
            <div>
              <label className="text-gray-600">名前</label>
              <p className="font-semibold">
                {report.reportedByUser?.displayName || report.reportedByName}
              </p>
            </div>
            {report.reportedByUser && (
              <div>
                <label className="text-gray-600">ユーザー名</label>
                <p className="font-semibold">@{report.reportedByUser.username}</p>
              </div>
            )}
          </div>
        </div>

        {/* 処理アクション */}
        {report.status === 'pending' && (
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h2 className="font-bold mb-3">処理アクション</h2>
            <div className="space-y-3">
              {report.reportType === 'photo' && (
                <>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                    ℹ️ <strong>OK</strong>: 写真を残す / <strong>NG</strong>: 削除 & 警告（5回で投稿禁止）
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleResolve('keep')}
                      disabled={processing}
                      className="bg-green-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50"
                    >
                      ✓ OK<br />
                      <span className="text-xs font-normal">写真を残す</span>
                    </button>
                    <button
                      onClick={() => handleResolve('reject')}
                      disabled={processing}
                      className="bg-red-600 text-white py-3 px-4 rounded-lg font-bold hover:bg-red-700 disabled:opacity-50"
                    >
                      ✗ NG<br />
                      <span className="text-xs font-normal">削除 & 警告</span>
                    </button>
                  </div>

                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">補足コメント（任意）</label>
                    <textarea
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      placeholder="必要に応じて詳細を記録"
                      className="w-full border rounded-lg px-3 py-2 text-sm min-h-[80px]"
                    />
                  </div>
                </>
              )}

              {report.reportType !== 'photo' && (
                <>
                  <div>
                    <label className="text-sm text-gray-600 mb-1 block">解決コメント *</label>
                    <textarea
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      placeholder="処理内容を記録してください"
                      className="w-full border rounded-lg px-3 py-2 text-sm min-h-[100px]"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* 処理済み情報 */}
        {report.status !== 'pending' && (
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h2 className="font-bold mb-3">処理情報</h2>
            <div className="space-y-3 text-sm">
              <div>
                <label className="text-gray-600">処理者</label>
                <p className="font-semibold">
                  {report.reviewedByUser?.displayName || '不明'}
                </p>
              </div>
              <div>
                <label className="text-gray-600">処理日時</label>
                <p className="font-semibold text-xs">
                  {report.reviewedAt ? new Date(report.reviewedAt).toLocaleString('ja-JP') : '-'}
                </p>
              </div>
              {report.resolution && (
                <div>
                  <label className="text-gray-600">解決コメント</label>
                  <p className="mt-1 p-3 bg-gray-50 rounded whitespace-pre-wrap">
                    {report.resolution}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 処理ボタン（フローティング） */}
      {report.status === 'pending' && report.reportType !== 'photo' && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <button
            onClick={() => {
              if (!resolution.trim()) {
                alert('解決コメントを入力してください');
                return;
              }
              handleResolve('keep');
            }}
            disabled={processing}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50"
          >
            {processing ? '処理中...' : '処理を完了する'}
          </button>
        </div>
      )}
    </div>
  );
}
