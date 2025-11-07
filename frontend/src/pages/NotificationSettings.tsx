// 何を: 通知設定ページ（モバイル・PC両対応）
// なぜ: メール通知のON/OFF設定を提供するため

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/pc/Header';
import { updateNotificationSettings } from '../api/user';

export default function NotificationSettings() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // ユーザー情報から設定を取得
    if (user && user.emailNotifications !== undefined) {
      setEmailNotifications(user.emailNotifications);
    }
  }, [isAuthenticated, user]);

  const handleSave = async () => {
    try {
      setLoading(true);
      setMessage(null);
      await updateNotificationSettings(emailNotifications);
      setMessage({ type: 'success', text: '通知設定を保存しました' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* PC用ヘッダー */}
      <Header />

      {/* モバイル用ヘッダー */}
      <header className="md:hidden bg-white border-b px-4 py-3 flex items-center">
        <button onClick={() => navigate(-1)} className="mr-4 text-gray-600 hover:text-gray-800">
          ← 戻る
        </button>
        <h1 className="text-lg font-bold">🔔 通知設定</h1>
      </header>

      {/* コンテンツ */}
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="hidden md:flex items-center mb-8">
          <button onClick={() => navigate(-1)} className="mr-4 text-gray-600 hover:text-gray-800">
            ← 戻る
          </button>
          <h1 className="text-3xl font-bold text-gray-800">🔔 通知設定</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8">
          {/* メッセージ表示 */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <div className="space-y-6">
            {/* メール通知設定 */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-800">メール通知</h3>
                <p className="text-sm text-gray-600 mt-1">
                  新しいコメントやグループ招待などの通知をメールで受け取ります
                </p>
              </div>
              <label className="relative inline-block w-14 h-8">
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-full h-full bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors cursor-pointer"></div>
                <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
              </label>
            </div>

            {/* 保存ボタン */}
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '保存中...' : '設定を保存'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
