// 何を: PC用プロフィール編集画面
// なぜ: ユーザーがプロフィール情報を更新できるようにするため

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../../components/pc/Header';
import { updateProfile } from '../../api/user';

export default function ProfileEditPC() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    newPasswordConfirm: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // パスワード変更の確認
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        setError('現在のパスワードを入力してください');
        return;
      }
      if (formData.newPassword !== formData.newPasswordConfirm) {
        setError('新しいパスワードが一致しません');
        return;
      }
      if (formData.newPassword.length < 6) {
        setError('新しいパスワードは6文字以上である必要があります');
        return;
      }
    }

    try {
      setLoading(true);

      const updateData: any = {
        displayName: formData.displayName,
        username: formData.username,
        email: formData.email
      };

      // パスワード変更がある場合
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await updateProfile(updateData);

      // AuthContextのユーザー情報を更新
      if (response.user) {
        updateUser(response.user);
      }

      setSuccess('プロフィールを更新しました');

      // パスワードフィールドをクリア
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        newPasswordConfirm: ''
      }));

      // 3秒後にマイページに戻る
      setTimeout(() => {
        navigate('/mypage');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'プロフィールの更新に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/mypage')}
            className="text-blue-600 hover:text-blue-700 mb-4 flex items-center"
          >
            ← マイページに戻る
          </button>
          <h1 className="text-3xl font-bold text-gray-800">プロフィール編集</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* エラー・成功メッセージ */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg">
              {success}
            </div>
          )}

          {/* 基本情報 */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold mb-6">基本情報</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  表示名
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="表示名を入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ユーザー名
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="ユーザー名を入力"
                  required
                />
                <p className="text-sm text-gray-500 mt-2">
                  ユーザー名は他のユーザーから見える識別子です
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="メールアドレスを入力"
                  required
                />
                {user?.email !== formData.email && (
                  <p className="text-sm text-orange-600 mt-2">
                    ⚠️ メールアドレスを変更すると、再認証が必要になります
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* パスワード変更 */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h2 className="text-xl font-bold mb-6">パスワード変更</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  現在のパスワード
                </label>
                <input
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="現在のパスワードを入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  新しいパスワード
                </label>
                <input
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="新しいパスワードを入力（6文字以上）"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  新しいパスワード（確認）
                </label>
                <input
                  type="password"
                  value={formData.newPasswordConfirm}
                  onChange={(e) => setFormData({ ...formData, newPasswordConfirm: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="もう一度入力"
                />
              </div>

              <p className="text-sm text-gray-500">
                パスワードを変更しない場合は、このセクションを空欄のままにしてください
              </p>
            </div>
          </div>

          {/* 保存ボタン */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate('/mypage')}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '保存中...' : '変更を保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
