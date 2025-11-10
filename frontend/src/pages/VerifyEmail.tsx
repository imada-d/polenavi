// 何を: メール検証画面
// なぜ: メール内のリンクをクリックした時にトークンを検証し、結果を表示するため

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../api/emailVerification';

export default function VerifyEmail() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      if (!token) {
        setErrorMessage('検証トークンが見つかりません');
        setVerifying(false);
        return;
      }

      try {
        await verifyEmail(token);
        setSuccess(true);
        setVerifying(false);

        // 3秒後に自動的にログイン画面へ
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error: any) {
        setVerifying(false);
        setErrorMessage(
          error.response?.data?.message || 'メール検証に失敗しました'
        );
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        {verifying ? (
          // 検証中
          <div className="text-center">
            <div className="inline-block bg-blue-100 rounded-full p-4 mb-4">
              <svg
                className="w-16 h-16 text-blue-600 animate-spin"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              メールアドレスを検証中...
            </h1>
            <p className="text-gray-600">しばらくお待ちください</p>
          </div>
        ) : success ? (
          // 検証成功
          <div className="text-center">
            <div className="inline-block bg-green-100 rounded-full p-4 mb-4">
              <svg
                className="w-16 h-16 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-green-800 mb-2">
              ✅ メール検証が完了しました！
            </h1>
            <p className="text-gray-600 mb-6">
              アカウントの登録が完了しました。
              <br />
              3秒後にログイン画面に移動します...
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              ログイン画面へ →
            </button>
          </div>
        ) : (
          // 検証失敗
          <div className="text-center">
            <div className="inline-block bg-red-100 rounded-full p-4 mb-4">
              <svg
                className="w-16 h-16 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-red-800 mb-2">
              ❌ メール検証に失敗しました
            </h1>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-gray-700 mb-6">
              <p className="mb-2">考えられる原因:</p>
              <ul className="list-disc list-inside text-left space-y-1">
                <li>リンクの有効期限が切れています（24時間）</li>
                <li>すでに使用済みのリンクです</li>
                <li>無効なリンクです</li>
              </ul>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              ログイン画面に戻る
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
