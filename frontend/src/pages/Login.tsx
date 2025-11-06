// 何を: ログイン画面
// なぜ: ユーザー認証を行うため

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login({ email, password });
      navigate('/'); // ログイン成功後はホームへ
    } catch (err: any) {
      setError(err.message || 'ログインに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-blue-100">
      {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-3 shadow-sm">
        <div className="max-w-md mx-auto flex items-center">
          <button onClick={() => navigate(-1)} className="text-gray-600 mr-3">
            ← 戻る
          </button>
          <h1 className="text-lg font-bold">ログイン</h1>
        </div>
      </header>

      {/* コンテンツ */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* ロゴ */}
            <div className="text-center mb-8">
              <div className="text-4xl mb-3">🗺️</div>
              <h2 className="text-2xl font-bold text-gray-800">PoleNavi</h2>
              <p className="text-sm text-gray-600 mt-2">電柱管理プラットフォーム</p>
            </div>

            {/* エラーメッセージ */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* ログインフォーム */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  メールアドレス
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  パスワード
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="6文字以上"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'ログイン中...' : 'ログイン'}
              </button>
            </form>

            {/* サインアップリンク */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                アカウントをお持ちでないですか？{' '}
                <Link to="/signup" className="text-blue-600 font-semibold hover:text-blue-700">
                  新規登録
                </Link>
              </p>
            </div>

            {/* ゲストログイン */}
            <div className="mt-6 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                ゲストとして続ける
              </button>
            </div>
          </div>

          {/* 注意事項 */}
          <div className="mt-6 text-center text-xs text-gray-500">
            <p>このサービスを利用することで、利用規約とプライバシーポリシーに同意したものとみなされます。</p>
          </div>
        </div>
      </div>
    </div>
  );
}
