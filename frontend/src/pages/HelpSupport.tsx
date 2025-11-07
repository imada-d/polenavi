// 何を: ヘルプ・サポートページ（モバイル・PC両対応）
// なぜ: FAQ、お問い合わせ、規約、バージョン情報を提供するため

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/pc/Header';

export default function HelpSupport() {
  const navigate = useNavigate();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: '電柱の登録方法は？',
      answer: 'ホーム画面の地図上で登録したい電柱の位置を長押しし、「電柱を登録」ボタンをタップします。その後、電柱番号や事業者名などの情報を入力してください。'
    },
    {
      question: '電柱番号の検索方法は？',
      answer: '検索タブから「番号検索」を選択し、電柱番号を入力して検索ボタンをタップします。見つかった電柱は地図上に表示されます。'
    },
    {
      question: 'メモやハッシュタグで検索するには？',
      answer: '検索タブから「メモ・タグ検索」を選択し、キーワードを入力します。ハッシュタグ（#修理完了など）やメモ本文で検索できます。'
    },
    {
      question: '登録した電柱を確認するには？',
      answer: 'マイページの「マイデータ」カードをタップすると、自分が登録した電柱、メモ、写真、ハッシュタグの一覧が見られます。'
    },
    {
      question: '写真をアップロードするには？',
      answer: '電柱詳細ページの「写真」セクションから写真をアップロードできます。または登録時に写真を追加することもできます。'
    },
    {
      question: 'アカウントを削除したい',
      answer: 'マイページ→設定→アカウント設定から削除できます。削除したデータは復元できませんのでご注意ください。'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* PC用ヘッダー */}
      <Header />

      {/* モバイル用ヘッダー */}
      <header className="md:hidden bg-white border-b px-4 py-3 flex items-center">
        <button onClick={() => navigate(-1)} className="mr-4 text-gray-600 hover:text-gray-800">
          ← 戻る
        </button>
        <h1 className="text-lg font-bold">❓ ヘルプ・サポート</h1>
      </header>

      {/* コンテンツ */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8 space-y-6">
        <h1 className="hidden md:block text-3xl font-bold text-gray-800 mb-8">❓ ヘルプ・サポート</h1>

        {/* よくある質問 */}
        <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">よくある質問（FAQ）</h2>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                >
                  <span className="font-semibold text-gray-800">Q. {faq.question}</span>
                  <span className="text-gray-500">{expandedFaq === index ? '−' : '+'}</span>
                </button>
                {expandedFaq === index && (
                  <div className="px-4 py-3 bg-white border-t border-gray-200">
                    <p className="text-gray-700">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* お問い合わせ */}
        <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">お問い合わせ</h2>
          <p className="text-gray-700 mb-4">
            ご質問やご不明な点がございましたら、以下のメールアドレスまでお気軽にお問い合わせください。
          </p>
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
            <span className="text-2xl">✉️</span>
            <div>
              <p className="text-sm text-gray-600">お問い合わせ先</p>
              <a
                href="mailto:support@polenavi.com"
                className="text-blue-600 font-semibold hover:underline"
              >
                support@polenavi.com
              </a>
            </div>
          </div>
        </div>

        {/* 利用規約・プライバシーポリシー */}
        <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">利用規約・プライバシーポリシー</h2>
          <div className="space-y-3">
            <a
              href="/terms"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-800">利用規約</span>
                <span className="text-gray-400">→</span>
              </div>
            </a>
            <a
              href="/privacy"
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-800">プライバシーポリシー</span>
                <span className="text-gray-400">→</span>
              </div>
            </a>
          </div>
        </div>

        {/* バージョン情報 */}
        <div className="bg-white rounded-xl shadow-sm border p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">バージョン情報</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">現在のバージョン</span>
              <span className="font-bold text-blue-600">v1.0.0</span>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-gray-800 mb-2">更新履歴</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="p-3 bg-gray-50 rounded">
                  <p className="font-semibold">v1.0.0 (2025-01-07)</p>
                  <ul className="list-disc list-inside mt-1">
                    <li>初回リリース</li>
                    <li>電柱登録・検索機能</li>
                    <li>メモ・ハッシュタグ機能</li>
                    <li>マイデータ機能</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
