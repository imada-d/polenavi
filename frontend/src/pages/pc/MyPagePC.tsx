// 何を: PC用マイページ画面
// なぜ: PC画面でユーザー情報と設定を管理するため

import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/pc/Header';
import { getUserStats } from '../../api/user';
import type { UserStats } from '../../api/user';
import { APP_VERSION, OPERATOR_NAME } from '../../config/version';

export default function MyPagePC() {
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
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto px-6 py-16">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-6">🗺️</div>
            <h2 className="text-3xl font-bold mb-4">ログインが必要です</h2>
            <p className="text-gray-600 mb-8 text-lg">
              マイページを利用するには、アカウントにログインする必要があります。
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/login')}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
              >
                ログイン
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="bg-white border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-lg"
              >
                新規登録
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ログイン済みの場合
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">👤 マイページ</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左カラム */}
          <div className="lg:col-span-2 space-y-6">
            {/* プロフィールカード */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    {user.displayName || user.username}
                  </h2>
                  <p className="text-gray-600">{user.email}</p>
                  {user.username && user.displayName && (
                    <p className="text-sm text-gray-400 mt-1">@{user.username}</p>
                  )}
                </div>
                <button
                  onClick={() => navigate('/profile/edit')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700"
                >
                  編集
                </button>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg inline-block">
                <p className="text-sm text-gray-600">登録日</p>
                <p className="font-semibold">
                  {new Date(user.createdAt).toLocaleDateString('ja-JP')}
                </p>
              </div>

              {user.emailVerified && (
                <div className="mt-4">
                  <span className="inline-block bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full">
                    ✓ メール認証済み
                  </span>
                </div>
              )}
            </div>

            {/* 統計情報 */}
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <h3 className="text-xl font-bold mb-6">📊 活動統計</h3>
              {loading ? (
                <div className="text-center py-12 text-gray-400">
                  読み込み中...
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600">{stats.registeredPoles}</div>
                    <div className="text-sm text-gray-600 mt-2">登録した電柱</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-3xl font-bold text-green-600">{stats.photos}</div>
                    <div className="text-sm text-gray-600 mt-2">撮影した写真</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600">{stats.memos}</div>
                    <div className="text-sm text-gray-600 mt-2">書いたメモ</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-3xl font-bold text-orange-600">{stats.groups}</div>
                    <div className="text-sm text-gray-600 mt-2">参加グループ</div>
                  </div>
                </div>
              )}
            </div>

            {/* マイデータカード */}
            <button
              onClick={() => navigate('/mydata')}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-md p-6 text-white hover:from-blue-600 hover:to-indigo-700 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-4xl">📊</div>
                  <div className="text-left">
                    <h3 className="font-bold text-xl">マイデータ</h3>
                    <p className="text-blue-100 mt-1">登録した電柱・メモ・写真・ハッシュタグを見る</p>
                  </div>
                </div>
                <div className="text-3xl">→</div>
              </div>
            </button>

            {/* プラン情報（準備中） */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-700 mb-2">📦 プラン</h3>
                  <p className="text-gray-600">現在は無料で全機能をご利用いただけます</p>
                </div>
                <span className="bg-gray-300 text-gray-600 px-4 py-2 rounded-full text-sm font-semibold">
                  準備中
                </span>
              </div>
            </div>
          </div>

          {/* 右カラム - 設定メニュー */}
          <div className="space-y-6">
            {/* 管理者メニュー（管理者・モデレーターのみ表示） */}
            {(user.role === 'admin' || user.role === 'moderator') && (
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl shadow-sm border border-purple-200">
                <h3 className="font-bold p-4 border-b border-purple-200 text-lg text-purple-900">🛠️ 管理者メニュー</h3>
                <div className="divide-y divide-purple-100">
                  <button
                    onClick={() => navigate('/admin')}
                    className="w-full text-left px-4 py-3 hover:bg-purple-100 flex items-center justify-between transition-colors"
                  >
                    <span className="text-purple-900">管理者ダッシュボード</span>
                    <span className="text-purple-400">→</span>
                  </button>
                  <button
                    onClick={() => navigate('/stats')}
                    className="w-full text-left px-4 py-3 hover:bg-purple-100 flex items-center justify-between transition-colors"
                  >
                    <span className="text-purple-900">統計情報</span>
                    <span className="text-purple-400">→</span>
                  </button>
                  <button
                    onClick={() => navigate('/admin/users')}
                    className="w-full text-left px-4 py-3 hover:bg-purple-100 flex items-center justify-between transition-colors"
                  >
                    <span className="text-purple-900">ユーザー管理</span>
                    <span className="text-purple-400">→</span>
                  </button>
                </div>
              </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border">
              <h3 className="font-bold p-4 border-b text-lg">⚙️ 設定</h3>
              <div className="divide-y">
                <button
                  onClick={() => navigate('/notification-settings')}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between transition-colors"
                >
                  <span>通知設定</span>
                  <span className="text-gray-400">→</span>
                </button>
                <button
                  onClick={() => navigate('/privacy-settings')}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between transition-colors"
                >
                  <span>プライバシー設定</span>
                  <span className="text-gray-400">→</span>
                </button>
                <button
                  onClick={() => navigate('/account-settings')}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between transition-colors"
                >
                  <span>アカウント設定</span>
                  <span className="text-gray-400">→</span>
                </button>
                <button
                  onClick={() => navigate('/help-support')}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center justify-between transition-colors"
                >
                  <span>ヘルプ・サポート</span>
                  <span className="text-gray-400">→</span>
                </button>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full bg-red-100 text-red-700 px-4 py-3 rounded-lg font-semibold hover:bg-red-200 transition-colors"
            >
              ログアウト
            </button>

            <div className="text-center text-sm text-gray-400 py-4 space-y-1">
              <p>PoleNavi {APP_VERSION}</p>
              <p>運営: {OPERATOR_NAME}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
