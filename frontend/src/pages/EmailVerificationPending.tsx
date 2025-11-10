// 何を: メール検証待ち画面
// なぜ: サインアップ後、メール検証を促すため

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { resendVerificationEmail } from '../api/emailVerification';

export default function EmailVerificationPending() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || ''; // Signupページから渡されたメールアドレス

  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  // 検証メールを再送信
  const handleResend = async () => {
    if (!email) {
      setResendMessage('メールアドレスが不明です');
      return;
    }

    setIsResending(true);
    setResendMessage('');

    try {
      await resendVerificationEmail(email);
      setResendMessage('✅ 確認メールを再送信しました');
    } catch (error: any) {
      setResendMessage('❌ ' + (error.response?.data?.message || '再送信に失敗しました'));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {/* アイコン */}
        <div className="text-center mb-6">
          <div className="inline-block bg-blue-100 rounded-full p-4 mb-4">
            <svg className="w-16 h-16 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            📧 確認メールを送信しました
          </h1>
        </div>

        {/* メッセージ */}
        <div className="text-center mb-6">
          <p className="text-gray-600 mb-4">
            {email && (
              <span className="block font-semibold text-gray-800 mb-2">
                {email}
              </span>
            )}
            メール内のリンクをクリックして、登録を完了してください。
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700">
            <p className="mb-2">⏰ リンクの有効期限: 24時間</p>
            <p>📬 迷惑メールフォルダも確認してください</p>
          </div>
        </div>

        {/* 再送信ボタン */}
        {email && (
          <div className="mb-6">
            <button
              onClick={handleResend}
              disabled={isResending}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? '送信中...' : '📮 確認メールを再送信'}
            </button>
            {resendMessage && (
              <p className={`mt-2 text-sm text-center ${resendMessage.startsWith('✅') ? 'text-green-600' : 'text-red-600'}`}>
                {resendMessage}
              </p>
            )}
          </div>
        )}

        {/* ログイン画面へ */}
        <div className="text-center">
          <button
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            ← ログイン画面に戻る
          </button>
        </div>

        {/* ヘルプテキスト */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>メールが届かない場合は、上の「再送信」ボタンをクリックしてください。</p>
        </div>
      </div>
    </div>
  );
}
