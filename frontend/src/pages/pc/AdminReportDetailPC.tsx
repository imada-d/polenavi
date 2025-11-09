// 何を: 通報詳細画面（PC版）
// なぜ: 管理者が通報内容を確認・処理できるようにする

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../../components/pc/Header';
import { getReportDetail, reviewReport } from '../../api/admin';
import type { ReportDetail } from '../../api/admin';
import { getFullImageUrl } from '../../utils/imageUrl';

export default function AdminReportDetailPC() {
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
                    {report.autoHidden && (
                      <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800">
                          ⚠️ この写真は自動的に非表示になっています
                        </p>
                      </div>
                    )}
                    <img
                      src={getFullImageUrl(report.targetData.photoUrl)}
                      alt="通報対象の写真"
                      className="w-full max-w-md rounded-lg"
                    />
                    <p className="mt-2 text-sm text-gray-600">
                      投稿者: {report.targetData.uploadedByUser?.displayName || report.targetData.uploadedByName}
                    </p>
                    {report.targetData.uploadedBy && (
                      <button
                        onClick={() => navigate(`/admin/users/${report.targetData.uploadedBy}`)}
                        className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-semibold"
                      >
                        → 投稿者の詳細を見る
                      </button>
                    )}
                    {report.targetData.poleId && (
                      <div className="mt-3">
                        <button
                          onClick={() => navigate(`/pole/${report.targetData.poleId}`)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                        >
                          📍 この電柱の詳細を見る
                        </button>
                      </div>
                    )}
                  </div>
                )}
                {report.reportType === 'number' && (
                  <div>
                    <p className="text-lg font-semibold">{report.targetData.poleNumber}</p>
                    <p className="text-sm text-gray-600">事業者: {report.targetData.operatorName}</p>
                    {report.targetData.photoUrl && (
                      <img
                        src={getFullImageUrl(report.targetData.photoUrl)}
                        alt="電柱番号の写真"
                        className="mt-3 w-full max-w-md rounded-lg"
                      />
                    )}
                    {report.targetData.pole?.id && (
                      <div className="mt-3">
                        <button
                          onClick={() => navigate(`/pole/${report.targetData.pole.id}`)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                        >
                          📍 この電柱の詳細を見る
                        </button>
                      </div>
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
                  {report.reportType === 'photo' && (
                    <>
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800">
                          ℹ️ 不適切なコンテンツの通報の場合：<br />
                          <strong>OK判定</strong>: 写真を残して通報を却下<br />
                          <strong>NG判定</strong>: 写真を削除して投稿者に警告（5回で投稿禁止）
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => handleResolve('keep')}
                          disabled={processing}
                          className="bg-green-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-green-700 disabled:opacity-50 transition"
                        >
                          ✓ OK<br />
                          <span className="text-sm font-normal">写真を残す</span>
                        </button>
                        <button
                          onClick={() => handleResolve('reject')}
                          disabled={processing}
                          className="bg-red-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:bg-red-700 disabled:opacity-50 transition"
                        >
                          ✗ NG<br />
                          <span className="text-sm font-normal">削除 & 警告</span>
                        </button>
                      </div>

                      <div>
                        <label className="text-sm text-gray-600 mb-2 block">補足コメント（任意）</label>
                        <textarea
                          value={resolution}
                          onChange={(e) => setResolution(e.target.value)}
                          placeholder="必要に応じて処理内容の詳細を記録できます"
                          className="w-full border rounded-lg px-4 py-3 min-h-[100px]"
                        />
                      </div>
                    </>
                  )}

                  {report.reportType !== 'photo' && (
                    <>
                      <div>
                        <label className="text-sm text-gray-600 mb-2 block">解決コメント *</label>
                        <textarea
                          value={resolution}
                          onChange={(e) => setResolution(e.target.value)}
                          placeholder="処理内容を記録してください"
                          className="w-full border rounded-lg px-4 py-3 min-h-[120px]"
                        />
                      </div>
                      <button
                        onClick={() => {
                          if (!resolution.trim()) {
                            alert('解決コメントを入力してください');
                            return;
                          }
                          handleResolve('keep');
                        }}
                        disabled={processing}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                      >
                        {processing ? '処理中...' : '処理を完了する'}
                      </button>
                    </>
                  )}
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
