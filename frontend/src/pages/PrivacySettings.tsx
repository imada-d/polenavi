// 何を: プライバシー設定ページ（モバイル・PC両対応）
// なぜ: 登録データの公開範囲を設定するため

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/pc/Header';
import { updatePrivacySettings } from '../api/user';

export default function PrivacySettings() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [dataVisibility, setDataVisibility] = useState<'public' | 'private'>('public');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // ユーザー情報から設定を取得
    if (user && user.dataVisibility) {
      setDataVisibility(user.dataVisibility as 'public' | 'private');
    }
  }, [isAuthenticated, user]);

  const handleSave = async () => {
    try {
      setLoading(true);
      setMessage(null);
      await updatePrivacySettings(dataVisibility);
      setMessage({ type: 'success', text: 'プライバシー設定を保存しました' });
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
        <h1 className="text-lg font-bold">🔒 プライバシー設定</h1>
      </header>

      {/* コンテンツ */}
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <h1 className="hidden md:block text-3xl font-bold text-gray-800 mb-8">🔒 プライバシー設定</h1>

        <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8">
          {/* メッセージ表示 */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">登録データの公開範囲</h3>
              <p className="text-sm text-gray-600 mb-4">
                あなたが登録した電柱、メモ、写真を他のユーザーが見られるかどうかを設定できます
              </p>

              <div className="space-y-3">
                {/* 公開オプション */}
                <label className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${dataVisibility === 'public' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="visibility"
                      value="public"
                      checked={dataVisibility === 'public'}
                      onChange={(e) => setDataVisibility(e.target.value as 'public')}
                      className="mr-3 w-5 h-5 text-blue-600"
                    />
                    <div>
                      <div className="font-semibold">公開</div>
                      <div className="text-sm text-gray-600 mt-1">
                        すべてのユーザーがあなたの登録データを閲覧できます
                      </div>
                    </div>
                  </div>
                </label>

                {/* 非公開オプション */}
                <label className={`block p-4 border-2 rounded-lg cursor-pointer transition-colors ${dataVisibility === 'private' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="visibility"
                      value="private"
                      checked={dataVisibility === 'private'}
                      onChange={(e) => setDataVisibility(e.target.value as 'private')}
                      className="mr-3 w-5 h-5 text-blue-600"
                    />
                    <div>
                      <div className="font-semibold">非公開</div>
                      <div className="text-sm text-gray-600 mt-1">
                        あなたのみが登録データを閲覧できます
                      </div>
                    </div>
                  </div>
                </label>
              </div>
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
