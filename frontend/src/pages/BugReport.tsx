/**
 * バグ報告ページ
 * ユーザーがバグや問題を報告できるフォーム
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bug, Send } from 'lucide-react';
import { apiClient } from '../api/client';

export default function BugReport() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    steps: '',
    environment: '',
    contactEmail: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categories = [
    { value: 'map', label: '地図表示の問題' },
    { value: 'registration', label: '電柱登録の問題' },
    { value: 'photo', label: '写真関連の問題' },
    { value: 'search', label: '検索機能の問題' },
    { value: 'ui', label: 'UI/表示の問題' },
    { value: 'performance', label: 'パフォーマンスの問題' },
    { value: 'other', label: 'その他' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.category || !formData.description) {
      alert('必須項目を入力してください');
      return;
    }

    setIsSubmitting(true);

    try {
      // バグ報告をバックエンドAPIに送信
      await apiClient.post('/bug-reports', formData);

      console.log('✅ バグ報告送信成功:', formData.title);
      setSubmitted(true);
    } catch (error: any) {
      console.error('❌ バグ報告の送信に失敗:', error);
      const errorMessage = error.response?.data?.error?.message || '送信に失敗しました。もう一度お試しください。';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">送信完了</h2>
          <p className="text-gray-600 mb-6">
            バグ報告をありがとうございます。<br />
            内容を確認して対応いたします。
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors"
          >
            ホームに戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ヘッダー */}
      <header className="bg-white border-b px-4 py-3 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <Bug className="w-6 h-6 text-red-600" />
          <h1 className="text-xl font-bold">バグ報告</h1>
        </div>
      </header>

      {/* フォーム */}
      <main className="max-w-2xl mx-auto p-4">
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 rounded">
          <p className="text-sm text-blue-900">
            <strong>💡 バグや問題を見つけましたか？</strong>
            <br />
            詳しく教えていただけると、より早く修正できます。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* タイトル */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="例: 地図上の電柱が表示されない"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* カテゴリ */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              カテゴリ <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">選択してください</option>
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* 問題の詳細 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              問題の詳細 <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="何が起きましたか？どのような問題がありましたか？"
              rows={5}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              required
            />
          </div>

          {/* 再現手順 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              再現手順（任意）
            </label>
            <textarea
              value={formData.steps}
              onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
              placeholder="1. 〇〇画面を開く&#10;2. △△ボタンをクリック&#10;3. エラーが発生"
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 問題を再現できる手順があると、修正が早くなります
            </p>
          </div>

          {/* 環境情報 */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              環境情報（任意）
            </label>
            <input
              type="text"
              value={formData.environment}
              onChange={(e) => setFormData({ ...formData, environment: e.target.value })}
              placeholder="例: iPhone 14, Safari / Windows PC, Chrome"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 デバイスやブラウザの情報があると役立ちます
            </p>
          </div>

          {/* 連絡先メール */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              連絡先メールアドレス（任意）
            </label>
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              placeholder="your@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              💡 進捗をお知らせする場合に使用します
            </p>
          </div>

          {/* 送信ボタン */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-lg font-bold text-lg transition-colors flex items-center justify-center gap-2 ${
              isSubmitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                送信中...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                バグ報告を送信
              </>
            )}
          </button>
        </form>

        {/* 注意事項 */}
        <div className="mt-6 bg-gray-100 rounded-lg p-4 text-sm text-gray-600">
          <p className="font-bold mb-2">📝 ご注意</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>報告内容は開発チームが確認します</li>
            <li>すべての報告に個別返信できない場合があります</li>
            <li>緊急の問題は直接お問い合わせください</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
