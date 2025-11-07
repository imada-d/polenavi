// 何を: モバイル用マイページ画面
// なぜ: ユーザーのプロフィール、統計、設定を一元管理するため

import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import BottomNav from '../../components/mobile/BottomNav';
import { getUserStats } from '../../api/user';
import type { UserStats } from '../../api/user';

export default function MyPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    registeredPoles: 0,
    photos: 0,
    memos: 0,
    groups: 0
  });
  const [loading, setLoading] = useState(true);

  // 統計データを取得
  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
    }
  }, [isAuthenticated]);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getUserStats();
      setStats(data);
    } catch (error) {
      console.error('統計データの取得に失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // ログインしていない場合
  if (!isAuthenticated || !user) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        {/* ヘッダー */}
        <header className="bg-white border-b px-4 py-3">
          <h1 className="text-lg font-bold">👤 マイページ</h1>
        </header>

        {/* コンテンツ */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="text-6xl mb-4">🗺️</div>
              <h2 className="text-2xl font-bold mb-4">ログインが必要です</h2>
              <p className="text-gray-600 mb-8">
                マイページを利用するには、アカウントにログインする必要があります。
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  ログイン
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="w-full bg-white border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
                >
                  新規登録
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ボトムナビ */}
        <BottomNav />
      </div>
    );
  }

  // ログイン済みの場合
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-3">
        <h1 className="text-lg font-bold">👤 マイページ</h1>
      </header>

      {/* コンテンツ */}
      <div className="flex-1 overflow-y-auto p-4 pb-20">
        <div className="space-y-4">
          {/* プロフィールカード */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">{user.displayName || user.username}</h2>
                <p className="text-sm text-gray-500">{user.email}</p>
                {user.username && user.displayName && (
                  <p className="text-xs text-gray-400 mt-1">@{user.username}</p>
                )}
              </div>
              <button
                onClick={() => navigate('/profile/edit')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700"
              >
                編集
              </button>
            </div>
            <div className="text-sm text-gray-500">
              登録日: {new Date(user.createdAt).toLocaleDateString('ja-JP')}
            </div>
            {user.emailVerified && (
              <div className="mt-2">
                <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                  ✓ メール認証済み
                </span>
              </div>
            )}
          </div>

          {/* 統計情報 */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="font-bold mb-3">📊 活動統計</h3>
            {loading ? (
              <div className="text-center py-8 text-gray-400">
                読み込み中...
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.registeredPoles}</div>
                  <div className="text-sm text-gray-600 mt-1">登録した電柱</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.photos}</div>
                  <div className="text-sm text-gray-600 mt-1">撮影した写真</div>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{stats.memos}</div>
                  <div className="text-sm text-gray-600 mt-1">書いたメモ</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{stats.groups}</div>
                  <div className="text-sm text-gray-600 mt-1">参加グループ</div>
                </div>
              </div>
            )}
          </div>

          {/* プラン情報 */}
          {user.planType && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-sm border border-purple-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-purple-900">プラン</h3>
                  <p className="text-sm text-purple-700 mt-1 capitalize">{user.planType}</p>
                </div>
                {user.planType === 'free' && (
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-purple-700">
                    アップグレード
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 設定メニュー */}
          <div className="bg-white rounded-lg shadow-sm border">
            <h3 className="font-bold p-4 border-b">⚙️ 設定</h3>
            <div className="divide-y">
              <button className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between">
                <span>プロフィール編集</span>
                <span className="text-gray-400">→</span>
              </button>
              <button className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between">
                <span>通知設定</span>
                <span className="text-gray-400">→</span>
              </button>
              <button className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between">
                <span>プライバシー設定</span>
                <span className="text-gray-400">→</span>
              </button>
              <button className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between">
                <span>アカウント設定</span>
                <span className="text-gray-400">→</span>
              </button>
              <button className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between">
                <span>ヘルプ・サポート</span>
                <span className="text-gray-400">→</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between text-red-600"
              >
                <span>ログアウト</span>
                <span className="text-red-400">→</span>
              </button>
            </div>
          </div>

          {/* バージョン情報 */}
          <div className="text-center text-sm text-gray-400 py-4">
            PoleNavi v1.0.0
          </div>
        </div>
      </div>

      {/* ボトムナビ */}
      <BottomNav />
    </div>
  );
}
