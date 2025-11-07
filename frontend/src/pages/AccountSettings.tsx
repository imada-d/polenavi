// 何を: アカウント設定ページ（モバイル・PC両対応）
// なぜ: パスワード変更、メールアドレス変更、アカウント削除機能を提供するため

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/pc/Header';
import { updateProfile, deleteUserAccount } from '../api/user';

export default function AccountSettings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // パスワード変更
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // メールアドレス変更
  const [newEmail, setNewEmail] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // アカウント削除
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'パスワードが一致しません' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'パスワードは6文字以上である必要があります' });
      return;
    }

    try {
      setPasswordLoading(true);
      setPasswordMessage(null);
      await updateProfile({ currentPassword, newPassword });
      setPasswordMessage({ type: 'success', text: 'パスワードを変更しました' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setPasswordMessage({ type: 'error', text: error.message });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleEmailChange = async () => {
    try {
      setEmailLoading(true);
      setEmailMessage(null);
      await updateProfile({ email: newEmail });
      setEmailMessage({ type: 'success', text: 'メールアドレスを変更しました。再度認証が必要です。' });
      setNewEmail('');
    } catch (error: any) {
      setEmailMessage({ type: 'error', text: error.message });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setDeleteLoading(true);
      await deleteUserAccount();
      alert('アカウントを削除しました');
      logout();
      navigate('/');
    } catch (error: any) {
      alert(error.message);
      setShowDeleteConfirm(false);
    } finally {
      setDeleteLoading(false);
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
        <h1 className="text-lg font-bold">⚙️ アカウント設定</h1>
      </header>

      {/* コンテンツ */}
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
        <div className="hidden md:flex items-center mb-8">
          <button onClick={() => navigate(-1)} className="mr-4 text-gray-600 hover:text-gray-800">
            ← 戻る
          </button>
          <h1 className="text-3xl font-bold text-gray-800">⚙️ アカウント設定</h1>
        </div>

        {/* パスワード変更 */}
        <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">パスワード変更</h2>

          {passwordMessage && (
            <div className={`mb-4 p-4 rounded-lg ${passwordMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {passwordMessage.text}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">現在のパスワード</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">新しいパスワード</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">新しいパスワード（確認）</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                minLength={6}
              />
            </div>
            <button
              onClick={handlePasswordChange}
              disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {passwordLoading ? '変更中...' : 'パスワードを変更'}
            </button>
          </div>
        </div>

        {/* メールアドレス変更 */}
        <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">メールアドレス変更</h2>
          <p className="text-sm text-gray-600 mb-4">現在のメールアドレス: {user?.email}</p>

          {emailMessage && (
            <div className={`mb-4 p-4 rounded-lg ${emailMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {emailMessage.text}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">新しいメールアドレス</label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="new@example.com"
              />
            </div>
            <button
              onClick={handleEmailChange}
              disabled={emailLoading || !newEmail}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {emailLoading ? '変更中...' : 'メールアドレスを変更'}
            </button>
          </div>
        </div>

        {/* アカウント削除 */}
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6 md:p-8">
          <h2 className="text-xl font-bold text-red-700 mb-4">アカウント削除</h2>
          <div className="mb-4 space-y-2">
            <p className="text-sm text-gray-700">
              <strong>削除されるデータ：</strong>
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside ml-2">
              <li>アカウント情報（メールアドレス、ユーザー名など）</li>
              <li>登録したメモ</li>
              <li>登録したハッシュタグ</li>
            </ul>
            <p className="text-sm text-gray-700 mt-3">
              <strong>残るデータ：</strong>
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside ml-2">
              <li>電柱データ（位置情報、電柱番号など）はサービス上に残ります</li>
            </ul>
            <p className="text-sm text-red-600 font-semibold mt-3">
              ⚠️ 削除したデータは復元できません。
            </p>
          </div>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full bg-red-100 text-red-700 py-3 rounded-lg font-semibold hover:bg-red-200 transition-colors"
            >
              アカウントを削除
            </button>
          ) : (
            <div className="space-y-3">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 font-semibold">本当に削除しますか？</p>
                <p className="text-sm text-red-600 mt-1">この操作は取り消せません</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading}
                  className="flex-1 bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {deleteLoading ? '削除中...' : '削除する'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
