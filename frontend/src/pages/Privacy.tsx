// 何を: プライバシーポリシーページ（モバイル・PC両対応）
// なぜ: サービスのプライバシーポリシーを表示するため

import { useNavigate } from 'react-router-dom';
import Header from '../components/pc/Header';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* PC用ヘッダー */}
      <Header />

      {/* モバイル用ヘッダー */}
      <header className="md:hidden bg-white border-b px-4 py-3 flex items-center">
        <button onClick={() => navigate(-1)} className="mr-4 text-gray-600 hover:text-gray-800">
          ← 戻る
        </button>
        <h1 className="text-lg font-bold">🔒 プライバシーポリシー</h1>
      </header>

      {/* コンテンツ */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="hidden md:flex items-center mb-8">
          <button onClick={() => navigate(-1)} className="mr-4 text-gray-600 hover:text-gray-800">
            ← 戻る
          </button>
          <h1 className="text-3xl font-bold text-gray-800">🔒 プライバシーポリシー</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8 space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">PoleNaviプライバシーポリシー</h2>
          </div>

          {/* 1. 収集する情報 */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">1. 収集する情報</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>アカウント情報（メールアドレス、ユーザー名）</li>
              <li>電柱登録情報（位置情報、写真、メモ）</li>
              <li>アクセスログ（IPアドレス、利用日時）</li>
            </ul>
          </section>

          {/* 2. 情報の利用目的 */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">2. 情報の利用目的</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>サービスの提供</li>
              <li>ユーザーサポート</li>
              <li>サービスの改善</li>
            </ul>
          </section>

          {/* 3. 写真データの取り扱い */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">3. 写真データの取り扱い</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>アップロードされた写真は公開される場合があります</li>
              <li>写真に含まれる位置情報（EXIF）は自動的に削除されます</li>
              <li>第三者のプライバシーを保護するため、不適切な写真は削除します</li>
            </ul>
          </section>

          {/* 4. 情報の共有 */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">4. 情報の共有</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>電柱情報は他のユーザーと共有されます</li>
              <li>個人情報は本人の同意なく第三者に提供しません</li>
              <li>法令に基づく場合は除きます</li>
            </ul>
          </section>

          {/* 5. 情報の保護 */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">5. 情報の保護</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>適切なセキュリティ対策を実施します</li>
              <li>不正アクセスから情報を保護します</li>
            </ul>
          </section>

          {/* 6. Cookieについて */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">6. Cookieについて</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>ログイン状態の保持にCookieを使用します</li>
              <li>ブラウザ設定でCookieを無効にできます</li>
            </ul>
          </section>

          {/* 7. 情報の削除 */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">7. 情報の削除</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>アカウント削除時に個人情報を削除します</li>
              <li>投稿した電柱情報は残る場合があります</li>
            </ul>
          </section>

          {/* 8. お問い合わせ */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">8. お問い合わせ</h3>
            <p className="text-gray-700">
              <a href="mailto:support@polenavi.com" className="text-blue-600 hover:underline">
                support@polenavi.com
              </a>
            </p>
          </section>

          {/* 制定日 */}
          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">制定日：2025年11月7日</p>
          </div>

          {/* 運営情報 */}
          <div className="text-center">
            <p className="text-sm text-gray-500">運営：imada-lab</p>
          </div>
        </div>
      </div>
    </div>
  );
}
