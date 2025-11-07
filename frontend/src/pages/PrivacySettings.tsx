// 何を: プライバシー設定ページ（モバイル・PC両対応）
// なぜ: メモとハッシュタグの公開範囲を設定するため

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/pc/Header';

export default function PrivacySettings() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [memoPrivate] = useState(false);
  const [hashtagPrivate] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
  }, [isAuthenticated, navigate]);

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
          <div className="space-y-6">
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
                  電柱の位置情報や基本情報は公共性の高い情報のため、常に公開されます。<br />
                  Premiumプランでは、メモとハッシュタグを非公開にできます（近日実装予定）。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
