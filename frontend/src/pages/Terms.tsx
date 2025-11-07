// 何を: 利用規約ページ（モバイル・PC両対応）
// なぜ: サービスの利用規約を表示するため

import { useNavigate } from 'react-router-dom';
import Header from '../components/pc/Header';

export default function Terms() {
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
        <h1 className="text-lg font-bold">📄 利用規約</h1>
      </header>

      {/* コンテンツ */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="hidden md:flex items-center mb-8">
          <button onClick={() => navigate(-1)} className="mr-4 text-gray-600 hover:text-gray-800">
            ← 戻る
          </button>
          <h1 className="text-3xl font-bold text-gray-800">📄 利用規約</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8 space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800">PoleNavi利用規約</h2>
          </div>

          {/* 1. サービスについて */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">1. サービスについて</h3>
            <p className="text-gray-700">
              PoleNaviは電柱位置情報を共有するサービスです。無料でご利用いただけます。
            </p>
          </section>

          {/* 2. 禁止事項 */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">2. 禁止事項</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>虚偽の電柱情報の登録</li>
              <li>他者の権利を侵害する行為</li>
              <li>サービスの運営を妨害する行為</li>
              <li>違法行為または公序良俗に反する行為</li>
            </ul>
          </section>

          {/* 3. 写真投稿について */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">3. 写真投稿について</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>第三者の顔が識別できる写真は投稿しないでください</li>
              <li>車のナンバープレートが読み取れる写真は避けてください</li>
              <li>個人宅が特定できる写真は投稿しないでください</li>
              <li>暴力的、わいせつな内容を含む写真は禁止です</li>
              <li>著作権を侵害する写真は投稿できません</li>
              <li>電柱と関係のない写真は投稿しないでください</li>
            </ul>
          </section>

          {/* 4. 投稿内容について */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">4. 投稿内容について</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>投稿された電柱情報は他のユーザーと共有されます</li>
              <li>投稿内容の著作権は投稿者に帰属します</li>
              <li>運営は投稿内容を無償で利用できるものとします</li>
              <li>不適切な投稿は予告なく削除する場合があります</li>
            </ul>
          </section>

          {/* 5. 免責事項 */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">5. 免責事項</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>情報の正確性は保証しません</li>
              <li>ユーザー間のトラブルに運営は関与しません</li>
              <li>サービスは予告なく変更・終了する場合があります</li>
            </ul>
          </section>

          {/* 6. アカウント */}
          <section>
            <h3 className="text-xl font-bold text-gray-800 mb-3">6. アカウント</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>1人1アカウントでご利用ください</li>
              <li>パスワードは自己責任で管理してください</li>
            </ul>
          </section>

          {/* 制定日 */}
          <div className="pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">制定日：2025年1月10日</p>
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
