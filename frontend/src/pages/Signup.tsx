// 何を: サインアップ（新規登録）画面
// なぜ: 新しいユーザーアカウントを作成するため

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Signup() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    displayName: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signup(formData);
      navigate('/'); // 登録成功後はホームへ
    } catch (err: any) {
      setError(err.message || 'ユーザー登録に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-green-50 to-green-100">
      {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-3 shadow-sm">
        <div className="max-w-md mx-auto flex items-center">
          <button onClick={() => navigate(-1)} className="text-gray-600 mr-3">
            ← 戻る
          </button>
          <h1 className="text-lg font-bold">新規登録</h1>
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
              <p className="text-sm text-gray-600 mt-2">アカウントを作成</p>
            </div>

            {/* エラーメッセージ */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* サインアップフォーム */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  メールアドレス *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                  ユーザー名 *
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="username123"
                />
                <p className="text-xs text-gray-500 mt-1">ログインに使用します（英数字のみ）</p>
              </div>

              <div>
                <label htmlFor="displayName" className="block text-sm font-semibold text-gray-700 mb-2">
                  表示名（オプション）
                </label>
                <input
                  type="text"
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="山田 太郎"
                />
                <p className="text-xs text-gray-500 mt-1">省略するとユーザー名が表示されます</p>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  パスワード *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="6文字以上"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? '登録中...' : 'アカウント作成'}
              </button>
            </form>

            {/* ログインリンク */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                既にアカウントをお持ちですか？{' '}
                <Link to="/login" className="text-green-600 font-semibold hover:text-green-700">
                  ログイン
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
