// 何を: プライバシー設定ページ（モバイル・PC両対応）
// なぜ: メモとハッシュタグの公開範囲を設定するため

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/pc/Header';
import { updatePrivacySettings } from '../api/user';

export default function PrivacySettings() {
  const navigate = useNavigate();
  const { user, isAuthenticated, updateUser } = useAuth();
  const [memoPrivate] = useState(false);
  const [hashtagPrivate] = useState(false);
  const [showUsername, setShowUsername] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    // ユーザー情報から設定を取得
    if (user && user.showUsername !== undefined) {
      setShowUsername(user.showUsername);
    }
  }, [isAuthenticated, user, navigate]);

  const handleSave = async () => {
    try {
      setLoading(true);
      setMessage(null);
      await updatePrivacySettings(showUsername);
      // ユーザー情報を更新
      if (user) {
        updateUser({ ...user, showUsername });
      }
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
        <div className="hidden md:flex items-center mb-8">
          <button onClick={() => navigate(-1)} className="mr-4 text-gray-600 hover:text-gray-800">
            ← 戻る
          </button>
          <h1 className="text-3xl font-bold text-gray-800">🔒 プライバシー設定</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8">
          {/* メッセージ表示 */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.text}
            </div>
          )}

          <div className="space-y-6">
            {/* ユーザー名公開設定 */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">ユーザー名の公開</h3>
              <p className="text-sm text-gray-600 mb-4">
                電柱登録時にあなたのユーザー名を公開するかどうかを設定します
              </p>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-semibold text-gray-800">ユーザー名を公開する</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    OFFにすると、あなたの登録した電柱の登録者が「匿名」と表示されます<br />
                    <strong>※既に登録済みの電柱も含め、全ての電柱に適用されます</strong>
                  </p>
                </div>
                <label className="relative inline-block w-14 h-8">
                  <input
                    type="checkbox"
                    checked={showUsername}
                    onChange={(e) => setShowUsername(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-full h-full bg-gray-300 rounded-full peer-checked:bg-blue-600 transition-colors cursor-pointer"></div>
                  <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                </label>
              </div>
            </div>

            <hr className="my-6" />

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">メモ・ハッシュタグの公開範囲</h3>
              <p className="text-sm text-gray-600 mb-6">
                メモとハッシュタグの公開範囲を設定できます（電柱データは常に公開されます）
              </p>

              <div className="space-y-4">
                {/* メモ非公開オプション（Premium限定） */}
                <label className="block p-4 border-2 border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed opacity-60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={memoPrivate}
                        disabled
                        className="mr-3 w-5 h-5 text-blue-600 cursor-not-allowed"
                      />
                      <div>
                        <div className="font-semibold text-gray-700">メモを非公開にする</div>
                        <div className="text-sm text-gray-500 mt-1">
                          自分だけがメモを閲覧できます
                        </div>
                      </div>
                    </div>
                    <span className="text-xs bg-purple-600 text-white px-3 py-1 rounded-full">
                      🔒 Premium
                    </span>
                  </div>
                </label>

                {/* ハッシュタグ非公開オプション（Premium限定） */}
                <label className="block p-4 border-2 border-gray-200 rounded-lg bg-gray-50 cursor-not-allowed opacity-60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={hashtagPrivate}
                        disabled
                        className="mr-3 w-5 h-5 text-blue-600 cursor-not-allowed"
                      />
                      <div>
                        <div className="font-semibold text-gray-700">ハッシュタグを非公開にする</div>
                        <div className="text-sm text-gray-500 mt-1">
                          自分だけがハッシュタグを閲覧できます
                        </div>
                      </div>
                    </div>
                    <span className="text-xs bg-purple-600 text-white px-3 py-1 rounded-full">
                      🔒 Premium
                    </span>
                  </div>
                </label>
              </div>

              {/* 説明 */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>ℹ️ 電柱データについて：</strong><br />
                  電柱の位置情報や基本情報は常に公開されます。<br />
                  Premiumプランでは、メモとハッシュタグを非公開にできます（近日実装予定）。
                </p>
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
